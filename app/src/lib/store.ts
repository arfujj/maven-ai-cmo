import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Analysis, ProspectList } from "./types";

/**
 * Analyses live in Supabase when it is configured, otherwise in local JSON files
 * under .data/ so the app runs on a laptop with no database at all.
 */
export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

let admin: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!admin) {
    admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

const DIR = path.join(process.cwd(), ".data", "analyses");
const safeId = (id: string) => /^[a-z0-9-]{8,64}$/.test(id);

export async function saveAnalysis(a: Analysis): Promise<void> {
  a.updatedAt = new Date().toISOString();
  if (supabaseConfigured) {
    const { error } = await db()
      .from("analyses")
      .upsert({ id: a.id, user_id: a.userId, status: a.status, payload: a, updated_at: a.updatedAt });
    if (error) throw new Error(`Supabase save failed: ${error.message}`);
    return;
  }
  await fs.mkdir(DIR, { recursive: true });
  const file = path.join(DIR, `${a.id}.json`);
  await fs.writeFile(file + ".tmp", JSON.stringify(a));
  await fs.rename(file + ".tmp", file);
}

export async function getAnalysis(id: string): Promise<Analysis | null> {
  if (!safeId(id)) return null;
  if (supabaseConfigured) {
    const { data, error } = await db().from("analyses").select("payload").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    const a = (data?.payload as Analysis) ?? null;
    return a && !(a as unknown as { kind?: string }).kind ? a : null;
  }
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, `${id}.json`), "utf8")) as Analysis;
  } catch {
    return null;
  }
}

// Writes to one analysis are serialized per process, so a tool run and a progress tick can't
// overwrite each other. (Across several servers, move these fields to their own table.)
const locks = new Map<string, Promise<unknown>>();
export async function updateAnalysis(id: string, mutate: (a: Analysis) => void | Promise<void>): Promise<Analysis | null> {
  const prev = locks.get(id) ?? Promise.resolve();
  const next = prev.then(async () => {
    const a = await getAnalysis(id);
    if (!a) return null;
    await mutate(a);
    await saveAnalysis(a);
    return a;
  });
  locks.set(id, next.catch(() => undefined));
  return next;
}

/** Find an analysis by its public share token (null if sharing is off). */
export async function getByShareToken(token: string): Promise<Analysis | null> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  if (supabaseConfigured) {
    const { data, error } = await db().from("analyses").select("payload").eq("payload->>shareToken", token).maybeSingle();
    if (error) throw new Error(error.message);
    return (data?.payload as Analysis) ?? null;
  }
  try {
    for (const f of await fs.readdir(DIR)) {
      if (!f.endsWith(".json")) continue;
      const a = JSON.parse(await fs.readFile(path.join(DIR, f), "utf8")) as Analysis;
      if (a.shareToken === token) return a;
    }
  } catch {
    /* no local data */
  }
  return null;
}

export interface AnalysisSummary {
  id: string;
  createdAt: string;
  status: Analysis["status"];
  businessName: string;
  location: string;
  url: string;
  score: number | null;
  biggestLeak: string | null;
  fixes: number;
  drafts: number;
  rating: number | null;
  reviews: number | null;
  deliverables: number;
  fixesDone: number;
}

export async function listAnalyses(userId: string | null): Promise<AnalysisSummary[]> {
  let all: Analysis[] = [];
  if (supabaseConfigured) {
    let q = db().from("analyses").select("payload").is("payload->>kind", null).order("created_at", { ascending: false }).limit(200);
    if (userId) q = q.eq("user_id", userId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    all = (data ?? []).map((r) => r.payload as Analysis);
  } else {
    try {
      const files = await fs.readdir(DIR);
      all = await Promise.all(
        files.filter((f) => f.endsWith(".json")).map(async (f) => JSON.parse(await fs.readFile(path.join(DIR, f), "utf8"))),
      );
    } catch {
      all = [];
    }
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return all.filter((a) => !(a as unknown as { kind?: string }).kind).map((a) => ({
    id: a.id,
    createdAt: a.createdAt,
    status: a.status,
    businessName: a.input.businessName,
    location: a.input.location,
    url: a.input.url,
    score: a.data.diagnosis?.overallScore ?? null,
    biggestLeak: a.data.diagnosis?.biggestLeak ?? null,
    fixes: a.data.diagnosis?.topFixes.length ?? 0,
    drafts: a.data.plan?.drafts.length ?? 0,
    rating: a.data.google?.rating ?? null,
    reviews: a.data.google?.reviewCount ?? null,
    deliverables: a.deliverables?.length ?? 0,
    fixesDone: a.progress?.fixes.length ?? 0,
  }));
}

/** Latest finished analysis per business, across all accounts (used by the monthly re-check). */
export async function listLatestPerBusiness(): Promise<Analysis[]> {
  let all: Analysis[] = [];
  if (supabaseConfigured) {
    const { data, error } = await db().from("analyses").select("payload").is("payload->>kind", null).eq("status", "done").order("created_at", { ascending: false }).limit(2000);
    if (error) throw new Error(error.message);
    all = (data ?? []).map((r) => r.payload as Analysis);
  } else {
    try {
      const files = await fs.readdir(DIR);
      all = (await Promise.all(files.filter((f) => f.endsWith(".json")).map(async (f) => JSON.parse(await fs.readFile(path.join(DIR, f), "utf8")) as Analysis)))
        .filter((a) => a.status === "done")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
      all = [];
    }
  }
  const seen = new Set<string>();
  return all.filter((a) => {
    const k = `${a.userId ?? "local"}|${a.input.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------- Prospect lists (same table, payload.kind = "prospects") ----------
const PDIR = path.join(process.cwd(), ".data", "prospects");

export async function saveProspects(list: ProspectList): Promise<void> {
  list.updatedAt = new Date().toISOString();
  if (supabaseConfigured) {
    const { error } = await db().from("analyses").upsert({ id: list.id, user_id: list.userId, status: list.status, payload: list, updated_at: list.updatedAt });
    if (error) throw new Error(`Supabase save failed: ${error.message}`);
    return;
  }
  await fs.mkdir(PDIR, { recursive: true });
  await fs.writeFile(path.join(PDIR, `${list.id}.json`), JSON.stringify(list));
}

export async function getProspects(id: string): Promise<ProspectList | null> {
  if (!safeId(id)) return null;
  if (supabaseConfigured) {
    const { data, error } = await db().from("analyses").select("payload").eq("id", id).eq("payload->>kind", "prospects").maybeSingle();
    if (error) throw new Error(error.message);
    return (data?.payload as ProspectList) ?? null;
  }
  try {
    return JSON.parse(await fs.readFile(path.join(PDIR, `${id}.json`), "utf8")) as ProspectList;
  } catch {
    return null;
  }
}

export async function listProspectLists(userId: string | null): Promise<ProspectList[]> {
  if (supabaseConfigured) {
    let q = db().from("analyses").select("payload").eq("payload->>kind", "prospects").order("created_at", { ascending: false }).limit(50);
    if (userId) q = q.eq("user_id", userId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.payload as ProspectList);
  }
  try {
    const files = await fs.readdir(PDIR);
    const lists = await Promise.all(files.filter((f) => f.endsWith(".json")).map(async (f) => JSON.parse(await fs.readFile(path.join(PDIR, f), "utf8")) as ProspectList));
    return lists.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

/** Count analyses a user started since a date (plan limits). */
export async function countAnalysesSince(userId: string | null, sinceIso: string): Promise<number> {
  const items = await listAnalyses(userId);
  return items.filter((a) => a.createdAt >= sinceIso).length;
}

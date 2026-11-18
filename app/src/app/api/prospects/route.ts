import { after } from "next/server";
import { z } from "zod";
import { json } from "@/lib/api";
import { getAccount } from "@/lib/account";
import { authEnabled } from "@/lib/supabase/server";
import { listProspectLists, saveProspects } from "@/lib/store";
import { newProspectList, runProspects } from "@/lib/prospects";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  const account = await getAccount();
  if (authEnabled && !account.userId) return json({ error: "Sign in first" }, 401);
  const lists = await listProspectLists(account.userId);
  return json({ allowed: account.limits.prospects, lists: lists.map((l) => ({ id: l.id, trade: l.trade, town: l.town, status: l.status, createdAt: l.createdAt, count: l.prospects.length, top: l.prospects[0]?.name ?? null })) });
}

const Body = z.object({ trade: z.string().trim().min(2).max(60), town: z.string().trim().min(2).max(80) });

export async function POST(req: Request) {
  const account = await getAccount();
  if (authEnabled && !account.userId) return json({ error: "Sign in first" }, 401);
  if (!account.limits.prospects) return json({ error: "Find clients is part of the Agency plan. Upgrade in Settings → Plan & billing.", upgrade: true }, 402);
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "Enter a trade and a town" }, 400);
  const list = newProspectList(parsed.data.trade, parsed.data.town, account.userId);
  await saveProspects(list);
  after(() => runProspects(list.id).catch((e) => console.error("[maven] prospects failed", e)));
  return json({ id: list.id }, 201);
}

import { NextResponse } from "next/server";
import { ownedAnalysis, json } from "@/lib/api";
import { updateAnalysis } from "@/lib/store";
import { emptyProgress } from "@/lib/types";

export const runtime = "nodejs";

/** Tick a fix, approve a draft, decide a decision, or save a draft edit. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = await ownedAnalysis(id);
  if (r instanceof NextResponse) return r;
  const b = await req.json().catch(() => ({}));
  const kind = b.kind as "fixes" | "drafts" | "decisions" | "edits";
  const key = String(b.key ?? "").slice(0, 40);
  if (!["fixes", "drafts", "decisions", "edits"].includes(kind) || !key) return json({ error: "Bad request" }, 400);
  const a = await updateAnalysis(id, (x) => {
    const p = (x.progress = { ...emptyProgress(), ...(x.progress ?? {}) });
    if (kind === "edits") {
      if (typeof b.value === "string") p.edits[key] = b.value.slice(0, 8000);
      else delete p.edits[key];
    } else {
      const set = new Set(p[kind]);
      if (b.value) set.add(key);
      else set.delete(key);
      p[kind] = [...set];
    }
  });
  return json({ progress: a?.progress ?? emptyProgress() });
}

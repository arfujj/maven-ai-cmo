import { NextResponse } from "next/server";
import { ownedAnalysis, json } from "@/lib/api";
import { updateAnalysis } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; did: string }> }) {
  const { id, did } = await ctx.params;
  const r = await ownedAnalysis(id);
  if (r instanceof NextResponse) return r;
  await updateAnalysis(id, (a) => {
    a.deliverables = (a.deliverables ?? []).filter((d) => d.id !== did);
  });
  return json({ ok: true });
}

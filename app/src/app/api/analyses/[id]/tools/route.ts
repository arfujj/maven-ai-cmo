import { NextResponse } from "next/server";
import { ownedAnalysis, json } from "@/lib/api";
import { runTool } from "@/lib/toolRunner";
import { updateAnalysis } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = await ownedAnalysis(id, "tools");
  if (r instanceof NextResponse) return r;
  if (r.a.status !== "done") return json({ error: "Tools unlock when the analysis finishes" }, 409);
  const body = await req.json().catch(() => ({}));
  try {
    const d = await runTool(r.a, String(body.toolId ?? ""), (body.inputs ?? {}) as Record<string, unknown>);
    await updateAnalysis(id, (a) => {
      a.deliverables = [d, ...(a.deliverables ?? [])].slice(0, 100);
      a.costUsd = Math.round((a.costUsd + d.costUsd) * 1e6) / 1e6;
    });
    return json({ deliverable: d }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "The tool failed";
    return json({ error: msg }, /required|valid option|Unknown tool/.test(msg) ? 400 : 502);
  }
}

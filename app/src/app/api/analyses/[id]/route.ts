import { NextResponse } from "next/server";
import { listAnalyses } from "@/lib/store";
import { ownedAnalysis, json } from "@/lib/api";

export const runtime = "nodejs";

const host = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const r = await ownedAnalysis((await ctx.params).id);
  if (r instanceof NextResponse) return r;
  const { a, account } = r;
  // Raw page text stays on the server; the UI only needs the facts.
  const site = a.data.site ? { ...a.data.site, pages: a.data.site.pages.map((p) => ({ ...p, text: "" })) } : undefined;
  // Earlier checks of the same business, for the score history.
  const history = (await listAnalyses(account.userId).catch(() => []))
    .filter((x) => x.status === "done" && x.score != null && host(x.url) === host(a.input.url))
    .map((x) => ({ id: x.id, createdAt: x.createdAt, score: x.score as number }))
    .reverse();
  const locked = !account.limits.fullReport;
  return json({
    ...a,
    data: { ...a.data, site, plan: locked ? undefined : a.data.plan },
    history,
    access: { fullReport: account.limits.fullReport, tools: account.limits.tools, share: account.limits.share, chat: account.limits.chat, planLocked: locked && !!a.data.plan },
  });
}

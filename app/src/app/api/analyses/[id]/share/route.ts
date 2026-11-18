import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAnalysis, updateAnalysis } from "@/lib/store";
import { currentUserId, authEnabled } from "@/lib/supabase/server";
import { getAccount } from "@/lib/account";

export const runtime = "nodejs";

/** Turn the public read-only link on or off. Only the owner can do this. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const a = await getAnalysis(id);
  const userId = await currentUserId();
  if (!a || (authEnabled && a.userId !== userId)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await getAccount()).limits.share) return NextResponse.json({ error: "Share links are part of a paid plan. Upgrade in Settings → Plan & billing.", upgrade: true }, { status: 402 });
  if (a.status !== "done") return NextResponse.json({ error: "The report can be shared once the analysis finishes" }, { status: 409 });

  const { enabled } = await req.json().catch(() => ({ enabled: true }));
  const updated = await updateAnalysis(id, (x) => {
    if (enabled) x.shareToken = x.shareToken ?? randomBytes(18).toString("base64url");
    else delete x.shareToken;
  });
  return NextResponse.json({ shareToken: updated?.shareToken ?? null });
}

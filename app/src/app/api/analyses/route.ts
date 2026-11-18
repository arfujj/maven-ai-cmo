import { NextResponse, after } from "next/server";
import { AnalysisInput } from "@/lib/types";
import { newAnalysis, runAnalysis } from "@/lib/pipeline";
import { saveAnalysis, listAnalyses } from "@/lib/store";
import { currentUserId, authEnabled } from "@/lib/supabase/server";
import { normalizeUrl } from "@/lib/collect/fetchSafe";
import { getAccount } from "@/lib/account";

export const runtime = "nodejs";
export const maxDuration = 800;

// Simple per-process limit so one person can't burn the API budget. Swap for a
// database-backed limit when this runs on more than one server.
const recent = new Map<string, number[]>();
function allowed(key: string, perHour = 6) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= perHour) return false;
  hits.push(now);
  recent.set(key, hits);
  return true;
}

export async function GET() {
  const userId = await currentUserId();
  if (authEnabled && !userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  return NextResponse.json({ analyses: await listAnalyses(userId) });
}

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (authEnabled && !userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const parsed = AnalysisInput.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Some details are missing or invalid", issues: parsed.error.issues }, { status: 400 });
  const input = parsed.data;
  try {
    input.url = normalizeUrl(input.url).toString();
  } catch {
    return NextResponse.json({ error: "That website address doesn't look right" }, { status: 400 });
  }

  const account = await getAccount({ withUsage: true });
  if (account.usage.analysesThisMonth >= account.limits.analysesPerMonth) {
    return NextResponse.json({ error: `You've used all ${account.limits.analysesPerMonth} analyses on your plan this month. Upgrade in Settings → Plan & billing for more.`, upgrade: true }, { status: 402 });
  }

  const who = userId ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allowed(who)) return NextResponse.json({ error: "You've run several analyses in the last hour. Try again a little later." }, { status: 429 });

  const analysis = newAnalysis(input, userId);
  await saveAnalysis(analysis);
  after(() => runAnalysis(analysis.id).catch((e) => console.error("[maven] analysis crashed", e)));
  return NextResponse.json({ id: analysis.id }, { status: 201 });
}

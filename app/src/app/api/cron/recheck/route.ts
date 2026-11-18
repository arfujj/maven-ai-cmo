import { after } from "next/server";
import { json } from "@/lib/api";
import { listLatestPerBusiness, saveAnalysis } from "@/lib/store";
import { newAnalysis, runAnalysis } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 800;

/** Monthly re-check: re-run every business whose latest analysis is 30+ days old. Called by Vercel Cron. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "Unauthorized" }, 401);
  const cutoff = Date.now() - 30 * 86_400_000;
  const due = (await listLatestPerBusiness()).filter((a) => new Date(a.createdAt).getTime() < cutoff).slice(0, 25);
  const created: string[] = [];
  for (const old of due) {
    const fresh = newAnalysis(old.input, old.userId);
    await saveAnalysis(fresh);
    created.push(fresh.id);
  }
  // Run one at a time so a big batch doesn't hit rate limits.
  after(async () => {
    for (const id of created) await runAnalysis(id).catch((e) => console.error("[maven] recheck failed", id, e));
  });
  return json({ queued: created.length });
}

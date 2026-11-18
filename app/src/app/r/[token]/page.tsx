import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getByShareToken } from "@/lib/store";
import type { Analysis } from "@/lib/types";
import { SharedReport } from "./SharedReport";

export const dynamic = "force-dynamic";

/** Only what a prospect should see: no budget, no booked-jobs number, no plan or drafts, no costs. */
function publicView(a: Analysis): Analysis {
  const site = a.data.site ? { ...a.data.site, pages: a.data.site.pages.map((p) => ({ ...p, text: "" })) } : undefined;
  return {
    ...a,
    userId: null,
    costUsd: 0,
    shareToken: undefined,
    input: { ...a.input, budget: "none", monthlyJobs: "", knownCompetitors: "", runsAds: false },
    data: { ...a.data, site, plan: undefined },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const a = await getByShareToken((await params).token);
  return {
    title: a ? `${a.input.businessName}: marketing check-up by Maven` : "Report not found",
    robots: { index: false, follow: false },
  };
}

export default async function SharedPage({ params }: { params: Promise<{ token: string }> }) {
  const a = await getByShareToken((await params).token);
  if (!a || a.status !== "done" || !a.data.diagnosis) notFound();
  const view = publicView(a);
  // The 90-day plan stays private; the public page only says how many steps and drafts it holds.
  return <SharedReport a={view} betCount={a.data.plan?.bets.length ?? 0} draftCount={a.data.plan?.drafts.length ?? 0} />;
}

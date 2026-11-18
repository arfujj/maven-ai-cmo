"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, ExternalLink, MapPin, Printer, RotateCw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import type { AnalysisView } from "@/lib/types";
import { Badge, Button, SiteIcon, cn, scoreTone } from "@/components/ui";
import { TABS, PUBLIC_TABS, type TabId } from "./tabs";
import { Overview } from "./Overview";
import { Competitors } from "./Competitors";
import { Website } from "./Website";
import { Plan } from "./Plan";
import { Drafts } from "./Drafts";
import { Sources } from "./Sources";
import { BusinessToolkit } from "./Toolkit";
import { ShareMenu } from "./ShareMenu";
import { ChatDrawer } from "./ChatDrawer";
import { Locked } from "./Locked";
import { ProgressProvider } from "./progress";
import { domainOf } from "./shared";

export function ReportView({ a, mode = "owner" }: { a: AnalysisView; mode?: "owner" | "public" }) {
  const router = useRouter();
  const tabs = mode === "public" ? TABS.filter(([t]) => PUBLIC_TABS.includes(t)) : TABS;
  const [tab, setTab] = useState<TabId>("overview");
  const [rerunning, setRerunning] = useState(false);
  const [rerunError, setRerunError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const owner = mode === "owner";
  const access = a.access ?? { fullReport: true, tools: true, share: true, chat: true, planLocked: false };

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1) as TabId;
      if (tabs.some(([t]) => t === h)) setTab(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [tabs]);

  const go = useCallback((t: TabId) => {
    history.replaceState(null, "", `#${t}`);
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  async function rerun() {
    setRerunning(true);
    setRerunError("");
    try {
      const r = await fetch("/api/analyses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(a.input) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Couldn't start a re-run");
      router.push(`/a/${d.id}`);
      router.refresh();
    } catch (e) {
      setRerunError(e instanceof Error ? e.message : "Couldn't start a re-run");
      setRerunning(false);
    }
  }

  const score = a.data.diagnosis?.overallScore;
  const draftCount = a.data.plan?.drafts.length ?? 0;
  const hist = a.history ?? [];
  const idx = hist.findIndex((h) => h.id === a.id);
  const prev = idx > 0 ? hist[idx - 1] : null;
  const delta = prev && score != null ? score - prev.score : null;

  return (
    <ProgressProvider id={a.id} initial={a.progress} readOnly={!owner}>
      <div>
        <div className="border-b border-line bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8">
            {owner && (
              <nav className="no-print flex items-center gap-1 text-[13px] text-muted" aria-label="Breadcrumb">
                <Link href="/dashboard" className="hover:text-fg">Businesses</Link>
                <ChevronRight className="size-3.5" />
                <span className="truncate text-fg-2">{a.input.businessName}</span>
              </nav>
            )}
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3.5">
                <SiteIcon url={a.input.url} size={48} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="display truncate text-[26px]">{a.input.businessName}</h1>
                    {score != null && <Badge tone={scoreTone(score)}>{score}/100</Badge>}
                    {delta != null && delta !== 0 && owner && (
                      <Badge tone={delta > 0 ? "good" : "bad"}>
                        {delta > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {delta > 0 ? "+" : ""}{delta} since {new Date(prev!.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{a.input.location}</span>
                    <a href={a.input.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-fg">{domainOf(a.input.url)}<ExternalLink className="size-3" /></a>
                    <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" />{new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
              {owner && (
                <div className="no-print flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="md" onClick={() => window.print()} title="Print or save as PDF" aria-label="Print or save as PDF"><Printer className="size-4" /></Button>
                  <Button variant="secondary" size="md" onClick={rerun} loading={rerunning}>{!rerunning && <RotateCw className="size-4" />}Re-run</Button>
                  {access.chat && <Button variant="secondary" size="md" onClick={() => setChatOpen(true)}><Sparkles className="size-4 text-brand" />Ask Maven</Button>}
                  <ShareMenu id={a.id} initialToken={a.shareToken} />
                </div>
              )}
            </div>
            {rerunError && <p className="no-print mt-3 text-[13px] text-bad">{rerunError}</p>}
            <nav className="no-print -mb-px mt-5 flex gap-1 overflow-x-auto" aria-label="Report sections">
              {tabs.map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => go(t)}
                  aria-current={tab === t ? "page" : undefined}
                  className={cn("relative shrink-0 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors", tab === t ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg")}
                >
                  {label}
                  {t === "drafts" && draftCount > 0 && <span className="tabular ml-1.5 rounded-full bg-bg-subtle px-1.5 py-0.5 text-[11px] text-muted">{draftCount}</span>}
                  {t === "toolkit" && (a.deliverables?.length ?? 0) > 0 && <span className="tabular ml-1.5 rounded-full bg-bg-subtle px-1.5 py-0.5 text-[11px] text-muted">{a.deliverables!.length}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8" key={tab}>
          <div className="fade-up">
            {tab === "overview" && <Overview a={a} go={owner ? go : undefined} readOnly={!owner} />}
            {tab === "competitors" && <Competitors a={a} />}
            {tab === "website" && <Website a={a} />}
            {tab === "plan" && (access.planLocked ? <Locked title="Your 90-day plan is ready" text="Maven wrote a ranked, week-by-week plan for this business, with a sign to watch and a stop rule for every step. Upgrade to see it." /> : <Plan a={a} readOnly={!owner} />)}
            {tab === "drafts" && (access.planLocked ? <Locked title="Your drafts are ready" text="A new homepage first screen, review-request texts, Google posts and more, written for this business and ready to approve." /> : <Drafts a={a} />)}
            {tab === "toolkit" && <BusinessToolkit a={a} />}
            {tab === "sources" && <Sources a={a} />}
          </div>
        </div>
        {owner && access.chat && <ChatDrawer id={a.id} business={a.input.businessName} open={chatOpen} onClose={() => setChatOpen(false)} />}
      </div>
    </ProgressProvider>
  );
}

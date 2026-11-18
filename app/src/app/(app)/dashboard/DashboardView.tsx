"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, Gauge, Inbox, ListChecks, Plus, Search, Star, Wand2, X } from "lucide-react";
import type { AnalysisSummary } from "@/lib/store";
import { STAGE_NAMES, type StageKey } from "@/lib/types";
import { Badge, ButtonLink, SiteIcon, cn, scoreTone, toneVar } from "@/components/ui";

const domain = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function DashboardView({ items }: { items: AnalysisSummary[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((a) => `${a.businessName} ${a.location} ${a.url}`.toLowerCase().includes(t)) : items;
  }, [items, q]);

  const done = items.filter((a) => a.status === "done");
  const businesses = new Set(items.map((a) => domain(a.url))).size;
  const avg = done.length ? Math.round(done.reduce((s, a) => s + (a.score ?? 0), 0) / done.length) : null;
  const fixes = done.reduce((s, a) => s + a.fixes, 0);
  const drafts = done.reduce((s, a) => s + a.drafts, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px]">Businesses</h1>
          <p className="mt-1 text-sm text-muted">Every business you&apos;ve analyzed. Open one to see its fixes, plan and Toolkit.</p>
        </div>
        <ButtonLink href="/start" variant="primary"><Plus className="size-4" /> New analysis</ButtonLink>
      </div>

      {items.length === 0 ? (
        <div className="mt-8">
          <Onboarding />
        </div>
      ) : (
        <>
          <GettingStarted items={items} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Businesses", value: businesses, icon: Building2 },
              { label: "Average score", value: avg ?? "—", icon: Gauge, color: avg != null ? toneVar(scoreTone(avg)) : undefined },
              { label: "Fixes found", value: fixes, icon: ListChecks },
              { label: "Drafts ready", value: drafts, icon: Inbox },
            ].map((s) => (
              <div key={s.label} className="panel p-4">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted"><s.icon className="size-3.5" />{s.label}</div>
                <div className="tabular mt-2 text-2xl font-semibold tracking-tight" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="panel mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="text-sm font-semibold">Analyses <span className="tabular ml-1 font-normal text-muted">{items.length}</span></span>
              <label className="relative w-full max-w-[280px]">
                <span className="sr-only">Search analyses</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <input className="input h-8 pl-9 text-sm" placeholder="Search businesses" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            </div>
            <div className="hidden grid-cols-[minmax(0,2.2fr)_110px_minmax(0,1fr)_120px_100px_24px] gap-4 border-b border-line bg-surface-2 px-4 py-2 text-[12px] font-medium text-muted md:grid">
              <span>Business</span><span>Score</span><span>Biggest leak</span><span>Google</span><span>Updated</span><span />
            </div>
            <ul className="divide-y divide-line">
              {filtered.map((a) => (
                <li key={a.id}>
                  <Link href={`/a/${a.id}`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2 md:grid-cols-[minmax(0,2.2fr)_110px_minmax(0,1fr)_120px_100px_24px]">
                    <div className="flex min-w-0 items-center gap-3">
                      <SiteIcon url={a.url} size={34} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{a.businessName}</div>
                        <div className="truncate text-[13px] text-muted">{a.location} · {domain(a.url)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.status === "done" && a.score != null ? (
                        <>
                          <span className="tabular text-sm font-semibold" style={{ color: toneVar(scoreTone(a.score)) }}>{a.score}</span>
                          <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-bg-subtle md:block"><div className="h-full rounded-full" style={{ width: `${a.score}%`, background: toneVar(scoreTone(a.score)) }} /></div>
                        </>
                      ) : a.status === "failed" ? <Badge tone="bad">Failed</Badge> : <Badge tone="brand"><span className="pulse-dot size-1.5 rounded-full bg-current" />Running</Badge>}
                    </div>
                    <div className="hidden min-w-0 md:block">{a.biggestLeak ? <Badge tone="bad" dot>{STAGE_NAMES[a.biggestLeak as StageKey]}</Badge> : <span className="text-[13px] text-subtle">—</span>}</div>
                    <div className="tabular hidden text-[13px] text-fg-2 md:block">{a.rating != null ? <span className="inline-flex items-center gap-1">{a.rating.toFixed(1)}<Star className="size-3 fill-current text-warn" /><span className="text-muted">({a.reviews?.toLocaleString()})</span></span> : <span className="text-subtle">—</span>}</div>
                    <div className="hidden text-[13px] text-muted md:block">{ago(a.createdAt)}</div>
                    <ArrowRight className="hidden size-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg md:block" />
                  </Link>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted">No businesses match “{q}”.</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function Onboarding() {
  const steps = [
    ["Enter a website", "Your business or a client's. Add the town so Maven finds the right competitors."],
    ["Maven reads the business", "The site, a real phone render, the Google profile, reviews and the top rivals. About two minutes."],
    ["Act on the fixes", "A score for every stage, the three fixes that matter, a 90-day plan and drafts to approve."],
  ];
  return (
    <div className="panel overflow-hidden">
      <div className="grid gap-px bg-line md:grid-cols-3">
        {steps.map(([t, d], i) => (
          <div key={t} className="bg-surface p-6">
            <span className="tabular flex size-7 items-center justify-center rounded-lg bg-bg-subtle text-[13px] font-semibold text-muted">{i + 1}</span>
            <div className="mt-4 font-medium">{t}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
          </div>
        ))}
      </div>
      <div className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2 px-6 py-4")}>
        <span className="text-sm text-muted">Your first analysis takes about two minutes.</span>
        <ButtonLink href="/start" variant="brand"><Plus className="size-4" /> Analyze a business</ButtonLink>
      </div>
    </div>
  );
}

function GettingStarted({ items }: { items: AnalysisSummary[] }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem("maven-gs-hidden") === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  const done = items.filter((a) => a.status === "done");
  const first = done[0];
  const steps = [
    { label: "Analyze a business", done: done.length > 0, href: "/start", cta: "Analyze" },
    { label: "Tick off your first fix", done: done.some((a) => a.fixesDone > 0), href: first ? `/a/${first.id}#overview` : "/start", cta: "Open fixes" },
    { label: "Run a tool from the Toolkit", done: done.some((a) => a.deliverables > 0), href: first ? `/a/${first.id}#toolkit` : "/toolkit", cta: "Open Toolkit" },
  ];
  const complete = steps.filter((s) => s.done).length;
  if (hidden || complete === steps.length) return null;
  return (
    <div className="panel mt-8 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Getting started</div>
          <div className="mt-0.5 text-[13px] text-muted">{complete} of {steps.length} done · the fastest path from diagnosis to results</div>
        </div>
        <button type="button" onClick={() => { setHidden(true); try { localStorage.setItem("maven-gs-hidden", "1"); } catch {} }} className="flex size-7 items-center justify-center rounded-md text-subtle hover:bg-bg-subtle hover:text-fg" aria-label="Hide getting started"><X className="size-4" /></button>
      </div>
      <ol className="mt-4 grid gap-2 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.label} className={cn("flex items-center gap-3 rounded-lg border p-3", s.done ? "border-good-border bg-good-soft" : "border-line bg-surface-2")}>
            <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold", s.done ? "bg-good text-white" : "bg-surface text-muted ring-1 ring-line")}>{s.done ? <Check className="size-3.5" /> : i + 1}</span>
            <span className={cn("min-w-0 flex-1 text-sm", s.done ? "text-muted line-through" : "font-medium")}>{s.label}</span>
            {!s.done && <Link href={s.href} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-brand hover:underline">{i === 2 && <Wand2 className="size-3.5" />}{s.cta}</Link>}
          </li>
        ))}
      </ol>
    </div>
  );
}

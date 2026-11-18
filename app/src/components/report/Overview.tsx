"use client";
import { useState } from "react";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { toolForSkill } from "@/lib/tools";
import { useProgress } from "./progress";
import { AlertTriangle, ArrowRight, ChevronDown, CircleCheck, Gauge, Lightbulb, Sparkles, Star, Target, TrendingUp } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { STAGE_KEYS, STAGE_NAMES, STAGE_QUESTIONS } from "@/lib/types";
import { Badge, Meter, ScoreRing, SectionHead, STATUS_LABEL, STATUS_TONE, cn, scoreTone } from "@/components/ui";
import { Stat, fmt, rivalsSummary } from "./shared";
import type { TabId } from "./tabs";

const IMPACT_TONE = { high: "bad", medium: "warn", low: "neutral" } as const;

export function Overview({ a, go, readOnly = false }: { a: Analysis; go?: (t: TabId) => void; readOnly?: boolean }) {
  const d = a.data.diagnosis!;
  const leak = d.stages.find((s) => s.key === d.biggestLeak);
  const g = a.data.google;
  const { avgRating, avgReviews } = rivalsSummary(a);
  const speed = a.data.phone?.performance ?? null;
  const missing = a.steps.filter((s) => s.status === "skipped" || s.status === "failed");

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Marketing score" icon={Gauge} accent={<Badge tone={scoreTone(d.overallScore)}>{d.overallScore >= 70 ? "Healthy" : d.overallScore >= 45 ? "Fair" : "At risk"}</Badge>}>
          <div className="flex items-center gap-3">
            <ScoreRing score={d.overallScore} size={52} stroke={5} label="Marketing score" />
            <div>
              <div className="tabular text-2xl font-semibold tracking-tight">{d.overallScore}<span className="text-base text-subtle">/100</span></div>
              <div className="text-[13px] text-muted">Across six stages</div>
            </div>
          </div>
        </Stat>
        <Stat label="Biggest leak" icon={Target} accent={<Badge tone="bad" dot>Fix first</Badge>}>
          <div className="min-w-0">
            <div className="text-2xl font-semibold tracking-tight">{STAGE_NAMES[d.biggestLeak]}</div>
            <div className="mt-1 line-clamp-1 text-[13px] text-muted" title={leak?.headline}>{leak?.headline}</div>
          </div>
        </Stat>
        <Stat
          label="Google rating"
          icon={Star}
          value={g?.rating != null ? <span className="flex items-baseline gap-1.5">{g.rating.toFixed(1)}<Star className="size-4 fill-current text-warn" /><span className="text-sm font-normal text-muted">{fmt(g.reviewCount)} reviews</span></span> : "Not found"}
          sub={avgRating != null ? `Top rivals: ${avgRating.toFixed(1)}★ · ${fmt(avgReviews)} reviews avg` : g ? "No rivals compared" : "No Google profile matched"}
        />
        <Stat
          label="Mobile speed"
          icon={Gauge}
          accent={speed != null ? <Badge tone={speed >= 90 ? "good" : speed >= 50 ? "warn" : "bad"}>{speed >= 90 ? "Fast" : speed >= 50 ? "Slow" : "Poor"}</Badge> : undefined}
          value={speed != null ? <>{speed}<span className="text-base text-subtle">/100</span></> : "—"}
          sub={a.data.phone?.lcpSeconds != null ? `Main content shows after ${a.data.phone.lcpSeconds}s` : "Not measured"}
        />
      </div>

      {/* Summary */}
      <div className="panel grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] font-medium text-brand">
            <Sparkles className="size-4" /> Maven&apos;s read
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{d.summary}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <div className="overline">The one number to move</div>
          <div className="mt-1.5 font-medium">{d.northStar.metric}</div>
          <div className="mt-0.5 text-[13px] text-muted">{d.northStar.baseline ? `Now: ${d.northStar.baseline}` : "Baseline unknown, measured in week one"}</div>
        </div>
      </div>

      {/* Journey */}
      <section>
        <SectionHead title="Customer journey" description="Six stages between a search and a booked job, scored from evidence. Unknown means we couldn't see it from outside." />
        <div className="panel overflow-hidden">
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {STAGE_KEYS.map((k, i) => {
            const s = d.stages.find((x) => x.key === k);
            const isLeak = d.biggestLeak === k;
            return (
              <div key={k} className={cn("relative flex min-w-0 flex-col gap-2.5 p-4", isLeak ? "bg-bad-soft" : "bg-surface")}>
                {isLeak && <span className="absolute inset-x-0 top-0 h-0.5 bg-bad" aria-hidden />}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-muted"><span className="tabular text-subtle">{i + 1}</span> · {STAGE_NAMES[k]}</span>
                  {isLeak ? <Badge tone="bad">Biggest leak</Badge> : <Badge tone={STATUS_TONE[s?.status ?? "unknown"]}>{STATUS_LABEL[s?.status ?? "unknown"]}</Badge>}
                </div>
                <div className="tabular text-[28px] font-semibold leading-none tracking-tight">{s?.score ?? "?"}<span className="text-sm font-normal text-subtle">/10</span></div>
                <Meter value={s?.score ?? null} tone={s?.status === "unknown" ? "neutral" : undefined} />
                <p className="text-[13px] leading-snug text-muted">{s?.headline ?? STAGE_QUESTIONS[k]}</p>
              </div>
            );
          })}
          </div>
        </div>
      </section>

      {/* Priority fixes */}
      <PriorityFixes a={a} go={go} readOnly={readOnly} />

      {/* Insights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="panel">
          <div className="panel-head"><span className="text-sm font-semibold">What&apos;s working</span></div>
          <ul className="grid grid-cols-1 gap-3 p-4">
            {d.strengths.length ? d.strengths.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-good" />{s}</li>
            )) : <li className="text-sm text-muted">Nothing stood out yet.</li>}
          </ul>
        </div>
        <div className="panel">
          <div className="panel-head"><span className="text-sm font-semibold">Against your competitors</span></div>
          <ul className="grid grid-cols-1 gap-3 p-4">
            {d.competitorTakeaways.length ? d.competitorTakeaways.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg-2"><TrendingUp className="mt-0.5 size-4 shrink-0 text-brand" />{s}</li>
            )) : <li className="text-sm text-muted">No competitors were compared in this run.</li>}
          </ul>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="flex gap-3 rounded-xl border border-warn-border bg-warn-soft p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
          <div className="text-fg-2">
            <span className="font-medium text-fg">Some checks didn&apos;t run. </span>
            {missing.map((s) => `${s.label} (${s.note})`).join("; ")}. Stages that depend on them are marked unknown instead of guessed.
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityFixes({ a, go, readOnly }: { a: Analysis; go?: (t: TabId) => void; readOnly: boolean }) {
  const d = a.data.diagnosis!;
  const prog = useProgress();
  const done = { has: (k: string) => prog.has("fixes", k), toggle: (k: string) => prog.toggle("fixes", k) };
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section>
      <SectionHead
        title="Priority fixes"
        description="Ranked by impact on booked jobs. Start at the top."
        action={go && <button type="button" onClick={() => go("plan")} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">View 90-day plan <ArrowRight className="size-3.5" /></button>}
      />
      <div className="panel divide-y divide-line overflow-hidden">
        {d.topFixes.map((f, i) => {
          const isOpen = open === i;
          const isDone = done.has(String(i));
          return (
            <div key={i} className={cn(isDone && "bg-surface-2")}>
              <div className="flex items-start gap-3 px-4 py-3.5 sm:items-center">
                {readOnly ? (
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-xs font-semibold text-muted sm:mt-0">{i + 1}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => done.toggle(String(i))}
                    aria-pressed={isDone}
                    aria-label={isDone ? "Mark as not done" : "Mark as done"}
                    className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors sm:mt-0", isDone ? "border-good bg-good text-white" : "border-line-strong hover:border-fg")}
                  >
                    {isDone && <CircleCheck className="size-5" />}
                  </button>
                )}
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex min-w-0 flex-1 flex-col gap-1.5 text-left sm:flex-row sm:items-center sm:gap-3" aria-expanded={isOpen}>
                  <span className={cn("min-w-0 flex-1 text-[15px] font-medium", isDone && "text-muted line-through decoration-subtle")}>{f.title}</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={IMPACT_TONE[f.impact]}>{f.impact[0].toUpperCase() + f.impact.slice(1)} impact</Badge>
                    <Badge>{STAGE_NAMES[f.stage]}</Badge>
                    <span className="hidden max-w-[150px] truncate text-[13px] text-muted lg:inline" title={f.effort}>{f.effort}</span>
                  </span>
                </button>
                <ChevronDown className={cn("mt-1 size-4 shrink-0 text-subtle transition-transform sm:mt-0", isOpen && "rotate-180")} aria-hidden />
              </div>
              {isOpen && (
                <div className="fade-up grid gap-4 px-4 pb-5 pl-12 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px]">
                  <div>
                    <div className="overline">Why it matters</div>
                    <p className="mt-1.5 leading-relaxed text-fg-2">{f.why}</p>
                  </div>
                  <div>
                    <div className="overline">Evidence</div>
                    <p className="mt-1.5 border-l-2 border-brand-border pl-3 leading-relaxed text-fg-2">{f.evidence}</p>
                  </div>
                  <div className="grid content-start gap-2.5 text-[13px]">
                    <div><div className="overline">Effort</div><div className="mt-1 text-fg-2">{f.effort}</div></div>
                    <div><div className="overline">Who</div><div className="mt-1 text-fg-2">{f.who}</div></div>
                    {!readOnly && toolForSkill(f.skill) && (
                      <Link href={`/a/${a.id}/tools/${toolForSkill(f.skill)!.id}`} className="inline-flex w-fit items-center gap-1.5 rounded-md bg-fg px-2.5 py-1.5 text-[13px] font-medium text-bg hover:opacity-90"><Wand2 className="size-3.5" /> Do this</Link>
                    )}
                    {go && a.data.plan?.drafts.length ? (
                      <button type="button" onClick={() => go("drafts")} className="inline-flex items-center gap-1 font-medium text-brand hover:underline"><Lightbulb className="size-3.5" /> See drafts</button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

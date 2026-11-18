"use client";
import Link from "next/link";
import { Ban, Check, Eye, Flag, Target, Wallet, Wand2 } from "lucide-react";
import { toolForSkill } from "@/lib/tools";
import { useProgress } from "./progress";
import type { Analysis } from "@/lib/types";
import { Badge, EmptyState, SectionHead, cn } from "@/components/ui";
import { parseWeeks } from "./shared";

const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1);

export function Plan({ a, readOnly = false }: { a: Analysis; readOnly?: boolean }) {
  const p = a.data.plan;
  const prog = useProgress();
  const decided = { items: prog.progress.decisions, has: (k: string) => prog.has("decisions", k), toggle: (k: string) => prog.toggle("decisions", k) };
  if (!p) return <EmptyState icon={Target} title="No plan in this run">Re-run the analysis to generate the 90-day plan.</EmptyState>;

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="panel flex gap-4 p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"><Target className="size-4.5" /></span>
        <div>
          <div className="overline">The target</div>
          <p className="mt-1 text-[15px] font-medium leading-relaxed">{p.target}</p>
        </div>
      </div>

      {/* Roadmap */}
      <section>
        <SectionHead title="13-week roadmap" description="Each bet, when it runs. Build in the first weeks, scale what works after." />
        <div className="panel overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[260px_repeat(13,minmax(0,1fr))] border-b border-line text-[11px] text-subtle">
              <div className="px-4 py-2 text-[13px] font-medium text-muted">Bet</div>
              {WEEKS.map((w) => <div key={w} className={cn("tabular py-2 text-center", w % 4 === 1 && "text-muted")}>W{w}</div>)}
            </div>
            {p.bets.map((b, i) => {
              const [s, e] = parseWeeks(b.weeks);
              return (
                <div key={i} className="grid grid-cols-[260px_repeat(13,minmax(0,1fr))] items-center border-b border-line last:border-0">
                  <div className="flex min-w-0 items-center gap-2.5 px-4 py-3">
                    <span className="tabular flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-[11px] font-semibold text-muted">{i + 1}</span>
                    <span className="truncate text-sm font-medium" title={b.title}>{b.title}</span>
                  </div>
                  <div className="relative col-span-13 h-full" style={{ gridColumn: "2 / span 13" }}>
                    <div className="absolute inset-0 grid grid-cols-13">{WEEKS.map((w) => <div key={w} className={cn("border-l border-line/60", w % 4 === 1 && "border-line")} />)}</div>
                    <div
                      className="absolute top-1/2 flex h-7 -translate-y-1/2 items-center rounded-md border border-brand-border bg-brand-soft px-2 text-[11px] font-medium text-brand"
                      style={{ left: `calc(${((s - 1) / 13) * 100}% + 3px)`, width: `calc(${((e - s + 1) / 13) * 100}% - 6px)` }}
                      title={`Weeks ${s}-${e}`}
                    >
                      <span className="truncate">W{s}{e > s ? `–${e}` : ""}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bet detail */}
      <section>
        <SectionHead title="The bets, in order" description="Every bet has a sign to watch early and a rule for when to stop." />
        <div className="grid grid-cols-1 gap-3">
          {p.bets.map((b, i) => (
            <article key={i} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-lg bg-fg text-[13px] font-semibold text-bg">{i + 1}</span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{b.why}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge>Weeks {(() => { const [s, e] = parseWeeks(b.weeks); return s === e ? s : `${s}–${e}`; })()}</Badge>
                  <Badge tone="brand"><span className="font-mono">{b.skill}</span></Badge>
                  {!readOnly && toolForSkill(b.skill) && (
                    <Link href={`/a/${a.id}/tools/${toolForSkill(b.skill)!.id}`} className="inline-flex h-[22px] items-center gap-1 rounded-md bg-fg px-2 text-xs font-medium text-bg hover:opacity-90"><Wand2 className="size-3" /> Do this</Link>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 border-t border-line pt-4 text-sm md:grid-cols-3">
                <div><div className="flex items-center gap-1.5 text-[13px] font-medium text-muted"><Eye className="size-3.5" /> Watch for</div><p className="mt-1 leading-relaxed text-fg-2">{b.leadingIndicator}</p></div>
                <div><div className="flex items-center gap-1.5 text-[13px] font-medium text-muted"><Flag className="size-3.5" /> Keep or kill</div><p className="mt-1 leading-relaxed text-fg-2">{b.keepOrKill}</p></div>
                <div><div className="text-[13px] font-medium text-muted">Who does what</div><p className="mt-1 leading-relaxed text-fg-2">{b.who}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Phases */}
      <section>
        <SectionHead title="What ships when" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {p.weeks.map((w, i) => (
            <div key={i} className="panel p-4">
              <div className="overline">{w.range}</div>
              <div className="mt-1 text-sm font-semibold">{w.focus}</div>
              <ul className="mt-3 grid gap-1.5">{w.ships.map((s, j) => <li key={j} className="flex gap-2 text-[13px] text-fg-2"><Check className="mt-0.5 size-3.5 shrink-0 text-subtle" />{s}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="panel">
          <div className="panel-head"><span className="text-sm font-semibold">Your decisions</span><span className="text-[13px] text-muted">{decided.items.length}/{p.decisions.length}</span></div>
          <ul className="grid grid-cols-1 gap-1 p-2">
            {p.decisions.map((d, i) => (
              <li key={i}>
                <label className={cn("flex cursor-pointer gap-3 rounded-lg p-2 text-sm hover:bg-surface-2", readOnly && "cursor-default")}>
                  <input type="checkbox" className="mt-0.5 size-4 accent-[var(--brand)]" checked={decided.has(String(i))} onChange={() => !readOnly && decided.toggle(String(i))} disabled={readOnly} />
                  <span className={cn("text-fg-2", decided.has(String(i)) && "text-muted line-through")}>{d}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <div className="panel-head"><span className="flex items-center gap-2 text-sm font-semibold"><Ban className="size-4 text-muted" /> Not doing, and why</span></div>
          <ul className="grid grid-cols-1 gap-3 p-4">{p.notDoing.map((n, i) => <li key={i}><div className="text-sm font-medium">{n.title}</div><p className="mt-0.5 text-[13px] leading-relaxed text-muted">{n.why}</p></li>)}</ul>
        </section>
        <section className="panel">
          <div className="panel-head"><span className="flex items-center gap-2 text-sm font-semibold"><Wallet className="size-4 text-muted" /> Budget</span></div>
          {p.budget.length ? (
            <ul className="divide-y divide-line">
              {p.budget.map((r, i) => (
                <li key={i} className="flex gap-3 px-4 py-3 text-sm">
                  <span className="tabular w-16 shrink-0 font-semibold">{r.share}</span>
                  <span className="min-w-0"><span className="font-medium">{r.line}</span><span className="block text-[13px] text-muted">{r.note}</span></span>
                </li>
              ))}
            </ul>
          ) : <p className="p-4 text-sm text-muted">No paid budget to split. The plan uses your time and free channels first.</p>}
        </section>
      </div>
    </div>
  );
}

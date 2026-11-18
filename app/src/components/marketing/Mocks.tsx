"use client";
import { ArrowUp, Bot, Building2, Check, CircleCheck, CircleX, Globe, Link2, Lock, MapPin, MessageSquare, Phone, Plus, Settings, Smartphone, Sparkles, Star, Users, Wand2 } from "lucide-react";
import { Badge, LogoMark, Meter, ScoreRing, cn } from "@/components/ui";

// Every number on these mock-ups is a labeled sample for "Hartline Plumbing (sample)", never a customer claim.

export const ACCENTS = {
  violet: "var(--violet)",
  amber: "var(--amber)",
  emerald: "var(--emerald)",
  rose: "var(--rose)",
  sky: "var(--sky)",
} as const;
export type Accent = keyof typeof ACCENTS;

const STAGES = [
  ["Found", 8, "good"],
  ["Chosen", 7, "good"],
  ["Call", 3, "bad"],
  ["Answered", 5, "warn"],
  ["Closed", 4, "warn"],
  ["Back", null, "neutral"],
] as const;

export function BrowserFrame({ children, url = "maven.app/a/hartline-plumbing", className }: { children: React.ReactNode; url?: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-surface shadow-lg", className)}>
      <div className="flex h-10 items-center gap-3 border-b border-line bg-surface px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </div>
        <div className="mx-auto flex h-6 items-center justify-center gap-1.5 rounded-md bg-bg-subtle px-3 font-mono text-[11px] text-muted">
          <Lock className="size-3" /> {url}
        </div>
        <div className="w-10" />
      </div>
      {children}
    </div>
  );
}

function AppChrome({ active, title, children }: { active: string; title: React.ReactNode; children: React.ReactNode }) {
  const nav: [string, typeof Building2][] = [["Businesses", Building2], ["Toolkit", Wand2], ["Find clients", Users], ["Settings", Settings]];
  return (
    <div className="flex h-[520px] text-left">
      <div className="hidden w-52 shrink-0 flex-col border-r border-line bg-surface p-3 md:flex">
        <div className="flex items-center gap-2 px-1.5 py-1 text-sm font-semibold"><LogoMark size={20} /> Maven</div>
        <div className="mt-4 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-fg text-[12px] font-medium text-bg"><Plus className="size-3.5" /> New analysis</div>
        <div className="mt-4 grid gap-0.5">
          {nav.map(([n, I]) => (
            <div key={n} className={cn("flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[12.5px]", active === n ? "bg-bg-subtle text-fg" : "text-muted")}><I className="size-3.5" />{n}</div>
          ))}
        </div>
        <div className="mt-5 px-2.5 text-[10.5px] font-medium text-subtle">Recent businesses</div>
        {[["Hartline Plumbing", 64, "var(--warn)"], ["Cedar HVAC", 78, "var(--good)"], ["Northside Dental", 41, "var(--bad)"]].map(([n, s, c]) => (
          <div key={n as string} className="mt-1 flex h-7 items-center gap-2 rounded-md px-2.5 text-[12px] text-fg-2">
            <span className="size-3.5 rounded bg-bg-subtle" />
            <span className="flex-1 truncate">{n}</span>
            <span className="tabular font-medium" style={{ color: c as string }}>{s}</span>
          </div>
        ))}
        <div className="mt-auto flex items-center gap-2 px-1.5 text-[12px] text-fg-2"><span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">J</span>Jess · Hartline</div>
      </div>
      <div className="min-w-0 flex-1 overflow-hidden bg-bg">
        <div className="flex h-12 items-center justify-between gap-3 border-b border-line bg-surface px-5">
          <div className="flex min-w-0 items-center gap-2 text-[13px]">
            <span className="flex size-6 items-center justify-center rounded-md border border-line"><Globe className="size-3.5 text-muted" /></span>
            <span className="truncate font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[11px] font-medium sm:inline-flex"><Sparkles className="size-3 text-brand" />Ask Maven</span>
            <span className="rounded-lg bg-fg px-2.5 py-1 text-[11px] font-medium text-bg">Share</span>
          </div>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function OverviewPane() {
  return (
    <AppChrome active="Businesses" title={<>Hartline Plumbing <Badge tone="warn" className="ml-1">64/100</Badge></>}>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="text-[10.5px] text-muted">Marketing score</div>
            <div className="mt-1.5 flex items-center gap-2"><ScoreRing score={64} size={34} stroke={4} label="Sample score" /><span className="tabular text-lg font-semibold">64</span></div>
          </div>
          <div className="rounded-xl border border-bad-border bg-bad-soft p-3">
            <div className="text-[10.5px] text-muted">Biggest leak</div>
            <div className="mt-1.5 text-lg font-semibold">Call</div>
            <div className="truncate text-[10.5px] text-muted">No number on the first screen</div>
          </div>
          <div className="hidden rounded-xl border border-line bg-surface p-3 lg:block">
            <div className="text-[10.5px] text-muted">Google rating</div>
            <div className="mt-1.5 flex items-baseline gap-1 text-lg font-semibold">4.6<Star className="size-3 fill-current text-amber" /><span className="text-[10.5px] font-normal text-muted">212</span></div>
            <div className="truncate text-[10.5px] text-muted">Rivals avg 4.8★ · 540</div>
          </div>
          <div className="hidden rounded-xl border border-line bg-surface p-3 lg:block">
            <div className="text-[10.5px] text-muted">Mobile speed</div>
            <div className="mt-1.5 text-lg font-semibold">41<span className="text-[11px] text-subtle">/100</span></div>
            <div className="truncate text-[10.5px] text-muted">Content after 5.2s</div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-3 gap-px bg-line lg:grid-cols-6">
            {STAGES.map(([n, s, t]) => (
              <div key={n} className={cn("p-2.5", t === "bad" ? "bg-bad-soft" : "bg-surface")}>
                <div className="flex items-center justify-between text-[10.5px] text-muted">{n}{t === "bad" && <span className="font-medium text-bad">Leak</span>}</div>
                <div className="tabular mt-1 text-base font-semibold">{s ?? "?"}<span className="text-[10px] font-normal text-subtle">/10</span></div>
                <Meter value={s} tone={t} className="mt-1.5 !h-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {[
            ["Put the phone number and “Dallas” on the first screen", "High", "bad", "Call"],
            ["Text back every missed call within a minute", "High", "bad", "Answered"],
            ["Ask for a review after every job", "Medium", "warn", "Chosen"],
          ].map(([t, i, tone, st]) => (
            <div key={t} className="flex items-center gap-2.5 px-3 py-2.5">
              <span className="size-3.5 shrink-0 rounded-full border border-line-strong" />
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{t}</span>
              <Badge tone={tone as "bad"} className="!h-5 !text-[10px]">{i}</Badge>
              <Badge className="hidden !h-5 !text-[10px] sm:inline-flex">{st}</Badge>
              <span className="hidden items-center gap-1 rounded-md bg-fg px-2 py-0.5 text-[10px] font-medium text-bg sm:inline-flex"><Wand2 className="size-2.5" />Do this</span>
            </div>
          ))}
        </div>
      </div>
    </AppChrome>
  );
}

function CompetitorsPane() {
  return (
    <AppChrome active="Businesses" title="Hartline Plumbing · Competitors">
      <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted"><MapPin className="size-3" /> Google results for “plumber in Dallas, TX”</div>
          <MiniCompetitors />
        </div>
        <div className="grid content-start gap-2.5">
          {[
            ["They love", "var(--good)", "Thorough, explained everything", "“He explained everything and showed me pictures.”"],
            ["Rivals fall short", "var(--violet)", "Metro Drain · surprise fees", "“$89 just to show up and no fix.”"],
          ].map(([h, c, t, q]) => (
            <div key={h} className="rounded-xl border border-line bg-surface p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium"><span className="size-1.5 rounded-full" style={{ background: c }} />{h}</div>
              <div className="mt-1.5 text-[12px] font-medium">{t}</div>
              <div className="mt-0.5 text-[11.5px] text-muted">{q}</div>
            </div>
          ))}
        </div>
      </div>
    </AppChrome>
  );
}

function PhonePane() {
  return (
    <AppChrome active="Businesses" title="Hartline Plumbing · Website & mobile">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <PhoneMock />
        <ul className="grid flex-1 gap-0 overflow-hidden rounded-xl border border-line bg-surface text-[12.5px]">
          {[[false, "Phone number visible", "Hidden behind the menu"], [true, "One clear next step", "“Book online”"], [false, "Headline names the service and town", "“Your comfort is our mission”"], [true, "Proof without scrolling", "“4.6★ from 212 reviews”"], [false, "Nothing in the way", "Cookie popup covers half the screen"]].map(([ok, t, d]) => (
            <li key={t as string} className="flex gap-2.5 border-b border-line px-3 py-2.5 last:border-0">
              {ok ? <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-good" /> : <CircleX className="mt-0.5 size-3.5 shrink-0 text-bad" />}
              <div><div className="font-medium">{t as string}</div><div className="text-[11.5px] text-muted">{d as string}</div></div>
            </li>
          ))}
        </ul>
      </div>
    </AppChrome>
  );
}

function PlanPane() {
  return (
    <AppChrome active="Businesses" title="Hartline Plumbing · 90-day plan">
      <div className="grid gap-3">
        <div className="rounded-xl border border-line bg-surface p-3 text-[12.5px]"><span className="text-muted">Target · </span><span className="font-medium">Booked jobs from ~22 to 28–32 a month by week 13</span></div>
        <MiniRoadmap />
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[["Watch for", "Missed calls under 10% by week 3"], ["Keep or kill", "Keep the text-back if booked jobs rise; switch providers if not"]].map(([h, t]) => (
            <div key={h} className="rounded-xl border border-line bg-surface p-3"><div className="text-[11px] text-muted">{h}</div><div className="mt-1 text-[12px]">{t}</div></div>
          ))}
        </div>
      </div>
    </AppChrome>
  );
}

function ToolkitPane() {
  return (
    <AppChrome active="Toolkit" title="Toolkit · Reply to your reviews">
      <div className="grid gap-3 lg:grid-cols-[200px_1fr]">
        <div className="grid content-start gap-2">
          {[["Reply to your reviews", MessageSquare, "var(--violet)"], ["A month of Google posts", MapPin, "var(--emerald)"], ["Missed-call text-back", Phone, "var(--amber)"], ["Town page", Globe, "var(--sky)"]].map(([t, I, c], i) => {
            const Icon = I as typeof Globe;
            return (
              <div key={t as string} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px]", i === 0 ? "border-line-strong bg-surface" : "border-line")}>
                <span className="flex size-6 items-center justify-center rounded-md" style={{ background: `color-mix(in srgb, ${c} 16%, transparent)`, color: c as string }}><Icon className="size-3" /></span>{t as string}
              </div>
            );
          })}
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 text-[12.5px] leading-relaxed">
          <div className="text-[15px] font-semibold">Owner replies: Hartline Plumbing</div>
          <div className="mt-3 font-medium">1. Dana R., 2 stars</div>
          <div className="mt-1 text-[11.5px] text-muted">What they need: an apology and a call about the late arrival.</div>
          <div className="mt-2 rounded-lg border-l-2 border-brand-border bg-surface-2 px-3 py-2 text-fg-2">Dana, I&apos;m sorry we were late. You planned your morning around us and we let you down. Please call me directly so I can make it right.</div>
          <div className="mt-3 flex gap-1.5"><span className="rounded-md bg-fg px-2 py-1 text-[11px] font-medium text-bg">Copy</span><span className="rounded-md border border-line px-2 py-1 text-[11px]">Download</span></div>
        </div>
      </div>
    </AppChrome>
  );
}

function ChatPane() {
  return (
    <AppChrome active="Businesses" title="Hartline Plumbing · Ask Maven">
      <div className="mx-auto grid max-w-xl gap-3 text-[12.5px]">
        <div className="ml-auto rounded-xl bg-fg px-3 py-2 text-bg">What should I do this week?</div>
        <div className="rounded-xl border border-line bg-surface p-3 leading-relaxed text-fg-2">
          Start with the phone. Your number is hidden behind the menu on phones and a cookie popup covers half the screen, so callers leave. <span className="font-medium text-fg">This week:</span>
          <ul className="mt-1.5 grid gap-1">
            <li className="flex gap-1.5"><Check className="mt-0.5 size-3 text-good" />Put “Call (214) 555-0100” at the top. Run <b className="text-fg">Homepage first screen</b>.</li>
            <li className="flex gap-1.5"><Check className="mt-0.5 size-3 text-good" />Turn on missed-call text-back (~15 min).</li>
          </ul>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-muted">Ask about your fixes, rivals or plan…<span className="ml-auto flex size-6 items-center justify-center rounded-md bg-fg text-bg"><ArrowUp className="size-3" /></span></div>
      </div>
    </AppChrome>
  );
}

export const DEMO_TABS = [
  { id: "overview", label: "Diagnose", icon: Building2, pane: OverviewPane },
  { id: "competitors", label: "Compare", icon: Users, pane: CompetitorsPane },
  { id: "phone", label: "Phone check", icon: Smartphone, pane: PhonePane },
  { id: "plan", label: "Plan", icon: MapPin, pane: PlanPane },
  { id: "toolkit", label: "Do the work", icon: Wand2, pane: ToolkitPane },
  { id: "chat", label: "Ask", icon: Bot, pane: ChatPane },
] as const;

// ---------------- Small mock-ups for the bento grid ----------------

export function PhoneMock({ small }: { small?: boolean }) {
  return (
    <div className={cn("shrink-0 overflow-hidden rounded-[22px] border-[5px] border-fg/90 bg-surface", small ? "w-[96px]" : "w-[150px]")} style={{ aspectRatio: "9 / 19" }} aria-hidden>
      <div className="flex h-full flex-col gap-1.5 p-2">
        <div className="flex items-center justify-between"><div className="h-2 w-10 rounded bg-fg/70" /><div className="h-2 w-3 rounded bg-fg/40" /></div>
        <div className="mt-1 h-12 rounded bg-bg-subtle" />
        <div className="h-1.5 w-full rounded bg-bg-subtle" />
        <div className="h-1.5 w-3/4 rounded bg-bg-subtle" />
        <div className="mt-auto rounded-md border border-line bg-surface-2 p-1.5">
          <div className="h-1 w-full rounded bg-line-strong" />
          <div className="mt-1 h-1 w-2/3 rounded bg-line-strong" />
          <div className="mt-1.5 h-3 rounded bg-brand/80" />
        </div>
      </div>
    </div>
  );
}

export function MiniJourney() {
  return (
    <div className="grid grid-cols-6 items-end gap-2" aria-hidden>
      {STAGES.map(([n, s, t]) => (
        <div key={n} className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-full items-end justify-center rounded-lg border border-line bg-surface-2 pb-2 pt-2">
            <div className="w-1.5 rounded-full" style={{ height: `${((s ?? 0) / 10) * 100}%`, minHeight: s == null ? 0 : 6, background: `color-mix(in srgb, ${t === "bad" ? "var(--rose)" : t === "warn" ? "var(--amber)" : t === "good" ? "var(--emerald)" : "transparent"} 75%, transparent)` }} />
          </div>
          <span className="tabular -mb-1 text-[12px] font-medium text-fg-2">{s ?? "?"}</span>
          <span className="text-[10.5px] text-muted">{n}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniCompetitors() {
  const rows = [
    ["Hartline Plumbing", 4.6, 212, true],
    ["Rival Plumbing Co.", 4.9, 812, false],
    ["Metro Drain Pros", 4.8, 540, false],
    ["Lone Star Rooter", 4.7, 268, false],
  ] as const;
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface text-[12px]" aria-hidden>
      {rows.map(([n, r, c, you]) => (
        <div key={n} className={cn("flex items-center gap-3 px-3 py-2.5", you && "bg-brand-soft")}>
          <span className="min-w-0 flex-1 truncate font-medium">{n}{you && <span className="ml-1.5 text-brand">· you</span>}</span>
          <span className="tabular inline-flex items-center gap-0.5">{r}<Star className="size-2.5 fill-current text-amber" /></span>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-bg-subtle"><div className="h-full rounded-full" style={{ width: `${(c / 812) * 100}%`, background: you ? "var(--brand)" : "var(--subtle)" }} /></div>
          <span className="tabular w-8 text-right text-muted">{c}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniRoadmap() {
  const bets = [
    ["Fix the first screen", 1, 2, "var(--rose)"],
    ["Missed-call text-back", 1, 3, "var(--amber)"],
    ["Review ask after every job", 3, 8, "var(--violet)"],
    ["Town pages that rank", 6, 13, "var(--sky)"],
  ] as const;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface text-[11px]" aria-hidden>
      <div className="grid grid-cols-[120px_repeat(13,minmax(0,1fr))] border-b border-line text-[9px] text-subtle">
        <div className="px-2.5 py-1.5">Bet</div>
        {Array.from({ length: 13 }, (_, i) => <div key={i} className="py-1.5 text-center">{i + 1}</div>)}
      </div>
      {bets.map(([t, s, e, c]) => (
        <div key={t} className="grid grid-cols-[120px_repeat(13,minmax(0,1fr))] items-center border-b border-line last:border-0">
          <div className="truncate px-2.5 py-2.5 font-medium">{t}</div>
          <div className="relative h-full" style={{ gridColumn: "2 / span 13" }}>
            <div className="absolute top-1/2 h-4 -translate-y-1/2 rounded-md" style={{ left: `${((s - 1) / 13) * 100}%`, width: `${((e - s + 1) / 13) * 100}%`, background: `color-mix(in srgb, ${c} 28%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 55%, transparent)` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniDraft() {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5" aria-hidden>
      <div className="flex items-center justify-between">
        <Badge className="!h-5 !text-[10px]">Review request</Badge>
        <Badge tone="good" className="!h-5 !text-[10px]"><Check className="size-2.5" />Approved</Badge>
      </div>
      <p className="mt-2.5 rounded-lg bg-surface-2 p-2.5 text-[12px] leading-relaxed text-fg-2">Hi [first name], thanks for having Hartline out today. If we did right by you, would you leave a quick review? It helps neighbors find us. [link]</p>
      <div className="mt-2.5 flex gap-1.5">
        <span className="rounded-md bg-fg px-2.5 py-1 text-[11px] font-medium text-bg">Approve</span>
        <span className="rounded-md border border-line px-2.5 py-1 text-[11px] font-medium">Copy</span>
      </div>
    </div>
  );
}

export function MiniLive() {
  const steps = [["Reading your website", "done"], ["Checking your first screen on a phone", "done"], ["Finding your Google profile", "done"], ["Sizing up who shows up first", "run"], ["Writing your 90-day plan", "wait"]] as const;
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface text-[12px]" aria-hidden>
      {steps.map(([t, s]) => (
        <div key={t} className={cn("flex items-center gap-2.5 px-3 py-2.5", s === "wait" && "opacity-50")}>
          {s === "done" ? <CircleCheck className="size-3.5 text-good" /> : s === "run" ? <span className="size-3.5 animate-spin-slow rounded-full border-2 border-line border-t-brand" /> : <span className="size-3.5 rounded-full border border-dashed border-line-strong" />}
          <span className="flex-1">{t}</span>
          <span className="tabular text-[10.5px] text-subtle">{s === "done" ? "4s" : s === "run" ? "0:12" : ""}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniProspects() {
  const rows = [["Excellent Plumbing", 35, "No tap-to-call"], ["Llona Plumbing", 30, "Website down"], ["Tampa Plumbing Co.", 27, "Few reviews"]] as const;
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface text-[12px]" aria-hidden>
      {rows.map(([n, s, r]) => (
        <div key={n} className="flex items-center gap-3 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate font-medium">{n}</span>
          <span className="rounded-md px-1.5 py-0.5 text-[10.5px]" style={{ background: "color-mix(in srgb, var(--amber) 16%, transparent)", color: "var(--amber)" }}>{r}</span>
          <span className="tabular w-6 text-right font-semibold" style={{ color: "var(--rose)" }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniShare() {
  return (
    <div className="w-full rounded-xl border border-line bg-surface p-3.5" aria-hidden>
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-good-soft"><Globe className="size-3.5 text-good" /></span>
        <div className="text-[12px]"><div className="font-medium">Anyone with the link can view</div><div className="mt-0.5 text-[11px] text-muted">Your plan, drafts and budget stay private.</div></div>
      </div>
      <div className="mt-3 flex gap-1.5">
        <div className="flex h-7 min-w-0 flex-1 items-center gap-1.5 truncate rounded-md border border-line bg-surface-2 px-2 font-mono text-[10.5px] text-muted"><Link2 className="size-3 shrink-0" />maven.app/r/7Gq2…</div>
        <span className="flex h-7 items-center rounded-md bg-fg px-2.5 text-[11px] font-medium text-bg">Copy</span>
      </div>
    </div>
  );
}

export function MiniAi() {
  return (
    <div className="grid gap-1.5 text-[12px]" aria-hidden>
      {[["GPTBot (ChatGPT)", true], ["ClaudeBot", true], ["PerplexityBot", false], ["Business markup", false]].map(([n, ok]) => (
        <div key={n as string} className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2">
          <span>{n as string}</span>
          {ok ? <Badge tone="good" className="!h-5 !text-[10px]">Allowed</Badge> : <Badge tone="bad" className="!h-5 !text-[10px]">{n === "Business markup" ? "Missing" : "Blocked"}</Badge>}
        </div>
      ))}
    </div>
  );
}

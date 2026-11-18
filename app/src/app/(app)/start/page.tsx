"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Bot, Check, Gauge, Globe, MapPin, Megaphone, MessageSquare, Phone, Search, Star, Target, TrendingUp, Users } from "lucide-react";
import { GOALS, BUDGETS, type GoalKey, type BudgetKey } from "@/lib/types";
import { Button, cn } from "@/components/ui";

const GOAL_META: Record<GoalKey, { icon: typeof Phone; hint: string }> = {
  calls: { icon: Phone, hint: "The phone should ring more, and more calls should become jobs." },
  reviews: { icon: Star, hint: "Rivals have more stars and more reviews than you." },
  found: { icon: Search, hint: "You don't show up when people search your trade and town." },
  ads: { icon: Megaphone, hint: "You spend on ads and aren't sure they pay back." },
  leads: { icon: TrendingUp, hint: "More quote requests, bookings and form fills." },
};

const CHECKS = [
  [Globe, "Your website", "Up to five key pages, read like a customer and like Google"],
  [Phone, "Your first screen on a phone", "A real mobile render, checked for number, promise and proof"],
  [MapPin, "Your Google profile", "Rating, reviews, hours and photos"],
  [Users, "Your top competitors", "The businesses that show up before you in your town"],
  [MessageSquare, "What customers say", "Praise and complaints, word for word"],
  [Bot, "AI search readiness", "Whether ChatGPT and other AI tools can read you"],
  [Gauge, "Speed on a phone", "Google PageSpeed, mobile"],
] as const;

const STEPS = ["Website", "Business", "Goal", "Details"];

function Choice({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn("relative rounded-lg border bg-surface text-left transition-[border-color,box-shadow,background]", selected ? "border-brand shadow-[0_0_0_3px_var(--ring)]" : "border-line hover:border-line-strong", className)}
    >
      {children}
      {selected && <span className="absolute right-3 top-3 flex size-4 items-center justify-center rounded-full bg-brand text-white"><Check className="size-3" /></span>}
    </button>
  );
}

function Wizard() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState(params.get("url") ?? "");
  const [name, setName] = useState(params.get("name") ?? "");
  const [location, setLocation] = useState(params.get("loc") ?? "");
  const [goal, setGoal] = useState<GoalKey | null>(null);
  const [budget, setBudget] = useState<BudgetKey | null>(null);
  const [runsAds, setRunsAds] = useState<boolean | null>(null);
  const [monthlyJobs, setMonthlyJobs] = useState("");
  const [knownCompetitors, setKnownCompetitors] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    if (params.get("url")) void detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function detect() {
    if (url.trim().length < 4) return setError("Enter your website address.");
    setBusy(true);
    setError("");
    setUnreachable(false);
    try {
      const r = await fetch("/api/detect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
      const d = await r.json();
      if (d.name && !name) setName(d.name);
      if (d.location && !location) setLocation(d.location);
      if (d.reachable) setStep(1);
      else {
        setUnreachable(true);
        setError(d.error ? `We couldn't open that site (${d.error}).` : "We couldn't open that site. Check the address, or continue and Maven will try again.");
      }
    } catch {
      setError("Something went wrong reaching that site.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/analyses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, businessName: name, location, goal, budget, runsAds, monthlyJobs, knownCompetitors }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Couldn't start the analysis");
      router.push(`/a/${d.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the analysis");
      setBusy(false);
    }
  }

  const canNext = [url.trim().length > 3, !!(name.trim() && location.trim()), !!goal, !!budget && runsAds !== null][step];
  const next = () => {
    if (!canNext || busy) return;
    if (step === 0) void detect();
    else if (step < 3) setStep(step + 1);
    else void submit();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="display text-[28px]">New analysis</h1>
        <p className="mt-1 text-sm text-muted">Four quick questions, then Maven reads the business in about two minutes.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form
          className="panel h-fit overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <ol className="flex border-b border-line" aria-label="Steps">
            {STEPS.map((s, i) => (
              <li key={s} className={cn("flex flex-1 items-center gap-2 px-4 py-3 text-[13px] font-medium", i === step ? "text-fg" : i < step ? "text-fg-2" : "text-subtle", i > 0 && "border-l border-line")}>
                <span className={cn("tabular flex size-5 shrink-0 items-center justify-center rounded-full text-[11px]", i < step ? "bg-good text-white" : i === step ? "bg-fg text-bg" : "bg-bg-subtle text-muted")}>
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </li>
            ))}
          </ol>

          <div className="fade-up p-6 sm:p-8" key={step}>
            {step === 0 && (
              <section>
                <h2 className="text-lg font-semibold">What&apos;s the website?</h2>
                <p className="mt-1 text-sm text-muted">Your business or a client&apos;s. We&apos;ll fill in the rest from the site.</p>
                <label htmlFor="url" className="label mt-6 block">Website</label>
                <div className="relative mt-1.5">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                  <input id="url" autoFocus className="input h-11 pl-9 text-[15px]" placeholder="yourbusiness.com" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" autoComplete="url" />
                </div>
              </section>
            )}

            {step === 1 && (
              <section>
                <h2 className="text-lg font-semibold">Who and where?</h2>
                <p className="mt-1 text-sm text-muted">The town decides who your real competitors are.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label block">Business name</label>
                    <input id="name" autoFocus className="input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hartline Plumbing" />
                  </div>
                  <div>
                    <label htmlFor="loc" className="label block">Town or service area</label>
                    <div className="relative mt-1.5">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                      <input id="loc" className="input pl-9" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dallas, TX" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2 className="text-lg font-semibold">What matters most right now?</h2>
                <p className="mt-1 text-sm text-muted">Maven builds the plan around this.</p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {(Object.keys(GOALS) as GoalKey[]).map((k) => {
                    const Icon = GOAL_META[k].icon;
                    return (
                      <Choice key={k} selected={goal === k} onClick={() => setGoal(k)} className="p-4 pr-10">
                        <Icon className="size-4 text-muted" />
                        <div className="mt-2.5 text-sm font-medium">{GOALS[k]}</div>
                        <div className="mt-0.5 text-[13px] leading-snug text-muted">{GOAL_META[k].hint}</div>
                      </Choice>
                    );
                  })}
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <h2 className="text-lg font-semibold">A few details</h2>
                <p className="mt-1 text-sm text-muted">Rough answers are fine. The plan only splits money you actually spend.</p>
                <fieldset className="mt-6">
                  <legend className="label">Monthly marketing spend</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(Object.keys(BUDGETS) as BudgetKey[]).map((k) => (
                      <Choice key={k} selected={budget === k} onClick={() => setBudget(k)} className="px-3 py-2.5 pr-8 text-sm font-medium">{BUDGETS[k]}</Choice>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-5">
                  <legend className="label">Running Google or Facebook ads?</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:w-1/2">
                    {[true, false].map((v) => (
                      <Choice key={String(v)} selected={runsAds === v} onClick={() => setRunsAds(v)} className="px-3 py-2.5 pr-8 text-sm font-medium">{v ? "Yes" : "No"}</Choice>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="jobs" className="label block">Booked jobs a month <span className="font-normal text-subtle">· optional</span></label>
                    <input id="jobs" className="input mt-1.5" value={monthlyJobs} onChange={(e) => setMonthlyJobs(e.target.value)} placeholder="About 40" />
                  </div>
                  <div>
                    <label htmlFor="comp" className="label block">Competitors you know <span className="font-normal text-subtle">· optional</span></label>
                    <input id="comp" className="input mt-1.5" value={knownCompetitors} onChange={(e) => setKnownCompetitors(e.target.value)} placeholder="Comma separated" />
                  </div>
                </div>
              </section>
            )}

            {error && <p className="mt-5 rounded-lg border border-bad-border bg-bad-soft px-3.5 py-2.5 text-sm text-bad" role="alert">{error}</p>}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-6 py-4 sm:px-8">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => { setError(""); setStep(step - 1); }} disabled={busy}><ArrowLeft className="size-4" /> Back</Button>
            ) : <span className="text-[13px] text-muted">Step 1 of 4</span>}
            <div className="flex items-center gap-2">
              {step === 0 && unreachable && <Button type="button" variant="secondary" onClick={() => { setError(""); setStep(1); }}>Continue anyway</Button>}
              <Button type="submit" variant={step === 3 ? "brand" : "primary"} disabled={!canNext} loading={busy}>
                {step === 3 ? (busy ? "Starting" : "Run analysis") : busy ? "Reading site" : "Continue"}
                {!busy && <ArrowRight className="size-4" />}
              </Button>
            </div>
          </div>
        </form>

        <aside className="panel h-fit">
          <div className="panel-head">
            <span className="flex items-center gap-2 text-sm font-semibold"><Target className="size-4 text-brand" /> What Maven checks</span>
          </div>
          <ul className="grid gap-3.5 p-4">
            {CHECKS.map(([Icon, t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2"><Icon className="size-3.5 text-muted" /></span>
                <div>
                  <div className="text-[13px] font-medium">{t}</div>
                  <div className="text-[13px] leading-snug text-muted">{d}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-muted">Public information only. Nothing is posted, sent or changed on your accounts.</div>
        </aside>
      </div>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense>
      <Wizard />
    </Suspense>
  );
}

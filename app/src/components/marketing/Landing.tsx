"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Bot, Check, Globe, Map as MapIcon, MapPin, MessageSquare, Plus, Route, ShieldCheck, Smartphone, Sparkles, Users, Wand2, Zap } from "lucide-react";
import { Logo, ThemeSwitch, ThemeToggle, buttonClass, cn } from "@/components/ui";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { PLANS, type PlanId } from "@/lib/plans";
import { ToolIcon } from "@/components/toolkit/ToolIcon";
import { ACCENTS, type Accent, BrowserFrame, DEMO_TABS, MiniAi, MiniCompetitors, MiniDraft, MiniJourney, MiniLive, MiniProspects, MiniRoadmap, MiniShare, PhoneMock } from "./Mocks";

function UrlForm({ id }: { id: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/start${url.trim() ? `?url=${encodeURIComponent(url.trim())}` : ""}`);
      }}
      className="flex w-full max-w-lg items-center gap-1.5 rounded-2xl border border-line bg-surface/80 p-1.5 shadow-lg backdrop-blur transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-[0_0_0_4px_var(--ring)]"
    >
      <Globe className="ml-3 size-4 shrink-0 text-subtle" aria-hidden />
      <label htmlFor={id} className="sr-only">Your website</label>
      <input id={id} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourbusiness.com" inputMode="url" autoComplete="url" className="h-11 min-w-0 flex-1 bg-transparent px-1 text-[15px] outline-none placeholder:text-subtle" />
      <button type="submit" className={buttonClass("primary", "lg", "h-11 shrink-0 rounded-xl")}>
        <span className="hidden sm:inline">Analyze my business</span>
        <span className="sm:hidden">Analyze</span>
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

function HeroDemo() {
  const [tab, setTab] = useState<(typeof DEMO_TABS)[number]["id"]>("overview");
  const Pane = DEMO_TABS.find((t) => t.id === tab)!.pane;
  return (
    <div className="w-full">
      <div className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-surface/70 p-1 backdrop-blur" role="tablist" aria-label="Product tour">
        {DEMO_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn("inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors", tab === t.id ? "bg-bg-subtle text-fg shadow-xs ring-1 ring-line" : "text-muted hover:text-fg")}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>
      <BrowserFrame className="mt-6">
        <div key={tab} className="fade-up"><Pane /></div>
      </BrowserFrame>
      <p className="mt-3 text-center text-[12px] text-subtle">Sample report for an illustrative business</p>
    </div>
  );
}

function Bento({ title, text, accent, icon: Icon, children, className, href = "/start" }: { title: string; text: string; accent: Accent; icon: typeof Globe; children: React.ReactNode; className?: string; href?: string }) {
  const c = ACCENTS[accent];
  return (
    <div className={cn("group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface", className)}>
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-[0.14] blur-3xl transition-opacity group-hover:opacity-[0.22]" style={{ background: c }} aria-hidden />
      <div className="relative p-7 pb-0">
        <span className="flex size-9 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c }}><Icon className="size-4" /></span>
        <Link href={href} className="mt-5 inline-flex items-center gap-1.5 text-[17px] font-semibold tracking-tight hover:underline">
          {title} <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
        <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-muted">{text}</p>
      </div>
      <div className="relative mt-7 flex flex-1 items-end p-7 pt-0">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

const FAQ: [string, string][] = [
  ["What does Maven check?", "Your website (up to five key pages), a real phone render of your homepage, your mobile speed, your Google Business Profile and reviews, the businesses that show up before you in your town, and whether AI assistants like ChatGPT can read your site. Then it scores six stages from search to repeat customer."],
  ["How long does it take?", "About two minutes. You watch every check run live, or leave and come back."],
  ["Does it post or change anything?", "No. Maven reads public information only. Plans, drafts and Toolkit work are for you to approve and use; nothing is published, sent or spent for you."],
  ["Where do the numbers come from?", "Your public website, Google's public business data and Google PageSpeed. Maven never estimates from industry averages. If it can't see something, like whether calls get answered, it says unknown."],
  ["What's in the Toolkit?", "26 tools that do the work once the analysis shows what to fix: Google posts, replies to your real reviews, town pages, a new homepage first screen, Google and Facebook ads, missed-call texts, emails and articles. Each runs a proven marketing playbook for your business."],
  ["Is it for agencies too?", "Yes. Find clients ranks the businesses in any trade and town by what they're losing, writes the pitch, and every report can be shared as a read-only link."],
  ["Can I cancel any time?", "Yes. Plans are monthly and you can change or cancel from Settings."],
];

function Pricing() {
  const ids = Object.keys(PLANS) as PlanId[];
  const [sel, setSel] = useState<PlanId>("pro");
  const plan = PLANS[sel];
  const max = Math.max(...ids.map((i) => PLANS[i].analysesPerMonth));
  return (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-[1.15fr_1fr]">
      <div className="relative border-b border-line p-8 lg:border-b-0 lg:border-r">
        <div className="text-sm font-medium text-fg-2">Analyses a month</div>
        <div className="display mt-4 text-[52px] sm:text-[60px]">{plan.analysesPerMonth.toLocaleString()}</div>
        <div className="mt-1 text-sm text-muted">{plan.tagline}</div>
        <div className="mt-10 grid grid-cols-3 items-end gap-3" role="radiogroup" aria-label="Plan">
          {ids.map((id) => {
            const p = PLANS[id];
            const h = 56 + Math.sqrt(p.analysesPerMonth / max) * 150;
            const on = sel === id;
            return (
              <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setSel(id)} className="flex flex-col items-center gap-3">
                <div className={cn("flex w-full items-start justify-center rounded-xl pt-3 text-sm font-semibold transition-[background,color,height] duration-300", on ? "bg-fg text-bg" : "bg-surface-2 text-muted ring-1 ring-line hover:text-fg hover:ring-line-strong")} style={{ height: h }}>
                  ${p.price}
                </div>
                <span className={cn("text-sm", on ? "font-medium text-fg" : "text-muted")}>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col p-8">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-fg-2">{plan.name}</span>
          {sel === "pro" && <span className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-muted">Most popular</span>}
        </div>
        <div className="mt-3 flex items-baseline gap-1.5"><span className="text-5xl font-semibold tracking-tight">${plan.price}</span><span className="text-muted">/month</span></div>
        <div className="mt-1 text-sm text-muted">{plan.price === 0 ? "Free forever" : "Billed monthly · cancel any time"}</div>
        <div className="my-7 h-px bg-line" />
        <div className="text-[13px] text-muted">What&apos;s included</div>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {plan.features.map((f) => <li key={f} className="flex gap-2 text-sm text-fg-2"><Check className="mt-0.5 size-4 shrink-0 text-good" />{f}</li>)}
        </ul>
        <div className="mt-auto pt-8">
          <Link href={sel === "free" ? "/start" : "/login?next=/settings%23plan"} className={buttonClass("primary", "lg", "w-full")}>
            {sel === "free" ? "Start free" : `Get ${plan.name}`} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  return (
    <div className="overflow-x-clip">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            <a href="#features" className="hidden px-2.5 text-sm text-muted hover:text-fg md:inline">Features</a>
            <a href="#toolkit" className="hidden px-2.5 text-sm text-muted hover:text-fg md:inline">Toolkit</a>
            <a href="#pricing" className="hidden px-2.5 text-sm text-muted hover:text-fg md:inline">Pricing</a>
            <a href="#faq" className="hidden px-2.5 text-sm text-muted hover:text-fg md:inline">FAQ</a>
            <ThemeSwitch />
            <Link href="/login" className="hidden px-2.5 text-sm text-muted hover:text-fg sm:inline">Sign in</Link>
            <Link href="/start" className={buttonClass("primary", "sm")}>Get started</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="dots pointer-events-none absolute inset-x-0 top-0 h-[520px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,#000_30%,transparent_100%)]" aria-hidden />
        <div className="glow left-[8%] top-[60px] size-[420px]" style={{ background: "var(--violet)" }} aria-hidden />
        <div className="glow right-[6%] top-[180px] size-[360px]" style={{ background: "var(--amber)" }} aria-hidden />
        <div className="glow left-[40%] top-[640px] size-[520px]" style={{ background: "var(--sky)", opacity: 0.12 }} aria-hidden />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
          <Link href="#toolkit" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1 pl-1 pr-3 text-[13px] text-fg-2 backdrop-blur hover:border-line-strong">
            <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-medium text-white">New</span>
            26 tools that do the work for you <ArrowRight className="size-3.5 text-muted" />
          </Link>
          <h1 className="display mt-7 max-w-3xl text-[clamp(2.25rem,4.6vw,3.5rem)]">
            Your marketing,
            <br />
            <span className="text-muted">run by an AI&nbsp;CMO.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
            Enter your website. Maven finds why customers call your competitor instead, fixes it with you, and keeps the plan moving every week.
          </p>
          <div className="mt-9 flex w-full justify-center"><UrlForm id="hero-url" /></div>
          <p className="mt-3.5 text-[13px] text-subtle">Free analysis · about two minutes · nothing is posted or sent</p>
          <div className="mt-16 w-full"><HeroDemo /></div>
        </div>
      </section>

      {/* Sources */}
      <section className="border-y border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-center text-[14px] text-muted">Reads the same signals your customers see</p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {([[Globe, "Your website", "sky"], [Smartphone, "A real phone render", "violet"], [MapPin, "Google Business Profile", "emerald"], [MessageSquare, "Google reviews", "amber"], [Users, "Map-pack rivals", "rose"], [Bot, "AI search crawlers", "violet"]] as const).map(([Icon, t, a]) => (
              <li key={t} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-fg-2"><Icon className="size-4" style={{ color: ACCENTS[a] }} />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-4 py-28 sm:px-6">
          <h2 className="display mx-auto max-w-3xl text-center text-[clamp(1.75rem,3.2vw,2.5rem)]">Everything a CMO would do in their first month</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-[17px] text-muted">From diagnosis to finished work, in one place.</p>
          <div className="mt-16 grid gap-4 lg:grid-cols-6">
            <Bento className="lg:col-span-4" accent="violet" icon={Route} title="Score every stage of the journey" text="Found, chosen, call, answered, closed, back. Each scored from evidence, with the biggest leak marked so you fix what costs the most first.">
              <MiniJourney />
            </Bento>
            <Bento className="lg:col-span-2" accent="sky" icon={Zap} title="Watch it work live" text="Seven checks run in about two minutes. Findings stream in as they land.">
              <MiniLive />
            </Bento>
            <Bento className="lg:col-span-2" accent="rose" icon={Smartphone} title="Your site on a real phone" text="A real mobile render, checked for a tappable number, a clear promise and proof.">
              <div className="flex justify-center"><PhoneMock /></div>
            </Bento>
            <Bento className="lg:col-span-4" accent="emerald" icon={Users} title="You vs. the map pack" text="Rating, reviews, photos and hours against the businesses that show up before you, plus what their customers complain about.">
              <MiniCompetitors />
            </Bento>
            <Bento className="lg:col-span-3" accent="amber" icon={MapIcon} title="A 90-day plan with rules" text="Three to five bets in order, each with a sign to watch and a rule for when to stop. Tied to booked jobs, never vanity numbers.">
              <MiniRoadmap />
            </Bento>
            <Bento className="lg:col-span-3" accent="violet" icon={Wand2} title="Drafts, ready to approve" text="Your new headline, Google posts, the review-request text and replies, written in your voice from your customers' words.">
              <MiniDraft />
            </Bento>
            <Bento className="lg:col-span-2" accent="sky" icon={Bot} title="Found by AI search" text="Whether ChatGPT, Claude and Perplexity can read you, and what to fix.">
              <MiniAi />
            </Bento>
            <Bento className="lg:col-span-2" accent="rose" icon={Sparkles} title="Ask Maven anything" text="“Why is Call my biggest leak?” Answers come from your data, never guesses.">
              <div className="grid gap-2 text-[12.5px]" aria-hidden>
                <div className="ml-auto w-fit rounded-xl bg-fg px-3 py-2 text-bg">How do I beat Metro Drain?</div>
                <div className="rounded-xl border border-line bg-surface-2 p-3 leading-relaxed text-fg-2">Their customers complain about surprise fees. Lead with a flat, upfront price and say it on your first screen.</div>
              </div>
            </Bento>
            <Bento className="lg:col-span-2" accent="emerald" icon={ArrowUpRight} title="Share a read-only report" text="Send a client or prospect their diagnosis. The plan stays private.">
              <MiniShare />
            </Bento>
          </div>
        </div>
      </section>

      {/* Principle */}
      <section className="border-y border-line">
        <div className="mx-auto w-full max-w-4xl px-4 py-24 text-center sm:px-6">
          <ShieldCheck className="mx-auto size-6 text-good" />
          <p className="display mt-6 text-[clamp(1.4rem,2.6vw,1.9rem)] leading-snug">
            &ldquo;Every number comes from a source you can open. <span className="text-muted">If Maven can&apos;t see it, it says unknown.</span>&rdquo;
          </p>
          <p className="mt-6 text-sm text-muted">No industry averages. No invented forecasts. No fake reviews.</p>
        </div>
      </section>

      {/* Toolkit */}
      <section id="toolkit" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-4 py-28 sm:px-6">
          <div className="grid items-end gap-6 lg:grid-cols-2">
            <h2 className="display text-[clamp(1.75rem,3.2vw,2.5rem)]">Then Maven does the&nbsp;work</h2>
            <p className="text-[17px] leading-relaxed text-muted">Every fix has a &ldquo;Do this&rdquo; button. {TOOLS.length} tools write the finished work for your business, each built on a proven marketing playbook. You approve it; nothing is posted for you.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => {
              const accent = (["emerald", "violet", "amber", "sky", "rose", "violet"] as Accent[])[i];
              const col = ACCENTS[accent];
              return (
                <div key={c.id} className="rounded-3xl border border-line bg-surface p-6">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: col }} /><span className="font-semibold">{c.name}</span></div>
                  <div className="mt-1 text-sm text-muted">{c.blurb}</div>
                  <ul className="mt-5 grid gap-2">
                    {TOOLS.filter((t) => t.category === c.id).slice(0, 4).map((t) => (
                      <li key={t.id} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 px-3 py-2 text-[13.5px] text-fg-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${col} 15%, transparent)`, color: col }}><ToolIcon id={t.id} className="size-3.5" /></span>
                        {t.name}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agencies */}
      <section className="border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-28 sm:px-6 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[13px] text-fg-2"><Users className="size-3.5 text-amber" /> For agencies and freelancers</div>
            <h2 className="display mt-6 text-[clamp(1.75rem,3.2vw,2.5rem)]">Win the client before the first&nbsp;call</h2>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted">Search any trade in any town. Maven ranks who&apos;s losing the most customers, tells you why, and writes a short pitch about the one thing that&apos;s broken.</p>
            <ul className="mt-8 grid gap-3">
              {["Ranked prospects with reasons you can check", "A pitch email for each, with two follow-ups", "Every client's score and leaks in one place"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-[15px] text-fg-2"><Check className="size-4 text-good" />{t}</li>
              ))}
            </ul>
            <Link href="/start" className={buttonClass("secondary", "lg", "mt-9")}>Try it on a prospect <ArrowRight className="size-4" /></Link>
          </div>
          <div className="relative rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <div className="pointer-events-none absolute -left-10 -top-10 size-60 rounded-full opacity-[0.14] blur-3xl" style={{ background: "var(--amber)" }} aria-hidden />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between text-[13px]"><span className="font-medium">Plumber in Tampa, FL</span><span className="text-muted">20 businesses</span></div>
              <MiniProspects />
              <div className="mt-4 rounded-xl border border-line bg-surface-2 p-4 text-[13px] leading-relaxed text-fg-2">
                <div className="text-[11px] font-medium text-muted">Subject: the number on your homepage</div>
                <p className="mt-2">Your reviews are strong, 4.9 stars across 204. But the homepage has no tap-to-call button, so someone with a leak has to copy the number and switch apps…</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-28 sm:px-6">
          <h2 className="display text-center text-[clamp(1.75rem,3.2vw,2.5rem)]">Start free. Upgrade when it&nbsp;pays.</h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-[17px] text-muted">A fraction of a marketing retainer. Pick a plan to see what&apos;s in it.</p>
          <div className="mt-14"><Pricing /></div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-28 sm:px-6 lg:grid-cols-[1fr_1.5fr]">
          <h2 className="display text-[clamp(1.9rem,3.4vw,2.5rem)]">Questions</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16px] font-medium">
                  {q}
                  <Plus className="size-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="-mt-1 pb-5 pr-8 text-[15px] leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="glow left-1/2 top-10 size-[480px] -translate-x-1/2" style={{ background: "var(--violet)", opacity: 0.18 }} aria-hidden />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-32 text-center sm:px-6">
          <div className="flex items-center gap-1.5" aria-hidden>
            {(["sky", "violet", "emerald", "amber", "rose"] as Accent[]).map((a, i) => (
              <span key={a} className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface" style={{ color: ACCENTS[a], transform: `rotate(${(i - 2) * 4}deg)` }}>
                {[<Globe key="g" className="size-4" />, <Route key="r" className="size-4" />, <MapPin key="m" className="size-4" />, <Wand2 key="w" className="size-4" />, <Sparkles key="s" className="size-4" />][i]}
              </span>
            ))}
          </div>
          <h2 className="display mt-10 text-[clamp(2rem,4vw,3rem)]">See what&apos;s costing you&nbsp;calls.</h2>
          <p className="mt-5 text-[17px] text-muted">Your first analysis takes about two minutes. Free.</p>
          <div className="mt-9 flex w-full justify-center"><UrlForm id="cta-url" /></div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-[13px] text-muted">The AI CMO for local service businesses</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-muted">
            <a href="#features" className="hover:text-fg">Features</a>
            <a href="#pricing" className="hover:text-fg">Pricing</a>
            <a href="#faq" className="hover:text-fg">FAQ</a>
            <Link href="/login" className="hover:text-fg">Sign in</Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}

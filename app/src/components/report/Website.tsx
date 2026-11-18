"use client";
import { Bot, CircleCheck, CircleHelp, CircleX, FileText, Smartphone } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { Badge, EmptyState, SectionHead, scoreTone } from "@/components/ui";

function Row({ ok, label, detail }: { ok: boolean | null; label: string; detail?: string | null }) {
  const Icon = ok == null ? CircleHelp : ok ? CircleCheck : CircleX;
  const color = ok == null ? "var(--subtle)" : ok ? "var(--good)" : "var(--bad)";
  return (
    <li className="flex gap-3 px-4 py-3">
      <Icon className="mt-0.5 size-4 shrink-0" style={{ color }} />
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {detail && <div className="mt-0.5 break-words text-[13px] text-muted">{detail}</div>}
      </div>
    </li>
  );
}

/** A threshold scale: good / needs work / poor, with a marker for the value. */
function Metric({ label, value, display, good, poor, lowerIsBetter, hint }: { label: string; value: number | null; display: string; good: number; poor: number; lowerIsBetter?: boolean; hint: string }) {
  const tone = value == null ? "neutral" : lowerIsBetter ? (value <= good ? "good" : value <= poor ? "warn" : "bad") : value >= good ? "good" : value >= poor ? "warn" : "bad";
  const max = lowerIsBetter ? poor * 1.8 : 100;
  const pos = value == null ? 0 : Math.min(100, (value / max) * 100);
  const segs = lowerIsBetter ? [(good / max) * 100, ((poor - good) / max) * 100, 100 - (poor / max) * 100] : [poor, good - poor, 100 - good];
  const segColors = lowerIsBetter ? ["var(--good)", "var(--warn)", "var(--bad)"] : ["var(--bad)", "var(--warn)", "var(--good)"];
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <Badge tone={tone}>{tone === "good" ? "Good" : tone === "warn" ? "Needs work" : tone === "bad" ? "Poor" : "Unknown"}</Badge>
      </div>
      <div className="tabular mt-3 text-2xl font-semibold tracking-tight">{display}</div>
      <div className="relative mt-4">
        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
          {segs.map((w, i) => <div key={i} style={{ width: `${w}%`, background: segColors[i], opacity: 0.35 }} />)}
        </div>
        {value != null && <div className="absolute -top-1 h-3.5 w-1 -translate-x-1/2 rounded-full bg-fg ring-2 ring-surface" style={{ left: `${pos}%` }} />}
      </div>
      <p className="mt-3 text-[13px] text-muted">{hint}</p>
    </div>
  );
}

export function Website({ a }: { a: Analysis }) {
  const p = a.data.phone;
  const fs = p?.firstScreen;
  const b = a.data.business;
  const ai = a.data.ai;
  return (
    <div className="grid grid-cols-1 gap-8">
      <section>
        <SectionHead title="First screen on a phone" description="What a customer sees before they scroll, from a real mobile render of your homepage." />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="panel flex flex-col items-center gap-4 p-5">
            <div className="relative w-[220px] overflow-hidden rounded-[34px] border-[6px] border-fg bg-bg-subtle shadow-lg" style={{ aspectRatio: "9 / 19" }}>
              <div className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-fg" aria-hidden />
              {p?.screenshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.screenshot} alt="Phone render of the homepage" className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted"><Smartphone className="mb-2 size-5" />No screenshot</div>
              )}
            </div>
            {fs && (
              <div className="text-center">
                <div className="tabular text-2xl font-semibold">{fs.score}<span className="text-base text-subtle">/10</span></div>
                <div className="text-[13px] text-muted">First-screen score</div>
              </div>
            )}
          </div>
          <div className="panel min-w-0">
            {fs ? (
              <>
                <div className="flex items-start justify-between gap-4 border-b border-line p-4">
                  <p className="text-[15px] leading-relaxed text-fg-2">{fs.verdict}</p>
                  <Badge tone={scoreTone(fs.score, 10)}>{fs.score >= 7 ? "Good" : fs.score >= 4 ? "Needs work" : "Poor"}</Badge>
                </div>
                <ul className="divide-y divide-line">
                  <Row ok={fs.phoneVisible} label="Phone number visible" detail={fs.phoneVisible ? null : "A customer has to scroll or open a menu to find it"} />
                  <Row ok={fs.phoneTappable} label="One tap to call" />
                  <Row ok={fs.headlineSaysWhatAndWhere ?? !!fs.promise} label="Headline names the service and the town" detail={fs.promise ? `“${fs.promise}”` : "No clear headline"} />
                  <Row ok={!!fs.proof} label="Proof without scrolling" detail={fs.proof ? `“${fs.proof}”` : "No rating, reviews, years or guarantee visible"} />
                  <Row ok={!!fs.cta} label="One clear next step" detail={fs.cta ? `“${fs.cta}”` : "No obvious button"} />
                  <Row ok={fs.clutter.length === 0} label="Nothing in the way" detail={fs.clutter.length ? fs.clutter.join(" · ") : null} />
                </ul>
              </>
            ) : (
              <div className="p-6 text-sm text-muted">The phone check didn&apos;t finish for this run.</div>
            )}
          </div>
        </div>
      </section>

      {p && (
        <section>
          <SectionHead title="Speed on a phone" description="Google PageSpeed, mobile. Slow pages lose callers before the page appears." />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Metric label="Speed score" value={p.performance} display={p.performance != null ? `${p.performance}/100` : "—"} good={90} poor={50} hint="Google's mobile performance score" />
            <Metric label="Main content shows" value={p.lcpSeconds} display={p.lcpSeconds != null ? `${p.lcpSeconds}s` : "—"} good={2.5} poor={4} lowerIsBetter hint="Under 2.5 seconds is good" />
            <Metric label="Layout shift" value={p.cls != null ? Math.round(p.cls * 100) / 100 : null} display={p.cls != null ? p.cls.toFixed(2) : "—"} good={0.1} poor={0.25} lowerIsBetter hint="How much the page jumps while loading" />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {ai && (
          <section className="panel">
            <div className="panel-head"><span className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-muted" /> AI search readiness</span></div>
            <ul className="divide-y divide-line">
              <Row ok={ai.blockedBots.length === 0} label="AI assistants can read the site" detail={ai.blockedBots.length ? `Blocked: ${ai.blockedBots.join(", ")}` : "ChatGPT, Claude, Perplexity and Google AI crawlers allowed"} />
              <Row ok={ai.hasLocalBusinessSchema} label="Business details marked up" detail="LocalBusiness schema tells search and AI your name, phone, area and hours" />
              <Row ok={ai.hasSitemap} label="Sitemap" />
              <Row ok={ai.hasLlmsTxt} label="llms.txt" detail="Optional summary for AI tools" />
            </ul>
          </section>
        )}
        {b && (
          <section className="panel">
            <div className="panel-head"><span className="flex items-center gap-2 text-sm font-semibold"><FileText className="size-4 text-muted" /> What your site says</span><span className="text-[13px] text-muted">{a.data.site?.pages.length ?? 0} pages read</span></div>
            <dl className="grid grid-cols-1 gap-3 p-4 text-sm">
              {([["Category", b.category], ["Promise", b.promise], ["Offer", b.offer ?? "No concrete offer found"], ["Phone", b.phone], ["Hours", b.hours]] as const).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3"><dt className="text-muted">{k}</dt><dd className="break-words text-fg-2">{v ?? "Not stated"}</dd></div>
              ))}
            </dl>
            {b.services.length > 0 && <div className="flex flex-wrap gap-1.5 border-t border-line p-4">{b.services.map((s) => <span key={s} className="rounded-md bg-bg-subtle px-2 py-1 text-xs text-fg-2">{s}</span>)}</div>}
          </section>
        )}
      </div>

      {b && b.gaps.length > 0 && (
        <section className="panel">
          <div className="panel-head"><span className="text-sm font-semibold">What customers look for and can&apos;t find</span><Badge tone="bad">{b.gaps.length}</Badge></div>
          <ul className="divide-y divide-line">{b.gaps.map((g, i) => <Row key={i} ok={false} label={g} />)}</ul>
        </section>
      )}

      {!p && !b && <EmptyState icon={Smartphone} title="Website couldn't be read">Check the address and re-run the analysis.</EmptyState>}
    </div>
  );
}

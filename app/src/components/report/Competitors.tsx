"use client";
import { ExternalLink, MapPin, MessageSquare, Quote, Star, Users } from "lucide-react";
import type { Analysis, Place } from "@/lib/types";
import { Badge, EmptyState, SectionHead, cn } from "@/components/ui";
import { Stat, fmt, rivalsSummary } from "./shared";

export function Competitors({ a }: { a: Analysis }) {
  const own = a.data.google;
  const { rivals, avgRating, avgReviews, rank, total } = rivalsSummary(a);
  const rows: (Place & { you?: boolean })[] = [...(own ? [{ ...own, you: true }] : []), ...rivals];
  const maxReviews = Math.max(1, ...rows.map((r) => r.reviewCount ?? 0));
  const v = a.data.customers;
  const query = `${a.data.google?.primaryType ?? a.data.business?.category ?? "Your trade"} in ${a.input.location}`;

  return (
    <div className="grid grid-cols-1 gap-8">
      {rows.length > 1 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Your rating" icon={Star} value={own?.rating != null ? `${own.rating.toFixed(1)}★` : "—"} sub={avgRating != null ? `Top 3 rivals average ${avgRating.toFixed(1)}★` : undefined} />
            <Stat label="Your reviews" icon={MessageSquare} value={fmt(own?.reviewCount)} sub={avgReviews != null ? `Top 3 rivals average ${fmt(avgReviews)}` : undefined} />
            <Stat label="Review rank" icon={Users} value={rank ? `#${rank} of ${total}` : "—"} sub="By review count in your map results" />
          </div>

          <section>
            <SectionHead title="You vs. the map pack" description={<span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> Google results for “{query}”</span>} />
            <div className="panel overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[13px] text-muted">
                    <th className="px-4 py-2.5 font-medium">Business</th>
                    <th className="px-4 py-2.5 font-medium">Rating</th>
                    <th className="px-4 py-2.5 font-medium">Reviews</th>
                    <th className="px-4 py-2.5 font-medium">Photos</th>
                    <th className="px-4 py-2.5 font-medium">Hours</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((r) => (
                    <tr key={r.id} className={cn(r.you && "bg-brand-soft/60")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="truncate">{r.name}</span>
                          {r.you && <Badge tone="brand">You</Badge>}
                        </div>
                        {r.address && <div className="mt-0.5 max-w-[320px] truncate text-[13px] text-muted">{r.address}</div>}
                      </td>
                      <td className="tabular px-4 py-3"><span className="inline-flex items-center gap-1">{r.rating?.toFixed(1) ?? "—"}<Star className="size-3.5 fill-current text-warn" /></span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-subtle"><div className="h-full rounded-full" style={{ width: `${((r.reviewCount ?? 0) / maxReviews) * 100}%`, background: r.you ? "var(--brand)" : "var(--subtle)" }} /></div>
                          <span className="tabular">{fmt(r.reviewCount)}</span>
                        </div>
                      </td>
                      <td className="tabular px-4 py-3 text-fg-2">{r.photoCount >= 10 ? "10+" : r.photoCount}</td>
                      <td className="px-4 py-3">{r.hasHours ? <span className="text-fg-2">Listed</span> : <Badge tone="bad">Missing</Badge>}</td>
                      <td className="px-4 py-3 text-right">
                        {r.mapsUrl && <a href={r.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg">Profile <ExternalLink className="size-3" /></a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <EmptyState icon={Users} title="Competitor comparison unavailable">
          Maven compares you with the businesses that show up first on Google Maps. Re-run the analysis once your Google profile can be found.
        </EmptyState>
      )}

      <section>
        <SectionHead title="What customers say" description="Quoted word for word from public Google reviews." />
        {v ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <QuoteList title="What they love" tone="good" items={v.praise.map((q) => ({ head: q.theme, quote: q.quote }))} empty="No praise in the reviews we could read." />
            <QuoteList title="What they complain about" tone="warn" items={v.complaints.map((q) => ({ head: q.theme, quote: q.quote }))} empty="No complaints in the reviews we could read." />
            <QuoteList title="Where rivals fall short" tone="brand" items={v.competitorComplaints.map((q) => ({ head: `${q.competitor} · ${q.theme}`, quote: q.quote }))} empty="No rival complaints found." hint="Your opening" />
            {v.words.length > 0 && (
              <div className="panel p-4 lg:col-span-3">
                <div className="text-sm font-semibold">Words customers use</div>
                <p className="mt-0.5 text-[13px] text-muted">Use these in headlines, ads and posts. They're how buyers describe the problem.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{v.words.map((w) => <span key={w} className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[13px] text-fg-2">{w}</span>)}</div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState icon={MessageSquare} title="No reviews read">Reviews come from your Google Business Profile and your competitors'. None were available for this run.</EmptyState>
        )}
      </section>
    </div>
  );
}

function QuoteList({ title, items, empty, tone, hint }: { title: string; items: { head: string; quote: string }[]; empty: string; tone: "good" | "warn" | "brand"; hint?: string }) {
  const color = { good: "var(--good)", warn: "var(--warn)", brand: "var(--brand)" }[tone];
  return (
    <div className="panel flex flex-col">
      <div className="panel-head">
        <span className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full" style={{ background: color }} />{title}</span>
        {hint && <Badge tone="brand">{hint}</Badge>}
      </div>
      {items.length ? (
        <ul className="grid grid-cols-1 gap-4 p-4">
          {items.map((q, i) => (
            <li key={i}>
              <div className="text-[13px] font-medium text-fg">{q.head}</div>
              <p className="mt-1 flex gap-2 text-sm leading-relaxed text-muted"><Quote className="mt-1 size-3 shrink-0 text-subtle" />{q.quote}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-4 text-sm text-muted">{empty}</p>
      )}
    </div>
  );
}

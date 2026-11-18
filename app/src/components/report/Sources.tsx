"use client";
import { ExternalLink, FileText, Gauge, Globe, MapPin, ShieldCheck, Users } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { SectionHead } from "@/components/ui";

const iconFor = (label: string) =>
  label.startsWith("Website") ? Globe : label.startsWith("Google profile") ? MapPin : label.startsWith("Competitor") ? Users : label.includes("PageSpeed") ? Gauge : FileText;

export function Sources({ a }: { a: Analysis }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <section>
        <SectionHead title="Sources" description={`Everything this analysis rests on, read ${new Date(a.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`} />
        <ul className="panel divide-y divide-line">
          {a.sources.map((s, i) => {
            const Icon = iconFor(s.label);
            return (
              <li key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                <Icon className="size-4 shrink-0 text-subtle" />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-[13px] text-muted hover:text-fg">Open <ExternalLink className="size-3" /></a>}
              </li>
            );
          })}
        </ul>
      </section>
      <div className="panel flex gap-3 p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-good" />
        <p className="leading-relaxed text-fg-2">
          Maven only uses what it can read: your public website, Google&apos;s public business data and Google PageSpeed, plus anything you told us. Numbers are never estimated from industry averages. Anything it couldn&apos;t see is marked unknown.
        </p>
      </div>
    </div>
  );
}

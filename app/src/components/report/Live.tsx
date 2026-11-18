"use client";
import { useEffect, useState } from "react";
import { CircleCheck, CircleDashed, CircleX, Loader2, MinusCircle, Smartphone } from "lucide-react";
import type { Analysis, Step } from "@/lib/types";
import { Badge, SiteIcon, cn } from "@/components/ui";
import { domainOf } from "./shared";

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
const mmss = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function StepIcon({ status }: { status: Step["status"] }) {
  if (status === "running") return <Loader2 className="size-[18px] animate-spin-slow text-brand" />;
  if (status === "done") return <CircleCheck className="size-[18px] text-good" />;
  if (status === "failed") return <CircleX className="size-[18px] text-bad" />;
  if (status === "skipped") return <MinusCircle className="size-[18px] text-subtle" />;
  return <CircleDashed className="size-[18px] text-line-strong" />;
}

export function Live({ a }: { a: Analysis }) {
  const now = useNow();
  const finished = a.steps.filter((s) => ["done", "skipped", "failed"].includes(s.status)).length;
  const pct = Math.round((finished / a.steps.length) * 100);
  const feed = a.steps
    .flatMap((s) => s.highlights.map((h, i) => ({ key: `${s.id}-${i}`, step: s.label, text: h, at: s.finishedAt ?? s.startedAt ?? a.createdAt })))
    .reverse()
    .slice(0, 7);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <SiteIcon url={a.input.url} size={44} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">Analyzing {a.input.businessName}</h1>
              <Badge tone="brand"><span className="pulse-dot size-1.5 rounded-full bg-current" />Live</Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted">{a.input.location} · {domainOf(a.input.url)}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="tabular text-xl font-semibold">{mmss(now - new Date(a.createdAt).getTime())}</div>
          <div className="text-[13px] text-muted">usually about 2 minutes</div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-subtle" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Analysis progress">
          <div className="h-full rounded-full bg-brand transition-[width] duration-700" style={{ width: `${Math.max(3, pct)}%` }} />
        </div>
        <span className="tabular w-24 text-right text-[13px] text-muted">{finished} of {a.steps.length} checks</span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ol className="panel relative overflow-hidden">
          {a.steps.map((s, i) => (
            <li key={s.id} className={cn("relative flex gap-3.5 px-5 py-4", i > 0 && "border-t border-line", s.status === "pending" && "opacity-55")}>
              <div className="pt-px"><StepIcon status={s.status} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("text-sm font-medium", s.status === "running" && "text-fg")}>{s.label}</span>
                  <span className="tabular shrink-0 text-[12px] text-subtle">
                    {s.status === "running" && s.startedAt ? mmss(now - new Date(s.startedAt).getTime()) : s.finishedAt && s.startedAt ? `${Math.max(1, Math.round((new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime()) / 1000))}s` : s.status === "pending" ? "Queued" : ""}
                  </span>
                </div>
                {s.highlights.length > 0 && (
                  <ul className="mt-2 grid gap-1">
                    {s.highlights.map((h, j) => <li key={j} className="fade-up text-[13px] leading-relaxed text-muted">{h}</li>)}
                  </ul>
                )}
                {s.note && <p className="mt-1.5 text-[13px] text-subtle">{s.note}</p>}
              </div>
            </li>
          ))}
        </ol>

        <aside className="grid content-start gap-4 lg:sticky lg:top-20">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Your site on a phone</span>
              <Smartphone className="size-4 text-subtle" />
            </div>
            <div className="mx-auto mt-4 w-[176px] overflow-hidden rounded-[28px] border-[5px] border-fg bg-bg-subtle" style={{ aspectRatio: "9 / 19" }}>
              {a.data.phone?.screenshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.data.phone.screenshot} alt="Phone render of the homepage" className="fade-up h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full flex-col gap-2 p-3">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-4/5" />
                  <div className="skeleton mt-2 h-8 w-full" />
                </div>
              )}
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><span className="text-sm font-semibold">Live findings</span></div>
            {feed.length ? (
              <ul className="divide-y divide-line">
                {feed.map((f) => (
                  <li key={f.key} className="fade-up px-4 py-3">
                    <div className="text-[12px] text-subtle">{f.step}</div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-fg-2">{f.text}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-[13px] text-muted">Findings appear here as each check finishes.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

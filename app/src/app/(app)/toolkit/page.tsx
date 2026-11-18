"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Wand2 } from "lucide-react";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { ButtonLink, EmptyState, SiteIcon, cn } from "@/components/ui";
import { ToolCard } from "@/components/report/Toolkit";

interface Biz { id: string; businessName: string; url: string; location: string; status: string }

export default function ToolkitPage() {
  const [biz, setBiz] = useState<Biz[] | null>(null);
  const [sel, setSel] = useState<string>("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    fetch("/api/analyses", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const seen = new Set<string>();
        const list = ((d.analyses ?? []) as Biz[]).filter((a) => {
          const k = a.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
          if (a.status !== "done" || seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        setBiz(list);
        setSel(list[0]?.id ?? "");
      })
      .catch(() => setBiz([]));
  }, []);

  const tools = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TOOLS.filter((x) => (cat === "all" || x.category === cat) && (!t || `${x.name} ${x.description}`.toLowerCase().includes(t)));
  }, [q, cat]);
  const current = biz?.find((b) => b.id === sel);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px]">Toolkit</h1>
          <p className="mt-1 text-sm text-muted">{TOOLS.length} tools that do the work: posts, replies, pages, ads, emails and plans, written for your business.</p>
        </div>
      </div>

      {biz && biz.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Wand2} title="Analyze a business first" action={<ButtonLink href="/start" variant="primary">Analyze a business</ButtonLink>}>
            Every tool writes for a specific business, using what Maven learned about it. Run your first analysis to unlock the Toolkit.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="panel mt-6 flex flex-wrap items-center gap-3 p-3">
            <span className="pl-1 text-[13px] font-medium text-muted">Working on</span>
            {biz === null ? (
              <div className="skeleton h-9 w-64" />
            ) : (
              <label className="relative flex min-w-[240px] flex-1 items-center sm:flex-none">
                <span className="sr-only">Business</span>
                {current && <span className="pointer-events-none absolute left-2.5"><SiteIcon url={current.url} size={20} className="rounded" /></span>}
                <select className="input h-9 appearance-none pl-10 pr-8 text-sm" value={sel} onChange={(e) => setSel(e.target.value)}>
                  {biz.map((b) => <option key={b.id} value={b.id}>{b.businessName} · {b.location}</option>)}
                </select>
              </label>
            )}
            <label className="relative ml-auto w-full sm:w-64">
              <span className="sr-only">Search tools</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <input className="input h-9 pl-9 text-sm" placeholder="Search tools" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Categories">
            {[{ id: "all", name: "All" }, ...CATEGORIES].map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)} className={cn("h-8 rounded-full border px-3 text-[13px] font-medium transition-colors", cat === c.id ? "border-fg bg-fg text-bg" : "border-line bg-surface text-fg-2 hover:border-line-strong")}>
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-10">
            {CATEGORIES.filter((c) => tools.some((t) => t.category === c.id)).map((c) => (
              <section key={c.id}>
                <div className="mb-3 flex items-baseline gap-2"><h2 className="text-sm font-semibold">{c.name}</h2><span className="text-[13px] text-muted">{c.blurb}</span></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.filter((t) => t.category === c.id).map((t) => <ToolCard key={t.id} tool={t} href={sel ? `/a/${sel}/tools/${t.id}` : "/start"} />)}
                </div>
              </section>
            ))}
            {tools.length === 0 && <p className="py-10 text-center text-sm text-muted">No tools match “{q}”.</p>}
          </div>
        </>
      )}
    </div>
  );
}

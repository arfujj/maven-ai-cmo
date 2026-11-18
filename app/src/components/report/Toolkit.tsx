"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileText, Sparkles, Trash2 } from "lucide-react";
import type { AnalysisView } from "@/lib/types";
import { CATEGORIES, TOOLS, TOOL_BY_ID, toolForSkill, type Tool } from "@/lib/tools";
import { Badge, SectionHead, cn } from "@/components/ui";
import { Locked } from "./Locked";
import { ToolIcon } from "@/components/toolkit/ToolIcon";

export function ToolCard({ tool, href, highlight }: { tool: Tool; href: string; highlight?: string }) {
  return (
    <Link href={href} className="group panel flex flex-col p-4 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface-2"><ToolIcon id={tool.id} className="size-4 text-fg-2" /></span>
        {highlight ? <Badge tone="brand">{highlight}</Badge> : <span className="text-[12px] text-subtle">{tool.minutes}</span>}
      </div>
      <div className="mt-3 text-sm font-semibold">{tool.name}</div>
      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{tool.description}</p>
      <div className="mt-auto flex items-center gap-1 pt-3 text-[13px] font-medium text-fg-2 group-hover:text-fg">Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></div>
    </Link>
  );
}

export function BusinessToolkit({ a }: { a: AnalysisView }) {
  const [items, setItems] = useState(a.deliverables ?? []);
  if (a.access && !a.access.tools) return <Locked title="The Toolkit is part of a paid plan" text="26 tools that do the work for you: Google posts, review replies, town pages, ads, emails and more, all written for this business." />;

  const fromFixes = (a.data.diagnosis?.topFixes ?? []).map((f) => toolForSkill(f.skill)).filter(Boolean) as Tool[];
  const fromPlan = (a.data.plan?.bets ?? []).map((b) => toolForSkill(b.skill)).filter(Boolean) as Tool[];
  const recommended = [...new Map([...fromFixes, ...fromPlan].map((t) => [t.id, t])).values()].slice(0, 6);
  const base = `/a/${a.id}/tools`;

  async function remove(id: string) {
    setItems((x) => x.filter((d) => d.id !== id));
    await fetch(`/api/analyses/${a.id}/deliverables/${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="grid grid-cols-1 gap-10">
      {recommended.length > 0 && (
        <section>
          <SectionHead title="Recommended for this business" description="Tools that do the work behind your top fixes and plan." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((t, i) => <ToolCard key={t.id} tool={t} href={`${base}/${t.id}`} highlight={i < fromFixes.length ? "Top fix" : "In your plan"} />)}
          </div>
        </section>
      )}

      <section>
        <SectionHead title="Saved work" description="Everything the Toolkit has made for this business." />
        {items.length ? (
          <ul className="panel divide-y divide-line">
            {items.map((d) => {
              const tool = TOOL_BY_ID[d.toolId];
              return (
                <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2"><ToolIcon id={d.toolId} className="size-3.5 text-muted" /></span>
                  <Link href={`${base}/${d.toolId}?d=${d.id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium hover:underline">{d.title}</span>
                    <span className="block text-[13px] text-muted">{tool?.name ?? d.toolId} · {new Date(d.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </Link>
                  <button type="button" onClick={() => remove(d.id)} className="flex size-8 items-center justify-center rounded-md text-subtle hover:bg-bg-subtle hover:text-bad" aria-label={`Delete ${d.title}`}><Trash2 className="size-4" /></button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-5 text-sm text-muted">
            <FileText className="size-4" /> Nothing yet. Run a tool and the result is saved here.
          </div>
        )}
      </section>

      <section>
        <SectionHead title="All tools" description={`${TOOLS.length} tools, each built on one of Maven's marketing skills.`} />
        <div className="grid grid-cols-1 gap-8">
          {CATEGORIES.map((c) => (
            <div key={c.id}>
              <div className="mb-3 flex items-baseline gap-2"><h3 className="text-sm font-semibold">{c.name}</h3><span className="text-[13px] text-muted">{c.blurb}</span></div>
              <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3")}>
                {TOOLS.filter((t) => t.category === c.id).map((t) => <ToolCard key={t.id} tool={t} href={`${base}/${t.id}`} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
      <p className="flex items-center gap-1.5 text-[13px] text-subtle"><Sparkles className="size-3.5" /> Tools draft the work. Nothing is posted, sent or spent.</p>
    </div>
  );
}

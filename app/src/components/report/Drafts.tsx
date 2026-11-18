"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Inbox, Megaphone, MessageSquare, PenLine, Phone, Smartphone, Star, Undo2 } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { Badge, Button, CopyButton, EmptyState, cn } from "@/components/ui";
import { useProgress } from "./progress";

const KIND: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  "first-screen": { label: "Homepage first screen", icon: Smartphone },
  "google-post": { label: "Google post", icon: Megaphone },
  "review-request": { label: "Review request", icon: Star },
  "review-reply": { label: "Review reply", icon: MessageSquare },
  ad: { label: "Search ad", icon: Megaphone },
  "follow-up": { label: "Follow-up text", icon: Phone },
};

export function Drafts({ a }: { a: Analysis }) {
  const drafts = useMemo(() => a.data.plan?.drafts ?? [], [a.data.plan]);
  const prog = useProgress();
  const approved = { items: prog.progress.drafts, has: (k: string) => prog.has("drafts", k), toggle: (k: string) => prog.toggle("drafts", k) };
  const edits = { map: prog.progress.edits, set: (k: string, v: string | null) => prog.setEdit(k, v) };
  const [sel, setSel] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const d = drafts[sel];
  const body = d ? edits.map[String(sel)] ?? d.body : "";
  useEffect(() => {
    const t = taRef.current;
    if (t) {
      t.style.height = "auto";
      t.style.height = `${t.scrollHeight + 2}px`;
    }
  }, [body, sel]);

  if (!drafts.length) return <EmptyState icon={Inbox} title="No drafts in this run">Drafts are written alongside the 90-day plan.</EmptyState>;
  const kind = KIND[d.kind] ?? { label: d.kind, icon: PenLine };
  const isApproved = approved.has(String(sel));
  const edited = edits.map[String(sel)] != null;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight">Drafts for your approval</h2>
          <p className="mt-0.5 text-sm text-muted">Written in your voice from your customers&apos; words. Edit anything. Nothing is posted or sent.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-bg-subtle"><div className="h-full rounded-full bg-good transition-all" style={{ width: `${(approved.items.length / drafts.length) * 100}%` }} /></div>
          <span className="tabular text-sm text-muted">{approved.items.length} of {drafts.length} approved</span>
        </div>
      </div>

      <div className="panel grid overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)]">
        <ul className="divide-y divide-line border-b border-line lg:border-b-0 lg:border-r" role="listbox" aria-label="Drafts">
          {drafts.map((x, i) => {
            const k = KIND[x.kind] ?? { label: x.kind, icon: PenLine };
            const Icon = k.icon;
            const ok = approved.has(String(i));
            return (
              <li key={i}>
                <button type="button" role="option" aria-selected={sel === i} onClick={() => setSel(i)} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors", sel === i ? "bg-surface-2" : "hover:bg-surface-2/60")}>
                  <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border", ok ? "border-good-border bg-good-soft text-good" : "border-line bg-surface text-muted")}>
                    {ok ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{x.title}</span>
                    <span className="block text-[13px] text-muted">{k.label}</span>
                  </span>
                  {sel === i && <span className="ml-auto mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex min-w-0 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge><kind.icon className="size-3" />{kind.label}</Badge>
            {isApproved && <Badge tone="good"><Check className="size-3" />Approved</Badge>}
            {edited && <Badge tone="brand">Edited</Badge>}
          </div>
          <h3 className="mt-3 text-[17px] font-semibold tracking-tight">{d.title}</h3>
          <label htmlFor={`draft-${sel}`} className="sr-only">Draft text</label>
          <textarea
            id={`draft-${sel}`}
            ref={taRef}
            value={body}
            onChange={(e) => edits.set(String(sel), e.target.value === d.body ? null : e.target.value)}
            className="mt-4 min-h-[140px] w-full resize-none rounded-lg border border-line bg-surface-2 p-4 text-[15px] leading-relaxed text-fg outline-none transition-[border-color,box-shadow] focus:border-brand focus:shadow-[0_0_0_3px_var(--ring)]"
            spellCheck
          />
          <p className="mt-3 text-sm leading-relaxed text-muted">{d.note}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button variant={isApproved ? "secondary" : "primary"} size="md" onClick={() => approved.toggle(String(sel))}>
              {isApproved ? <><Undo2 className="size-4" /> Undo approval</> : <><Check className="size-4" /> Approve</>}
            </Button>
            <CopyButton text={body} size="md" />
            {edited && <Button variant="ghost" onClick={() => edits.set(String(sel), null)}>Reset to original</Button>}
            <span className="ml-auto text-[13px] text-subtle">{sel + 1} / {drafts.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

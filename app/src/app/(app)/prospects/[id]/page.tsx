"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ExternalLink, Loader2, Mail, Phone, Star } from "lucide-react";
import type { Prospect, ProspectList } from "@/lib/types";
import { Badge, Button, ButtonLink, CopyButton, EmptyState, SiteIcon, cn, toneVar } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

const oppTone = (n: number) => (n >= 50 ? "bad" : n >= 25 ? "warn" : "neutral") as "bad" | "warn" | "neutral";

function Row({ p, rank, listId }: { p: Prospect; rank: number; listId: string }) {
  const [open, setOpen] = useState(false);
  const [pitch, setPitch] = useState(p.pitch ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const startHref = `/start?${new URLSearchParams({ ...(p.website ? { url: p.website } : {}), name: p.name, loc: p.address?.split(",").slice(-3, -1).join(",").trim() ?? "" })}`;

  async function write() {
    setBusy(true);
    setError("");
    setOpen(true);
    try {
      const r = await fetch(`/api/prospects/${listId}/pitch`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prospectId: p.id }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Couldn't write the pitch");
      setPitch(d.pitch);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't write the pitch");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 md:grid-cols-[32px_minmax(0,2fr)_120px_minmax(0,2fr)_auto]">
        <span className="tabular hidden text-sm font-semibold text-subtle md:block">{rank}</span>
        <div className="flex min-w-0 items-center gap-3">
          {p.website ? <SiteIcon url={p.website} size={32} /> : <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-line-strong text-[10px] text-subtle">none</span>}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{p.name}</div>
            <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
              <span className="inline-flex items-center gap-0.5">{p.rating?.toFixed(1) ?? "—"}<Star className="size-3 fill-current text-warn" /></span>
              <span>{(p.reviewCount ?? 0).toLocaleString()} reviews</span>
              {p.phone && <span className="hidden items-center gap-1 lg:inline-flex"><Phone className="size-3" />{p.phone}</span>}
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full" style={{ width: `${p.opportunity}%`, background: toneVar(oppTone(p.opportunity)) }} /></div>
          <span className="tabular text-sm font-semibold" style={{ color: toneVar(oppTone(p.opportunity)) }}>{p.opportunity}</span>
        </div>
        <div className="hidden min-w-0 flex-wrap gap-1 md:flex">
          {p.reasons.slice(0, 3).map((r) => <Badge key={r} tone={oppTone(p.opportunity) === "neutral" ? "neutral" : oppTone(p.opportunity)} className="max-w-full truncate">{r}</Badge>)}
          {p.reasons.length === 0 && <span className="text-[13px] text-subtle">Looks healthy</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => (pitch ? setOpen(!open) : write())} loading={busy}>{!busy && <Mail className="size-3.5" />}{pitch ? "Pitch" : "Write pitch"}</Button>
          <ButtonLink size="sm" variant="ghost" href={startHref} className="hidden sm:inline-flex">Analyze</ButtonLink>
          <button type="button" onClick={() => setOpen(!open)} className="flex size-8 items-center justify-center rounded-md text-subtle hover:bg-bg-subtle" aria-label="Details" aria-expanded={open}><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
        </div>
      </div>
      {open && (
        <div className="fade-up grid gap-5 border-t border-line bg-surface-2 px-4 py-5 md:grid-cols-[260px_minmax(0,1fr)] md:pl-16">
          <div className="grid content-start gap-3 text-[13px]">
            <div>
              <div className="overline">Why they're a prospect</div>
              <ul className="mt-2 grid gap-1.5">{p.reasons.length ? p.reasons.map((r) => <li key={r} className="text-fg-2">• {r}</li>) : <li className="text-muted">No obvious gaps from public data.</li>}</ul>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {p.mapsUrl && <a href={p.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">Google profile <ExternalLink className="size-3" /></a>}
              {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">Website <ExternalLink className="size-3" /></a>}
            </div>
            <ButtonLink size="sm" variant="primary" href={startHref} className="w-fit">Run a full analysis</ButtonLink>
          </div>
          <div className="min-w-0 rounded-lg border border-line bg-surface p-5">
            {busy ? (
              <div className="flex items-center gap-2 text-sm text-muted"><Loader2 className="size-4 animate-spin-slow" /> Writing a pitch about the one thing that's costing them most…</div>
            ) : pitch ? (
              <>
                <div className="mb-3 flex justify-end gap-2"><CopyButton text={pitch} /><Button size="sm" variant="ghost" onClick={write}>Rewrite</Button></div>
                <Markdown>{pitch}</Markdown>
              </>
            ) : (
              <div className="text-sm text-muted">
                {error ? <span className="text-bad">{error}</span> : "Write a short cold email about the single most costly thing that's broken, with evidence they can check."}
                <div className="mt-3"><Button size="sm" variant="primary" onClick={write}><Mail className="size-3.5" /> Write pitch</Button></div>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export default function ProspectList({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [list, setList] = useState<ProspectList | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let stop = false;
    let t: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const r = await fetch(`/api/prospects/${id}`, { cache: "no-store" }).catch(() => null);
      if (!r || stop) return;
      if (r.status === 404) return setMissing(true);
      const d: ProspectList = await r.json();
      setList(d);
      if (d.status === "running") t = setTimeout(poll, 2000);
    };
    void poll();
    return () => {
      stop = true;
      clearTimeout(t);
    };
  }, [id]);

  if (missing) return <div className="mx-auto max-w-xl px-4 py-24"><EmptyState icon={Mail} title="Search not found" action={<ButtonLink href="/prospects" variant="primary">Back to Find clients</ButtonLink>} /></div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-[13px] text-muted" aria-label="Breadcrumb">
        <Link href="/prospects" className="hover:text-fg">Find clients</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-fg-2">{list ? `${list.trade} in ${list.town}` : "…"}</span>
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px]">{list ? `${list.trade} in ${list.town}` : "Loading"}</h1>
          <p className="mt-1 text-sm text-muted">Ranked by how many customers each business is likely losing, from public signals only.</p>
        </div>
        {list?.status === "done" && <Badge>{list.prospects.length} businesses</Badge>}
      </div>

      {!list || list.status === "running" ? (
        <div className="panel mt-6 p-6">
          <div className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin-slow text-brand" /> Finding businesses and checking each website…</div>
          <div className="mt-5 grid gap-2.5">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12" />)}</div>
        </div>
      ) : list.status === "failed" ? (
        <div className="mt-6"><EmptyState icon={Mail} title="The search didn't finish" action={<ButtonLink href="/prospects" variant="primary">Try again</ButtonLink>}>{list.error}</EmptyState></div>
      ) : list.prospects.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Mail} title="No businesses found">Try a broader trade or a bigger town.</EmptyState></div>
      ) : (
        <div className="panel mt-6 overflow-hidden">
          <div className="hidden grid-cols-[32px_minmax(0,2fr)_120px_minmax(0,2fr)_auto] gap-4 border-b border-line bg-surface-2 px-4 py-2 text-[12px] font-medium text-muted md:grid">
            <span>#</span><span>Business</span><span>Opportunity</span><span>What's broken</span><span className="w-[220px]" />
          </div>
          <ul className="divide-y divide-line">{list.prospects.map((p, i) => <Row key={p.id} p={p} rank={i + 1} listId={list.id} />)}</ul>
        </div>
      )}
    </div>
  );
}

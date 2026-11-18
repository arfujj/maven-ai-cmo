"use client";
import { Suspense, use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Download, FileQuestion, Printer, RotateCw, Sparkles, Wand2 } from "lucide-react";
import type { AnalysisView, Deliverable } from "@/lib/types";
import { CATEGORIES, TOOL_BY_ID } from "@/lib/tools";
import { Badge, Button, ButtonLink, CopyButton, EmptyState, SiteIcon, cn } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { ToolIcon } from "@/components/toolkit/ToolIcon";
import { Locked } from "@/components/report/Locked";

const STAGES = ["Reading your analysis", "Loading the skill playbook", "Writing the first draft", "Checking it against the quality bar", "Finishing up"];

function Working() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const stage = Math.min(STAGES.length - 1, Math.floor(t / 12));
  return (
    <div className="panel p-8" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><Sparkles className="size-5" /></span>
        <div>
          <div className="text-sm font-semibold">Maven is working on it</div>
          <div className="text-[13px] text-muted">{STAGES[stage]}… <span className="tabular">{t}s</span></div>
        </div>
      </div>
      <div className="mt-6 grid gap-2.5">
        {[92, 100, 76, 88, 64, 95, 40].map((w, i) => <div key={i} className="skeleton h-3.5" style={{ width: `${w}%` }} />)}
      </div>
      <p className="mt-6 text-[13px] text-subtle">Most tools take 30 to 90 seconds. You can leave this page; the result is saved to the business.</p>
    </div>
  );
}

function ToolPage({ id, toolId }: { id: string; toolId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const tool = TOOL_BY_ID[toolId];
  const [a, setA] = useState<AnalysisView | null>(null);
  const [missing, setMissing] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Deliverable | null>(null);

  useEffect(() => {
    fetch(`/api/analyses/${id}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? setA(await r.json()) : setMissing(true)))
      .catch(() => setMissing(true));
  }, [id]);

  const earlier = useMemo(() => (a?.deliverables ?? []).filter((d) => d.toolId === toolId), [a, toolId]);
  useEffect(() => {
    const d = params.get("d");
    if (d && a) {
      const found = (a.deliverables ?? []).find((x) => x.id === d);
      if (found) {
        setResult(found);
        setInputs(found.inputs);
      }
    }
  }, [params, a]);
  useEffect(() => {
    if (tool) setInputs((x) => Object.fromEntries(tool.inputs.map((i) => [i.name, x[i.name] ?? (i.type === "select" ? i.options?.[0] ?? "" : "")])));
  }, [tool]);

  if (!tool || missing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <EmptyState icon={FileQuestion} title="Tool not found" action={<ButtonLink href="/toolkit" variant="primary">Open the Toolkit</ButtonLink>} />
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === tool.category);
  const canRun = tool.inputs.every((i) => i.optional || (inputs[i.name] ?? "").trim());

  async function run() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch(`/api/analyses/${id}/tools`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ toolId, inputs }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "The tool failed");
      setResult(d.deliverable);
      setA((x) => (x ? { ...x, deliverables: [d.deliverable, ...(x.deliverables ?? [])] } : x));
      router.replace(`/a/${id}/tools/${toolId}?d=${d.deliverable.id}`, { scroll: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The tool failed");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="no-print flex flex-wrap items-center gap-1 text-[13px] text-muted" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:text-fg">Businesses</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/a/${id}#toolkit`} className="max-w-[220px] truncate hover:text-fg">{a?.input.businessName ?? "…"}</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-fg-2">{tool.name}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface shadow-xs"><ToolIcon id={tool.id} className="size-5 text-fg-2" /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="display text-[26px]">{tool.name}</h1>
              {cat && <Badge>{cat.name}</Badge>}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted">{tool.description}</p>
          </div>
        </div>
        {a && (
          <Link href={`/a/${id}#toolkit`} className="no-print flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-xs hover:border-line-strong">
            <SiteIcon url={a.input.url} size={20} className="rounded" />
            <span className="max-w-[180px] truncate">{a.input.businessName}</span>
          </Link>
        )}
      </div>

      {a?.access && !a.access.tools ? (
        <div className="mt-8"><Locked title="The Toolkit is part of a paid plan" text="Upgrade to run this tool for your business. It writes the finished work, ready to approve." /></div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="no-print grid h-fit grid-cols-1 gap-4">
            <form
              className="panel"
              onSubmit={(e) => {
                e.preventDefault();
                if (canRun && !busy) void run();
              }}
            >
              <div className="panel-head"><span className="text-sm font-semibold">Details</span><span className="text-[12px] text-subtle">{tool.minutes}</span></div>
              <div className="grid gap-4 p-4">
                {tool.inputs.length === 0 && <p className="text-[13px] leading-relaxed text-muted">No details needed. Maven uses everything it already knows about this business.</p>}
                {tool.inputs.map((i) => (
                  <div key={i.name}>
                    <label htmlFor={`in-${i.name}`} className="label block">{i.label}{i.optional && <span className="font-normal text-subtle"> · optional</span>}</label>
                    {i.type === "textarea" ? (
                      <textarea id={`in-${i.name}`} rows={4} className="input mt-1.5 h-auto py-2.5 text-sm" placeholder={i.placeholder} value={inputs[i.name] ?? ""} onChange={(e) => setInputs({ ...inputs, [i.name]: e.target.value })} />
                    ) : i.type === "select" ? (
                      <select id={`in-${i.name}`} className="input mt-1.5 text-sm" value={inputs[i.name] ?? ""} onChange={(e) => setInputs({ ...inputs, [i.name]: e.target.value })}>
                        {i.options?.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input id={`in-${i.name}`} className="input mt-1.5 text-sm" placeholder={i.placeholder} value={inputs[i.name] ?? ""} onChange={(e) => setInputs({ ...inputs, [i.name]: e.target.value })} />
                    )}
                    {i.help && <p className="mt-1 text-[12px] leading-snug text-subtle">{i.help}</p>}
                  </div>
                ))}
                {error && <p className="rounded-lg border border-bad-border bg-bad-soft px-3 py-2 text-[13px] text-bad" role="alert">{error}</p>}
                <Button type="submit" variant="primary" className="w-full" disabled={!canRun || !a} loading={busy}>
                  {!busy && <Wand2 className="size-4" />}{busy ? "Writing" : result ? "Run again" : "Run tool"}
                </Button>
              </div>
            </form>
            <div className="panel p-4 text-[13px] text-muted">
              <div className="font-medium text-fg">You get</div>
              <p className="mt-1">{tool.produces}.</p>
              <p className="mt-3 text-[12px] text-subtle">Built on Maven&apos;s <span className="font-mono">{tool.skill}</span> skill and this business&apos;s analysis.</p>
            </div>
            {earlier.length > 0 && (
              <div className="panel">
                <div className="panel-head"><span className="text-sm font-semibold">Earlier runs</span></div>
                <ul className="divide-y divide-line">
                  {earlier.map((d) => (
                    <li key={d.id}>
                      <button type="button" onClick={() => { setResult(d); setInputs(d.inputs); router.replace(`/a/${id}/tools/${toolId}?d=${d.id}`, { scroll: false }); }} className={cn("block w-full px-4 py-2.5 text-left text-[13px] hover:bg-surface-2", result?.id === d.id && "bg-surface-2")}>
                        <span className="block truncate font-medium">{d.title}</span>
                        <span className="text-muted">{new Date(d.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <section className="min-w-0">
            {busy ? (
              <Working />
            ) : result ? (
              <div className="panel">
                <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <span className="text-[13px] text-muted">Saved {new Date(result.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={result.markdown} />
                    <Button size="sm" variant="secondary" onClick={download}><Download className="size-3.5" /> Download</Button>
                    <Button size="sm" variant="secondary" onClick={() => window.print()}><Printer className="size-3.5" /> Print</Button>
                    <Button size="sm" variant="secondary" onClick={run}><RotateCw className="size-3.5" /> Run again</Button>
                  </div>
                </div>
                <article className="px-6 py-7 sm:px-10 sm:py-9"><Markdown>{result.markdown}</Markdown></article>
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface shadow-xs"><ToolIcon id={tool.id} className="size-5 text-muted" /></span>
                <p className="mt-4 font-medium">Your {tool.name.toLowerCase()} will appear here</p>
                <p className="mt-1 max-w-sm text-sm text-muted">Fill in the details{tool.inputs.length ? "" : " (none needed)"} and run the tool. Results are saved to this business.</p>
              </div>
            )}
          </section>
        </div>
      )}
      <div className="no-print mt-8">
        <Link href={`/a/${id}#toolkit`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="size-3.5" /> Back to the Toolkit</Link>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ id: string; toolId: string }> }) {
  const { id, toolId } = use(params);
  return (
    <Suspense>
      <ToolPage id={id} toolId={toolId} />
    </Suspense>
  );
}

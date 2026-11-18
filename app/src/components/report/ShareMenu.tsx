"use client";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, Globe, Link2, Lock } from "lucide-react";
import { Button, CopyButton } from "@/components/ui";

export function ShareMenu({ id, initialToken }: { id: string; initialToken?: string }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(initialToken ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setToken(initialToken ?? null), [initialToken]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const link = token && typeof window !== "undefined" ? `${window.location.origin}/r/${token}` : "";

  async function set(enabled: boolean) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/analyses/${id}/share`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Couldn't change sharing");
      setToken(d.shareToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't change sharing");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Button size="md" variant={token ? "secondary" : "primary"} onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="dialog">
        {token ? <Globe className="size-4 text-good" /> : <Link2 className="size-4" />}
        Share
      </Button>
      {open && (
        <div role="dialog" aria-label="Share report" className="fade-up absolute right-0 z-40 mt-2 w-[340px] max-w-[calc(100vw-32px)] rounded-xl border border-line bg-surface p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-subtle">{token ? <Globe className="size-4 text-good" /> : <Lock className="size-4 text-muted" />}</span>
            <div>
              <div className="text-sm font-semibold">{token ? "Anyone with the link can view" : "Only you can see this report"}</div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">The shared page shows the score, fixes, competitors and phone check. Your plan, drafts and budget stay private.</p>
            </div>
          </div>
          {token ? (
            <>
              <div className="mt-4 flex gap-2">
                <input readOnly value={link} onFocus={(e) => e.target.select()} className="input h-9 font-mono text-xs" aria-label="Share link" />
                <CopyButton text={link} label="Copy" size="md" variant="primary" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg">Preview <ExternalLink className="size-3" /></a>
                <button type="button" onClick={() => set(false)} disabled={busy} className="text-[13px] font-medium text-bad hover:underline">Stop sharing</button>
              </div>
            </>
          ) : (
            <Button variant="brand" className="mt-4 w-full" onClick={() => set(true)} loading={busy}>Create public link</Button>
          )}
          {error && <p className="mt-2 text-[13px] text-bad">{error}</p>}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search, Target, Users } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { Locked } from "@/components/report/Locked";

interface ListRow { id: string; trade: string; town: string; status: string; createdAt: string; count: number; top: string | null }
const TRADES = ["Plumber", "HVAC", "Roofer", "Electrician", "Dentist", "Med spa", "Personal injury lawyer", "Landscaper", "Pest control", "Auto repair"];

export default function ProspectsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ListRow[] | null>(null);
  const [allowed, setAllowed] = useState(true);
  const [trade, setTrade] = useState("");
  const [town, setTown] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/prospects", { cache: "no-store" }).then((r) => r.json()).then((d) => { setLists(d.lists ?? []); setAllowed(d.allowed !== false); }).catch(() => setLists([]));
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/prospects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ trade, town }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Search failed");
      router.push(`/prospects/${d.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <div className="flex items-center gap-2"><h1 className="display text-[28px]">Find clients</h1><Badge tone="brand">Agency</Badge></div>
        <p className="mt-1 max-w-2xl text-sm text-muted">Pick a trade and a town. Maven ranks the local businesses losing the most customers, tells you why, and writes the pitch.</p>
      </div>

      {!allowed ? (
        <div className="mt-8"><Locked title="Find clients is part of the Agency plan" text="Search any trade in any town, see who's losing customers and why, and get a short pitch email for each one." /></div>
      ) : (
        <>
          <form onSubmit={search} className="panel mt-6 p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div>
                <label htmlFor="trade" className="label block">Trade</label>
                <div className="relative mt-1.5">
                  <Target className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                  <input id="trade" list="trades" className="input pl-9" placeholder="Plumber" value={trade} onChange={(e) => setTrade(e.target.value)} required />
                  <datalist id="trades">{TRADES.map((t) => <option key={t} value={t} />)}</datalist>
                </div>
              </div>
              <div>
                <label htmlFor="town" className="label block">Town</label>
                <div className="relative mt-1.5">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                  <input id="town" className="input pl-9" placeholder="Tampa, FL" value={town} onChange={(e) => setTown(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" variant="primary" className="h-10" loading={busy} disabled={!trade.trim() || !town.trim()}>{!busy && <Search className="size-4" />}Find businesses</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {TRADES.slice(0, 6).map((t) => (
                <button key={t} type="button" onClick={() => setTrade(t)} className="h-7 rounded-full border border-line px-2.5 text-[12px] text-fg-2 hover:border-line-strong">{t}</button>
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-bad">{error}</p>}
            <p className="mt-4 text-[12px] text-subtle">Uses public Google data and a quick check of each website. About 30 seconds for 20 businesses.</p>
          </form>

          <section className="mt-8">
            <h2 className="mb-3 text-[17px] font-semibold tracking-tight">Your searches</h2>
            {lists === null ? (
              <div className="skeleton h-24 rounded-xl" />
            ) : lists.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-6 text-sm text-muted"><Users className="size-4" /> No searches yet. Try your best trade in your own town.</div>
            ) : (
              <ul className="panel divide-y divide-line">
                {lists.map((l) => (
                  <li key={l.id}>
                    <Link href={`/prospects/${l.id}`} className="group flex items-center gap-4 px-4 py-3 hover:bg-surface-2">
                      <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface-2"><Users className="size-4 text-muted" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{l.trade} in {l.town}</div>
                        <div className="truncate text-[13px] text-muted">{l.status === "done" ? `${l.count} businesses${l.top ? ` · top prospect: ${l.top}` : ""}` : l.status === "failed" ? "Didn't finish" : "Searching…"}</div>
                      </div>
                      <span className="hidden text-[13px] text-muted sm:block">{new Date(l.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      <ArrowRight className="size-4 text-subtle group-hover:text-fg" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

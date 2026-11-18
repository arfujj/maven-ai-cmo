"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut, Menu, Plus, Settings, Users, Wand2, X } from "lucide-react";
import { Logo, SiteIcon, ThemeToggle, buttonClass, cn, scoreTone, toneVar } from "@/components/ui";

export interface RecentItem { id: string; businessName: string; url: string; score: number | null; status: string }

function Sidebar({ email, localMode, recent, onNavigate }: { email: string | null; localMode: boolean; recent: RecentItem[]; onNavigate?: () => void }) {
  const path = usePathname();
  const navItem = (href: string, label: string, Icon: typeof Building2, match: (p: string) => boolean = (p) => p === href) => {
    const active = match(path);
    return (
      <Link href={href} onClick={onNavigate} className={cn("flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors", active ? "bg-bg-subtle text-fg" : "text-fg-2 hover:bg-bg-subtle/70 hover:text-fg")}>
        <Icon className="size-4 text-muted" />
        {label}
      </Link>
    );
  };
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4"><Logo href="/dashboard" /></div>
      <div className="px-3">
        <Link href="/start" onClick={onNavigate} className={buttonClass("primary", "md", "w-full")}>
          <Plus className="size-4" /> New analysis
        </Link>
      </div>
      <nav className="mt-4 flex flex-col gap-0.5 px-3" aria-label="Main">
        {navItem("/dashboard", "Businesses", Building2, (p) => p === "/dashboard" || (p.startsWith("/a/") && !p.includes("/tools/")))}
        {navItem("/toolkit", "Toolkit", Wand2, (p) => p === "/toolkit" || p.includes("/tools/"))}
        {navItem("/prospects", "Find clients", Users, (p) => p.startsWith("/prospects"))}
        {navItem("/settings", "Settings", Settings, (p) => p.startsWith("/settings"))}
      </nav>
      {recent.length > 0 && (
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3">
          <div className="px-2.5 pb-1.5 text-xs font-medium text-subtle">Recent businesses</div>
          <ul className="flex flex-col gap-0.5">
            {recent.map((r) => {
              const active = path === `/a/${r.id}`;
              return (
                <li key={r.id}>
                  <Link href={`/a/${r.id}`} onClick={onNavigate} className={cn("flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors", active ? "bg-bg-subtle text-fg" : "text-fg-2 hover:bg-bg-subtle/70 hover:text-fg")}>
                    <SiteIcon url={r.url} size={18} className="rounded" />
                    <span className="min-w-0 flex-1 truncate">{r.businessName}</span>
                    {r.score != null ? (
                      <span className="tabular text-xs font-medium" style={{ color: toneVar(scoreTone(r.score)) }}>{r.score}</span>
                    ) : r.status === "running" || r.status === "queued" ? (
                      <span className="pulse-dot size-1.5 rounded-full bg-brand" aria-label="Running" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="mt-auto border-t border-line p-3">
        <div className="flex items-center justify-between gap-2 px-1 pb-3">
          <span className="text-xs font-medium text-subtle">Theme</span>
          <ThemeToggle />
        </div>
        {localMode ? (
          <div className="rounded-lg bg-bg-subtle px-3 py-2 text-xs text-muted">Local mode · no account</div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg px-1 py-1">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[13px] font-semibold uppercase text-brand">{email?.[0] ?? "?"}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-fg-2" title={email ?? ""}>{email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-bg-subtle hover:text-fg" aria-label="Sign out" title="Sign out">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children, email, localMode, recent }: { children: React.ReactNode; email: string | null; localMode: boolean; recent: RecentItem[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen lg:pl-[248px]">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-line bg-surface lg:block">
        <Sidebar email={email} localMode={localMode} recent={recent} />
      </aside>

      <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="flex size-9 items-center justify-center rounded-md text-fg-2 hover:bg-bg-subtle" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <Logo href="/dashboard" />
        <Link href="/start" className={buttonClass("primary", "sm")} aria-label="New analysis"><Plus className="size-4" /></Link>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="fade-up absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-line bg-surface shadow-lg">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-md text-muted hover:bg-bg-subtle" aria-label="Close menu"><X className="size-4" /></button>
            <Sidebar email={email} localMode={localMode} recent={recent} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0">{children}</main>
    </div>
  );
}

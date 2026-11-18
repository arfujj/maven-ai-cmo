"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, CircleCheck, CreditCard, Info, LogOut, Palette, User } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";
import { Badge, Button, ThemeToggle, cn } from "@/components/ui";

function Section({ id, icon: Icon, title, description, children }: { id: string; icon: typeof User; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-20 gap-5 border-b border-line py-8 last:border-0 md:grid-cols-[260px_minmax(0,1fr)]">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-muted" />{title}</div>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function View(p: { email: string | null; plan: PlanId; billingEnabled: boolean; hasSubscription: boolean; used: number; limit: number; localMode: boolean }) {
  const params = useSearchParams();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const status = params.get("billing");

  async function go(path: string, body?: object, key = path) {
    setBusy(key);
    setError("");
    try {
      const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}) });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error ?? "Something went wrong");
      window.location.href = d.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(null);
    }
  }

  const unlimited = !p.billingEnabled;
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="display text-[28px]">Settings</h1>
      {status === "success" && <p className="mt-4 flex items-center gap-2 rounded-lg border border-good-border bg-good-soft px-4 py-3 text-sm text-good"><CircleCheck className="size-4" /> You&apos;re subscribed. It can take a minute for the new plan to show.</p>}

      <Section id="account" icon={User} title="Account" description="How you sign in to Maven.">
        {p.localMode ? (
          <p className="text-sm text-muted">Local mode: no account. Connect Supabase to turn on sign-in.</p>
        ) : (
          <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold uppercase text-brand">{p.email?.[0] ?? "?"}</span>
              <div><div className="text-sm font-medium">{p.email}</div><div className="text-[13px] text-muted">Signed in with a magic link</div></div>
            </div>
            <form action="/auth/signout" method="post"><Button type="submit" variant="secondary" size="sm"><LogOut className="size-3.5" /> Sign out</Button></form>
          </div>
        )}
      </Section>

      <Section id="plan" icon={CreditCard} title="Plan & billing" description="What your plan includes and how much you've used this month.">
        {unlimited && (
          <p className="mb-4 flex gap-2 rounded-lg border border-line bg-surface-2 px-4 py-3 text-[13px] text-muted">
            <Info className="mt-0.5 size-4 shrink-0" /> Billing isn&apos;t connected, so every feature is unlocked. Add Stripe keys to turn on plans.
          </p>
        )}
        <div className="panel mb-5 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Analyses this month</span>
            <span className="tabular text-muted">{p.used}{unlimited ? "" : ` of ${p.limit}`}</span>
          </div>
          {!unlimited && <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (p.used / p.limit) * 100)}%` }} /></div>}
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const plan = PLANS[id];
            const current = !unlimited && p.plan === id;
            return (
              <div key={id} className={cn("panel flex flex-col p-5", current && "border-brand shadow-[0_0_0_3px_var(--ring)]", id === "pro" && !current && "border-line-strong")}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{plan.name}</span>
                  {current ? <Badge tone="brand">Current</Badge> : id === "pro" ? <Badge>Popular</Badge> : null}
                </div>
                <div className="mt-3 flex items-baseline gap-1"><span className="text-3xl font-semibold tracking-tight">${plan.price}</span><span className="text-sm text-muted">/month</span></div>
                <p className="mt-1 text-[13px] text-muted">{plan.tagline}</p>
                <ul className="mt-4 grid gap-2">{plan.features.map((f) => <li key={f} className="flex gap-2 text-[13px] text-fg-2"><Check className="mt-0.5 size-3.5 shrink-0 text-good" />{f}</li>)}</ul>
                <div className="mt-auto pt-5">
                  {current ? (
                    p.hasSubscription && id !== "free" ? <Button className="w-full" variant="secondary" loading={busy === "portal"} onClick={() => go("/api/billing/portal", {}, "portal")}>Manage billing</Button> : <Button className="w-full" variant="secondary" disabled>Your plan</Button>
                  ) : id === "free" ? (
                    p.hasSubscription ? <Button className="w-full" variant="ghost" loading={busy === "portal"} onClick={() => go("/api/billing/portal", {}, "portal")}>Downgrade</Button> : <Button className="w-full" variant="ghost" disabled>{unlimited ? "Billing off" : "Included"}</Button>
                  ) : (
                    <Button className="w-full" variant={id === "pro" ? "brand" : "primary"} disabled={unlimited} loading={busy === id} onClick={() => go("/api/billing/checkout", { plan: id }, id)}>
                      {unlimited ? "Billing off" : p.hasSubscription ? `Switch to ${plan.name}` : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {error && <p className="mt-3 text-sm text-bad">{error}</p>}
      </Section>

      <Section id="appearance" icon={Palette} title="Appearance" description="Light, dark, or follow your device.">
        <ThemeToggle />
      </Section>
    </div>
  );
}

export function SettingsView(p: Parameters<typeof View>[0]) {
  return (
    <Suspense>
      <View {...p} />
    </Suspense>
  );
}

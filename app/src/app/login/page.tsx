"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, CircleCheck, Mail } from "lucide-react";
import Link from "next/link";
import { Button, Logo, ScoreRing } from "@/components/ui";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_SIGNIN === "1";
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState(params.get("error") ?? "");
  const supabase = configured ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!) : null;
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` : undefined;

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setState("sending");
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) {
      setError(error.message);
      setState("idle");
    } else setState("sent");
  }
  async function google() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) setError(error.message);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg"><ArrowLeft className="size-3.5" /> Back to site</Link>
        </div>
        <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center py-12">
          {state === "sent" ? (
            <div className="fade-up text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-xl border border-line bg-surface shadow-sm"><Mail className="size-5 text-brand" /></span>
              <h1 className="display mt-5 text-[28px]">Check your email</h1>
              <p className="mt-2 text-sm text-muted">We sent a sign-in link to <span className="font-medium text-fg">{email}</span>. It expires in an hour.</p>
              <button type="button" onClick={() => setState("idle")} className="mt-6 text-sm font-medium text-brand hover:underline">Use a different email</button>
            </div>
          ) : (
            <>
              <h1 className="display text-[30px]">Sign in to Maven</h1>
              <p className="mt-1.5 text-sm text-muted">{configured ? "New here? Signing in creates your account." : "Sign-in turns on once Supabase is connected. The app runs in local mode until then."}</p>
              {configured && (
                <>
                  {googleEnabled && (
                    <>
                      <Button variant="secondary" size="lg" className="mt-8 w-full" onClick={google}><GoogleIcon /> Continue with Google</Button>
                      <div className="my-5 flex items-center gap-3 text-xs text-subtle"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
                    </>
                  )}
                  <form onSubmit={magic} className={googleEnabled ? "grid gap-3" : "mt-8 grid gap-3"}>
                    <label htmlFor="email" className="label">Work email</label>
                    <input id="email" type="email" required className="input h-11" placeholder="you@business.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                    <Button type="submit" variant="primary" size="lg" loading={state === "sending"} className="mt-1 w-full">Continue with email</Button>
                  </form>
                  <p className="mt-4 text-center text-xs text-subtle">We&apos;ll email you a magic link. No password needed.</p>
                </>
              )}
              {error && <p className="mt-4 rounded-lg border border-bad-border bg-bad-soft px-3 py-2 text-sm text-bad" role="alert">{error}</p>}
            </>
          )}
        </div>
        <p className="text-xs text-subtle">© {new Date().getFullYear()} Maven</p>
      </div>

      <div className="relative hidden overflow-hidden border-l border-line bg-bg-subtle lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative">
          <p className="text-[13px] font-medium text-brand">Your AI CMO</p>
          <h2 className="display mt-3 max-w-md text-[32px]">See exactly why customers pick your competitor, and what to fix first.</h2>
          <div className="panel mt-10 max-w-md p-5 shadow-lg">
            <div className="flex items-center gap-4">
              <ScoreRing score={64} size={64} stroke={6} label="Sample score" />
              <div>
                <div className="text-sm font-semibold">Hartline Plumbing</div>
                <div className="text-[13px] text-muted">Dallas, TX · sample report</div>
              </div>
            </div>
            <ul className="mt-5 grid gap-2.5 border-t border-line pt-4">
              {["Put the phone number on the first screen", "Answer every missed call with a text", "Ask for a review after every job"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-fg-2"><CircleCheck className="size-4 shrink-0 text-good" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

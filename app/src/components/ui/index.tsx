"use client";
import Link from "next/link";
import { forwardRef, useEffect, useState } from "react";
import { Check, Copy, Loader2, Monitor, Moon, Sun } from "lucide-react";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// ---------------- Button ----------------
type Variant = "primary" | "brand" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
const VARIANT: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:opacity-90 shadow-sm",
  brand: "bg-brand text-white hover:bg-brand-hover shadow-sm",
  secondary: "bg-surface text-fg border border-line hover:bg-surface-2 hover:border-line-strong shadow-xs",
  ghost: "text-fg-2 hover:bg-bg-subtle hover:text-fg",
  danger: "bg-surface text-bad border border-line hover:bg-bad-soft",
};
const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-sm gap-2 rounded-[10px]",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-xl",
};
export const buttonClass = (variant: Variant = "secondary", size: Size = "md", extra?: string) =>
  cn(
    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-[background,border-color,opacity,color] duration-150 disabled:pointer-events-none disabled:opacity-50 select-none",
    VARIANT[variant],
    SIZE[size],
    extra,
  );

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean };
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = "secondary", size = "md", loading, className, children, disabled, ...rest }, ref) {
  return (
    <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin-slow" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ href, variant = "secondary", size = "md", className, children, ...rest }: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

// ---------------- Badge ----------------
export type Tone = "neutral" | "brand" | "good" | "warn" | "bad";
const TONE: Record<Tone, string> = {
  neutral: "bg-bg-subtle text-fg-2 border-line",
  brand: "bg-brand-soft text-brand border-brand-border",
  good: "bg-good-soft text-good border-good-border",
  warn: "bg-warn-soft text-warn border-warn-border",
  bad: "bg-bad-soft text-bad border-bad-border",
};
export function Badge({ tone = "neutral", children, className, dot }: { tone?: Tone; children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex h-[22px] items-center gap-1.5 rounded-md border px-2 text-xs font-medium whitespace-nowrap", TONE[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export const STATUS_TONE = { strong: "good", watch: "warn", leak: "bad", unknown: "neutral" } as const;
export const STATUS_LABEL = { strong: "Strong", watch: "Needs work", leak: "Leaking", unknown: "Unknown" } as const;
export const toneVar = (t: Tone) => ({ neutral: "var(--subtle)", brand: "var(--brand)", good: "var(--good)", warn: "var(--warn)", bad: "var(--bad)" })[t];
export const scoreTone = (s: number | null | undefined, max = 100): Tone => (s == null ? "neutral" : s / max >= 0.7 ? "good" : s / max >= 0.45 ? "warn" : "bad");

// ---------------- Score ring ----------------
export function ScoreRing({ score, size = 96, stroke = 8, label }: { score: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = toneVar(scoreTone(score));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? "Score"} ${score} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-semibold tracking-tight" style={{ fontSize: size * 0.3 }}>{score}</span>
      </div>
    </div>
  );
}

// ---------------- Meter (thin bar) ----------------
export function Meter({ value, max = 10, tone, className }: { value: number | null; max?: number; tone?: Tone; className?: string }) {
  const t = tone ?? scoreTone(value, max);
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-line", className)}>
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${value == null ? 0 : Math.max(3, (value / max) * 100)}%`, background: toneVar(t) }} />
    </div>
  );
}

// ---------------- Logo ----------------
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <path d="M8.5 22V11.5l7.5 7 7.5-7V22" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function Logo({ href = "/", size = 24 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight text-fg" aria-label="Maven home">
      <LogoMark size={size} />
      <span className="text-[17px]">Maven</span>
    </Link>
  );
}

// ---------------- Favicon of a business ----------------
export function SiteIcon({ url, size = 32, className }: { url: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  let host = "";
  try {
    host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    host = url;
  }
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface", className)} style={{ width: size, height: size }}>
      {failed ? (
        <span className="text-xs font-semibold uppercase text-muted">{host.slice(0, 1)}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`} alt="" width={size * 0.55} height={size * 0.55} onError={() => setFailed(true)} />
      )}
    </span>
  );
}

// ---------------- Copy button ----------------
export function CopyButton({ text, label = "Copy", size = "sm", variant = "secondary" }: { text: string; label?: string; size?: Size; variant?: Variant }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size={size}
      variant={variant}
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked; text stays selectable */
        }
      }}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : label}
    </Button>
  );
}

// ---------------- Theme toggle ----------------
type ThemePref = "light" | "dark" | "system";
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>("dark");
  useEffect(() => {
    try {
      setPref((localStorage.getItem("maven-theme-v2") as ThemePref) || "dark");
    } catch {
      /* storage blocked */
    }
  }, []);
  const apply = (p: ThemePref) => {
    setPref(p);
    try {
      localStorage.setItem("maven-theme-v2", p);
    } catch {
      /* ignore */
    }
    const dark = p === "dark" || (p === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  };
  return { pref, apply };
}
export function ThemeToggle({ className }: { className?: string }) {
  const { pref, apply } = useTheme();
  const opts: [ThemePref, typeof Sun, string][] = [
    ["light", Sun, "Light"],
    ["system", Monitor, "System"],
    ["dark", Moon, "Dark"],
  ];
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5", className)} role="radiogroup" aria-label="Theme">
      {opts.map(([v, Icon, label]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={pref === v}
          aria-label={label}
          title={label}
          onClick={() => apply(v)}
          className={cn("inline-flex size-7 items-center justify-center rounded-md transition-colors", pref === v ? "bg-bg-subtle text-fg" : "text-muted hover:text-fg")}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

/** One-click light/dark switch for headers. */
export function ThemeSwitch({ className }: { className?: string }) {
  const [dark, setDark] = useState(true);
  useEffect(() => setDark(document.documentElement.dataset.theme !== "light"), []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("maven-theme-v2", next);
    } catch {
      /* ignore */
    }
  };
  return (
    <button type="button" onClick={flip} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"} className={cn("flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg-subtle hover:text-fg", className)}>
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

// ---------------- Empty state ----------------
export function EmptyState({ icon: Icon, title, children, action }: { icon: React.ComponentType<{ className?: string }>; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface shadow-xs">
        <Icon className="size-5 text-muted" />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------------- Section heading ----------------
export function SectionHead({ title, description, action }: { title: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

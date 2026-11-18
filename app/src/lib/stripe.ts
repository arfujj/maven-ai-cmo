import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { PlanId } from "./plans";

const KEY = () => process.env.STRIPE_SECRET_KEY || "";
export const PRICE_FOR: Partial<Record<PlanId, string | undefined>> = {
  pro: process.env.STRIPE_PRICE_PRO,
  agency: process.env.STRIPE_PRICE_AGENCY,
};

function form(obj: Record<string, string | number | undefined>, prefix = ""): string {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(prefix ? `${prefix}[${k}]` : k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

/** Minimal Stripe REST call (form-encoded), no SDK needed. */
export async function stripe<T = Record<string, unknown>>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY()}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form(params),
    signal: AbortSignal.timeout(20_000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Stripe error ${res.status}`);
  return data as T;
}

/** Verify a Stripe webhook signature header against the raw body. */
export function verifyStripeSignature(raw: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]).filter((p) => p.length === 2));
  const t = Number(parts.t);
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  return sigs.some((s) => s.length === expected.length && timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

/** Write the plan into the user's app_metadata (only the server can change it). */
export async function setUserPlan(userId: string, meta: { plan: PlanId; stripe_customer_id?: string; stripe_subscription_id?: string }) {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
  const { data } = await admin.auth.admin.getUserById(userId);
  const current = (data.user?.app_metadata ?? {}) as Record<string, unknown>;
  const { error } = await admin.auth.admin.updateUserById(userId, { app_metadata: { ...current, ...meta } });
  if (error) throw new Error(error.message);
}

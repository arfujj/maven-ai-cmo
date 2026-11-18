import "server-only";
import { PLANS, UNLIMITED, type PlanId, type PlanLimits } from "./plans";
import { authEnabled, supabaseServer } from "./supabase/server";
import { countAnalysesSince } from "./store";

export const billingEnabled = Boolean(process.env.STRIPE_SECRET_KEY && authEnabled);

export interface Account {
  userId: string | null;
  email: string | null;
  plan: PlanId;
  limits: PlanLimits;
  billingEnabled: boolean;
  stripeCustomerId: string | null;
  usage: { analysesThisMonth: number; periodStart: string };
}

const monthStart = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
};

/** The signed-in account with its plan, limits and usage. Plan lives in Supabase app_metadata (server-writable only). */
export async function getAccount(opts: { withUsage?: boolean } = {}): Promise<Account> {
  let userId: string | null = null;
  let email: string | null = null;
  let plan: PlanId = "free";
  let stripeCustomerId: string | null = null;
  if (authEnabled) {
    const { data } = await (await supabaseServer()).auth.getUser();
    userId = data.user?.id ?? null;
    email = data.user?.email ?? null;
    const meta = (data.user?.app_metadata ?? {}) as { plan?: PlanId; stripe_customer_id?: string };
    if (meta.plan && PLANS[meta.plan]) plan = meta.plan;
    stripeCustomerId = meta.stripe_customer_id ?? null;
  }
  const limits = billingEnabled ? PLANS[plan] : UNLIMITED;
  const periodStart = monthStart();
  const analysesThisMonth = opts.withUsage ? await countAnalysesSince(userId, periodStart).catch(() => 0) : 0;
  return { userId, email, plan, limits, billingEnabled, stripeCustomerId, usage: { analysesThisMonth, periodStart } };
}

export const upgradeMessage = (what: string) => `${what} is part of a paid plan. Upgrade in Settings → Plan & billing.`;

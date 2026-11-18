import { json } from "@/lib/api";
import { getAccount, billingEnabled } from "@/lib/account";
import { PRICE_FOR, stripe } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!billingEnabled) return json({ error: "Billing isn't connected yet." }, 400);
  const account = await getAccount();
  if (!account.userId) return json({ error: "Sign in first" }, 401);
  const { plan } = (await req.json().catch(() => ({}))) as { plan?: PlanId };
  const price = plan ? PRICE_FOR[plan] : undefined;
  if (!plan || !price) return json({ error: "That plan isn't available." }, 400);
  const origin = new URL(req.url).origin;
  const session = await stripe<{ url: string }>("checkout/sessions", {
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": 1,
    client_reference_id: account.userId,
    customer: account.stripeCustomerId ?? undefined,
    customer_email: account.stripeCustomerId ? undefined : account.email ?? undefined,
    "metadata[user_id]": account.userId,
    "metadata[plan]": plan,
    "subscription_data[metadata][user_id]": account.userId,
    "subscription_data[metadata][plan]": plan,
    allow_promotion_codes: "true",
    success_url: `${origin}/settings?billing=success`,
    cancel_url: `${origin}/settings?billing=cancelled`,
  });
  return json({ url: session.url });
}

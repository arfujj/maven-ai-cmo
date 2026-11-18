import { json } from "@/lib/api";
import { setUserPlan, verifyStripeSignature } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

type Obj = Record<string, unknown> & { metadata?: Record<string, string> };

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET || "")) {
    return json({ error: "Bad signature" }, 400);
  }
  const event = JSON.parse(raw) as { type: string; data: { object: Obj } };
  const o = event.data.object;
  try {
    if (event.type === "checkout.session.completed") {
      const userId = (o.client_reference_id as string) || o.metadata?.user_id;
      const plan = o.metadata?.plan as PlanId | undefined;
      if (userId && plan) await setUserPlan(userId, { plan, stripe_customer_id: o.customer as string, stripe_subscription_id: o.subscription as string });
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const userId = o.metadata?.user_id;
      const active = event.type === "customer.subscription.updated" && ["active", "trialing", "past_due"].includes(String(o.status));
      if (userId) await setUserPlan(userId, { plan: active ? ((o.metadata?.plan as PlanId) ?? "free") : "free", stripe_customer_id: o.customer as string });
    }
  } catch (err) {
    console.error("[maven] webhook handling failed", err);
    return json({ error: "Handler failed" }, 500);
  }
  return json({ received: true });
}

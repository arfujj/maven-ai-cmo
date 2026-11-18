import { json } from "@/lib/api";
import { getAccount, billingEnabled } from "@/lib/account";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!billingEnabled) return json({ error: "Billing isn't connected yet." }, 400);
  const account = await getAccount();
  if (!account.userId || !account.stripeCustomerId) return json({ error: "No subscription to manage yet." }, 400);
  const session = await stripe<{ url: string }>("billing_portal/sessions", { customer: account.stripeCustomerId, return_url: `${new URL(req.url).origin}/settings` });
  return json({ url: session.url });
}

import type { Metadata } from "next";
import { getAccount } from "@/lib/account";
import { authEnabled } from "@/lib/supabase/server";
import { SettingsView } from "./SettingsView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const account = await getAccount({ withUsage: true });
  return (
    <SettingsView
      email={account.email}
      plan={account.plan}
      billingEnabled={account.billingEnabled}
      hasSubscription={!!account.stripeCustomerId}
      used={account.usage.analysesThisMonth}
      limit={account.limits.analysesPerMonth}
      localMode={!authEnabled}
    />
  );
}

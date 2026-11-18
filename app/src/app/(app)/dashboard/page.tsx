import type { Metadata } from "next";
import { listAnalyses } from "@/lib/store";
import { currentUserId } from "@/lib/supabase/server";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Businesses" };

export default async function DashboardPage() {
  const items = await listAnalyses(await currentUserId());
  return <DashboardView items={items} />;
}

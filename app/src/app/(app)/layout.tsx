import { AppShell } from "@/components/app/AppShell";
import { listAnalyses } from "@/lib/store";
import { currentUser, authEnabled } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const items = await listAnalyses(user.id).catch(() => []);
  // One row per business: the newest analysis of each.
  const seen = new Set<string>();
  const recent = items
    .filter((a) => {
      const k = a.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 10)
    .map((a) => ({ id: a.id, businessName: a.businessName, url: a.url, score: a.score, status: a.status }));
  return (
    <AppShell email={user.email} localMode={!authEnabled} recent={recent}>
      {children}
    </AppShell>
  );
}

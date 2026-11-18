import "server-only";
import { NextResponse } from "next/server";
import { getAnalysis } from "./store";
import { getAccount, type Account } from "./account";
import { authEnabled } from "./supabase/server";
import type { Analysis } from "./types";
import type { PlanLimits } from "./plans";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Load an analysis the signed-in user owns, optionally requiring a plan feature. */
export async function ownedAnalysis(id: string, feature?: keyof PlanLimits): Promise<{ a: Analysis; account: Account } | NextResponse> {
  const account = await getAccount();
  if (authEnabled && !account.userId) return json({ error: "Sign in first" }, 401);
  const a = await getAnalysis(id);
  if (!a || (authEnabled && a.userId !== account.userId)) return json({ error: "Not found" }, 404);
  if (feature && !account.limits[feature]) return json({ error: "This is part of a paid plan. Upgrade in Settings → Plan & billing.", upgrade: true }, 402);
  return { a, account };
}

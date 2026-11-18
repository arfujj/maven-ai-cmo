import { json } from "@/lib/api";
import { getAccount } from "@/lib/account";
import { authEnabled } from "@/lib/supabase/server";
import { getProspects } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const account = await getAccount();
  const list = await getProspects((await ctx.params).id);
  if (!list || (authEnabled && list.userId !== account.userId)) return json({ error: "Not found" }, 404);
  return json(list);
}

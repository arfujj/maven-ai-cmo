import { json } from "@/lib/api";
import { getAccount } from "@/lib/account";
import { authEnabled } from "@/lib/supabase/server";
import { getProspects, saveProspects } from "@/lib/store";
import { writePitch } from "@/lib/toolRunner";

export const runtime = "nodejs";
export const maxDuration = 240;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const account = await getAccount();
  if (!account.limits.prospects) return json({ error: "Pitch emails are part of the Agency plan.", upgrade: true }, 402);
  const list = await getProspects((await ctx.params).id);
  if (!list || (authEnabled && list.userId !== account.userId)) return json({ error: "Not found" }, 404);
  const body = await req.json().catch(() => ({}));
  const p = list.prospects.find((x) => x.id === body.prospectId);
  if (!p) return json({ error: "Prospect not found" }, 404);
  try {
    const { text, costUsd } = await writePitch(p, list.trade, list.town, typeof body.sender === "string" ? body.sender.slice(0, 120) : "");
    p.pitch = text;
    list.costUsd = Math.round((list.costUsd + costUsd) * 1e6) / 1e6;
    await saveProspects(list);
    return json({ pitch: text });
  } catch {
    return json({ error: "Couldn't write the pitch just now. Try again." }, 502);
  }
}

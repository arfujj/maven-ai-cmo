import { NextResponse } from "next/server";
import { ownedAnalysis, json } from "@/lib/api";
import { chat, models } from "@/lib/llm";
import { buildEvidence } from "@/lib/pipeline";
import { TOOLS } from "@/lib/tools";

export const runtime = "nodejs";
export const maxDuration = 120;

const SYSTEM = `You are Maven, the AI CMO inside the Maven app, answering the owner's questions about one business's analysis.
Rules: use only the evidence, diagnosis and plan provided; if something isn't in them, say so plainly and say what would tell us. Never invent numbers, reviews or results. Plain words, short answers (under 180 words unless asked for a draft), no jargon, no em dashes. When a Toolkit tool would do the job, name it in bold, e.g. **Reply to your reviews**. Format with short paragraphs or bullets. Available tools: ${TOOLS.map((t) => t.name).join(", ")}.`;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const r = await ownedAnalysis((await ctx.params).id, "chat");
  if (r instanceof NextResponse) return r;
  const { a } = r;
  const body = await req.json().catch(() => ({}));
  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m: { role?: string; content?: unknown }) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10) as { role: string; content: string }[];
  if (!history.length || history[history.length - 1].role !== "user") return json({ error: "Ask a question" }, 400);
  const transcript = history.map((m) => `${m.role === "user" ? "OWNER" : "MAVEN"}: ${m.content.slice(0, 2000)}`).join("\n\n");
  try {
    const res = await chat({
      model: models.brain,
      system: SYSTEM,
      user: `${buildEvidence(a)}\n\nDIAGNOSIS:\n${JSON.stringify(a.data.diagnosis ?? null)}\n\nPLAN:\n${JSON.stringify(a.data.plan ? { target: a.data.plan.target, bets: a.data.plan.bets } : null)}\n\nCONVERSATION:\n${transcript}\n\nReply as MAVEN to the owner's last message.`,
      maxTokens: 6000,
      effort: "low",
      timeoutMs: 100_000,
    });
    return json({ reply: res.text.trim() });
  } catch {
    return json({ error: "Maven couldn't answer just now. Try again." }, 502);
  }
}

import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { chat, models } from "./llm";
import { buildEvidence } from "./pipeline";
import { TOOL_BY_ID, type Tool } from "./tools";
import type { Analysis, Deliverable, Prospect } from "./types";
import { STAGE_NAMES } from "./types";

const SKILLS_DIR = path.join(process.cwd(), "skills");
const skillCache = new Map<string, string>();

const stripFrontmatter = (s: string) => s.replace(/^---[\s\S]*?\n---\n/, "");

/** The skill's own instructions (SKILL.md + chosen references), trimmed to a sane size. */
export async function loadSkill(skill: string, refs: string[] = []): Promise<string> {
  const key = `${skill}|${refs.join(",")}`;
  if (skillCache.has(key)) return skillCache.get(key)!;
  const main = stripFrontmatter(await fs.readFile(path.join(SKILLS_DIR, skill, "SKILL.md"), "utf8")).slice(0, 32000);
  const extras = await Promise.all(
    refs.map(async (r) => {
      try {
        return `\n\n## Reference: ${r}\n\n${(await fs.readFile(path.join(SKILLS_DIR, skill, "references", r), "utf8")).slice(0, 14000)}`;
      } catch {
        return "";
      }
    }),
  );
  const text = main + extras.join("");
  skillCache.set(key, text);
  return text;
}

export const TOOL_RULES = `You are Maven, an AI chief marketing officer for local service businesses and the agencies that serve them. You are running one of your own skills for a client inside the Maven web app.

How to use the skill below:
- Follow its method, judgment and quality bar. It is your playbook.
- Ignore its instructions about files, folders, brand memory, scripts, subagents, routing to other skills, the plugin, scheduling or asking many questions. In the app, the evidence and the user's inputs below are everything you have, and you deliver in one reply.
- Where the skill would research the web, use the evidence instead and say what a live check would add.

Hard rules:
- Use only the evidence and inputs given. Never invent a number, rating, review, quote, price, award, license, guarantee or result. Where a real detail is needed and missing, write [add: what's needed].
- Quotes from reviews must be copied word for word.
- Plain words an owner understands. No jargon, no hype, no em dashes.
- Nothing is published, sent or spent; the owner approves everything.

Output: a finished deliverable in GitHub-flavored markdown, ready to use. Start with a level-1 heading naming the deliverable. Use short sections, tables where they help, and checklists for steps. End with a short "Before you use this" list only if something needs the owner's confirmation. No preamble, no sign-off.`;

function businessContext(a: Analysis): string {
  const d = a.data.diagnosis;
  const extra = {
    diagnosis: d
      ? {
          summary: d.summary,
          score: d.overallScore,
          biggestLeak: STAGE_NAMES[d.biggestLeak],
          stages: d.stages.map((s) => `${STAGE_NAMES[s.key]}: ${s.score ?? "?"}/10, ${s.headline}`),
          topFixes: d.topFixes.map((f) => f.title),
        }
      : "not available",
    plan: a.data.plan ? a.data.plan.bets.map((b) => `${b.weeks}: ${b.title}`) : "not available",
    googleReviews: (a.data.google?.reviews ?? []).map((r) => ({ author: r.author ?? "Customer", rating: r.rating, when: r.relativeTime, text: r.text })),
    competitorReviewsLowRated: (a.data.competitors ?? []).flatMap((c) => c.reviews.filter((r) => r.rating <= 3).map((r) => ({ competitor: c.name, rating: r.rating, text: r.text }))),
  };
  return `${buildEvidence(a)}\n\nMORE CONTEXT:\n${JSON.stringify(extra, null, 1)}`;
}

function inputsBlock(tool: Tool, inputs: Record<string, string>): string {
  const lines = tool.inputs.map((i) => `- ${i.label}: ${inputs[i.name]?.trim() || "(not given)"}`);
  return lines.length ? `USER INPUTS:\n${lines.join("\n")}` : "USER INPUTS: none";
}

export function deliverableTitle(tool: Tool, inputs: Record<string, string>): string {
  const q = inputs.town || inputs.service || inputs.topic || inputs.type || inputs.platform || inputs.month || inputs.offer || "";
  return q ? `${tool.name}: ${q.slice(0, 60)}` : tool.name;
}

export async function runTool(a: Analysis, toolId: string, rawInputs: Record<string, unknown>): Promise<Deliverable> {
  const tool = TOOL_BY_ID[toolId];
  if (!tool) throw new Error("Unknown tool");
  const inputs: Record<string, string> = {};
  for (const i of tool.inputs) {
    const v = typeof rawInputs[i.name] === "string" ? (rawInputs[i.name] as string).slice(0, 6000) : "";
    if (!i.optional && !v.trim()) throw new Error(`“${i.label}” is required`);
    if (i.type === "select" && v && i.options && !i.options.includes(v)) throw new Error(`Pick a valid option for “${i.label}”`);
    inputs[i.name] = v;
  }
  const skillText = await loadSkill(tool.skill, tool.refs);
  const res = await chat({
    model: models.brain,
    system: `${TOOL_RULES}\n\n=== SKILL: ${tool.skill} ===\n\n${skillText}`,
    user: `BUSINESS: ${a.input.businessName}, ${a.input.location} (${a.input.url})\n\n${businessContext(a)}\n\n${inputsBlock(tool, inputs)}\n\nTASK: ${tool.task}`,
    maxTokens: 24000,
    effort: "medium",
    timeoutMs: 280_000,
  });
  if (res.truncated && res.text.length < 200) throw new Error("The tool ran out of room before finishing. Try again.");
  return {
    id: randomUUID(),
    toolId,
    title: deliverableTitle(tool, inputs),
    inputs,
    markdown: res.text.trim(),
    createdAt: new Date().toISOString(),
    costUsd: res.costUsd,
  };
}

/** A short cold email to one prospect about the one thing that's broken (pitch-the-fix). */
export async function writePitch(p: Prospect, trade: string, town: string, sender: string): Promise<{ text: string; costUsd: number }> {
  const skillText = await loadSkill("pitch-the-fix", ["email-rubric.md", "fix-menu.md"]);
  const res = await chat({
    model: models.brain,
    system: `${TOOL_RULES}\n\n=== SKILL: pitch-the-fix ===\n\n${skillText}`,
    user: `PROSPECT (public data only):\n${JSON.stringify({ name: p.name, trade, town, rating: p.rating, reviews: p.reviewCount, website: p.website, siteReachable: p.siteReachable, tapToCallOnSite: p.siteHasTapToCall, https: p.siteHttps, hoursOnProfile: p.hasHours, photosOnProfile: p.photoCount >= 10 ? "10 or more" : p.photoCount, whatLooksBroken: p.reasons }, null, 1)}\n\nSENDER: ${sender || "[your name], [your agency]"}\n\nTASK: Write the pitch: one subject line (plus one alternative), a short email (under 120 words) about the single most costly broken thing, with the evidence a prospect can check themselves, the fix in one line, and a low-pressure ask. Then two short follow-ups. Owner's name unknown: use [owner name]. Never invent facts about the business.`,
    maxTokens: 12000,
    effort: "medium",
    timeoutMs: 200_000,
  });
  return { text: res.text.trim(), costUsd: res.costUsd };
}

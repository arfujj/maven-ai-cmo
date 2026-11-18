import "server-only";
import type { ZodType } from "zod";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-haiku-5.5";

export const models = {
  reader: process.env.MAVEN_READER_MODEL || DEFAULT_MODEL,
  brain: process.env.MAVEN_BRAIN_MODEL || DEFAULT_MODEL,
};

type Part = { type: "text"; text: string; cache_control?: { type: "ephemeral" } } | { type: "image_url"; image_url: { url: string } };

export interface LlmResult { text: string; costUsd: number; truncated: boolean }

/**
 * One chat call through OpenRouter. The system prompt is marked cacheable, so the
 * long, stable Maven instructions are billed at the cache rate after the first run.
 */
export async function chat(opts: {
  model: string;
  system: string;
  user: string | Part[];
  maxTokens?: number;
  /** Thinking depth. Readers extract facts (low); the brain reasons (medium or high). */
  effort?: "low" | "medium" | "high";
  timeoutMs?: number;
}): Promise<LlmResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  const userContent: Part[] = typeof opts.user === "string" ? [{ type: "text", text: opts.user }] : opts.user;
  const body = {
    model: opts.model,
    // Haiku 5.5 thinks before it answers and thinking counts toward max_tokens, so budgets are generous.
    max_tokens: opts.maxTokens ?? 12000,
    reasoning: { effort: opts.effort ?? "low" },
    usage: { include: true },
    messages: [
      { role: "system", content: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }] },
      { role: "user", content: userContent },
    ],
  };

  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Maven AI CMO",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 180_000),
      });
      if (res.status === 429 || res.status >= 500) throw new Retryable(`OpenRouter ${res.status}: ${await res.text()}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(`OpenRouter error: ${JSON.stringify(json.error ?? json).slice(0, 400)}`);
      const choice = json.choices?.[0];
      const text: string = choice?.message?.content ?? "";
      const truncated = choice?.finish_reason === "length";
      if (!text && !truncated) throw new Retryable(`Empty response (finish: ${choice?.finish_reason})`);
      return { text, costUsd: Number(json.usage?.cost ?? 0), truncated };
    } catch (err) {
      lastErr = err;
      if (!(err instanceof Retryable) && !(err instanceof Error && err.name === "TimeoutError")) break;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

class Retryable extends Error {}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.search(/[[{]/);
  const end = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
  if (start < 0 || end < start) throw new Error("No JSON found in model output");
  return JSON.parse(raw.slice(start, end + 1));
}

/** Ask for JSON, validate it against a schema, and give the model one chance to repair it. */
export async function chatJson<T>(
  schema: ZodType<T>,
  opts: Parameters<typeof chat>[0],
): Promise<{ value: T; costUsd: number }> {
  let cost = 0;
  let user = opts.user;
  let maxTokens = opts.maxTokens ?? 12000;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await chat({ ...opts, user, maxTokens });
    cost += res.costUsd;
    if (res.truncated) {
      // Ran out of room (usually thinking): retry the same request with double the budget.
      maxTokens = Math.min(maxTokens * 2, 64000);
      continue;
    }
    try {
      const parsed = schema.safeParse(extractJson(res.text));
      if (parsed.success) return { value: parsed.data, costUsd: cost };
      throw new Error(parsed.error.issues.slice(0, 6).map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const fix = `\n\nYour previous reply could not be used (${msg}). Reply again with ONLY the corrected JSON object, no prose.`;
      user = typeof opts.user === "string" ? opts.user + fix : [...opts.user, { type: "text", text: fix }];
    }
  }
  throw new Error("The model did not return valid JSON after a repair attempt");
}

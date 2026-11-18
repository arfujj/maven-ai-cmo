import "server-only";
import type { Place, AiReadiness } from "../types";
import { fetchPublic } from "./fetchSafe";

const KEY = () => process.env.GOOGLE_API_KEY || "";

export class PlacesUnavailable extends Error {}

const FIELDS = [
  "places.id",
  "places.displayName",
  "places.rating",
  "places.userRatingCount",
  "places.formattedAddress",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.googleMapsUri",
  "places.primaryTypeDisplayName",
  "places.reviews",
  "places.regularOpeningHours",
  "places.photos",
].join(",");

interface RawPlace {
  id: string;
  displayName?: { text: string };
  rating?: number;
  userRatingCount?: number;
  formattedAddress?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
  primaryTypeDisplayName?: { text: string };
  reviews?: { rating: number; text?: { text: string }; relativePublishTimeDescription?: string; authorAttribution?: { displayName?: string } }[];
  regularOpeningHours?: unknown;
  photos?: unknown[];
}

function toPlace(p: RawPlace): Place {
  return {
    id: p.id,
    name: p.displayName?.text ?? "Unknown",
    rating: p.rating ?? null,
    reviewCount: p.userRatingCount ?? null,
    address: p.formattedAddress ?? null,
    website: p.websiteUri ?? null,
    phone: p.nationalPhoneNumber ?? null,
    mapsUrl: p.googleMapsUri ?? null,
    primaryType: p.primaryTypeDisplayName?.text ?? null,
    reviews: (p.reviews ?? [])
      .filter((r) => r.text?.text)
      .map((r) => ({ rating: r.rating, text: r.text!.text.slice(0, 700), relativeTime: r.relativePublishTimeDescription ?? "", author: r.authorAttribution?.displayName })),
    hasHours: Boolean(p.regularOpeningHours),
    photoCount: p.photos?.length ?? 0,
  };
}

export async function searchPlaces(query: string, pageSize = 5): Promise<Place[]> {
  if (!KEY()) throw new PlacesUnavailable("No Google API key set");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY(), "X-Goog-FieldMask": FIELDS },
    body: JSON.stringify({ textQuery: query, pageSize }),
    signal: AbortSignal.timeout(20_000),
  });
  const json = await res.json();
  if (res.status === 403 || res.status === 401) throw new PlacesUnavailable("Places API (New) is not enabled for this Google key");
  if (!res.ok) throw new Error(`Places error ${res.status}: ${json?.error?.message ?? ""}`);
  return ((json.places ?? []) as RawPlace[]).map(toPlace);
}

const host = (u: string | null | undefined) => {
  try {
    return u ? new URL(u).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
};

/** Find the business's own profile: prefer the result whose website matches the site. */
export async function findOwnPlace(name: string, location: string, siteUrl: string): Promise<Place | null> {
  const results = await searchPlaces(`${name} ${location}`, 5);
  const siteHost = host(siteUrl);
  return results.find((p) => host(p.website) === siteHost) ?? results.find((p) => p.name.toLowerCase().includes(name.toLowerCase().split(" ")[0])) ?? null;
}

export async function findCompetitors(category: string, location: string, own: Place | null, siteUrl: string): Promise<Place[]> {
  const results = await searchPlaces(`${category} in ${location}`, 8);
  const siteHost = host(siteUrl);
  return results.filter((p) => p.id !== own?.id && host(p.website) !== siteHost).slice(0, 4);
}

export async function collectPageSpeed(url: string) {
  const q = new URLSearchParams({ url, strategy: "mobile", category: "performance", key: KEY() });
  const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: AbortSignal.timeout(120_000) });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json?.error?.message ?? `PageSpeed ${res.status}`);
  const lr = json.lighthouseResult;
  const perf = lr?.categories?.performance?.score;
  return {
    screenshot: (lr?.audits?.["final-screenshot"]?.details?.data as string) ?? null,
    performance: typeof perf === "number" ? Math.round(perf * 100) : null,
    lcpSeconds: lr?.audits?.["largest-contentful-paint"]?.numericValue ? Math.round(lr.audits["largest-contentful-paint"].numericValue / 100) / 10 : null,
    cls: lr?.audits?.["cumulative-layout-shift"]?.numericValue ?? null,
  };
}

const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"];

/** Parse robots.txt groups and report which AI crawlers are disallowed from the whole site. */
export async function collectAiReadiness(siteUrl: string, hasLocalBusinessSchema: boolean): Promise<AiReadiness> {
  const origin = new URL(siteUrl).origin;
  const [robots, llms, sitemap] = await Promise.allSettled([
    fetchPublic(`${origin}/robots.txt`, { timeoutMs: 8000 }),
    fetchPublic(`${origin}/llms.txt`, { timeoutMs: 8000 }),
    fetchPublic(`${origin}/sitemap.xml`, { timeoutMs: 8000 }),
  ]);
  const robotsText = robots.status === "fulfilled" && robots.value.ok && !/<html/i.test(robots.value.text) ? robots.value.text : "";
  const groups: { agents: string[]; disallowAll: boolean }[] = [];
  let cur: { agents: string[]; disallowAll: boolean } | null = null;
  let lastWasAgent = false;
  for (const line of robotsText.split(/\r?\n/)) {
    const [k, ...rest] = line.replace(/#.*/, "").split(":");
    const key = k?.trim().toLowerCase();
    const val = rest.join(":").trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) groups.push((cur = { agents: [], disallowAll: false }));
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
    } else if (key) {
      lastWasAgent = false;
      if (cur && key === "disallow" && val === "/") cur.disallowAll = true;
    }
  }
  const blocked = AI_BOTS.filter((bot) => {
    const g = groups.find((x) => x.agents.includes(bot.toLowerCase())) ?? groups.find((x) => x.agents.includes("*"));
    return g?.disallowAll ?? false;
  });
  const hasSitemap = /sitemap:/i.test(robotsText) || (sitemap.status === "fulfilled" && sitemap.value.ok && /<(urlset|sitemapindex)/i.test(sitemap.value.text));
  return {
    blockedBots: blocked,
    allowedBots: AI_BOTS.filter((b) => !blocked.includes(b)),
    hasRobots: Boolean(robotsText),
    hasSitemap,
    hasLlmsTxt: llms.status === "fulfilled" && llms.value.ok && !/<html/i.test(llms.value.text) && llms.value.text.length > 20,
    hasLocalBusinessSchema,
    napConsistent: null,
  };
}

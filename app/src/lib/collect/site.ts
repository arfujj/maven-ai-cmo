import "server-only";
import * as cheerio from "cheerio";
import { fetchPublic, normalizeUrl } from "./fetchSafe";
import type { SiteFacts, SitePage } from "../types";

const KEY_PATHS = /(service|services|what-we-do|about|contact|area|areas|location|pricing|price|reviews|testimonials|why|faq)/i;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\b([2-9]\d{2})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b/g;
const MAX_PAGE_CHARS = 7000;

function readPage(html: string, url: URL) {
  const $ = cheerio.load(html);
  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const walk = (n: unknown): void => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === "object") {
          const t = (n as Record<string, unknown>)["@type"];
          if (typeof t === "string") schemaTypes.push(t);
          if (Array.isArray(t)) schemaTypes.push(...t.filter((x): x is string => typeof x === "string"));
          Object.values(n as object).forEach(walk);
        }
      };
      walk(JSON.parse($(el).text()));
    } catch {
      /* ignore malformed JSON-LD */
    }
  });
  const tels = $('a[href^="tel:"]').map((_, el) => ($(el).attr("href") || "").replace(/^tel:/, "")).get();
  const links = $("a[href]")
    .map((_, el) => {
      try {
        return new URL($(el).attr("href")!, url);
      } catch {
        return null;
      }
    })
    .get()
    .filter((u): u is URL => !!u && u.hostname.replace(/^www\./, "") === url.hostname.replace(/^www\./, ""));
  const title = $("title").first().text().trim();
  const h1 = $("h1").first().text().replace(/\s+/g, " ").trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  $("script, style, noscript, svg, iframe, template").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, MAX_PAGE_CHARS);
  return { title, h1, metaDescription, text, schemaTypes, tels, links };
}

export async function collectSite(rawUrl: string): Promise<SiteFacts> {
  const start = normalizeUrl(rawUrl);
  let home;
  try {
    home = await fetchPublic(start);
    if (!home.ok) throw new Error(`The site answered with status ${home.status}`);
  } catch (err) {
    return { finalUrl: start.toString(), pages: [], phones: [], schemaTypes: [], hasLocalBusinessSchema: false, metaDescription: "", fetchError: err instanceof Error ? err.message : String(err) };
  }
  const first = readPage(home.text, home.url);
  const pages: SitePage[] = [{ url: home.url.toString(), title: first.title, h1: first.h1, text: first.text }];
  const schema = new Set(first.schemaTypes);
  const tels = [...first.tels];

  const seen = new Set([home.url.pathname.replace(/\/$/, "") || "/"]);
  const candidates = first.links
    .filter((u) => {
      const p = u.pathname.replace(/\/$/, "") || "/";
      if (seen.has(p) || !KEY_PATHS.test(p) || /\.(pdf|jpg|png|zip)$/i.test(p)) return false;
      seen.add(p);
      return true;
    })
    .slice(0, 4);

  const extra = await Promise.allSettled(candidates.map((u) => fetchPublic(u, { timeoutMs: 12_000 })));
  for (const r of extra) {
    if (r.status !== "fulfilled" || !r.value.ok || !r.value.contentType.includes("html")) continue;
    const p = readPage(r.value.text, r.value.url);
    pages.push({ url: r.value.url.toString(), title: p.title, h1: p.h1, text: p.text.slice(0, 5000) });
    p.schemaTypes.forEach((t) => schema.add(t));
    tels.push(...p.tels);
  }

  const phones = new Set<string>();
  for (const t of tels) {
    const d = t.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    if (d.length === 10) phones.add(`(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`);
  }
  for (const m of pages[0].text.matchAll(PHONE_RE)) phones.add(`(${m[1]}) ${m[2]}-${m[3]}`);

  const types = [...schema];
  return {
    finalUrl: home.url.toString(),
    pages,
    phones: [...phones].slice(0, 5),
    schemaTypes: types,
    hasLocalBusinessSchema: types.some((t) => /LocalBusiness|Plumber|Dentist|HVAC|Roofing|Electrician|Locksmith|LegalService|Attorney|MedicalBusiness|HomeAndConstructionBusiness|AutoRepair|ProfessionalService|Store|Restaurant/i.test(t)),
    metaDescription: first.metaDescription,
  };
}

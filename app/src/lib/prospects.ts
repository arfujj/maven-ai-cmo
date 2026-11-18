import "server-only";
import { randomUUID } from "crypto";
import { searchPlaces } from "./collect/google";
import { fetchPublic } from "./collect/fetchSafe";
import { getProspects, saveProspects } from "./store";
import type { Prospect, ProspectList } from "./types";

export function newProspectList(trade: string, town: string, userId: string | null): ProspectList {
  const now = new Date().toISOString();
  return { id: randomUUID(), kind: "prospects", userId, createdAt: now, updatedAt: now, status: "running", trade, town, prospects: [], costUsd: 0 };
}

async function checkSite(url: string) {
  try {
    const res = await fetchPublic(url, { timeoutMs: 9000, maxBytes: 600_000 });
    return { reachable: res.ok, https: res.url.protocol === "https:", tap: /href=["']tel:/i.test(res.text) };
  } catch {
    return { reachable: false, https: null, tap: null };
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

/**
 * Rank the businesses in a trade and town by how many customers they are likely losing.
 * Public signals only (find-local-clients): rating, review count against the local median,
 * website presence and health, tap-to-call, hours and photos on the profile.
 */
export async function runProspects(id: string): Promise<void> {
  const list = await getProspects(id);
  if (!list) return;
  try {
    const places = await searchPlaces(`${list.trade} in ${list.town}`, 20);
    const counts = places.map((p) => p.reviewCount ?? 0).sort((a, b) => a - b);
    const median = counts.length ? counts[Math.floor(counts.length / 2)] : 0;
    const sites = await mapLimit(places, 6, (p) => (p.website ? checkSite(p.website) : Promise.resolve(null)));

    list.prospects = places.map((p, i): Prospect => {
      const site = sites[i];
      const reasons: string[] = [];
      let score = 0;
      if (!p.website) {
        score += 30;
        reasons.push("No website on the Google profile");
      } else if (site && !site.reachable) {
        score += 25;
        reasons.push("Website didn't load");
      } else if (site) {
        if (site.tap === false) {
          score += 15;
          reasons.push("No tap-to-call link on the homepage");
        }
        if (site.https === false) {
          score += 5;
          reasons.push("Website isn't secure (no https)");
        }
      }
      const r = p.rating;
      if (r != null && r < 4.0) {
        score += 25;
        reasons.push(`Low rating: ${r.toFixed(1)}★`);
      } else if (r != null && r < 4.4) {
        score += 15;
        reasons.push(`Rating ${r.toFixed(1)}★, below most rivals`);
      } else if (r != null && r < 4.6) score += 5;
      const c = p.reviewCount ?? 0;
      if (median > 0 && c < median * 0.25) {
        score += 20;
        reasons.push(`Only ${c} reviews (local median ${median})`);
      } else if (median > 0 && c < median * 0.5) {
        score += 12;
        reasons.push(`${c} reviews, half the local median of ${median}`);
      } else if (median > 0 && c < median) score += 5;
      if (!p.hasHours) {
        score += 8;
        reasons.push("No opening hours on the profile");
      }
      if (p.photoCount < 5) {
        score += 7;
        reasons.push(`Only ${p.photoCount} photos on the profile`);
      }
      return {
        id: p.id,
        name: p.name,
        rating: p.rating,
        reviewCount: p.reviewCount,
        website: p.website,
        phone: p.phone,
        address: p.address,
        mapsUrl: p.mapsUrl,
        hasHours: p.hasHours,
        photoCount: p.photoCount,
        siteReachable: site ? site.reachable : null,
        siteHasTapToCall: site ? site.tap : null,
        siteHttps: site ? site.https : null,
        opportunity: Math.min(100, score),
        reasons,
      };
    });
    list.prospects.sort((a, b) => b.opportunity - a.opportunity);
    list.status = "done";
  } catch (err) {
    list.status = "failed";
    list.error = err instanceof Error ? err.message : String(err);
  }
  await saveProspects(list);
}

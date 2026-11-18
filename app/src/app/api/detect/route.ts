import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { fetchPublic } from "@/lib/collect/fetchSafe";

export const runtime = "nodejs";

/** Prefill the onboarding form from the homepage: a business name guess and a town hint. */
export async function POST(req: Request) {
  const { url } = await req.json().catch(() => ({ url: "" }));
  if (typeof url !== "string" || url.length < 4) return NextResponse.json({ error: "Enter a website" }, { status: 400 });
  try {
    const res = await fetchPublic(url, { timeoutMs: 10_000, maxBytes: 800_000 });
    if (!res.ok) return NextResponse.json({ reachable: false, status: res.status });
    const $ = cheerio.load(res.text);
    let name = $('meta[property="og:site_name"]').attr("content")?.trim() || "";
    let locality = "";
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const nodes = [JSON.parse($(el).text())].flat(3);
        for (const n of nodes.flatMap((x) => (x?.["@graph"] ? x["@graph"] : [x]))) {
          if (!name && typeof n?.name === "string" && n?.["@type"] !== "WebPage") name = n.name;
          const addr = n?.address;
          if (!locality && addr?.addressLocality) locality = [addr.addressLocality, addr.addressRegion].filter(Boolean).join(", ");
        }
      } catch {
        /* ignore */
      }
    });
    if (!name) name = ($("title").text().split(/[|\-–—:]/)[0] || "").trim();
    return NextResponse.json({ reachable: true, finalUrl: res.url.toString(), name: name.slice(0, 80), location: locality });
  } catch (err) {
    return NextResponse.json({ reachable: false, error: err instanceof Error ? err.message : "Couldn't reach that site" });
  }
}

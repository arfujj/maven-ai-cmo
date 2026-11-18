import "server-only";
import { lookup } from "dns/promises";
import net from "net";

const UA = "Mozilla/5.0 (compatible; MavenBot/1.0; +https://github.com/maven-cmo/maven)";

function isPrivate(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:127.") || v.startsWith("::ffff:10.") || v.startsWith("::ffff:192.168.");
}

export function normalizeUrl(input: string): URL {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  const u = new URL(s);
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Only http and https sites can be read");
  return u;
}

/** Refuse to fetch anything that resolves to a private or local address (SSRF guard). */
async function assertPublic(u: URL) {
  const host = u.hostname;
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("That address isn't a public website");
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivate(a.address))) throw new Error("That address isn't a public website");
}

/** GET a public URL, following up to 5 redirects and re-checking each hop. */
export async function fetchPublic(input: string | URL, opts: { timeoutMs?: number; maxBytes?: number } = {}) {
  let url = typeof input === "string" ? normalizeUrl(input) : input;
  for (let hop = 0; hop < 6; hop++) {
    await assertPublic(url);
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5" },
      signal: AbortSignal.timeout(opts.timeoutMs ?? 15_000),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = new URL(res.headers.get("location")!, url);
      continue;
    }
    const max = opts.maxBytes ?? 2_000_000;
    const buf = await res.arrayBuffer();
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buf.byteLength > max ? buf.slice(0, max) : buf);
    return { url, status: res.status, ok: res.ok, text, contentType: res.headers.get("content-type") ?? "" };
  }
  throw new Error("Too many redirects");
}

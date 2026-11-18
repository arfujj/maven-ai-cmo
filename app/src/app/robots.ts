import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/a/", "/r/", "/dashboard", "/start", "/api/", "/auth/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}

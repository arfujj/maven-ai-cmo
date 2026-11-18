import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tools read Maven's skill playbooks from ./skills at runtime; ship them with the server functions.
  outputFileTracingIncludes: {
    "/api/analyses/[id]/tools": ["./skills/**/*.md"],
    "/api/prospects/[id]/pitch": ["./skills/**/*.md"],
  },
  poweredByHeader: false,
};

export default nextConfig;

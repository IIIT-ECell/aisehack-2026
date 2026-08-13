import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // .trim(): a stray trailing space in the deploy env file has silently
  // broken this twice — Next requires an exact-prefix basePath match, and
  // no real request path ever contains a literal trailing space, so a
  // dirty value here quietly breaks every route under it.
  basePath: (process.env.NEXT_PUBLIC_BASE_PATH || "").trim(),
  experimental: {},
  allowedDevOrigins: [
    "10.4.25.48",
    "localhost",
    "precog.iiit.ac.in",
  ],
  async redirects() {
    return [
      {
        source: "/showcase",
        destination: "/past-editions/edition-1/showcase",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

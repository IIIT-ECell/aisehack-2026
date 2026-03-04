import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  experimental: {},
  allowedDevOrigins: [
    "10.4.25.48",
    "localhost",
    "precog.iiit.ac.in",
  ],
};

export default nextConfig;

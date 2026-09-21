import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep build tracing scoped to this app when a parent directory has its own lockfile.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

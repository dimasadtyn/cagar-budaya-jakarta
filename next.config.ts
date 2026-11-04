import type { NextConfig } from "next";

// Static export: out/ is served as plain files, by Cloudflare or any other web server.
// Redirects and security headers live in public/_redirects, public/_headers, and server/ (see docs/03-technical-decisions.md).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: { globalNotFound: true },
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;

import type { NextConfig } from "next";

// Static export: the site is uploaded as plain files to the Dinas Kebudayaan web server.
// Redirects and security headers live in server/ (see docs/03-technical-decisions.md).
const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: { globalNotFound: true },
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;

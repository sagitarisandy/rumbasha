import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Let laptops on the LAN / Tailscale open the dev server (http://192.168.100.21:3000).
  // Without this, dev JS is blocked and the animated sections stay invisible.
  allowedDevOrigins: ["192.168.100.21", "100.114.179.32", "dev"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

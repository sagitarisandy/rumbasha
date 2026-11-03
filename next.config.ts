import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Let laptops on the LAN / Tailscale open the dev server (http://192.168.100.21:3000).
  // Without this, dev JS is blocked and the animated sections stay invisible.
  allowedDevOrigins: ["192.168.100.21", "100.114.179.32", "dev"],
  partialPrefetching: true,
  // PGlite loads its WASM/data files from node_modules at runtime, so keep it out of the bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // Siswa/admin pages are per-user by design; only validate segments that opt in with `instant`.
    instantInsights: { validationLevel: "manual-warning" },
  },
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

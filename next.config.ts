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
  // Routes used to be Indonesian; keep old links (e.g. in saved notifications) working.
  async redirects() {
    const moves: [string, string][] = [
      ["/siswa/profil/data-diri", "/student/profile/details"],
      ["/siswa/profil/riwayat", "/student/profile/history"],
      ["/siswa/modul/:path*", "/student/modules/:path*"],
      ["/siswa/quiz", "/student/daily-quiz"],
      ["/siswa/ujikom", "/student/exams"],
      ["/siswa/peringkat", "/student/leaderboard"],
      ["/siswa/notifikasi", "/student/notifications"],
      ["/siswa/cari", "/student/search"],
      ["/siswa/profil", "/student/profile"],
      ["/siswa/paket", "/student/plans"],
      ["/siswa/hasil/:id/pembahasan", "/student/results/:id/review"],
      ["/siswa/hasil/:path*", "/student/results/:path*"],
      ["/siswa/sesi/:path*", "/student/session/:path*"],
      ["/siswa/:path*", "/student/:path*"],
      ["/admin/materi/tambah", "/admin/materials/new"],
      ["/admin/materi/:path*", "/admin/materials/:path*"],
      ["/admin/bank-soal/tambah", "/admin/questions/new"],
      ["/admin/bank-soal/:path*", "/admin/questions/:path*"],
      ["/admin/image", "/admin/images"],
      ["/admin/quiz/buat", "/admin/quizzes/new"],
      ["/admin/quiz/:path*", "/admin/quizzes/:path*"],
      ["/admin/user/tambah", "/admin/users/new"],
      ["/admin/user/:path*", "/admin/users/:path*"],
      ["/admin/coin-akses", "/admin/coins"],
      ["/admin/paket", "/admin/plans"],
      ["/admin/task", "/admin/tasks"],
      ["/admin/cari", "/admin/search"],
      ["/masuk", "/login"],
      ["/mulai", "/welcome"],
      ["/quiz-trial", "/trial"],
      ["/biaya", "/pricing"],
    ];
    return moves.map(([source, destination]) => ({ source, destination, permanent: false }));
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

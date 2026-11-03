# Rumbasha — Landing Page (Home Option 2)

Implementasi Next.js dari board **Home Option 2** di file Penpot "Rumbasha — Landing Page Wireframe".

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000 di Chrome.

Versi produksi: `npm run build && npm run start`.

## Struktur

- `src/components/home-option-2/` — satu file per section (Hero, ProgramJenjang, SchoolMarquee, ProgramTabs, Keunggulan, BuktiAlumni, VideoStories, Aktivitas, AppPromo, CtaBanner, Faq, Footer).
- `src/components/home-option-2/data.ts` — semua teks/konten. Item bertanda `(lanjutan)` adalah isi tambahan untuk state yang belum digambar di desain (slide carousel 2–4, tab SMP/SMA, jawaban FAQ 2–6).
- `src/components/home-option-2/icons.tsx` — ikon & dekorasi yang digambar ulang dari data vektor Penpot.
- `public/images/` — foto & logo hasil ekspor dari Penpot (webp).

## Animasi

- Logo asal sekolah berjalan ke kiri tanpa henti (berhenti saat di-hover), dengan fade kiri/kanan.
- Kartu alumni: dua baris berjalan berlawanan arah.
- Carousel keunggulan: autoplay 5 detik, tombol panah, titik navigasi dengan progress.
- Tab program (Pra SD & SD / SMP / SMA) dengan pill bergeser dan konten berganti.
- Hero: elemen masuk bertahap, dekorasi melayang, parallax saat scroll, angka 12.000+ menghitung naik.
- Countdown promo berjalan (hitung mundur ke tengah malam).
- Statistik count-up, reveal saat scroll, parallax foto kelas & kolase, mockup HP yang layarnya bergulir.
- FAQ accordion, modal video (placeholder).
- Menghormati setelan "reduce motion" di OS.

---

# E-learning v3 (siswa + admin)

Dibangun dari file desain `Rumbasha.figcraft` (page "v3 · 00–07"): design system shadcn/ui-style, Inter, ikon Lucide, maskot Rumbi (SVG di `public/illustrations/`).

## Akun demo

| Peran | Email | Kata sandi |
|---|---|---|
| Siswa | nadia.aulia@gmail.com | siswa123 |
| Admin | rina@rumbasha.id | admin123 |
| Super Admin | super@rumbasha.id | admin123 |

Semua siswa demo lain memakai `siswa123`; tutor/admin lain `admin123`.

## Halaman

- Publik: `/welcome` (welcome), `/login`, `/trial` (10 soal tanpa daftar).
- Siswa (`/student`): Beranda, Modul + PDF preview (progres baca tersimpan, unduh PDF), Daily Quiz (2 gratis/hari, lalu 10 coin), Uji Kom & Tryout (kode akses 6 karakter → hitung mundur 15 detik), halaman soal fokus (timer, ragu-ragu, daftar soal), Hasil & Pembahasan, RUMATH (video + latihan isian dengan keypad), Peringkat, Notifikasi, Cari, Profil (data diri, kata sandi, riwayat + export PDF), Paket & Coin (checkout disimulasikan).
- Admin (`/admin`): Beranda (KPI, grafik), Materi, Bank Soal (+ import CSV), Image (upload), Master Data, Quiz (builder 3 langkah + kode akses), RUMATH, Leaderboard, Report Quiz, Report RUMATH, User (+ import CSV), Coin & Akses (ubah massal), Paket, Landing Page, Task.

## Backend

- Next.js Server Actions + Route Handlers (`src/app/actions`, `src/app/api`), sesi cookie bertanda tangan HMAC (`src/lib/auth`), guard per peran di `src/proxy.ts` dan `src/lib/dal.ts`.
- Database: Drizzle ORM (`src/lib/db`).
  - `DATABASE_URL` diisi → Postgres (mis. Neon), data tersimpan.
  - Tidak diisi → PGlite: di laptop tersimpan di `.data/pglite`, di Vercel di memori (data kembali ke awal saat server dingin).
  - Tabel dibuat dan diisi data demo otomatis saat pertama jalan. Kalau `src/lib/db/ddl.ts` berubah, database demo dibuat ulang.
- Semua tanggal memakai zona WIB (`Asia/Jakarta`).

## Deploy preview ke Vercel

1. Import repo ke Vercel (atau `npx vercel` dari folder ini).
2. Disarankan: tambahkan Neon dari Vercel → Storage, supaya `DATABASE_URL` terisi dan data tidak hilang.
3. Environment variable: `SESSION_SECRET` (string acak panjang).
4. Deploy. Super Admin bisa reset data demo lewat `POST /api/dev/reset`.

Catatan preview: pembayaran disimulasikan, file PDF yang diupload admin hanya dihitung halamannya (isi viewer dibuat otomatis), video RUMATH memakai adegan papan tulis contoh.

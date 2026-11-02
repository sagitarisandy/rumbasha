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

import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rumbasha — Bimbel SD dan SMP",
  description:
    "Bangun dasar yang kuat sejak SD, lalu siapkan TKA dan seleksi masuk SMA bersama Rumbasha.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${interTight.variable} antialiased`}>
      <body className="min-h-full overflow-x-clip">
        {children}
      </body>
    </html>
  );
}

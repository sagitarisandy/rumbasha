import type { Metadata } from "next";
import AlumniDetail from "@/components/alumni/AlumniDetail";
import { MotionProvider } from "@/components/home-option-2/motion";
import WhatsAppFloat from "@/components/home-option-2/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Kisah Sukses Rizky Pratama — Rumbasha",
  description: "Perjalanan belajar Rizky dari tes penempatan sampai diterima di SMAN 3 Bandung.",
};

export default function Page() {
  return (
    <MotionProvider>
      <AlumniDetail />
      <WhatsAppFloat />
    </MotionProvider>
  );
}

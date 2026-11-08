import type { Metadata } from "next";
import AlumniList from "@/components/alumni/AlumniList";
import { MotionProvider } from "@/components/home-option-2/motion";
import WhatsAppFloat from "@/components/home-option-2/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Kisah Alumni — Rumbasha",
  description: "Daftar alumni Rumbasha yang diterima di SMA favoritnya.",
};

export default function Page() {
  return (
    <MotionProvider>
      <AlumniList />
      <WhatsAppFloat />
    </MotionProvider>
  );
}

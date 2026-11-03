import type { Metadata } from "next";
import { Suspense } from "react";
import BiayaPage from "@/components/biaya/BiayaPage";
import { MotionProvider } from "@/components/home-option-2/motion";
import WhatsAppFloat from "@/components/home-option-2/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Paket & Harga — Rumbasha",
  description: "Paket belajar Pra SD & SD, SMP, SMA, dan E-Learning di Rumbasha.",
};

export default function Page() {
  return (
    <MotionProvider>
      {/* useSearchParams (tab from ?jenjang=) needs a Suspense boundary. */}
      <Suspense>
        <BiayaPage />
      </Suspense>
      <WhatsAppFloat />
    </MotionProvider>
  );
}

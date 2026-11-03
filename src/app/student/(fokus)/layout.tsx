import { Suspense, type ReactNode } from "react";

// Focus mode: no sidebar or tab bar while answering soal.
export default function FokusLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="min-h-dvh animate-pulse bg-white" />}>{children}</Suspense>;
}

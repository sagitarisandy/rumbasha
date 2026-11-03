"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleSaveVideo } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";

export function SaveVideoButton({ id, initial }: { id: number; initial: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [, start] = useTransition();
  return (
    <Button variant="ghost" onClick={() => (setSaved((s) => !s), start(() => toggleSaveVideo(id)))} aria-pressed={saved}>
      {saved ? <BookmarkCheck className="text-primary" /> : <Bookmark />} {saved ? "Tersimpan" : "Simpan"}
    </Button>
  );
}

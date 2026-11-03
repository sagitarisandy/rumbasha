"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Modal on top of a dimmed page (native <dialog>, so focus trap and Esc come for free). */
export function Dialog({
  open, onClose, title, description, children, footer, size = "md", side = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** bottom sheet on mobile */
  side?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const width = size === "sm" ? "sm:max-w-[440px]" : size === "lg" ? "sm:max-w-[720px]" : "sm:max-w-[560px]";
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-full max-w-none bg-transparent p-0 backdrop:bg-ink/45 backdrop:backdrop-blur-[2px] open:animate-[pop_.18s_ease-out] ${width} ${
        side ? "mb-0 sm:mb-auto" : "px-4"
      }`}
    >
      {open && (
        <div className={`relative max-h-[88dvh] overflow-y-auto bg-white p-6 shadow-pop ${side ? "rounded-t-[24px] sm:rounded-[24px]" : "rounded-[24px]"}`}>
          {(title || description) && (
            <div className="mb-4 pr-8">
              {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
              {description && <p className="mt-1 text-sm text-subtle">{description}</p>}
            </div>
          )}
          <button type="button" onClick={onClose} aria-label="Tutup" className="absolute right-5 top-5 grid size-8 place-items-center rounded-full text-subtle hover:bg-surface">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          {children}
          {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

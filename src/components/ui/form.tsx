import type { ComponentProps, ReactNode } from "react";

const FIELD =
  "w-full rounded-xl border border-border bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-primary focus:shadow-[0_0_0_3px_rgb(63_65_151/0.14)] aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_rgb(220_38_38/0.12)] disabled:bg-surface disabled:text-subtle";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${FIELD} h-11 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${FIELD} min-h-24 py-2.5 leading-5 ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={`${FIELD} h-11 appearance-none pr-9 ${className}`} {...props}>
        {children}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 stroke-subtle" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export function Field({ label, hint, error, children, className = "", htmlFor }: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {error ? <p className="text-[13px] font-semibold text-destructive">{error}</p> : hint ? <p className="text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({ label, className = "", ...props }: ComponentProps<"input"> & { label?: ReactNode }) {
  const box = (
    <input
      type="checkbox"
      className={`size-[18px] shrink-0 cursor-pointer appearance-none rounded-[5px] border border-[#c9cbe0] bg-white bg-center bg-no-repeat transition checked:border-primary checked:bg-primary checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='white'%20stroke-width='3.5'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='M20%206%209%2017l-5-5'/%3E%3C/svg%3E")] checked:bg-[length:12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      {...props}
    />
  );
  if (!label) return box;
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
      {box}
      {label}
    </label>
  );
}

export function Radio({ label, ...props }: ComponentProps<"input"> & { label?: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input type="radio" className="size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-[#c9cbe0] bg-white transition checked:border-[5px] checked:border-primary" {...props} />
      {label}
    </label>
  );
}

export function Switch({ label, ...props }: ComponentProps<"input"> & { label?: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        role="switch"
        className="peer relative h-[22px] w-[38px] shrink-0 cursor-pointer appearance-none rounded-full bg-[#d6d8e8] transition before:absolute before:left-[3px] before:top-[3px] before:size-4 before:rounded-full before:bg-white before:shadow before:transition checked:bg-primary checked:before:translate-x-4"
        {...props}
      />
      {label}
    </label>
  );
}

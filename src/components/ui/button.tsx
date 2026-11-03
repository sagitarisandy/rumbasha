import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "accent" | "destructive" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "bg-linear-to-b from-primary-2 to-primary text-white shadow-btn hover:brightness-110",
  secondary: "bg-primary-soft text-primary hover:bg-[#e3e6ff]",
  outline: "border border-border bg-white text-ink hover:bg-surface",
  ghost: "text-ink hover:bg-surface",
  accent: "bg-linear-to-b from-[#ff9a4d] to-[#f47a22] text-white shadow-btn-accent hover:brightness-105",
  destructive: "bg-destructive-soft text-destructive-ink hover:bg-[#fbdcdc]",
  danger: "bg-destructive text-white hover:bg-[#c81e1e]",
  link: "text-primary underline-offset-4 hover:underline",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 rounded-2xl px-3.5 text-[13px]",
  md: "h-10 rounded-[20px] px-[18px] text-sm",
  lg: "h-12 rounded-3xl px-6 text-[15px]",
  icon: "size-10 rounded-full",
  "icon-sm": "size-8 rounded-full",
};

export function buttonClass({ variant = "default", size = "md", className = "" }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:size-4 ${VARIANTS[variant]} ${variant === "link" ? "h-auto px-0" : SIZES[size]} ${className}`;
}

type Common = { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & Common) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}

export function LinkButton({ variant, size, className, ...props }: ComponentProps<typeof Link> & Common) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}

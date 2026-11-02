"use client";

import { animate, motion, MotionConfig, useInView, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Honors the visitor's "reduce motion" OS setting for every motion component. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  delay = 0,
  y = 28,
  x = 0,
  scale = 1,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number; x?: number; scale?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, delay, ease }}
      {...props}
    />
  );
}

/** Staggers direct <RevealItem> children. */
export function RevealGroup({ stagger = 0.12, ...props }: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      {...props}
    />
  );
}

export function RevealItem({ y = 28, ...props }: HTMLMotionProps<"div"> & { y?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
      }}
      {...props}
    />
  );
}

const thousands = new Intl.NumberFormat("id-ID");

/** Counts from 0 to `value` once visible. */
export function CountUp({
  value,
  suffix = "",
  format = "plain",
  duration = 1.6,
}: {
  value: number;
  suffix?: string;
  format?: "plain" | "thousands";
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: reduce ? 0 : duration,
      ease: "easeOut",
      onUpdate: (v) => setCurrent(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  const text = format === "thousands" ? thousands.format(current) : String(current);
  return (
    <span ref={ref} className="tabular-nums">
      {text}
      {suffix}
    </span>
  );
}

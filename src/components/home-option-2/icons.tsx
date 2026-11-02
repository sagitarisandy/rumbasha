// Icons and decorative illustrations rebuilt from the Penpot vector data of Home Option 2.
// Components that use gradients take a `uid` so several copies can live on one page.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
type GradProps = IconProps & { uid: string };

export function ChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftThin(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden {...props}>
      <path d="M30 10L16 24l14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightThin(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden {...props}>
      <path d="M18 10l14 14-14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden {...props}>
      <circle cx="50" cy="50" r="46" stroke="rgb(255 255 255 / 0.8)" strokeWidth="5" />
      <path d="M40 30l32 20-32 20z" fill="rgb(255 255 255 / 0.85)" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 3C8.78 2.99 5.81 4.71 4.2 7.49c-1.61 2.79-1.61 6.22 0 9.01L3 21l4.6-1.21c3.28 1.9 7.4 1.52 10.3-.93 2.89-2.45 3.94-6.45 2.62-10C19.2 5.3 15.79 2.96 12 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5C9 12 12 15 15.5 15l1-1.5-2-1-1 .79c-1.06-.4-1.9-1.24-2.3-2.29L12 10l-1-2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <path
        d="M3.75 2.25H6l1.5 3.75-1.88 1.12a8.3 8.3 0 005.25 5.25L12 10.5l3.75 1.5v2.25a1.5 1.5 0 01-1.5 1.5A12 12 0 012.25 3.75a1.5 1.5 0 011.5-1.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <rect x="2.25" y="3.75" width="13.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.25 5.25L9 9.75l6.75-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <path
        d="M9 15.75s5.25-4.66 5.25-9A5.25 5.25 0 009 1.5a5.25 5.25 0 00-5.25 5.25c0 4.34 5.25 9 5.25 9z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="6.75" r="1.87" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <rect x="2" y="2" width="14" height="14" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="13" cy="5" r="1" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <path
        d="M11.6 2h-2.3v9.7a2.1 2.1 0 11-2.1-2.1c.2 0 .4 0 .6.1V7.3a4.4 4.4 0 103.8 4.4V6.9a5.3 5.3 0 003 1V5.6a3 3 0 01-3-3.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <rect x="2" y="4" width="15" height="11" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7.2v4.6l4-2.3z" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <path
        d="M10.3 16V9.8h2.1l.3-2.4h-2.4V5.9c0-.7.2-1.2 1.2-1.2h1.3V2.6c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.7H5.6v2.4h2.1V16z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BooksIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 26 26" fill="none" aria-hidden {...props}>
      <rect x="3" y="16" width="20" height="5" rx="1" stroke="#3f4197" strokeWidth="1.9" />
      <rect x="5" y="10" width="16" height="5" rx="1" stroke="#3f4197" strokeWidth="1.9" />
      <rect x="4" y="4" width="15" height="5" rx="1" stroke="#3f4197" strokeWidth="1.9" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 26 26" fill="none" aria-hidden {...props}>
      <path
        d="M14.08 2.16L4.33 15.16h7.58l-1.08 8.67 9.75-13h-7.58l1.08-8.67z"
        stroke="#f78433"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 26 26" fill="none" aria-hidden {...props}>
      <rect x="5.42" y="4.33" width="15.17" height="18.42" rx="2" stroke="#5b8def" strokeWidth="1.9" />
      <path
        d="M9.75 4.33V2.7h6.5v1.63M9.2 12.45l2.17 2.17 4.33-4.33M9.2 18.41h7.59"
        stroke="#5b8def"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5c-.34.94-.18 2 .42 2.8.6.8 1.57 1.25 2.58 1.2M16 6h3c.33.94.17 2-.43 2.8-.6.8-1.57 1.25-2.57 1.2M12 13v4M9 20h6"
        stroke="#d99a12"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M10 1.25c.62 3.75-3.75 5.62-3.75 10.62 0 3.13 1.87 6.25 4.37 6.25 2.81 0 5-2.5 5-5.94 0-2.81-1.56-4.37-2.5-6.87-.62 1.87-1.25 2.5-2.19 2.81.94-2.81 0-5.31-.93-6.87z"
        fill="#f08a24"
      />
      <path
        d="M10.31 9.37C10 11.56 7.81 12.5 7.81 15c0 1.56 1.25 3.12 2.81 3.12 1.56 0 2.81-1.25 2.81-3.12 0-1.57-.93-2.5-1.56-3.75-.31.93-.62 1.25-1.25 1.56.31-1.25 0-2.5-.31-3.44z"
        fill="#f5b731"
      />
    </svg>
  );
}

/* ---------- Illustrated badges (white circle + colored icon) ---------- */

export function BookIllustration(props: IconProps) {
  return (
    <svg viewBox="0 0 76 76" fill="none" aria-hidden {...props}>
      <path d="M19.47 25.17c6.41-2.14 12.83-1.43 18.53 2.85v27.08c-5.7-4.28-12.12-4.99-18.53-2.85z" fill="#5b8def" />
      <path d="M56.52 25.17c-6.41-2.14-12.82-1.43-18.52 2.85v27.08c5.7-4.28 12.11-4.99 18.52-2.85z" fill="#3e6fd8" />
      <path d="M22.32 27.31c4.99-1.43 9.98-.72 14.25 2.13v22.09c-4.27-2.85-9.26-3.56-14.25-2.14z" fill="#fff" />
      <path d="M53.67 27.31c-4.99-1.43-9.97-.72-14.25 2.13v22.09c4.28-2.85 9.26-3.56 14.25-2.14z" fill="#f1f4ff" />
      <path
        d="M25.17 33.01h7.84M25.17 37.28h7.84M25.17 41.56h5.7M42.98 33.01h7.84M42.98 37.28h7.84M42.98 41.56h5.7"
        stroke="#b9c6ea"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClipboardIllustration(props: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden {...props}>
      <rect x="25" y="20.5" width="30" height="39" rx="5" fill="#e8eeff" />
      <rect x="25" y="20.5" width="30" height="9" rx="4.5" fill="#5b8def" />
      <rect x="34" y="17.5" width="12" height="6.75" rx="3" fill="#3e6fd8" />
      <path
        d="M30.25 37l2.25 2.25 3.75-4.5M30.25 46l2.25 2.25 3.75-4.5"
        stroke="#22b573"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="39.25" y="36.25" width="11.25" height="3" rx="1.5" fill="#b9c6ea" />
      <rect x="39.25" y="45.25" width="9" height="3" rx="1.5" fill="#b9c6ea" />
    </svg>
  );
}

export function GraduationIllustration(props: IconProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden {...props}>
      <path d="M29.5 38.5v9c0 3 4.5 6 10.5 6s10.5-3 10.5-6v-9L40 43.75z" fill="#4a4d63" />
      <path d="M19 34l21-9 21 9-21 9z" fill="#6b6f86" />
      <path d="M19 34l21 9 21-9-21 3z" fill="#4a4d63" />
      <path d="M55 36.25v10.5" stroke="#f5b731" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="55" cy="49" r="2.62" fill="#f5b731" />
    </svg>
  );
}

export function ChartIllustration(props: IconProps) {
  return (
    <svg viewBox="0 0 68 68" fill="none" aria-hidden {...props}>
      <rect x="18.7" y="18.7" width="30.6" height="30.6" rx="8" fill="#e8eeff" />
      <rect x="23.8" y="36.55" width="4.46" height="7.65" rx="2" fill="#5b8def" />
      <rect x="31.77" y="31.45" width="4.46" height="12.75" rx="2" fill="#f08a24" />
      <rect x="39.74" y="26.35" width="4.46" height="17.85" rx="2" fill="#22b573" />
      <path
        d="M23.16 31.44l7.65-5.73 5.1 3.19 8.29-6.38M41.01 21.88h3.82v3.83"
        stroke="#3f4197"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlumniIllustration(props: IconProps) {
  return (
    <svg viewBox="0 0 68 68" fill="none" aria-hidden {...props}>
      <circle cx="27.63" cy="26.35" r="5.74" fill="#ffc9a3" />
      <path d="M21.88 25.07c0-3.82 2.55-6.38 5.74-6.38s5.74 2.56 5.74 5.74c-1.91-1.27-5.74-1.27-7.65-3.82-.64 1.91-1.91 3.19-3.83 4.46z" fill="#3b2a22" />
      <path d="M17.42 45.47c0-6.37 4.46-10.2 10.2-10.2s10.2 3.83 10.2 10.2z" fill="#f08a24" />
      <circle cx="41.01" cy="27.62" r="5.1" fill="#e9b48c" />
      <path d="M35.27 26.98c0-3.82 2.55-5.73 5.74-5.73 3.82 0 5.74 2.55 5.74 5.73-2.55 0-5.1-1.27-6.38-3.18-.64 1.91-2.55 3.18-5.1 3.18z" fill="#1f1a30" />
      <path d="M31.45 46.75c0-5.74 3.82-9.57 9.56-9.57s9.56 3.83 9.56 9.57z" fill="#3f4197" />
    </svg>
  );
}

export function LocationIllustration(props: IconProps) {
  return (
    <svg viewBox="0 0 68 68" fill="none" aria-hidden {...props}>
      <ellipse cx="34" cy="49.3" rx="8.92" ry="2.55" fill="#d9dcef" />
      <path d="M34 16.15c-7.02 0-12.12 5.1-12.12 12.11 0 8.92 12.12 19.76 12.12 19.76s12.11-10.84 12.11-19.76c0-7.01-5.1-12.11-12.11-12.11z" fill="#e5484d" />
      <path d="M34 16.15c-7.02 0-12.12 5.1-12.12 12.11 0 1.27.26 2.55.64 3.82 1.91-7.65 7.01-12.11 12.75-12.11 3.82 0 7.01 1.91 8.93 4.46-1.92-5.1-5.74-8.28-10.2-8.28z" fill="#f26b6f" />
      <circle cx="34" cy="28.26" r="5.1" fill="#fff" />
    </svg>
  );
}

export function PencilIllustration(props: IconProps) {
  return (
    <svg viewBox="-6.02 -6.02 88.04 88.04" fill="none" aria-hidden {...props}>
      <path d="M44.33 5.53l22.01 15.41-28.9 41.27-22.01-15.41z" fill="#f5b731" />
      <path d="M55.33 13.23l11.01 7.71-28.9 41.27-11-7.71z" fill="#f08a24" />
      <path d="M15.43 46.8l22.01 15.41-22.15 11.14z" fill="#f7d9b5" />
      <path d="M15.07 72.94l4.47-1.99-4.13-2.89z" fill="#3b2a22" />
      <path d="M44.33 5.53l3.85-5.51c1.93-2.74 5.44-3.36 8.19-1.43l12.38 8.66c2.75 1.93 3.37 5.43 1.44 8.19l-3.85 5.5z" fill="#f38ba0" />
    </svg>
  );
}

/* ---------- Decorations ---------- */

/** 5×3 grid of small purple squares ("Isolation_Mode" 96×38). */
export function DotGrid({ uid, ...props }: GradProps) {
  const xs = [0, 22.84, 45.69, 68.53, 91.38];
  const ys = [0, 16.72, 33.44];
  return (
    <svg viewBox="0 0 96 38" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}-dots`} x1="0" y1="0" x2="96" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8757b0" />
          <stop offset="1" stopColor="#e0bdf7" />
        </linearGradient>
      </defs>
      {ys.map((y) => xs.map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="4.61" height="4.55" fill={`url(#${uid}-dots)`} />))}
    </svg>
  );
}

/** Orange plus + lilac plus ("Isolation_Mode" 60×20). */
export function PlusPair({ uid, ...props }: GradProps) {
  return (
    <svg viewBox="0 0 59.8 19.56" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}-plus`} x1="1" y1="0" x2="0" y2="1">
          <stop stopColor="#e0bdf7" />
          <stop offset="1" stopColor="#b48ad6" />
        </linearGradient>
      </defs>
      <path d="M19.56 12.35V7.19h-7.21V0H7.2v7.19H0v5.16h7.2v7.21h5.15v-7.21z" fill="#f78433" />
      <path d="M52.59 12.35h7.21V7.19h-7.21V0h-5.15v7.19h-7.2v5.16h7.2v7.21h5.15z" fill={`url(#${uid}-plus)`} />
    </svg>
  );
}

/** Three orange zig-zag lines ("Isolation_Mode" 129×43). */
export function Zigzag({ uid, ...props }: GradProps) {
  const xs = [127.75, 113.64, 99.54, 85.43, 71.33, 57.22, 43.12, 29.02, 14.91, 0.81];
  const rows: [number, number][] = [
    [31.9, 41.7],
    [16.81, 26.62],
    [1.72, 11.53],
  ];
  return (
    <svg viewBox="0 0 128.55 43.43" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}-zig`} x1="0" y1="0" x2="128.55" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffad44" />
          <stop offset="1" stopColor="#fe893e" />
        </linearGradient>
      </defs>
      {rows.map(([low, high]) => (
        <polyline
          key={low}
          points={xs.map((x, i) => `${x},${i % 2 === 0 ? high : low}`).join(" ")}
          stroke={`url(#${uid}-zig)`}
          strokeWidth="2.83"
        />
      ))}
    </svg>
  );
}

/** Orange 3D square ring ("Group 36"). */
export function SquareRing3D({ uid, ...props }: GradProps) {
  return (
    <svg viewBox="6072 3589 208.03 147.07" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}-a`} x1="0" y1="0.03" x2="1" y2="1">
          <stop stopColor="#ffc9a3" />
          <stop offset="1" stopColor="#f78433" />
        </linearGradient>
        <linearGradient id={`${uid}-b`} x1="1" y1="0.03" x2="0" y2="1">
          <stop stopColor="#f78433" />
          <stop offset="1" stopColor="#e05f05" />
        </linearGradient>
        <linearGradient id={`${uid}-c`} x1="0" y1="0.23" x2="1" y2="0.68">
          <stop stopColor="#e05f05" />
          <stop offset="1" stopColor="#f78433" />
        </linearGradient>
        <linearGradient id={`${uid}-d`} x1="1" y1="0.23" x2="0" y2="0.68">
          <stop stopColor="#d76a1a" />
          <stop offset="1" stopColor="#f58432" />
        </linearGradient>
        <linearGradient id={`${uid}-e`} x1="0.28" y1="-0.08" x2="0.72" y2="1.12">
          <stop stopColor="#ffe067" />
          <stop offset="1" stopColor="#fec34a" />
        </linearGradient>
      </defs>
      <path d="M6086.02 3653.93l91.47 65.22-1.95 17.35-91.47-65.22z" fill={`url(#${uid}-a)`} />
      <path d="M6177.49 3719.15l103.7-43.21-1.96 17.35-103.69 43.21z" fill={`url(#${uid}-b)`} />
      <path d="M6129.39 3658.83l57.64-24.25-1.96 17.35-57.63 24.24z" fill={`url(#${uid}-c)`} />
      <path d="M6187.03 3634.58l50.79 36.47-1.96 17.35-50.79-36.47z" fill={`url(#${uid}-d)`} />
      <path
        d="M6189.72 3610.73l91.47 65.21-103.7 43.21-91.47-65.22zm-2.69 23.85l-57.64 24.25 50.79 36.47 57.64-24.25z"
        fill={`url(#${uid}-e)`}
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Purple 3D pyramid ("Group 35"). Rendered unrotated; callers rotate it like the design (122°). */
export function Pyramid3D({ uid, ...props }: GradProps) {
  return (
    <svg viewBox="7400 3277 147 93" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}-a`} x1="0.29" y1="0.15" x2="0.82" y2="0.98">
          <stop stopColor="#c3c4ea" />
          <stop offset="1" stopColor="#9fa0d7" />
        </linearGradient>
        <linearGradient id={`${uid}-b`} x1="0.15" y1="0.06" x2="0.91" y2="0.8">
          <stop stopColor="#9fa0d7" />
          <stop offset="1" stopColor="#5b5db0" />
        </linearGradient>
        <linearGradient id={`${uid}-c`} x1="0.11" y1="0.04" x2="1" y2="0.93">
          <stop stopColor="#7c7ec6" />
          <stop offset="1" stopColor="#3f4197" />
        </linearGradient>
        <linearGradient id={`${uid}-d`} x1="0.91" y1="0.07" x2="0.15" y2="0.93">
          <stop stopColor="#3f4197" />
          <stop offset="1" stopColor="#2e307a" />
        </linearGradient>
      </defs>
      <path d="M7400.79 3368.96l104.31.66-7.51-49.59z" fill={`url(#${uid}-a)`} />
      <path d="M7400.79 3368.96l96.8-48.93-58.8-41.03z" fill={`url(#${uid}-b)`} />
      <path d="M7546.48 3277.54l-41.38 92.08-7.51-49.59z" fill={`url(#${uid}-c)`} />
      <path d="M7546.48 3277.54l-48.89 42.49-58.8-41.03z" fill={`url(#${uid}-d)`} />
    </svg>
  );
}

/** Lightning bolt used on the promo countdown pill ("Group 29"). */
export function PromoBolt({ uid, ...props }: GradProps) {
  return (
    <svg viewBox="6639.5 758 39 58.77" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}-side`} x1="0.08" y1="0.06" x2="0.83" y2="1">
          <stop stopColor="#f78433" />
          <stop offset="1" stopColor="#e05f05" />
        </linearGradient>
        <linearGradient id={`${uid}-face`} x1="0.18" y1="0.04" x2="0.76" y2="0.96">
          <stop stopColor="#ffe067" />
          <stop offset="1" stopColor="#fec34a" />
        </linearGradient>
        <linearGradient id={`${uid}-shine`} x1="0.23" y1="0.04" x2="0.73" y2="0.93">
          <stop stopColor="#fff6c8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe067" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M6666.74 761.2l-23.5 29.92h14.95l-6.41 25.64 26.72-34.19h-16.03l8.55-21.37z" fill={`url(#${uid}-side)`} />
      <path d="M6663 758l-23.5 29.91h14.95l-6.41 25.65 26.71-34.2h-16.02l8.55-21.36z" fill={`url(#${uid}-face)`} />
      <path d="M6663 758l-23.5 29.91h14.95l4.28-8.55h-7.48L6667.28 758z" fill={`url(#${uid}-shine)`} />
    </svg>
  );
}

/** Hero blob behind the two students ("Vector 1"). */
export function HeroBlob({ uid, ...props }: GradProps) {
  return (
    <svg viewBox="6806 262 628 425" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}-blob`} x1="0.44" y1="0.05" x2="0.48" y2="1.03">
          <stop stopColor="#f58432" />
          <stop offset="1" stopColor="#404394" />
        </linearGradient>
      </defs>
      <path
        d="M7176.08 494.67c-19.52-119.97-42.85-291.83-241.87-212.8-106.65 42.35-263.29 389.89 93.32 404.17 356.62 14.28 475.17-191.37 370.9-291.82-104.27-100.45-202.83 220.41-222.35 100.45z"
        fill={`url(#${uid}-blob)`}
      />
    </svg>
  );
}

export type ProgramPalette = { from: string; mid: string; to: string; bubble: string; bubbleSoft: string; accent: string };

/** Right-hand art of the program card ("Art / Blob & dekorasi"). Colors switch per jenjang tab. */
export function ProgramBlob({ uid, palette, ...props }: GradProps & { palette: ProgramPalette }) {
  return (
    <svg viewBox="6949 2141 466 360" fill="none" preserveAspectRatio="xMaxYMid slice" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${uid}-blob`} x1="0" y1="0.05" x2="1" y2="1">
          <stop stopColor={palette.from} />
          <stop offset="0.45" stopColor={palette.mid} />
          <stop offset="1" stopColor={palette.to} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0.72" cy="0.35" r="0.55">
          <stop stopColor={palette.bubble} stopOpacity="0.75" />
          <stop offset="1" stopColor={palette.bubble} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M6988.57 2140.99H7415v455.36h-115.5c-62.18 0-79.95-72.86-133.25-91.07-62.19-20.04-106.61-63.75-137.71-136.61-39.97-240.53-31.09-244.28-39.97-253.39z"
        fill={`url(#${uid}-blob)`}
      />
      <path
        d="M6988.57 2140.99H7415v455.36h-115.5c-62.18 0-79.95-72.86-133.25-91.07-62.19-20.04-106.61-63.75-137.71-136.61-39.97-240.53-31.09-244.28-39.97-253.39z"
        fill={`url(#${uid}-glow)`}
      />
      <circle cx="7307.6" cy="2220" r="57.9" fill={palette.bubble} opacity="0.45" />
      <circle cx="7369.63" cy="2261.36" r="33.09" fill={palette.bubbleSoft} opacity="0.4" />
      <circle cx="7274.51" cy="2290.31" r="11.58" fill={palette.bubbleSoft} opacity="0.7" />
      <circle cx="7191.8" cy="2273.77" r="4.97" fill="#fff" opacity="0.6" />
      <circle cx="7348.95" cy="2430.92" r="74.44" fill={palette.accent} opacity="0.25" />
      <circle cx="7084.27" cy="2232.41" r="3.31" fill="#fff" opacity="0.7" />
      <circle className="motion-safe-anim animate-float-slow" cx="7051.25" cy="2295.82" r="74.46" fill="#fcd56c" opacity="0.9" />
      <g className="motion-safe-anim animate-float">
        <path d="M7147.14 2186.62l24.81-12.41 24.82 12.41-24.82 12.4z" fill="#7fb5f5" />
        <path d="M7147.14 2186.62l24.81 12.4v33.09l-24.81-12.41z" fill="#3e86e8" />
        <path d="M7171.95 2199.02l24.82-12.4v33.08l-24.82 12.41z" fill="#2563c9" />
      </g>
      <path
        d="M6985.44 2367.91l-19.49-9.09a3.3 3.3 0 00-4.4 1.6l-9.09 19.49a3.3 3.3 0 001.6 4.4l19.5 9.09a3.3 3.3 0 004.39-1.6l9.09-19.49a3.3 3.3 0 00-1.6-4.4z"
        fill={palette.bubbleSoft}
        opacity="0.85"
      />
    </svg>
  );
}

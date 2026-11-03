const ID = "id-ID";
/** Everyone uses the app in WIB; servers (Vercel) run in UTC, so pin the zone explicitly. */
export const TZ = "Asia/Jakarta";
const OFFSET = 7 * 3_600_000; // WIB = UTC+7, no DST
const DAY = 86_400_000;

/** Day number in WIB, for "same day" checks. */
export const wibDay = (d: Date) => Math.floor((d.getTime() + OFFSET) / DAY);
/** 00.00 WIB of `d`, shifted by `days`. */
export const wibStartOfDay = (d = new Date(), days = 0) => new Date((wibDay(d) + days) * DAY - OFFSET);
/** Calendar parts of `d` as seen in WIB. */
export function wibParts(d: Date) {
  const s = new Date(d.getTime() + OFFSET);
  return { y: s.getUTCFullYear(), m: s.getUTCMonth(), day: s.getUTCDate(), h: s.getUTCHours() };
}
/** 00.00 WIB on the 1st of month `m` (0-based) of year `y`. */
export const wibMonthStart = (y: number, m: number) => new Date(Date.UTC(y, m, 1) - OFFSET);

export const num = (n: number) => n.toLocaleString(ID);

export const rupiah = (n: number) => "Rp" + n.toLocaleString(ID);

/** Rp450rb, Rp1,5jt — the short form used on price cards. */
export function rupiahShort(n: number) {
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toLocaleString(ID, { maximumFractionDigits: 1 })}jt`;
  if (n >= 1000) return `Rp${Math.round(n / 1000)}rb`;
  return rupiah(n);
}

const time = (d: Date) => d.toLocaleTimeString(ID, { hour: "2-digit", minute: "2-digit", timeZone: TZ }).replace(":", ".");

/** "5 menit lalu", "2 jam lalu", "Kemarin 07.12", "3 Okt". */
export function ago(d: Date | null | undefined, now = new Date()) {
  if (!d) return "—";
  const diff = now.getTime() - d.getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  if (wibDay(d) === wibDay(now)) return `${Math.floor(min / 60)} jam lalu`;
  if (wibDay(d) === wibDay(now) - 1) return `Kemarin ${time(d)}`;
  return shortDate(d);
}

export const shortDate = (d: Date) => d.toLocaleDateString(ID, { day: "numeric", month: "short", timeZone: TZ }).replace(".", "");

export const longDate = (d: Date) => d.toLocaleDateString(ID, { day: "numeric", month: "short", year: "numeric", timeZone: TZ }).replace(".", "");

export const fullDate = (d: Date) => d.toLocaleDateString(ID, { day: "numeric", month: "long", year: "numeric", timeZone: TZ });

export const weekdayShort = (d: Date) => d.toLocaleDateString(ID, { weekday: "short", timeZone: TZ }).replace(".", "");

export const monthLabel = (d: Date) => d.toLocaleDateString(ID, { month: "long", year: "numeric", timeZone: TZ });

export const dayDate = (d: Date) => `${d.toLocaleDateString(ID, { weekday: "long", timeZone: TZ })}, ${shortDate(d)} pukul ${time(d)}`;

export { time as clock };

/** Deadline label: "hari ini", "besok", "lewat 2 hari", "29 Okt". */
export function due(d: Date, now = new Date()) {
  const days = wibDay(d) - wibDay(now);
  if (days === 0) return "hari ini";
  if (days === 1) return "besok";
  if (days < 0) return `lewat ${-days} hari`;
  return shortDate(d);
}

export function duration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function daysLeft(d: Date | null | undefined, now = new Date()) {
  if (!d) return 0;
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86_400_000));
}

/** "Selamat pagi/siang/sore/malam" by local hour. */
export function greeting(now = new Date()) {
  const h = wibParts(now).h;
  return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
}

export const firstName = (name: string) => name.split(" ")[0];

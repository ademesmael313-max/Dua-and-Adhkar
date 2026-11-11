export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const dateKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export const uid = () =>
  `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const HIJRI_LOCALE = "en-u-ca-islamic-umalqura";

export const hijriDate = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat(HIJRI_LOCALE, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
};

export const hijriDateAr = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
};

export const gregorianDate = (date: Date, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  } catch {
    return date.toDateString();
  }
};

export const timeOfDay = (): "morning" | "afternoon" | "evening" | "night" => {
  const h = new Date().getHours();
  if (h >= 4 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
};

/** Strip Arabic diacritics and unify letter variants for forgiving search. */
export const normalizeArabic = (input: string): string =>
  input
    .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ؤئ]/g, "ء")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeLatin = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‘’ʿʾʻʹ]/g, "")
    .replace(/[ḥḤ]/g, "h")
    .replace(/[ṣṢ]/g, "s")
    .replace(/[ḍḌ]/g, "d")
    .replace(/[ṭṬ]/g, "t")
    .replace(/[ẓẒ]/g, "z")
    .replace(/[āĀ]/g, "a")
    .replace(/[īĪ]/g, "i")
    .replace(/[ūŪ]/g, "u")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const buildHaystack = (parts: Array<string | undefined>): string =>
  parts.filter(Boolean).map((p) => `${normalizeArabic(p!)} ${normalizeLatin(p!)}`).join(" ");

export const matches = (haystack: string, query: string): boolean => {
  const q = query.trim();
  if (!q) return true;
  const variants = [normalizeArabic(q), normalizeLatin(q)].filter(Boolean);
  return variants.every((v) => haystack.includes(v));
};

export const streakFromHistory = (history: string[]): number => {
  const set = new Set(history);
  const today = new Date();
  let cursor = new Date(today);
  if (!set.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(dateKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const downloadFile = (filename: string, contents: string) => {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const shareOrCopy = async (data: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "copied" | "failed"> => {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return "shared";
    }
  } catch {
    /* user cancelled — fall through to copy */
  }
  try {
    await navigator.clipboard.writeText(`${data.text}\n\n${data.url}`);
    return "copied";
  } catch {
    return "failed";
  }
};

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { duas, duasInCategory } from "./data/duas";
import { tasbeehPresets } from "./data/tasbeeh";
import type { CategoryId } from "./data/categories";
import { clamp, dateKey, streakFromHistory, uid } from "./lib/utils";
import { en, ar, type TranslationKey } from "./lib/i18n";
import { androidScheduleReminders, androidSetTheme } from "./lib/native";

export type Mode = "light" | "dark" | "system";
export type Language = "en" | "ar";
export type ArabicFontId = "amiri" | "scheherazade" | "naskh" | "lateef" | "kufi" | "reem";
export type AccentId =
  | "emerald"
  | "indigo"
  | "rose"
  | "amber"
  | "ocean"
  | "plum"
  | "sage"
  | "slate"
  | "crimson"
  | "citrus"
  | "azure"
  | "mauve";

export const arabicFonts: Array<{ id: ArabicFontId; name: string; nameAr: string; stack: string }> = [
  { id: "amiri", name: "Amiri", nameAr: "أميري", stack: '"Amiri", "Noto Naskh Arabic", serif' },
  { id: "scheherazade", name: "Scheherazade", nameAr: "شهرزاد", stack: '"Scheherazade New", "Amiri", serif' },
  { id: "naskh", name: "Noto Naskh", nameAr: "نسخ", stack: '"Noto Naskh Arabic", "Amiri", serif' },
  { id: "lateef", name: "Lateef", nameAr: "لطيف", stack: '"Lateef", "Scheherazade New", serif' },
  { id: "kufi", name: "Noto Kufi", nameAr: "كوفي", stack: '"Noto Kufi Arabic", sans-serif' },
  { id: "reem", name: "Reem Kufi", nameAr: "ريم كوفي", stack: '"Reem Kufi", "Noto Kufi Arabic", sans-serif' },
];

export const accents: Array<{ id: AccentId; name: string; nameAr: string; hue: number; hue2: number }> = [
  { id: "emerald", name: "Emerald", nameAr: "زمردي", hue: 160, hue2: 188 },
  { id: "indigo", name: "Midnight", nameAr: "ليلي", hue: 238, hue2: 262 },
  { id: "rose", name: "Rose", nameAr: "وردي", hue: 344, hue2: 322 },
  { id: "amber", name: "Saffron", nameAr: "زعفراني", hue: 34, hue2: 45 },
  { id: "ocean", name: "Ocean", nameAr: "محيطي", hue: 198, hue2: 218 },
  { id: "plum", name: "Plum", nameAr: "برقوقي", hue: 278, hue2: 302 },
  { id: "sage", name: "Sage", nameAr: "زيتوني", hue: 130, hue2: 150 },
  { id: "slate", name: "Slate", nameAr: "رمادي", hue: 214, hue2: 232 },
  { id: "crimson", name: "Crimson", nameAr: "قرمزي", hue: 352, hue2: 12 },
  { id: "citrus", name: "Citrus", nameAr: "حمضيات", hue: 62, hue2: 42 },
  { id: "azure", name: "Azure", nameAr: "سماوي", hue: 206, hue2: 224 },
  { id: "mauve", name: "Mauve", nameAr: "بنفسجي", hue: 300, hue2: 318 },
];

export interface CustomDua {
  id: string;
  title: string;
  arabic?: string;
  transliteration?: string;
  translation: string;
  note?: string;
  createdAt: number;
}

export interface Settings {
  mode: Mode;
  accent: AccentId;
  arabicFont: ArabicFontId;
  arabicSize: number;
  showTransliteration: boolean;
  showTranslation: boolean;
  language: Language;
  haptics: boolean;
  reminders: {
    morning: boolean;
    evening: boolean;
    morningTime: string;
    eveningTime: string;
  };
}

export interface TasbeehState {
  dhikrId: string;
  target: number;
  count: number;
  rounds: number;
  today: number;
  date: string;
}

export interface AppState {
  settings: Settings;
  bookmarks: string[];
  progress: { date: string; counts: Record<string, number> };
  history: string[];
  customDuas: CustomDua[];
  tasbeeh: TasbeehState;
  onboarded: boolean;
}

const STORAGE_KEY = "noor.state.v1";

const defaultState = (): AppState => ({
  settings: {
    mode: "system",
    accent: "emerald",
    arabicFont: "amiri",
    arabicSize: 34,
    showTransliteration: true,
    showTranslation: true,
    language: "en",
    haptics: true,
    reminders: { morning: true, evening: false, morningTime: "06:30", eveningTime: "18:00" },
  },
  bookmarks: [],
  progress: { date: dateKey(), counts: {} },
  history: [],
  customDuas: [],
  tasbeeh: {
    dhikrId: tasbeehPresets[0].id,
    target: tasbeehPresets[0].target,
    count: 0,
    rounds: 0,
    today: 0,
    date: dateKey(),
  },
  onboarded: false,
});

const loadState = (): AppState => {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const settings: Settings = {
      ...base.settings,
      ...(parsed.settings ?? {}),
      reminders: { ...base.settings.reminders, ...(parsed.settings?.reminders ?? {}) },
    };
    const state: AppState = {
      ...base,
      ...parsed,
      settings,
      progress: parsed.progress ?? base.progress,
      tasbeeh: { ...base.tasbeeh, ...(parsed.tasbeeh ?? {}) },
      bookmarks: parsed.bookmarks ?? [],
      history: parsed.history ?? [],
      customDuas: parsed.customDuas ?? [],
    };
    return rollover(state);
  } catch {
    return base;
  }
};

const rollover = (state: AppState): AppState => {
  const today = dateKey();
  const progress =
    state.progress.date === today ? state.progress : { date: today, counts: {} };
  const tasbeeh =
    state.tasbeeh.date === today
      ? state.tasbeeh
      : { ...state.tasbeeh, date: today, count: 0, rounds: 0, today: 0 };
  return { ...state, progress, tasbeeh };
};

interface AppApi {
  state: AppState;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
  setSettings: (patch: Partial<Settings>) => void;
  toggleBookmark: (duaId: string) => void;
  isBookmarked: (duaId: string) => boolean;
  countFor: (duaId: string) => number;
  incrementDua: (duaId: string, repeat: number) => void;
  completeDua: (duaId: string, repeat: number) => void;
  resetDua: (duaId: string) => void;
  markCategory: (categoryId: CategoryId) => void;
  categoryDone: (categoryId: CategoryId) => number;
  addCustomDua: (input: Omit<CustomDua, "id" | "createdAt">) => void;
  removeCustomDua: (id: string) => void;
  selectDhikr: (dhikrId: string) => void;
  setTarget: (target: number) => void;
  countTasbeeh: () => void;
  resetTasbeeh: () => void;
  resetToday: () => void;
  clearAll: () => void;
  exportData: () => string;
  streak: number;
  completedToday: number;
}

const AppContext = createContext<AppApi | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(loadState);
  const booted = useRef(false);

  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [state]);

  // Visual settings are applied to the document root as CSS variables.
  useEffect(() => {
    const { settings } = state;
    const root = document.documentElement;
    const accent = accents.find((a) => a.id === settings.accent) ?? accents[0];
    const font = arabicFonts.find((f) => f.id === settings.arabicFont) ?? arabicFonts[0];
    const resolved =
      settings.mode === "system"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : settings.mode;
    root.dataset.mode = resolved;
    root.dataset.accent = accent.id;
    root.dataset.font = font.id;
    root.style.setProperty("--ah", String(accent.hue));
    root.style.setProperty("--ah2", String(accent.hue2));
    root.style.setProperty("--arabic-size", `${settings.arabicSize}px`);
    root.style.setProperty("--arabic-font", font.stack);
    root.lang = settings.language;
    root.dir = settings.language === "ar" ? "rtl" : "ltr";
    document.body.dataset.lang = settings.language;
    androidSetTheme(resolved);
  }, [state.settings]);

  // Keep the native alarm schedule in sync with the reminder settings.
  useEffect(() => {
    androidScheduleReminders(state.settings.reminders);
  }, [state.settings.reminders]);

  useEffect(() => {
    if (state.settings.mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const listener = () => {
      document.documentElement.dataset.mode = media.matches ? "light" : "dark";
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [state.settings.mode]);

  // Date rollover: reset daily progress when the app is left open overnight.
  useEffect(() => {
    const check = () => setState((s) => rollover(s));
    const timer = window.setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const toggleBookmark = useCallback((duaId: string) => {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(duaId)
        ? s.bookmarks.filter((id) => id !== duaId)
        : [duaId, ...s.bookmarks],
    }));
  }, []);

  const incrementDua = useCallback((duaId: string, repeat: number) => {
    setState((s) => {
      const today = dateKey();
      const progress = s.progress.date === today ? s.progress : { date: today, counts: {} };
      const current = progress.counts[duaId] ?? 0;
      if (current >= repeat) return s;
      const next = clamp(current + 1, 0, repeat);
      const history =
        next >= repeat && !s.history.includes(today) ? [...s.history, today] : s.history;
      return {
        ...s,
        progress: { date: today, counts: { ...progress.counts, [duaId]: next } },
        history,
      };
    });
  }, []);

  const completeDua = useCallback((duaId: string, repeat: number) => {
    setState((s) => {
      const today = dateKey();
      const progress = s.progress.date === today ? s.progress : { date: today, counts: {} };
      const history = s.history.includes(today) ? s.history : [...s.history, today];
      return {
        ...s,
        progress: { date: today, counts: { ...progress.counts, [duaId]: repeat } },
        history,
      };
    });
  }, []);

  const resetDua = useCallback((duaId: string) => {
    setState((s) => {
      const counts = { ...s.progress.counts };
      delete counts[duaId];
      return { ...s, progress: { ...s.progress, counts } };
    });
  }, []);

  const markCategory = useCallback((categoryId: CategoryId) => {
    setState((s) => {
      const today = dateKey();
      const progress = s.progress.date === today ? s.progress : { date: today, counts: {} };
      const counts = { ...progress.counts };
      for (const dua of duasInCategory(categoryId)) counts[dua.id] = dua.repeat;
      const history = s.history.includes(today) ? s.history : [...s.history, today];
      return { ...s, progress: { date: today, counts }, history };
    });
  }, []);

  const addCustomDua = useCallback((input: Omit<CustomDua, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      customDuas: [{ ...input, id: uid(), createdAt: Date.now() }, ...s.customDuas],
    }));
  }, []);

  const removeCustomDua = useCallback((id: string) => {
    setState((s) => ({ ...s, customDuas: s.customDuas.filter((d) => d.id !== id) }));
  }, []);

  const selectDhikr = useCallback((dhikrId: string) => {
    const preset = tasbeehPresets.find((d) => d.id === dhikrId) ?? tasbeehPresets[0];
    setState((s) => ({
      ...s,
      tasbeeh: {
        ...s.tasbeeh,
        dhikrId,
        target: preset.target,
        count: 0,
        rounds: 0,
        date: dateKey(),
      },
    }));
  }, []);

  const setTarget = useCallback((target: number) => {
    setState((s) => ({
      ...s,
      tasbeeh: { ...s.tasbeeh, target, count: 0, rounds: 0 },
    }));
  }, []);

  const countTasbeeh = useCallback(() => {
    setState((s) => {
      const t = s.tasbeeh;
      const reached = t.count + 1 >= t.target;
      return {
        ...s,
        tasbeeh: {
          ...t,
          count: reached ? 0 : t.count + 1,
          rounds: reached ? t.rounds + 1 : t.rounds,
          today: t.today + 1,
          date: dateKey(),
        },
        history: s.history.includes(dateKey()) ? s.history : [...s.history, dateKey()],
      };
    });
  }, []);

  const resetTasbeeh = useCallback(() => {
    setState((s) => ({ ...s, tasbeeh: { ...s.tasbeeh, count: 0, rounds: 0 } }));
  }, []);

  const resetToday = useCallback(() => {
    setState((s) => ({
      ...s,
      progress: { date: dateKey(), counts: {} },
      tasbeeh: { ...s.tasbeeh, count: 0, rounds: 0, today: 0 },
    }));
  }, []);

  const clearAll = useCallback(() => {
    const fresh = defaultState();
    fresh.settings = state.settings;
    setState(fresh);
  }, [state.settings]);

  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dict = state.settings.language === "ar" ? ar : en;
      let value: string = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replaceAll(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [state.settings.language],
  );

  const categoryDone = useCallback(
    (categoryId: CategoryId) =>
      duasInCategory(categoryId).filter(
        (d) => (state.progress.counts[d.id] ?? 0) >= d.repeat,
      ).length,
    [state.progress],
  );

  const api = useMemo<AppApi>(
    () => ({
      state,
      t,
      dir: state.settings.language === "ar" ? "rtl" : "ltr",
      setSettings,
      toggleBookmark,
      isBookmarked: (id) => state.bookmarks.includes(id),
      countFor: (id) => state.progress.counts[id] ?? 0,
      incrementDua,
      completeDua,
      resetDua,
      markCategory,
      categoryDone,
      addCustomDua,
      removeCustomDua,
      selectDhikr,
      setTarget,
      countTasbeeh,
      resetTasbeeh,
      resetToday,
      clearAll,
      exportData,
      streak: streakFromHistory(state.history),
      completedToday: Object.entries(state.progress.counts).filter(([id, n]) => {
        const dua = duas.find((d) => d.id === id);
        return dua ? n >= dua.repeat : false;
      }).length,
    }),
    [
      state,
      t,
      setSettings,
      toggleBookmark,
      incrementDua,
      completeDua,
      resetDua,
      markCategory,
      categoryDone,
      addCustomDua,
      removeCustomDua,
      selectDhikr,
      setTarget,
      countTasbeeh,
      resetTasbeeh,
      resetToday,
      clearAll,
      exportData,
    ],
  );

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
};

export const useApp = (): AppApi => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

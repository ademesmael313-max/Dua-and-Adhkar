import { useEffect } from "react";
import { useApp } from "./store";
import { go, href, useRoute, type Route } from "./lib/router";
import { Icon, type IconName } from "./components/Icon";
import { cn, dateKey } from "./lib/utils";
import Home from "./views/Home";
import CategoryView from "./views/CategoryView";
import Reader from "./views/Reader";
import SearchView from "./views/SearchView";
import SavedView from "./views/SavedView";
import TasbeehView from "./views/TasbeehView";
import MyDuasView from "./views/MyDuasView";
import SettingsView from "./views/SettingsView";
import type { CategoryId } from "./data/categories";
import { isAndroidApp } from "./lib/native";

const navItems: Array<{ route: Route; icon: IconName; key: "home" | "search" | "tasbeeh" | "saved" | "settings" }> = [
  { route: { name: "home" }, icon: "home", key: "home" },
  { route: { name: "search" }, icon: "search", key: "search" },
  { route: { name: "tasbeeh" }, icon: "beads", key: "tasbeeh" },
  { route: { name: "saved" }, icon: "bookmark", key: "saved" },
  { route: { name: "settings" }, icon: "settings", key: "settings" },
];

const ThemeButton = () => {
  const { state, setSettings, t } = useApp();
  const isDark =
    state.settings.mode === "dark" ||
    (state.settings.mode === "system" &&
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-color-scheme: light)").matches);
  return (
    <button
      className="icon-btn"
      aria-label={t("settings.mode")}
      title={isDark ? t("mode.light") : t("mode.dark")}
      onClick={() => setSettings({ mode: isDark ? "light" : "dark" })}
    >
      <Icon name={isDark ? "sunrise" : "moon"} size={19} />
    </button>
  );
};

const Sidebar = ({ route }: { route: Route }) => {
  const { t, streak, state } = useApp();
  return (
    <aside className="sidebar">
      <a className="brand" href="#/" aria-label={t("brand.name")}>
        <span className="brand-mark" aria-hidden="true">
          <Icon name="sparkle" size={20} strokeWidth={1.4} />
        </span>
        <span className="brand-text">
          <span className="brand-name">{t("brand.name")}</span>
          <span className="brand-sub">{t("brand.tagline")}</span>
        </span>
      </a>

      <nav className="side-nav" aria-label={t("layout.shortcuts")}>
        {navItems.map((item) => (
          <a
            key={item.key}
            href={href(item.route)}
            className={cn("side-link", route.name === item.key && "is-active")}
            aria-current={route.name === item.key ? "page" : undefined}
          >
            <Icon name={item.icon} size={19} />
            <span>{t(`nav.${item.key}`)}</span>
          </a>
        ))}
        <a
          href="#/mine"
          className={cn("side-link", route.name === "mine" && "is-active")}
          aria-current={route.name === "mine" ? "page" : undefined}
        >
          <Icon name="heart" size={19} />
          <span>{t("mine.title")}</span>
        </a>
      </nav>

      <div className="side-card">
        <div className="side-card-head">
          <Icon name="flame" size={18} />
          <span>
            {streak > 0 ? `${streak} ${t("home.streak")}` : t("home.streakNone")}
          </span>
        </div>
        <div className="side-dots" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const active = state.history.includes(dateKey(d));
            return <span key={i} className={cn("dot", active && "is-on")} />;
          })}
        </div>
        <a className="side-card-link" href="#/tasbeeh">
          {t("tasbeeh.title")} <Icon name="arrowRight" size={14} />
        </a>
      </div>

      <div className="side-foot">
        <span className="chip chip-soft">
          <Icon name="shield" size={13} /> {t("layout.offline")}
        </span>
        <p>{t("layout.madeWith")}</p>
      </div>
    </aside>
  );
};

const BottomNav = ({ route }: { route: Route }) => {
  const { t } = useApp();
  return (
    <nav className="bottom-nav" aria-label={t("layout.shortcuts")}>
      {navItems.map((item) => {
        const active = route.name === item.key;
        const isCenter = item.key === "tasbeeh";
        return (
          <a
            key={item.key}
            href={href(item.route)}
            className={cn("bottom-link", isCenter && "is-center", active && "is-active")}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-icon">
              <Icon name={item.icon} size={isCenter ? 24 : 21} />
            </span>
            <span className="bottom-label">{t(`nav.${item.key}`)}</span>
          </a>
        );
      })}
    </nav>
  );
};

const TopBar = ({ route }: { route: Route }) => {
  const { t } = useApp();
  const back = route.name === "category";
  const crumb =
    route.name === "home"
      ? ""
      : route.name === "category"
        ? t("home.chapters")
        : route.name === "dua"
          ? t("dua.reading")
          : t(`nav.${route.name}` as "nav.home");

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {back ? (
          <button
            className="icon-btn"
            onClick={() => go({ name: "home" })}
            aria-label={t("cat.back")}
          >
            <Icon name="chevronLeft" size={19} className="rtl-flip" />
          </button>
        ) : (
          <a className="topbar-brand" href="#/" aria-label={t("brand.name")}>
            <span className="brand-mark small" aria-hidden="true">
              <Icon name="sparkle" size={16} strokeWidth={1.4} />
            </span>
            <span className="topbar-wordmark">{t("brand.name")}</span>
          </a>
        )}
        {crumb && <span className="topbar-crumb">{crumb}</span>}
        <div className="topbar-actions">
          <a
            className={cn("icon-btn hide-sm", route.name === "search" && "is-active")}
            href="#/search"
            aria-label={t("search.title")}
          >
            <Icon name="search" size={19} />
          </a>
          <ThemeButton />
        </div>
      </div>
    </header>
  );
};

const useReminders = () => {
  const { state, t } = useApp();
  const { reminders } = state.settings;
  useEffect(() => {
    // The Android shell schedules real alarms natively (see ReminderScheduler).
    if (isAndroidApp()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const tick = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = dateKey();
      const windows: Array<{ type: "morning" | "evening"; time: string; enabled: boolean }> = [
        { type: "morning", time: reminders.morningTime, enabled: reminders.morning },
        { type: "evening", time: reminders.eveningTime, enabled: reminders.evening },
      ];
      for (const w of windows) {
        if (!w.enabled || w.time !== hhmm) continue;
        const key = `noor.reminded.${today}.${w.type}`;
        if (localStorage.getItem(key)) continue;
        try {
          new Notification(w.type === "morning" ? t("home.morningWindow") : t("home.eveningWindow"), {
            body: t("home.windowBody"),
            icon: "./icons/icon-192.png",
          });
          localStorage.setItem(key, "1");
        } catch {
          /* notification failed silently */
        }
      }
    };
    const timer = window.setInterval(tick, 20_000);
    tick();
    return () => window.clearInterval(timer);
  }, [reminders, t]);
};

const App = () => {
  const { t } = useApp();
  const route = useRoute();
  useReminders();

  const isReader = route.name === "dua";

  const content = (() => {
    switch (route.name) {
      case "category":
        return <CategoryView key={route.id} id={route.id as CategoryId} />;
      case "dua":
        return <Reader key={route.id} id={route.id} />;
      case "search":
        return <SearchView />;
      case "saved":
        return <SavedView />;
      case "tasbeeh":
        return <TasbeehView />;
      case "mine":
        return <MyDuasView />;
      case "settings":
        return <SettingsView />;
      default:
        return <Home />;
    }
  })();

  return (
    <div className={cn("app", isReader && "app-reader")}>
      <a className="skip-link" href="#main">
        {t("layout.skip")}
      </a>
      {!isReader && <Sidebar route={route} />}
      <div className="main">
        {!isReader && <TopBar route={route} />}
        <main className="content" id="main">
          {content}
        </main>
        {!isReader && <BottomNav route={route} />}
      </div>
    </div>
  );
};

export default App;

import { useMemo } from "react";
import { useApp } from "../store";
import { Icon, type IconName } from "../components/Icon";
import { GeoBackdrop, ProgressRing, Stars } from "../components/ui";
import { go } from "../lib/router";
import { categories, type Category } from "../data/categories";
import { categoryCounts, duaOfTheDay, duasInCategory } from "../data/duas";
import {
  gregorianDate,
  hijriDate,
  hijriDateAr,
  timeOfDay,
} from "../lib/utils";

const iconFor = (category: Category): IconName =>
  category.icon === "quran" ? "book" : (category.icon as IconName);

const ChapterCard = ({ category }: { category: Category }) => {
  const { categoryDone, state } = useApp();
  const isArabic = state.settings.language === "ar";
  const total = duasInCategory(category.id).length;
  const done = categoryDone(category.id);
  const pct = total ? (done / total) * 100 : 0;

  return (
    <a
      href={`#/c/${category.id}`}
      className="chapter-card"
      style={{ ["--ch" as string]: category.hue }}
    >
      <span className="chapter-icon">
        <Icon name={iconFor(category)} size={22} />
      </span>
      <div className="chapter-body">
        <h3>{isArabic ? category.nameAr : category.name}</h3>
        {isArabic ? (
          <p className="chapter-en">{category.name}</p>
        ) : (
          <p className="chapter-ar" lang="ar" dir="rtl">
            {category.nameAr}
          </p>
        )}
      </div>
      <div className="chapter-meta">
        <span>
          {total} {state.settings.language === "ar" ? "دعاء" : "duas"}
        </span>
        {done > 0 && (
          <span className="chip chip-tiny">
            {done}/{total}
          </span>
        )}
      </div>
      <span className="chapter-bar" aria-hidden="true">
        <span style={{ width: `${Math.max(pct, done > 0 ? 6 : 0)}%` }} />
      </span>
    </a>
  );
};

const Home = () => {
  const { t, state, categoryDone, streak, completedToday, isBookmarked, toggleBookmark } = useApp();
  const today = new Date();
  const time = timeOfDay();
  const isArabic = state.settings.language === "ar";

  const focusCategory: Category = useMemo(() => {
    if (time === "morning") return categories[0];
    if (time === "evening" || time === "night") return categories[1];
    return categories[2];
  }, [time]);

  const focusDuas = duasInCategory(focusCategory.id);
  const focusDone = categoryDone(focusCategory.id);
  const pct = focusDuas.length ? focusDone / focusDuas.length : 0;

  const daily = useMemo(() => duaOfTheDay(today), []);
  const counts = categoryCounts();
  const totalDuas = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalDone = categories.reduce((acc, c) => acc + categoryDone(c.id), 0);

  const quickLinks: Array<{ href: string; icon: IconName; label: string; meta: string }> = [
    { href: "#/tasbeeh", icon: "beads", label: t("nav.tasbeeh"), meta: t("tasbeeh.tapHint") },
    { href: "#/search", icon: "search", label: t("nav.search"), meta: t("search.hint") },
    { href: "#/saved", icon: "bookmark", label: t("nav.saved"), meta: `${state.bookmarks.length} ${t("common.saved")}` },
    { href: "#/mine", icon: "heart", label: t("mine.title"), meta: t("mine.subtitle") },
  ];

  return (
    <div className="home">
      <section className="hero">
        <GeoBackdrop className="hero-geo" />
        <Stars className="hero-stars" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-inner">
          <p className="hero-salam" lang="ar" dir="rtl">
            السَّلَامُ عَلَيْكُمْ
          </p>
          <h1>
            {t(`greeting.${time}`)}
            {!isArabic && <span className="hero-dot">.</span>}
          </h1>
          <p className="hero-sub">{t("home.sub")}</p>
          <div className="hero-meta">
            <span className="pill">
              <Icon name="moon" size={14} />
              {isArabic ? hijriDateAr(today) : hijriDate(today)}
            </span>
            <span className="pill pill-ghost">{gregorianDate(today, state.settings.language)}</span>
          </div>
        </div>
        <div className="hero-streak">
          <ProgressRing
            value={totalDuas ? totalDone / totalDuas : 0}
            size={58}
            stroke={3}
            trackOpacity={0.2}
          >
            <Icon name="flame" size={18} />
          </ProgressRing>
          <div>
            <strong>
              {streak > 0 ? `${streak} ${t("home.streak")}` : t("home.streakNone")}
            </strong>
            <span>{t("home.progressOf", { done: completedToday, total: totalDuas })}</span>
          </div>
        </div>
      </section>

      <section
        className="focus-card"
        style={{ ["--ch" as string]: focusCategory.hue }}
        aria-labelledby="focus-title"
      >
        <GeoBackdrop className="focus-geo" />
        <div className="focus-top">
          <span className="eyebrow eyebrow-light">
            <Icon name="sunrise" size={15} />
            {t("home.focus")}
          </span>
          <span className="focus-count">
            {focusDone} / {focusDuas.length}
          </span>
        </div>
        <div className="focus-main">
          <p className="focus-ar" lang="ar" dir="rtl">
            {focusCategory.nameAr}
          </p>
          <h2 id="focus-title">{focusCategory.name}</h2>
          <p className="focus-desc">{focusCategory.description}</p>
        </div>
        <div className="focus-foot">
          <div className="focus-progress" aria-hidden="true">
            <span style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
          <button
            className="btn btn-glass"
            onClick={() => go({ name: "category", id: focusCategory.id })}
          >
            {focusDone > 0 ? t("home.continue") : t("home.beginNow")}
            <Icon name="arrowRight" size={17} className="rtl-flip" />
          </button>
        </div>
      </section>

      <section className="quick-grid" aria-label={t("home.quick")}>
        {quickLinks.map((link) => (
          <a className="quick-tile" href={link.href} key={link.href}>
            <span className="quick-icon">
              <Icon name={link.icon} size={20} />
            </span>
            <span className="quick-label">{link.label}</span>
            <span className="quick-meta">{link.meta}</span>
          </a>
        ))}
      </section>

      <section className="daily-card">
        <div className="daily-head">
          <span className="eyebrow">
            <Icon name="sparkle" size={15} />
            {t("home.ofTheDay")}
          </span>
          <button
            className={`icon-btn small ${isBookmarked(daily.id) ? "is-on" : ""}`}
            onClick={() => toggleBookmark(daily.id)}
            aria-label={t("dua.savedAdd")}
            aria-pressed={isBookmarked(daily.id)}
          >
            <Icon name={isBookmarked(daily.id) ? "bookmarkFill" : "bookmark"} size={17} />
          </button>
        </div>
        <h2 className="daily-title">{daily.title}</h2>
        <p className="daily-ar arabic-inline" lang="ar" dir="rtl">
          {daily.arabic.length > 190 ? `${daily.arabic.slice(0, 190)}…` : daily.arabic}
        </p>
        <p className="daily-translation">{daily.translation}</p>
        <div className="daily-foot">
          <span className="chip chip-ghost">{daily.reference}</span>
          <a className="text-link" href={`#/d/${daily.id}`}>
            {t("home.read")}
            <Icon name="arrowRight" size={15} className="rtl-flip" />
          </a>
        </div>
      </section>

      <section className="section" aria-labelledby="chapters-title">
        <div className="section-head">
          <div>
            <h2 id="chapters-title">{t("home.chapters")}</h2>
            <p>{t("home.chaptersSub")}</p>
          </div>
          <span className="section-meta">{t("home.totalDuas", { n: totalDuas })}</span>
        </div>
        <div className="chapter-grid">
          {categories.map((category) => (
            <ChapterCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <footer className="page-foot">
        <span className="chip chip-soft">
          <Icon name="shield" size={13} /> {t("layout.offline")}
        </span>
        <p>{t("layout.madeWith")}</p>
      </footer>
    </div>
  );
};

export default Home;

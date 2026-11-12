import { useMemo, useState } from "react";
import { useApp, arabicFonts } from "../store";
import { categoryById } from "../data/categories";
import { duaById, duasInCategory } from "../data/duas";
import { Icon } from "../components/Icon";
import { ProgressRing, Sheet, useToast } from "../components/ui";
import { go } from "../lib/router";
import { useRecitation } from "../lib/speech";
import { cn, shareOrCopy } from "../lib/utils";
import { haptic } from "../lib/native";

const Reader = ({ id }: { id: string }) => {
  const {
    t,
    state,
    countFor,
    incrementDua,
    resetDua,
    isBookmarked,
    toggleBookmark,
    setSettings,
  } = useApp();
  const toast = useToast();
  const [fontOpen, setFontOpen] = useState(false);

  const dua = useMemo(() => duaById(id), [id]);
  const siblings = useMemo(() => (dua ? duasInCategory(dua.categoryId) : []), [dua]);
  const index = dua ? siblings.findIndex((d) => d.id === dua.id) : -1;
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  const recitation = useRecitation(dua?.arabic ?? "", () => toast(t("dua.noSpeechNative")));

  if (!dua) {
    return (
      <div className="reader">
        <div className="reader-bar">
          <button className="icon-btn" onClick={() => go({ name: "home" })} aria-label={t("common.back")}>
            <Icon name="chevronLeft" size={19} className="rtl-flip" />
          </button>
        </div>
        <div className="reader-empty">
          <h1>404</h1>
          <p>{t("search.empty")}</p>
          <button className="btn btn-primary" onClick={() => go({ name: "home" })}>
            {t("cat.back")}
          </button>
        </div>
      </div>
    );
  }

  const category = categoryById(dua.categoryId);
  const count = countFor(dua.id);
  const done = count >= dua.repeat;
  const isArabic = state.settings.language === "ar";

  const handleCount = () => {
    if (done) return;
    incrementDua(dua.id, dua.repeat);
    if (state.settings.haptics) haptic(12);
    if (count + 1 >= dua.repeat) toast(t("dua.completedToast"));
  };

  const handleCopy = async () => {
    const text = [dua.arabic, dua.transliteration, dua.translation, dua.reference]
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast(t("dua.copied"));
    } catch {
      toast(t("dua.copied"));
    }
  };

  const handleShare = async () => {
    const result = await shareOrCopy({
      title: dua.title,
      text: `${dua.title}\n\n${dua.translation}`,
      url: window.location.href,
    });
    if (result === "copied") toast(t("dua.copied"));
  };

  const handleListen = () => {
    if (recitation.speaking) {
      recitation.stop();
      return;
    }
    if (!recitation.speak()) toast(t("dua.noSpeech"));
  };

  const activeFont = arabicFonts.find((f) => f.id === state.settings.arabicFont) ?? arabicFonts[0];

  return (
    <div className="reader">
      <header className="reader-bar">
        <button
          className="icon-btn"
          onClick={() => go({ name: "category", id: category.id })}
          aria-label={t("common.back")}
        >
          <Icon name="chevronLeft" size={19} className="rtl-flip" />
        </button>
        <div className="reader-crumbs">
          <span>{isArabic ? category.nameAr : category.name}</span>
          <span className="reader-crumb-sep">·</span>
          <span>{t("dua.of", { i: index + 1, n: siblings.length })}</span>
        </div>
        <div className="reader-bar-actions">
          <button
            className={cn("icon-btn", isBookmarked(dua.id) && "is-on")}
            onClick={() => {
              toggleBookmark(dua.id);
              toast(isBookmarked(dua.id) ? t("dua.unbookmarked") : t("dua.bookmarked"));
            }}
            aria-label={isBookmarked(dua.id) ? t("dua.savedRemove") : t("dua.savedAdd")}
            aria-pressed={isBookmarked(dua.id)}
          >
            <Icon name={isBookmarked(dua.id) ? "bookmarkFill" : "bookmark"} size={19} />
          </button>
          <button className="icon-btn" onClick={handleShare} aria-label={t("dua.share")}>
            <Icon name="share" size={19} />
          </button>
        </div>
      </header>

      <div className="reader-scroll">
        <article className="reader-card">
          <header className="reader-heading">
            <a className="eyebrow eyebrow-link" href={`#/c/${category.id}`}>
              <Icon name={category.icon === "quran" ? "book" : category.icon} size={14} />
              {isArabic ? category.nameAr : category.name}
            </a>
            <h1>{dua.title}</h1>
            <p className="reader-title-ar" lang="ar" dir="rtl">
              {dua.titleAr}
            </p>
          </header>

          <div className="reader-tools">
            <button className={cn("tool-btn", recitation.speaking && "is-on")} onClick={handleListen}>
              <Icon name={recitation.speaking ? "stop" : "volume"} size={16} />
              {recitation.speaking ? t("dua.stop") : t("dua.listen")}
            </button>
            <button className="tool-btn" onClick={handleCopy}>
              <Icon name="copy" size={16} />
              {t("dua.copy")}
            </button>
            <button className="tool-btn" onClick={() => setFontOpen(true)}>
              <Icon name="type" size={16} />
              {t("dua.reading")}
            </button>
            <span className="tool-spacer" />
            <span className="reader-repeat">{dua.repeat > 1 ? `×${dua.repeat}` : "1"}</span>
          </div>

          <div className="arabic-text" dir="rtl" lang="ar">
            {dua.arabic}
          </div>

          <div className="ornament" aria-hidden="true">
            <span />
            <Icon name="sparkle" size={15} />
            <span />
          </div>

          {state.settings.showTransliteration && dua.transliteration && (
            <section className="reader-block">
              <h2>{t("dua.transliteration")}</h2>
              <p className="translit-text" lang="en" dir="ltr">
                {dua.transliteration}
              </p>
            </section>
          )}

          {state.settings.showTranslation && (
            <section className="reader-block">
              <h2>{t("dua.translation")}</h2>
              <p className="translation-text">{dua.translation}</p>
            </section>
          )}

          {dua.note && (
            <aside className="virtue-card">
              <span className="virtue-icon">
                <Icon name="sparkle" size={17} />
              </span>
              <div>
                <h2>{t("dua.virtue")}</h2>
                <p>{dua.note}</p>
              </div>
            </aside>
          )}

          <footer className="reader-source">
            <span className="source-icon">
              <Icon name="shield" size={16} />
            </span>
            <div>
              <span>{t("dua.reference")}</span>
              <strong>{dua.reference}</strong>
            </div>
          </footer>

          <nav className="reader-nav" aria-label={t("home.chapters")}>
            {prev ? (
              <a className="reader-nav-link" href={`#/d/${prev.id}`}>
                <Icon name="chevronLeft" size={16} className="rtl-flip" />
                <span>
                  <small>{t("dua.prev")}</small>
                  {prev.title}
                </span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a className="reader-nav-link is-next" href={`#/d/${next.id}`}>
                <span>
                  <small>{t("dua.next")}</small>
                  {next.title}
                </span>
                <Icon name="chevronRight" size={16} className="rtl-flip" />
              </a>
            ) : (
              <span />
            )}
          </nav>
        </article>
      </div>

      <div className="counter-dock">
        <button
          className="counter-dock-btn"
          onClick={handleCount}
          disabled={done}
          aria-label={done ? t("dua.completed") : t("dua.tapToCount")}
        >
          <ProgressRing
            value={dua.repeat ? count / dua.repeat : 0}
            size={46}
            stroke={3.4}
            className="counter-ring"
          >
            {done ? (
              <Icon name="check" size={20} strokeWidth={2.4} />
            ) : (
              <span className="counter-value">
                {count}
                <small>/{dua.repeat}</small>
              </span>
            )}
          </ProgressRing>
          <span className="counter-text">
            <strong>{done ? t("dua.completed") : t("dua.tapToCount")}</strong>
            <small>{done ? `${dua.repeat} × ${t("dua.repeat")}` : `${count} ${t("dua.of", { i: count, n: dua.repeat })}`}</small>
          </span>
        </button>
        <div className="counter-actions">
          <button
            className="icon-btn"
            onClick={() => {
              resetDua(dua.id);
              toast(t("dua.resetCount"));
            }}
            aria-label={t("dua.resetCount")}
            title={t("dua.resetCount")}
          >
            <Icon name="refresh" size={18} />
          </button>
        </div>
      </div>

      <Sheet
        open={fontOpen}
        onClose={() => setFontOpen(false)}
        title={t("dua.reading")}
        subtitle={t("settings.arabicFont")}
      >
        <div className="field">
          <div className="field-head">
            <label htmlFor="reader-size">{t("dua.size")}</label>
            <span className="field-value">{state.settings.arabicSize}px</span>
          </div>
          <input
            id="reader-size"
            type="range"
            min={24}
            max={56}
            step={2}
            value={state.settings.arabicSize}
            onChange={(e) => setSettings({ arabicSize: Number(e.target.value) })}
          />
          <p className="font-preview arabic-inline" lang="ar" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
        <div className="field">
          <div className="field-head">
            <span>{t("dua.font")}</span>
            <span className="field-value">{activeFont.name}</span>
          </div>
          <div className="font-grid">
            {arabicFonts.map((font) => (
              <button
                key={font.id}
                className={cn("font-option", state.settings.arabicFont === font.id && "is-active")}
                style={{ fontFamily: font.stack }}
                onClick={() => setSettings({ arabicFont: font.id })}
              >
                <span lang="ar" dir="rtl">
                  أذكار
                </span>
                <small>{isArabic ? font.nameAr : font.name}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="toggle-row">
          <span>{t("settings.showTranslit")}</span>
          <button
            className={cn("toggle", state.settings.showTransliteration && "is-on")}
            role="switch"
            aria-checked={state.settings.showTransliteration}
            aria-label={t("settings.showTranslit")}
            onClick={() => setSettings({ showTransliteration: !state.settings.showTransliteration })}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        <div className="toggle-row">
          <span>{t("settings.showTranslation")}</span>
          <button
            className={cn("toggle", state.settings.showTranslation && "is-on")}
            role="switch"
            aria-checked={state.settings.showTranslation}
            aria-label={t("settings.showTranslation")}
            onClick={() => setSettings({ showTranslation: !state.settings.showTranslation })}
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </Sheet>
    </div>
  );
};

export default Reader;

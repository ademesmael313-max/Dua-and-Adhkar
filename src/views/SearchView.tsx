import { useMemo, useRef, useState } from "react";
import { useApp } from "../store";
import { categories } from "../data/categories";
import { duas } from "../data/duas";
import { DuaRow } from "../components/DuaRow";
import { Icon } from "../components/Icon";
import { EmptyState } from "../components/ui";
import { buildHaystack, matches } from "../lib/utils";

const searchIndex = duas.map((dua) => {
  const category = categories.find((c) => c.id === dua.categoryId);
  return {
    dua,
    haystack: buildHaystack([
      dua.title,
      dua.titleAr,
      dua.arabic,
      dua.transliteration,
      dua.translation,
      dua.reference,
      duoCategory(dua.categoryId),
      category?.name,
      category?.nameAr,
    ]),
  };
});

function duoCategory(id: string) {
  return categories.find((c) => c.id === id)?.name ?? "";
}

const suggestions = [
  "forgiveness",
  "travel",
  "anxiety",
  "morning",
  "رَبَّنَا",
  "sleep",
  "healing",
  "parents",
];

const SearchView = () => {
  const { t, state } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isArabic = state.settings.language === "ar";

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchIndex.filter((entry) => matches(entry.haystack, query)).map((e) => e.dua);
  }, [query]);

  const chapterHits = useMemo(() => {
    if (!query.trim()) return [];
    return categories.filter((c) =>
      matches(buildHaystack([c.name, c.nameAr, c.tagline, c.description]), query),
    );
  }, [query]);

  return (
    <div className="page search-page">
      <div className="page-head">
        <div>
          <h1>{t("search.title")}</h1>
          <p>{t("search.hint")}</p>
        </div>
      </div>
      <div className="search-field">
        <Icon name="search" size={19} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.title")}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            className="icon-btn small"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label={t("common.close")}
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {!query.trim() && (
        <>
          <div className="search-suggestions">
            <span className="eyebrow">{t("search.recent")}</span>
            <div className="chip-row">
              {suggestions.map((s) => (
                <button key={s} className="chip chip-button" onClick={() => setQuery(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="search-chapters">
            <span className="eyebrow">{t("search.chapters")}</span>
            <div className="search-chapter-grid">
              {categories.map((c) => (
                <a key={c.id} href={`#/c/${c.id}`} className="search-chapter">
                  <span className="search-chapter-ar" lang="ar" dir="rtl">
                    {c.nameAr}
                  </span>
                  <span>{c.name}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {query.trim() && (
        <div className="search-results">
          <div className="search-results-head">
            <span>
              {t("search.results", { n: results.length + chapterHits.length })}
              <span className="search-query"> “{query.trim()}”</span>
            </span>
            {results.length > 0 && <span className="chip chip-soft">{t("dua.translation")}</span>}
          </div>

          {chapterHits.map((c) => (
            <a key={c.id} href={`#/c/${c.id}`} className="search-hit-chapter">
              <span className="quick-icon">
                <Icon name={c.icon === "quran" ? "book" : c.icon} size={17} />
              </span>
              <span>
                <strong>{isArabic ? c.nameAr : c.name}</strong>
                <small>{c.description.slice(0, 76)}…</small>
              </span>
              <Icon name="chevronRight" size={16} className="rtl-flip" />
            </a>
          ))}

          {results.map((dua, i) => (
            <DuaRow key={dua.id} dua={dua} index={i} showCategory />
          ))}

          {results.length === 0 && chapterHits.length === 0 && (
            <EmptyState
              icon={<Icon name="search" size={26} />}
              title={t("search.empty")}
              body={t("search.emptyHint")}
              action={
                <button className="btn btn-outline btn-sm" onClick={() => setQuery("")}>
                  {t("common.reset")}
                </button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchView;

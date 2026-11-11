import { useApp } from "../store";
import { categoryById } from "../data/categories";
import type { Dua } from "../data/types";
import { Icon } from "./Icon";
import { cn } from "../lib/utils";

interface DuaRowProps {
  dua: Dua;
  index?: number;
  showCategory?: boolean;
}

export const DuaRow = ({ dua, index, showCategory }: DuaRowProps) => {
  const { t, countFor, isBookmarked, toggleBookmark, state } = useApp();
  const count = countFor(dua.id);
  const done = count >= dua.repeat;
  const category = categoryById(dua.categoryId);
  const isArabic = state.settings.language === "ar";

  return (
    <div className={cn("dua-row", done && "is-done")}>
      <a className="dua-row-link" href={`#/d/${dua.id}`}>
        <span className={cn("dua-index", done && "is-done")} aria-hidden="true">
          {done ? <Icon name="check" size={15} strokeWidth={2.4} /> : String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <span className="dua-row-main">
          <span className="dua-row-top">
            <span className="dua-row-title">{dua.title}</span>
            <span className="dua-repeat" aria-label={t("dua.repeat")}>
              {dua.repeat > 1 ? `×${dua.repeat}` : "1"}
            </span>
          </span>
          <span className="dua-row-ar" lang="ar" dir="rtl">
            {dua.arabic.replace(/\n+/g, " ").slice(0, 90)}
            {dua.arabic.length > 90 ? "…" : ""}
          </span>
          <span className="dua-row-meta">
            {showCategory ? (
              <>
                <Icon name="book" size={12} />
                {isArabic ? category.nameAr : category.name}
              </>
            ) : (
              dua.reference
            )}
            {count > 0 && !done && (
              <span className="dua-row-count">
                {count}/{dua.repeat}
              </span>
            )}
          </span>
        </span>
      </a>
      <button
        className={cn("dua-row-save", isBookmarked(dua.id) && "is-on")}
        aria-label={isBookmarked(dua.id) ? t("dua.savedRemove") : t("dua.savedAdd")}
        aria-pressed={isBookmarked(dua.id)}
        onClick={() => toggleBookmark(dua.id)}
      >
        <Icon name={isBookmarked(dua.id) ? "bookmarkFill" : "bookmark"} size={17} />
      </button>
    </div>
  );
};

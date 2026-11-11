import { useMemo } from "react";
import { useApp } from "../store";
import { categoryById, type CategoryId } from "../data/categories";
import { duasInCategory } from "../data/duas";
import { DuaRow } from "../components/DuaRow";
import { Icon, type IconName } from "../components/Icon";
import { ProgressRing, useToast } from "../components/ui";

const CategoryView = ({ id }: { id: CategoryId }) => {
  const { t, state, categoryDone, markCategory } = useApp();
  const toast = useToast();
  const category = categoryById(id);
  const duas = useMemo(() => duasInCategory(id), [id]);
  const done = categoryDone(id);
  const pct = duas.length ? done / duas.length : 0;
  const isArabic = state.settings.language === "ar";
  const icon: IconName = category.icon === "quran" ? "book" : (category.icon as IconName);
  const totalRepeats = duas.reduce((acc, d) => acc + d.repeat, 0);
  const minutes = Math.max(2, Math.round(totalRepeats * 0.07));

  return (
    <div className="page category-page">
      <header className="cat-head" style={{ ["--ch" as string]: category.hue }}>
        <div className="cat-head-top">
          <span className="cat-icon">
            <Icon name={icon} size={26} />
          </span>
          <div className="cat-head-titles">
            <p className="cat-ar" lang="ar" dir="rtl">
              {category.nameAr}
            </p>
            <h1>{category.name}</h1>
          </div>
        </div>
        <p className="cat-desc">{category.description}</p>
        <div className="cat-progress">
          <ProgressRing value={pct} size={52} stroke={4}>
            <span className="cat-progress-value">{Math.round(pct * 100)}%</span>
          </ProgressRing>
          <div className="cat-progress-info">
            <strong>{t("cat.todayProgress", { done, total: duas.length })}</strong>
            <span>
              {duas.length} {isArabic ? "أدعية" : "duas"} · {minutes} {t("home.min")}
            </span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              markCategory(id);
              toast(t("dua.completedToast"));
            }}
          >
            <Icon name="checkCircle" size={16} />
            {t("cat.markAll")}
          </button>
        </div>
      </header>

      <div className="dua-list">
        {duas.length === 0 && <p className="muted-note">{t("cat.empty")}</p>}
        {duas.map((dua, index) => (
          <DuaRow key={dua.id} dua={dua} index={index} />
        ))}
      </div>

      <footer className="page-foot">
        <span className="chip chip-soft">
          <Icon name="shield" size={13} /> {t("settings.authenticity")}
        </span>
        <p>{t("layout.madeWith")}</p>
      </footer>
    </div>
  );
};

export default CategoryView;

import { useApp } from "../store";
import { duas } from "../data/duas";
import { DuaRow } from "../components/DuaRow";
import { Icon } from "../components/Icon";
import { EmptyState } from "../components/ui";

const SavedView = () => {
  const { t, state } = useApp();
  const saved = state.bookmarks
    .map((id) => duas.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <div className="page saved-page">
      <div className="page-head">
        <div>
          <h1>{t("saved.title")}</h1>
          <p>{t("saved.subtitle")}</p>
        </div>
        <span className="section-meta">{t("saved.count", { n: saved.length })}</span>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon={<Icon name="bookmark" size={26} />}
          title={t("saved.empty")}
          body={t("saved.emptyHint")}
          action={
            <a className="btn btn-primary btn-sm" href="#/">
              {t("saved.cta")}
              <Icon name="arrowRight" size={16} className="rtl-flip" />
            </a>
          }
        />
      ) : (
        <div className="dua-list">
          {saved.map((dua, i) => (
            <DuaRow key={dua.id} dua={dua} index={i} showCategory />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedView;

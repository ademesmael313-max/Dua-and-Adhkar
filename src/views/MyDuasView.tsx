import { useState, type FormEvent } from "react";
import { useApp } from "../store";
import { Icon } from "../components/Icon";
import { EmptyState, Sheet, useToast } from "../components/ui";

const MyDuasView = () => {
  const { t, state, addCustomDua, removeCustomDua } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    arabic: "",
    transliteration: "",
    translation: "",
    note: "",
  });
  const [error, setError] = useState("");

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !(form.arabic.trim() || form.translation.trim())) {
      setError(t("mine.required"));
      return;
    }
    addCustomDua({
      title: form.title.trim(),
      arabic: form.arabic.trim() || undefined,
      transliteration: form.transliteration.trim() || undefined,
      translation: form.translation.trim(),
      note: form.note.trim() || undefined,
    });
    setForm({ title: "", arabic: "", transliteration: "", translation: "", note: "" });
    setError("");
    setOpen(false);
    toast(t("common.saved"));
  };

  return (
    <div className="page mine-page">
      <div className="page-head">
        <div>
          <h1>{t("mine.title")}</h1>
          <p>{t("mine.subtitle")}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
          <Icon name="plus" size={16} />
          {t("mine.add")}
        </button>
      </div>

      {state.customDuas.length === 0 ? (
        <EmptyState
          icon={<Icon name="heart" size={26} />}
          title={t("mine.empty")}
          body={t("mine.emptyHint")}
          action={
            <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
              <Icon name="plus" size={15} />
              {t("mine.add")}
            </button>
          }
        />
      ) : (
        <>
          <p className="section-meta mine-count">{t("mine.count", { n: state.customDuas.length })}</p>
          <div className="mine-list">
            {state.customDuas.map((dua) => (
              <article className="mine-card" key={dua.id}>
                <header>
                  <h3>{dua.title}</h3>
                  <span className="chip chip-tiny">
                    {new Date(dua.createdAt).toLocaleDateString(
                      state.settings.language === "ar" ? "ar" : "en-GB",
                      { day: "numeric", month: "short" },
                    )}
                  </span>
                </header>
                {dua.arabic && (
                  <p className="mine-ar" lang="ar" dir="rtl">
                    {dua.arabic}
                  </p>
                )}
                {dua.transliteration && <p className="mine-translit">{dua.transliteration}</p>}
                {dua.translation && <p className="mine-translation">{dua.translation}</p>}
                {dua.note && <p className="mine-note">{dua.note}</p>}
                <footer>
                  {confirmId === dua.id ? (
                    <div className="mine-confirm">
                      <span>{t("mine.delete")}?</span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          removeCustomDua(dua.id);
                          setConfirmId(null);
                          toast(t("common.delete"));
                        }}
                      >
                        {t("common.delete")}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setConfirmId(null)}
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="icon-btn small"
                      onClick={() => setConfirmId(dua.id)}
                      aria-label={t("mine.delete")}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  )}
                </footer>
              </article>
            ))}
          </div>
        </>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("mine.new")}
        subtitle={t("mine.subtitle")}
      >
        <form className="dua-form" onSubmit={submit}>
          <label className="field">
            <span>{t("mine.titleField")}</span>
            <input
              data-autofocus
              value={form.title}
              onChange={(e) => update("title")(e.target.value)}
              placeholder={t("mine.titleField")}
              required
            />
          </label>
          <label className="field">
            <span>
              {t("mine.arabicField")}{" "}
              <small className="field-hint">RTL</small>
            </span>
            <textarea
              value={form.arabic}
              onChange={(e) => update("arabic")(e.target.value)}
              dir="rtl"
              lang="ar"
              rows={3}
              className="arabic-input"
            />
          </label>
          <label className="field">
            <span>{t("mine.translitField")}</span>
            <input
              value={form.transliteration}
              onChange={(e) => update("transliteration")(e.target.value)}
            />
          </label>
          <label className="field">
            <span>{t("mine.meaningField")}</span>
            <textarea
              value={form.translation}
              onChange={(e) => update("translation")(e.target.value)}
              rows={3}
            />
          </label>
          <label className="field">
            <span>{t("mine.noteField")}</span>
            <input value={form.note} onChange={(e) => update("note")(e.target.value)} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              {t("mine.cancel")}
            </button>
            <button type="submit" className="btn btn-primary">
              <Icon name="check" size={16} />
              {t("mine.save")}
            </button>
          </div>
        </form>
      </Sheet>
    </div>
  );
};

export default MyDuasView;

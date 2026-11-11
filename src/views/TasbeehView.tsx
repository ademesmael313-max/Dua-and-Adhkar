import { useMemo } from "react";
import { useApp } from "../store";
import { tasbeehPresets, targetOptions } from "../data/tasbeeh";
import { Icon } from "../components/Icon";
import { ProgressRing, useToast } from "../components/ui";
import { cn } from "../lib/utils";

const TasbeehView = () => {
  const { t, state, countTasbeeh, resetTasbeeh, selectDhikr, setTarget } = useApp();
  const toast = useToast();
  const tasbeeh = state.tasbeeh;
  const dhikr = useMemo(
    () => tasbeehPresets.find((d) => d.id === tasbeeh.dhikrId) ?? tasbeehPresets[0],
    [tasbeeh.dhikrId],
  );
  const progress = tasbeeh.target ? tasbeeh.count / tasbeeh.target : 0;
  const isArabic = state.settings.language === "ar";

  const tap = () => {
    const willComplete = tasbeeh.count + 1 >= tasbeeh.target;
    countTasbeeh();
    if (state.settings.haptics && "vibrate" in navigator) navigator.vibrate?.(10);
    if (willComplete) toast(t("tasbeeh.reached"));
  };

  return (
    <div className="page tasbeeh-page">
      <div className="page-head">
        <div>
          <h1>{t("tasbeeh.title")}</h1>
          <p>{t("tasbeeh.subtitle")}</p>
        </div>
        <span className="chip chip-soft">
          <Icon name="beads" size={13} />
          {tasbeeh.today} {isArabic ? "اليوم" : "today"}
        </span>
      </div>

      <section className="tasbeeh-stage">
        <div className="stage-glow" aria-hidden="true" />
        <p className="stage-ar" lang="ar" dir="rtl">
          {dhikr.arabic}
        </p>
        <p className="stage-translit">{dhikr.transliteration}</p>
        <p className="stage-meaning">{dhikr.meaning}</p>

        <button className="dial" onClick={tap} aria-label={t("tasbeeh.tapHint")}>
          <span className="dial-ticks" aria-hidden="true" />
          <ProgressRing value={progress} size={236} stroke={5} trackOpacity={0.12}>
            <span className="dial-value">{tasbeeh.count}</span>
            <span className="dial-target">
              {t("tasbeeh.target")} {tasbeeh.target}
            </span>
          </ProgressRing>
        </button>
        <p className="dial-hint">
          <Icon name="beads" size={14} /> {t("tasbeeh.tapHint")}
        </p>

        <div className="tasbeeh-stats">
          <div className="stat">
            <strong>{tasbeeh.rounds}</strong>
            <span>{t("tasbeeh.rounds")}</span>
          </div>
          <div className="stat">
            <strong>{tasbeeh.today}</strong>
            <span>{t("tasbeeh.today")}</span>
          </div>
          <button className="stat stat-btn" onClick={resetTasbeeh}>
            <Icon name="refresh" size={18} />
            <span>{t("tasbeeh.reset")}</span>
          </button>
        </div>

        <div className="target-row" role="group" aria-label={t("tasbeeh.target")}>
          {targetOptions.map((target) => (
            <button
              key={target}
              className={cn("chip chip-button", tasbeeh.target === target && "is-active")}
              onClick={() => setTarget(target)}
            >
              {target}
            </button>
          ))}
        </div>
      </section>

      {dhikr.virtue && (
        <aside className="virtue-card virtue-soft">
          <span className="virtue-icon">
            <Icon name="sparkle" size={17} />
          </span>
          <div>
            <h2>{t("tasbeeh.virtue")}</h2>
            <p>{dhikr.virtue}</p>
          </div>
        </aside>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <h2>{t("tasbeeh.presets")}</h2>
            <p>{t("tasbeeh.subtitle")}</p>
          </div>
        </div>
        <div className="preset-grid">
          {tasbeehPresets.map((preset) => (
            <button
              key={preset.id}
              className={cn("preset-card", preset.id === tasbeeh.dhikrId && "is-active")}
              onClick={() => selectDhikr(preset.id)}
              aria-pressed={preset.id === tasbeeh.dhikrId}
            >
              <span className="preset-ar" lang="ar" dir="rtl">
                {preset.arabic}
              </span>
              <span className="preset-translit">{preset.transliteration}</span>
              <span className="preset-meta">
                <Icon name="refresh" size={12} /> {preset.target}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TasbeehView;

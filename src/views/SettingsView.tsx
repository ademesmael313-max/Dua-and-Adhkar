import { useEffect, useState, type ReactNode } from "react";
import { accents, arabicFonts, useApp, type AccentId, type Language, type Mode } from "../store";
import { Icon } from "../components/Icon";
import { Segmented, Sheet, Toggle, useToast } from "../components/ui";
import { cn, downloadFile } from "../lib/utils";
import {
  androidNotificationPermission,
  androidOpenNotificationSettings,
  androidRequestNotifications,
  isAndroidApp,
} from "../lib/native";

const Group = ({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) => (
  <section className="settings-group">
    <h2 className="settings-group-title">
      {icon}
      {title}
    </h2>
    <div className="settings-card">{children}</div>
  </section>
);

const Row = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="settings-row">
    <div className="settings-row-text">
      <span>{title}</span>
      {hint && <p>{hint}</p>}
    </div>
    <div className="settings-row-control">{children}</div>
  </div>
);

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<unknown> };

const SettingsView = () => {
  const { t, state, setSettings, resetToday, clearAll, exportData, streak, completedToday } =
    useApp();
  const toast = useToast();
  const settings = state.settings;
  const isArabic = settings.language === "ar";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [permission, setPermission] = useState<string>("default");
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const native = isAndroidApp();

  useEffect(() => {
    const host = window as unknown as {
      NoorNotificationPermission?: (granted: boolean) => void;
    };

    if (isAndroidApp()) {
      setPermission(androidNotificationPermission() ? "granted" : "default");
      host.NoorNotificationPermission = (granted) => {
        setPermission(granted ? "granted" : "denied");
        toast(t(granted ? "settings.notificationsOn" : "settings.notificationsBlocked"));
      };
    } else if ("Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }

    setStandalone(
      window.matchMedia?.("(display-mode: standalone)").matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
    );
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      delete host.NoorNotificationPermission;
    };
  }, [t]);

  const askNotifications = async () => {
    if (native) {
      if (androidRequestNotifications()) {
        setPermission("granted");
        toast(t("settings.notificationsOn"));
      }
      return;
    }
    if (!("Notification" in window)) {
      toast(t("settings.notificationsHint"));
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") toast(t("settings.notificationsOn"));
    if (result === "denied") toast(t("settings.notificationsBlocked"));
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
  };

  return (
    <div className="page settings-page">
      <div className="page-head">
        <div>
          <h1>{t("settings.title")}</h1>
          <p>{t("settings.subtitle")}</p>
        </div>
      </div>
      <div className="journey-card">
        <div className="journey-head">
          <span className="eyebrow eyebrow-light">
            <Icon name="sparkle" size={14} />
            {t("settings.stats")}
          </span>
        </div>
        <div className="journey-stats">
          <div>
            <strong>{streak}</strong>
            <span>{t("settings.days")}</span>
          </div>
          <div>
            <strong>{completedToday}</strong>
            <span>{t("settings.totalReads")}</span>
          </div>
          <div>
            <strong>{state.bookmarks.length}</strong>
            <span>{t("common.saved")}</span>
          </div>
        </div>
        <div className="journey-dots" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            const active = state.history.includes(
              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate(),
              ).padStart(2, "0")}`,
            );
            return <span key={i} className={cn("dot", active && "is-on")} />;
          })}
        </div>
      </div>

      <Group title={t("settings.appearance")} icon={<Icon name="sparkle" size={16} />}>
        <Row title={t("settings.mode")}>
          <Segmented<Mode>
            value={settings.mode}
            onChange={(mode) => setSettings({ mode })}
            label={t("settings.mode")}
            options={[
              { value: "light", label: t("mode.light") },
              { value: "dark", label: t("mode.dark") },
              { value: "system", label: t("mode.system") },
            ]}
          />
        </Row>
        <Row
          title={t("settings.accent")}
          hint={
            isArabic
              ? accents.find((a) => a.id === settings.accent)?.nameAr
              : accents.find((a) => a.id === settings.accent)?.name
          }
        >
          <div className="swatches">
            {accents.map((accent) => (
              <button
                key={accent.id}
                className={cn("swatch", settings.accent === accent.id && "is-active")}
                style={{
                  ["--sh" as string]: accent.hue,
                  ["--sh2" as string]: accent.hue2,
                }}
                onClick={() => setSettings({ accent: accent.id as AccentId })}
                aria-label={isArabic ? accent.nameAr : accent.name}
                aria-pressed={settings.accent === accent.id}
                title={isArabic ? accent.nameAr : accent.name}
              >
                <span />
              </button>
            ))}
          </div>
        </Row>
      </Group>

      <Group title={t("settings.reading")} icon={<Icon name="type" size={16} />}>
        <div className="settings-block">
          <div className="settings-row-text">
            <span>{t("settings.arabicFont")}</span>
            <p>{isArabic ? arabicFonts.find((f) => f.id === settings.arabicFont)?.nameAr : arabicFonts.find((f) => f.id === settings.arabicFont)?.name}</p>
          </div>
          <div className="font-grid settings-font-grid">
            {arabicFonts.map((font) => (
              <button
                key={font.id}
                className={cn(
                  "font-option",
                  settings.arabicFont === font.id && "is-active",
                )}
                style={{ fontFamily: font.stack }}
                onClick={() => setSettings({ arabicFont: font.id })}
                aria-pressed={settings.arabicFont === font.id}
              >
                <span lang="ar" dir="rtl">
                  أذكار
                </span>
                <small>{isArabic ? font.nameAr : font.name}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="settings-block">
          <div className="field-head">
            <span>{t("settings.arabicSize")}</span>
            <span className="field-value">{settings.arabicSize}px</span>
          </div>
          <input
            type="range"
            min={24}
            max={56}
            step={2}
            value={settings.arabicSize}
            onChange={(e) => setSettings({ arabicSize: Number(e.target.value) })}
            aria-label={t("settings.arabicSize")}
          />
          <p className="font-preview" lang="ar" dir="rtl">
            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
          </p>
        </div>
        <Row title={t("settings.showTranslit")}>
          <Toggle
            checked={settings.showTransliteration}
            onChange={(v) => setSettings({ showTransliteration: v })}
            label={t("settings.showTranslit")}
          />
        </Row>
        <Row title={t("settings.showTranslation")}>
          <Toggle
            checked={settings.showTranslation}
            onChange={(v) => setSettings({ showTranslation: v })}
            label={t("settings.showTranslation")}
          />
        </Row>
      </Group>

      <Group title={t("settings.language")} icon={<Icon name="globe" size={16} />}>
        <Row title={t("settings.language")} hint={t("settings.languageHint")}>
          <Segmented<Language>
            value={settings.language}
            onChange={(language) => setSettings({ language })}
            label={t("settings.language")}
            options={[
              { value: "en", label: "English" },
              { value: "ar", label: "العربية" },
            ]}
          />
        </Row>
      </Group>

      <Group title={t("settings.reminders")} icon={<Icon name="bell" size={16} />}>
        <Row title={t("settings.morningReminder")}>
          <div className="reminder-control">
            <input
              type="time"
              value={settings.reminders.morningTime}
              onChange={(e) =>
                setSettings({ reminders: { ...settings.reminders, morningTime: e.target.value } })
              }
              aria-label={t("settings.morningReminder")}
            />
            <Toggle
              checked={settings.reminders.morning}
              onChange={(morning) => setSettings({ reminders: { ...settings.reminders, morning } })}
              label={t("settings.morningReminder")}
            />
          </div>
        </Row>
        <Row title={t("settings.eveningReminder")}>
          <div className="reminder-control">
            <input
              type="time"
              value={settings.reminders.eveningTime}
              onChange={(e) =>
                setSettings({ reminders: { ...settings.reminders, eveningTime: e.target.value } })
              }
              aria-label={t("settings.eveningReminder")}
            />
            <Toggle
              checked={settings.reminders.evening}
              onChange={(evening) => setSettings({ reminders: { ...settings.reminders, evening } })}
              label={t("settings.eveningReminder")}
            />
          </div>
        </Row>
        <div className="settings-block settings-notify">
          <p>{native ? t("settings.notificationsNative") : t("settings.notificationsHint")}</p>
          {native && permission === "denied" ? (
            <button className="btn btn-outline btn-sm" onClick={androidOpenNotificationSettings}>
              <Icon name="settings" size={15} />
              {t("settings.openSettings")}
            </button>
          ) : (
            <button
              className="btn btn-outline btn-sm"
              onClick={askNotifications}
              disabled={permission === "granted" || permission === "denied"}
            >
            <Icon name="bell" size={15} />
              {permission === "granted"
                ? t("settings.notificationsOn")
                : permission === "denied"
                  ? t("settings.notificationsBlocked")
                  : t("settings.enableNotifications")}
            </button>
          )}
        </div>
        <Row title={t("tasbeeh.haptics")}>
          <Toggle
            checked={settings.haptics}
            onChange={(haptics) => setSettings({ haptics })}
            label={t("tasbeeh.haptics")}
          />
        </Row>
      </Group>

      <Group title={t("settings.data")} icon={<Icon name="shield" size={16} />}>
        <Row title={t("settings.export")} hint="JSON">
          <button
            className="icon-btn"
            onClick={() => {
              downloadFile("noor-backup.json", exportData());
              toast(t("settings.export"));
            }}
            aria-label={t("settings.export")}
          >
            <Icon name="download" size={18} />
          </button>
        </Row>
        <Row title={t("settings.resetProgress")}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              resetToday();
              toast(t("settings.resetProgress"));
            }}
          >
            <Icon name="refresh" size={15} />
            {t("common.reset")}
          </button>
        </Row>
        <div className="settings-block">
          <p className="muted-note">{t("settings.clearConfirm")}</p>
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmOpen(true)}>
            <Icon name="trash" size={15} />
            {t("settings.clear")}
          </button>
        </div>
      </Group>

      <Group title={t("settings.about")} icon={<Icon name="info" size={16} />}>
        <div className="settings-block about-block">
          <div className="about-mark" aria-hidden="true">
            <Icon name="sparkle" size={22} />
          </div>
          <p>{t("settings.aboutText")}</p>
          <h3>{t("settings.authenticity")}</h3>
          <p className="muted-note">{t("settings.authenticityText")}</p>
          <div className="about-actions">
            {standalone || native ? (
              <span className="chip chip-soft">
                <Icon name="checkCircle" size={13} /> {t("settings.installed")}
              </span>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={install} disabled={!installEvent}>
                <Icon name="download" size={15} />
                {t("settings.install")}
              </button>
            )}
            <a className="text-link" href="mailto:admin@duaandazkar.com">
              admin@duaandazkar.com
              <Icon name="arrowUpRight" size={14} />
            </a>
          </div>
          <p className="settings-version">{t("settings.version")}</p>
        </div>
      </Group>

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("settings.clear")}
        subtitle={t("settings.danger")}
      >
        <p className="sheet-warning">{t("settings.clearConfirm")}</p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>
            {t("common.cancel")}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              clearAll();
              setConfirmOpen(false);
              toast(t("settings.clear"));
            }}
          >
            <Icon name="trash" size={16} />
            {t("settings.clearYes")}
          </button>
        </div>
      </Sheet>
    </div>
  );
};

export default SettingsView;

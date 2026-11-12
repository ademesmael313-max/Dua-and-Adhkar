/**
 * Bridge to the Android shell (`android/`).
 *
 * The web build runs unchanged in a browser; when it is packaged inside the
 * Kotlin WebView, `window.NoorAndroid` exposes native capabilities that the
 * web platform cannot provide inside a WebView (alarms, share sheet, saving a
 * backup to Downloads, system text-to-speech and system-bar theming).
 */

interface NativeReminders {
  morning: { enabled: boolean; time: string };
  evening: { enabled: boolean; time: string };
}

interface NoorAndroidBridge {
  platform(): string;
  setTheme(theme: string): void;
  vibrate(milliseconds: number): void;
  share(text: string): boolean;
  saveFile(name: string, content: string): boolean;
  scheduleReminders(payload: string): boolean;
  requestNotificationPermission(): boolean;
  notificationPermission(): boolean;
  openNotificationSettings(): void;
  openTtsSettings(): void;
  ttsAvailable(): boolean;
  speak(text: string): void;
  stopSpeaking(): void;
}

const getBridge = (): NoorAndroidBridge | null => {
  if (typeof window === "undefined") return null;
  const bridge = (window as unknown as { NoorAndroid?: NoorAndroidBridge }).NoorAndroid;
  return bridge && typeof bridge.platform === "function" ? bridge : null;
};

const guard = <T>(run: () => T, fallback: T): T => {
  try {
    return run();
  } catch {
    return fallback;
  }
};

/** True when running inside the Android WebView shell. */
export const isAndroidApp = (): boolean => getBridge() !== null;

export const androidPlatform = (): string => {
  const bridge = getBridge();
  return bridge ? guard(() => bridge.platform(), "web") : "web";
};

export const androidSetTheme = (theme: "light" | "dark"): void => {
  const bridge = getBridge();
  if (bridge) guard(() => bridge.setTheme(theme), undefined);
};

export const androidShare = (text: string): boolean => {
  const bridge = getBridge();
  return bridge ? guard(() => bridge.share(text), false) : false;
};

export const androidSaveFile = (name: string, content: string): boolean => {
  const bridge = getBridge();
  return bridge ? guard(() => bridge.saveFile(name, content), false) : false;
};

export const androidVibrate = (milliseconds = 10): boolean => {
  const bridge = getBridge();
  if (!bridge) return false;
  return guard(() => {
    bridge.vibrate(milliseconds);
    return true;
  }, false);
};

export const androidScheduleReminders = (reminders: {
  morning: boolean;
  evening: boolean;
  morningTime: string;
  eveningTime: string;
}): boolean => {
  const bridge = getBridge();
  if (!bridge) return false;
  const payload: NativeReminders = {
    morning: { enabled: reminders.morning, time: reminders.morningTime },
    evening: { enabled: reminders.evening, time: reminders.eveningTime },
  };
  return guard(() => bridge.scheduleReminders(JSON.stringify(payload)), false);
};

export const androidNotificationPermission = (): boolean => {
  const bridge = getBridge();
  return bridge ? guard(() => bridge.notificationPermission(), false) : false;
};

export const androidRequestNotifications = (): boolean => {
  const bridge = getBridge();
  return bridge ? guard(() => bridge.requestNotificationPermission(), false) : false;
};

export const androidOpenNotificationSettings = (): void => {
  const bridge = getBridge();
  if (bridge) guard(() => bridge.openNotificationSettings(), undefined);
};

export const androidOpenTtsSettings = (): void => {
  const bridge = getBridge();
  if (bridge) guard(() => bridge.openTtsSettings(), undefined);
};

export const androidTtsAvailable = (): boolean => {
  const bridge = getBridge();
  return bridge ? guard(() => bridge.ttsAvailable(), false) : false;
};

export const androidSpeak = (text: string): void => {
  const bridge = getBridge();
  if (bridge) guard(() => bridge.speak(text), undefined);
};

export const androidStopSpeaking = (): void => {
  const bridge = getBridge();
  if (bridge) guard(() => bridge.stopSpeaking(), undefined);
};

/** Haptic tap: native vibrator when packaged, Vibration API in the browser. */
export const haptic = (milliseconds = 10): void => {
  if (androidVibrate(milliseconds)) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate?.(milliseconds);
  }
};

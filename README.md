# Noor · دعاء وأذكار

A modern, offline-first reimagining of the **Dua & Azkar** app — rebuilt from the ground up as an
installable web app. Seventy-one authentic supplications across nine chapters, with transliteration,
English translation, hadith references, an Arabic typeface studio, a tactile tasbeeh, personal duas,
daily reminders, and a calm, contemporary interface.

> **Live preview:** run `npm run dev` and open the printed URL.

---

## Why this exists

The original Play Store app is loved for its content and its nine focused chapters, but its interface
shows its age: fixed themes, dense lists, and little room for personalisation. Noor keeps the
authentic content and the same spirit, and rebuilds the experience around three ideas:

1. **The dua is the interface.** Typography, spacing and motion exist to make Arabic comfortable to
   read — not to decorate around it.
2. **Local first, network never.** Everything is bundled; the app works on a plane, in a masjid with
   no signal, and keeps your progress in your own browser.
3. **Small, honest details.** Every card carries a source. Nothing is invented, and nothing is
   gamified for its own sake.

---

## Feature highlights

| Area | What’s inside |
| --- | --- |
| **Nine chapters** | Morning, evening, Qur’anic duas, after salah, ruqya & healing, anxiety & hardship, forgiveness, travel, everyday life — 71 supplications with Arabic, transliteration, English meaning, references and virtue notes. |
| **Reading experience** | Adjustable Arabic size (24–56 px), six Arabic typefaces (Amiri, Scheherazade New, Noto Naskh, Lateef, Noto Kufi, Reem Kufi), transliteration and translation toggles, Arabic-only mode. |
| **Recitation** | Unhurried Arabic speech-synthesis playback with sentence chunking, pause and stop. |
| **Tasbeeh** | A 12-preset dhikr counter with a tick-ring dial, 33/99/100/1000 targets, round tracking, session totals and haptic taps. |
| **Personal duas** | Write your own supplication in any language and keep it in the same quiet space. |
| **Progress & streaks** | Per-dua repeat counters, daily chapter rings, 14-day activity dots, and a streak that respects your time zone. |
| **Search** | Instant search across Arabic (diacritic-insensitive), transliteration (diacritic- and macron-insensitive), English and references — and chapter descriptions. |
| **Saved duas** | Bookmark anything; it follows you across routes and sessions. |
| **Themes** | Eight curated accents × light/dark/system, plus six Arabic fonts. All colours derive from a single hue pair through CSS custom properties. |
| **Reminders** | Morning and evening notifications with configurable times (delivered while the app is open; install it for device-level delivery). |
| **Bilingual UI** | Full English and Arabic interface with automatic RTL layout and Arabic typography rules. |
| **Offline & installable** | PWA manifest, service worker, app shortcuts, maskable icons. |
| **Accessible by default** | Keyboard focus rings, 44 px touch targets, ARIA roles for switches/dialogs/live regions, reduced-motion support, semantic headings. |

### The nine chapters

| Chapter | Arabic | Duas |
| --- | --- | --- |
| Morning Adhkar | أذكار الصباح | 10 |
| Evening Adhkar | أذكار المساء | 8 |
| Qur’anic Duas | أدعية قرآنية | 13 |
| After Salah | أذكار بعد الصلاة | 6 |
| Ruqya & Healing | الرقية الشرعية | 6 |
| Anxiety & Hardship | دعاء الهم والحزن | 6 |
| Forgiveness | الاستغفار والتوبة | 5 |
| Travel & Journey | دعاء السفر | 5 |
| Everyday Life | أدعية الحياة اليومية | 12 |

---

## What was modernised

- **A real design system.** Ink-emerald surfaces, warm gold ornament, a serif display face for
  Latin headings, and an Arabic-first reading scale. Every colour token is derived from `--ah` / `--ah2`,
  so switching accent re-tints the entire app — hero, glows, charts and controls.
- **Native-feeling navigation.** A desktop rail, a mobile tab bar with a raised tasbeeh action,
  deep-linkable hash routes (`#/c/morning`, `#/d/m-ayat-al-kursi`), sticky reader bar and counter dock.
- **Reading as the centrepiece.** Generous Arabic line-height, per-card utensils, ornamental dividers,
  virtue callouts, and a bottom tap-counter that never steals focus.
- **Forgiving search.** Arabic is normalised (harakat, alef variants, tā’ marbūṭa, tatweel) and Latin
  transliteration is folded (ḥ→h, ā→a, ʿ removed) so a tired, half-remembered query still works.
- **Local-first state.** Versioned `localStorage` state with automatic day rollover, date-keyed streaks,
  JSON export, and no network calls at runtime.
- **Considered motion.** 300–400 ms eased entrances, spring-light hover lifts, sheet choreography, and
  a `prefers-reduced-motion` escape hatch.
- **Bilingual & RTL.** All interface strings live in one typed dictionary; layout uses logical
  properties, mirrored chevrons and Arabic heading rules.
- **Installable.** Manifest, offline caching, shortcuts to Tasbeeh, Saved and Morning adhkar.

---

## Tech

- **React 19 + TypeScript + Vite 6** — no UI framework, no CSS-in-JS runtime.
- **Hand-written CSS design system** (`src/styles.css`) with custom properties, logical properties and
  container-agnostic responsive rules.
- **Fonts self-hosted** via `@fontsource` — no Google Fonts request at runtime.
- **PWA** — `public/manifest.webmanifest` + a small runtime-caching service worker.

```
src/
├─ App.tsx                  # shell: sidebar, top bar, tab bar, routing, reminders
├─ store.tsx                # settings, progress, bookmarks, custom duas, tasbeeh
├─ styles.css               # design tokens + every component style
├─ components/
│  ├─ Icon.tsx              # 45 hand-drawn stroke icons, one consistent grid
│  ├─ DuaRow.tsx            # list row with repeat badge, progress and bookmark
│  └─ ui.tsx                # toasts, sheets, rings, segmented control, ornaments
├─ data/
│  ├─ categories.ts         # the nine chapters
│  ├─ duas/                 # 71 supplications, grouped by theme
│  └─ tasbeeh.ts            # 12 dhikr presets
├─ lib/
│  ├─ i18n.ts               # typed English + Arabic UI dictionary
│  ├─ native.ts             # optional bridge to the Android shell
│  ├─ router.ts             # hash router
│  ├─ speech.ts             # Arabic recitation with chunking
│  └─ utils.ts              # dates, Hijri, normalisation, streaks, sharing
└─ views/                   # Home, Category, Reader, Search, Saved, Tasbeeh,
                            # MyDuas, Settings
```

### Scripts

```bash
npm install      # install dependencies
npm run dev      # dev server on 0.0.0.0:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build

./scripts/sync-android.sh  # rebuild dist/ and copy it into the Android project
```

---

## Content & authenticity

- Supplications are drawn from the Qur’an and well-known hadith collections; each card shows its
  reference (for example `Ṣaḥīḥ al-Bukhārī 6306`, `Al-Baqarah 2:255`).
- Transliteration follows a readable academic style (ḥ, ṣ, ḍ, ‘, ’) and is intentionally not a
  substitute for the Arabic.
- English translations are rendered in contemporary language.
- This is an independent project and is **not affiliated with the original app’s publisher**. Content
  has been compiled with care but should be verified by a qualified scholar before being relied upon
  for religious rulings. Corrections are welcome at `admin@duaandazkar.com`.

### Adding languages

`Dua.translation` is a single English string today. To add a language, change the field to a
`Record<LanguageCode, string>` in `src/data/types.ts`, update the reader/summary components to read
`dua.translation[lang]`, and extend the language segmented control. UI strings already live in a fully
typed dictionary (`src/lib/i18n.ts`) with RTL support.

---

## Android app (Android Studio)

`android/` is a complete Android Studio project that ships the same build inside a WebView. It is
**not** a Capacitor project: the shell is a few hundred lines of hand-written Kotlin, so there is no
plugin tree, no extra runtime and no generated config to keep in sync.

| Piece | File |
| --- | --- |
| Host activity, WebView, insets, back handling | `android/app/src/main/java/com/noor/dua/MainActivity.kt` |
| `window.NoorAndroid` bridge (share, save, TTS, haptics, theme, permissions) | `…/com/noor/dua/NativeBridge.kt` |
| Daily reminder alarms | `…/com/noor/dua/ReminderScheduler.kt` |
| Notification + reboot receivers | `…/com/noor/dua/ReminderReceiver.kt`, `BootReceiver.kt` |
| TypeScript side of the bridge | `src/lib/native.ts`, `src/lib/speech.ts` |

### Open it

1. **File → Open…** in Android Studio and pick the **`android/`** folder (not the repository root).
2. Let Gradle sync. Requirements: JDK 17 or newer (the bundled JetBrains Runtime works) and an Android
   SDK with **API 35** installed. Gradle 8.11.1 is provided by the wrapper.
3. Run the `app` configuration on a device or emulator (minSdk 24).

The compiled web bundle is committed under `android/app/src/main/assets/www`, so the project builds
without Node or npm. After changing anything in `src/` or `public/`, refresh it from the repository
root:

```bash
./scripts/sync-android.sh   # npm run build + copy dist/ into assets/www
```

The build fails early with a clear message if `assets/www/index.html` is missing.

### How the page is served

`WebViewAssetLoader` maps `/assets/` to `src/main/assets` and the app loads
`https://appassets.androidplatform.net/assets/www/index.html`. Because the page gets a real **https**
origin (instead of `file://`), `localStorage`, the async clipboard, fonts and the service worker all
behave exactly as they do on the web. The app requests **no** `INTERNET` permission — everything is
local.

### What the native shell adds

- **Reminders that survive the app being closed.** The web app mirrors its morning/evening settings
  through `scheduleReminders(json)`; `AlarmManager` arms inexact, doze-safe alarms and re-arms them
  after reboots and app updates. Notification permission is requested natively (Android 13+) from
  **Settings → Reminders**, with a shortcut to the system notification settings when it is blocked.
- **Share sheet** for a dua and **backup export** to `Downloads/Noor/*.json` via MediaStore.
- **System text-to-speech** for Arabic recitation (`TextToSpeech`, falls back to the browser API when
  the app runs in a browser).
- **Haptics** on tasbeeh taps and long-press actions through the system vibrator.
- **Status- and navigation-bar icon colours** follow the app's light/dark choice, and the page is laid
  out edge-to-edge behind the system bars.

Reminders are deliberately inexact: Android may deliver them a few minutes late while the device is
dozing, which is the right trade-off for adhkar and avoids the Play Store's exact-alarm policy.
Recitation uses the device's text-to-speech engine, so an Arabic voice must be installed (most devices
ship one, or offer it from *Settings → System → Languages → Text-to-speech output*).

### Release builds

```bash
cd android
./gradlew assembleDebug        # debug APK in app/build/outputs/apk/debug/
./gradlew bundleRelease        # AAB for Play, signed with your own keystore
```

`applicationId` is `com.noor.dua` (debug builds use `com.noor.dua.debug`, so both can be installed side
by side), `versionCode`/`versionName` live in `android/app/build.gradle.kts`. Release builds enable R8
and resource shrinking; the bridge is kept by `android/app/proguard-rules.pro`. Create the signing key
with **Build → Generate Signed App Bundle / APK…** and keep it out of version control.

Launcher icons are generated from the same eight-point star as the PWA mark (adaptive foreground,
monochrome layer for Android 13+ themed icons, round and legacy densities under
`android/app/src/main/res/mipmap-*`).

---

## Privacy

No accounts, no analytics, no third-party scripts. Bookmarks, settings, progress and personal duas are
stored only in your browser’s `localStorage`, and you can export or erase them from **Settings → Your
data**.

---

## Roadmap

- Additional translations (Urdu, Indonesian, Turkish, French, Bengali …) and per-language UI.
- Recorded human recitation instead of speech synthesis.
- Qibla compass and prayer-time reminders computed locally.
- Optional encrypted sync between devices.
- iOS wrapper alongside the existing Android project.

---

## Credits

Built as a modernisation study of *Dua & Azkar* (com.ls.arabic). Typefaces: Amiri, Scheherazade New,
Noto Naskh Arabic, Lateef, Noto Kufi Arabic, Reem Kufi, Fraunces and Plus Jakarta Sans — all under the
SIL Open Font License.

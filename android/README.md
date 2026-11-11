# Noor for Android

This folder is the Android Studio project. Open **this** folder (`android/`), not the repository
root — the root is the web app and has no Gradle build.

```
android/
├─ settings.gradle.kts      # plugins + repositories, includes :app
├─ build.gradle.kts         # AGP 8.7.3, Kotlin 2.0.21 (declared, not applied)
├─ gradle.properties
├─ gradlew / gradlew.bat    # Gradle 8.11.1 wrapper
├─ gradle/wrapper/          # wrapper jar + distribution URL
└─ app/                     # the application module (com.noor.dua)
```

The compiled web app is committed under `app/src/main/assets/www`, so the project builds with no
Node.js. After changing anything under `../src` or `../public`, run from the repository root:

```bash
./scripts/sync-android.sh    # or: npm run android:sync
```

## Requirements

| Tool | Version |
| --- | --- |
| Android Studio | Ladybug (2024.2.1) or newer |
| Gradle JDK | 17 or newer — the embedded JDK 21 is ideal |
| Android SDK | Platform 35 (Android 15) + Build-Tools 35.0.0 |
| Gradle | downloaded by the wrapper (8.11.1) |

Check the JDK in **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK**
and the SDK in **Settings → Languages & Frameworks → Android SDK**.

## If Gradle sync fails

Read the first error in the **Build** window (or run `./gradlew --stacktrace` in this folder) — it is
almost always one of these:

| Error | Fix |
| --- | --- |
| `Could not install Gradle distribution … gradle-8.11.1-bin.zip` | The wrapper needs one ~130 MB download from `services.gradle.org`. Check the connection/proxy (or a VPN) and re-sync. |
| `Plugin [id: 'com.android.application', version: '8.7.3'] was not found` | Studio can't reach `google()` / `mavenCentral()`. Turn off **Gradle offline mode** (Gradle tool window → toggle), check proxy settings, re-sync. |
| `Android Gradle plugin requires Java 17` or `Unsupported class file major version` | Set the **Gradle JDK** to the embedded JDK 21 (or any 17+). Java 8/11 cannot run AGP 8.x. |
| `Failed to find target with hash string 'android-35'` | **SDK Manager → SDK Platforms** → install *Android 15 (API 35)*; also install *Build-Tools 35.0.0*. |
| `SDK location not found` | Open **Settings → Android SDK** once so Studio writes `local.properties`, or create it with `sdk.dir=/path/to/Android/Sdk`. |
| `The project is using an incompatible version of the Android Gradle Plugin` | Your Studio predates AGP 8.7. Update Studio, or downgrade `com.android.application` in `build.gradle.kts` and `distributionUrl` in `gradle/wrapper/gradle-wrapper.properties` to the versions Studio suggests. |
| `Could not find or load main class org.gradle.wrapper.GradleWrapperMain` | Incomplete ZIP/clone: the wrapper jar is missing or truncated. Re-clone, or run `gradle wrapper --gradle-version 8.11.1`. |
| `Unsupported Gradle version` / daemon crashes | `File → Invalidate Caches / Restart`, then delete `~/.gradle/caches` if it persists. |

After fixing a cause, use **File → Sync Project with Gradle Files**; if Studio keeps showing the old
error, **Build → Clean Project** first.

## Run and build

- Debug: pick the `app` configuration and a device/emulator (API 24+), press **Run**.
- APK: `./gradlew assembleDebug` → `app/build/outputs/apk/debug/app-debug.apk`.
- Play bundle: **Build → Generate Signed App Bundle / APK…**, or `./gradlew bundleRelease` with your
  own signing config (the release build enables R8; `app/proguard-rules.pro` keeps the JS bridge).

The debug build uses the application ID `com.noor.dua.debug`, so it can be installed next to a release
build. `versionCode` / `versionName` live in `app/build.gradle.kts`.

## What is native here

- `MainActivity` — WebView hosted on `https://appassets.androidplatform.net` via `WebViewAssetLoader`
  (real https origin keeps `localStorage`, fonts and clipboard working), edge-to-edge insets, back
  handling, correct MIME types for `woff2`/`webmanifest`.
- `NativeBridge` — `window.NoorAndroid`: share sheet, backup export to `Downloads/Noor`, system TTS,
  haptics, system-bar theming, notification permission.
- `ReminderScheduler` / `ReminderReceiver` / `BootReceiver` — inexact, doze-safe morning/evening
  reminders, re-armed after reboot and app updates.
- `res/mipmap-*` — adaptive, monochrome, round and legacy launcher icons generated from the Noor mark.

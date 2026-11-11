import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/scheherazade-new/400.css";
import "@fontsource/scheherazade-new/700.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/600.css";
import "@fontsource/lateef/400.css";
import "@fontsource/lateef/600.css";
import "@fontsource/noto-kufi-arabic/400.css";
import "@fontsource/noto-kufi-arabic/600.css";
import "@fontsource/reem-kufi/400.css";
import "@fontsource/reem-kufi/600.css";

import "./styles.css";
import App from "./App";
import { isAndroidApp } from "./lib/native";
import { AppProvider } from "./store";
import { ToastProvider } from "./components/ui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppProvider>
  </StrictMode>,
);

// The Android shell already ships the app inside the APK, and its WebView does
// not route service-worker requests through the asset loader — registering one
// there would break navigation. Browsers keep the offline-first worker.
if ("serviceWorker" in navigator && import.meta.env.PROD && !isAndroidApp()) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* offline support is best-effort */
    });
  });
}

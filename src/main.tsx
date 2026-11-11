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

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* offline support is best-effort */
    });
  });
}

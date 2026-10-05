import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@/styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Relay root element is missing");

async function prepare(): Promise<void> {
  // VITE_USE_MOCKS defaults to "true" until a real backend exists.
  // Set it to "false" in .env.local to connect to a live API.
  if (import.meta.env.VITE_USE_MOCKS !== "false") {
    const { enableMocking } = await import("./mocks/browser");
    await enableMocking();
  }
}

prepare().finally(() => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});

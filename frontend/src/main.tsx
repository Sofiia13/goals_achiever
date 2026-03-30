import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./app/App";
import "./styles/_globals.scss";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./shared/context/AuthContext";

const applyDocumentBranding = () => {
  document.title = "Goals Achiever";

  const faviconHref =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230f172a'/%3E%3Cpath d='M18 34l8 8 20-20' fill='none' stroke='%2322c55e' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

  let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    document.head.appendChild(favicon);
  }

  favicon.href = faviconHref;
};

applyDocumentBranding();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

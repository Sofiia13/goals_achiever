import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./app/App";
import "./styles/_globals.scss";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./shared/context/AuthContext";

const applyDocumentBranding = () => {
  document.title = "Goals Achiever";

  const faviconHref = "/icons/favicon.svg?v=2";

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

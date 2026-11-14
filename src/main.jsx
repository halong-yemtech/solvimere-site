import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SiteAuthProvider } from "./auth/SiteAuth";
import { ContentProvider } from "./cms/Content";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SiteAuthProvider>
        <ContentProvider>
          <App />
        </ContentProvider>
      </SiteAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

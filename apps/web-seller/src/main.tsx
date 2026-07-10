import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/apps/web-seller/App.tsx";
import { initSentry } from "@/apps/web-seller/common/config/sentry.config";
import "@/apps/web-seller/common/styles/globals.css";

initSentry();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

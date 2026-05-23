import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/apps/web-admin/App.tsx";
import "@/apps/web-admin/common/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

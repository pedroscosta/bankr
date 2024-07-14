import App from "@/App.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { RelayEnvironmentProvider } from "react-relay";
import { Toaster } from "./components/ui/toaster";
import "./globals.css";
import { environment } from "./relay/authenticated-environment";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RelayEnvironmentProvider environment={environment}>
    <React.StrictMode>
      <App />
      <Toaster />
    </React.StrictMode>
  </RelayEnvironmentProvider>
);

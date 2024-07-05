import App from "@/App.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { RelayEnvironmentProvider } from "react-relay";
import { RelayEnvironment } from "./RelayEnvironment";
import { Toaster } from "./components/ui/toaster";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RelayEnvironmentProvider environment={RelayEnvironment}>
    <React.StrictMode>
      <App />
      <Toaster />
    </React.StrictMode>
  </RelayEnvironmentProvider>
);

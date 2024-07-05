import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import relay from "vite-plugin-relay";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [relay, react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

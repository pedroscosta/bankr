import react from "@vitejs/plugin-react";
import path from "path";
import relay from "vite-plugin-relay";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [relay, react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    env: {
      MOCK_GRAPHQL_SERVER: "true",
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React — cached forever, tiny
          if (id.includes("react-dom") || id.includes("react/")) {
            return "vendor-react";
          }
          // Router
          if (id.includes("react-router")) {
            return "vendor-router";
          }
          // Supabase — large but rarely changes
          if (id.includes("@supabase")) {
            return "vendor-supabase";
          }
          // TanStack Query
          if (id.includes("@tanstack")) {
            return "vendor-query";
          }
          // Radix UI primitives
          if (id.includes("@radix-ui")) {
            return "vendor-radix";
          }
        },
      },
    },
  },
});

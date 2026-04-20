import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_BASE || (process.env.TAURI_ENV_PLATFORM ? "./" : "/cfo-flightdeck-dashboard/"),
  build: {
    outDir: "dist",
    assetsInlineLimit: 0
  }
});

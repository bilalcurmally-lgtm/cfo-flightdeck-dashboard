import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_BASE || "/cfo-flightdeck-dashboard/",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0
  }
});

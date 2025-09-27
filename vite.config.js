// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/epoch-shop/", // ⚡ важно для GitHub Pages
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png"
      ],
      manifest: {
        name: "Epoch Shop",
        short_name: "Epoch",
        start_url: "/epoch-shop/", // 👈 фикс: учитываем base
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: `${import.meta.env.BASE_URL}icons/icon-192.png`, // 👈 динамический путь
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: `${import.meta.env.BASE_URL}icons/icon-512.png`, // 👈 динамический путь
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  build: {
    outDir: "docs" // ⚡ билд в docs/, откуда GitHub Pages раздаёт сайт
  }
});


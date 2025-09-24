// vite.config.js
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  base: "/epoch-shop/", // ⚡ важно для GitHub Pages
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Epoch Shop",
        short_name: "Epoch",
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
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
})

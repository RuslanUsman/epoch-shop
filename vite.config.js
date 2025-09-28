import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => {
  const isProd = command === "build";

  return {
    // 👇 локально будет "/", в продакшне "/epoch-shop/"
    base: isProd ? "/epoch-shop/" : "/",
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
        manifest: {
          name: "Epoch Shop",
          short_name: "Epoch",
          start_url: ".", // 👈 точка = относительно base
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#000000",
          icons: [
            {
              src: "icons/icon-192.png", // 👈 относительные пути
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png"
            }
          ]
        }
      })
    ],
    build: {
      outDir: "docs" // ⚡ GitHub Pages берёт сайт из docs/
    }
  };
});

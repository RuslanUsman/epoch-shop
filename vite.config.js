// vite.config.js
import { defineConfig } from "vite"
import react    from "@vitejs/plugin-react"

export default defineConfig({
  base: "/epoch-shop/",
  plugins: [react()],
  build: {
    outDir: "docs"
  }
})

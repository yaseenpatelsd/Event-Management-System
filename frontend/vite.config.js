import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    // Proxy API calls to the Spring Boot backend to avoid CORS entirely.
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});

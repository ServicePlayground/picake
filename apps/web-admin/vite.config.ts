import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    /** GitHub Actions 빌드 커밋 SHA를 클라이언트에 주입합니다. */
    "import.meta.env.VITE_PUBLIC_GITHUB_SHA": JSON.stringify(process.env.GITHUB_SHA ?? ""),
  },
  resolve: {
    alias: {
      "@/apps/web-admin": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3003,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});

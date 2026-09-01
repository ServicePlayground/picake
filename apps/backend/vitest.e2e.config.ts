import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [swc.vite()],
  test: {
    include: ["src/**/*.e2e.test.ts"],
    setupFiles: ["src/test/e2e/setup.ts"],
    environment: "node",
    globals: true,
    // 같은 테스트 DB·같은 Nest 앱 인스턴스를 공유하므로 파일을 동시에 돌리면 서로 간섭함
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});

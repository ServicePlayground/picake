import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [swc.vite()],
  test: {
    include: ["src/**/*.integration.test.ts"],
    setupFiles: ["src/test/integration/setup.ts"],
    environment: "node",
    globals: true,
    // 같은 테스트 DB를 공유하므로 테스트 파일들을 동시에 돌리면 데이터가 서로 간섭함
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});

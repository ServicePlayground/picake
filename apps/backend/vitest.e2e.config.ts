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
    // 같은 테스트 DB를 공유하므로(afterEach의 TRUNCATE) 파일을 동시에 돌리면 서로 간섭함.
    // vitest는 기본적으로 파일마다 격리된 모듈 레지스트리를 쓰므로 Nest 앱 인스턴스
    // 자체는 파일별로 새로 뜬다 — 공유되는 건 DB뿐이지만 그것만으로도 직렬화가 필요하다.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});

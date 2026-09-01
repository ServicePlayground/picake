import type { StorybookConfig } from "@storybook/nextjs-vite";
import svgr from "vite-plugin-svgr";

import { dirname } from "path";

import { fileURLToPath } from "url";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-onboarding"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs-vite"),
    options: {
      // 이 프로젝트는 next.config.js의 @svgr/webpack 규칙 때문에 .svg를 항상(쿼리
      // 스트링 없이도) React 컴포넌트로 import한다. @storybook/nextjs-vite의 Next
      // Image 처리는 기본적으로 "*.svg?react"만 SVGR에 양보하므로, 그대로 두면
      // 일반 .svg import가 SVGR 컴포넌트가 아니라 Next Image 객체({width,height})로
      // 해석돼 렌더링이 깨진다 (Icon 컴포넌트에서 실측 확인).
      // 주의: 옵션 키는 `exclude`가 아니라 `excludeFiles` — 타입 정의
      // (@storybook/nextjs-vite/dist/node/index.d.ts)로 실측 확인.
      image: {
        excludeFiles: ["**/*.svg"],
      },
    },
  },
  docs: {
    autodocs: true,
  },
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    config.plugins = config.plugins || [];
    config.plugins.push(
      svgr({
        include: /\.svg(\?.*)?$/,
        svgrOptions: {
          exportType: "default",
          icon: true,
        },
      }),
    );
    return config;
  },
};
export default config;

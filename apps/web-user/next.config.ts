import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    /** Vercel 빌드 시 자동으로 설정되는 커밋 전체 SHA */
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
  },
  async redirects() {
    return [
      { source: "/chat", destination: "/", permanent: false },
      { source: "/chat/:path*", destination: "/", permanent: false },
    ];
  },
  eslint: {
    // ESLint 검사를 비활성화하고 루트(yarn run common:lint)에서 별도로 실행
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-staging.picakes.com",
      },
      {
        protocol: "https",
        hostname: "static.picakes.com",
      },
    ],
  },
  webpack(config) {
    // SVG를 React 컴포넌트로 import하기 위한 설정
    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;

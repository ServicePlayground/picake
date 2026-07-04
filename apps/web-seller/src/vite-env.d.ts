/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_NODE_ENV: string;
  readonly VITE_PUBLIC_API_DOMAIN: string;
  readonly VITE_PUBLIC_GOOGLE_CLIENT_ID: string;
  readonly VITE_PUBLIC_KAKAO_RESTAPI_KEY: string;
  readonly VITE_PUBLIC_GITHUB_SHA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

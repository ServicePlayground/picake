/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_NODE_ENV: string;
  readonly VITE_PUBLIC_API_DOMAIN: string;
  readonly VITE_PUBLIC_GITHUB_SHA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

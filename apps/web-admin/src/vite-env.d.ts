/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_NODE_ENV: string;
  readonly VITE_PUBLIC_API_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

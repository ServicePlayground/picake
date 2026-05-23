import { useEffect, useRef } from "react";

/** StrictMode remount에서도 동일 authorization code 재사용 방지 */
const processedOAuthCodes = new Set<string>();

/**
 * OAuth authorization code를 한 번만 처리합니다.
 * (React StrictMode useEffect 이중 실행 대응)
 */
export function useOAuthCodeOnce(code: string | null, run: (code: string) => void | Promise<void>) {
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    if (!code) return;
    if (processedOAuthCodes.has(code)) return;
    processedOAuthCodes.add(code);

    void Promise.resolve(runRef.current(code));
  }, [code]);
}

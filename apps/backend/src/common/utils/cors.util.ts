import type { GatewayMetadata } from "@nestjs/websockets";

/**
 * CORS_ORIGIN 문자열("a,b,c")을 allowlist 배열로 변환합니다.
 */
export function parseAllowedOrigins(rawCorsOrigin?: string): string[] {
  if (!rawCorsOrigin) {
    return [];
  }
  return rawCorsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * WebSocket(Socket.IO) CORS 옵션.
 * HTTP(main.ts)와 동일하게 CORS_ORIGIN allowlist 정책을 따릅니다.
 *
 * WebSocketGateway 데코레이터는 import 시점에 평가되어 아직 .env 가 로드되지 않았을 수 있으므로,
 * 연결 시점마다 process.env.CORS_ORIGIN 을 읽는 origin 함수를 사용합니다.
 * origin 헤더가 없는 네이티브 클라이언트(Flutter WebView 등)는 허용합니다.
 */
export function createWebSocketCorsOptions(): GatewayMetadata["cors"] {
  return {
    origin: (
      requestOrigin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGIN);
      callback(null, !requestOrigin || allowedOrigins.includes(requestOrigin));
    },
    credentials: true,
  };
}

import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "@/apps/web-seller/common/utils/token.util";
import type { SellerNotificationItem } from "@/apps/web-seller/features/notification/types/notification.dto";
import { NOTIFICATION_SOCKET_SURFACE } from "@/apps/web-seller/features/notification/constants/notification.constants";

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_DOMAIN;

/**
 * 알림 WebSocket (Socket.IO namespace `/notifications`).
 */
export function connectNotificationSocket(params: {
  storeId: string;
  onNotification: (item: SellerNotificationItem) => void;
}): () => void {
  if (!API_BASE_URL) {
    return () => undefined;
  }

  const token = getAccessToken();
  if (!token) {
    return () => undefined;
  }

  let socket: Socket | null = null;

  socket = io(`${API_BASE_URL}/notifications`, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    auth: { token },
    query: { token, storeId: params.storeId, surface: NOTIFICATION_SOCKET_SURFACE },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 30000,
  });

  const handler = (raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as SellerNotificationItem;
    // 다른 표면·다른 스토어 이벤트는 무시 (서버도 필터하지만 이중 방어)
    if (item.appSurface !== NOTIFICATION_SOCKET_SURFACE) return;
    if (item.storeId !== params.storeId) return;
    params.onNotification(item);
  };

  socket.on("seller_notification", handler);

  return () => {
    socket?.off("seller_notification", handler);
    socket?.disconnect();
    socket = null;
  };
}

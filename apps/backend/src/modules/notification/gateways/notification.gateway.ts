import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";
import { createWebSocketCorsOptions } from "@apps/backend/common/utils/cors.util";
import type {
  SellerNotificationItemDto,
  UserNotificationItemDto,
} from "@apps/backend/modules/notification/services/notification.service";

/**
 * 실시간 알림 (namespace `/notifications`)
 * - SELLER: `seller_notification` (판매자 웹)
 * - USER: `user_order_notification` (사용자 웹 주문 알림)
 * 채팅(`/`)과 네임스페이스를 분리합니다.
 */
@Injectable()
@WebSocketGateway({
  namespace: "/notifications", // 네임스페이스 설정 (동일 계정의 채팅(`/`)과 분리)
  // HTTP(main.ts)와 동일하게 CORS_ORIGIN allowlist 정책을 사용합니다.
  cors: createWebSocketCorsOptions(),
  path: "/socket.io/", // Socket.IO 엔드포인트 경로 명시 (배포 환경에서 WebSocket 연결 문제 해결)
  transports: ["websocket", "polling"], // WebSocket 우선, 실패 시 polling으로 폴백
  allowEIO3: true, // Socket.IO v3 클라이언트와의 호환성
  pingTimeout: 60000, // 연결 타임아웃 (60초)
  pingInterval: 25000, // 핑 간격 (25초)
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // userId -> 해당 유저가 현재 연결 중인 socketId 집합
  private readonly connectedUsers = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit() {
    LoggerUtil.log(
      "[NotificationGateway] Socket.IO namespace /notifications 초기화 (seller + user)",
    );
  }

  async handleConnection(client: Socket) {
    try {
      // 1) 토큰 추출 (auth/query/header 순서)
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        client.emit("error", { message: "No token provided", code: "NO_TOKEN" });
        client.disconnect(true);
        return;
      }

      // 2) JWT 검증 및 사용자 식별
      const payload = await this.jwtService.verifyAsync<JwtVerifiedPayload>(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });
      const userId = payload.sub;
      const aud = payload.aud;

      if (aud === AUDIENCE.CONSUMER) {
        const row = await this.prisma.consumer.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!row) {
          client.emit("error", { message: "User not found", code: "USER_NOT_FOUND" });
          client.disconnect(true);
          return;
        }
      } else if (aud === AUDIENCE.SELLER) {
        const row = await this.prisma.seller.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!row) {
          client.emit("error", { message: "User not found", code: "USER_NOT_FOUND" });
          client.disconnect(true);
          return;
        }
      } else {
        client.emit("error", { message: "Role not authorized", code: "ROLE_NOT_AUTHORIZED" });
        client.disconnect(true);
        return;
      }

      // 4) 연결된 소켓을 유저 단위로 등록
      client.data.userId = userId;

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);

      LoggerUtil.log(`[NotificationGateway] 연결 userId=${userId} socketId=${client.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      LoggerUtil.log(`[NotificationGateway] 연결 실패 socketId=${client.id} reason=${message}`);
      SentryUtil.captureException(e, "warning", {
        module: "notification-gateway",
        operation: "handle-connection",
      });
      client.emit("error", {
        message,
        code: e instanceof Error && e.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "AUTH_ERROR",
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // 연결 해제된 소켓을 userId 매핑에서 정리
    const userId = client.data.userId as string | undefined;
    if (userId) {
      const set = this.connectedUsers.get(userId);
      if (set) {
        set.delete(client.id);
        if (set.size === 0) {
          this.connectedUsers.delete(userId);
        }
      }
    }
  }

  emitSellerNotification(userId: string, item: SellerNotificationItemDto): void {
    const sockets = this.connectedUsers.get(userId);
    if (!sockets || sockets.size === 0) {
      return;
    }
    sockets.forEach((socketId) => {
      this.server.to(socketId).emit("seller_notification", item);
    });
  }

  emitUserOrderNotification(userId: string, item: UserNotificationItemDto): void {
    const sockets = this.connectedUsers.get(userId);
    if (!sockets || sockets.size === 0) {
      return;
    }
    sockets.forEach((socketId) => {
      this.server.to(socketId).emit("user_order_notification", item);
    });
  }

  /**
   * Socket에서 JWT 토큰 추출
   *
   * 우선순위:
   * 1. auth.token (Socket.IO v4 권장 방식)
   * 2. query.token (하위 호환성, 타입 안전성 처리)
   * 3. Authorization 헤더 (표준 HTTP 방식)
   */
  private extractTokenFromSocket(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.trim().length > 0) {
      return authToken;
    }
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === "string" && queryToken.trim().length > 0) {
      return queryToken;
    }
    if (Array.isArray(queryToken) && queryToken.length > 0 && typeof queryToken[0] === "string") {
      return queryToken[0];
    }
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    return null;
  }
}

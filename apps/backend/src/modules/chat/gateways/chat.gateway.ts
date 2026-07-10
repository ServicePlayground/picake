import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Inject, forwardRef, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ChatService } from "../chat.service";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { MessageResponseDto } from "../dto/chat-message-list.dto";
import { ChatPermissionUtil } from "@apps/backend/modules/chat/utils/chat-permission.util";
import { CHAT_ERROR_MESSAGES } from "@apps/backend/modules/chat/constants/chat.constants";
import { SentryUtil } from "@apps/backend/common/utils/sentry.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { createWebSocketCorsOptions } from "@apps/backend/common/utils/cors.util";
import { isServiceMaintenanceMode } from "@apps/backend/common/utils/maintenance.util";
import { API_RESPONSE_MESSAGES } from "@apps/backend/common/constants/app.constants";

/**
 * WebSocket 게이트웨이
 *
 * 실시간 채팅을 위한 WebSocket 연결을 관리합니다.
 */
@WebSocketGateway({
  // HTTP(main.ts)와 동일하게 CORS_ORIGIN allowlist 정책을 사용합니다.
  cors: createWebSocketCorsOptions(),
  // Socket.IO 엔드포인트 경로 명시 (배포 환경에서 WebSocket 연결 문제 해결)
  path: "/socket.io/",
  // 배포 환경에서 WebSocket 연결 안정성을 위한 추가 옵션
  transports: ["websocket", "polling"], // WebSocket 우선, 실패 시 polling으로 폴백
  allowEIO3: true, // Socket.IO v3 클라이언트와의 호환성
  pingTimeout: 60000, // 연결 타임아웃 (60초)
  pingInterval: 25000, // 핑 간격 (25초)
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly connectedUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(
    @Inject(forwardRef(() => ChatService)) // forwardRef: ChatService가 ChatGateway에서 사용되므로 순환 의존성 방지
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    LoggerUtil.log("ChatGateway constructor called - Gateway instance created");
  }

  /**
   * Gateway 초기화 완료 후 호출되는 라이프사이클 훅
   * 이 시점에 Socket.IO 서버가 완전히 초기화되어 있습니다.
   */
  afterInit() {
    LoggerUtil.log(`[✅ 정상] Socket.IO server initialized successfully`);
    LoggerUtil.log(`[✅ 정상] Socket.IO server path: /socket.io/`);
    LoggerUtil.log(`[✅ 정상] Socket.IO server transports: websocket, polling`);
    LoggerUtil.log(`[✅ 정상] CORS origins: ${process.env.CORS_ORIGIN || "not set"}`);

    // Socket.IO 서버에 연결 이벤트 리스너 등록 (디버깅용)
    this.server.on("connection", (socket) => {
      LoggerUtil.log(
        `[🔌 연결 시도] Socket.IO connection event received - socketId: ${socket.id}, transport: ${socket.conn.transport.name}`,
      );
    });

    this.server.on("connection_error", (error) => {
      LoggerUtil.log(`[❌ 연결 오류] Socket.IO connection_error event: ${error.message}`);
    });
  }

  /**
   * 클라이언트 연결 시 호출
   * JWT 토큰을 검증하고 사용자 정보를 설정합니다.
   */
  async handleConnection(client: Socket) {
    const origin = client.handshake.headers.origin || "unknown";
    const userAgent = client.handshake.headers["user-agent"] || "unknown";
    const transport = client.conn.transport.name;
    const remoteAddress = client.handshake.address || "unknown";

    LoggerUtil.log(
      `[🔌 연결 시도] handleConnection called - socketId: ${client.id}, origin: ${origin}, transport: ${transport}, remoteAddress: ${remoteAddress}`,
    );
    LoggerUtil.log(`[🔌 연결 시도] userAgent: ${userAgent}`);
    LoggerUtil.log(
      `[🔌 연결 시도] handshake query keys: ${Object.keys(client.handshake.query || {}).join(",")}`,
    );
    // 민감정보(토큰)가 포함될 수 있어 auth 전체 payload는 로그에 남기지 않습니다.
    LoggerUtil.log(
      `[🔌 연결 시도] handshake auth keys: ${Object.keys((client.handshake.auth as Record<string, unknown>) || {}).join(",")}`,
    );

    if (isServiceMaintenanceMode(this.configService)) {
      client.emit("error", {
        message: API_RESPONSE_MESSAGES.SERVICE_UNAVAILABLE,
        code: "SERVICE_UNAVAILABLE",
      });
      client.disconnect(true);
      return;
    }

    try {
      // JWT 토큰 추출 및 검증
      LoggerUtil.log(`[1단계] 토큰 추출 시작 - socketId: ${client.id}`);
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        const errorMessage = "No token provided";
        LoggerUtil.log(
          `[❌ 연결 거부] ${errorMessage} - socketId: ${client.id}, origin: ${origin}`,
        );
        LoggerUtil.log(
          `[❌ 연결 거부] auth.token: ${client.handshake.auth?.token ? "있음" : "없음"}`,
        );
        LoggerUtil.log(
          `[❌ 연결 거부] query.token: ${client.handshake.query.token ? "있음" : "없음"}`,
        );
        LoggerUtil.log(
          `[❌ 연결 거부] Authorization header: ${client.handshake.headers.authorization ? "있음" : "없음"}`,
        );
        // 에러 메시지를 클라이언트에 전달한 후 연결 종료
        client.emit("error", { message: errorMessage, code: "NO_TOKEN" });
        client.disconnect(true);
        return;
      }

      LoggerUtil.log(
        `[✅ 1단계 완료] 토큰 추출 성공 - socketId: ${client.id}, token length: ${token.length}`,
      );

      LoggerUtil.log(`[2단계] JWT 토큰 검증 시작 - socketId: ${client.id}`);
      const payload = await this.jwtService.verifyAsync<JwtVerifiedPayload>(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      const userId = payload.sub;
      const aud = payload.aud;

      if (!aud || (aud !== AUDIENCE.CONSUMER && aud !== AUDIENCE.SELLER)) {
        const errorMessage = "Invalid token audience for chat";
        LoggerUtil.log(`[❌ 연결 거부] ${errorMessage} - socketId: ${client.id}, aud: ${aud}`);
        client.emit("error", { message: errorMessage, code: "INVALID_AUDIENCE" });
        client.disconnect(true);
        return;
      }

      LoggerUtil.log(
        `[✅ 2단계 완료] JWT 토큰 검증 성공 - socketId: ${client.id}, userId: ${userId}, aud: ${aud}`,
      );

      LoggerUtil.log(`[3단계] 계정 조회 시작 - socketId: ${client.id}, userId: ${userId}`);
      let userType: "consumer" | "store";
      if (aud === AUDIENCE.CONSUMER) {
        const row = await this.prisma.consumer.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!row) {
          const errorMessage = `Consumer not found: ${userId}`;
          LoggerUtil.log(`[❌ 연결 거부] ${errorMessage} - socketId: ${client.id}`);
          client.emit("error", { message: errorMessage, code: "USER_NOT_FOUND" });
          client.disconnect(true);
          return;
        }
        userType = "consumer";
      } else {
        const row = await this.prisma.seller.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!row) {
          const errorMessage = `Seller not found: ${userId}`;
          LoggerUtil.log(`[❌ 연결 거부] ${errorMessage} - socketId: ${client.id}`);
          client.emit("error", { message: errorMessage, code: "USER_NOT_FOUND" });
          client.disconnect(true);
          return;
        }
        userType = "store";
      }

      LoggerUtil.log(
        `[✅ 3단계 완료] 계정 조회 성공 - socketId: ${client.id}, userId: ${userId}, userType: ${userType}`,
      );

      // 소켓에 사용자 정보 저장
      client.data.userId = userId;
      client.data.userType = userType;

      // 연결된 사용자 목록에 추가
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);

      LoggerUtil.log(
        `[✅ 연결 완료] User connected successfully - userId: ${userId}, socketId: ${client.id}, type: ${userType}, total connections for user: ${this.connectedUsers.get(userId)!.size}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      LoggerUtil.log(
        `[❌ 연결 오류] Connection error - socketId: ${client.id}, error: ${errorMessage}`,
      );
      // 에러 메시지를 클라이언트에 전달한 후 연결 종료
      client.emit("error", {
        message: errorMessage,
        code:
          error instanceof Error && error.name === "TokenExpiredError"
            ? "TOKEN_EXPIRED"
            : "AUTH_ERROR",
      });
      client.disconnect(true);
    }
  }

  /**
   * 클라이언트 연결 해제 시 호출
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
      }
      LoggerUtil.log(
        `[🔌 연결 해제] User disconnected - userId: ${userId}, socketId: ${client.id}, remaining connections: ${userSockets?.size || 0}`,
      );
    } else {
      LoggerUtil.log(`[🔌 연결 해제] User disconnected (no userId) - socketId: ${client.id}`);
    }
  }

  /**
   * 채팅방 조인
   */
  @SubscribeMessage("join-room")
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const userId = client.data.userId;
    const userType = client.data.userType;
    const { roomId } = data;

    LoggerUtil.log(
      `[📥 이벤트 수신] join-room - socketId: ${client.id}, userId: ${userId || "없음"}, roomId: ${roomId || "없음"}`,
    );

    if (!userId || !userType || !roomId) {
      LoggerUtil.log(
        `[❌ 잘못된 요청] join-room - userId: ${userId || "없음"}, userType: ${userType || "없음"}, roomId: ${roomId || "없음"}`,
      );
      return { error: "Invalid request" };
    }

    try {
      // 채팅방 존재/권한 검증 없이 join을 허용하면, roomId를 아는 다른 사용자가 메시지를 도청할 수 있음
      const chatRoom = await this.prisma.chatRoom.findUnique({
        where: { id: roomId },
      });

      if (!chatRoom) {
        return { error: CHAT_ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND };
      }

      await ChatPermissionUtil.verifyChatRoomAccess(chatRoom, userId, userType, this.prisma);

      client.join(`room:${roomId}`);
      LoggerUtil.log(
        `[✅ 채팅방 조인] User ${userId} joined room ${roomId} - socketId: ${client.id}`,
      );
      return { success: true, roomId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      LoggerUtil.log(
        `[❌ 채팅방 조인 거부] join-room - socketId: ${client.id}, userId: ${userId}, roomId: ${roomId}, error: ${errorMessage}`,
      );
      if (error instanceof Error && error.stack) {
        LoggerUtil.log(`[join-room 디버그] stack: ${error.stack}`);
      }

      // 중요한 에러는 Sentry로 전송 (BadRequestException이 아닌 경우)
      if (error instanceof Error && !(error instanceof BadRequestException)) {
        SentryUtil.captureException(error, "error", {
          userId,
          roomId,
          handler: "join-room",
          socketId: client.id,
        });
      }

      return { error: CHAT_ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND };
    }
  }

  /**
   * 채팅방 나가기
   */
  @SubscribeMessage("leave-room")
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const userId = client.data.userId;
    const { roomId } = data;

    if (!userId || !roomId) {
      return { error: "Invalid request" };
    }

    client.leave(`room:${roomId}`);
    LoggerUtil.log(`User ${userId} left room ${roomId}`);
    return { success: true, roomId };
  }

  /**
   * 메시지 전송
   */
  @SubscribeMessage("send-message")
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; text: string },
  ) {
    const userId = client.data.userId;
    const userType = client.data.userType;
    const { roomId, text } = data;

    if (!userId || !userType || !roomId || !text) {
      return { error: "Invalid request" };
    }

    try {
      // ChatService를 통해 메시지 저장 및 브로드캐스트
      const message = await this.chatService.sendMessage(roomId, text, userId, userType);
      LoggerUtil.log(`Message sent by user ${userId} in room ${roomId}: ${message.id}`);
      return { success: true, message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      LoggerUtil.log(
        `Failed to send message: ${errorMessage} (userId: ${userId}, roomId: ${roomId})`,
      );

      // 중요한 에러는 Sentry로 전송 (BadRequestException이 아닌 경우)
      if (error instanceof Error && !(error instanceof BadRequestException)) {
        SentryUtil.captureException(error, "error", {
          userId,
          roomId,
          handler: "send-message",
        });
      }

      return { error: errorMessage };
    }
  }

  /**
   * 채팅방에 메시지 브로드캐스트 (서버에서 클라이언트로 WebSocket으로 메시지 전송)
   */
  broadcastMessage(roomId: string, message: MessageResponseDto) {
    this.server.to(`room:${roomId}`).emit("new-message", message);
    LoggerUtil.log(`Message broadcasted to room ${roomId}: ${message.id}`);
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
    // 1. auth.token 우선 사용 (Socket.IO v4 권장 방식)
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.trim().length > 0) {
      return authToken;
    }

    // 2. query.token 처리 (타입 안전성 고려)
    // Socket.IO v4에서 query.token은 string | string[] | undefined 가능
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === "string" && queryToken.trim().length > 0) {
      return queryToken;
    }
    // 배열인 경우 첫 번째 요소 사용 (일반적으로 발생하지 않지만 방어적 코딩)
    if (Array.isArray(queryToken) && queryToken.length > 0 && typeof queryToken[0] === "string") {
      return queryToken[0];
    }

    // 3. Authorization 헤더에서 토큰 추출 (표준 HTTP 방식)
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * 특정 사용자에게 메시지 전송 (푸시 알림 대체용)
   */
  sendToUser(userId: string, event: string, data: any) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }
}

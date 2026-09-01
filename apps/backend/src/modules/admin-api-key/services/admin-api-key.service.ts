import { Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes, createHash } from "node:crypto";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { AUTH_ERROR_MESSAGES } from "@apps/backend/modules/auth/constants/auth.constants";
import {
  ADMIN_API_KEY_DISPLAY_PREFIX_LENGTH,
  ADMIN_API_KEY_PREFIX,
  ADMIN_API_KEY_RANDOM_BYTES,
} from "@apps/backend/modules/admin-api-key/constants/admin-api-key.constants";
import {
  AdminApiKeyCreatedResponseDto,
  AdminApiKeyItemResponseDto,
} from "@apps/backend/modules/admin-api-key/dto/admin-api-key.dto";

/**
 * 관리자 API 키 관리 서비스
 *
 * 발급 시에만 원문 키를 반환하고, 이후에는 SHA-256 해시로만 조회·비교합니다.
 * (키 자체가 256비트 랜덤값이라 bcrypt 같은 느린 해시·salt 없이도 무차별 대입에 안전합니다.)
 */
@Injectable()
export class AdminApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  private hash(rawKey: string): string {
    return createHash("sha256").update(rawKey).digest("hex");
  }

  async create(label: string, createdByAdminId: string): Promise<AdminApiKeyCreatedResponseDto> {
    const rawKey = `${ADMIN_API_KEY_PREFIX}${randomBytes(ADMIN_API_KEY_RANDOM_BYTES).toString("base64url")}`;
    const keyHash = this.hash(rawKey);
    const keyPrefix = rawKey.slice(0, ADMIN_API_KEY_DISPLAY_PREFIX_LENGTH);

    const created = await this.prisma.adminApiKey.create({
      data: { label, keyHash, keyPrefix, createdByAdminId },
      select: { id: true, label: true, createdAt: true },
    });

    return { ...created, apiKey: rawKey };
  }

  async list(): Promise<AdminApiKeyItemResponseDto[]> {
    return await this.prisma.adminApiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        keyPrefix: true,
        isActive: true,
        lastUsedAt: true,
        createdByAdminId: true,
        createdAt: true,
        revokedAt: true,
      },
    });
  }

  async revoke(id: string): Promise<void> {
    const key = await this.prisma.adminApiKey.findUnique({ where: { id } });
    if (!key) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.ADMIN_API_KEY_NOT_FOUND);
    }

    await this.prisma.adminApiKey.update({
      where: { id },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  /**
   * 요청 헤더로 들어온 원문 키를 검증합니다. 유효하지 않으면 `null` (예외를 던지지 않음 —
   * 호출부인 `AdminApiKeyStrategy`가 "인증 실패로 다음 전략 시도"와 "서버 에러"를 구분해야 함).
   */
  async validateKey(rawKey: string): Promise<{ id: string; label: string } | null> {
    const keyHash = this.hash(rawKey);
    const key = await this.prisma.adminApiKey.findUnique({ where: { keyHash } });

    if (!key || !key.isActive) {
      return null;
    }

    await this.prisma.adminApiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });

    return { id: key.id, label: key.label };
  }
}

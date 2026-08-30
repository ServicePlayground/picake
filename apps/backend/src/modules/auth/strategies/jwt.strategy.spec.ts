import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { AUDIENCE, TOKEN_TYPES } from "@apps/backend/modules/auth/constants/auth.constants";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";

import { JwtStrategy } from "./jwt.strategy";

function buildConfigService(): ConfigService {
  return {
    get: vi.fn((key: string) => (key === "JWT_SECRET" ? "test-secret" : undefined)),
  } as unknown as ConfigService;
}

describe("JwtStrategy.validate", () => {
  const prismaMock = mockDeep<PrismaService>();
  let strategy: JwtStrategy;

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new JwtStrategy(buildConfigService(), prismaMock);
  });

  it("JWT_SECRET이 없으면 생성 시점에 에러를 던진다", () => {
    const noSecretConfig = { get: vi.fn(() => undefined) } as unknown as ConfigService;
    expect(() => new JwtStrategy(noSecretConfig, prismaMock)).toThrow();
  });

  it("sub 또는 aud가 없으면 거부한다", async () => {
    await expect(
      strategy.validate({ aud: AUDIENCE.CONSUMER } as JwtVerifiedPayload),
    ).rejects.toThrow(UnauthorizedException);
    await expect(strategy.validate({ sub: "id" } as JwtVerifiedPayload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("type이 access가 아니면 거부한다 (refresh 토큰으로 API 호출 시도 등)", async () => {
    await expect(
      strategy.validate({
        sub: "consumer-1",
        aud: AUDIENCE.CONSUMER,
        type: TOKEN_TYPES.REFRESH,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("consumer: 활성 계정이면 로그인 타입·id를 채워 반환한다", async () => {
    prismaMock.consumer.findUnique.mockResolvedValue({
      id: "consumer-1",
      phone: "01012345678",
      googleId: null,
      kakaoId: "kakao-1",
      appleId: null,
      isActive: true,
    } as any);

    const result = await strategy.validate({
      sub: "consumer-1",
      aud: AUDIENCE.CONSUMER,
      type: TOKEN_TYPES.ACCESS,
    });

    expect(result).toMatchObject({
      id: "consumer-1",
      aud: AUDIENCE.CONSUMER,
      loginType: "kakao",
      loginId: "kakao-1",
    });
  });

  it("consumer: 계정이 없으면 거부한다", async () => {
    prismaMock.consumer.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: "consumer-1", aud: AUDIENCE.CONSUMER, type: TOKEN_TYPES.ACCESS }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("consumer: 비활성 계정이면 거부한다", async () => {
    prismaMock.consumer.findUnique.mockResolvedValue({
      id: "consumer-1",
      isActive: false,
    } as any);

    await expect(
      strategy.validate({ sub: "consumer-1", aud: AUDIENCE.CONSUMER, type: TOKEN_TYPES.ACCESS }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("seller: 활성 계정이면 sellerVerificationStatus를 포함해 반환한다", async () => {
    prismaMock.seller.findUnique.mockResolvedValue({
      id: "seller-1",
      phone: "01099998888",
      googleId: "google-1",
      kakaoId: null,
      isActive: true,
      sellerVerificationStatus: "BUSINESS_VERIFIED",
    } as any);

    const result = await strategy.validate({
      sub: "seller-1",
      aud: AUDIENCE.SELLER,
      type: TOKEN_TYPES.ACCESS,
    });

    expect(result).toMatchObject({
      id: "seller-1",
      aud: AUDIENCE.SELLER,
      loginType: "google",
      sellerVerificationStatus: "BUSINESS_VERIFIED",
    });
  });

  it("admin: 활성 계정이면 그대로 반환한다", async () => {
    prismaMock.admin.findUnique.mockResolvedValue({
      id: "admin-1",
      username: "seed_admin",
      isActive: true,
    } as any);

    const result = await strategy.validate({
      sub: "admin-1",
      aud: AUDIENCE.ADMIN,
      type: TOKEN_TYPES.ACCESS,
    });

    expect(result).toMatchObject({ id: "admin-1", aud: AUDIENCE.ADMIN, username: "seed_admin" });
  });

  it("admin totp_setup_pending: OTP 미등록 상태에서만 허용한다", async () => {
    prismaMock.admin.findUnique.mockResolvedValue({
      id: "admin-1",
      username: "seed_admin",
      isActive: true,
      isTotpEnabled: false,
    } as any);

    const result = await strategy.validate({
      sub: "admin-1",
      aud: AUDIENCE.ADMIN,
      type: TOKEN_TYPES.TOTP_SETUP_PENDING,
    });

    expect(result).toMatchObject({ id: "admin-1", type: TOKEN_TYPES.TOTP_SETUP_PENDING });
  });

  it("admin totp_setup_pending: 이미 OTP가 활성화되어 있으면 거부한다", async () => {
    prismaMock.admin.findUnique.mockResolvedValue({
      id: "admin-1",
      username: "seed_admin",
      isActive: true,
      isTotpEnabled: true,
    } as any);

    await expect(
      strategy.validate({
        sub: "admin-1",
        aud: AUDIENCE.ADMIN,
        type: TOKEN_TYPES.TOTP_SETUP_PENDING,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("admin totp_setup_pending 토큰인데 aud가 admin이 아니면 거부한다", async () => {
    await expect(
      strategy.validate({
        sub: "consumer-1",
        aud: AUDIENCE.CONSUMER,
        type: TOKEN_TYPES.TOTP_SETUP_PENDING,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

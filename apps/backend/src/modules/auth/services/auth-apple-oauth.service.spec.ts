import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import axios from "axios";
import * as jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { TokenEncryptionUtil } from "@apps/backend/common/utils/token-encryption.util";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { AUTH_ERROR_MESSAGES } from "@apps/backend/modules/auth/constants/auth.constants";
import { AuthPhoneService } from "@apps/backend/modules/auth/services/auth-phone.service";
import { JwtUtil } from "@apps/backend/modules/auth/utils/jwt.util";
import { TermsService } from "@apps/backend/modules/terms/terms.service";

import { AuthAppleOauthService } from "./auth-apple-oauth.service";

vi.mock("axios", () => ({
  default: { create: vi.fn() },
}));

vi.mock("jsonwebtoken", () => ({
  sign: vi.fn(() => "fake-client-secret"),
  verify: vi.fn(),
}));

describe("AuthAppleOauthService.consumerAppleLoginWithCode", () => {
  const httpClientMock = { post: vi.fn(), get: vi.fn() };
  const prismaMock = mockDeep<PrismaService>();
  const jwtUtilMock = { generateTokenPair: vi.fn() };
  const tokenEncryptionUtilMock = {
    encrypt: vi.fn((plain: string) => `encrypted:${plain}`),
    decrypt: vi.fn((cipher: string) => cipher.replace("encrypted:", "")),
  };

  let service: AuthAppleOauthService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(axios.create).mockReturnValue(httpClientMock as any);
    prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock));
    jwtUtilMock.generateTokenPair.mockResolvedValue({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
    });
    tokenEncryptionUtilMock.encrypt.mockImplementation((plain: string) => `encrypted:${plain}`);

    const configServiceMock: Partial<ConfigService> = {
      get: vi.fn((key: string) => {
        const values: Record<string, string> = {
          APPLE_TEAM_ID: "team-id",
          APPLE_KEY_ID: "key-id",
          APPLE_PRIVATE_KEY: "fake-private-key",
          APPLE_CLIENT_ID: "apple-client-id",
          NODE_ENV: "development",
        };
        return values[key];
      }) as any,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthAppleOauthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtUtil, useValue: jwtUtilMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: AuthPhoneService, useValue: {} },
        { provide: TermsService, useValue: {} },
        { provide: TokenEncryptionUtil, useValue: tokenEncryptionUtilMock },
      ],
    }).compile();

    service = moduleRef.get(AuthAppleOauthService);
  });

  function mockIdTokenVerification(
    payload: { sub?: string; email?: string } | null,
    error?: Error,
  ) {
    vi.mocked(jwt.verify).mockImplementation(
      (_token: any, _keyResolver: any, _opts: any, cb: any) => {
        if (error) {
          cb(error);
          return;
        }
        cb(null, payload);
      },
    );
  }

  function mockSuccessfulTokenExchange() {
    httpClientMock.post.mockResolvedValue({
      data: { id_token: "fake-id-token", refresh_token: "apple-refresh-token" },
      status: 200,
    });
    mockIdTokenVerification({ sub: "apple-user-1", email: "user@privaterelay.appleid.com" });
  }

  it("가입된 활성 회원이 애플 id_token 검증에 성공하면 자체 토큰 쌍을 발급하고 refresh_token을 암호화 저장한다", async () => {
    mockSuccessfulTokenExchange();
    prismaMock.consumer.findUnique.mockResolvedValue({
      id: "consumer-1",
      appleId: "apple-user-1",
      isActive: true,
      phone: "01012345678",
      isPhoneVerified: true,
    } as any);

    const result = await service.consumerAppleLoginWithCode({ code: "auth-code" });

    expect(result).toEqual({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
    });
    expect(tokenEncryptionUtilMock.encrypt).toHaveBeenCalledWith("apple-refresh-token");
    expect(prismaMock.consumer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "consumer-1" },
        data: expect.objectContaining({ appleRefreshToken: "encrypted:apple-refresh-token" }),
      }),
    );
  });

  it("토큰 응답에 id_token 또는 refresh_token이 없으면 토큰 교환 실패 예외를 던진다", async () => {
    httpClientMock.post.mockResolvedValue({ data: {}, status: 200 });

    await expect(service.consumerAppleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      AUTH_ERROR_MESSAGES.APPLE_OAUTH_TOKEN_EXCHANGE_FAILED,
    );
  });

  it("id_token 서명 검증에 실패하면 토큰 교환 실패 예외를 던진다", async () => {
    httpClientMock.post.mockResolvedValue({
      data: { id_token: "fake-id-token", refresh_token: "apple-refresh-token" },
      status: 200,
    });
    mockIdTokenVerification(null, new Error("invalid signature"));

    await expect(service.consumerAppleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      AUTH_ERROR_MESSAGES.APPLE_OAUTH_TOKEN_EXCHANGE_FAILED,
    );
  });

  it("id_token 검증은 성공했지만 sub 또는 email이 없으면 토큰 교환 실패 예외를 던진다", async () => {
    httpClientMock.post.mockResolvedValue({
      data: { id_token: "fake-id-token", refresh_token: "apple-refresh-token" },
      status: 200,
    });
    mockIdTokenVerification({ sub: "apple-user-1" });

    await expect(service.consumerAppleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      AUTH_ERROR_MESSAGES.APPLE_OAUTH_TOKEN_EXCHANGE_FAILED,
    );
  });

  it("가입되지 않은 애플 계정이면 휴대폰 인증(가입) 필요 예외를 던진다", async () => {
    mockSuccessfulTokenExchange();
    prismaMock.consumer.findUnique.mockResolvedValue(null);

    await expect(service.consumerAppleLoginWithCode({ code: "auth-code" })).rejects.toMatchObject({
      response: expect.objectContaining({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
      }),
    });
  });

  it("비활성화된 계정은 로그인이 거부된다", async () => {
    mockSuccessfulTokenExchange();
    prismaMock.consumer.findUnique.mockResolvedValue({
      id: "consumer-1",
      appleId: "apple-user-1",
      isActive: false,
      phone: "01012345678",
      isPhoneVerified: true,
    } as any);

    await expect(service.consumerAppleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("휴대폰 인증이 안 된 계정은 인증 필요 예외를 던진다", async () => {
    mockSuccessfulTokenExchange();
    prismaMock.consumer.findUnique.mockResolvedValue({
      id: "consumer-1",
      appleId: "apple-user-1",
      isActive: true,
      phone: "01012345678",
      isPhoneVerified: false,
    } as any);

    await expect(service.consumerAppleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      BadRequestException,
    );
  });
});

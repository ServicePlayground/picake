import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { AUTH_ERROR_MESSAGES } from "@apps/backend/modules/auth/constants/auth.constants";
import { AuthPhoneService } from "@apps/backend/modules/auth/services/auth-phone.service";
import { JwtUtil } from "@apps/backend/modules/auth/utils/jwt.util";
import { TermsService } from "@apps/backend/modules/terms/terms.service";

import { AuthGoogleOauthService } from "./auth-google-oauth.service";

vi.mock("axios", () => ({
  default: { create: vi.fn() },
}));

describe("AuthGoogleOauthService.consumerGoogleLoginWithCode", () => {
  const httpClientMock = { post: vi.fn(), get: vi.fn() };
  const prismaMock = mockDeep<PrismaService>();
  const jwtUtilMock = { generateTokenPair: vi.fn() };

  let service: AuthGoogleOauthService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(axios.create).mockReturnValue(httpClientMock as any);
    prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock));
    jwtUtilMock.generateTokenPair.mockResolvedValue({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
    });

    const configServiceMock: Partial<ConfigService> = {
      get: vi.fn((key: string) => {
        const values: Record<string, string> = {
          GOOGLE_CLIENT_ID: "google-client-id",
          GOOGLE_CLIENT_SECRET: "google-client-secret",
          GOOGLE_CLIENT_ID_SELLER: "google-client-id-seller",
          GOOGLE_CLIENT_SECRET_SELLER: "google-client-secret-seller",
          PUBLIC_USER_DOMAIN: "https://picakes.com",
          PUBLIC_SELLER_DOMAIN: "https://seller.picakes.com",
        };
        return values[key];
      }) as any,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthGoogleOauthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtUtil, useValue: jwtUtilMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: AuthPhoneService, useValue: {} },
        { provide: TermsService, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(AuthGoogleOauthService);
  });

  function mockSuccessfulTokenExchange() {
    httpClientMock.post.mockResolvedValue({
      data: { access_token: "google-access-token", token_type: "Bearer" },
      status: 200,
    });
    httpClientMock.get.mockResolvedValue({
      data: { id: "google-user-1", email: "user@gmail.com" },
      status: 200,
    });
  }

  it("가입된 활성 회원이 구글 토큰 교환에 성공하면 자체 토큰 쌍을 발급한다", async () => {
    mockSuccessfulTokenExchange();
    prismaMock.consumer.findUnique.mockResolvedValue({
      id: "consumer-1",
      googleId: "google-user-1",
      isActive: true,
      phone: "01012345678",
      isPhoneVerified: true,
    } as any);

    const result = await service.consumerGoogleLoginWithCode({ code: "auth-code" });

    expect(result).toEqual({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
    });
    expect(prismaMock.consumer.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "consumer-1" } }),
    );
  });

  it("구글 토큰 응답에 access_token이 없으면 토큰 교환 실패 예외를 던진다", async () => {
    httpClientMock.post.mockResolvedValue({ data: {}, status: 200 });

    await expect(service.consumerGoogleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      AUTH_ERROR_MESSAGES.GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED,
    );
    expect(httpClientMock.get).not.toHaveBeenCalled();
  });

  it("구글 사용자 정보에 id 또는 email이 없으면 토큰 교환 실패 예외를 던진다", async () => {
    httpClientMock.post.mockResolvedValue({
      data: { access_token: "google-access-token" },
      status: 200,
    });
    httpClientMock.get.mockResolvedValue({ data: { id: "google-user-1" }, status: 200 });

    await expect(service.consumerGoogleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      AUTH_ERROR_MESSAGES.GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED,
    );
  });

  it("가입되지 않은 구글 계정이면 휴대폰 인증(가입) 필요 예외를 던진다", async () => {
    mockSuccessfulTokenExchange();
    prismaMock.consumer.findUnique.mockResolvedValue(null);

    await expect(service.consumerGoogleLoginWithCode({ code: "auth-code" })).rejects.toMatchObject({
      response: expect.objectContaining({
        message: AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED,
      }),
    });
  });

  it("비활성화된 계정은 로그인이 거부된다", async () => {
    mockSuccessfulTokenExchange();
    prismaMock.consumer.findUnique.mockResolvedValue({
      id: "consumer-1",
      googleId: "google-user-1",
      isActive: false,
      phone: "01012345678",
      isPhoneVerified: true,
    } as any);

    await expect(service.consumerGoogleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("휴대폰 인증이 안 된 계정은 인증 필요 예외를 던진다", async () => {
    mockSuccessfulTokenExchange();
    prismaMock.consumer.findUnique.mockResolvedValue({
      id: "consumer-1",
      googleId: "google-user-1",
      isActive: true,
      phone: "01012345678",
      isPhoneVerified: false,
    } as any);

    await expect(service.consumerGoogleLoginWithCode({ code: "auth-code" })).rejects.toThrow(
      BadRequestException,
    );
  });
});

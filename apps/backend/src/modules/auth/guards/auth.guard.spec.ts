import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

import { AUDIENCE, TOKEN_TYPES } from "@apps/backend/modules/auth/constants/auth.constants";

import { AuthGuard, AuthMetadata } from "./auth.guard";

function buildContext(headers: Record<string, string> = {}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function buildGuard(metadata: AuthMetadata | undefined): AuthGuard {
  const reflector = { getAllAndOverride: vi.fn(() => metadata) } as unknown as Reflector;
  return new AuthGuard(reflector);
}

describe("AuthGuard.canActivate", () => {
  it("isPublic 엔드포인트는 인증 없이 통과한다", () => {
    const guard = buildGuard({ isPublic: true });
    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it("isOptionalPublic이고 토큰이 없으면 통과한다", () => {
    const guard = buildGuard({ isPublic: false, isOptionalPublic: true });
    expect(guard.canActivate(buildContext())).toBe(true);
  });
});

describe("AuthGuard.handleRequest", () => {
  it("인증 성공 시 user를 그대로 반환한다 (audience/type 제약 없음)", () => {
    const guard = buildGuard({ isPublic: false });
    const user = { aud: AUDIENCE.CONSUMER, type: TOKEN_TYPES.ACCESS };

    expect(guard.handleRequest(null, user, null, buildContext())).toBe(user);
  });

  it("isOptionalPublic 엔드포인트에서 인증 실패는 에러 없이 undefined를 반환한다", () => {
    const guard = buildGuard({ isPublic: false, isOptionalPublic: true });

    const result = guard.handleRequest(new UnauthorizedException(), null, null, buildContext());
    expect(result).toBeUndefined();
  });

  it("토큰이 없으면 ACCESS_TOKEN_MISSING으로 거부한다", () => {
    const guard = buildGuard({ isPublic: false });

    expect(() => guard.handleRequest(null, null, null, buildContext())).toThrow(
      UnauthorizedException,
    );
  });

  it("토큰 만료(TokenExpiredError)는 만료 메시지로 거부한다", () => {
    const guard = buildGuard({ isPublic: false });

    expect(() =>
      guard.handleRequest(
        null,
        null,
        { name: "TokenExpiredError" },
        buildContext({ authorization: "Bearer expired-token" }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it("잘못된 토큰(JsonWebTokenError)은 유효하지 않음 메시지로 거부한다", () => {
    const guard = buildGuard({ isPublic: false });

    expect(() =>
      guard.handleRequest(
        null,
        null,
        { name: "JsonWebTokenError" },
        buildContext({ authorization: "Bearer bad-token" }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it("허용되지 않은 audience면 ForbiddenException을 던진다", () => {
    const guard = buildGuard({ isPublic: false, audiences: [AUDIENCE.ADMIN] });
    const user = { aud: AUDIENCE.CONSUMER, type: TOKEN_TYPES.ACCESS };

    expect(() => guard.handleRequest(null, user, null, buildContext())).toThrow(ForbiddenException);
  });

  it("허용되지 않은 jwtType이면 ForbiddenException을 던진다", () => {
    const guard = buildGuard({ isPublic: false, jwtTypes: [TOKEN_TYPES.TOTP_PENDING] });
    const user = { aud: AUDIENCE.ADMIN, type: TOKEN_TYPES.ACCESS };

    expect(() => guard.handleRequest(null, user, null, buildContext())).toThrow(ForbiddenException);
  });

  it("jwtTypes를 지정하지 않으면 기본값(access)만 허용한다", () => {
    const guard = buildGuard({ isPublic: false });
    const refreshUser = { aud: AUDIENCE.CONSUMER, type: TOKEN_TYPES.REFRESH };

    expect(() => guard.handleRequest(null, refreshUser, null, buildContext())).toThrow(
      ForbiddenException,
    );
  });
});

import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";

import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { JwtPayload } from "@apps/backend/modules/auth/types/auth.types";

import { JwtUtil } from "./jwt.util";

describe("JwtUtil", () => {
  let jwtUtil: JwtUtil;
  const payload: JwtPayload = { sub: "consumer-id", aud: AUDIENCE.CONSUMER };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
        JwtModule.register({ secret: "test-secret" }),
      ],
      providers: [JwtUtil],
    }).compile();

    jwtUtil = moduleRef.get(JwtUtil);
  });

  it("액세스·리프레시 토큰 쌍을 발급하고, 각 토큰의 type 클레임이 다르다", async () => {
    const { accessToken, refreshToken } = await jwtUtil.generateTokenPair(payload);

    expect(accessToken).not.toBe(refreshToken);

    const verifiedAccess = await jwtUtil.verifyToken(accessToken);
    const verifiedRefresh = await jwtUtil.verifyToken(refreshToken);
    expect(verifiedAccess.type).toBe("access");
    expect(verifiedRefresh.type).toBe("refresh");
    expect(verifiedAccess.sub).toBe(payload.sub);
    expect(verifiedAccess.aud).toBe(payload.aud);
  });

  it("generateAccessToken은 type=access인 토큰만 발급한다", async () => {
    const accessToken = await jwtUtil.generateAccessToken(payload);
    const verified = await jwtUtil.verifyToken(accessToken);
    expect(verified.type).toBe("access");
  });

  it("generateTotpPendingToken은 type=totp_pending인 토큰을 발급한다", async () => {
    const token = await jwtUtil.generateTotpPendingToken(payload);
    const verified = await jwtUtil.verifyToken(token);
    expect(verified.type).toBe("totp_pending");
  });

  it("변조되거나 잘못된 서명의 토큰은 검증에 실패한다", async () => {
    await expect(jwtUtil.verifyToken("not-a-valid-jwt")).rejects.toThrow();
  });
});

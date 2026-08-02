-- Apple 로그인(구매자) — googleId/kakaoId와 동일한 패턴
ALTER TABLE "consumers" ADD COLUMN "apple_id" TEXT;
ALTER TABLE "consumers" ADD COLUMN "apple_email" TEXT;
-- 탈퇴 시 /auth/revoke 호출용 refresh_token (AES-256-GCM 암호화 저장)
ALTER TABLE "consumers" ADD COLUMN "apple_refresh_token" TEXT;

CREATE UNIQUE INDEX "consumers_apple_id_key" ON "consumers" ("apple_id");
CREATE INDEX "consumers_apple_id_idx" ON "consumers" ("apple_id");

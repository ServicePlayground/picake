-- 판매자 약관 동의 타임스탬프 컬럼 추가
ALTER TABLE "sellers"
  ADD COLUMN "agreed_to_terms_at"   TIMESTAMP(3),
  ADD COLUMN "agreed_to_privacy_at" TIMESTAMP(3);

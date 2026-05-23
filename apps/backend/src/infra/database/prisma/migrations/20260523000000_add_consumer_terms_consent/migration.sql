-- AlterTable: consumers 테이블에 약관 동의 타임스탬프 컬럼 추가
-- 개인정보 보호법 제15조(수집·이용 동의), 제17조(제3자 제공 동의) 기록용
ALTER TABLE "consumers"
  ADD COLUMN "agreed_to_terms_at"         TIMESTAMP(3),
  ADD COLUMN "agreed_to_privacy_at"       TIMESTAMP(3),
  ADD COLUMN "agreed_to_third_party_at"   TIMESTAMP(3),
  ADD COLUMN "agreed_to_location_terms_at" TIMESTAMP(3);

-- AlterTable: 정가(original_price) 추가, 기존 할인가(discount_price) 컬럼 제거
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "original_price" INTEGER;

UPDATE "products" SET "original_price" = "sale_price" WHERE "original_price" IS NULL;

ALTER TABLE "products" ALTER COLUMN "original_price" SET NOT NULL;

ALTER TABLE "products" DROP COLUMN IF EXISTS "discount_price";

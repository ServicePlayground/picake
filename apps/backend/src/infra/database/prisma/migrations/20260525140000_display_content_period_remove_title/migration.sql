-- AlterTable
ALTER TABLE "display_contents" DROP COLUMN IF EXISTS "title";

ALTER TABLE "display_contents" ADD COLUMN "starts_at" TIMESTAMP(3),
ADD COLUMN "ends_at" TIMESTAMP(3);

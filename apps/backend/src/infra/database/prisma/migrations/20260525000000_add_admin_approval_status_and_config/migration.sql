-- CreateEnum
CREATE TYPE "AdminApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable: Admin에 approvalStatus, approvedAt, rejectedAt 컬럼 추가
ALTER TABLE "admins"
  ADD COLUMN "approval_status" "AdminApprovalStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "approved_at" TIMESTAMP(3),
  ADD COLUMN "rejected_at" TIMESTAMP(3);

-- 기존 관리자(이미 활성화된 계정)는 자동으로 APPROVED 처리
UPDATE "admins" SET "approval_status" = 'APPROVED' WHERE "is_active" = true;

-- CreateIndex
CREATE INDEX "admins_approval_status_idx" ON "admins"("approval_status");

-- CreateTable: AdminConfig (싱글톤 설정)
CREATE TABLE "admin_configs" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "require_approval" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_configs_pkey" PRIMARY KEY ("id")
);

-- 기본 설정 행 삽입 (requireApproval = false)
INSERT INTO "admin_configs" ("id", "require_approval", "updated_at")
VALUES ('default', false, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

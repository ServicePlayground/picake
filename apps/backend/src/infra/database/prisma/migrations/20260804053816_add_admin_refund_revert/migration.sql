-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "admin_refund_revert_reason" TEXT,
ADD COLUMN     "admin_refund_reverted_at" TIMESTAMP(3);

-- DropForeignKey
ALTER TABLE "public"."custom_order_requests" DROP CONSTRAINT "custom_order_requests_consumer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."custom_order_requests" DROP CONSTRAINT "custom_order_requests_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."custom_order_requests" DROP CONSTRAINT "custom_order_requests_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."custom_order_requests" DROP CONSTRAINT "custom_order_requests_room_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."custom_order_requests" DROP CONSTRAINT "custom_order_requests_store_id_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "related_custom_order_request_id";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "requires_quote";

-- DropTable
DROP TABLE "public"."custom_order_requests";

-- DropEnum
DROP TYPE "public"."CustomOrderRequestStatus";


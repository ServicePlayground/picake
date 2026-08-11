-- CreateEnum
CREATE TYPE "CustomOrderRequestStatus" AS ENUM ('REQUESTED', 'QUOTED', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "requires_quote" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "custom_order_requests" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requirements_text" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "desired_budget_min" INTEGER,
    "desired_budget_max" INTEGER,
    "desired_date" TIMESTAMP(3) NOT NULL,
    "reservation_contact_name" TEXT,
    "reservation_phone" TEXT,
    "status" "CustomOrderRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "quoted_price" INTEGER,
    "seller_note" TEXT,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_order_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_order_requests_order_id_key" ON "custom_order_requests"("order_id");

-- CreateIndex
CREATE INDEX "custom_order_requests_store_id_status_created_at_idx" ON "custom_order_requests"("store_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "custom_order_requests_consumer_id_created_at_idx" ON "custom_order_requests"("consumer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "custom_order_requests_product_id_status_idx" ON "custom_order_requests"("product_id", "status");

-- AddForeignKey
ALTER TABLE "custom_order_requests" ADD CONSTRAINT "custom_order_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_order_requests" ADD CONSTRAINT "custom_order_requests_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "consumers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_order_requests" ADD CONSTRAINT "custom_order_requests_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_order_requests" ADD CONSTRAINT "custom_order_requests_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_order_requests" ADD CONSTRAINT "custom_order_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

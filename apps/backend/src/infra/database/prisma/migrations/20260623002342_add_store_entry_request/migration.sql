-- CreateEnum
CREATE TYPE "StoreEntryRequestStatus" AS ENUM ('REQUESTED', 'REVIEWING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "store_entry_requests" (
    "id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "kakao_place_id" TEXT NOT NULL,
    "place_name" TEXT NOT NULL,
    "address" TEXT,
    "road_address" TEXT,
    "phone" TEXT,
    "category_name" TEXT,
    "place_url" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "StoreEntryRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_entry_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_entry_requests_kakao_place_id_idx" ON "store_entry_requests"("kakao_place_id");

-- CreateIndex
CREATE INDEX "store_entry_requests_status_idx" ON "store_entry_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "store_entry_requests_consumer_id_kakao_place_id_key" ON "store_entry_requests"("consumer_id", "kakao_place_id");

-- AddForeignKey
ALTER TABLE "store_entry_requests" ADD CONSTRAINT "store_entry_requests_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "consumers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

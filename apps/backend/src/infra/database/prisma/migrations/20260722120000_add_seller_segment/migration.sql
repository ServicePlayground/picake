-- CreateTable
CREATE TABLE "seller_segments" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_segment_memberships" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "note" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_segment_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_segments_key_key" ON "seller_segments"("key");

-- CreateIndex
CREATE INDEX "seller_segment_memberships_seller_id_idx" ON "seller_segment_memberships"("seller_id");

-- CreateIndex
CREATE INDEX "seller_segment_memberships_segment_id_idx" ON "seller_segment_memberships"("segment_id");

-- CreateIndex
CREATE UNIQUE INDEX "seller_segment_memberships_seller_id_segment_id_key" ON "seller_segment_memberships"("seller_id", "segment_id");

-- AddForeignKey
ALTER TABLE "seller_segment_memberships" ADD CONSTRAINT "seller_segment_memberships_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_segment_memberships" ADD CONSTRAINT "seller_segment_memberships_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "seller_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

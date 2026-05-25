-- CreateEnum
CREATE TYPE "ContentPlacement" AS ENUM ('USER_HOME_EVENT_BANNER');

-- CreateTable
CREATE TABLE "display_contents" (
    "id" TEXT NOT NULL,
    "placement" "ContentPlacement" NOT NULL,
    "image_url" TEXT NOT NULL,
    "link_url" TEXT,
    "title" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "display_contents_placement_is_active_sort_order_idx" ON "display_contents"("placement", "is_active", "sort_order");

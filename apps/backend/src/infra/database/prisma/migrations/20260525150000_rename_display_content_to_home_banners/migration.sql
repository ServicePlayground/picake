-- RenameTable
ALTER TABLE "display_contents" RENAME TO "home_banners";

-- RenameConstraint (PK name follows old table name after RENAME)
ALTER TABLE "home_banners" RENAME CONSTRAINT "display_contents_pkey" TO "home_banners_pkey";

-- DropColumn
ALTER TABLE "home_banners" DROP COLUMN "placement";

-- DropIndex
DROP INDEX IF EXISTS "display_contents_placement_is_active_sort_order_idx";
DROP INDEX IF EXISTS "display_contents_placement_starts_at_ends_at_idx";

-- CreateIndex
CREATE INDEX "home_banners_is_active_sort_order_idx" ON "home_banners"("is_active", "sort_order");
CREATE INDEX "home_banners_starts_at_ends_at_idx" ON "home_banners"("starts_at", "ends_at");

-- DropEnum
DROP TYPE IF EXISTS "ContentPlacement";

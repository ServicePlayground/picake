-- AlterTable
ALTER TABLE "store_feeds" ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];

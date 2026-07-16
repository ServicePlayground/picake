-- CreateEnum
CREATE TYPE "HomeBannerImageAlign" AS ENUM ('LEFT', 'CENTER', 'RIGHT');

-- AlterTable
ALTER TABLE "home_banners" ADD COLUMN "image_align" "HomeBannerImageAlign" NOT NULL DEFAULT 'CENTER';

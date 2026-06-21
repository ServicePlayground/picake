-- list_price → original_price (이전 마이그레이션 적용 환경 호환)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'list_price'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE "products" RENAME COLUMN "list_price" TO "original_price";
  END IF;
END $$;

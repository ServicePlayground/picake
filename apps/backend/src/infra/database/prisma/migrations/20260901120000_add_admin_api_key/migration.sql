-- CreateTable
CREATE TABLE "admin_api_keys" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_admin_id" TEXT,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "admin_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_api_keys_key_hash_key" ON "admin_api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "admin_api_keys_is_active_idx" ON "admin_api_keys"("is_active");

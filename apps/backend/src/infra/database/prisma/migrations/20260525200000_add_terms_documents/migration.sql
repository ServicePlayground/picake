-- CreateEnum
CREATE TYPE "TermsType" AS ENUM ('CONSUMER_TERMS_OF_SERVICE', 'CONSUMER_PRIVACY_POLICY', 'CONSUMER_THIRD_PARTY_CONSENT', 'CONSUMER_LOCATION_TERMS', 'SELLER_TERMS_OF_SERVICE', 'SELLER_PRIVACY_POLICY');

-- CreateTable
CREATE TABLE "terms_documents" (
    "id" TEXT NOT NULL,
    "type" "TermsType" NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "effective_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumer_terms_agreements" (
    "id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "terms_document_id" TEXT NOT NULL,
    "agreed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumer_terms_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_terms_agreements" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "terms_document_id" TEXT NOT NULL,
    "agreed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_terms_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "terms_documents_type_version_key" ON "terms_documents"("type", "version");

-- CreateIndex
CREATE INDEX "terms_documents_type_is_active_idx" ON "terms_documents"("type", "is_active");

-- CreateIndex
CREATE INDEX "terms_documents_type_effective_at_idx" ON "terms_documents"("type", "effective_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "consumer_terms_agreements_consumer_id_terms_document_id_key" ON "consumer_terms_agreements"("consumer_id", "terms_document_id");

-- CreateIndex
CREATE INDEX "consumer_terms_agreements_consumer_id_idx" ON "consumer_terms_agreements"("consumer_id");

-- CreateIndex
CREATE UNIQUE INDEX "seller_terms_agreements_seller_id_terms_document_id_key" ON "seller_terms_agreements"("seller_id", "terms_document_id");

-- CreateIndex
CREATE INDEX "seller_terms_agreements_seller_id_idx" ON "seller_terms_agreements"("seller_id");

-- AddForeignKey
ALTER TABLE "consumer_terms_agreements" ADD CONSTRAINT "consumer_terms_agreements_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "consumers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumer_terms_agreements" ADD CONSTRAINT "consumer_terms_agreements_terms_document_id_fkey" FOREIGN KEY ("terms_document_id") REFERENCES "terms_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_terms_agreements" ADD CONSTRAINT "seller_terms_agreements_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_terms_agreements" ADD CONSTRAINT "seller_terms_agreements_terms_document_id_fkey" FOREIGN KEY ("terms_document_id") REFERENCES "terms_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

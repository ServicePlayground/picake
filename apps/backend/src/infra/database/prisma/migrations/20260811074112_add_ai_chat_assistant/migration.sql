-- CreateEnum
CREATE TYPE "AiMessageFeedback" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "AiAssistantScheduleMode" AS ENUM ('ALWAYS', 'OUTSIDE_BUSINESS_HOURS', 'OFF');

-- CreateEnum
CREATE TYPE "StoreAiUnansweredQuestionStatus" AS ENUM ('PENDING', 'CONVERTED_TO_FAQ', 'DISMISSED');

-- AlterEnum
ALTER TYPE "MessageSenderType" ADD VALUE 'SYSTEM';

-- AlterTable
ALTER TABLE "chat_rooms" ADD COLUMN     "ai_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "awaiting_seller_nudge_sent_at" TIMESTAMP(3),
ADD COLUMN     "awaiting_seller_since" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "ai_feedback" "AiMessageFeedback",
ADD COLUMN     "ai_suggests_handoff" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "related_custom_order_request_id" TEXT;

-- CreateTable
CREATE TABLE "store_ai_assistant_settings" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "schedule_mode" "AiAssistantScheduleMode" NOT NULL DEFAULT 'OFF',
    "instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_ai_assistant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_ai_faqs" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_ai_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_ai_unanswered_questions" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "seller_answer_draft" TEXT,
    "status" "StoreAiUnansweredQuestionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_ai_unanswered_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_ai_assistant_settings_store_id_key" ON "store_ai_assistant_settings"("store_id");

-- CreateIndex
CREATE INDEX "store_ai_faqs_store_id_sort_order_idx" ON "store_ai_faqs"("store_id", "sort_order");

-- CreateIndex
CREATE INDEX "store_ai_unanswered_questions_store_id_status_created_at_idx" ON "store_ai_unanswered_questions"("store_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_is_ai_generated_created_at_idx" ON "messages"("is_ai_generated", "created_at");

-- AddForeignKey
ALTER TABLE "store_ai_assistant_settings" ADD CONSTRAINT "store_ai_assistant_settings_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_ai_faqs" ADD CONSTRAINT "store_ai_faqs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_ai_unanswered_questions" ADD CONSTRAINT "store_ai_unanswered_questions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 재입금 안내(입금 마감 임박) 발송 여부(중복 발송 방지)
ALTER TABLE "orders" ADD COLUMN "payment_reminder_sent_at" TIMESTAMP(3);

CREATE INDEX "orders_order_status_payment_pending_deadline_at_payment_re_idx"
  ON "orders" ("order_status", "payment_pending_deadline_at", "payment_reminder_sent_at");

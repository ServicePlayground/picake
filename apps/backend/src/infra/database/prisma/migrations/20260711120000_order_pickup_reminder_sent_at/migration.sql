-- 픽업 24시간 전 안내 발송 여부(중복 발송 방지)
ALTER TABLE "orders" ADD COLUMN "pickup_reminder_sent_at" TIMESTAMP(3);

CREATE INDEX "orders_order_status_pickup_date_pickup_reminder_sent_at_idx"
  ON "orders" ("order_status", "pickup_date", "pickup_reminder_sent_at");

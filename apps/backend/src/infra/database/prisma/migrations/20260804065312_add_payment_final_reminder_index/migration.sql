-- CreateIndex
CREATE INDEX "orders_order_status_payment_pending_deadline_at_payment_fin_idx" ON "orders"("order_status", "payment_pending_deadline_at", "payment_final_reminder_sent_at");

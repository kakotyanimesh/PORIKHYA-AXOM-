-- Store what a payment unlocks on the Payment row itself (server-written at order
-- creation), so the grant path reads intent from the DB instead of an extra
-- Razorpay API call. Removes a network dependency from the money-critical grant.
ALTER TABLE "Payment" ADD COLUMN "kind" TEXT;
ALTER TABLE "Payment" ADD COLUMN "target_id" TEXT;

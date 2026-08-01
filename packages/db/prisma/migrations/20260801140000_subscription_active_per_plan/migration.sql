-- Plans are per-category and independent: a user can hold several active
-- subscriptions at once (e.g. Assam TET AND Assam Police). Replace the
-- one-active-per-user index with one-active-per-(user, plan) — that still stops
-- re-buying the exact same plan while it's active, but allows different plans.
DROP INDEX IF EXISTS "Subscription_user_id_active_key";
CREATE UNIQUE INDEX "Subscription_user_id_plan_id_active_key"
  ON "Subscription" ("user_id", "plan_id")
  WHERE ("is_active" = true);

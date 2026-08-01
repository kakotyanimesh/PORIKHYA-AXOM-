-- One active Subscription per user. Postgres treats is_active = false as a
-- duplicable value, so this is a PARTIAL unique index (WHERE is_active = true).
-- Prisma's DSL can't express the WHERE clause, so this migration is hand-written
-- (see the comment above model Subscription in schema.prisma).
CREATE UNIQUE INDEX "Subscription_user_id_active_key"
  ON "Subscription" ("user_id")
  WHERE ("is_active" = true);

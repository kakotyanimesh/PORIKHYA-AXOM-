-- Pricing plans (idempotent — ON CONFLICT upsert, safe to re-run).
-- Apply (from packages/db): pnpm exec prisma db execute --file prisma/seed-plans.sql
--
-- Pricing (approved 2026-07-31, revised for launch):
--   Per category (TET / ADRE / Police): ₹249 / 180d  and  ₹499 / 365d
--   Super (all three categories):        ₹1299 / 365d
--   No APSC plan yet. Single-exam ₹50 is a code constant (SINGLE_TEST_PRICE_INR).
INSERT INTO "Plan" (id, name, price, duration_days, category_grants, is_active, created_at, updated_at) VALUES
  ('plan_tet_6mo',    'Assam TET — 6 Months',     249,  180, ARRAY['ASSAM_TET']::"ExamCategory"[],                          true, now(), now()),
  ('plan_tet_1yr',    'Assam TET — 1 Year',       499,  365, ARRAY['ASSAM_TET']::"ExamCategory"[],                          true, now(), now()),
  ('plan_adre_6mo',   'ADRE — 6 Months',          249,  180, ARRAY['ADRE']::"ExamCategory"[],                               true, now(), now()),
  ('plan_adre_1yr',   'ADRE — 1 Year',            499,  365, ARRAY['ADRE']::"ExamCategory"[],                               true, now(), now()),
  ('plan_police_6mo', 'Assam Police — 6 Months',  249,  180, ARRAY['ASSAM_POLICE']::"ExamCategory"[],                       true, now(), now()),
  ('plan_police_1yr', 'Assam Police — 1 Year',    499,  365, ARRAY['ASSAM_POLICE']::"ExamCategory"[],                       true, now(), now()),
  ('plan_super_1yr',  'All-Assam Super — 1 Year', 1299, 365, ARRAY['ASSAM_TET','ADRE','ASSAM_POLICE']::"ExamCategory"[],    true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  category_grants = EXCLUDED.category_grants,
  is_active = true,
  updated_at = now();

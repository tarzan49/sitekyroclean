-- Adds margin/total/region tracking to leads, requested by the owner after
-- realizing "leads.value" (a single text field) can't distinguish his own
-- margin from the total the customer paid when a partner/subcontractor did
-- the job and kept the difference. Nullable additive columns only — existing
-- rows (quiz-origin leads) are untouched, they simply have null here until
-- edited. margin_value/total_value are numeric (unlike the legacy free-text
-- "value" column) so the CRM can sum/aggregate them directly.
alter table public.leads
  add column if not exists margin_value numeric,
  add column if not exists total_value numeric,
  add column if not exists region text;

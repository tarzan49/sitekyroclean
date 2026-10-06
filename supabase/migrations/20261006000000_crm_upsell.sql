-- Upsell no CRM (2026-10-06). Aditiva; aplica-se colando no SQL Editor
-- (sétima armadilha do CLAUDE.md: nunca `supabase db push`).
--
-- upsell_value: o que a equipa vendeu a mais no próprio serviço, escrito pelo
--   dono. Fica fora de billed_value e my_cut: a divisão é outra (70/30, no
--   Porto 60/40, a equipa fica sempre com a parte maior) e é calculada no
--   painel (`src/lib/crmUpsell.ts`), não guardada.
-- upsell_team: a equipa que o fez (Porto 1, Porto 2, Braga, Lisboa 1,
--   Lisboa 2, Algarve). É a equipa, não a região, que decide a divisão.

begin;

alter table public.service_requests
  add column if not exists upsell_value numeric(10,2) not null default 0,
  add column if not exists upsell_team text;

commit;

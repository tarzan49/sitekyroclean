-- Coimbra é região própria no CRM (dono, 2026-10-11: "no CRM adiciona a região Coimbra").
-- Aplicada com `supabase db query --linked -f` (nunca `db push`, sétima armadilha).
begin;
alter table public.service_requests drop constraint if exists service_requests_locality_check;
alter table public.service_requests add constraint service_requests_locality_check
  check (locality in ('Porto','Lisboa','Algarve','Braga','Coimbra'));
commit;

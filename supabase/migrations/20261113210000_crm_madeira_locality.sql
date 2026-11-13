-- Madeira como região do CRM (dono, 2026-11-13). Sem equipa no motor do bot.
alter table public.service_requests drop constraint if exists service_requests_locality_check;
alter table public.service_requests add constraint service_requests_locality_check
  check (locality in ('Porto','Lisboa','Algarve','Braga','Coimbra','Madeira'));

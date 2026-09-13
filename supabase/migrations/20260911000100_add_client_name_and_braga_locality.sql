-- CRM (2026-09-11): campo "nome do cliente" pedido pelo Francisco, e Braga
-- como 4ª localidade — o histórico do Google Calendar mostra vários
-- serviços com "equipa Braga", região que o Francisco já trata à parte de
-- Porto (mesma lógica usada no antigo CRM de leads, ver guessRegionFromLocation
-- em AdminDashboard.tsx).

alter table public.service_requests add column if not exists client_name text;
alter table public.service_requests add column if not exists city text;

alter table public.service_requests drop constraint if exists service_requests_locality_check;
alter table public.service_requests add constraint service_requests_locality_check
  check (locality in ('Porto','Lisboa','Algarve','Braga'));

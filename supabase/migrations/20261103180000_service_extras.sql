-- Artigos acrescentados a um serviço já marcado contam como fecho no dia em que o cliente os aceitou
-- (dono, 2026-11-03, Diana: as 4 cadeiras de 120€ caíram no dia 30/10, quando o sofá foi marcado).
-- A linha do CRM continua com o total do evento (contas das equipas); o painel tira-lhe estes valores
-- e mostra-os no dia `added_at`. Escrita pela bot-api (update-booking).
-- Aplica-se com `supabase db query --linked -f`, nunca `db push`.
begin;

create table if not exists public.service_extras (
  id uuid primary key default gen_random_uuid(),
  calendar_event_id text not null,
  added_at timestamptz not null default now(),
  value numeric(10,2) not null check (value > 0),
  my_cut numeric(10,2) not null default 0,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists service_extras_event_idx on public.service_extras (calendar_event_id);

alter table public.service_extras enable row level security;
revoke all on public.service_extras from anon;
drop policy if exists service_extras_admin_all on public.service_extras;
create policy service_extras_admin_all on public.service_extras
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

commit;

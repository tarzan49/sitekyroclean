-- Acerto semanal das equipas (dono, 2026-11-01). Aplica-se com
-- `supabase db query --linked -f`, nunca `db push` (sétima armadilha do CLAUDE.md).
--
-- Cada linha é um pagamento de um grupo de equipas ao dono, feito ao domingo.
-- Fechar um ciclo marca os serviços incluídos como `paid` e os acertos como
-- saldados (feito pelo painel), e é isso que repõe as contas a zero.
--
-- A restrição de domingo é a regra "obrigatório ser ao domingo" posta na base de
-- dados: o ciclo fecha num domingo e o pagamento é registado nesse mesmo dia, em
-- hora de Lisboa. Nenhum outro caminho (SQL Editor, outro ecrã) a contorna sem a
-- tirar daqui de propósito.

begin;

create table if not exists public.team_settlements (
  id uuid primary key default gen_random_uuid(),
  group_id text not null, -- uma equipa por grupo (dono, 4/11)
  group_label text not null,
  cycle_end date not null,
  amount numeric(10,2) not null,
  vat numeric(10,2) not null default 0,
  service_count integer not null default 0,
  service_ids uuid[] not null default '{}',
  adjustment_ids uuid[] not null default '{}',
  note text,
  paid_at timestamptz not null default now(),
  constraint team_settlements_sunday check (extract(dow from cycle_end) = 0),
  constraint team_settlements_same_day check ((paid_at at time zone 'Europe/Lisbon')::date = cycle_end)
);

create index if not exists team_settlements_group_cycle on public.team_settlements (group_id, cycle_end desc);

revoke all on public.team_settlements from public, anon, authenticated;
grant select, insert on public.team_settlements to authenticated;
alter table public.team_settlements enable row level security;
drop policy if exists "Admin team_settlements" on public.team_settlements;
create policy "Admin team_settlements" on public.team_settlements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

commit;

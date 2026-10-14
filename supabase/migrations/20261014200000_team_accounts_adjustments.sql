-- Contas das equipas (dono, 2026-10-14). Aplica-se com
-- `supabase db query --linked -f` ou no SQL Editor, nunca `db push`.
--
-- paid_to_owner: o cliente paga diretamente ao dono (transferência depois da
--   fatura, ex. LovelyStay). A equipa não lhe deve nada desse serviço; é o dono
--   que deve à equipa a parte dela quando o pagamento cair.
-- team_account_adjustments: valores combinados com uma equipa que não são um
--   serviço do CRM (ex. os 5% das avaliações combinados no grupo do Porto a
--   10/10). Entram nas contas da noite até settled_at ficar preenchido.

begin;

alter table public.service_requests add column if not exists paid_to_owner boolean not null default false;

create table if not exists public.team_account_adjustments (
  id uuid primary key default gen_random_uuid(),
  team text not null,
  day date not null,
  label text not null,
  amount numeric(10,2) not null,
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

revoke all on public.team_account_adjustments from public, anon, authenticated;
grant select, insert, update, delete on public.team_account_adjustments to authenticated;
alter table public.team_account_adjustments enable row level security;
drop policy if exists "Admin team_account_adjustments" on public.team_account_adjustments;
create policy "Admin team_account_adjustments" on public.team_account_adjustments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

commit;

-- Estatísticas diárias do Google Ads por campanha (dono, 2026-10-06). Aditiva;
-- aplica-se colando no SQL Editor ou com `supabase db query --linked -f`
-- (sétima armadilha do CLAUDE.md: nunca `supabase db push`).
--
-- Quem escreve: o script "Kyro | Exportar estatísticas" dentro da conta do
-- Google Ads (google-ads-script/exportar-estatisticas.js), de hora a hora,
-- pela Edge Function `ads-daily-sync` com a chave ADS_SYNC_KEY. O browser
-- só lê. A função também reescreve ad_spend_daily ('google'), que passa a
-- vir daqui em vez de ser escrito à mão.
--
-- conversions: o que o Google Ads conta (cliques no WhatsApp, formulários).
-- Não são clientes: os clientes reais saem do WhatsApp e do calendário.

begin;

create table if not exists public.ads_daily_stats (
  stat_date date not null,
  campaign_id text not null,
  campaign_name text not null,
  impressions integer not null default 0 check (impressions >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  cost numeric(12,2) not null default 0 check (cost >= 0),
  conversions numeric(12,2) not null default 0 check (conversions >= 0),
  updated_at timestamptz not null default now(),
  primary key (stat_date, campaign_id)
);

revoke all on public.ads_daily_stats from public, anon, authenticated;
grant select on public.ads_daily_stats to authenticated;
alter table public.ads_daily_stats enable row level security;
drop policy if exists "Admin ads stats" on public.ads_daily_stats;
create policy "Admin ads stats" on public.ads_daily_stats for select to authenticated
  using (public.is_admin());

commit;

-- Gasto diário da Meta por campanha (dono, 2026-11-18: "os gastos só começam a
-- partir dos 500 € de hoje. Os 250 € para trás, deixa para trás"; "Nas métricas
-- vais também ter gasto com o Meta"). Aditiva; aplica-se com
-- `node_modules/.bin/supabase db query --linked -f <este ficheiro>`, nunca `db push`.
--
-- Quem escreve: a Edge Function `meta-ads-daily-sync`, que lê a Marketing API
-- (conta act_618524496228897) de 18/11/2026 para a frente, chamada de hora a hora
-- pelo pg_cron abaixo. O browser só lê. O painel (Crescimento) só mostra gasto
-- Meta quando meta_ads_sync_status tem uma leitura boa; antes disso diz "por
-- ligar" e nunca 0€.
--
-- conversations: as conversas iniciadas que a Meta conta
-- (onsite_conversion.messaging_conversation_started_7d). Não são clientes: os
-- pedidos e os fechos reais saem do WhatsApp (whatsapp_conversations, origin
-- 'meta') e do CRM.
--
-- A chave da função NÃO está aqui (o repositório é público). Fica no Vault com
-- o nome `meta_ads_sync_key`, criada à parte com a mesma chave da secret
-- META_ADS_SYNC_KEY das Edge Functions:
--   select vault.create_secret('<chave>', 'meta_ads_sync_key');
-- Cópia em ~/Documents/02 Kyro/Pastas antigas/Kyro-segredos/meta-ads-sync-key.txt.
-- Para desligar: select cron.unschedule('kyro-meta-ads-daily-sync');

begin;

create table if not exists public.meta_ads_daily_stats (
  stat_date date not null,
  campaign_id text not null,
  campaign_name text not null,
  spend numeric(12,2) not null default 0 check (spend >= 0),
  impressions integer not null default 0 check (impressions >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  conversations integer not null default 0 check (conversations >= 0),
  updated_at timestamptz not null default now(),
  primary key (stat_date, campaign_id)
);

revoke all on public.meta_ads_daily_stats from public, anon, authenticated;
grant select on public.meta_ads_daily_stats to authenticated;
alter table public.meta_ads_daily_stats enable row level security;
drop policy if exists "Admin meta ads stats" on public.meta_ads_daily_stats;
create policy "Admin meta ads stats" on public.meta_ads_daily_stats for select to authenticated
  using (public.is_admin());

-- Uma linha só: a última leitura boa e o último erro (token em falta, sem ads_read).
create table if not exists public.meta_ads_sync_status (
  id smallint primary key default 1 check (id = 1),
  last_ok_at timestamptz,
  last_rows integer,
  last_error text,
  last_error_at timestamptz,
  updated_at timestamptz not null default now()
);

revoke all on public.meta_ads_sync_status from public, anon, authenticated;
grant select on public.meta_ads_sync_status to authenticated;
alter table public.meta_ads_sync_status enable row level security;
drop policy if exists "Admin meta ads sync status" on public.meta_ads_sync_status;
create policy "Admin meta ads sync status" on public.meta_ads_sync_status for select to authenticated
  using (public.is_admin());

commit;

create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'kyro-meta-ads-daily-sync';

select cron.schedule(
  'kyro-meta-ads-daily-sync',
  '17 * * * *',
  $job$
  select net.http_post(
    url := 'https://kswapioiaetfccxzfwkg.supabase.co/functions/v1/meta-ads-daily-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-meta-sync-key', (select decrypted_secret from vault.decrypted_secrets where name = 'meta_ads_sync_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $job$
);

-- CRM sempre em dia com o Google Calendar (dono, 26 Nov 2026): o pg_cron chama
-- a Edge Function `crm-calendar-sync` de 10 em 10 min. Aplica-se com
-- `supabase db query --linked -f` (nunca `db push`).
--
-- A chave não está aqui (repositório público): fica no Vault como `crm_sync_key`,
-- igual à secret CRM_SYNC_KEY da função. Desligar: select cron.unschedule('kyro-crm-calendar-sync');

create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'kyro-crm-calendar-sync';

select cron.schedule(
  'kyro-crm-calendar-sync',
  '*/10 * * * *',
  $job$
  select net.http_post(
    url := 'https://kswapioiaetfccxzfwkg.supabase.co/functions/v1/crm-calendar-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sync-key', (select decrypted_secret from vault.decrypted_secrets where name = 'crm_sync_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $job$
);

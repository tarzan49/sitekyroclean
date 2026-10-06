-- Email diário de seguimentos (dono, 2026-10-06: "notificações passado x
-- tempo"). Aplica-se com `supabase db query --linked -f` ou colando no SQL
-- Editor (sétima armadilha do CLAUDE.md: nunca `supabase db push`).
--
-- O pg_cron (já ativo) chama a Edge Function `follow-up-digest` às 8h30 e às
-- 9h30 UTC; a função só envia quando são 9h em Lisboa, ou seja numa das duas
-- corridas conforme a hora de verão, e uma vez por dia (follow_up_digests).
--
-- A chave da função NÃO está aqui (o repositório é público). Fica no Vault com
-- o nome `follow_up_digest_key`, criada à parte com a mesma chave da secret
-- FOLLOW_UP_DIGEST_KEY das Edge Functions:
--   select vault.create_secret('<chave>', 'follow_up_digest_key');
-- A cópia do dono está em ~/Documents/Kyro-segredos/FOLLOW_UP_DIGEST_KEY.txt.
--
-- Para desligar o email: select cron.unschedule('kyro-follow-up-digest');

create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'kyro-follow-up-digest';

select cron.schedule(
  'kyro-follow-up-digest',
  '30 8,9 * * *',
  $job$
  select net.http_post(
    url := 'https://kswapioiaetfccxzfwkg.supabase.co/functions/v1/follow-up-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-digest-key', (select decrypted_secret from vault.decrypted_secrets where name = 'follow_up_digest_key')
    ),
    body := '{"send": true}'::jsonb,
    timeout_milliseconds := 30000
  );
  $job$
);

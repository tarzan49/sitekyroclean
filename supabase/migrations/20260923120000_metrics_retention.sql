-- Retenção das tabelas de medição (2026-09-23).
--
-- Contexto: `quiz_events` recebe uma linha por página vista, uma por mudança
-- de rota (`session_time`) e uma por clique de contacto, em cada visita com
-- consentimento, cada uma com ~40 colunas. `error_logs` recebe uma linha por
-- erro de JavaScript. Nenhuma das duas tinha limpeza: com tráfego a sério, a
-- base de dados cresce ao ritmo das páginas vistas (estimativa na auditoria de
-- 2026-09-23 em AUDIT.md: ~270 MB por mês a 5.000 visitas/dia).
--
-- O que fica e o que sai:
--   quiz_events  `page_view` e `session_time` com mais de 180 dias saem. São
--                as linhas volumosas e servem para taxas de conversão por
--                página, que não precisam de mais de seis meses de histórico.
--                `start`, `complete`, `abandon`, `whatsapp_click` e
--                `call_click` ficam para sempre: são poucas, e o funil, o
--                estudo (/estudo-limpeza-estofos-portugal) e a atribuição
--                dependem delas.
--   error_logs   tudo com mais de 60 dias sai.
--
-- Como aplicar (sétima armadilha do CLAUDE.md: NUNCA `supabase db push`):
--   1. Dashboard → Database → Extensions → ativar `pg_cron`.
--   2. Colar este ficheiro no SQL Editor e correr. É idempotente: desagenda a
--      tarefa se já existir e volta a agendá-la.
--   3. Confirmar em `select * from cron.job;` que aparece `metrics-retention`,
--      e no dia seguinte em `select * from cron.job_run_details order by
--      start_time desc limit 5;` que correu sem erro.

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'metrics-retention') then
    perform cron.unschedule('metrics-retention');
  end if;
end $$;

-- Todos os dias às 03:15 UTC (madrugada em Portugal, fora do horário de pedidos).
select cron.schedule(
  'metrics-retention',
  '15 3 * * *',
  $job$
    delete from public.quiz_events
      where action in ('page_view', 'session_time')
        and created_at < now() - interval '180 days';
    delete from public.error_logs
      where created_at < now() - interval '60 days';
  $job$
);

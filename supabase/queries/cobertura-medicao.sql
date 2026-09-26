-- Cobertura da medição: quanto do negócio real o painel de Métricas consegue ver.
--
-- Como correr: cola no SQL Editor do dashboard do Supabase e carrega em Run.
-- Uma só instrução, de propósito (o SQL Editor mostra só o resultado da última).
-- Só devolve contagens por semana, nunca nomes, telefones ou mensagens.
--
-- A comparação que interessa é entre duas fontes que medem a mesma coisa por
-- caminhos diferentes:
--   * `pedidos_site_crm`: pedidos do quiz gravados em `leads` pela função
--     `submit-lead`. Não depende de cookies: é o registo operacional.
--   * `pedidos_medidos`: tentativas do quiz com 'complete' em `quiz_events`.
--     Só existe para quem aceitou as cookies (`emit()` em quizTracking.ts).
-- `pct_medido` é a razão entre as duas. Tudo o que o painel mostra a partir
-- de `quiz_events` (cliques de WhatsApp, cliques de telefone, aberturas,
-- funil, páginas) está sujeito ao mesmo corte.
--
-- `servicos_crm` vem de `service_requests` (aba CRM), por data do serviço:
-- é o trabalho realmente feito, qualquer que seja a origem.

with semanas as (
  select generate_series(
    date_trunc('week', now() at time zone 'Europe/Lisbon') - interval '7 weeks',
    date_trunc('week', now() at time zone 'Europe/Lisbon'),
    interval '1 week'
  ) as semana
),
l as (
  select date_trunc('week', created_at at time zone 'Europe/Lisbon') as semana,
         count(*) filter (where source = 'Website') as site,
         count(*) filter (where source = 'Manual') as manual,
         count(*) filter (where source = 'WhatsApp') as wa_importado
  from leads
  where created_at > now() - interval '9 weeks'
  group by 1
),
q as (
  select date_trunc('week', created_at at time zone 'Europe/Lisbon') as semana,
         count(distinct session_id) filter (where action = 'complete') as concluidos,
         count(distinct session_id) filter (where action = 'start' and step = -1) as aberturas,
         count(*) filter (where action = 'whatsapp_click') as wa,
         count(*) filter (where action = 'call_click') as tel,
         count(distinct session_id) filter (where action = 'page_view') as visitas
  from quiz_events
  where created_at > now() - interval '9 weeks'
    and coalesce(page_path, '') not like '/admin%'
  group by 1
),
e as (
  select date_trunc('week', created_at at time zone 'Europe/Lisbon') as semana,
         count(*) filter (where source = 'TrackingDelivery') as tracking,
         count(*) filter (where source = 'QuizForm-crm') as crm,
         count(*) filter (where source = 'QuizForm-email') as email
  from error_logs
  where created_at > now() - interval '9 weeks'
  group by 1
),
s as (
  select date_trunc('week', request_date::date::timestamp) as semana,
         count(*) as servicos,
         count(*) filter (where source = 'Website') as servicos_site,
         count(*) filter (where source = 'WhatsApp') as servicos_wa
  from service_requests
  where request_date::date > (now() - interval '9 weeks')::date
  group by 1
)
select sem.semana::date as semana,
       coalesce(l.site, 0) as pedidos_site_crm,
       coalesce(q.concluidos, 0) as pedidos_medidos,
       case when coalesce(l.site, 0) > 0
            then round(100.0 * coalesce(q.concluidos, 0) / l.site) end as pct_medido,
       coalesce(q.aberturas, 0) as aberturas_quiz_medidas,
       coalesce(q.wa, 0) as cliques_whatsapp_medidos,
       coalesce(q.tel, 0) as cliques_telefone_medidos,
       coalesce(q.visitas, 0) as visitas_medidas,
       coalesce(l.manual, 0) as leads_manuais,
       coalesce(l.wa_importado, 0) as leads_wa_importados,
       coalesce(s.servicos, 0) as servicos_crm,
       coalesce(s.servicos_site, 0) as servicos_crm_site,
       coalesce(s.servicos_wa, 0) as servicos_crm_whatsapp,
       coalesce(e.tracking, 0) as falhas_entrega_tracking,
       coalesce(e.crm, 0) as falhas_canal_crm,
       coalesce(e.email, 0) as falhas_canal_email
from semanas sem
left join l on l.semana = sem.semana
left join q on q.semana = sem.semana
left join e on e.semana = sem.semana
left join s on s.semana = sem.semana
order by 1 desc;

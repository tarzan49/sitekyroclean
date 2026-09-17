-- Atribuição de marketing: do clique no anúncio até ao pagamento (2026-09-18).
--
-- COMO APLICAR: colar no SQL Editor do dashboard do Supabase. **Nunca
-- `supabase db push`** — a base remota nunca teve tabela de histórico de
-- migrações e o push reaplica tudo desde 2024, o que já recriou as políticas
-- permissivas desse ano uma vez (ver 20260914000100_repair_rls_after_history_replay.sql).
-- Este ficheiro fica como registo, e é seguro correr as vezes que for preciso.
--
-- NÃO APAGA NADA. Só `create ... if not exists`, `add column if not exists`,
-- `drop policy` (políticas, não dados) e um `update` que preenche
-- `funnel_status` onde está nulo. Nenhum `delete`, nenhum `drop table`,
-- nenhum `truncate`.
--
-- O que resolve: o site sabia que um lead tinha chegado e não sabia de onde. A
-- única atribuição que existia era uma linha de texto dentro de `leads.notes`
-- com um JSON lá dentro, impossível de agrupar ou somar.

-- ════════════════════════════════════════════════════════════════════════════
-- 1. quiz_events: as sessões passam a carregar a origem
-- ════════════════════════════════════════════════════════════════════════════
--
-- Reaproveita a tabela que já existe em vez de criar uma de sessões: já tem
-- session_id, page_path, referrer, utm_* e device, já tem caixa de saída
-- persistente do lado do browser, e já tem o RLS certo (insert anónimo,
-- leitura só autenticada). O que faltava eram as colunas de campanha.
alter table public.quiz_events
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists gclid text,
  add column if not exists gbraid text,
  add column if not exists wbraid text,
  add column if not exists campaign_id text,
  add column if not exists ad_group_id text,
  add column if not exists keyword text,
  add column if not exists match_type text,
  add column if not exists creative_id text,
  add column if not exists ads_device text,
  add column if not exists network text,
  add column if not exists landing_page text,
  add column if not exists is_paid boolean not null default false;

-- `ads_device` e não `device`: `device` já existe e guarda mobile/tablet/desktop
-- deduzido da largura do ecrã. O ValueTrack `{device}` devolve m/t/c e é outra
-- coisa — medida pela Google, no clique, não pelo browser.

-- A restrição CHECK de `action` já rejeitou em silêncio, durante meses, eventos
-- cujo tipo não tinha sido acrescentado aqui (ver 20260820000000). Qualquer
-- ação nova tem de entrar nesta lista no mesmo commit que a introduz.
alter table public.quiz_events drop constraint if exists quiz_events_action_check;
alter table public.quiz_events add constraint quiz_events_action_check
  check (action in ('start', 'complete', 'abandon', 'whatsapp_click', 'session_time', 'call_click', 'page_view'));

create index if not exists idx_quiz_events_created_at on public.quiz_events(created_at);
create index if not exists idx_quiz_events_action_created on public.quiz_events(action, created_at);
create index if not exists idx_quiz_events_campaign on public.quiz_events(campaign_id) where campaign_id is not null;
create index if not exists idx_quiz_events_paid on public.quiz_events(created_at) where is_paid;
create index if not exists idx_quiz_events_landing on public.quiz_events(landing_page) where landing_page is not null;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. leads: identificador estável, estado de funil, receita e pagamento
-- ════════════════════════════════════════════════════════════════════════════
--
-- `lead_id` é o identificador que o browser gera **uma vez por submissão** e
-- que acompanha o mesmo pedido em todo o lado: no evento `generate_lead`, no
-- `transaction_id` da conversão do Google Ads, no email, e aqui. `booking_id`
-- continua a ser a referência curta que a pessoa vê e diz ao telefone, e não
-- serve para isto porque são oito caracteres aleatórios sem garantia de
-- unicidade.
--
-- `funnel_status` é uma coluna nova e não uma mudança à `status` existente, de
-- propósito: `status` tem valores de 2024 ('pending', 'contacted', ...) e há
-- código e histórico a depender deles.
alter table public.leads
  add column if not exists lead_id text,
  add column if not exists funnel_status text,
  add column if not exists quoted_value numeric,
  add column if not exists booked_value numeric,
  add column if not exists final_revenue numeric,
  add column if not exists completed_at timestamptz,
  -- Faturado e recebido são coisas diferentes. Um orçamento aceite não é
  -- dinheiro em conta, e somar os dois inflaciona a receita e estraga o ROAS.
  add column if not exists amount_received numeric,
  add column if not exists payment_received_at timestamptz;

-- Valor por omissão, e não só o `update` no fim do ficheiro: um lead que entre
-- por outra via que não a Edge Function — importação de CSV, a sincronização do
-- WhatsApp, um insert à mão no SQL Editor — ficava com `funnel_status` nulo e
-- desaparecia das contagens do painel sem dar erro. O teste de permissões
-- apanhou exatamente isso.
alter table public.leads alter column funnel_status set default 'NEW';

alter table public.leads drop constraint if exists leads_funnel_status_check;
alter table public.leads add constraint leads_funnel_status_check
  check (funnel_status is null or funnel_status in
    ('NEW','VALID','QUALIFIED','QUOTED','BOOKED','COMPLETED','INVALID','LOST','CANCELLED'));

-- Índice único parcial: os leads antigos não têm `lead_id` e continuam todos a
-- null sem colidirem uns com os outros. **É esta a rede que impede o mesmo
-- pedido de criar dois leads** quando dois pedidos chegam ao mesmo tempo e o
-- `select` prévio da Edge Function passa nos dois.
create unique index if not exists idx_leads_lead_id on public.leads(lead_id) where lead_id is not null;
create index if not exists idx_leads_created_at on public.leads(created_at);
create index if not exists idx_leads_funnel_status on public.leads(funnel_status) where funnel_status is not null;

-- ════════════════════════════════════════════════════════════════════════════
-- 3. lead_attribution: uma linha por lead, tudo o que se sabe da origem
-- ════════════════════════════════════════════════════════════════════════════
--
-- Tabela à parte e não mais vinte colunas em `leads`: `leads` é a tabela de
-- dados do cliente, com validação mais apertada do lado da função de servidor,
-- e dados de marketing têm outro ciclo de vida (podem ser apagados sem tocar no
-- pedido). O `on delete cascade` garante que apagar um lead leva a atribuição.
--
-- Todos os campos são nulos por omissão porque a maior parte dos leads não tem
-- nenhum. Null lê-se como "não disponível" no painel — nunca se inventa.
--
-- **Nada de pessoal entra aqui.** Nem nome, nem telefone, nem email, nem
-- morada. São identificadores de clique, nomes de campanha e caminhos de
-- página. A lista de campos aceites está fechada na Edge Function.
create table if not exists public.lead_attribution (
  lead_id text primary key,
  lead_row_id uuid references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),

  -- form | whatsapp | phone. Um clique no WhatsApp não cria uma linha aqui:
  -- só cria quem chegou a ser um pedido.
  channel text,

  -- First touch: a primeira visita conhecida, guardada até 90 dias. Não é
  -- reescrita por visitas seguintes.
  first_source text,
  first_medium text,
  first_campaign text,
  first_landing_page text,
  first_seen_at timestamptz,

  -- Last touch: a última campanha antes do pedido. É a que o Google Ads credita
  -- por omissão, e por isso a que tem de bater certo com o relatório de lá.
  last_source text,
  last_medium text,
  last_campaign text,
  last_landing_page text,
  last_seen_at timestamptz,

  -- Identificadores de clique. Sem estes não há importação de conversões
  -- offline. `gbraid`/`wbraid` substituem o `gclid` em tráfego de app e iOS.
  gclid text,
  gbraid text,
  wbraid text,

  -- ValueTrack. `keyword` é a palavra-chave DA CONTA que fez o anúncio
  -- aparecer, não o que a pessoa escreveu na Google.
  campaign_id text,
  ad_group_id text,
  keyword text,
  match_type text,
  creative_id text,
  ads_device text,
  network text,

  referrer text,
  referrer_source text,
  landing_page text,
  conversion_page text,
  is_paid boolean not null default false,

  -- `client_id` do GA4, lido do cookie `_ga` no browser da pessoa. Não é usado
  -- hoje; é guardado porque só existe naquele momento e é o que permitiria
  -- enviar mais tarde eventos de funil pelo Measurement Protocol atribuídos à
  -- sessão original em vez da sessão do painel.
  ga_client_id text
);

create index if not exists idx_lead_attribution_created on public.lead_attribution(created_at);
create index if not exists idx_lead_attribution_campaign on public.lead_attribution(last_campaign) where last_campaign is not null;
create index if not exists idx_lead_attribution_campaign_id on public.lead_attribution(campaign_id) where campaign_id is not null;
create index if not exists idx_lead_attribution_gclid on public.lead_attribution(gclid) where gclid is not null;
create index if not exists idx_lead_attribution_landing on public.lead_attribution(landing_page);
create index if not exists idx_lead_attribution_paid on public.lead_attribution(created_at) where is_paid;
create index if not exists idx_lead_attribution_row on public.lead_attribution(lead_row_id);

-- ════════════════════════════════════════════════════════════════════════════
-- 4. lead_status_history: quem mudou o quê, quando
-- ════════════════════════════════════════════════════════════════════════════
--
-- O estado atual vive em `leads.funnel_status`; isto é o registo de como lá
-- chegou. Sem histórico não há forma de medir tempo até qualificação, nem de
-- saber que um lead foi dado como perdido e reaberto — e o painel conta pelo
-- ponto mais alto atingido, que sem isto seria impossível saber.
create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_row_id uuid references public.leads(id) on delete cascade,
  lead_id text,
  previous_status text,
  new_status text not null,
  -- Preenchido pelo servidor a partir do JWT (ver trigger abaixo). O que o
  -- browser mandar neste campo é ignorado.
  changed_by text,
  changed_at timestamptz not null default now(),
  note text
);
create index if not exists idx_lead_status_history_lead on public.lead_status_history(lead_row_id, changed_at);
create index if not exists idx_lead_status_history_changed on public.lead_status_history(changed_at);

-- ════════════════════════════════════════════════════════════════════════════
-- 5. lead_notifications: trinco de idempotência do canal de email
-- ════════════════════════════════════════════════════════════════════════════
--
-- O CRM tem o índice único em `leads.lead_id` a travar duplicados. O email não
-- tinha nada: um duplo clique ou um retry depois de timeout enviavam dois
-- emails do mesmo pedido. Chave primária composta — quem conseguir inserir é
-- quem envia. Escrita só pela Edge Function, com a chave de serviço.
create table if not exists public.lead_notifications (
  lead_id text not null,
  channel text not null,
  sent_at timestamptz not null default now(),
  primary key (lead_id, channel)
);

-- ════════════════════════════════════════════════════════════════════════════
-- 6. contact_log: contactos reais, registados à mão
-- ════════════════════════════════════════════════════════════════════════════
--
-- O site mede **cliques** em WhatsApp e telefone. Não mede conversas nem
-- chamadas atendidas: isso acontece fora do site, no telemóvel de quem atende.
-- Esta tabela existe para esse registo ser explícito e humano em vez de
-- deduzido — um clique nunca vira conversa por suposição.
--
-- `lead_row_id` é opcional: um contacto pode existir sem lead (alguém que
-- ligou e nunca preencheu nada). Quando existe, é uma ligação afirmada por uma
-- pessoa, não por um algoritmo.
create table if not exists public.contact_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  occurred_at timestamptz not null default now(),
  channel text not null check (channel in ('whatsapp', 'phone', 'email', 'other')),
  direction text not null default 'inbound' check (direction in ('inbound', 'outbound')),
  lead_row_id uuid references public.leads(id) on delete set null,
  contact_ref text,
  note text,
  logged_by text
);
create index if not exists idx_contact_log_occurred on public.contact_log(occurred_at);
create index if not exists idx_contact_log_lead on public.contact_log(lead_row_id);

-- ════════════════════════════════════════════════════════════════════════════
-- 7. conversion_exports: o estado real de cada conversão offline
-- ════════════════════════════════════════════════════════════════════════════
--
-- Quatro estados diferentes que não podem ser confundidos:
--   queued    — elegível, ainda não saiu daqui
--   exported  — saiu num CSV, ninguém sabe se foi carregado
--   submitted — carregado no Google Ads (marcado à mão por quem o fez)
--   accepted  — o Google Ads confirmou que a atribuiu
--   rejected  — o Google Ads recusou (sem gclid válido, fora da janela, etc.)
--
-- Sem isto, "exportei um CSV" passava por "a conversão está no Google Ads",
-- que é falso, e a mesma conversão podia ser exportada e importada duas vezes.
create table if not exists public.conversion_exports (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null,
  lead_row_id uuid references public.leads(id) on delete cascade,
  conversion_action text not null,
  click_id text,
  conversion_time timestamptz not null,
  value numeric,
  currency text not null default 'EUR',
  status text not null default 'queued'
    check (status in ('queued', 'exported', 'submitted', 'accepted', 'rejected')),
  exported_at timestamptz,
  submitted_at timestamptz,
  resolved_at timestamptz,
  note text,
  created_by text,
  created_at timestamptz not null default now(),
  -- A mesma conversão da mesma ação nunca é exportada duas vezes.
  unique (lead_id, conversion_action)
);
create index if not exists idx_conversion_exports_status on public.conversion_exports(status, created_at);

-- ════════════════════════════════════════════════════════════════════════════
-- 8. Autoria determinada pelo servidor
-- ════════════════════════════════════════════════════════════════════════════
--
-- `changed_by`/`logged_by`/`created_by` vinham do browser. Um browser pode
-- escrever o que quiser nesses campos, e um registo de auditoria que aceita o
-- nome do autor de quem está a ser auditado não é um registo de auditoria.
--
-- O trigger sobrepõe-se sempre ao que vier no insert, lendo o email do JWT da
-- sessão. Para a chave de serviço (Edge Functions), onde não há JWT de
-- utilizador, fica 'service'.
create or replace function public.set_actor_from_jwt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text;
begin
  actor := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
    'service'
  );
  if tg_table_name = 'lead_status_history' then
    new.changed_by := actor;
  elsif tg_table_name = 'contact_log' then
    new.logged_by := actor;
  elsif tg_table_name = 'conversion_exports' then
    -- Sem `coalesce`: a primeira versão deixava o browser escolher o autor
    -- quando mandava o campo preenchido, e o próprio teste de permissões
    -- apanhou-o. Um registo de auditoria que aceita o nome do autor de quem
    -- está a ser auditado não é um registo de auditoria.
    new.created_by := actor;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_status_history_actor on public.lead_status_history;
create trigger trg_status_history_actor before insert on public.lead_status_history
  for each row execute function public.set_actor_from_jwt();

drop trigger if exists trg_contact_log_actor on public.contact_log;
create trigger trg_contact_log_actor before insert on public.contact_log
  for each row execute function public.set_actor_from_jwt();

drop trigger if exists trg_conversion_exports_actor on public.conversion_exports;
create trigger trg_conversion_exports_actor before insert on public.conversion_exports
  for each row execute function public.set_actor_from_jwt();

-- ════════════════════════════════════════════════════════════════════════════
-- 9. Permissões
-- ════════════════════════════════════════════════════════════════════════════
--
-- Duas camadas, e as duas são precisas. O RLS decide que **linhas** um papel
-- vê; o GRANT decide se o papel pode sequer tocar na tabela. O Supabase concede
-- por omissão a `anon` e `authenticated` em tabelas novas do schema `public`,
-- por isso a revogação explícita não é decorativa: sem ela, uma política
-- acidentalmente permissiva no futuro abria a tabela toda.
--
-- Nenhuma destas tabelas é escrita pelo site público. São escritas pelas Edge
-- Functions com a chave de serviço (que ignora RLS e não precisa de GRANT) e
-- lidas/alteradas pelo painel com sessão autenticada.

alter table public.lead_attribution enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.lead_notifications enable row level security;
alter table public.contact_log enable row level security;
alter table public.conversion_exports enable row level security;

revoke all on public.lead_attribution from anon;
revoke all on public.lead_status_history from anon;
revoke all on public.lead_notifications from anon;
revoke all on public.contact_log from anon;
revoke all on public.conversion_exports from anon;

-- `lead_notifications` é só para a chave de serviço. Nem o painel precisa de a
-- ler: não tem nada que uma pessoa queira ver.
revoke all on public.lead_notifications from authenticated;

grant select on public.lead_attribution to authenticated;
grant select, insert on public.lead_status_history to authenticated;
grant select, insert, update, delete on public.contact_log to authenticated;
grant select, insert, update on public.conversion_exports to authenticated;

-- lead_attribution: leitura, e mais nada.
--
-- Sem UPDATE de propósito. A atribuição é um registo do que aconteceu no
-- momento do clique; deixar alterá-la a partir do painel permitia reescrever a
-- campanha de um lead depois de saber que ele fechou, que é a forma mais
-- silenciosa de fabricar um bom resultado.
drop policy if exists "Authenticated can select lead_attribution" on public.lead_attribution;
drop policy if exists "Authenticated can update lead_attribution" on public.lead_attribution;
create policy "Authenticated can select lead_attribution" on public.lead_attribution
  for select to authenticated using (true);

-- lead_status_history: ler e acrescentar. Sem UPDATE e sem DELETE — um
-- histórico que se pode reescrever não serve para nada.
drop policy if exists "Authenticated can select lead_status_history" on public.lead_status_history;
drop policy if exists "Authenticated can insert lead_status_history" on public.lead_status_history;
create policy "Authenticated can select lead_status_history" on public.lead_status_history
  for select to authenticated using (true);
create policy "Authenticated can insert lead_status_history" on public.lead_status_history
  for insert to authenticated with check (true);

-- lead_notifications: nenhuma política. Sem política e com RLS ligado, só a
-- chave de serviço entra.
drop policy if exists "Service only" on public.lead_notifications;

drop policy if exists "Authenticated can select contact_log" on public.contact_log;
drop policy if exists "Authenticated can insert contact_log" on public.contact_log;
drop policy if exists "Authenticated can update contact_log" on public.contact_log;
drop policy if exists "Authenticated can delete contact_log" on public.contact_log;
create policy "Authenticated can select contact_log" on public.contact_log for select to authenticated using (true);
create policy "Authenticated can insert contact_log" on public.contact_log for insert to authenticated with check (true);
create policy "Authenticated can update contact_log" on public.contact_log for update to authenticated using (true);
create policy "Authenticated can delete contact_log" on public.contact_log for delete to authenticated using (true);

drop policy if exists "Authenticated can select conversion_exports" on public.conversion_exports;
drop policy if exists "Authenticated can insert conversion_exports" on public.conversion_exports;
drop policy if exists "Authenticated can update conversion_exports" on public.conversion_exports;
create policy "Authenticated can select conversion_exports" on public.conversion_exports for select to authenticated using (true);
create policy "Authenticated can insert conversion_exports" on public.conversion_exports for insert to authenticated with check (true);
create policy "Authenticated can update conversion_exports" on public.conversion_exports for update to authenticated using (true);

-- Reafirmação do que 20260908 e 20260914000100 já tinham posto em `leads`,
-- `quiz_events` e `error_logs`. Repetido aqui de propósito: estas migrações são
-- coladas à mão e o histórico já foi reposto por engano uma vez.
revoke all on public.leads from anon;
grant insert on public.quiz_events to anon;
grant insert on public.error_logs to anon;

-- ════════════════════════════════════════════════════════════════════════════
-- 10. Leads que já existem
-- ════════════════════════════════════════════════════════════════════════════
--
-- Ficam com `funnel_status = 'NEW'` para o painel os contar em vez de os
-- esconder. Não se inventa atribuição para trás: um lead de agosto não ganha
-- uma campanha que não sabemos qual foi.
update public.leads set funnel_status = 'NEW' where funnel_status is null;

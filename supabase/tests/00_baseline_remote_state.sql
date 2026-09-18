-- Reproduz o estado REMOTO conhecido de quiz_events/leads/error_logs antes da
-- migração nova. As colunas de quiz_events foram confirmadas uma a uma contra
-- produção, por sondagem PostgREST (insert com NOT NULL a falhar antes de
-- escrever): page_path/referrer/utm_source/utm_medium/utm_campaign/device
-- existem; utm_term/utm_content/gclid/campaign_id/landing_page não existiam.
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
grant usage on schema public to anon, authenticated, service_role;
-- O Supabase define privilégios por omissão para tabelas novas do schema
-- `public`. É por isso que as revogações explícitas da migração não são
-- decorativas: sem elas, uma tabela nova nasce acessível ao `anon`.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text, phone text, email text, message text, service text, service_type text,
  details text, location text, value text, slot text, status text default 'pending',
  notes text default '', assigned_to text, priority text, source text, next_step text,
  booking_id text, margin_value numeric, total_value numeric, region text
);
alter table public.leads enable row level security;
create policy "Authenticated can select leads" on public.leads for select to authenticated using (true);
create policy "Authenticated can update leads" on public.leads for update to authenticated using (true);
create policy "Authenticated can delete leads" on public.leads for delete to authenticated using (true);
grant all on public.leads to anon, authenticated, service_role;

create table public.error_logs (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  message text not null, source text, url text, line_number int, col_number int,
  stack text, user_agent text,
  severity text default 'error' check (severity in ('error','warning','unhandled_rejection'))
);
alter table public.error_logs enable row level security;
create policy "Authenticated can read error_logs" on public.error_logs for select to authenticated using (true);
create policy "Anyone can insert error_logs" on public.error_logs for insert with check (true);
grant all on public.error_logs to anon, authenticated, service_role;

create table public.quiz_events (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  session_id text not null, step int not null,
  action text not null check (action in ('start','complete','abandon','whatsapp_click','session_time','call_click')),
  service text, city text, value numeric, service_type text,
  page_path text, referrer text, utm_source text, utm_medium text, utm_campaign text, device text
);
alter table public.quiz_events enable row level security;
create policy "Authenticated can read quiz_events" on public.quiz_events for select to authenticated using (true);
create policy "Anyone can insert quiz_events" on public.quiz_events for insert with check (true);
grant all on public.quiz_events to anon, authenticated, service_role;

-- Ver 20260910000000_add_whatsapp_conversations.sql e
-- 20260911000000_add_service_requests.sql — acrescentadas ao baseline em
-- 2026-09-18 para a migração de admin_authorization (que mexe nas suas
-- políticas) poder ser validada aqui.
create table public.wa_conversations (
  jid text primary key, name text, phone text,
  last_message_at timestamptz, last_message_text text,
  last_message_from_me boolean not null default false,
  waiting_for_reply boolean not null default false,
  synced_at timestamptz not null default now()
);
alter table public.wa_conversations enable row level security;
create policy "Authenticated can select wa_conversations" on public.wa_conversations for select to authenticated using (true);
grant all on public.wa_conversations to anon, authenticated, service_role;

create table public.wa_messages (
  id text primary key, chat_jid text not null references public.wa_conversations(jid) on delete cascade,
  from_me boolean not null, sent_at timestamptz not null, body text, type text
);
alter table public.wa_messages enable row level security;
create policy "Authenticated can select wa_messages" on public.wa_messages for select to authenticated using (true);
grant all on public.wa_messages to anon, authenticated, service_role;

create table public.wa_suggested_replies (
  chat_jid text primary key references public.wa_conversations(jid) on delete cascade,
  created_at timestamptz not null default now(), based_on_msg_ts timestamptz, reply text not null
);
alter table public.wa_suggested_replies enable row level security;
create policy "Authenticated can select wa_suggested_replies" on public.wa_suggested_replies for select to authenticated using (true);
grant all on public.wa_suggested_replies to anon, authenticated, service_role;

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  request_date date not null, description text not null default '',
  billed_value numeric not null default 0, my_cut numeric not null default 0,
  paid boolean not null default false,
  locality text not null check (locality in ('Porto','Lisboa','Algarve')),
  phone text, source text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.service_requests enable row level security;
create policy "Authenticated can select service_requests" on public.service_requests for select to authenticated using (true);
create policy "Authenticated can insert service_requests" on public.service_requests for insert to authenticated with check (true);
create policy "Authenticated can update service_requests" on public.service_requests for update to authenticated using (true);
create policy "Authenticated can delete service_requests" on public.service_requests for delete to authenticated using (true);
grant all on public.service_requests to anon, authenticated, service_role;

-- Dados existentes, para provar que a migração não os perde.
insert into public.leads (name, phone, service, location, status)
values ('Cliente Antigo','912000000','Sofás','Porto','contacted'),
       ('Cliente Antigo 2','913000000','Colchões','Lisboa','pending');
insert into public.quiz_events (session_id, step, action, page_path)
values ('v2:antigo', 0, 'whatsapp_click', '/limpeza-sofas-lisboa');

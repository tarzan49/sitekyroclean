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

-- Dados existentes, para provar que a migração não os perde.
insert into public.leads (name, phone, service, location, status)
values ('Cliente Antigo','912000000','Sofás','Porto','contacted'),
       ('Cliente Antigo 2','913000000','Colchões','Lisboa','pending');
insert into public.quiz_events (session_id, step, action, page_path)
values ('v2:antigo', 0, 'whatsapp_click', '/limpeza-sofas-lisboa');

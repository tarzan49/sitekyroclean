-- leads
drop table if exists public.leads cascade;
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  phone text,
  email text,
  message text,
  service text,
  service_type text,
  details text,
  location text,
  value text,
  slot text,
  status text default 'pending',
  notes text default '',
  assigned_to text,
  priority text,
  source text,
  next_step text,
  booking_id text
);
alter table public.leads enable row level security;
drop policy if exists "Allow anonymous insert" on public.leads;
drop policy if exists "Allow anonymous select" on public.leads;
drop policy if exists "Allow anonymous update" on public.leads;
create policy "Allow anonymous insert" on public.leads for insert with check (true);
create policy "Allow anonymous select" on public.leads for select using (true);
create policy "Allow anonymous update" on public.leads for update using (true);

-- error_logs
create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  message text not null,
  source text,
  url text,
  line_number int,
  col_number int,
  stack text,
  user_agent text,
  severity text default 'error' check (severity in ('error', 'warning', 'unhandled_rejection'))
);
alter table public.error_logs enable row level security;
drop policy if exists "Admin can read error_logs" on public.error_logs;
drop policy if exists "Anyone can insert error_logs" on public.error_logs;
create policy "Admin can read error_logs" on public.error_logs for select using (true);
create policy "Anyone can insert error_logs" on public.error_logs for insert with check (true);

-- quiz_events
create table if not exists public.quiz_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  session_id text not null,
  step int not null,
  action text not null check (action in ('start', 'complete', 'abandon')),
  service text,
  city text,
  value numeric,
  service_type text
);
alter table public.quiz_events enable row level security;
drop policy if exists "Admin can read quiz_events" on public.quiz_events;
drop policy if exists "Anyone can insert quiz_events" on public.quiz_events;
create policy "Admin can read quiz_events" on public.quiz_events for select using (true);
create policy "Anyone can insert quiz_events" on public.quiz_events for insert with check (true);

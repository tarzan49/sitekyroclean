-- Eventos do Google Calendar cuja linha o dono apagou no CRM. Sem isto, a
-- sincronização via o evento ainda no calendário e voltava a criar a linha
-- (dono, 2026-10-08: "já tentei remover manualmente e ele nunca sai").
-- Aplicado com `supabase db query --linked -f`, nunca com `db push`.
create table if not exists public.crm_ignored_calendar_events (
  event_id text primary key,
  deleted_at timestamptz not null default now()
);

alter table public.crm_ignored_calendar_events enable row level security;
revoke all on public.crm_ignored_calendar_events from public, anon, authenticated;
grant select, insert, delete on public.crm_ignored_calendar_events to authenticated;

drop policy if exists "Admin ignored calendar events" on public.crm_ignored_calendar_events;
create policy "Admin ignored calendar events" on public.crm_ignored_calendar_events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

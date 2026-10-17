-- Conversas do WhatsApp por semana, para a aba "Semanas" do CRM (dono, 2026-10-17:
-- "quero que esta tabela esteja no admin panel para termos boas estatísticas").
-- Só números, nunca telefones. Duas fontes por semana:
--   whatsapp_web: contagem feita no WhatsApp Web (a que o dono validou a 17/10);
--   servidor: contagem automática da base do Evolution no servidor do bot, de hora a hora.
-- O painel usa a do WhatsApp Web quando foi feita depois de a semana acabar, e a do
-- servidor no resto (semana em curso, ou semana ainda não contada no WhatsApp Web).
-- Escrita pela bot-api (whatsapp-weekly-upsert) e pelo SQL Editor; o painel só lê.
-- Aplicar com `supabase db query --linked -f`, nunca `db push`.
begin;
create table if not exists public.whatsapp_weekly_stats (
  week date not null,
  source text not null check (source in ('whatsapp_web', 'servidor')),
  new_people integer not null check (new_people >= 0),
  people_wrote integer not null check (people_wrote >= 0),
  counted_at timestamptz not null default now(),
  primary key (week, source)
);
revoke all on public.whatsapp_weekly_stats from public, anon, authenticated;
grant select on public.whatsapp_weekly_stats to authenticated;
alter table public.whatsapp_weekly_stats enable row level security;
drop policy if exists "Admin read whatsapp_weekly_stats" on public.whatsapp_weekly_stats;
create policy "Admin read whatsapp_weekly_stats" on public.whatsapp_weekly_stats for select to authenticated
  using (public.is_admin());
commit;

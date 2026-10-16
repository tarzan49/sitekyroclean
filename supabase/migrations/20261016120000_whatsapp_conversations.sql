-- Conversas novas do WhatsApp (dono, 2026-10-16: "a quantidade de novas conversas
-- que eu recebi no WhatsApp por dia, por semana [...] para comparar com a altura
-- em que isto era orgânico"). Uma linha por contacto (telefone, ou o @lid quando o
-- WhatsApp não diz o telefone), com a primeira mensagem e a origem lida dela
-- (google, meta, questionario, organico). Escrita só pela bot-api
-- (conversations-upsert), a partir do kyro.db do servidor do bot; o painel só lê.
-- Aplicar com `supabase db query --linked -f`, nunca `db push`.
begin;
create table if not exists public.whatsapp_conversations (
  contact_key text primary key,
  is_lid boolean not null default false,
  first_at timestamptz not null,
  origin text not null check (origin in ('google','meta','questionario','organico')),
  started_by_us boolean not null default false,
  inbound_count integer not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists whatsapp_conversations_first_idx on public.whatsapp_conversations (first_at);
revoke all on public.whatsapp_conversations from public, anon, authenticated;
grant select on public.whatsapp_conversations to authenticated;
alter table public.whatsapp_conversations enable row level security;
drop policy if exists "Admin read whatsapp_conversations" on public.whatsapp_conversations;
create policy "Admin read whatsapp_conversations" on public.whatsapp_conversations for select to authenticated
  using (public.is_admin());
commit;

-- Vista de conversas de WhatsApp + sugestões de resposta no admin panel
-- (2026-09-10). Os dados vêm de fora do Supabase: o projeto interno
-- kyro-clean-solutions (Bun + SQLite, corre na máquina do Francisco, lê o
-- WhatsApp via Evolution API) sincroniza para aqui com `bun run push`,
-- usando a service_role key — que ignora RLS. Por isso estas tabelas não
-- têm política nenhuma para `anon`: ninguém sem sessão lê ou escreve nada
-- aqui, ao contrário de leads/quiz_events/error_logs (que precisam de
-- insert público para o quiz/tracking do site). Isto é só leitura para o
-- admin panel; nada aqui envia mensagens — é sempre o Francisco a copiar a
-- sugestão para o WhatsApp à mão (ver validação em curso, CLAUDE.md do
-- projeto kyro-clean-solutions).

create table if not exists public.wa_conversations (
  jid text primary key,
  name text,
  phone text,
  last_message_at timestamptz,
  last_message_text text,
  last_message_from_me boolean not null default false,
  waiting_for_reply boolean not null default false,
  synced_at timestamptz not null default now()
);
alter table public.wa_conversations enable row level security;
drop policy if exists "Authenticated can select wa_conversations" on public.wa_conversations;
create policy "Authenticated can select wa_conversations" on public.wa_conversations for select to authenticated using (true);

create table if not exists public.wa_messages (
  id text primary key,
  chat_jid text not null references public.wa_conversations(jid) on delete cascade,
  from_me boolean not null,
  sent_at timestamptz not null,
  body text,
  type text
);
create index if not exists idx_wa_messages_chat on public.wa_messages(chat_jid, sent_at);
alter table public.wa_messages enable row level security;
drop policy if exists "Authenticated can select wa_messages" on public.wa_messages;
create policy "Authenticated can select wa_messages" on public.wa_messages for select to authenticated using (true);

-- Uma sugestão "atual" por conversa — cada sync substitui a anterior.
create table if not exists public.wa_suggested_replies (
  chat_jid text primary key references public.wa_conversations(jid) on delete cascade,
  created_at timestamptz not null default now(),
  based_on_msg_ts timestamptz,
  reply text not null
);
alter table public.wa_suggested_replies enable row level security;
drop policy if exists "Authenticated can select wa_suggested_replies" on public.wa_suggested_replies;
create policy "Authenticated can select wa_suggested_replies" on public.wa_suggested_replies for select to authenticated using (true);

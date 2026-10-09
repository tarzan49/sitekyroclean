-- Pré-reservas do bot de WhatsApp no calendário do dono (2026-10-08).
-- Uma linha por conversa: o evento que o bot escreveu (ReservasBot.gs) e a
-- hora. Serve para duas coisas: mudar a pré-reserva em vez de criar outra
-- quando o cliente troca de hora, e contar a hora como ocupada nos minutos em
-- que o endereço iCal do Google ainda não mostra o evento novo.
-- Só a bot-api (service role) escreve; o painel lê.
-- Aplica-se colando no SQL Editor ou com `supabase db query --linked -f`
-- (nunca `db push`, ver a sétima armadilha do CLAUDE.md).

create table if not exists public.bot_calendar_holds (
  conversation_id text primary key,
  event_id text not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  released_at timestamptz
);

alter table public.bot_calendar_holds enable row level security;
revoke all on public.bot_calendar_holds from anon, authenticated;
grant select on public.bot_calendar_holds to authenticated;

drop policy if exists bot_calendar_holds_admin_read on public.bot_calendar_holds;
create policy bot_calendar_holds_admin_read on public.bot_calendar_holds
  for select to authenticated using (public.is_admin());

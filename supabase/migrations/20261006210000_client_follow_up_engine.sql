-- Motor de seguimento de clientes (dono, 2026-10-06). Aditiva; aplica-se com
-- `supabase db query --linked -f` ou colando no SQL Editor (sétima armadilha
-- do CLAUDE.md: nunca `supabase db push`).
--
-- clients.contact_preference: normal, sem_promocoes (só mensagens do próprio
--   serviço) ou nao_contactar (só se responde quando a pessoa escreve).
-- clients.contact_note: o porquê ("pediu a 06/10 para não lhe escrevermos").
-- clients.on_hold_reason: queixa ou problema em aberto; enquanto estiver
--   escrito, nada de avaliações, recomendações nem campanhas.
-- clients.referred_by: quem recomendou, para medir o que as recomendações
--   trazem sem custo de anúncio.
--
-- client_touches: cada mensagem de seguimento enviada (ou que se decidiu não
--   enviar), pelo painel ou pelo bot. É o que impede a mesma mensagem de voltar
--   a ser sugerida e o que mede o que resulta (`template` = versão A ou B).
--
-- follow_up_digests: um registo por dia do email de seguimentos, para o cron
--   (que corre duas vezes por causa da hora de verão) nunca o mandar duas vezes.

begin;

alter table public.clients
  add column if not exists contact_preference text not null default 'normal',
  add column if not exists contact_note text,
  add column if not exists on_hold_reason text,
  add column if not exists referred_by text;

alter table public.clients drop constraint if exists clients_contact_preference_check;
alter table public.clients add constraint clients_contact_preference_check
  check (contact_preference in ('normal', 'sem_promocoes', 'nao_contactar'));

create table if not exists public.client_touches (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  kind text not null check (kind in (
    'responder', 'seguimento', 'lembrete', 'vespera', 'mesma_visita', 'avaliacao',
    'avaliacao_lembrete', 'recomendacao', 'manutencao', 'campanha', 'outro'
  )),
  campaign text,
  template text,
  skipped boolean not null default false,
  note text,
  message text check (message is null or length(message) <= 4000),
  channel text not null default 'painel' check (channel in ('painel', 'bot', 'importacao')),
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists client_touches_client_idx on public.client_touches (client_id, created_at desc);
create index if not exists client_touches_kind_idx on public.client_touches (kind, created_at desc);

revoke all on public.client_touches from public, anon, authenticated;
grant select, insert, update, delete on public.client_touches to authenticated;
alter table public.client_touches enable row level security;
drop policy if exists "Admin client touches" on public.client_touches;
create policy "Admin client touches" on public.client_touches for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Autoria pelo servidor, como em contact_log: o que o browser mandar é
-- ignorado. Com a chave de serviço (bot, email) fica 'service'.
create or replace function public.client_touches_set_actor() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_by := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
    'service'
  );
  return new;
end $$;

drop trigger if exists client_touches_set_actor on public.client_touches;
create trigger client_touches_set_actor before insert on public.client_touches
  for each row execute function public.client_touches_set_actor();

create table if not exists public.follow_up_digests (
  day date primary key,
  sent_at timestamptz not null default now(),
  items integer not null default 0,
  error text
);

revoke all on public.follow_up_digests from public, anon, authenticated;
grant select on public.follow_up_digests to authenticated;
alter table public.follow_up_digests enable row level security;
drop policy if exists "Admin follow-up digests" on public.follow_up_digests;
create policy "Admin follow-up digests" on public.follow_up_digests for select to authenticated
  using (public.is_admin());

commit;

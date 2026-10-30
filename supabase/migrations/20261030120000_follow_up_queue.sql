-- Aba "Follow-ups" do separador Clientes (dono, 2026-10-30: "no admin panel
-- podias criar uma aba de follow ups onde trabalhávamos follow ups ativamente").
-- Uma linha por pessoa a quem demos preço e que não fechou, com a leitura da
-- conversa (estado, resumo) e a mensagem proposta. O dono edita, aprova, marca
-- como enviada ou descarta. Escrita pelas análises das conversas (SQL Editor /
-- db query) e pelo painel; nada é enviado a partir daqui.
-- Os dados nunca vão para o repositório (é público).

create table if not exists public.follow_up_queue (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  city text,
  service text,
  price_given text,
  -- leitura da conversa: quente, morno, devemos_resposta, aguardar, ja_marcado, perdido, ignorar
  temperature text not null default 'morno',
  score smallint not null default 0,
  summary text,
  unanswered_follow_ups smallint not null default 0,
  proposed_message text,
  missing_for_quote text,
  wait_until date,
  -- trabalho do dono: proposta, aprovado, enviado, respondeu, fechou, descartado
  status text not null default 'proposta',
  owner_note text,
  sent_at timestamptz,
  analysed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.follow_up_queue enable row level security;
revoke all on public.follow_up_queue from anon;

drop policy if exists follow_up_queue_admin_all on public.follow_up_queue;
create policy follow_up_queue_admin_all on public.follow_up_queue
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

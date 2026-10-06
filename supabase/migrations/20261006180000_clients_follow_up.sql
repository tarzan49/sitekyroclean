-- Lembretes de seguimento nas fichas de clientes (dono, 2026-10-06). Aditiva;
-- aplica-se colando no SQL Editor ou com `supabase db query --linked -f`
-- (sétima armadilha: nunca `supabase db push`).
--
-- follow_up_at: dia em que o dono quer voltar a falar com o contacto (ex.:
--   "fica para o ano", "o sofá chega daqui a 2 meses"). A vista Seguimentos do
--   painel avisa a partir de 7 dias antes.
-- follow_up_reason: o porquê, escrito a partir da conversa, para a mensagem
--   desse dia falar do que a pessoa disse.

begin;

alter table public.clients
  add column if not exists follow_up_at date,
  add column if not exists follow_up_reason text;

create index if not exists clients_follow_up_idx on public.clients (follow_up_at) where follow_up_at is not null;

commit;

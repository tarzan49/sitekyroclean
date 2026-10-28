-- Pedido de avaliação ao cliente no fim do serviço (dono, 2026-10-28: "no final
-- dos serviços envia a todos os clientes a mensagem a pedir avaliação", "em vez
-- de ir para a equipa vai para o cliente"). O bot manda-o uma vez por serviço,
-- quando a equipa manda a fotografia de depois ou o vídeo, ou duas horas depois
-- da hora de fim (clientReviewDue, src/lib/serviceProcedure.ts).
--
-- client_review_at / client_review_msg_id: quando saiu e o id do WhatsApp.
-- client_review_skip: porque não saiu (não contactar, em pausa, já avaliou,
-- sem telefone, conversa com queixa). Um dos dois preenchido = nunca mais.
--
-- Os serviços que já tinham recebido a mensagem da equipa antes desta data
-- ficam marcados, para o cliente não receber o pedido duas vezes.
--
-- Aplicar com `supabase db query --linked -f`, nunca `db push`.

begin;

alter table public.service_procedure
  add column if not exists client_review_at timestamptz,
  add column if not exists client_review_msg_id text,
  add column if not exists client_review_skip text;

update public.service_procedure
   set client_review_skip = 'antes de 28/10: a equipa reencaminhou'
 where client_review_at is null and client_review_skip is null;

commit;

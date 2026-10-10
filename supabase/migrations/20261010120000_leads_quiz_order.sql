-- O pedido do questionário como dados (src/lib/quizOrder.ts): artigos, medidas,
-- tratamento, recolha, observações e o pedido já pronto para a ferramenta de
-- orçamento do bot. Escrito pela função submit-lead, lido pela bot-api
-- (find-order) para o bot do WhatsApp não voltar a perguntar o que a pessoa já
-- escolheu no site (dono, 2026-10-10). Aplicar no SQL Editor ou com
-- `supabase db query --linked -f`, nunca com `db push` (sétima armadilha).
alter table public.leads add column if not exists quiz_order jsonb;

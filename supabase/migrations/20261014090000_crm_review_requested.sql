-- Avaliação pedida pela equipa, serviço a serviço (dono, 2026-10-14). Sem ela a
-- equipa perde 5% do valor do serviço, e as contas da noite (bot-api
-- team-accounts) somam esses 5% ao que a equipa deve ao dono: no Porto desde
-- sempre, nas outras equipas desde 19/10/2026 (guião das equipas).
-- O dono marca no CRM (aba Pedidos, coluna "Avaliação").
-- Aplicar no SQL Editor ou com `supabase db query --linked -f`, nunca `db push`.
alter table public.service_requests add column if not exists review_requested boolean not null default false;

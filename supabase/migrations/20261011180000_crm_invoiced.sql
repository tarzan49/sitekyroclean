-- CRM: o serviço foi faturado (fatura passada pelo Francisco) ou não. Dono, 2026-10-11:
-- "acrescentar uma linha onde diz se foi com fatura ou não, todos os meses saber
-- quanto é que foi com fatura e quanto é que não foi". invoice_ref guarda o NIF.
alter table public.service_requests add column if not exists invoiced boolean not null default false;
alter table public.service_requests add column if not exists invoice_ref text;

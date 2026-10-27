-- CRM: fatura por passar, fatura passada e fatura de parte do serviço (dono,
-- 2026-10-27: "os serviços que eu ainda não passei fatura, que vão ser passados
-- pela minha empresa, eles têm um IVA à parte"; "um botão de filtro [...] por
-- pagar, por fatura").
--
-- `invoiced` continua a querer dizer "com fatura": o valor do serviço tem o IVA
-- de 23% lá dentro (é assim que as contas das equipas o leem, teamAccounts.ts).
-- O que faltava:
--   invoice_issued_on  dia da fatura; vazio = fatura por passar.
--   invoice_by         quem a passou: 'Francisco' (até 20/10/2026, IVA já
--                      entregue) ou 'Empresa' (Kyro Clean Solutions Unipessoal,
--                      IVA a declarar no trimestre).
--   invoice_value      valor da fatura com IVA, quando a fatura é só de uma
--                      parte do serviço (ex.: só o colchão, para o condomínio);
--                      vazio = o valor do serviço todo.
--
-- Aplica-se colando no SQL Editor ou com `supabase db query --linked -f`,
-- nunca com `db push` (sétima armadilha do CLAUDE.md).
alter table public.service_requests add column if not exists invoice_issued_on date;
alter table public.service_requests add column if not exists invoice_by text;
alter table public.service_requests add column if not exists invoice_value numeric(10,2);

do $$ begin
  alter table public.service_requests add constraint service_requests_invoice_by_check
    check (invoice_by is null or invoice_by in ('Empresa', 'Francisco'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.service_requests add constraint service_requests_invoice_value_check
    check (invoice_value is null or invoice_value >= 0);
exception when duplicate_object then null; end $$;

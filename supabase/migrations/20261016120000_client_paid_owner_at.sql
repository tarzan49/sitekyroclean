-- Pago diretamente ao dono: o dia em que o cliente pagou (dono, 2026-10-16: "o serviço da
-- Catarina ainda não foi pago e tu já contas como pago?"). Só a partir daí a parte da equipa
-- é descontada nas contas da noite; antes aparece como "à espera do pagamento do cliente".
alter table public.service_requests add column if not exists client_paid_owner_at timestamptz;

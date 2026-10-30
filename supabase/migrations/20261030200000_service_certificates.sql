-- Certificado no fim de cada serviço, de limpeza ou de impermeabilização (dono, 2026-10-30:
-- "e para limpezas cria um certificado também"; "envia no fim do serviço sempre o pedido de
-- avaliação e de seguir no insta + o certificado com o desconto lá para a próxima").
-- Aplica-se com `supabase db query --linked -f`, nunca `db push`.
begin;

alter table public.waterproofing_certificates drop constraint if exists waterproofing_certificates_number_check;
alter table public.waterproofing_certificates add constraint waterproofing_certificates_number_check
  check (number ~ '^KYRO-(IMP|LIM)-[0-9]{8}-[0-9]{2,}$');
alter table public.waterproofing_certificates drop constraint if exists waterproofing_certificates_tier_check;
alter table public.waterproofing_certificates add constraint waterproofing_certificates_tier_check
  check (tier in ('premium', 'essencial', 'limpeza'));

alter table public.service_procedure add column if not exists client_certificate_at timestamptz;
alter table public.service_procedure add column if not exists client_certificate_skip text;
-- Os serviços que já receberam (ou saltaram) o pedido de avaliação não recebem agora o certificado.
update public.service_procedure set client_certificate_skip = 'antes da regra'
  where client_certificate_at is null and client_certificate_skip is null
    and (client_review_at is not null or client_review_skip is not null or service_day < current_date);

commit;

-- Registo de valores alterados e pedidos apagados no CRM (dono, 13 Nov: o Total faturado
-- desceu de ~12300€ para 11857€ e não havia forma de saber porquê).
-- Usa a mesma tabela do registo do "pago"; um apagado guarda a linha inteira em old_value.
create or replace function public.log_service_request_values() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  claims jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  who text := coalesce(claims->>'email', claims->>'role', current_user);
begin
  if tg_op = 'DELETE' then
    insert into service_request_paid_log(service_request_id, client_name, field, old_value, new_value, changed_by)
    values (old.id, old.client_name, 'deleted', to_jsonb(old)::text, null, who);
    return old;
  end if;
  if new.billed_value is distinct from old.billed_value then
    insert into service_request_paid_log(service_request_id, client_name, field, old_value, new_value, changed_by)
    values (new.id, new.client_name, 'billed_value', old.billed_value::text, new.billed_value::text, who);
  end if;
  if new.upsell_value is distinct from old.upsell_value then
    insert into service_request_paid_log(service_request_id, client_name, field, old_value, new_value, changed_by)
    values (new.id, new.client_name, 'upsell_value', old.upsell_value::text, new.upsell_value::text, who);
  end if;
  if new.my_cut is distinct from old.my_cut then
    insert into service_request_paid_log(service_request_id, client_name, field, old_value, new_value, changed_by)
    values (new.id, new.client_name, 'my_cut', old.my_cut::text, new.my_cut::text, who);
  end if;
  if new.request_date is distinct from old.request_date then
    insert into service_request_paid_log(service_request_id, client_name, field, old_value, new_value, changed_by)
    values (new.id, new.client_name, 'request_date', old.request_date::text, new.request_date::text, who);
  end if;
  return new;
end $$;

drop trigger if exists service_request_value_log on public.service_requests;
create trigger service_request_value_log after update or delete on public.service_requests
  for each row execute function public.log_service_request_values();

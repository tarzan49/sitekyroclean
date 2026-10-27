-- Registo de cada mudança de "pago" no CRM (dono, 27 Oct: "quando é que eu disse que estes serviços foram pagos?").
-- Quem: email da sessão do painel, ou o papel (service_role = bot/funções, postgres = SQL/sessões do Claude).
create table if not exists public.service_request_paid_log (
  id bigserial primary key,
  service_request_id uuid not null,
  client_name text,
  field text not null,
  old_value text,
  new_value text,
  changed_by text,
  changed_at timestamptz not null default now()
);
alter table public.service_request_paid_log enable row level security;
revoke all on public.service_request_paid_log from anon, authenticated;
grant select on public.service_request_paid_log to authenticated;
drop policy if exists paid_log_admin_read on public.service_request_paid_log;
create policy paid_log_admin_read on public.service_request_paid_log for select to authenticated using (public.is_admin());

create or replace function public.log_service_request_paid() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  claims jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  who text := coalesce(claims->>'email', claims->>'role', current_user);
begin
  if new.paid is distinct from old.paid then
    insert into service_request_paid_log(service_request_id, client_name, field, old_value, new_value, changed_by)
    values (new.id, new.client_name, 'paid', old.paid::text, new.paid::text, who);
  end if;
  if new.paid_to_owner is distinct from old.paid_to_owner then
    insert into service_request_paid_log(service_request_id, client_name, field, old_value, new_value, changed_by)
    values (new.id, new.client_name, 'paid_to_owner', old.paid_to_owner::text, new.paid_to_owner::text, who);
  end if;
  if new.client_paid_owner_at is distinct from old.client_paid_owner_at then
    insert into service_request_paid_log(service_request_id, client_name, field, old_value, new_value, changed_by)
    values (new.id, new.client_name, 'client_paid_owner_at', old.client_paid_owner_at::text, new.client_paid_owner_at::text, who);
  end if;
  return new;
end $$;

drop trigger if exists service_request_paid_log on public.service_requests;
create trigger service_request_paid_log after update on public.service_requests
  for each row execute function public.log_service_request_paid();

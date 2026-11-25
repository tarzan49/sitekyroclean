-- Segundo fator no painel (dono, 25 Nov 2026). Uma conta com um fator confirmado só é administradora numa sessão com o
-- código (aal2); sem fator nenhum, continua como estava (para o dono poder ligar o dele). Todas as políticas usam is_admin().
create or replace function public.is_admin()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  with c as (select nullif(current_setting('request.jwt.claims', true), '')::jsonb as j)
  select exists (
    select 1 from public.admin_users a, c
    where a.user_id = (c.j ->> 'sub')::uuid
      and (
        coalesce(c.j ->> 'aal', 'aal1') = 'aal2'
        or not exists (select 1 from auth.mfa_factors f where f.user_id = a.user_id and f.status = 'verified')
      )
  );
$function$;

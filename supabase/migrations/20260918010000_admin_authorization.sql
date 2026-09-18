-- Distingue quem administra a Kyro de quem apenas tem uma sessão Supabase
-- Auth válida. Até aqui não existia essa distinção: as políticas diziam
-- `to authenticated using (true)` e qualquer conta do projeto — porque só
-- existem contas do painel — era, por construção, administradora. Ver
-- `supabase/tests/README.md`, secção "Uma limitação que estes testes não
-- conseguem tapar", e `docs/tracking-google-ads.md`, secção 5.
--
-- Não é multiempresa nem isolamento entre contas: só uma tabela de
-- administradores autorizados e uma função que a lê.
--
-- Aplica-se colando no SQL Editor do dashboard do Supabase, nunca com
-- `supabase db push` — sétima armadilha do CLAUDE.md: a base remota não tem
-- histórico de migrações e `db push` reaplicaria o histórico todo desde
-- 20240101, recriando políticas antigas mais permissivas.

create table if not exists public.admin_users (
  user_id uuid primary key,
  email text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Sem nenhuma política para anon nem authenticated: com RLS ligado e zero
-- políticas, só a chave de serviço (o SQL Editor corre como superuser) lê ou
-- escreve esta tabela. Mesmo padrão que `lead_notifications` já usa —
-- ninguém autenticado precisa de ver quem mais é administrador, e ninguém
-- pode inserir-se a si próprio.
revoke all on public.admin_users from anon, authenticated;

-- `is_admin()` lê `request.jwt.claims` diretamente, como `set_actor_from_jwt`
-- já faz nesta base (ver 20260918000000_marketing_attribution.sql) — não
-- `auth.uid()`. O baseline de teste local (`supabase/tests/00_baseline_remote_state.sql`)
-- não recria o schema `auth`, e o projeto evita essa dependência de
-- propósito, para a mesma SQL correr igual no Docker e no SQL Editor real.
-- `security definer` deixa a função ler `admin_users` mesmo sem grant direto
-- ao chamador; devolve só um booleano, nunca linhas da tabela.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ── Troca "qualquer autenticado" por "autenticado e administrador" ─────────
--
-- Mesmas operações permitidas por tabela que já existiam (ver
-- 20260908000000, 20260914000100 e 20260918000000) — só a condição muda de
-- `true` para `public.is_admin()`. Nada de novo é permitido nem retirado.

-- leads
drop policy if exists "Authenticated can select leads" on public.leads;
drop policy if exists "Authenticated can update leads" on public.leads;
drop policy if exists "Authenticated can delete leads" on public.leads;
drop policy if exists "Admin can select leads" on public.leads;
drop policy if exists "Admin can update leads" on public.leads;
drop policy if exists "Admin can delete leads" on public.leads;
create policy "Admin can select leads" on public.leads for select to authenticated using (public.is_admin());
create policy "Admin can update leads" on public.leads for update to authenticated using (public.is_admin());
create policy "Admin can delete leads" on public.leads for delete to authenticated using (public.is_admin());

-- error_logs
drop policy if exists "Authenticated can read error_logs" on public.error_logs;
drop policy if exists "Admin can read error_logs" on public.error_logs;
create policy "Admin can read error_logs" on public.error_logs for select to authenticated using (public.is_admin());

-- quiz_events
drop policy if exists "Authenticated can read quiz_events" on public.quiz_events;
drop policy if exists "Admin can read quiz_events" on public.quiz_events;
create policy "Admin can read quiz_events" on public.quiz_events for select to authenticated using (public.is_admin());

-- wa_conversations / wa_messages / wa_suggested_replies
drop policy if exists "Authenticated can select wa_conversations" on public.wa_conversations;
drop policy if exists "Admin can select wa_conversations" on public.wa_conversations;
create policy "Admin can select wa_conversations" on public.wa_conversations for select to authenticated using (public.is_admin());
drop policy if exists "Authenticated can select wa_messages" on public.wa_messages;
drop policy if exists "Admin can select wa_messages" on public.wa_messages;
create policy "Admin can select wa_messages" on public.wa_messages for select to authenticated using (public.is_admin());
drop policy if exists "Authenticated can select wa_suggested_replies" on public.wa_suggested_replies;
drop policy if exists "Admin can select wa_suggested_replies" on public.wa_suggested_replies;
create policy "Admin can select wa_suggested_replies" on public.wa_suggested_replies for select to authenticated using (public.is_admin());

-- service_requests
drop policy if exists "Authenticated can select service_requests" on public.service_requests;
drop policy if exists "Authenticated can insert service_requests" on public.service_requests;
drop policy if exists "Authenticated can update service_requests" on public.service_requests;
drop policy if exists "Authenticated can delete service_requests" on public.service_requests;
drop policy if exists "Admin can select service_requests" on public.service_requests;
drop policy if exists "Admin can insert service_requests" on public.service_requests;
drop policy if exists "Admin can update service_requests" on public.service_requests;
drop policy if exists "Admin can delete service_requests" on public.service_requests;
create policy "Admin can select service_requests" on public.service_requests for select to authenticated using (public.is_admin());
create policy "Admin can insert service_requests" on public.service_requests for insert to authenticated with check (public.is_admin());
create policy "Admin can update service_requests" on public.service_requests for update to authenticated using (public.is_admin());
create policy "Admin can delete service_requests" on public.service_requests for delete to authenticated using (public.is_admin());

-- lead_attribution: leitura, e mais nada (sem UPDATE, ver 20260918000000).
drop policy if exists "Authenticated can select lead_attribution" on public.lead_attribution;
drop policy if exists "Admin can select lead_attribution" on public.lead_attribution;
create policy "Admin can select lead_attribution" on public.lead_attribution for select to authenticated using (public.is_admin());

-- lead_status_history: ler e acrescentar, nunca reescrever nem apagar.
drop policy if exists "Authenticated can select lead_status_history" on public.lead_status_history;
drop policy if exists "Authenticated can insert lead_status_history" on public.lead_status_history;
drop policy if exists "Admin can select lead_status_history" on public.lead_status_history;
drop policy if exists "Admin can insert lead_status_history" on public.lead_status_history;
create policy "Admin can select lead_status_history" on public.lead_status_history for select to authenticated using (public.is_admin());
create policy "Admin can insert lead_status_history" on public.lead_status_history for insert to authenticated with check (public.is_admin());

-- contact_log
drop policy if exists "Authenticated can select contact_log" on public.contact_log;
drop policy if exists "Authenticated can insert contact_log" on public.contact_log;
drop policy if exists "Authenticated can update contact_log" on public.contact_log;
drop policy if exists "Authenticated can delete contact_log" on public.contact_log;
drop policy if exists "Admin can select contact_log" on public.contact_log;
drop policy if exists "Admin can insert contact_log" on public.contact_log;
drop policy if exists "Admin can update contact_log" on public.contact_log;
drop policy if exists "Admin can delete contact_log" on public.contact_log;
create policy "Admin can select contact_log" on public.contact_log for select to authenticated using (public.is_admin());
create policy "Admin can insert contact_log" on public.contact_log for insert to authenticated with check (public.is_admin());
create policy "Admin can update contact_log" on public.contact_log for update to authenticated using (public.is_admin());
create policy "Admin can delete contact_log" on public.contact_log for delete to authenticated using (public.is_admin());

-- conversion_exports (sem DELETE, ver 20260918000000)
drop policy if exists "Authenticated can select conversion_exports" on public.conversion_exports;
drop policy if exists "Authenticated can insert conversion_exports" on public.conversion_exports;
drop policy if exists "Authenticated can update conversion_exports" on public.conversion_exports;
drop policy if exists "Admin can select conversion_exports" on public.conversion_exports;
drop policy if exists "Admin can insert conversion_exports" on public.conversion_exports;
drop policy if exists "Admin can update conversion_exports" on public.conversion_exports;
create policy "Admin can select conversion_exports" on public.conversion_exports for select to authenticated using (public.is_admin());
create policy "Admin can insert conversion_exports" on public.conversion_exports for insert to authenticated with check (public.is_admin());
create policy "Admin can update conversion_exports" on public.conversion_exports for update to authenticated using (public.is_admin());

-- ── Configurar o primeiro administrador ─────────────────────────────────
--
-- Deliberadamente NÃO faz parte desta migração: o schema `auth` (e a tabela
-- `auth.users`) só existe na base real, não no baseline de teste local, e
-- promover automaticamente "a primeira conta" ou "todas as contas
-- existentes" é exatamente o que este trabalho veio evitar. Depois de aplicar
-- esta migração na base real, correr à parte no SQL Editor (documentado em
-- docs/tracking-plano-de-publicacao.md):
--
--   insert into public.admin_users (user_id, email, role)
--   select id, email, 'owner' from auth.users where email = 'o-email-da-conta@...';

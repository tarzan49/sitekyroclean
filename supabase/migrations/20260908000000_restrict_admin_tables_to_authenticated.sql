-- Aperta o RLS de leads/quiz_events/error_logs (2026-09-08, achado CRITICAL no
-- audit de código): as políticas anteriores tinham "using (true)" sem
-- restrição de role, o que deixava a chave anon (pública, embutida no bundle
-- do site) ler e escrever estas tabelas por completo — nome/telefone/margem
-- de qualquer cliente legível por qualquer visitante via a API REST do
-- Supabase, sem sessão nenhuma.
--
-- Mantém-se o INSERT aberto ao anon em leads/quiz_events/error_logs — o quiz
-- público e o tracking de eventos precisam de o poder fazer sem sessão.
-- SELECT/UPDATE/DELETE passam a exigir uma sessão autenticada real (Supabase
-- Auth), que é o que o painel /admin/panel agora usa (ver
-- src/hooks/use-admin-session.ts) em vez do antigo gate de password em texto
-- simples no bundle.

-- leads
drop policy if exists "Allow anonymous select" on public.leads;
drop policy if exists "Allow anonymous update" on public.leads;
drop policy if exists "Authenticated can select leads" on public.leads;
drop policy if exists "Authenticated can update leads" on public.leads;
drop policy if exists "Authenticated can delete leads" on public.leads;
create policy "Authenticated can select leads" on public.leads for select to authenticated using (true);
create policy "Authenticated can update leads" on public.leads for update to authenticated using (true);
create policy "Authenticated can delete leads" on public.leads for delete to authenticated using (true);

-- error_logs
drop policy if exists "Admin can read error_logs" on public.error_logs;
drop policy if exists "Authenticated can read error_logs" on public.error_logs;
create policy "Authenticated can read error_logs" on public.error_logs for select to authenticated using (true);

-- quiz_events
drop policy if exists "Admin can read quiz_events" on public.quiz_events;
drop policy if exists "Authenticated can read quiz_events" on public.quiz_events;
create policy "Authenticated can read quiz_events" on public.quiz_events for select to authenticated using (true);

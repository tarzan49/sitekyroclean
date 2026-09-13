-- Reparação (2026-09-14). `supabase db push --include-all` reaplicou o
-- histórico todo desde 20240101, porque a base de dados remota nunca tinha
-- sido gerida pela CLI e não tinha tabela de histórico. Isso voltou a criar as
-- políticas permissivas de 2024 e desfez parte do aperto de 20260908:
-- `quiz_events` e `error_logs` ficaram outra vez legíveis pela chave anónima.
--
-- Este ficheiro repõe o estado correto e é seguro de correr as vezes que for
-- preciso. Junta duas coisas:
--   1. O aperto de 20260908 (leitura só com sessão autenticada).
--   2. O fecho da inserção anónima em `leads`, que era o objetivo inicial.
--
-- O INSERT anónimo continua aberto em `quiz_events` e `error_logs`: o site
-- precisa de escrever métricas e erros sem sessão. Em `leads` já não, porque
-- agora existe a Edge Function `submit-lead`.

-- leads: leitura/escrita só autenticada, e nem inserção anónima
drop policy if exists "Allow anonymous select" on public.leads;
drop policy if exists "Allow anonymous update" on public.leads;
drop policy if exists "Allow anonymous insert" on public.leads;
drop policy if exists "Authenticated can select leads" on public.leads;
drop policy if exists "Authenticated can update leads" on public.leads;
drop policy if exists "Authenticated can delete leads" on public.leads;
create policy "Authenticated can select leads" on public.leads for select to authenticated using (true);
create policy "Authenticated can update leads" on public.leads for update to authenticated using (true);
create policy "Authenticated can delete leads" on public.leads for delete to authenticated using (true);

-- error_logs: leitura só autenticada; inserção anónima mantém-se
drop policy if exists "Admin can read error_logs" on public.error_logs;
drop policy if exists "Authenticated can read error_logs" on public.error_logs;
create policy "Authenticated can read error_logs" on public.error_logs for select to authenticated using (true);

-- quiz_events: leitura só autenticada; inserção anónima mantém-se
drop policy if exists "Admin can read quiz_events" on public.quiz_events;
drop policy if exists "Authenticated can read quiz_events" on public.quiz_events;
create policy "Authenticated can read quiz_events" on public.quiz_events for select to authenticated using (true);

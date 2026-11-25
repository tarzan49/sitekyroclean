begin;
-- Segurança (dono, 25 Nov 2026): o que qualquer pessoa pode escrever fica limitado em tamanho, e fecham-se as portas
-- que o site já não usa (newsletter e raspadinha não têm código que escreva nelas; as funções usam a service_role).
drop policy if exists "allow_delete" on public.error_logs;
revoke select, update, delete, truncate, references, trigger on public.error_logs from anon;
revoke truncate, references, trigger on public.error_logs from authenticated;

drop policy if exists "Anyone can insert error_logs" on public.error_logs;
create policy "Anyone can insert error_logs" on public.error_logs for insert to anon, authenticated
  with check (length(to_jsonb(error_logs.*)::text) <= 40000);

drop policy if exists "Anyone can insert quiz_events" on public.quiz_events;
create policy "Anyone can insert quiz_events" on public.quiz_events for insert to anon, authenticated
  with check (length(to_jsonb(quiz_events.*)::text) <= 12000);

drop policy if exists "Public can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "Public can record scratch interaction" on public.scratch_card_interactions;

-- TRUNCATE não passa pela RLS: nenhuma tabela precisa dele para os papéis do browser.
do $$ declare t record; begin
  for t in select c.oid::regclass as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relkind in ('r','p') loop
    execute format('revoke truncate, references, trigger on %s from anon, authenticated', t.name);
  end loop;
end $$;

update storage.buckets set file_size_limit = 15728640,
  allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif']
where id = 'expense-docs';
commit;

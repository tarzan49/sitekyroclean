-- Prova de permissões, papel a papel.
--
-- Emula o que o PostgREST faz a cada pedido: `set role` para o papel do
-- token (`anon` sem sessão, `authenticated` com sessão) e
-- `request.jwt.claims` com o conteúdo do JWT. É o mesmo mecanismo que decide
-- o acesso em produção, por isso o que passar aqui passa lá.
--
-- Cada bloco falha ruidosamente (`raise exception`) se o resultado não for o
-- esperado. Nenhum `raise` = tudo como devia.

\set ON_ERROR_STOP on

-- NOTA QUE MUDA A FORMA DE LER ESTE FICHEIRO:
--
-- O RLS **não gera erro** num SELECT. Filtra as linhas em silêncio e devolve
-- zero. Só o GRANT em falta gera `insufficient_privilege`. A primeira versão
-- deste ficheiro usava um helper único, à espera de exceção, e por isso deu
-- "permitido" a um SELECT que na verdade devolvia zero linhas. Dois helpers,
-- cada um a verificar o que é verificável:
--
--   expect_no_read   — erro de privilégio OU zero linhas
--   expect_no_write  — erro de privilégio/RLS OU zero linhas afetadas

create or replace function pg_temp.expect_no_read(sql text, what text)
returns void language plpgsql as $fn$
declare got int;
begin
  begin
    execute 'select count(*) from (' || sql || ') t' into got;
  exception
    when insufficient_privilege then return;
    when others then
      if sqlerrm like '%permission denied%' then return; else raise; end if;
  end;
  if got > 0 then
    raise exception 'FALHA DE SEGURANCA: % devolveu % linhas e devia devolver zero', what, got;
  end if;
end; $fn$;

create or replace function pg_temp.expect_no_write(sql text, what text)
returns void language plpgsql as $fn$
declare affected int;
begin
  begin
    execute sql;
    get diagnostics affected = row_count;
  exception
    when insufficient_privilege then return;
    when others then
      if sqlerrm like '%violates row-level security%' or sqlerrm like '%permission denied%' then return;
      else raise; end if;
  end;
  if affected > 0 then
    raise exception 'FALHA DE SEGURANCA: % afetou % linhas e nao devia afetar nenhuma', what, affected;
  end if;
end; $fn$;

create or replace function pg_temp.expect_rows(sql text, n int, what text)
returns void language plpgsql as $fn$
declare got int;
begin
  execute 'select count(*) from (' || sql || ') t' into got;
  if got <> n then raise exception 'FALHA: % devolveu % linhas, esperava %', what, got, n; end if;
end; $fn$;

-- ════════════════════════════════════════════════════════════════════════════
-- Preparação: um lead com atribuição, criado pela chave de serviço, como a
-- Edge Function faz.
-- ════════════════════════════════════════════════════════════════════════════
set role service_role;
insert into public.leads (name, phone, email, service, location, lead_id, funnel_status)
values ('Teste Permissões', '912345678', 'teste@exemplo.invalid', 'Sofás', 'Lisboa', 'L-PERM-1', 'NEW');
insert into public.lead_attribution (lead_id, lead_row_id, gclid, last_campaign, is_paid)
select 'L-PERM-1', id, 'Cj0PERM', '221', true from public.leads where lead_id = 'L-PERM-1';
insert into public.lead_status_history (lead_id, new_status) values ('L-PERM-1', 'NEW');
reset role;

-- ════════════════════════════════════════════════════════════════════════════
-- VISITANTE ANÓNIMO (a chave pública, que está dentro do bundle do site)
-- ════════════════════════════════════════════════════════════════════════════
set role anon;

select pg_temp.expect_no_read($$select * from public.leads$$, 'anon a ler leads (contactos)');
select pg_temp.expect_no_read($$select * from public.lead_attribution$$, 'anon a ler lead_attribution');
select pg_temp.expect_no_read($$select * from public.lead_status_history$$, 'anon a ler lead_status_history');
select pg_temp.expect_no_read($$select * from public.contact_log$$, 'anon a ler contact_log');
select pg_temp.expect_no_read($$select * from public.conversion_exports$$, 'anon a ler conversion_exports');
select pg_temp.expect_no_read($$select * from public.lead_notifications$$, 'anon a ler lead_notifications');

select pg_temp.expect_no_write($$insert into public.leads (name, phone) values ('Falso','900')$$, 'anon a criar um lead');
select pg_temp.expect_no_write($$update public.leads set funnel_status = 'COMPLETED'$$, 'anon a mudar estados');
select pg_temp.expect_no_write($$update public.leads set final_revenue = 9999$$, 'anon a mexer em receitas');
select pg_temp.expect_no_write($$insert into public.lead_status_history (lead_id, new_status) values ('L-PERM-1','COMPLETED')$$, 'anon a fabricar uma qualificação');
select pg_temp.expect_no_write($$insert into public.conversion_exports (lead_id, conversion_action, conversion_time) values ('L-PERM-1','Cliente', now())$$, 'anon a fabricar uma conversão');
select pg_temp.expect_no_write($$update public.lead_attribution set last_campaign = 'inventada'$$, 'anon a reescrever atribuição');
select pg_temp.expect_no_write($$delete from public.leads$$, 'anon a apagar leads');

-- O que o anon PRECISA de poder fazer: o site público escreve métricas e erros.
insert into public.quiz_events (session_id, step, action, page_path, gclid, is_paid)
values ('v2:anon-test', 0, 'page_view', '/limpeza-sofas-lisboa', 'Cj0ANON', true);
insert into public.error_logs (message, source) values ('teste', 'TesteDePermissoes');
-- ... mas não pode ler de volta o que escreveu.
select pg_temp.expect_no_read($$select * from public.quiz_events$$, 'anon a ler quiz_events');
select pg_temp.expect_no_read($$select * from public.error_logs$$, 'anon a ler error_logs');

reset role;

-- ════════════════════════════════════════════════════════════════════════════
-- UTILIZADOR AUTENTICADO SEM FUNÇÃO ADMINISTRATIVA
-- ════════════════════════════════════════════════════════════════════════════
--
-- NOTA IMPORTANTE, e é uma limitação real e não um resultado: neste projeto
-- **não existe** o conceito de utilizador autenticado não-administrador. O
-- Supabase Auth só tem as contas criadas à mão para o painel, e as políticas
-- dizem `to authenticated`. Portanto, qualquer conta que exista no projeto é,
-- por construção, administradora.
--
-- O que este bloco prova é o que essa conta pode e não pode fazer. O que **não**
-- prova é isolamento entre contas, porque esse isolamento não existe. Está
-- registado no relatório como limitação, com a correção proposta (uma coluna de
-- papel e políticas que a leiam).
set role authenticated;
set request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@kyroclean.invalid","role":"authenticated"}';

select pg_temp.expect_rows($$select id from public.leads where lead_id = 'L-PERM-1'$$, 1, 'painel a ler o lead');
select pg_temp.expect_rows($$select lead_id from public.lead_attribution$$, 1, 'painel a ler a atribuição');

-- A atribuição é só de leitura: reescrevê-la depois de saber que o lead fechou
-- é a forma mais silenciosa de fabricar um bom resultado.
select pg_temp.expect_no_write($$update public.lead_attribution set last_campaign = 'a melhor'$$, 'painel a reescrever atribuição');
select pg_temp.expect_no_write($$delete from public.lead_attribution$$, 'painel a apagar atribuição');

-- O histórico não se reescreve nem se apaga — só se acrescenta.
select pg_temp.expect_no_write($$update public.lead_status_history set new_status = 'COMPLETED'$$, 'painel a reescrever o histórico');
select pg_temp.expect_no_write($$delete from public.lead_status_history$$, 'painel a apagar o histórico');

-- O trinco de email não é sequer visível para o painel.
select pg_temp.expect_no_read($$select * from public.lead_notifications$$, 'painel a ler lead_notifications');

-- O que o painel PRECISA de poder fazer.
update public.leads set funnel_status = 'QUALIFIED' where lead_id = 'L-PERM-1';
insert into public.lead_status_history (lead_row_id, lead_id, previous_status, new_status, changed_by)
select id, 'L-PERM-1', 'NEW', 'QUALIFIED', 'MENTIRA-DO-BROWSER' from public.leads where lead_id = 'L-PERM-1';
insert into public.contact_log (channel, note, logged_by) values ('whatsapp', 'Conversa real', 'MENTIRA-DO-BROWSER');
insert into public.conversion_exports (lead_id, conversion_action, click_id, conversion_time, created_by)
values ('L-PERM-1', 'Lead qualificado', 'Cj0PERM', now(), 'MENTIRA-DO-BROWSER');

reset role;

-- ════════════════════════════════════════════════════════════════════════════
-- AUTORIA: determinada pelo servidor, nunca aceite do browser
-- ════════════════════════════════════════════════════════════════════════════
do $$
declare v text;
begin
  select changed_by into v from public.lead_status_history where new_status = 'QUALIFIED';
  if v <> 'admin@kyroclean.invalid' then
    raise exception 'FALHA: changed_by era "%", esperava o email da sessão', v;
  end if;

  select logged_by into v from public.contact_log limit 1;
  if v <> 'admin@kyroclean.invalid' then
    raise exception 'FALHA: logged_by era "%", esperava o email da sessão', v;
  end if;

  select created_by into v from public.conversion_exports limit 1;
  if v = 'MENTIRA-DO-BROWSER' then
    raise exception 'FALHA: created_by aceitou o valor enviado pelo browser';
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- IDEMPOTÊNCIA AO NÍVEL DA BASE DE DADOS
-- ════════════════════════════════════════════════════════════════════════════
set role service_role;
do $$
begin
  -- O mesmo lead_id nunca cria dois leads, mesmo que o `select` prévio da Edge
  -- Function passe nos dois pedidos em simultâneo.
  begin
    insert into public.leads (name, phone, lead_id) values ('Duplicado', '912345678', 'L-PERM-1');
    raise exception 'FALHA: o mesmo lead_id criou um segundo lead';
  exception when unique_violation then null;
  end;

  -- Dois leads antigos sem lead_id continuam a poder coexistir (índice parcial).
  insert into public.leads (name, phone) values ('Sem id A', '911'), ('Sem id B', '912');

  -- O mesmo email nunca é enviado duas vezes para o mesmo pedido.
  insert into public.lead_notifications (lead_id, channel) values ('L-PERM-1', 'email');
  begin
    insert into public.lead_notifications (lead_id, channel) values ('L-PERM-1', 'email');
    raise exception 'FALHA: o trinco de email deixou passar um segundo envio';
  exception when unique_violation then null;
  end;

  -- A mesma conversão da mesma ação nunca é exportada duas vezes.
  begin
    insert into public.conversion_exports (lead_id, conversion_action, conversion_time)
    values ('L-PERM-1', 'Lead qualificado', now());
    raise exception 'FALHA: a mesma conversão foi exportada duas vezes';
  exception when unique_violation then null;
  end;
end $$;
reset role;

-- ════════════════════════════════════════════════════════════════════════════
-- OS DADOS ANTIGOS CONTINUAM LÁ
-- ════════════════════════════════════════════════════════════════════════════
do $$
declare antigos int; sem_estado int; evento int;
begin
  select count(*) into antigos from public.leads where name like 'Cliente Antigo%';
  if antigos <> 2 then raise exception 'FALHA: os leads antigos desapareceram (% de 2)', antigos; end if;

  select count(*) into sem_estado from public.leads where funnel_status is null;
  if sem_estado <> 0 then raise exception 'FALHA: % leads ficaram sem funnel_status', sem_estado; end if;

  select count(*) into evento from public.quiz_events where session_id = 'v2:antigo';
  if evento <> 1 then raise exception 'FALHA: o evento antigo desapareceu'; end if;
end $$;

select 'TODAS AS VERIFICAÇÕES DE PERMISSÕES PASSARAM' as resultado;

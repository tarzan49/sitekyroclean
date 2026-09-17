-- Verificação da CHECK constraint de `quiz_events` (só leitura).
--
-- Porque existe: `quiz_events.action` tem uma CHECK constraint desde
-- 20240101_admin_tables.sql, e já foi preciso alargá-la duas vezes
-- (20260820000000 para 'whatsapp_click'/'session_time', 20260826000000 para
-- 'call_click'). Das duas vezes o sintoma foi o mesmo e foi invisível: o
-- cliente dispara e esquece, o Postgres rejeita, e a métrica lê zero durante
-- semanas sem um único erro à vista.
--
-- Pior: a base de dados remota é gerida à mão pelo SQL Editor, por isso os
-- ficheiros em supabase/migrations/ NÃO são a fonte de verdade do que lá está.
-- A única forma de saber o que a constraint aceita hoje é perguntar-lhe.
--
-- Corre isto ANTES de fazer deploy de qualquer código que escreva um valor
-- novo em `action`. Se a coluna `em_falta` não vier vazia, esses valores serão
-- rejeitados em silêncio: alarga a constraint primeiro (cola o ALTER TABLE no
-- SQL Editor, como os ficheiros acima; **nunca `supabase db push`** neste
-- projeto, ver sétima armadilha no CLAUDE.md) e só depois faz deploy.
--
-- `step` não tem constraint nenhuma (é `int not null`), por isso valores novos
-- de passo, incluindo o -1 que marca a abertura, não precisam de nada.
--
-- Uma só instrução, de propósito: o SQL Editor mostra apenas o resultado da
-- última instrução de um script.

select
  c.conname                                as constraint_nome,
  pg_get_constraintdef(c.oid)              as definicao_atual,
  coalesce(
    (
      select string_agg(valor, ', ' order by valor)
      from unnest(array[
        -- Todos os valores que o código escreve hoje. Acrescenta aqui
        -- qualquer valor novo antes de fazer deploy do código que o envia.
        'start', 'complete', 'abandon', 'whatsapp_click', 'session_time', 'call_click'
      ]) as valor
      where pg_get_constraintdef(c.oid) not like '%''' || valor || '''%'
    ),
    '(nenhum - a constraint aceita tudo o que o codigo envia)'
  )                                        as em_falta
from pg_constraint c
where c.conrelid = 'public.quiz_events'::regclass
  and c.contype = 'c';

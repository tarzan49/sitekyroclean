# Testes de esquema e permissões

Correm contra um Postgres descartável em Docker, **nunca** contra produção.
Provam três coisas antes de a migração ser colada no SQL Editor:

1. a migração corre sem erro e é idempotente (correr duas vezes não muda nada);
2. nenhum papel pode fazer o que não deve — anónimo, autenticado, serviço;
3. os dados que já existem sobrevivem.

```bash
docker run -d --name kyro-pg-validate -e POSTGRES_PASSWORD=validate -p 55433:5432 postgres:15-alpine

docker cp supabase/tests/00_baseline_remote_state.sql kyro-pg-validate:/tmp/
docker cp supabase/migrations/20260918000000_marketing_attribution.sql kyro-pg-validate:/tmp/migration.sql
docker cp supabase/tests/10_permissions.sql kyro-pg-validate:/tmp/

docker exec kyro-pg-validate psql -U postgres -c "create database validate;"
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -q -f /tmp/00_baseline_remote_state.sql
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -q -f /tmp/migration.sql
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -q -f /tmp/migration.sql   # idempotência
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -f /tmp/10_permissions.sql

docker rm -f kyro-pg-validate
```

O último comando tem de imprimir `TODAS AS VERIFICAÇÕES DE PERMISSÕES PASSARAM`.
Qualquer `FALHA` é um bloqueador de lançamento.

## O que o baseline é, e o que não é

`00_baseline_remote_state.sql` reconstrói o estado **conhecido** da base remota:
o esquema das migrações anteriores, mais as colunas de `quiz_events` que foram
acrescentadas à mão no SQL Editor e confirmadas uma a uma por sondagem ao
PostgREST de produção (um insert com `NOT NULL` a falhar antes de escrever
distingue "coluna não existe" de "coluna existe").

Não é um dump da produção. Se a base remota tiver algo que não está aqui — um
índice, uma política, uma coluna acrescentada e esquecida — este teste não o
sabe. É por isso que o plano de publicação manda tirar um backup antes.

## Uma limitação que estes testes não conseguem tapar

O projeto **não tem** o conceito de utilizador autenticado sem função
administrativa: as políticas dizem `to authenticated` e todas as contas do
Supabase Auth são do painel. O bloco "utilizador autenticado" prova o que uma
conta do painel pode e não pode fazer; não prova isolamento entre contas,
porque esse isolamento não existe no modelo atual.

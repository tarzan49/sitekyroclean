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
docker cp supabase/migrations/20260918010000_admin_authorization.sql kyro-pg-validate:/tmp/migration2.sql
docker cp supabase/tests/10_permissions.sql kyro-pg-validate:/tmp/

docker exec kyro-pg-validate psql -U postgres -c "create database validate;"
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -q -f /tmp/00_baseline_remote_state.sql
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -q -f /tmp/migration.sql
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -q -f /tmp/migration.sql   # idempotência
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -q -f /tmp/migration2.sql
docker exec kyro-pg-validate psql -U postgres -d validate -v ON_ERROR_STOP=1 -q -f /tmp/migration2.sql  # idempotência
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

## Autorização administrativa (2026-09-18)

Resolvida a limitação que esta secção descrevia até aqui. As políticas já não
dizem `to authenticated`: dizem `to authenticated using (public.is_admin())`,
e `is_admin()` lê a tabela `admin_users` (migração
`20260918010000_admin_authorization.sql`). `10_permissions.sql` tem agora três
blocos, não dois:

1. **anónimo** — sem sessão nenhuma.
2. **autenticado sem `admin_users`** — sessão real do Supabase Auth, mas sem
   entrada na tabela de administradores. Prova que uma conta existir já não
   chega: lê e escreve exatamente o mesmo que o anónimo em `leads`,
   `lead_attribution`, `contact_log`, `conversion_exports`, etc., e não
   consegue ler `admin_users` nem inserir-se lá a si própria.
3. **administrador autorizado** — a mesma sessão do bloco anterior teria
   passado a admin só por autenticar; aqui a distinção é o registo em
   `admin_users`, feito pela chave de serviço antes do bloco correr, exatamente
   como o dono faz no SQL Editor.

O que continua por fora deste ficheiro, porque exige um Supabase real: a
diferença entre isto e "validado em produção" — o harness prova o mecanismo
(`set role` + `request.jwt.claims`, o que o PostgREST realmente usa), não que
a base remota tenha a migração aplicada nem que o primeiro `admin_users` já
esteja lá.

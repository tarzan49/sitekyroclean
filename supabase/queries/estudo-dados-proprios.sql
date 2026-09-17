-- Estudo de dados próprios (Fase 4 do GEO)
--
-- Porque existe: as 16.000 páginas do site são combinatórias, dizem o mesmo
-- de formas diferentes, e qualquer concorrente as consegue imitar. O que
-- nenhum concorrente tem são os pedidos reais que passaram por este site.
-- Uma página de estudo com estes números, com o método à vista, é o tipo de
-- facto que um motor generativo cita e atribui à fonte.
--
-- Como correr: cola no SQL Editor do dashboard do Supabase e carrega em Run
-- uma vez. **É uma só instrução de propósito**: o SQL Editor mostra apenas o
-- resultado da última instrução de um script, por isso um ficheiro com seis
-- SELECTs separados deita fora cinco resultados sem avisar (aconteceu na
-- primeira versão deste ficheiro). A chave anónima não lê estas tabelas, de
-- propósito, e este projeto não usa `supabase db push`.
--
-- Devolve só agregados, nunca linhas individuais, e corta qualquer grupo com
-- menos de 20 registos para nenhum número poder ser ligado a uma pessoa.
-- Não toca em nome, telefone, email nem morada.
--
-- Formato longo (metrica, chave, ...) para caber tudo numa tabela só.
--
-- Todos os `null` levam `::numeric` de propósito. Um NULL sem tipo é resolvido
-- como `text` na fronteira de uma CTE, e o `union all` final rebenta com
-- "UNION types numeric and text cannot be matched" (42804). Aconteceu na
-- primeira execução real deste ficheiro.
--
-- Este ficheiro é só o estudo público. O funil do quiz vivia aqui como uma
-- sexta secção e saiu para `funil-quiz.sql`: é trabalho interno de métricas,
-- não entra na página pública, e tê-los no mesmo ficheiro punha os dois a
-- colidir sempre que um deles mudava (aconteceu logo, em 17/09/2026).

with concluidos as (
  select * from public.quiz_events where action = 'complete'
),

-- 0. Denominadores do estudo. Sem isto não há secção de método: uma página
--    que publica percentagens sem dizer sobre quantos registos e entre que
--    datas não é citável, é uma afirmação. Serve também para a página poder
--    calcular sozinha quantos pedidos ficaram de fora do corte dos 20, em vez
--    de alguém escrever esse número à mão.
totais as (
  -- A data vai dentro da `chave` porque as outras colunas do formato longo
  -- são todas numéricas. Uma linha só, com o total e o intervalo juntos,
  -- para não haver dúvida sobre qual data é o início.
  select 'totais' as metrica,
         'periodo: ' || to_char(min(created_at), 'YYYY-MM-DD')
                     || ' a ' || to_char(max(created_at), 'YYYY-MM-DD') as chave,
         count(*) as pedidos,
         null::numeric as percentagem,
         null::numeric as q1,
         null::numeric as mediana,
         null::numeric as q3
  from concluidos
  union all
  select 'totais', 'com_servico', count(*) filter (where service is not null),
         null::numeric, null::numeric, null::numeric, null::numeric
  from concluidos
  union all
  select 'totais', 'com_cidade', count(*) filter (where city is not null),
         null::numeric, null::numeric, null::numeric, null::numeric
  from concluidos
  union all
  select 'totais', 'com_valor', count(*) filter (where value is not null and value > 0),
         null::numeric, null::numeric, null::numeric, null::numeric
  from concluidos
),

-- 1. Que serviços as pessoas pedem.
servicos as (
  select 'servico' as metrica, service as chave, count(*) as pedidos,
         round(100.0 * count(*) / sum(count(*)) over (), 1) as percentagem,
         null::numeric as q1, null::numeric as mediana, null::numeric as q3
  from concluidos where service is not null
  group by service having count(*) >= 20
),

-- 2. Onde estão os pedidos. Dá às páginas de localidade um facto que hoje
--    elas não têm: quanta procura existe mesmo em cada cidade.
cidades as (
  select 'cidade', city, count(*),
         round(100.0 * count(*) / sum(count(*)) over (), 1),
         null::numeric, null::numeric, null::numeric
  from concluidos where city is not null
  group by city having count(*) >= 20
),

-- 3. Sazonalidade. A SPAIC diz que o outono é a altura de maior proliferação
--    de ácaros; se os pedidos acompanharem, é uma observação própria que
--    corrobora uma fonte externa, e isso vale mais do que as duas isoladas.
meses as (
  select 'mes', to_char(created_at, 'YYYY-MM'), count(*),
         round(100.0 * count(*) / sum(count(*)) over (), 1),
         null::numeric, null::numeric, null::numeric
  from concluidos
  group by 2 having count(*) >= 20
),

-- 4. Limpeza contra impermeabilização: o que escolhem quando podem escolher.
tipos as (
  select 'tipo_servico', service_type, count(*),
         round(100.0 * count(*) / sum(count(*)) over (), 1),
         null::numeric, null::numeric, null::numeric
  from concluidos where service_type is not null
  group by service_type having count(*) >= 20
),

-- 5. Distribuição de valores. Mediana e quartis, não média: a média de um
--    serviço com "sob orçamento" pelo meio não diz nada.
valores as (
  select 'valor_por_servico', service, count(*), null::numeric,
         percentile_cont(0.25) within group (order by value),
         percentile_cont(0.50) within group (order by value),
         percentile_cont(0.75) within group (order by value)
  from concluidos where value is not null and value > 0
  group by service having count(*) >= 20
)

select * from totais
union all select * from servicos
union all select * from cidades
union all select * from meses
union all select * from tipos
union all select * from valores
order by metrica, pedidos desc nulls last, chave;

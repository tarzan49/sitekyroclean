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

with concluidos as (
  select * from public.quiz_events where action = 'complete'
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
         null, null, null
  from concluidos where city is not null
  group by city having count(*) >= 20
),

-- 3. Sazonalidade. A SPAIC diz que o outono é a altura de maior proliferação
--    de ácaros; se os pedidos acompanharem, é uma observação própria que
--    corrobora uma fonte externa, e isso vale mais do que as duas isoladas.
meses as (
  select 'mes', to_char(created_at, 'YYYY-MM'), count(*),
         round(100.0 * count(*) / sum(count(*)) over (), 1),
         null, null, null
  from concluidos
  group by 2 having count(*) >= 20
),

-- 4. Limpeza contra impermeabilização: o que escolhem quando podem escolher.
tipos as (
  select 'tipo_servico', service_type, count(*),
         round(100.0 * count(*) / sum(count(*)) over (), 1),
         null, null, null
  from concluidos where service_type is not null
  group by service_type having count(*) >= 20
),

-- 5. Distribuição de valores. Mediana e quartis, não média: a média de um
--    serviço com "sob orçamento" pelo meio não diz nada.
valores as (
  select 'valor_por_servico', service, count(*), null,
         percentile_cont(0.25) within group (order by value),
         percentile_cont(0.50) within group (order by value),
         percentile_cont(0.75) within group (order by value)
  from concluidos where value is not null and value > 0
  group by service having count(*) >= 20
),

-- 6. Funil do quiz. Este não vai para a página pública: serve para decidir
--    onde mexer no quiz.
--
--    Conta TENTATIVAS, não linhas. Cada abertura do quiz gera o seu próprio
--    `session_id` (`v2:q:<uuid>`) e escreve um 'start' por cada passo que
--    chega a ver, mais um 'start' com step = -1 na abertura. Somar linhas de
--    'start' soma passos vistos, não pessoas: era daí que vinham os 751
--    'start' contra 224 'complete' de 2026-09-17, uma comparação entre duas
--    unidades diferentes. Aqui cada tentativa conta uma vez, arrumada pelo
--    passo mais longe que chegou, e as colunas desistiram/concluiram somam
--    exatamente o total de tentativas: o funil fecha, sem diferença por
--    explicar.
--
--    'abandon' não é usado para decidir quem desistiu (desistiu = não tem
--    'complete'), só para saber onde. Uma tentativa pode ter mais do que uma
--    linha 'abandon' (sair, voltar, avançar, sair outra vez), por isso
--    contar linhas de 'abandon' também enganaria.
--
--    Só tentativas v2 (`v2:q:%`): as antigas usavam step = 0 para a abertura
--    e misturá-las deslocava o funil um passo.
tentativas as (
  select session_id,
         max(step) filter (where action = 'start') as passo_max,
         bool_or(action = 'complete') as concluiu
  from public.quiz_events
  where session_id like 'v2:q:%'
    and coalesce(page_path, '') not like '/admin%'
  group by session_id
),
funil as (
  select 'funil_passo', coalesce(passo_max, -1)::text, count(*),
         round(100.0 * count(*) / sum(count(*)) over (), 1),
         count(*) filter (where not concluiu)::numeric,
         count(*) filter (where concluiu)::numeric,
         null
  from tentativas
  group by 2
)

select * from servicos
union all select * from cidades
union all select * from meses
union all select * from tipos
union all select * from valores
union all select * from funil
order by metrica, pedidos desc nulls last, chave;

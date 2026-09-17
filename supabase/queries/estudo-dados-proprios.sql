-- Estudo de dados próprios (Fase 4 do GEO)
--
-- Porque existe: as 16.000 páginas do site são combinatórias, dizem o mesmo
-- de formas diferentes, e qualquer concorrente as consegue imitar. O que
-- nenhum concorrente tem são os pedidos reais que passaram por este site.
-- Uma página de estudo com estes números, com o método à vista, é o tipo de
-- facto que um motor generativo cita e atribui à fonte.
--
-- Como correr: cola no SQL Editor do dashboard do Supabase (a chave anónima
-- não lê estas tabelas, de propósito, e este projeto não usa `supabase db
-- push`). Devolve só agregados, nunca linhas individuais, e corta qualquer
-- grupo com menos de 20 registos para nenhum número poder ser ligado a uma
-- pessoa. Nenhuma consulta toca em nome, telefone, email ou morada.

-- 1. Que serviços as pessoas pedem, e quanto pesa cada um.
select
  service,
  count(*) as pedidos,
  round(100.0 * count(*) / sum(count(*)) over (), 1) as percentagem
from public.quiz_events
where action = 'complete' and service is not null
group by service
having count(*) >= 20
order by pedidos desc;

-- 2. Onde estão os pedidos. Alimenta as páginas de localidade com um facto
--    que hoje elas não têm: quanta procura existe mesmo em cada cidade.
select
  city,
  count(*) as pedidos,
  round(100.0 * count(*) / sum(count(*)) over (), 1) as percentagem
from public.quiz_events
where action = 'complete' and city is not null
group by city
having count(*) >= 20
order by pedidos desc;

-- 3. Sazonalidade. A SPAIC diz que o outono é a altura de maior proliferação
--    de ácaros; se os pedidos acompanharem, é uma observação própria que
--    corrobora uma fonte externa, e isso vale mais do que qualquer das duas
--    isolada.
select
  to_char(created_at, 'YYYY-MM') as mes,
  count(*) as pedidos
from public.quiz_events
where action = 'complete'
group by 1
having count(*) >= 20
order by 1;

-- 4. Limpeza contra impermeabilização: o que as pessoas escolhem quando lhes
--    é dada a escolha.
select
  service_type,
  count(*) as pedidos,
  round(100.0 * count(*) / sum(count(*)) over (), 1) as percentagem
from public.quiz_events
where action = 'complete' and service_type is not null
group by service_type
having count(*) >= 20
order by pedidos desc;

-- 5. Distribuição de valores por serviço. Mediana e quartis, não média: a
--    média de um serviço com "sob orçamento" pelo meio não diz nada.
select
  service,
  count(*) as pedidos,
  percentile_cont(0.25) within group (order by value) as q1,
  percentile_cont(0.50) within group (order by value) as mediana,
  percentile_cont(0.75) within group (order by value) as q3
from public.quiz_events
where action = 'complete' and value is not null and value > 0
group by service
having count(*) >= 20
order by pedidos desc;

-- 6. Em que passo o quiz perde as pessoas. Este não vai para a página
--    pública: é para decidires onde mexer no quiz.
select
  step,
  count(*) filter (where action = 'start')    as chegaram,
  count(*) filter (where action = 'abandon')  as desistiram,
  count(*) filter (where action = 'complete') as concluiram
from public.quiz_events
group by step
order by step;

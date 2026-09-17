-- Funil do quiz: onde as pessoas desistem (métricas internas).
--
-- NÃO entra na página pública do estudo (fase 7 do GEO) — isso é o
-- `estudo-dados-proprios.sql`, que vive ao lado e não se toca com este.
-- Serve para decidir onde mexer no quiz.
--
-- Como correr: cola no SQL Editor do dashboard do Supabase e carrega em Run.
-- Uma só instrução, de propósito: o SQL Editor mostra apenas o resultado da
-- última instrução de um script. A chave anónima não lê `quiz_events`, de
-- propósito, e este projeto não usa `supabase db push`.
--
-- O mesmo cálculo está no painel de admin (aba Métricas, cartão "Onde as
-- pessoas desistem"), em `src/lib/quizMetrics.ts`. Se mudares um, muda o
-- outro, senão o painel e o SQL passam a dizer coisas diferentes.
--
-- ── O que conta, e porquê ──────────────────────────────────────────────────
--
-- Conta TENTATIVAS, não linhas. Cada abertura do quiz gera o seu próprio
-- `session_id` (`v2:q:<uuid>`) e escreve um 'start' na abertura (step = -1)
-- mais um 'start' por cada passo que chega a ver. Somar linhas de 'start'
-- soma passos vistos, não pessoas: era daí que vinham os 751 'start' contra
-- 224 'complete' de 17/09/2026, uma comparação entre duas unidades
-- diferentes.
--
-- Desistiu = tentativa sem 'complete'. A ação 'abandon' não decide quem
-- desistiu, só ajuda a saber onde; e como a pessoa pode sair, voltar e sair
-- outra vez, pode haver mais do que uma linha 'abandon' por tentativa.
--
-- `chegaram` = tentativas cujo passo mais longe é >= a este passo. Um quiz
-- aberto já preenchido (a partir do widget de preços) salta passos: quem
-- entrou direto no passo 3 conta como tendo passado o 0, 1 e 2, porque a
-- resposta desses passos já era conhecida. É por isso que este número não é
-- o mesmo que "etapas efetivamente vistas".
--
-- Só tentativas v2: as antigas usavam step = 0 para a abertura e misturá-las
-- deslocava o funil um passo.

with tentativas as (
  select session_id,
         max(step) filter (where action = 'start') as passo_max,
         bool_or(action = 'complete')              as concluiu
  from public.quiz_events
  where session_id like 'v2:q:%'
    and coalesce(page_path, '') not like '/admin%'
    -- Janela de análise. Ajusta à vontade.
    and created_at >= now() - interval '90 days'
  group by session_id
),

passos as (
  select * from (values
    (-1, 'Abertura'),
    ( 0, 'Localizacao'),
    ( 1, 'Servico'),
    ( 2, 'Tipo'),
    ( 3, 'Quantidades'),
    ( 4, 'Contacto')
  ) as p(passo, etiqueta)
)

select
  p.passo,
  p.etiqueta,
  count(*) filter (where t.passo_max >= p.passo)                   as chegaram,
  count(*) filter (where t.passo_max = p.passo and not t.concluiu) as desistiram_aqui,
  count(*) filter (where t.passo_max = p.passo and t.concluiu)     as concluiram_aqui,
  round(
    100.0 * count(*) filter (where t.passo_max >= p.passo)
    / nullif(count(*), 0), 1
  )                                                                as pct_das_tentativas,
  round(
    100.0 * count(*) filter (where t.passo_max = p.passo and not t.concluiu)
    / nullif(count(*) filter (where t.passo_max >= p.passo), 0), 1
  )                                                                as pct_desistencia_do_passo
from passos p
cross join tentativas t
group by p.passo, p.etiqueta
order by p.passo;

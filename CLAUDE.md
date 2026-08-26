# Kyro Clean Solutions — Instruções para Claude Code

Este ficheiro carrega automaticamente no início de qualquer sessão do Claude Code aberta nesta pasta, em qualquer máquina. É a única forma real de manter as duas instâncias (PC Windows + MacBook do dono) alinhadas — não têm memória partilhada, só isto (e o `CONTEXT.md`) viaja entre elas via Git.

**Antes de mexer em código:** lê `CONTEXT.md` (arquitetura completa: rotas, fluxo do quiz, design tokens, tabelas de preços) e `AUDIT.md` (problemas de qualidade de código já conhecidos). Este ficheiro é só as regras e factos que não podes adivinhar a partir do código.

---

## Duas máquinas, um repositório

O dono trabalha a partir de um PC Windows e de um MacBook, cada um com a sua instância própria do Claude Code. Sem sincronização automática de memória.

1. No início de qualquer trabalho: `git status` + `git log -5 --oneline`; se não estiveres alinhado com `origin/master`, faz `git pull`.
2. Antes de trocar de máquina ou terminar sessão: commit + push do que ficou feito.
3. `.env` é local por máquina (chaves Supabase), nunca vai para o Git — normal aparecer como modificado, ignora.
4. Produção (cleansolutions.com.pt) só atualiza com push para o GitHub.
5. O repositório é **público** (`tarzan49/sitekyroclean`) — o autor de cada commit fica visível publicamente. Cuidado com nomes/dados pessoais em mensagens de commit.

---

## Factos de negócio atuais (não hardcodar — importar sempre)

- **Avaliações:** 5.0★, **+80** avaliações, **+1100** clientes servidos. Fonte única: `src/constants/business.ts` (`REVIEW_RATING`, `REVIEW_COUNT`, `CLIENTS_SERVED_LABEL`). Cópia paralela em `scripts/prerender.ts` linhas ~40-44 (`BIZ_RATING`, `BIZ_REVIEWS`) porque o prerender corre em Node puro e não resolve o alias `@/`.
- **Taxa de deslocação:** mínimo **10€ em todo o site**, sem exceções (nenhuma cidade a 5€). Tabelas em `src/components/quiz/QuizTypes.ts` e na cópia paralela `src/data/locationSeoData.ts` (`locationPrices`).
- **Impermeabilização de tapetes: descontinuada (removida em 2026-08-20).** Só sofás e cadeiras têm impermeabilização. Tapetes continuam a ter higienização (limpeza normal) — não é o mesmo serviço, não reintroduzir sem pedido explícito.
- **Testemunhos das páginas comerciais B2B** (`/limpeza-comercial-*`): o dono prometeu uma lista real de restaurantes/hotéis clientes para usar como testemunhos. Ainda não foi entregue — nunca inventar nomes ou citações até essa lista chegar.

## Armadilha recorrente: constantes duplicadas

`scripts/prerender.ts` e `scripts/generate-sitemap.ts` correm em Node puro (sem Vite), por isso não conseguem importar via alias `@/`. Vários dados de negócio existem em **duas cópias**: uma importável (`src/constants/business.ts`, `src/components/quiz/QuizTypes.ts`) e uma cópia paralela consumida só pelos scripts (`src/data/locationSeoData.ts`, constantes locais dentro do próprio `prerender.ts`). **Qualquer correção de preço, taxa ou estatística tem de ser feita nas duas cópias**, senão o site prerenderizado (o que o Google vê) fica dessincronizado do site interativo.

Segunda instância do mesmo problema: `src/pages/AdminPanel.tsx` mantém o seu próprio array `SITEMAPS` e switch `getSitemapUrls()`, escritos à mão — novos sub-sitemaps adicionados a `scripts/generate-sitemap.ts` **não aparecem automaticamente** ali, é preciso atualizar os dois.

**Terceira armadilha (crítica, já aconteceu): `.env` e o Cloudflare Pages.** O Cloudflare Pages construiu sempre o site a partir do `.env` que esteve committado no Git desde o commit inicial — nunca teve `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`/`VITE_ADMIN_PASSWORD` configuradas como env vars próprias no dashboard do Cloudflare Pages. Quando o `.env` foi corretamente removido do Git em 2026-08-24 (estava exposto num repo público), o build seguinte em produção compilou com essas variáveis `undefined` — `createClient(undefined, undefined)` do supabase-js rebenta de forma síncrona, o que crashava as abas CRM/Métricas do admin panel e fazia todo insert em `quiz_events`/`leads`/`error_logs` falhar em silêncio durante 2-4 dias sem nenhum erro visível (Formspree não depende do Supabase, por isso os pedidos de orçamento reais continuaram a chegar normalmente — só o painel interno ficou cego). Corrigido no código em 2026-08-26 (`src/integrations/supabase/client.ts`/`src/lib/supabase.ts` já não rebentam com env var em falta, mostram banner vermelho no admin panel via `isSupabaseConfigured`). **Sempre que se mexer em `.gitignore`/tracking de `.env`, confirmar explicitamente que o Cloudflare Pages já tem essas env vars configuradas do lado dele** antes de dar a limpeza por concluída.

## Regras de conteúdo e estilo (fixas, já corrigidas várias vezes)

- **Nunca usar em dash (—)** em conteúdo visível do site (títulos, descrições, FAQs, blog). Não confundir com `---` usado como divisor Markdown nas minhas próprias respostas de chat.
- **Nunca usar o ícone Sparkles** (lucide-react) como decoração. `Star` continua permitido em contexto de rating/avaliação.
- **Mobile-first sempre** — qualquer alteração de UI/layout, mobile é prioridade absoluta, não um afterthought.
- Step 3 do quiz para cadeiras deve replicar pixel a pixel o layout do ecrã de upsell (price box + stepper grande + toggle card) — não simplificar.
- Ao corrigir uma regra de preço (ex. um mínimo errado), mudar só o valor que viola a regra. Não extrapolar a outros valores sem perguntar primeiro.
- Não adicionar mecânicas de urgência (timers, badges) que não foram pedidas explicitamente.

## Antes de terminar qualquer sessão neste projeto

Atualiza este ficheiro se alguma regra ou facto de negócio mudou; atualiza `CONTEXT.md` se a arquitetura mudou. Commit + push antes de trocar de máquina.

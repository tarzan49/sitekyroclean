# Kyro Clean Solutions — Instruções para Codex

**As regras deste projeto estão num só sítio: `CLAUDE.md`.** Lê-o inteiro antes
de qualquer tarefa. Vale para o Codex tal como para o Claude Code: factos de
negócio (avaliações, deslocação, preços, packs), armadilhas conhecidas,
tracking, base de dados, regras de conteúdo e estilo. Depois lê `CONTEXT.md`
(arquitetura: rotas, quiz, onde vivem os preços, decisões de desenho) e, se
fores mexer em qualidade de código, `AUDIT.md` e `CODE_AUDIT.md`.

Este ficheiro deixou de repetir essas regras a 2026-09-26. Até essa data era
uma segunda cópia, e tinha ficado errada: dizia 5.0★ e +100 avaliações (são
`REVIEW_RATING` e `REVIEW_COUNT` em `src/constants/business.ts`), descrevia o
desconto de 10% do pack (`packDiscountActive`, removido a 2026-09-10) e dizia
que os pedidos chegavam pelo Formspree, independente do Supabase (o email é o
Resend, pela função Edge `send-lead-email`, desde 2026-09-14). As decisões de
desenho que só existiam aqui passaram para o `CONTEXT.md` («Decisões de
desenho e conteúdo que viviam só no `AGENTS.md`»). **Não voltar a copiar
regras para este ficheiro:** uma regra nova ou corrigida escreve-se no
`CLAUDE.md`.

Os números mudam: nunca os tires de um `.md`. Preços, taxas e contagens
leem-se no código (`src/components/quiz/QuizTypes.ts`,
`src/components/quiz/quizHelpers.ts`, `src/constants/chairPricing.ts`,
`src/constants/packPerks.ts`, `src/constants/travel.ts`,
`src/constants/business.ts`).

---

## Só para o Codex

1. **Commit e push depois de cada alteração concluída** (código, conteúdo,
   configuração ou documentação), sem esperar pelo fim da sessão nem pedir nova
   confirmação: é a instrução do dono para o Codex. Inclui apenas os ficheiros
   da tarefa atual e preserva trabalho alheio ou pré-existente (pode haver
   outras sessões a trabalhar na mesma pasta ao mesmo tempo). Se o commit ou o
   push falhar, diz-o e não declares a sincronização concluída. O repositório
   é público: nada de dados pessoais nas mensagens de commit.
2. **Pré-visualizações em viewport mobile por omissão.** A única exceção
   aprovada é a revisão de PC da página de obrigado (23/09/2026, ver
   `CONTEXT.md`).
3. **Antes de terminar:** se uma regra ou facto de negócio mudou, atualiza o
   `CLAUDE.md`; se a arquitetura mudou, o `CONTEXT.md`. Este ficheiro só muda
   se mudar algo específico do Codex.

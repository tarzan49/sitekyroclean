# Prompt para começar uma sessão nova

Reescrito a 2026-09-26. A versão anterior era de maio e estava errada em quase
tudo (Formspree, react-i18next, deslocação a 0€ no Porto, preços, calendário no
quiz, rotas `/admin/dashboard` e `/admin-seo-pages`). Não copiar factos para
aqui: este ficheiro só diz por onde começar.

Colar no início da sessão, substituindo a última linha pela tarefa:

```
Projeto Kyro Clean Solutions (cleansolutions.com.pt), React + Vite + TypeScript,
Supabase (CRM e funções Edge), email pelo Resend, alojado no Cloudflare Pages.

Antes de mexer em código:
1. `git status` e `git log -5 --oneline`; se não estiveres alinhado com
   origin/master, `git pull`. Pode haver outra sessão a trabalhar na mesma
   pasta: não mexas no trabalho dela.
2. Lê o CLAUDE.md inteiro. É a fonte única das regras e dos factos de negócio
   e prevalece sobre qualquer outro .md.
3. Lê o CONTEXT.md: primeiro o topo (decisões recentes), depois rotas, quiz e
   «Preços: fontes e regras». A parte «Registo histórico» é diário antigo, não
   é fonte de valores.
4. Preços, taxas e contagens leem-se no código, nunca num .md.
5. Verificação: `npm run typecheck` (nunca `npx tsc --noEmit`), `npm test`,
   `npm run lint`, `npm run build`. O build não verifica tipos.
6. Commits só quando eu pedir. Antes de terminar, atualiza o CLAUDE.md se uma
   regra mudou e o CONTEXT.md se a arquitetura mudou.

Tarefa: [descrever aqui]
```

O Codex lê o `AGENTS.md`, que aponta para o mesmo `CLAUDE.md`.

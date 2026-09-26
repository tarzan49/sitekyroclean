# Proteção do funil de pedidos (reCAPTCHA + inserção do lado do servidor)

Fecha a prioridade 3 da auditoria de 2026-09-14: o funil de pedidos não tinha
defesa nenhuma contra bots, e a tabela `leads` tinha de aceitar inserções
anónimas porque o quiz escrevia nela a partir do browser.

## A regra que manda em tudo

**Um pedido real nunca se perde.** O quiz envia por dois canais em paralelo e
resolve se qualquer um deles entregar. Nada nesta proteção pode tornar-se um
ponto único de falha:

- O token é obtido por `getRecaptchaTokenSafe`, que tem tempo limite de 3
  segundos e devolve `null` em qualquer falha. Nunca fica pendurado.
- Sem token, `verifyRecaptcha` deixa passar de propósito. reCAPTCHA bloqueado
  por uma extensão, script em falha ou chave ausente no build não podem custar
  um cliente.
- **Um problema nosso também deixa passar (desde 2026-09-26):** API da Google
  em baixo, chave secreta que não corresponde à do site, token expirado. Só se
  recusa um token que a Google validou com pontuação de robô (abaixo de 0.3) ou
  com outra ação. Um bot não ganha nada com esta tolerância: já podia não mandar
  token nenhum.
- O token **nunca** vai no canal de email. Foi isso que partiu o formulário na
  primeira tentativa de pôr reCAPTCHA neste site. Há um teste que o garante.
- Mesmo quando o servidor recusa um pedido, o canal de email entrega na mesma,
  por isso um falso positivo atrasa o registo no CRM, não perde o cliente.

## Como está montado

```
quiz → supabase/functions/send-lead-email   ← email ao dono (Resend), sem token
     → supabase/functions/submit-lead       ← verifica o reCAPTCHA e insere em `leads`
```

`submit-lead` limita a 8 pedidos por IP em 10 minutos (em memória, por
isolate), verifica o reCAPTCHA (ação `submit_quote`), aceita só os campos
conhecidos com comprimento máximo, e insere com a chave de serviço. A inserção
anónima em `leads` está fechada desde 2026-09-14: **a única forma de criar um
lead é a Edge Function.**

## Configuração

- `VITE_RECAPTCHA_SITE_KEY` no Cloudflare Pages (está definida: a chave vai no
  bundle de produção).
- `RECAPTCHA_SECRET_KEY` nos segredos das Edge Functions do Supabase (definida
  desde 2026-09-13).
- A CSP (`public/_headers`) tem de permitir `www.google.com/recaptcha/` e
  `www.gstatic.com/recaptcha/` em `script-src` e `frame-src`. **Faltaram de
  2026-09-23 a 2026-09-26:** o script era bloqueado, o token saía vazio e o
  servidor deixava passar tudo, ou seja a proteção estava desligada sem ninguém
  dar por isso.
- As Edge Functions publicam-se à parte do site: um push para o GitHub não as
  atualiza. `node_modules/.bin/supabase functions deploy <nome>` a partir da
  raiz do repositório.

## Alterações à base de dados

**Nunca `supabase db push`** (sétima armadilha do `CLAUDE.md`): a base foi
sempre gerida à mão e o `db push` reaplica o histórico todo. As migrações
colam-se no SQL Editor do dashboard; o ficheiro em `supabase/migrations/` fica
só como registo.

## Ajustes

`MIN_SCORE_THRESHOLD` em `supabase/functions/_shared/recaptcha.ts` está a 0.3.
`RECAPTCHA_ENABLED=false` nos segredos das Edge Functions desliga a
verificação por completo sem publicar código, se for preciso com urgência. Os
registos da função `submit-lead` mostram `Token not verified, bypassing` quando
a chave secreta não corresponde à do site: se isso aparecer, a proteção não
está a funcionar e é preciso rever as duas chaves na consola do reCAPTCHA.

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
- O token **nunca** vai no canal de email. Foi isso que partiu o formulário na
  primeira tentativa de pôr reCAPTCHA neste site. Há um teste que o garante.
- Mesmo quando o servidor recusa um pedido, o canal de email entrega na mesma,
  por isso um falso positivo atrasa o registo no CRM, não perde o cliente.

## Como está montado

```
quiz → canal de email (Formspree, a passar a Resend)   ← inalterado
     → supabase/functions/submit-lead                  ← verifica e insere
```

`submit-lead` limita a 8 pedidos por IP em 10 minutos, verifica o reCAPTCHA
(ação `submit_quote`), aceita só os campos conhecidos com comprimento máximo, e
insere com a chave de serviço.

## Publicação, por ordem

O código já publicado é seguro antes da função existir: enquanto `submit-lead`
responder 404 ou estiver indisponível, `insertCrmLead` volta ao insert direto e
nenhum pedido se perde.

**Passo 1. Publicar a função e os segredos.**

```bash
supabase functions deploy submit-lead
supabase secrets set RECAPTCHA_SECRET_KEY=<a chave secreta do reCAPTCHA>
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já são injetadas pelo Supabase nas
Edge Functions, não é preciso defini-las.

Confirmar que `VITE_RECAPTCHA_SITE_KEY` está definida **no Cloudflare Pages**,
não só no `.env` local. Ver a quinta armadilha do `CLAUDE.md`: já houve um
incidente em que o build de produção compilou com variáveis por definir.

**Passo 2. Confirmar em produção antes de fechar a porta.**

Fazer um pedido real pelo quiz e verificar que a linha aparece em `leads` e que
os registos da função mostram a pontuação do reCAPTCHA. Só depois disto avançar.

**Passo 3. Fechar a inserção anónima. ✅ feito em 2026-09-14.**

Confirmado em produção com um pedido real (`source: Website`), e a função
verificada a responder o seu próprio 400 de validação.

A migração `20260914000000_close_anonymous_lead_insert.sql` remove a política
de insert anónimo, e o insert direto de recurso saiu de
`src/services/submissionService.ts`. A partir daqui **a única forma de criar um
lead é a Edge Function**, que insere com a chave de serviço (essa ignora RLS,
por isso não precisa de política).

Falta correr a migração contra a base de dados:

```bash
npx supabase db push
```

## Quando o Formspree passar a Resend

`submit-lead` é o sítio certo para o envio do email: a chave do Resend não pode
viver no browser. Manter os dois canais independentes, para que uma falha do
email não impeça o registo do lead nem o contrário.

## Ajustes

`MIN_SCORE_THRESHOLD` em `supabase/functions/_shared/recaptcha.ts` está a 0.5.
Se aparecerem clientes reais recusados, baixar para 0.3 antes de desligar a
verificação. `RECAPTCHA_ENABLED=false` desliga-a por completo sem publicar
código, se for preciso com urgência.

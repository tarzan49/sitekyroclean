# Plano de publicação e rollback — medição e Google Ads

Sequência para pôr em produção o trabalho descrito em
`docs/tracking-google-ads.md`. **Nada aqui foi executado.**

> **Push para o Cloudflare Pages NÃO publica as Edge Functions do Supabase.**
> São dois sistemas separados, com dois comandos separados. Uma Edge Function
> antiga a receber um pedido novo aceita o corpo e ignora os campos que não
> conhece — o lead entra sem `lead_id` e sem atribuição, em silêncio.

---

## Bloqueadores de lançamento

Nenhum destes pode ficar para depois.

| # | O quê | Porquê é bloqueador | Estado |
|---|---|---|---|
| B1 | Migração aplicada no SQL Editor | Sem ela, `lead_id`, atribuição e histórico não existem | Validada em Docker, por aplicar |
| B2 | Edge Functions `submit-lead` e `send-lead-email` publicadas | Idempotência e atribuição vivem lá | Por publicar |
| B3 | Variáveis de ambiente no Cloudflare Pages | O `.env` local não chega ao build | Por configurar |
| B4 | Etiqueta da conversão principal (lead) | Sem ela não há conversão nenhuma no Ads | Depende do dono |
| B5 | Medição otimizada do GA4: desligar page_view por histórico | Duplica cada `page_view` da SPA | Depende do dono |
| B6 | Verificação pós-deploy (site, admin, formulário, tags) | — | — |

**Segunda fase**, explicitamente fora deste lançamento: automatização de custos
(Google Ads API), importação offline por API (Data Manager API), confirmação
automática de WhatsApp/chamadas, papéis de administração.

---

## Ordem de execução

A ordem importa. Cada passo assume o anterior.

### 0. Backup e verificações prévias

```bash
git status                 # a árvore tem de estar limpa
git log -1 --oneline
npm run lint && npx vitest run && npm run build
```

Na base de dados, **antes de tocar em nada**:

- Supabase → Database → Backups: confirmar que existe um backup de hoje.
  Se não existir, criar um manualmente e esperar que termine.
- Guardar as contagens atuais, para comparar depois:

```sql
select
  (select count(*) from public.leads)        as leads,
  (select count(*) from public.quiz_events)  as eventos,
  (select count(*) from public.error_logs)   as erros;
```

Anotar os três números.

### 1. Migração (B1)

Supabase → SQL Editor → colar `supabase/migrations/20260918000000_marketing_attribution.sql`
inteiro → Run. **Nunca `supabase db push`.**

Verificar imediatamente:

```sql
-- As contagens não podem ter mudado.
select
  (select count(*) from public.leads)       as leads,
  (select count(*) from public.quiz_events) as eventos;

-- Todos os leads existentes ficaram com estado.
select count(*) from public.leads where funnel_status is null;   -- tem de ser 0

-- As tabelas novas existem e estão vazias.
select
  (select count(*) from public.lead_attribution)   as atribuicao,
  (select count(*) from public.lead_status_history) as historico,
  (select count(*) from public.conversion_exports) as exportacoes;
```

E, com a **chave anónima** (não a de serviço), confirmar que continua fechada:

```bash
# Tem de devolver [] (zero linhas), nunca dados.
curl -s "$URL/rest/v1/lead_attribution?select=lead_id&limit=1" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON"

# Tem de devolver 23502 (campos em falta), nunca 42501 (bloqueio de RLS).
curl -s -X POST "$URL/rest/v1/quiz_events" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d '{}'
```

### 2. Edge Functions (B2)

```bash
npx supabase functions deploy submit-lead
npx supabase functions deploy send-lead-email
```

Confirmar em Supabase → Edge Functions que a data de publicação das duas é de
agora.

### 3. Variáveis de ambiente no Cloudflare Pages (B3)

Settings → Environment variables → Production. Acrescentar:

```
VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL=<a fornecer pelo dono>
VITE_GOOGLE_ADS_QUALIFIED_LEAD_ACTION=<nome da ação offline>
VITE_GOOGLE_ADS_CUSTOMER_CONVERSION_ACTION=<nome da ação offline>
```

Não acrescentar `VITE_TRACKING_ALLOW_NON_PRODUCTION` em produção. Deixar
`VITE_CONSENT_MODE` e `VITE_ENHANCED_CONVERSIONS` por definir (os valores por
omissão são os corretos).

Confirmar que `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` continuam
configuradas — foi a sua ausência que cegou o painel durante quatro dias em
agosto de 2026.

### 4. Build e deploy do frontend

```bash
git push        # só depois de 1, 2 e 3
```

### 5. Verificação pós-deploy (B6)

**Site:**

- `https://cleansolutions.com.pt/limpeza-sofas-lisboa` carrega, 200, canonical
  sem parâmetros.
- Com `?gclid=TESTE&campaignid=1`: 200, sem redirect, parâmetros preservados.
- Antes de decidir cookies: nenhum `<script>` de `googletagmanager` na página.
- Depois de aceitar: **um** `gtag/js` (o segundo, `?id=AW-…&cx=c`, é injetado
  pela própria biblioteca e é normal).
- Navegar entre três páginas: um `page_view` por rota no `dataLayer`.

**Formulários — o teste que mais importa:**

- Submeter um pedido real de teste **com** cookies aceites → aparece em
  `leads` com `lead_id`, e em `lead_attribution` com origem.
- Submeter **com cookies recusadas** → aparece em `leads`; **não** aparece em
  `lead_attribution`; nenhum evento sai para a Google.
- Submeter e clicar duas vezes → **um** lead, **um** email.

**Admin:**

- `/admin/panel` → separador Google Ads carrega sem erros vermelhos.
- Os cartões operacionais batem certo com `select count(*) from leads`.
- Mudar o estado de um lead de teste → aparece no histórico com o **email da
  sessão** como autor.

**Tags:** GA4 → Administrador → DebugView, com `?kyro_debug=1` no URL, confirmar
`page_view`, `whatsapp_click` e `generate_lead`. Google Ads → Objetivos →
Conversões: a ação do lead passa a "A registar conversões" depois do primeiro
pedido real.

Apagar os leads de teste no fim, pelo `lead_id`.

### 6. GA4: medição otimizada (B5)

GA4 → Administrador → Fluxos de dados → o fluxo do site → Medição otimizada →
engrenagem → desligar **"Alterações de página baseadas em eventos do histórico
do navegador"**. Confirmar no DebugView que passa a haver **um** `page_view` por
navegação e não dois.

---

## Rollback

**Princípio: nunca se faz rollback da base de dados.** A migração só acrescenta;
reverter o código não exige reverter o esquema, e as colunas novas ficam
simplesmente por preencher. Desfazer a migração apagaria leads e histórico.

| Sintoma | O que fazer | Leads em risco? |
|---|---|---|
| Site partido | Cloudflare Pages → Deployments → deploy anterior → "Rollback" | Não. As Edge Functions continuam a aceitar pedidos |
| Pedidos a falhar no CRM | Republicar a versão anterior de `submit-lead`. O canal de email é independente e continua a entregar | Não |
| Pedidos a falhar nos dois canais | **Incidente.** Pôr o WhatsApp como CTA único enquanto se investiga | Sim — agir primeiro, investigar depois |
| Painel a dar erro de tabela | Não é urgente. O site não depende disso | Não |
| Eventos a mais no GA4 | Desligar a medição otimizada (passo 6). Não reverter código | Não |
| Conversões erradas no Ads | Pausar a ação de conversão no Google Ads. Não reverter código | Não |

**O que não fazer em rollback:** `drop table`, `drop column`, `truncate`, ou
apagar linhas de `leads`/`lead_attribution`/`lead_status_history`. Se uma coluna
nova estiver a causar problemas, o caminho é parar de a escrever no código, não
apagá-la.

**Se o código antigo voltar com a migração já aplicada:** funciona. O código
antigo não conhece as colunas novas e não as escreve; os leads continuam a
entrar. É por isso que a migração pode ir primeiro.

**Se o código novo for para produção sem a migração:** os inserts de
`quiz_events` perdem as colunas de campanha uma a uma (`PGRST204`) e continuam a
entregar o resto; `lead_attribution` falha e **o lead entra na mesma**. Degrada,
não parte. Mas o painel mostra avisos vermelhos e a atribuição fica a zero —
não é um estado para deixar ficar.

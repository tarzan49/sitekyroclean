# Auditoria de código — 2026-09-26 (DRY / SOLID / DDD / código morto + testes ao site em produção)

Segunda auditoria estrutural, um mês e ~25.000 linhas depois da de 2026-08-23 (mais abaixo neste ficheiro). Método: snapshot limpo de `HEAD` (`e0933fc`; o commit seguinte, `97e6789`, só acrescenta as oito localidades e foi conferido à parte) numa pasta fora do repositório, ferramentas estáticas (`npm run typecheck`, ESLint, Vitest, knip, jscpd, madge), build completo com prerender, varrimento de ligações sobre o `dist`, seis agentes em paralelo (código morto, DRY, SOLID, DDD, backend/scripts, reverificação das auditorias anteriores) e testes ao site em produção (HTTP + browser em 375px e desktop). **Todos os achados 🔴 e 🟠 foram reconfirmados por mim no código ou no site a correr**, não só pelos agentes. Nenhum ficheiro do site foi alterado.

## Estado ao fim do dia (2026-09-26)

Corrigido no mesmo dia, depois das decisões do dono (pack desde 89€; anti-ácaros em sofás, colchões e cadeiras; chaise removida; a regra de pack do quiz passa a valer também no configurador; preços por marca eram inventados; reCAPTCHA a funcionar):
- **P0:** #2 (`isProductionHost`), #3 (trinco do `send-lead-email`), #4 (ficheiro de faturação apagado + regra no `.gitignore`), e a causa do #1 (a migração deixou de apagar `leads`). **Falta do #1 a consulta no SQL Editor**, que só o dono pode correr.
- **P1:** #5, #6, #7, #8, #9, #10, #12, #13, #14, #15, #16, #17, #18, #19. O #11 (colchão "incluindo anti-ácaros") ficou por decisão do dono, tal como as listas de benefícios só do estático no #6.
- **P2:** #20 (reCAPTCHA: CSP + servidor que nunca recusa por erro de configuração + aviso e política de privacidade), #21 em parte (retirada a sugestão de SQL aberta a todos os papéis do `ErrorLogPanel`; os botões de apagar continuam a dizer "sucesso" quando o RLS apaga 0 linhas), #22, #26, #27 (testes Deno + `npm run test:functions`), mais a sugestão perigosa de urgência "apenas hoje" num ramo morto do `ServiceTypeSelector`.
- **Documentação:** CLAUDE.md, CONTEXT.md, AGENTS.md, PROMPT_NOVA_SESSAO.md, README.md, WIDGET_PREVIEW.md, `docs/lead-spam-protection.md`, `.env.example`.
- **Por fazer:** #21 (botões de apagar do painel), #23 (atribuição ao fim de 30 min), #24 (deteção de bots do Cloudflare, no dashboard), #25 (newsletter morta), #28/#29 (tipos do Supabase, reconciliação das migrações), o DRY/SOLID/DDD estrutural que não era visível ao cliente, o código morto não relacionado, e o preço da cabeceira (15€ ou 20€, decisão do dono).

## Números

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | 0 erros |
| ESLint | 0 erros, 16 avisos (4 `eslint-disable` inúteis, 3 dependências de hook erradas) |
| Vitest | 75 ficheiros, 2.295 testes, todos verdes |
| Build + prerender | 16.258 rotas, 17.316 ficheiros no `dist` (limite do Cloudflare Pages: 20.000). Produção já tem +958 páginas das oito localidades novas, por isso a folga real anda pelos ~1.700 ficheiros (estimativa) |
| Ligações internas e recursos no `dist` | **0 partidas** em 16.264 páginas (1,69 M verificações `href`/`src`/`srcset`) |
| Duplicação (jscpd, ≥60 tokens) | 3,42% das linhas (1.750 de 51.133), concentrada nas três páginas `Marca*Page` (~600 linhas) |
| Ciclos de imports (madge) | 3 (dois só de tipos, um real: `errorTracking` ↔ `quizTracking`) |
| Código morto (knip, filtrado à mão) | ~2.300 linhas, 9 dependências npm, 3 Edge Functions, ~40 exports |
| Sitemaps em produção | 17.214 URLs, **todas com `lastmod`** (o `unshallow.mjs` resolveu o problema) |
| 200 URLs aleatórias do sitemap em produção | 200 × HTTP 200 |

## Testes ao site em produção

- **Cabeçalhos:** HSTS, CSP a bloquear, `X-Frame-Options`, `Permissions-Policy` presentes. `/admin/panel` com `noindex` e `Disallow`. 404 verdadeiro para URLs inexistentes. `www` continua sem DNS (já conhecido).
- **Aviso de cookies:** aparece; "Recusar" grava `{analytics:false, ads:false}`, o Pixel da Meta não carrega e o Consent Mode fica `denied`.
- **Quiz, de ponta a ponta em mobile (Ovar → Sofá → Higienização → 2 Lugares → extras → Colchão casal → contacto), parado antes de enviar:** Ovar já funciona (15€ de deslocação); totais certos (69 + 15 = 84€; 69 + 55 + 15 = 139€); resumo do pedido certo; "Enviar pedido" desativado até haver nome e telefone.
- **Página de pack:** o configurador faz a mesma conta que o quiz para sofá 1L + colchão solteiro (104€).
- **Consola:** os únicos erros no site inteiro vêm do script de deteção de bots que o **Cloudflare injeta** (`/cdn-cgi/challenge-platform`), bloqueado pela CSP em todas as páginas (ver #24). O código do site não gera erros.
- **O browser de teste tinha as cookies aceites desde uma sessão de 23/09**; foram repostas e recusadas antes de testar, para não sujar as métricas. Como o modo avançado está ativo, as visitas de teste deram pings sem cookies ao GA4.

---

## 🔴 P0 — Verificar ou corrigir primeiro (dados, dinheiro, privacidade)

### 1. A migração de 2024 apaga a tabela `leads`, e foi reaplicada a 14/09 — confirmar se os leads antigos ainda existem
`supabase/migrations/20240101_admin_tables.sql:2` faz `drop table if exists public.leads cascade` (desde o commit inicial). As outras duas tabelas do mesmo ficheiro usam `create table if not exists`, por isso só `leads` é destruída — é por isso que `quiz_events` ainda tem dados de junho e o estudo da fase 7 funcionou. O cabeçalho de `20260914000100_repair_rls_after_history_replay.sql` confirma que o `db push --include-all` "reaplicou o histórico todo desde 20240101", e as políticas desse ficheiro chegaram mesmo a produção. A única UI que lia `leads` nessa altura era o `AdminDashboard.tsx` (órfão), por isso uma limpeza passaria despercebida. **Não é confirmável com a chave pública.**
**Ação (1 minuto):** no SQL Editor, `select min(created_at), count(*) from public.leads;`. Se o mínimo for ≥ 2026-09-14, os leads anteriores perderam-se da base de dados (os emails continuam a ter as cópias). Em qualquer caso: tornar o ficheiro inofensivo (`create table if not exists`, sem `drop`) e corrigir `docs/lead-spam-protection.md:73`, que **ainda manda correr `npx supabase db push`** — o comando da sétima armadilha.

### 2. Qualquer host que não seja exatamente `cleansolutions.com.pt` transforma o envio de pedidos numa simulação
`src/lib/quizTracking.ts:7` define `IS_PRODUCTION` como `hostname === 'cleansolutions.com.pt'`; `src/services/submissionService.ts:313-322` devolve sucesso simulado fora disso — a pessoa vê a página `/obrigado` e nada é gravado nem enviado. O registo DNS `www` está na lista de tarefas do CLAUDE.md: se `www` for acrescentado como domínio do Pages (o fluxo por omissão do Cloudflare) em vez de redirecionar, **todos os pedidos feitos em `www` desaparecem em silêncio**.
**Ação:** criar a Redirect Rule `www → apex` (301) antes do registo DNS; inverter a guarda (simular só em `localhost` e `*.pages.dev`, nunca num host desconhecido) e juntar `IS_PRODUCTION` com `trackingEnv()` num só sítio.

### 3. O trinco do `send-lead-email` pode dar como entregue um email que nunca saiu
`supabase/functions/send-lead-email/index.ts:280` reclama o trinco **antes** de verificar as variáveis do Resend (`:289-294`, que devolve 503 sem libertar). Um novo envio com o mesmo `lead_id` (que se mantém de propósito entre tentativas) recebe `{success:true, sent:false, duplicate:true}` (`:283-286`), e o cliente trata qualquer `data.success` como entregue (`submissionService.ts:153`). Cenário: CRM em baixo + variável do Resend em falta (a classe da quinta armadilha) → a pessoa vê confirmação e o pedido não existe em lado nenhum.
**Ação:** verificar as variáveis antes do trinco, libertar em todos os caminhos sem envio (`try/finally`), e no cliente tratar `duplicate && !sent` como não entregue.

### 4. Faturação por serviço no repositório público
`scripts/whatsapp-services-raw.txt` (87 linhas, versionado desde 2026-09-05, commit `c63d98c`) tem valores por serviço, comissão e região — o mesmo tipo de dado que o `.gitignore` já exclui em `/supabase/*.sql`. O parser (`scripts/parse-whatsapp-services.mjs`) está partido desde que a inserção anónima em `leads` fechou.
**Ação:** apagar os dois ficheiros. Continuam no histórico do git: decisão do dono se vale a pena reescrever o histórico.

---

## 🟠 P1 — O cliente (ou o Google) vê factos contraditórios

### 5. Ecrã de extras do quiz: "~~69€~~ 69€" para quase toda a gente (visto em produção)
Cartões do resumo em `QuizComboUpsellScreen.tsx:141-154`. A elegibilidade do preço de pack (`PACK_PERK_MIN_ORDER = 100`) é calculada **antes** de o artigo entrar no carrinho, por isso com um pedido principal abaixo de 100€ (qualquer sofá sozinho, qualquer colchão sozinho) o cartão mostra o mesmo preço riscado e por riscar, por baixo de "Preço reduzido em cada artigo que juntar". Ao abrir o colchão, o preço passa a 55€ — ou seja, a oferta existe mas o resumo esconde-a. Afeta os cartões de colchão e de sofá.
**Correção:** calcular a pré-visualização como se o artigo de referência já estivesse incluído; `PriceCompare` (`:32`) não deve riscar quando `original === promo`.

### 6. As seis páginas-pilar mostram uma coisa às pessoas e outra aos motores (visto em produção)
Três cópias independentes: `src/pages/Limpeza*.tsx`/`Impermeabilizacao.tsx`, `src/components/PageHead.tsx` (`routeMeta`) e o bloco `CORE` do `scripts/prerender.ts` (~1076-1503). Medido em produção: `/limpeza-sofas` tem no HTML estático o H1 "Limpeza de Sofás ao Domicílio" e 4 FAQs; depois do React, o H1 "Higienização Profissional de Sofás" e 3 FAQs diferentes (só 1 pergunta em comum, com resposta diferente: "1 a 3 horas" vs "45 minutos e 2 horas"). O mesmo em `/limpeza-colchoes`. Os títulos diferem em 4 dos 6 pilares.
Pior, há afirmações **só no HTML estático** que violam as regras de conteúdo: `prerender.ts:1130-1131` ("Eliminação de odores e fungos", "Redução de alergias e problemas respiratórios"), `:1095` ("Técnicos certificados…") e a FAQ de cadeiras em `:1204` ("de 7 a 10 é 12,50€/unid.") — o motor manda 10 cadeiras para orçamento desde 2026-08-31 (`quizHelpers.ts:125`).
**Correção:** `src/data/pillarPages.ts` lido pelos três lados (o padrão do `legalPages.ts`), com teste de paridade; preços das FAQs gerados das constantes.

### 7. JSON-LD inventa um preço de 49€ para tapetes, alcatifas e colchões (visto em produção)
`ServiceSchema.tsx:30` e `ServiceLocationSchema.tsx:29` caem para `DEFAULT_PRICE_FROM` ("49€") quando o preço não tem dígitos. `LimpezaTapetes.tsx:103` e `LimpezaAlcatifas.tsx:103` passam "Sob orçamento" → Offer de 49€; `LimpezaColchoes.tsx:105` passa `DEFAULT_PRICE_FROM` → 49€ (o real é 59€). Em produção, `/limpeza-tapetes` depois do React declara `"price":"49"`; o estático não declara nada. Viola "tapetes nunca mostram preço" num sítio que o Google lê. Afeta também todas as localidades/freguesias de tapetes e alcatifas. Os dois componentes têm `priceValidUntil: "2026-12-31"` escrito à mão — expira daqui a três meses.
**Correção:** `offerForPriceLabel()` em `seoSchema.ts` que devolve `undefined` para "sob orçamento"; melhor ainda, `priceFromEur: number | null` no `serviceCatalog`.

### 8. Pack sofá + Essencial: anunciado a 99€, orçamentado a 89€
`commercialHeroCopy.ts:16` usa `sofa1.bothPrice` (99€) no hero de todas as páginas `/impermeabilizacao*`; `problemSeoData.ts:612` diz "começa em 99€"; os textos dos anúncios do Google Ads dizem "pack desde 99€". O motor (`quizHelpers.ts:111-112`, fixado em `quizHelpers.test.ts:61`) cobra `bothPrice − waterproofingUpsellDiscount` = 89€, e o configurador de packs usa o mesmo motor. **Decisão do dono: 89€ ou 99€** — os anúncios dependem disto. Depois, exportar `sofaPackPrice(size, tier)` e usá-la nos dois lados.

### 9. Páginas de marca com preços que o motor nunca produz (visto em produção)
`/limpeza-cadeiras-ikea-porto` mostra "**Desde 12.5€**" (com ponto, e 12,50€ é o preço da 7.ª à 9.ª cadeira — as cadeiras começam em 20€): `marcaCadeirasData.ts:38-40` com `minPrice: 12.5`, e `minPriceLabel` (`:79`) nunca é usado. Sofás: Natuzzi "79€ - 129€", Kave Home "59€ - 89€", Roche Bobois "Desde 89€" ao lado de "Sob consulta" na meta — o quiz da mesma página cobra 49€ por qualquer sofá de 1 lugar. React e estático também divergem no título ("no Porto" vs "em Porto") e no processo de limpeza (o estático mostra `marca.cleaningProcess`, que o React nunca mostra).

### 10. Preço de referência inventado no quiz
`QuizStepConfigSofa.tsx:79` mostra `{dp + 10}€` riscado ao lado do preço Premium quando a impermeabilização é o serviço principal. Esse preço nunca foi praticado. As regras portuguesas de anúncio de reduções de preço exigem que o preço de referência seja um preço efetivamente praticado antes — vale a pena o dono confirmar; a correção segura é remover o riscado ou usar um preço real de tabela.

### 11. A FAQ de preço do colchão diz que o anti-ácaros está incluído
`problemSeoData.ts:673` ("a partir de 69€, incluindo anti-ácaros e desodorização") e `:661` contradizem `:659/:663/:665` na mesma página ("anti-ácaros opcional"), o `TREATMENT_EXTRAS` e a FAQ do pilar ("A limpeza inclui tratamento anti-ácaros? Não."). Aparece em `/problemas/preco-limpeza-colchao`, nas variantes por cidade e no respetivo `FAQPage`. Este ficheiro tem ~28 preços escritos à mão e nunca foi migrado como o `blogData.ts`.

### 12. Anti-ácaros / desbacterização definido de cinco maneiras
Cadeiras: o quiz diz "incluídos na impermeabilização" e não oferece opção (`QuizChairsAddonUpsell.tsx:90-91,104-105`); o configurador de packs cobra +5€/cadeira (`customPack.ts:36`, `PackConfigurator.tsx:264`); os pontos de confiança dizem "5€/un. … pode escolhê-lo ao configurar o artigo" (`serviceTrustPool.ts:171-177`); `keywordVariantData.ts:245` diz "anti-ácaros opcional a 5€" e "desbacterização opcional sob orçamento". Sofá: o quiz não oferece anti-ácaros; o configurador vende +20/40/50€. `commercialPolicy.ts:14` diz que são "objetivos distintos, orçamentados separadamente"; o CLAUDE.md diz que são o mesmo tratamento. Código morto do widget guarda ainda um terceiro preço (10€ + 7,50€/cadeira). **Precisa de decisão do dono sobre o que se vende**, depois uma tabela única `treatments.ts` lida por quiz, configurador, recibo e SEO.

### 13. Chaise longue anunciada mas nunca perguntada nem cobrada no quiz
As tabelas de preço estáticas de ~16k landings mostram "+10€ / +25€" (`locationPriceTestimonialsData.ts:60,82`), o blog usa `sofaChaisePrice`, o configurador cobra +10€ (ou +35€ com tratamento, contra 25€ no widget). No quiz, `QuizFormData.sofaHasChaise` nunca é lido e `SofaItem` não tem chaise: o preço não entra e o lead perde a informação. Uma FAQ manda escolher a chaise "no simulador", que a esconde (`PriceWidget.tsx:106-108`). Modelar a chaise no motor ou retirá-la de todo o lado.

### 14. O preço de pack conta de forma diferente no quiz e no configurador
`customPack.ts:97` dá o preço de pack a todas as linhas depois da primeira (`index > 0`); o quiz mantém todas as unidades do serviço principal a preço de tabela. Sofá 3L + 2L: **134€ no configurador, 148€ no quiz**. Dois sofás iguais no configurador somam `qty` na linha 0 e ficam a 158€ — inconsistente consigo próprio. `packComboData.ts:44` promete "o segundo colchão fica 14€ mais barato", o que é falso se forem do mesmo tamanho. A regalia do tapete ("Limpe 5 m², pague 4") só existe no JSX do quiz, fora do `packPerks.ts`, sem o mínimo de 100€. Correção: uma `applyPackPerks(units, tableSubtotal)` em `packPerks.ts` para os dois lados, com teste quiz-vs-configurador.

### 15. Páginas de pack (244): gramática e migalha
`PackComboPage.tsx:186` escreve "Perguntas sobre **o limpeza** de sofá e colchão" (sobra da mudança de nomes de 24/09, era "o pack…"). Depois do React, o `BreadcrumbList` passa por "Limpeza de Sofás" (`ServiceLocationSchema serviceBaseUrl`, `:89-91`) enquanto a migalha visível e o estático passam por "Packs" → `/guia-de-packs` (`:106`).

### 16. "Condições do serviço e garantia" diferente no rodapé React e no estático, em todas as páginas
`BusinessConditions.tsx:3` (inclui um parágrafo de escalões de Braga escrito à mão, copiado do `travel.ts`) vs `prerender.ts:414` (inclui cobertura e resposta). Fonte única `SERVICE_CONDITIONS` em `commercialPolicy.ts`.

### 17. Problema × cidade: título e "noutras cidades" divergem
`ProblemCityPage.tsx:45-47` ("no Porto… Orçamento grátis") vs `prerender.ts:750-751` ("em Porto… Resposta"). O React volta a usar `.slice(0, 8)` para as cidades vizinhas (`:85-88`) — o defeito que a fase 8 corrigiu só no lado estático.

### 18. `cityPrep` reimplementado com erro
`landingEditorial.ts:25,28` usa `place === 'Porto' ? 'no' : 'em'` na introdução e na meta de todas as landings de localidade/preço/variante: "em Barreiro", "em Amadora", "em Seixal", enquanto o H1 da mesma página usa o `cityPrep` certo ("no Barreiro", "na Amadora"). O `prerender.ts` também escreve "em" à mão em `:750,797,998,1021,1044`.

### 19. Contraste insuficiente no quiz (visto em produção)
"Impermeabilização Essencial" no cartão de tratamento usa `text-gold/40` a 14px sobre verde escuro (~2,3:1; o mínimo AA é 4,5:1) — `ServiceTypeSelector.tsx:141,155`.

---

## 🟡 P2 — Segurança e robustez

20. **reCAPTCHA inerte.** A CSP de produção não tem `www.google.com`/`www.gstatic.com` em `script-src`/`frame-src`, por isso `recaptcha.ts:25` é bloqueado, o token sai `null` e o servidor deixa passar pedidos sem token de propósito (`_shared/recaptcha.ts:51`). `send-lead-email` nunca recebe token. Resta o limite de 8 pedidos/10 min por IP, em memória por isolate. `VITE_RECAPTCHA_SITE_KEY` nem está no `.env.example`. O `AUDIT.md` lista-o como "a funcionar". Decidir: manter (acrescentar as origens e a chave) ou retirar.
21. **Sugestão de SQL perigosa no painel.** `ErrorLogPanel.tsx:82,93` manda colar `CREATE POLICY "allow_delete" ON public.error_logs FOR DELETE USING (true);` — sem `TO`, vale para todos os papéis, e as migrações nunca retiram à `anon` os privilégios por omissão em `error_logs`/`quiz_events` (só em `leads`). Colar isso deixaria qualquer visitante apagar os logs. Além disso, os botões de apagar de `ErrorLogPanel` e `QuizMetricsPanel.tsx:673-686` dizem "apagado com sucesso" quando o RLS apagou 0 linhas, e `CrmPanel.tsx:193-199` ignora erros. Retirar a sugestão, usar `.select('id')` para contar linhas, ou retirar os botões (a migração de retenção já trata da limpeza).
22. **Falha a carregar um chunk depois de um deploy.** Não há handler de `vite:preloadError`; `use-landing-model.ts:25` e `GeneratedRoutePage.tsx` fazem `import()` sem `.catch` (página em branco para sempre); o quiz (`QuizFormLazy.tsx`) não tem error boundary próprio, por isso uma falha substitui a landing inteira. Sem o catch-all SPA, os chunks do deploy anterior dão 404 — e há vários deploys por dia. `App.tsx:77` usa o `location` global em vez de `useLocation()`.
23. **Atribuição pago → orgânico ao fim de 30 minutos.** `leadAttribution.ts:131` reutiliza o registo sem renovar `captured_at`; 30 min depois da entrada, é reconstruído a partir do URL atual (sem `gclid`) e a visita passa a orgânica. Quem compara preços durante mais de meia hora antes de pedir orçamento sai da exportação de conversões offline. Contradiz o CLAUDE.md, que diz que o last touch só se perde num regresso depois de 30 min.
24. **O script de deteção de bots do Cloudflare é bloqueado pela CSP em todas as páginas** (2 erros de consola por página, o que também pesa no "Boas práticas" do Lighthouse). O token muda a cada pedido, por isso não há hash possível. Desligar "JavaScript detections" no Cloudflare se não fizer falta, ou aceitar.
25. **Newsletter morta mas publicável.** `newsletter-subscribe`/`-unsubscribe`/`-welcome` (714 linhas) não têm chamador. O `newsletter-welcome` tem **outro número de telefone** (932 956 558, contra 925 530 647 em `business.ts`), perfis de Instagram/Facebook que não existem, o domínio `kyroclean.pt`, um cupão CLEAN10 de 10% e não verifica o `{error}` do Resend. As migrações criam `newsletter_subscribers` e `scratch_card_interactions` com política de INSERT pública (por confirmar na base: `select * from pg_policies where tablename in (…)`). Despublicar (`npx supabase functions list`), apagar do repositório, retirar as políticas.
26. **`.env.example` contradiz o modo de consentimento.** Tem `VITE_CONSENT_MODE=basic` "(omissão)"; o código usa `advanced` desde `187e85b` e a política de privacidade descreve o avançado. Quem copiar o exemplo para o Cloudflare desalinha site e política.
27. **Edge Functions fora de todos os portões.** O Vitest só cobre `src/` e `scripts/`; não há `deno test`/`deno check`. `LEAD_FIELDS`/`MAX_LENGTHS` estão copiados entre `submit-lead` e `send-lead-email` (um campo novo num perde-se no outro). A verificação de injeção de cabeçalhos corre sobre `JSON.stringify(body)` (que escapa CR/LF, por isso nunca apanha nada) com uma regex `/g` que guarda `lastIndex` entre pedidos (`_shared/validation.ts:17`). Duas versões do `std/http`, `supabase-js` sem versão fixa, `deno.json` com um `resend@4` que ninguém usa.
28. **Tipos do Supabase inexistentes na prática.** `src/integrations/supabase/types.ts` só conhece duas tabelas mortas; há 19 `as any` em 8 ficheiros (eram 8) mais ~15 chamadas via `const db = supabase as any`. Dois clientes (o sem tipos, `lib/supabase.ts`, está agora no caminho público de submissão) e um terceiro acesso por `fetch` REST em `eventDelivery.ts:94`. `npx -y supabase@latest gen types typescript --linked` é só leitura e tipa tudo de uma vez.
29. **As migrações não reproduzem produção:** colunas de `quiz_events` (`page_path`, `referrer`, `utm_*`, `device`) criadas à mão, só registadas em `supabase/tests/00_baseline_remote_state.sql`. Uma migração de reconciliação idempotente (`add column if not exists`).

---

## 🟡 DRY estrutural

A causa comum de quase todos os P1: **preços e factos guardados como texto de apresentação** ("49€", "Sob orçamento", "Aveiro e Coimbra sob consulta") e depois reescritos à mão ou re-interpretados.

- **D1. Preços como strings.** `PRICE_TABLE` (`locationPriceTestimonialsData.ts:55-84`) é texto e o widget calcula totais a fazer parse dele (`priceWidgetCalc.ts:61,114`); `serviceCatalog.priceFrom` alimenta o `minPrice` do JSON-LD; ~200 valores em € escritos à mão (`problemSeoData` 45, `marca*Data` 40, `prerender` 28, `serviceTrustPool` 17, `keywordVariantData`, `locationSeoData`, `PageHead`, `Services.tsx`, `QuizStep1Service`, `BeforeAfterPage`, `Impermeabilizacao.tsx:79,96`…). O parse de "preço de etiqueta" existe 9 vezes com dois comportamentos (`PricePage`/`MaterialPage` usam `/[^0-9]/g`, que transformaria "12,5€" em 125). Só o blog está protegido. **Derivar de `QuizTypes.ts`, guardar `number | null`, e um teste que rebenta com `\d+€` escrito à mão nos módulos de dados.**
- **D2. Dois motores de preço no quiz.** `use-quiz-pricing.ts` calcula o total; `buildReceiptLines` (`submissionService.ts:167-254`) recalcula as linhas do recibo/email/CRM. Já divergem: fallback do colchão `+30` vs `null`; a guarda do anti-ácaros de cadeiras existe num e não no outro. Uma só `quoteLines()` pura; total = soma das linhas; teste em matriz.
- **D3. Constantes mágicas.** Deslocação mínima 10€ ×12; anti-ácaros de cadeira 5€ ×5; escalões de limpeza de cadeiras (20/15/12,50€, orçamento a partir de 10) sem constante e copiados ×6; "até 10 anos / até 5 lavagens / 1 a 2 anos" ×111 em 17 ficheiros (o recibo diz "Proteção 2 anos"); "Equipas em Braga, Porto, Lisboa e Algarve" ×21; rótulos de região ×4 (o `97e6789` teve de editar 6 sítios à mão para acrescentar "Alentejo Litoral"). Criar `MIN_TRAVEL_FEE`, `CHAIR_CLEAN_TIERS`, `CHAIR_ANTI_ACAROS_UNIT`, `WATERPROOFING_TIERS`, `TEAM_BASES`, `AREA_LABELS`.
- **D4. Páginas de marca.** `MarcaSofaPage`/`MarcaColchaoPage`/`MarcaCadeirasPage` são 86–90% idênticas linha a linha depois de normalizar o substantivo (776 linhas); três ficheiros de dados com a mesma interface e as mesmas funções de rota; três ciclos no `prerender.ts`; lista de slugs ×4 sem teste; as ligações a outras marcas mostram "el corte ingles". Um `BrandPage.tsx` + `brandPages.ts`.
- **D5. Inventário de rotas ×5, sem guarda de colisões.** `App.tsx`, `prerender.ts` (`CORE`, `LEGAL_PAGES`, `CLIENT_ONLY_ROUTES`), `generate-sitemap.ts` (a lista core omite as 3 páginas legais), `SitemapMonitor.tsx` (6 URLs core contra 13 no sitemap real), `PageHead`; nomes de página como strings em `generatedRouteIndex`/`GeneratedRoutePage`/`prerender`. `writeRoute` sobrescreve em silêncio (último ganha), o índice de rotas guarda o primeiro. Medido hoje: 16.136 caminhos, 0 colisões — risco latente, mas foi exatamente assim que nasceu a nona armadilha. Registo único de famílias + teste de unicidade + teste "cada rota do `App.tsx` tem ficheiro estático".
- **D6. JSON-LD ainda fora do `seoSchema.ts`.** `BlogPosting` ×2 (o estático sem `@id` nem `image`); `FAQPage` construído de 4 maneiras; Offers das marcas à mão; `EnGuidePage.tsx:106-109` credita um `Organization` solto em vez do `@id` (regra do CLAUDE.md). `injectJsonLd` (`prerender.ts:125`) não escapa `<`, ao contrário da linha 556 do mesmo ficheiro.
- **D7. Boilerplate de página.** 24 ficheiros definem `document.title`/OG/canonical à mão (o setter existe em `PageHead.tsx:226-257`); bloco "Página não encontrada" ×11; className do pill de ligações ×13; migalha feita à mão em `BeforeAfterPage`, `EnGuidePage`, `Autor`, `Estudo`, `Sobre`, `PacksSitemap` (o `PageBreadcrumb` existe); stepper +/− ×11 (e um `Stepper` local no `PackConfigurator`); `TierCard` no `PackConfigurator.tsx:45` reimplementa o `WaterproofingTierPicker`.
- **D8. Outros hotspots do jscpd.** `ServicePriceSection` ↔ `ServiceTrustBlock` (83 linhas): reimplementa `ServiceTrustDesktop/Mobile` — ganho puro, trocar pelos exports. `CommercialPage` ↔ `EnServicePage` (118): hero feito à mão que o `CommercialHero` já faz (falta-lhe `language`). `enTouristSeoData` (113 linhas repetidas entre cidades).
- **D9. Utilitários.** ~10 formatadores de euros com saídas diferentes ("12,5€" no ecrã, "12,50€" na mensagem do lead, "12.50€" no CRM; `fmtN` continua sem chamadores); `normalize('NFD')` ×7; `cities.find(c => c.slug === …)` ×16; URL de WhatsApp montado à mão ×28; gerador de `lead_id` duplicado byte a byte (`leadTracking.ts:65-70` = `submissionId.ts:27-32`); 5 regras diferentes de validação de telefone; conjunto "meio pago" ×3; morada escrita à mão em `Sobre.tsx:177` e `prerender.ts:1381`.
- **D10. Edge Functions.** Cliente de serviço criado ×4, preâmbulo OPTIONS/método/IP/rate-limit ×6, `escapeHtml` reimplementado. `_shared/lead-fields.ts`, `_shared/supabase-admin.ts`, `_shared/resend.ts` (com um `sendOrThrow()` que torna impossível esquecer o `{error}`).

**Listas paralelas protegidas por teste:** problemas, variantes de keyword, deslocação ↔ catálogo, regalias de pack, títulos legais. **Sem teste:** pilares (PageHead ↔ prerender ↔ React, já divergiram), rotas/sitemap/monitor (já divergiram), slugs de marca, regiões/equipas (já divergiram), `paths` dos tsconfig, `LEAD_FIELDS` das duas funções.

---

## 🟡 SOLID / arquitetura

O que está bem: o chunk de entrada é magro (~110 KB de `src`, sem tabela de rotas nem dados SEO — o antigo #12 está resolvido); `window.gtag`/`fbq` só em `gtag.ts`/`metaPixel.ts`/`enhancedConversions.ts`; os cliques de contacto têm um só delegado; o `submitQuizLead` usa `allSettled` e um `lead_id` idempotente; contextos pequenos, sem "god context".

- **S1 (inversão de dependências).** O domínio de preços vive em `src/components/quiz/`: `data` (6), `lib` (3), `services`, `hooks` e os scripts importam de lá; o barrel `components/quiz/index.ts` reexporta componentes React. A regra "`QuizTypes.ts` sem imports `@/`" é uma restrição escondida numa pasta de UI. `problemTipsData.ts` importa `lucide-react`. **Mover para `src/domain/pricing/` (imports relativos) e uma regra ESLint `no-restricted-imports` que proíba `data/constants/lib/services/domain` de importar `components`/`pages`/`react`.**
- **S2 (SRP, estado do quiz).** 13 `useState` em `QuizForm.tsx:161-190`, repostos em três sítios que não coincidem (`:314-330`, `:680-686`, `:514-528`); as regras "salta o tipo de serviço" e "que upsell vem a seguir" estão copiadas 3× entre `QuizForm.tsx` e `use-quiz-navigation.ts` (os comentários registam bugs reais causados por isto). `useReducer` num `use-quiz-state.ts` + funções puras num `quizFlow.ts`.
- **S3.** `QuizComboUpsellScreen` espelha o estado do pai em 4 estados locais e sincroniza por `useEffect` (`:57-75`, `:168-230`), com o cálculo das regalias dentro do componente. Uma `buildComboUpsellItems()` pura e testada.
- **S4.** `prerenderRoutes()` é uma função de ~1.355 linhas com 21 pontos de `emit` e ~450 linhas de conteúdo de pilares escrito à mão. Dividir em `scripts/prerender/families/*.ts` que devolvem páginas; o módulo principal valida a unicidade e só depois escreve.
- **S5 (aberto/fechado).** Um 7.º serviço mexe em ~40 ficheiros (~12 só de ligação); há 4 vocabulários de ids de serviço e ~10 mapas escritos à mão (`serviceToQuiz.ts` e `resourceContent.ts:48` já discordam em `impermeabilizacao`); mapas `Record<string, …>` não falham no typecheck quando se acrescenta um serviço. As oito localidades mexeram em 19 ficheiros. Um `serviceIds.ts` com `ServiceSlug` derivado do catálogo e `Record<ServiceSlug, …>`.
- **S6 (segregação de interfaces).** `QuizFormProps` (20 props, com pares legados) copiado em `QuizFormLazy.tsx` e `QuizForm.tsx`; `QuizLeadPayload` (~35 campos) mistura estado, texto já formatado no componente e campos mortos (`photos`, `hypoallergenic`, `hypoSurcharge = 0`).
- **S7.** `QuizMetricsPanel.tsx:522-652`: ~130 linhas de agregação dentro de um `useCallback`, sem testes. Dois fusos horários: `Europe/Copenhagen` (`QuizMetricsPanel.tsx:40`, `TrackingHealth.tsx:38`) e `Europe/Lisbon` (`marketingPlatforms.ts:36,44`) — o mesmo lead pode cair em dias diferentes em dois painéis. Escolher um `ADMIN_TIME_ZONE`.
- **S8 (ciclos).** `errorTracking` ↔ `quizTracking` é um ciclo real por import dinâmico só para ler `IS_PRODUCTION` (o build avisa que o import dinâmico não separa nada) — mover para `constants/tracking.ts`. Os outros dois são só de tipos (`landingFaqTypes.ts`, `marketingTypes.ts`).
- **S9 (bundle).** `sonner`, `next-themes` e `TooltipProvider` estão montados no `App.tsx` e nunca são usados (~11 KB gzip no chunk de entrada); o import dinâmico dos Web Vitals em `main.tsx:21` não adia nada porque `analytics.ts` já está no entry; as metades en/es do `routeMeta` do `PageHead` vão no entry e são mortas (`lang = "pt"` fixo em `:224`).
- **S10.** ESLint com `no-unused-vars` desligado e `noUnusedLocals: false`: é por isto que o código morto se acumula. Ligar como aviso e correr o knip de vez em quando.

---

## 🟡 DDD — modelo de domínio

| Domínio | Módulo canónico hoje | Quem o volta a modelar |
|---|---|---|
| Catálogo de serviços | `serviceCatalog.ts` (6 slugs) + chaves do quiz | `serviceToQuiz.ts` (2 mapas), `resourceContent.ts:48`, `ServiceKey` ×2, `PackKind`, `PRICE_TABLE_QUIZ_CONFIG`, rótulos no `QuizForm` |
| Preços | repartido: `QuizTypes`, `quizHelpers`, `chairPricing`, `packPerks`, `travel` | `use-quiz-pricing`, `buildReceiptLines`, `priceWidgetCalc`, `customPack`, `QuizComboUpsellScreen`, ~15 módulos SEO |
| Tratamentos (tiers, anti-ácaros) | **nenhum** | `QuizTypes` (no colchão, `waterproofing*` significa anti-ácaros), `priceWidgetCalc`, `customPack`, `QuizChairsAddonUpsell`, `treatmentSeoData`, `commercialPolicy`, `serviceTrustPool` |
| Geografia | `travel.ts` (por nome) + `serviceCatalog.cities` | `freguesiaSeoData`, `regionUtils`, `metroCities`, `service_requests.locality`, `leads.region`, `COVERAGE_PROMISE` |
| Leads | tabela `leads` + `submit-lead` | `Lead` (código morto), `LeadRow`, `LEAD_FIELDS` ×2, `buildLeadRow`, `service_requests` (sem ligação a `leads`) |
| Estado do lead | `funnel_status` com CHECK + RPC com histórico (bom) | `LEAD_STATUSES`, `STATUS_RANK`, `status`/`priority` legados ainda escritos pelo `submit-lead` |

- **DDD1. As regras de produto não têm casa** — que tratamento existe para que artigo, o que é "pack", o que é "o primeiro artigo", a chaise. É a causa dos #8, #12, #13 e #14. Um `src/domain/pricing/{catalog,treatments,perks,travel,quote}.ts`.
- **DDD2. O que foi vendido não fica gravado de forma estruturada.** `leads.service` é uma etiqueta concatenada com os extras, truncada em silêncio a 120 caracteres pelo `submit-lead`; `service_type` guarda a escolha do passo 2 (um sofá com Premium acrescentado no upsell fica "Higienização Profunda"); `value` é texto; o tier não é guardado; o valor numérico enviado ao Google Ads como valor da conversão não fica em lado nenhum e `quoted_value` fica `null`. Acrescentar `service_key`, `quote jsonb` (linhas) e `estimate_value`.
- **DDD3. A receita vive em dois livros sem ligação.** O painel de Ads edita `leads.final_revenue`/`amount_received` (e o ROAS sai daí); o separador CRM regista trabalhos feitos em `service_requests.billed_value`/`my_cut`/`paid`, sem referência ao lead. Acrescentar `lead_row_id` a `service_requests`, ou fazer o CRM escrever nas colunas de `leads`.
- **DDD4. Linguagem.** "Pack" tem dois significados (tratamento combinado no mesmo artigo — `packEnabled`, "Pack Proteção Total" — e visita com vários artigos — `packPerks`); `carpet` é tapete no quiz e alcatifa no `PackKind` (e os ícones estão ao contrário); `service_requests` guarda trabalhos concluídos, não pedidos; `id`/`lead_id`/`booking_id` (este último com `Math.random`, sem unicidade); `phone_click` no GA4 vs `call_click` na base; `quiz_events.service` guarda o serviço nos eventos do quiz e a origem do CTA nos cliques.
- **DDD5. "Sob orçamento" tem 5 codificações** (a string, `null`, `price: 0`, flags `isSob`/`quote`, regex sobre texto), com 29 verificações `typeof … === 'number'` e 6 `Number(price)` que dariam `NaN`. `type Price = number | null` + um só `formatEur()`.
- **DDD6. Geografia em 5 modelos.** `regionUtils.ts:25` classifica Aveiro e Coimbra como "Área Metropolitana do Porto"; uma cidade desconhecida paga 10€ no quiz (`use-quiz-pricing.ts:87`) e fica "a confirmar" no configurador (`customPack.ts:104`). Uma tabela `City {slug, name, team, fee, extendedTrip}`.
- **DDD7. Estado do lead:** os 9 estados listados em 3 sítios (CHECK, lista do RPC, `LEAD_STATUSES`); qualquer estado passa para qualquer outro; `completed_at` não é limpo quando o lead recua.

---

## 🟢 Código morto — seguro apagar (confirmado por grep, testes incluídos)

| O quê | Nota |
|---|---|
| `src/App.css`, `quiz/ConfettiGold.tsx`, `ProblemCarousel.tsx` (+ 2 `vi.mock` mortos), `constants/serviceProcesses.ts` | 0 importadores |
| `quiz/steps/QuizSofaPackTest.tsx` + ramo `QuizForm.tsx:805-808`; flags `offerPreview = true`, `localPackPreview = false`, `hypoSurcharge = 0` e os ramos mortos que escondem | constantes |
| `SofaPackPreview.tsx` (+ teste) | só em DEV com `?teste=pack`, e ainda mostra "Desconto de 10%" |
| Ramo de extras do widget: `toggleAddonRow`/`toggleAntiAcarosRow`, `calcRowAddonDelta`, `calcChairAntiAcarosTotal` (10€ + 7,50€), `CHAIR_ANTI_ACAROS_*`, `calcSofaAntiAcarosDelta` | inalcançável; religá-lo ressuscitava um preço que já não se vende. Manter `SOFA_ANTI_ACAROS_PRICE` (usado pelo `customPack`) |
| `analytics.ts`: `trackQuizStep`, `trackQuizAbandonment`, `startStepTimer`, `trackStepDuration`, `trackUpsellViewed`, `trackUpsellAccepted`, `getDeviceType` | passos e abandono já medidos por `use-quiz-analytics.ts`; **aceitação de upsell e tempo por passo não são medidos em lado nenhum** — se interessar, criar eventos novos |
| Exports mortos: `fmtN`, `sofaTogglePack`, `PROBLEM_CTA`, `PROBLEM_POOL_CTA`, `SERVICE_RESULT_IMAGES`, `SERVICE_RESULT_CONTENT` (tem "alergénios eliminados" — armadilha se for religado), `getSolutionImage`, `getAuthor`, `getNearbyFreguesias`, `problemCategories`, `buildProblemWaMessage`, `safeSessionGet`, `renderAtRoute` | ~25 outros só precisam de perder o `export` |
| `snapshotStats` em 7 páginas, `priceFactors` em `priceSeoData.ts:86`, `intro` dos pilares (sobrescrito em `prerender.ts:1495`), `SofaLeadActions` importado pelas marcas e nunca renderizado | nunca renderizados |
| Chaves de storage escritas e nunca lidas: `hasClickedQuote`, `kyro_booking_id`, `kyro_wa_url`, `kyro_summary` | |
| Dependências: `@radix-ui/react-accordion`, `-label`, `-separator`, `-tabs`, `-tooltip`, `vite-plugin-image-optimizer`, `@tailwindcss/typography`, `sonner`, `next-themes` (+ `ui/sonner.tsx`, `ui/tooltip.tsx` e os providers no `App.tsx`) | `sharp` e `supabase` ficam (scripts e CLI) |
| **Decisão do dono** — `Contact.tsx` + `contactService.ts` (+ teste) + `lib/validation.ts` + `ui/textarea.tsx` + `zod` | continua a ser mantido sem estar montado; se voltasse, reintroduzia bugs (`lead_id` novo por tentativa, `generate_lead` depois de entrega só por email, sem guarda de produção) |
| **Decisão do dono** — `AdminDashboard.tsx` (1.180 linhas) + `Lead`/`LeadStatus` em `lib/supabase.ts` | a razão para o manter ("única UI que lê `leads`") deixou de ser verdade: o `MarketingPanel` lista e edita os leads |
| Supabase: `newsletter-*` (3 funções), `_shared/newsletter.ts`, `_shared/sanitize.ts` | ver #25 |
| `public/functions/BingSiteAuth.xml.js`, `public/image-sitemap.xml` (domínio errado, `cleansolutions.pt`), `public/images-optimized/`, `public/cities/`, `public/waterproof-demo.mp4` (820 KB), `public/placeholder.svg` | servidos no `dist` sem ninguém os usar |
| Raiz/scripts: `optimize-images.js`, `update_en.ps1`, `update_es.ps1` (outro projeto, caminho de utilizador Windows), `scripts/convert-gallery.mjs` (idem), `scripts/audit-hero-model-parity.mjs`, `scripts/parse-whatsapp-services.mjs` + `.txt` (ver #4) | |
| `output/` (17 MB de PNGs de anúncios) → `~/Documents/KYRO_AD_FACTORY`; `references/` (spec genérico de outro toolkit), `reports/` e os relatórios datados da raiz → `docs/` | |
| Lint: 4 `eslint-disable` inúteis; dependências a mais em `use-quiz-pricing.ts:79` (`carpetItems`) e `use-quiz-ui-effects.ts:38` | |

---

## 📄 Documentação que contradiz o código (referências mortas)

Estes ficheiros são lidos por cada sessão nova nas duas máquinas, por isso um facto errado aqui propaga-se.

- **CLAUDE.md:** diz que `/packs` (`CustomPackPage.tsx`) existe e não se toca — foi removido a 24/09, o ficheiro já não existe e `_redirects:20` faz 301 para `/guia-de-packs`; descreve um upsell "Aproveite e poupe 10%" com `packDiscountActive` (não existe); o anti-ácaros de cadeiras a 5€ como opção do quiz (retirado a 10/09); `calcCarpetWidget` e alcatifa a 3€/m² (removidos, alcatifa é sob orçamento); o `aggregateRating` do `index.html` como última cópia à mão (já não existe); `SITEMAPS` em `AdminPanel.tsx` (está em `admin/SitemapMonitor.tsx`); `lastmod` "produção só tem 26" (tem 17.214/17.214); `SofaLeadActions` como CTA dos heroes (já não é renderizado; é o `CommercialHero`); "deslocação mínimo 10€ sem exceções" (o `calculateTravelFee` dá 0€ acima de 120/135/150€); `VITE_ADMIN_PASSWORD` (0 referências).
- **CONTEXT.md:** a tabela "**VALORES SAGRADOS**" (`:372-411`), que o CLAUDE.md manda ler antes de mexer em preços, está errada — sofá `waterproofingPrice` 49/59/69 (código: 59/79/99), `bothPrice` 79/89/99 (código: 99/139/169), chaise impermeabilizada 10€ (código: 25€). Descreve ainda `packDiscountActive`, `QuizMinimumGate`, uma contagem decrescente de −5% e ficheiros `QuizStep2*.tsx` que não existem. Melhor apontar para `QuizTypes.ts` do que copiar números.
- **AGENTS.md** (cópia para o Codex): "5.0★, +100 avaliações", `packDiscountActive`, "Formspree não depende do Supabase".
- **PROMPT_NOVA_SESSAO.md** (maio): Formspree, react-i18next, deslocação 0€ no Porto, rotas `/admin/dashboard`.
- **README.md:81** aponta para `RESEND_SETUP.md`, que não existe. **WIDGET_PREVIEW.md** cita porta e branch que já não existem.
- **docs/lead-spam-protection.md:73** manda correr `npx supabase db push` (ver #1); descreve o Formspree como canal de email.
- **`.env.example`**: modo de consentimento `basic` (ver #26); faltam `VITE_RECAPTCHA_SITE_KEY`/`RECAPTCHA_SECRET_KEY`.
- **AUDIT.md**: lista o reCAPTCHA em "Confirmado a funcionar" (ver #20).
- **Comentários:** `QuizTypes.ts:82-88` ("2L=149€") e `:98-107` (colchões 84/99/114) com preços antigos; `gtag.ts:113` diz que o modo básico está em vigor; `QuizComboUpsellScreen.tsx:79-82` fala do desconto de 10%; o comentário da CSP em `_headers` lista o `Contact.tsx` como formulário ativo; `list-resend-leads:2-5` diz que os leads não ficam em nenhuma tabela.

---

## Estado dos achados das auditorias anteriores (2026-08-23 e 2026-09-08)

33 achados reverificados no código: **10 corrigidos, 6 parciais, 15 abertos, 2 não aplicáveis.**
- **Corrigidos:** widget de preços único (`PriceWidget.tsx`); reCAPTCHA ligado ao fluxo (mas inerte, #20); fórmula das cadeiras centralizada; `QuizForm` com union `UpsellScreen` e `useQuizNavigation`; `QuizStepConfig` dividido por serviço; tabela de rotas fora do entry; `leads` visível no `MarketingPanel`; `buildFaqNode` usado.
- **Parciais:** migalha (5 páginas ainda à mão), pills de ligações, rotas de marca, estado do lead (`funnel_status` bom, `status` legado solto), `safeStorage`, seletor Premium/Essencial (novo `TierCard` no configurador).
- **Abertos:** tipos do Supabase (pior: 19 `as any`), páginas de marca (pior: 86–90% iguais), guarda de colisões de rotas, políticas DELETE/botões de apagar, `Contact.tsx`, `fmtN`, tracking de upsell, stepper ×11, escape em `injectJsonLd`, fallback latente de `calcPackPricing` (`quizHelpers.ts:108-110`), `service_type` como etiqueta, CSS de admin/código morto no scan do Tailwind (vai para o CSS público).
- **Diagnóstico antigo errado:** os Web Vitals estavam ligados desde o commit inicial; o risco de XSS no JSON-LD só existe no lado do prerender; as páginas EN não têm equivalentes PT, por isso a falta de `hreflang` é deliberada.

---

## Decisões que só o dono pode tomar

1. Pack sofá + Essencial: **89€ ou 99€?** (#8 — os anúncios dizem 99€.)
2. Anti-ácaros / desbacterização: o que se vende em cada artigo, e a que preço? (#12)
3. Chaise longue: entra no quiz ou sai do site? (#13)
4. Regalia de pack: por unidade ou por categoria? (#14)
5. Preços por marca (Natuzzi 79–129€, etc.): são reais? Se sim, o quiz tem de os aplicar. (#9)
6. reCAPTCHA: ligar a sério ou retirar? (#20)
7. Apagar `Contact.tsx` e `AdminDashboard.tsx`? Despublicar a newsletter? Reescrever o histórico do git por causa do #4?

## Ordem de ataque sugerida

1. **Hoje, 30 minutos:** consulta do #1; Redirect Rule de `www` antes de qualquer DNS (#2); apagar o ficheiro de faturação (#4); retirar a sugestão de SQL (#21); `.env.example` (#26).
2. **Correções pequenas visíveis ao cliente (S):** #5, #7, #10, #11, #15, #18, #19, e o #3 no `send-lead-email`.
3. **Depois das decisões do dono:** #8, #12, #13, #14, #9.
4. **Estrutural, por esta ordem (cada um remove uma classe de bug):** pilares partilhados (#6), preços derivados + teste de € à mão (D1/D3), um só motor de linhas do quiz (D2), `src/domain/pricing` com regra ESLint (S1), registo de rotas com teste de unicidade (D5), tipos do Supabase (#28), `BrandPage` (D4).
5. **Limpeza:** a tabela de código morto e a documentação (CLAUDE.md, CONTEXT.md, AGENTS.md) — convém fazer a documentação cedo, porque é lida por cada sessão nova.

---
---

# Auditoria de Arquitetura — DRY / SOLID / DDD / Código Morto

Auditoria realizada em 2026-08-23 com 4 agentes paralelos (código morto/referências mortas, duplicação DRY, arquitetura SOLID, modelação de domínio DDD), depois de verificação cruzada manual dos achados mais consequentes. Complementa o `AUDIT.md` existente (layout/conteúdo/SEO/mobile/design, 30/35 findings já corrigidos) — este documento foca-se especificamente em qualidade estrutural de código, não em UI/conteúdo visível. Apenas leitura, nenhum ficheiro foi alterado durante a auditoria em si.

**Os 3 achados mais importantes, por impacto real no negócio:**
1. Duas páginas de FAQ afirmam descontos que o motor de preços real não cumpre — exposição direta a reclamações de clientes (#1, #2). **✅ Corrigido em 2026-08-24.**
2. A duplicação dos construtores de schema JSON-LD era mais profunda do que uma simples duplicação de código — eram **4** implementações diferentes, e a homepage estava a vazar o seu próprio LocalBusiness+Service genéricos para dentro de todas as ~9184 páginas prerenderizadas (bug estático, visível ao Google sem JavaScript), além de duplicação real pós-hidratação em 8 componentes React (#3). **✅ Resolvido por completo em 2026-08-24** — ver detalhe abaixo, é a correção mais extensa desta sessão.
3. `src/lib/recaptcha.ts` (proteção anti-spam completa, chave configurada em `.env`) nunca é chamado por lado nenhum do fluxo de submissão real — gap de segurança possivelmente não intencional. **Ainda por decidir (#5).**

**Atualização 2026-08-24:** os 2 CRITICAL de conteúdo (#1, #2) foram corrigidos; #3 (JSON-LD) foi resolvido por completo, incluindo um bug estático maior descoberto só ao investigar a fundo; #4 (widget de preços) manteve-se parcial, por razão explicada no próprio finding; todo o código morto seguro (INFO #16, #18, #19, #20) foi apagado; `GlobalPromoBanner.tsx` também foi apagado após confirmação do dono. Nada dos WARNING (#5-#15) foi tocado — ver secção própria para prioridades sugeridas.

---

## 🔴 CRITICAL — risco real para o cliente/negócio

### 1. ✅ CORRIGIDO (2026-08-24) — FAQ de cadeiras prometia desconto que o motor de preços não cumpre
`src/data/locationSeoData.ts:263,274` — usado nas páginas de Localização×Serviço (~150 páginas): *"Oferecemos descontos progressivos: 10% para 10+ cadeiras, 15% para 20+ cadeiras"*. O motor real (`calcChairClean`/`calcChairBracket` em `quizHelpers.ts`) não tem desconto percentual nenhum — acima de 10 cadeiras é sempre "Sob orçamento", e nunca existiu um bracket de "20+".
**Fix aplicado:** resposta reescrita para refletir os escalões reais (20€/15€/12,50€ por cadeira, sob orçamento acima de 10). Confirmado no build (`dist/`) que a frase falsa desapareceu por completo do site gerado.

### 2. ✅ CORRIGIDO (2026-08-24) — FAQ de packs prometia "até 15%" quando o motor só tem 0% ou 10%
`src/data/problemSeoData.ts:741,749` — *"Packs de limpeza + impermeabilização com desconto até 15%"*. `src/data/packComboData.ts` confirma `discountPct` só assume `0` ou `0.10` em toda a tabela.
**Fix aplicado:** "até 15%" → "até 10%" nas 2 ocorrências. **Bónus encontrado no mesmo ficheiro, mesma vizinhança:** `problemSeoData.ts:747` dizia "sofá de 3 lugares começa a partir de 49€" (49€ é o preço de 1 lugar; 3 lugares é 79€) — corrigido também.

### 3. ✅ RESOLVIDO POR COMPLETO (2026-08-24) — duplicação de builders JSON-LD, incluindo um bug estático maior descoberto ao investigar

**O que era:** não 2 implementações (`seoSchema.ts` vs `prerender.ts`), mas **4**: o bloco estático do `index.html`, os builders locais de `prerender.ts`, os builders partilhados de `src/lib/seoSchema.ts` (usados client-side por 13 ficheiros), e um quarto, `src/components/LocalBusinessSchema.tsx`, escrito totalmente à mão só para a homepage.

**Bug estático maior, encontrado ao verificar o HTML gerado (não estava neste finding originalmente):** o `template` que o `prerender.ts` reutiliza como boilerplate `<head>` para todas as ~9184 páginas é literalmente o `dist/index.html` da homepage — incluindo o **LocalBusiness e o Service genéricos da homepage**. Havia uma tentativa anterior de remover só o LocalBusiness (comentário no código a referir isso), via regex frágil que exigia `<script type="application/ld+json">` sem nenhum atributo extra — e que eu próprio parti sem querer ao adicionar o atributo `data-ssr-schema`. O bloco **Service** nunca tinha sido removido, em nenhuma sessão anterior: todas as ~9184 páginas SEO (incluindo, por exemplo, "Limpeza de Sofás Porto") tinham dois nós Service — o genérico da homepage E o específico da página — visíveis ao Google mesmo sem JavaScript, desde sempre.

**Fix aplicado (tudo verificado com `npm run build`, prerender real de 9184 rotas, e inspeção do HTML gerado em 6 famílias de página diferentes):**
1. `src/lib/seoSchema.ts` — `buildLocalBusinessNode()` enriquecido com os campos que só existiam na versão à mão da homepage (`geo`, `openingHoursSpecification`, `sameAs`, `logo`, `image`, `description`) — passa a ser a única definição, usada por todos. `buildBreadcrumbNode`/`buildServiceNode` ganharam parâmetros opcionais (`id`, `url`, `description`) para poderem ser usados tanto no padrão `@graph` rico (client-side) como no padrão de scripts separados do `prerender.ts`, sem perder nenhum campo para os 13 consumidores já existentes.
2. `src/components/LocalBusinessSchema.tsx` (homepage) — deixou de ser a 4ª implementação à mão, passa a usar `buildLocalBusinessNode()`.
3. `scripts/prerender.ts` — as 4 funções locais (`buildLocalBusinessSchema`/`buildBreadcrumbSchema`/`buildServiceSchema`/`buildFaqSchema`) passaram a delegar nas da lib, **sem alterar nenhum dos ~50 pontos de chamada** (as assinaturas antigas foram preservadas nos wrappers). Removidas também as constantes `BIZ_PHONE`/`BIZ_EMAIL`/`BIZ_RATING`/`BIZ_REVIEWS`, que eram cópias manuais de `business.ts` e ficaram mortas.
4. `scripts/prerender.ts` — a extração do template deixou de usar regex frágil: agora faz parsing real de cada bloco JSON-LD e remove os de `@type` `LocalBusiness`/`Service` (o `WebSite` fica, é intencionalmente partilhado por todas as páginas, com `@id` estável para cross-referência).
5. **Anti-duplicação em tempo de execução:** todo script injetado estaticamente (`prerender.ts` e o bloco LocalBusiness do `index.html`) ganhou o atributo `data-ssr-schema="true"`. Nova função `clearPrerenderedSchema()` em `seoSchema.ts` remove esses scripts do `<head>`; chamada num `useEffect` de montagem nos 8 componentes que re-renderizam LocalBusiness do lado do cliente (`ServiceLocationSchema.tsx`, `ServiceSchema.tsx`, `LocalBusinessSchema.tsx`, `ReviewRequest.tsx`, `CommercialPage.tsx`, `ProblemPage.tsx`, `EnGuidePage.tsx`, `EnServicePage.tsx`) — resolve a duplicação pós-hidratação sem afetar as famílias de página que não têm esse problema (não tocadas).
6. `index.html` — `@id` do bloco estático alinhado para `${SITE_URL}/#business` (era a URL nua), consistente com a versão client-side agora partilhada.

**Verificação:** inspecionado o JSON-LD real gerado em `dist/` para localização, marca, comercial, blog, EN e core — todas têm exatamente 1 WebSite (partilhado, correto) + 1 LocalBusiness específico da página + Service/Breadcrumb/FAQ conforme aplicável, zero duplicados, zero vazamento da homepage.

### 4. 🟡 PARCIALMENTE ENDEREÇADO (2026-08-24) — widget de preços tem diferenças reais, não é um swap direto
Investigação revelou que `LocationServicePage.tsx`/`FreguesiaServicePage.tsx` não duplicam `ServicePriceSection.tsx` por acidente preguiçoso — têm conteúdo genuinamente diferente e valioso que `ServicePriceSection` não tem: **preço de deslocação específico da cidade** ("+{fee}€ deslocação a {cidade}", mostrado 2×) e **o nome da cidade no heading a dourado**. Um swap direto para `<ServicePriceSection />` tal como está removeria esse conteúdo de ~942 páginas (150 localização + 792 freguesia) — seria uma regressão de conteúdo real, não uma limpeza.
**O que foi corrigido com segurança total:** o achado concreto de drift citado neste finding — `handleSelectRow` (morto, nunca chamado) em ambos os ficheiros — foi removido, junto com `getRowDefaultQty` (que só existia para o alimentar e ficou também morta). Zero risco, zero mudança visual.
**Não fiz:** o swap completo do widget. **Recomendação para uma sessão dedicada:** estender `ServicePriceSection.tsx` com 2 props opcionais (`cityName?`, `travelFee?`) que, quando presentes, ativam o heading com gold-word da cidade e a linha de deslocação — mantendo `SofaVariantPage.tsx` (que não passa essas props) inalterado — e só depois migrar os 2 ficheiros. Isto preserva o conteúdo real e elimina a duplicação, mas precisa de verificação visual em ambos os tipos de página antes de publicar.

---

## 🟡 WARNING — dívida técnica real, sem exposição direta a cliente

### 5. ⏸️ CORRIGIDO O DIAGNÓSTICO (2026-08-24), não a implementação — `recaptcha.ts` construído mas a chave está vazia
`src/lib/recaptcha.ts` — `getRecaptchaToken()` completo. **Correção ao finding original:** `VITE_RECAPTCHA_SITE_KEY` no `.env` está **vazia** (`""`), não preenchida como este documento dizia antes — confirmado a ler o ficheiro diretamente. Isto muda a decisão seguinte: ligar isto ao fluxo real agora, com a chave vazia, **partiria as submissões do quiz**, não as protegeria. Zero imports em todo o `src`/`scripts`; `use-quiz-submission.ts` não o chama.
**Fix:** precisa de decisão do dono — se quer mesmo proteção anti-spam, tem de criar um site key real na Google reCAPTCHA admin console para o domínio `cleansolutions.com.pt`, colar no `.env`, e só depois ligar `getRecaptchaToken()` a `use-quiz-submission.ts`. Se foi abandonado deliberadamente, remover ficheiro + env var. Não fiz nenhuma das duas coisas — nenhuma é segura sem essa decisão.

### 6. ⏸️ NÃO TOCADO (deliberadamente) — CRUD do admin fala com o Supabase diretamente, sem camada de serviço
`src/pages/AdminDashboard.tsx` (`fetchLeads`, `saveEdit`, `autoSaveField`, `deleteLead`, `handleQuickAdd`) faz `supabase.from(...)` diretamente em cada handler de UI, ao contrário do fluxo de submissão do quiz que já tem `submissionService.ts` como camada de serviço limpa. (A parte de `AdminPanel.tsx` deste finding ficou resolvida como efeito colateiro do #8 — `fetchErrors`/`fetchMetrics`/`fetchWaChart`/etc. já vivem isolados em `ErrorLogPanel.tsx`/`QuizMetricsPanel.tsx`, mais fáceis de extrair para serviço no futuro do que estavam misturados num ficheiro de 1190 linhas.)
**Porque não toquei:** `AdminDashboard.tsx` é o CRUD de leads reais do negócio — editar, apagar, adicionar clientes. Ao contrário das páginas SEO (verificáveis com um build + grep no HTML gerado), uma regressão aqui só se deteta testando ao vivo cada ação (editar um lead, apagar, guardar) contra a base de dados real, e esta sessão não tinha esse tipo de verificação disponível. Extrair a camada de serviço é mecanicamente simples, mas o risco não está na extração em si — está em confirmar que continua a funcionar exatamente igual depois.
**Fix:** extrair `src/services/leadsService.ts` seguindo o padrão de `submissionService.ts`, mas testar cada ação (editar/apagar/adicionar lead) ao vivo contra o Supabase antes de dar como concluído.

### 7. ✅ CORRIGIDO (2026-08-24) — drift de linguagem: label do quiz não batia com o que ficava gravado no CRM/WhatsApp
`src/components/QuizForm.tsx:375-382` (`getServiceTypeLabel`) ainda usava `'Limpeza e Lavagem'`/`'Lavagem + Impermeabilização'` — termos antigos, substituídos há muito por "Higienização Profunda"/"Pack Proteção Total" na UI do quiz (`ServiceTypeSelector.tsx`) mas nunca atualizados aqui. Este texto antigo era gravado em `leads.service_type` e enviado por WhatsApp/Formspree — o cliente via um nome no quiz, o dono via outro no CRM para o mesmo lead.
**Fix aplicado:** labels atualizados para `'Higienização Profunda'`/`'Impermeabilização Premium'`/`'Pack Proteção Total'`, iguais aos da UI. Confirmado que `AdminDashboard.tsx:121` (`lead.service_type.toLowerCase().includes('impermeab')`) continua a funcionar corretamente com o novo texto — "Impermeabilização Premium" ainda contém a substring `impermeab`.
**Não fiz (fica em aberto):** persistir o enum técnico (`cleaning`/`waterproofing`/`both`) num campo próprio da tabela `leads`, separado do label de apresentação. Isso eliminaria de vez a dependência de string-matching, mas exige uma migração de schema no Supabase (o dono tem de colar SQL manualmente) — fora do âmbito de uma correção de código só.

### 8. ✅ RESOLVIDO (2026-08-24) — `AdminPanel.tsx` eram 4 dashboards independentes cosidos por abas (1190 linhas)
**Fix aplicado:** cada aba movida para o seu próprio ficheiro em `src/pages/admin/` (`SitemapMonitor.tsx`, `ErrorLogPanel.tsx`, `QuizMetricsPanel.tsx`), cada uma com o seu state/fetch/JSX isolados e lazy-loaded, seguindo exatamente o padrão que a aba CRM já usava para `AdminDashboard`. `AdminPanel.tsx` ficou reduzido a auth + tabs + Suspense (1190 → 141 linhas). Efeito colateral medido: o chunk `AdminPanel.js` caiu de 43,3KB para 6,8KB — as outras 3 abas só carregam quando o dono clica nelas, em vez de tudo ir no bundle inicial do painel. Verificado com build completo + type-check; servidor de dev reiniciado e painel reaberto no browser para confirmação visual.

### 9. ✅ PARCIALMENTE RESOLVIDO (2026-08-24) — breadcrumb extraído; resto do hero fica por boa razão
**Correção à premissa original:** `src/components/ServiceHero.tsx` **não é o componente certo para generalizar** — é um layout completamente diferente (full-bleed com foto de fundo em `min-h-[92vh]`, usado só pelas 6 páginas base tipo `LimpezaSofas.tsx`), enquanto as 11 famílias listadas usam um layout `grid lg:grid-cols-2` com foto de produto à direita. São dois designs de hero distintos que só pareciam iguais pelo className da secção de texto (overline/h1), não pela estrutura toda — mesmo problema de premissa que o finding #4.

**Fix aplicado:** criado `src/components/PageBreadcrumb.tsx` (`items: {label, to?}[]`, o último item sem `to` mostra-se como texto simples) e migradas as 11 páginas a usá-lo — era a parte genuinamente idêntica byte-a-byte (a mesma `<nav>` com o mesmo className em todas), zero risco visual porque é uma extração mecânica 1:1, sem alterar nenhum valor. ~70 linhas eliminadas. Confirmado com build + prerender de 9184 rotas.

**Não fiz:** unificar overline+h1+CTA+foto — essas partes **variam genuinamente** por família (CTA usa `QuizButton` nalgumas, botão cru noutras; nem todas mostram preço; a foto de produto muda de posição/tratamento). Faria sentido uma segunda extração (`PageHeroOverline`, por exemplo) numa sessão com orçamento para verificação visual em cada uma das 11 famílias — não tentei arriscar isso às cegas.
**Nota:** há outros 6 ficheiros com este mesmo padrão de breadcrumb (`BeforeAfterPage.tsx`, `EnGuidePage.tsx`, `GlossarioEstofos.tsx`, `PackComboPage.tsx`, `FAQEstofos.tsx`, `SofaVariantPage.tsx`) fora do âmbito original deste finding — não tocados, mas `PageBreadcrumb.tsx` já está pronto se se quiser estender a esses também.

### 10. `fmtN()` — helper de formatação de preço morto, reimplementado inline 5×
`src/components/quiz/quizHelpers.ts:113-115` define `fmtN()` corretamente mas nunca é chamado. A mesma expressão (`n % 1 === 0 ? n : n.toFixed(1).replace('.',',')` + `€`) está copiada inline em `QuizForm.tsx:423`, `QuizUpsellOverlay.tsx:478,512`, `QuizStepConfig.tsx:217,264` — confirmado por grep.
**Fix:** substituir as 5 reimplementações por `fmtN(...)`. Baixo risco, elimina pontos de drift no formato de preço mostrado ao cliente.

### 11. Grid de "links relacionados" repetido 17× em 6 ficheiros — 5× seguidas dentro do mesmo ficheiro
Mesmo className completo (`inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full...`) para pills de freguesias/cidades/serviços/problemas/materiais relacionados. Dentro de `LocationServicePage.tsx:808-880` sozinho, o mesmo bloco de ~10-12 linhas repete-se 5 vezes seguidas só variando a fonte de dados.
**Fix:** extrair `<RelatedLinksGroup title items={{key,label,to}[]} />`, usado tanto entre como dentro dos ficheiros.

### 12. Rotas/lookup de marca triplicadas nos 3 ficheiros de dados de marca
`getAllMarca*Routes`/`getMarca*ByCityAndSlug` em `marcaSofaData.ts`/`marcaColchaoData.ts`/`marcaCadeirasData.ts` têm corpo idêntico (~17 linhas × 3). Padrão relacionado em `getRelatedProblemLinks`/`getRelatedMaterialLinks`.
**Fix:** genéricos parametrizados `buildBrandRoutes<T>()`/`findBySlug<T>()` em `src/data/` ou `src/lib/`.

### 13. Ciclo de vida do lead sem qualquer validação de transição
`LeadStatus` em `src/lib/supabase.ts` usa o truque `'pending' | 'contacted' | 'scheduled' | 'lost' | (string & {})`, que na prática aceita qualquer string sem verificação real. A tabela Supabase não tem `check constraint` no `status`. Mistura na prática os 4 estados "oficiais" com ~12 valores legados em português de um CSV importado. Não existe o estado "completed" presumido — `scheduled` funciona como o estado "fechado/ganho" de facto.
**Fix:** para uma operação de uma pessoa, não vale a pena uma máquina de estados formal — mas uma função simples `canTransition(from, to)` como tabela de transições válidas evitaria erros de clique acidental, se decidido que vale a pena.

### 14. Migração incompleta: `safeStorage.ts` só 1 de 4 helpers adotado
`safeSessionSet` está em uso; `safeSessionGet`, `safeLocalGet`, `safeLocalSet` nunca são chamados — sugere que código que ainda acede a `sessionStorage`/`localStorage` diretamente não está protegido contra falhas (Safari privado, etc.).
**Fix:** decidir se completa a migração (usar os 3 helpers nos pontos que ainda acedem diretamente) ou remove os não usados.

### 15. Funil de upsell sem métricas apesar da infraestrutura existir
`trackUpsellViewed`/`trackUpsellAccepted` em `src/lib/analytics.ts` nunca são chamados por `QuizUpsellOverlay.tsx` — o funil "Pack Família" não está a ser medido.
**Fix:** ligar as chamadas de tracking já existentes ao componente, se a métrica for útil ao dono.

---

## 🟢 INFO — código morto (✅ apagado em 2026-08-24, confirmado com `npm run build` + prerender de 9184 rotas sem erros)

### 16. ✅ APAGADO — ficheiros completamente órfãos, zero imports confirmados
`src/hooks/use-discount-timer.ts`, `src/hooks/useQuizStorage.ts`, `src/lib/sanitize.ts`, `src/components/layout/SectionLayout.tsx`, `src/components/ServiceBenefitsBar.tsx`, `src/contexts/QuizContext.tsx` (o `context/` singular continua, é o real, usado por 16 ficheiros), `src/pages/AdminImport.tsx`, `src/pages/AdminManager.tsx`, `src/pages/AdminSeoPages.tsx`, `src/pages/ServiceAreaRouter.tsx`. Todos reconfirmados sem referências imediatamente antes de apagar (o código muda entre a auditoria e a execução).

### 17. ⏸️ NÃO TOCADO — subsistema do formulário de contacto clássico
`src/components/Contact.tsx` + `src/services/contactService.ts` + `src/lib/validation.ts` + `src/components/ui/textarea.tsx` + dependência `zod`. Deixado como está — precisa de decisão do dono (é fallback intencional ou pode ir embora?), não incluído no "seguro para apagar" desta sessão.
**`GlobalPromoBanner.tsx` — ✅ APAGADO.** O dono confirmou ser "algo antiquíssimo do site" — órfão desde pelo menos 2026-08-06 (chegou a ser editado nesse audit para trocar o ícone Sparkles sem ninguém notar que já não estava montado em lado nenhum).

### 18. ✅ REMOVIDO — dependências npm nunca importadas
`@tanstack/react-query`, `framer-motion`, `i18next`, `react-hook-form`, `react-i18next` removidas via `npm uninstall` (12 pacotes no total, incluindo transitivas). Bloco `manualChunks` do `framer-motion` também removido de `vite.config.ts`.

### 19. ✅ APAGADOS — 7 de 17 componentes shadcn/ui nunca usados
`accordion.tsx`, `dialog.tsx`, `label.tsx`, `separator.tsx`, `skeleton.tsx`, `tabs.tsx`, `use-toast.ts` (shim). `textarea.tsx` **não** foi apagado — é usado só por `Contact.tsx` (#17), que ficou por tocar; apagar `textarea.tsx` sozinho partiria esse import.

### 20. ✅ REMOVIDOS (4 de 5) — exports mortos de baixo impacto
`hasConsent` (`consent.ts`), `MATERIALS_WITHOUT_DEDICATED_PHOTO` (`materialHeroImages.ts`), `getAllFreguesias` (`freguesiaSeoData.ts`), `BUSINESS_NAME` (`business.ts`), `SERVICE_RESULT_FALLBACK` (`serviceContent.ts`) — todos removidos. **`buildFaqNode` (`seoSchema.ts`) NÃO foi tocado** — ao contrário do que este finding sugeria, não é um export descartável: é precisamente a peça que a unificação descrita no #3 vai precisar de usar. Removê-lo agora só para o recriar depois seria trabalho a dobrar.

---

## Achados investigados e conscientemente não reportados como problema

- **`scripts/prerender.ts` (1095 linhas) e `QuizForm.tsx` (982 linhas):** apesar do tamanho, ambos já delegam bem (funções puras pequenas no primeiro; hooks dedicados — `use-quiz-pricing`, `use-quiz-ui-effects`, `use-quiz-submission` — no segundo). Não são "God files" no sentido de misturar responsabilidades sem separação; o volume vem de conteúdo editorial/JSX de passos, não de lógica emaranhada.
- **Rotas em `App.tsx`:** sem evidência de shadowing entre as ~13 categorias — cada família usa prefixo de slug estruturalmente distinto. `keywordVariantData.ts` vs `keywordVariantRouteData.ts` parecem duplicados mas são intencionais (versão leve só-paths vs conteúdo completo).
- **Tipos anémicos (`QuizTypes.ts`):** zero comportamento nos tipos é esperado no idioma React/hooks funcional deste projeto — não é, por si só, um problema a corrigir; é só o que explica porque a duplicação de #10/#12 foi fácil de acontecer.
- **Bounded contexts quiz vs prerender:** a separação entre motor de preços do quiz (reativo, browser) e o de `prerender.ts` (Node puro, sem alias Vite) é uma decisão de arquitetura genuína e justificada por um constrangimento técnico real — não vale a pena forçar unificação aqui. O problema real está no #3 (JSON-LD) e na prosa de marketing (#1/#2), não nesta separação.
- **Uma reestruturação DDD formal** (agregados, value objects, repositórios) seria over-engineering para este projeto — uma pessoa a gerir um site de marketing + quiz + CRM leve. O ganho real está inteiramente nos achados #3/#6/#10/#12 acima: consolidar lógica duplicada, não introduzir vocabulário DDD pesado.

---

## Resumo

| Severidade | Nº de findings |
|---|---|
| 🔴 CRITICAL | 4 |
| 🟡 WARNING | 11 |
| 🟢 INFO | 5 (agrupados) |

Nenhum finding foi corrigido nesta sessão — é auditoria só de leitura, como o `AUDIT.md` original. Recomendação de ordem de ataque, se o dono quiser corrigir: #1/#2 primeiro (risco de cliente, fix trivial de texto), depois #3 (resolve a causa raiz de um bug já conhecido), depois #4 (elimina drift já provado), o resto por prioridade própria do dono.

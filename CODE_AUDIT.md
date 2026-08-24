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

# Auditoria — 2026-09-08 (código: dead code, segurança, type-safety, arquitetura)

Auditoria realizada com 4 agentes paralelos, cada um numa frente diferente: dead code/duplicação, segurança, type-safety/correção, arquitetura/performance. Apenas leitura — nenhum ficheiro foi alterado durante a investigação. Esta auditoria é **diferente** da de 2026-08-20 mais abaixo neste documento (aquela focou-se em layout/design/SEO/conteúdo); esta foca-se em qualidade e segurança do código em `src/`.

Severidade: **CRITICAL** (bug real que afeta dinheiro, dados de clientes, ou segurança agora) · **WARNING** (problema real, não urgente) · **INFO** (vale a pena saber, baixa prioridade).

---

## 🔴 CRITICAL

### 1. Tabelas `leads`, `quiz_events` e `error_logs` são legíveis e escrevíveis por qualquer pessoa, sem autenticação nenhuma
`supabase/migrations/20240101_admin_tables.sql` — as políticas RLS dão ao papel `anon` `select using (true)`, `insert with check (true)`, `update using (true)` nas três tabelas. A chave anon é pública (vai no bundle JS de qualquer visitante, por design), por isso **qualquer visitante pode abrir a consola do browser e ler o nome, telefone, preço e notas de margem internas de todos os clientes** diretamente do endpoint REST do Supabase — ou sobrescrever campos de qualquer lead. Não é hipotético: foi assim que esta sessão encontrou os leads de teste falsos ("wd"/"jhiji") e as linhas importadas do WhatsApp, só com a chave anon pública.
**Fix:** remover as políticas permissivas de `select`/`update`; restringir leitura/escrita a um papel de admin autenticado via Supabase Auth. Manter `insert` aberto só em `leads` (o quiz público precisa dele) — mas ver #5, devia ter proteção contra bots também.

### 2. A password de admin está compilada em texto simples no bundle JS público
`src/pages/AdminDashboard.tsx:24` e `src/pages/AdminPanel.tsx:11`:
```ts
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'kyro2025';
```
Qualquer variável de ambiente prefixada com `VITE_` é embutida no bundle do cliente pelo Vite. Confirmado presente em texto simples no `dist/assets/AdminDashboard-*.js` / `AdminPanel-*.js` já compilado. Quem vir o JS do site em produção tem a password real. **Trocar a password não resolve isto** — o próximo build volta a embutir a nova, igualmente visível.
**Fix:** isto precisa de autenticação real do lado do servidor (sessão Supabase Auth + verificação de papel via RLS, ou uma regra Cloudflare Access à frente de `/admin`), não uma comparação de strings no cliente. É a mesma causa-raiz do #1 — resolver o Supabase Auth como deve ser trata dos dois.

### 3. Password de fallback fixa `'kyro2025'` no código
Mesmas duas linhas do #2. Se um build correr sem `VITE_ADMIN_PASSWORD` definida (este projeto já teve uma falha documentada de variável de ambiente no Cloudflare Pages, ver comentários em `src/integrations/supabase/client.ts`), o painel de admin cai silenciosamente para esta string fixa — que está agora no código-fonte.
**Fix:** falhar fechado (bloquear o acesso admin) em vez de usar um fallback silencioso quando a variável não existe.

### 4. Sofá "4+ Lugares" desaparecia silenciosamente ao ser adicionado no upsell final "Poupe 10%"
`src/components/quiz/steps/QuizComboUpsellScreen.tsx` (cálculo de `sofaTotal` e o `useEffect` que constrói `upsellItems`) só incluíam um tamanho de sofá se `typeof opt.cleaningPrice === 'number'`. A opção `'4+-lugares'` tem `cleaningPrice: 'Sob orçamento'` (uma string) — mas a linha do stepper não tinha essa proteção, por isso o cliente conseguia tocar "+", via o cartão selecionado (borda dourada), e o item nunca era adicionado a `upsellItems`, nunca chegava ao CRM nem à mensagem de WhatsApp/Formspree. O cliente pensava ter pedido um sofá de 4+ lugares; o negócio nunca soube.
**✅ Corrigido nesta sessão** — ver "Correções aplicadas" no fim.

---

## 🟡 WARNING

### 5. Proteção contra bots existe no código mas nunca é usada
`src/lib/recaptcha.ts` (um helper completo de reCAPTCHA v3, a corresponder à `VITE_RECAPTCHA_SITE_KEY` real e configurada) nunca é importado em lado nenhum de `src/`. O caminho real de submissão de leads (`src/services/submissionService.ts`) não tem captcha nem rate-limiting nenhum. Combinado com a política de insert aberta do #1, um script pode enviar leads falsos em massa diretamente para a API REST do Supabase, sem passar pelo site. Já existe um verificador de reCAPTCHA do lado do servidor em `supabase/functions/_shared/recaptcha.ts`, mas só está ligado às funções de newsletter, não ao quiz.
**Fix:** ligar `getRecaptchaToken()` a `submissionService.submitQuizLead`, verificar o token do lado do servidor antes do insert.

### 6. Widget de preços de marketing não aplica a mesma regra "sob orçamento qualifica sempre" que o quiz aplica
`src/lib/priceWidgetCalc.ts` (`calcWidgetPricing`) calcula a elegibilidade do desconto de 10% só a partir de `articleTotal > PACK_DISCOUNT_MIN_TOTAL`, sem equivalente ao `|| hasUpsellSobItem` do quiz (`use-quiz-pricing.ts`), que trata qualquer item a 0€/sob orçamento como automaticamente qualificado. Na prática: um visitante numa página de preço que adiciona um tapete como extra no widget é informado que não desbloqueia o desconto, mas a mesma combinação no quiz real qualificaria. Mesmo padrão do #4 — uma correção de "null" feita numa superfície de preço e não na sua implementação paralela.
**Fix:** adicionar o mesmo ramo "sob orçamento qualifica sempre" a `calcWidgetPricing`.

### 7. Fórmula de preço em escalão das cadeiras duplicada uma terceira vez
`src/lib/priceWidgetCalc.ts` define `calcChairBracket()` especificamente para centralizar o cálculo por escalão (já usado em dois sítios) — mas `buildWidgetQuizConfig` reimplementa a mesma aritmética inline em vez de chamar essa função. As duas cópias concordam hoje, mas é exatamente o padrão que já causou o bug de desincronização 60€/49€ do `PACK_DISCOUNT_MIN_UPSELL_ITEM`, corrigido mais cedo nesta sessão.
**Fix:** substituir a cópia inline por uma chamada a `calcChairBracket`.

### 8. Bug latente no caminho de fallback do `calcPackPricing`
`src/components/quiz/quizHelpers.ts` — quando uma opção não tem `bothPrice` fixo, o fallback deriva-o como `cleaningPrice + delta`, sempre ancorado no preço de limpeza mesmo quando a impermeabilização é o serviço primário (onde a base real devia ser o preço de impermeabilização). Não é acionado atualmente — todas as entradas reais de sofá/colchão têm `bothPrice` explícito — mas é uma armadilha para o próximo tamanho novo adicionado sem um.
**Fix:** ramificar o fallback da mesma forma que `basePrice` já ramifica, consoante `isWaterproofBase`.

### 9. Tipos gerados do Supabase não incluem `leads`, `quiz_events` nem `error_logs`
`src/integrations/supabase/types.ts` não tem nenhuma referência a estas três tabelas, apesar de serem os dados de negócio reais do site. Isto obriga a 8 casts `as any` espalhados por `quizTracking.ts`, `errorTracking.ts`, `QuizMetricsPanel.tsx` e `ErrorLogPanel.tsx` — ou seja, **o compilador não dá nenhuma segurança de tipos em nenhum insert/update a leads, analytics ou erros.** Um nome de coluna com erro de escrita ou um tipo de valor errado compila sem problemas e falha em silêncio ou corrompe dados em runtime — exatamente a classe de bug que produziu a confusão `chairAntiAcaros`/`chairWaterproofQty` desta sessão, noutra área. Existem também dois clientes Supabase independentes (`src/integrations/supabase/client.ts`, tipado, e `src/lib/supabase.ts`, sem tipos, com a sua própria interface `Lead` escrita à mão, usado só por `AdminDashboard.tsx`).
**Fix:** regenerar `types.ts` a partir do schema real (`supabase gen types typescript`), remover os 8 casts `as any`, e retirar o segundo cliente sem tipos.

### 10. `QuizForm.tsx` tem 1224 linhas e acumula demasiadas responsabilidades
Lógica de navegação/passos, agregação de preços, 4 booleans independentes para visibilidade de ecrãs de upsell, submissão, e disparo de analytics — tudo no mesmo componente. Este ficheiro já foi o local de vários bugs reais nesta sessão precisamente porque estado sem relação tem de ser mantido sincronizado à mão (pelo menos 3 booleans "skip step" desincronizados foram encontrados e corrigidos hoje).
**Fix:** extrair um hook `useQuizNavigation` para a lógica de passos/`canProceed`; substituir os 4 booleans independentes de visibilidade por uma única union `activeUpsellScreen: 'chairs' | 'sofa' | 'mattress' | null` — elimina uma classe inteira de bugs "duas flags em desacordo" por construção.

### 11. `QuizStepConfig.tsx` mistura quatro UIs de serviço não relacionadas num único componente de 417 linhas
Sofá/colchão/tapete/cadeiras têm cada um o seu bloco `if (formData.service === X) return (...)` inline, com a matemática de preços embutida diretamente no JSX. Editar cadeiras arrisca um erro de copy-paste para o bloco quase idêntico do sofá — este padrão já causou pelo menos um bug real nesta sessão (preço de cadeiras a referenciar o campo errado do formulário).
**Fix:** separar num ficheiro por serviço (`QuizStepConfigSofa.tsx`, etc.), despachados por um componente pai fino.

### 12. Toda a tabela de ~9000 rotas vai para o browser de todos os visitantes, sempre
`src/App.tsx` chama todos os ~9 geradores de listas de rotas (freguesia, keyword-variant, material, preço, pack-combo, marca×3, comercial — ~9000 rotas no total) no topo do módulo, e mapeia-as todas em elementos `<Route>` no render principal. Como cada visitante aterra exatamente numa página HTML pré-renderizada vinda da pesquisa, não há razão de produto para hidratar um router client-side com 9000 padrões de rota em cada pageview. Custo real: o chunk de entrada eager tem 369KB pré-gzip.
**Fix:** estrutural, não é um patch rápido — para um site pré-renderizado como este, navegação normal `<a href>` entre páginas HTML estáticas já completas funcionaria bem para páginas de conteúdo; reservar o router SPA só para o modal do quiz e `/admin`.

### 13. Sem proteção contra caminhos de rota duplicados em `scripts/prerender.ts`, apesar de geradores comprovadamente sobrepostos
`src/App.tsx` tem um comentário a notar que as rotas de keyword-variant são registadas *antes* das de problema×cidade especificamente "para ganhar em caminhos sobrepostos" — ou seja, dois geradores diferentes podem produzir o mesmo URL, e a precedência do router depende da ordem. O `prerender.ts` escreve um ficheiro HTML estático por rota sem nenhuma verificação de duplicados/colisão. Se a ordem de iteração do script de prerender alguma vez divergir da ordem de registo de rotas do `App.tsx` para um caminho que colide, o Google indexa conteúdo diferente do que a hidratação mostra para esse URL.
**Fix:** adicionar uma verificação em build-time que recolhe todos os caminhos gerados num map e falha em qualquer colisão não resolvida por uma ordem de precedência explícita e orientada a dados.

### 14. Três implementações separadas e feitas à mão do seletor Premium/Essencial
O componente partilhado e exportado `WaterproofingTierPicker` (`QuizStepConfig.tsx`) é corretamente reutilizado por `QuizSofaAddonUpsell.tsx` — mas `QuizChairsAddonUpsell.tsx` tem a sua própria reimplementação de ~45 linhas em vez disso. É exatamente o tipo de desvio que já causou um bug real de preços nesta sessão (o delta Premium/Essencial invertido em `QuizComboUpsellScreen.tsx`, corrigido mais cedo hoje).
**Fix:** fazer o `QuizChairsAddonUpsell` importar e usar o componente partilhado, como a versão do sofá já faz.

---

## 🟢 INFO

15. **Comentário desatualizado a citar os limiares antigos**: `use-quiz-pricing.ts` ainda tem um bloco de comentário a dizer "> 160€ (100€ de base + 60€ do artigo extra...)" a poucas linhas de outro comentário no mesmo bloco que já diz corretamente 49€ — contraditório, vai confundir o próximo a ler o ficheiro. **✅ Corrigido nesta sessão.**
16. `src/components/Contact.tsx` (356 linhas) e `src/services/contactService.ts` estão órfãos — nunca importados em lado nenhum. `quoteFormSchema` em `src/lib/validation.ts` só é usado por este componente morto, por isso também está morto por consequência.
17. `src/lib/performance.ts` (`measureWebVitals`) não tem nenhum ponto de chamada — Web Vitals não estão de facto a ser medidos apesar do código existir para isso.
18. O markup dos botões +/− do stepper está copy-pasted ~10 vezes entre `QuizStepConfig.tsx` e `QuizComboUpsellScreen.tsx` (mais uma variante mais pequena nos dois ecrãs de addon-upsell). Vale a pena extrair para um `<QtyStepper>` partilhado.
19. `MarcaSofaPage.tsx` / `MarcaColchaoPage.tsx` / `MarcaCadeirasPage.tsx` (~1060 linhas combinadas) são ~60%+ estruturalmente idênticas depois de normalizar o substantivo do produto — candidato a extração de template, prioridade mais baixa já que páginas SEO por vezes beneficiam de variação intencional de texto por página.
20. `dangerouslySetInnerHTML` para JSON-LD aparece em ~20 ficheiros, todos alimentados por dados estáticos escritos por developers hoje (não explorável atualmente), mas `JSON.stringify` não escapa `</script>` — tornar-se-ia um vetor de XSS armazenado no momento em que algum destes campos passasse a vir de texto editável por utilizador ou CMS.
21. Não existe política RLS de DELETE em `leads`/`quiz_events`/`error_logs` — o que significa que o botão "Apagar todos os dados" em `QuizMetricsPanel.tsx` quase de certeza não faz nada em produção (consistente com o que foi observado com a tentativa de delete via chave anon mais cedo nesta sessão). Vale a pena confirmar diretamente no dashboard do Supabase e ligar um caminho de delete autenticado a sério, ou remover o botão para não dar falsa confiança.
22. `trackQuizEvent({action:'start'})` pode registar mais do que uma vez por visitante real se ele fechar e reabrir o quiz na mesma visita à página (o session ID é gerado uma vez ao carregar o módulo, não por abertura do quiz) — infla ligeiramente `totalStarts`/reduz `completionRate` no painel de métricas. Não afeta dinheiro.
23. `.env` foi commitado no commit inicial deste repositório e só mais tarde removido do tracking — a password nesse histórico já foi entretanto rodada, sem ação necessária, mas o histórico em si nunca foi purgado.
24. O SDK do Supabase (219KB) e outros chunks lazy grandes (`blogData.ts` 140KB, `AdminDashboard.tsx` 44.5KB) já estão corretamente isolados do bundle público — sinalizado apenas como "não regredir isto sem querer" (um futuro `import { supabase }` estático fora de `/admin` ou do padrão de import dinâmico do quiz reintroduziria silenciosamente 219KB na carga de todos os visitantes).

---

## Correções aplicadas durante esta auditoria

Dada a severidade e relevância direta com o trabalho de hoje, estas foram corrigidas de imediato em vez de só documentadas:

- **#4 (sofá 4+ Lugares desaparecia)** — o stepper de `'4+-lugares'` em `QuizComboUpsellScreen.tsx` agora adiciona um item placeholder com `price: 0` (mesmo padrão já usado para tapete), por isso sobrevive em `upsellItems`, ativa `hasUpsellSobItem`, e chega mesmo ao negócio em vez de desaparecer.
- **#15 (comentário desatualizado)** — corrigida a referência antiga a 160€/60€ em `use-quiz-pricing.ts` para os valores reais de 149€/49€.

Tudo o resto neste documento é um relatório para revisão, ainda não executado — em particular, #1/#2/#3 (RLS do Supabase + autenticação de admin) são decisões de infraestrutura/negócio que precisam da tua aprovação explícita antes de qualquer mudança, já que afetam como o painel de admin passa a ser acedido.

---
---

# Auditoria Completa — Kyro Clean Solutions (2026-08-20)

Auditoria realizada com 8 agentes paralelos (layout, código, inconsistências/incoerências, funcionalidade/otimização para o cliente, mobile, SEO, design, coerência de texto). Apenas leitura — nenhum ficheiro foi alterado durante a auditoria. Findings ordenados por severidade; cada um inclui ficheiro:linha e uma correção concreta.

## Estado: ✅ Todos os 30 findings CRITICAL + WARNING corrigidos

- **13 CRITICAL**: todos corrigidos e verificados (build + browser). Commit `5349d60`.
- **17 WARNING**: todos corrigidos e verificados (build + browser). Commit `c6362e3`.
- **5 INFO**: não corrigidos (baixa prioridade, ver secção INFO no fim deste documento).
- Dois findings (#25 opacidade da borda hairline, #27 duas famílias de botão CTA) foram **investigados e revertidos/mantidos intencionalmente** após verificação do padrão real dominante no código — o relatório original tinha a direção do fix errada nesses dois casos específicos. Ver notas em cada secção.

---

## 🔴 CRITICAL

### 1. "Sob orçamento" é cobrado como se fosse só a deslocação
`src/hooks/use-quiz-pricing.ts` calcula `hasSobOrcamento` / `hasUpsellSobItem`, mas estas flags nunca chegam a `src/services/submissionService.ts` (`QuizLeadPayload`). Resultado: em qualquer sítio onde o preço é comunicado — WhatsApp, CRM, recibo/email — um pedido que devia ser "sob orçamento" aparece como se custasse apenas a taxa de deslocação.
**Fix:** adicionar `hasSobOrcamento`/`hasUpsellSobItem` ao `QuizLeadPayload` e propagá-los desde `use-quiz-pricing.ts` até `submissionService.ts`, e usá-los em todos os templates de mensagem (WhatsApp/CRM/recibo) para mostrar "Sob orçamento" em vez do valor calculado.

### 2. Falhas no envio do lead são completamente silenciosas
`submitQuizLead()` em `src/services/submissionService.ts` nunca rejeita, os `.catch()` no Formspree e no Supabase apenas fazem `logError`. `useQuizSubmission` resolve sempre `{success:true}`, mesmo que ambos os envios falhem — o cliente vê "pedido enviado com sucesso" e nem o negócio recebe o lead nem o cliente é avisado.
**Fix:** propagar o erro (ou pelo menos um `success:false`) quando ambos os canais falham, e mostrar um aviso ao utilizador com um caminho alternativo (telefone/WhatsApp).

### 3. Sitemap está a submeter 4 URLs fantasma (404) ao Google
`scripts/generate-sitemap.ts` mantém a sua própria cópia hardcoded de `problemSlugs`, desalinhada da fonte real em `src/data/`. Está a emitir estas URLs que não existem:
`limpeza-estofos-automovel`, `limpeza-cortinas`, `impermeabilizar-tapete`, `limpeza-sofa-seco`.
**Fix:** substituir os arrays hardcoded em `generate-sitemap.ts` por imports diretos de `src/data/problemSeoData.ts` (mesmo padrão que `scripts/prerender.ts` já usa).

### 4. Preços de cadeiras contraditórios em 3 ficheiros
`chairPrices` em `src/components/quiz/QuizTypes.ts` (código morto, nada importa isto), `src/data/priceSeoData.ts` e `src/data/blogData.ts` têm valores diferentes para o mesmo serviço. O motor real de preços é `calcChairClean`/`calcChairWaterproof` em `quizHelpers.ts`.
**Fix:** apagar o `chairPrices` morto de `QuizTypes.ts`; alinhar `priceSeoData.ts` e `blogData.ts` com os valores reais de `quizHelpers.ts` (12,50€–20€/unidade).

### 5. Dois nós LocalBusiness JSON-LD conflituosos em cada página pré-renderizada
`scripts/prerender.ts` (`buildLocalBusinessSchema()`, linhas 88-116) injeta um schema `LocalBusiness` com coordenadas geo diferentes das que já estão no `index.html` estático, em vez de o substituir. Cada página pré-renderizada envia 2 nós LocalBusiness conflituosos ao Google.
**Fix:** remover o schema estático de `index.html` (ou o de `prerender.ts`) e manter apenas uma fonte de verdade para as coordenadas.

### 6. ~900+ páginas (incluindo as 680 novas de marca) sem `buildLocalBusinessNode()` no `@graph`
As páginas de marca × cidade criadas nesta sessão (sofá/colchão/cadeiras) não têm o nó LocalBusiness no schema `@graph` que as restantes páginas SEO têm.
**Fix:** adicionar a chamada a `buildLocalBusinessNode()` nos blocos de prerender das 3 marcas em `scripts/prerender.ts`.

### 7. Link do rodapé partido em todo o site
Aponta para `/problemas/cheiro-urina-colchao`, mas a rota real é `/problemas/urina-colchao`. Confirmado por dois agentes independentes (layout + funcionalidade) — está em produção em todas as páginas.
**Fix:** corrigir o slug no componente do rodapé (`src/components/Footer.tsx` ou equivalente).

### 8. Travessão "—" em conteúdo visível ao cliente (regra dura do site), ~40+ ocorrências
- `src/data/keywordVariantData.ts` — **18 ocorrências** em `whatIs`/FAQ `answer`, renderizadas em todas as páginas de keyword-variant (linhas 89, 90, 92, 107-121).
- `src/constants/serviceTrustPool.ts` — **23 ocorrências** em `desc`, usadas no componente de trust-stats das seis páginas de serviço principais (linhas 14, 20, 22, 26, 36, 37, 42, 48, 56, 62, 70, 78, 83, 85, 90, 91, 99, 100, 105, 111, 120, 127, 133).
- `src/pages/Obrigado.tsx:85` — "Fora de horário — contactamos assim que reabrirmos...", mostrado a todo o cliente que submete fora de horário.
- `src/pages/Packs.tsx:212` — subtitle do `SectionHeader`, sob o H2 principal.
- `src/pages/MaterialPage.tsx:228` e `src/pages/PricePage.tsx:215` — subtitle do `ServiceAutoCarousel`.
- `src/pages/ProblemPage.tsx:208,225` e `src/pages/ProblemCityPage.tsx:244,261` — em `alt` de imagem (menor impacto visual, mas ainda viola a regra).
**Fix:** substituir todos os "—" por vírgula, ponto ou "com" conforme a frase. Começar pelos dois ficheiros de dados (`keywordVariantData.ts`, `serviceTrustPool.ts`) porque afetam o maior número de páginas.

### 9. Ícone Sparkles decorativo (regra dura do site banida), 5 pontos visíveis ao cliente
- `src/components/GlobalPromoBanner.tsx:2,34,47` — banner global, visível em quase todas as páginas.
- `src/components/quiz/ServiceTypeSelector.tsx:2,40` — ícone da opção "Higienização Profunda" no quiz, visto por todos os utilizadores.
- `src/pages/NotFound.tsx:2,9` — cartão "Impermeabilização" na página 404.
- `src/components/Contact.tsx:1,312` — junto a um heading do formulário de contacto.
- `src/components/layout/SectionLayout.tsx:1,46` — `Sparkles` é o `badgeIcon` **por defeito** deste componente partilhado (sem importadores ativos hoje, mas é uma armadilha para o futuro).
**Fix:** `GlobalPromoBanner` → `Tag`/`Percent`; `ServiceTypeSelector` → `Droplets`/`Waves`; `NotFound` → `Shield` (já usado para impermeabilização noutros sítios); `Contact.tsx` remover; `SectionLayout.tsx` mudar o default para `Shield` ou `CheckCircle2`.

### 10. Claims de "deslocação grátis/incluída" reapareceram fora do sweep original
A correção da mensagem de deslocação feita no início desta sessão não cobriu todos os ficheiros:
- `src/data/priceSeoData.ts:169`
- `src/pages/FAQEstofos.tsx:77-78`
- `src/data/blogData.ts:41,267`
**Fix:** aplicar a mesma correção já usada no Formspree/orçamento — deslocação nunca é grátis/incluída, é sempre o preço real da zona.

### 11. Preço de colchão desatualizado (49€) sobrevive à subida do solteiro
`src/pages/Services.tsx:253` (a linha do colchão na grid de serviços, distinta da linha de impermeabilização já corrigida) continua a mostrar 49€. Também há entradas em `src/data/problemSeoData.ts` cujo texto de intro/benefícios diz 49€ enquanto o `metaDescription` da mesma entrada já diz 59€.
**Fix:** atualizar `Services.tsx:253` para 59€ e rever `problemSeoData.ts` por entradas de colchão com 49€ no corpo do texto.

### 12. Preço do colchão de bebé (berço) inconsistente: 39€ vs 59€
Duas fontes diferentes do site mostram valores diferentes para o mesmo item.
**Fix:** localizar as duas ocorrências e decidir o valor correto (provavelmente 39€, já que berço é um item mais pequeno que solteiro) e alinhar.

### 13. `priceSeoData.ts` inventa um preço fixo onde o motor real diz "Sob orçamento"
Para sofás de 4+ lugares, `priceSeoData.ts` mostra "Desde 89€"/"Desde 99€" fixos, mas `QuizTypes.ts` trata este caso como puro "Sob orçamento" (sem preço fixo).
**Fix:** alinhar `priceSeoData.ts` para mostrar "Sob orçamento" ou remover o valor fixo inventado.

---

## 🟡 WARNING

### 14. Sitemaps públicos desatualizados em `public/`
Os ficheiros `public/sitemap*.xml` commitados no git não incluem as 3 sub-sitemaps mais recentes (incluindo as 680 páginas novas de marca). Risco de servir sitemaps desatualizados se o build de produção não correr o `closeBundle` corretamente.
**Fix:** confirmar que o pipeline de deploy sempre regenera estes ficheiros antes de publicar, ou remover as cópias estáticas do git e gerar sempre em build.

### 15. Nome da marca errado em testemunhos ao vivo
Algum(ns) testemunho(s) mostra(m) "Clean Solutions" em vez de "Kyro Clean Solutions".
**Fix:** localizar e corrigir a string nos dados de testemunhos.

### 16. Contradição "+1000 clientes" vs "50 clientes" no próprio widget do quiz
`src/hooks/use-quiz-ui-effects.ts:95` diz algo como "Mais de 50 clientes", contradizendo o "+1000 clientes" usado noutras partes do site.
**Fix:** alinhar para o valor real e atual, consistente em todo o site.

### 17. Percentagem de eliminação de ácaros varia entre 98% / 99% / 99,9%
Ocorre em pelo menos 3 sítios diferentes do site com valores diferentes para a mesma alegação.
**Fix:** escolher um valor único e verificável e substituir todas as ocorrências.

### 18. Pontuação sistemicamente quebrada em `GlossarioEstofos.tsx`
Padrão recorrente de erros de pontuação ao longo do ficheiro.
**Fix:** revisão de texto dedicada a este ficheiro.

### 19. Links partidos no admin "SEO Explorer" (4 ocorrências)
Painel `/admin` com links que não resolvem corretamente.
**Fix:** localizar as 4 ocorrências em `src/pages/AdminSeoPages.tsx` (ou equivalente) e corrigir os hrefs.

### 20. `scripts/generate-sitemap.ts` duplica ~350 linhas de dados que já existem em `src/data/`
Este ficheiro reconstrói localmente ~10 datasets (incluindo o `problemSlugs` desalinhado do finding #3) em vez de importar de `src/data/`. É a causa-raiz do finding #3 e um risco de drift permanente.
**Fix:** substituir os arrays hardcoded por imports de `src/data/*`, seguindo o padrão já usado em `scripts/prerender.ts`.

### 21. Alvos de toque (touch targets) pequenos em mobile
Botões de chamada/WhatsApp no `Header`, botão de fechar do `QuizForm`, e tamanhos de stepper inconsistentes entre `src/components/quiz/QuizStepConfig.tsx` e `src/components/quiz/QuizUpsellOverlay.tsx`.
**Fix:** garantir mínimo 44×44px em todos os controlos tocáveis; unificar o tamanho do stepper entre os dois ficheiros.

### 22. Páginas antigas ignoram o `SectionHeader` e centram os títulos (viola a regra de alinhamento à esquerda)
- `src/pages/Testemunhos.tsx:105-124` (H1) e `:235-240` (CTA H2) — título centrado, sem serif, sem overline.
- `src/pages/NossoProcesso.tsx:100-117` (H1) e `:181-183` (CTA H2) — mesmo problema.
- `src/pages/AreasDeServico.tsx:132-153` (H1, pill centrado em vez de overline) e `:170-172` (CTA H2); `:46-49` (`RegionSection`) alinha à esquerda mas ainda sem `font-playfair`/overline.
**Fix:** substituir os 6 headings por `<SectionHeader overline=... heading=... goldWord=... light=... />`, seguindo o padrão já usado em `BeforeAfterPage.tsx`, `GlossarioEstofos.tsx` e os `Marca*Page.tsx`.

### 23. Paleta fora da marca em duas páginas antigas
`Testemunhos.tsx` e `NossoProcesso.tsx` usam `teal`/`turquoise`/`navy` (linhas `Testemunhos.tsx:135,169,223,257`; `NossoProcesso.tsx:132,139,176,181`) em vez do dourado `#D4AF37`/verde `#071a12`/`#0d241b` usado em todo o resto do site. É o finding visual mais gritante da auditoria.
**Fix:** re-tematizar as duas páginas para a paleta dourado/verde-kyro já definida em `src/index.css`.

### 24. Cartões de testemunhos com padrão visual diferente do resto do site
`Testemunhos.tsx:135,165-169` usa `rounded-3xl shadow-md` com barra dourada no topo, um terceiro idioma de cartão que não corresponde nem ao padrão `TestimonialsV1.tsx` nem ao grid hairline usado nas páginas de marca (ex. `src/pages/MarcaSofaPage.tsx:283-302`).
**Fix:** migrar `Testemunhos.tsx` para reutilizar o componente `TestimonialsV1`/o mesmo padrão hairline.

### 25. Opacidade da borda dourada do grid hairline inconsistente
`MarcaSofaPage.tsx`/`MarcaColchaoPage.tsx`/`MarcaCadeirasPage.tsx` usam `borderTop: "2px solid #D4AF37"` (100% opacidade); `MaterialPage.tsx:212,259` usa `rgba(212,175,55,0.55)` (55%) para o mesmo elemento semântico.
**Fix:** padronizar em `#D4AF37` a 100% (versão mais recente/deliberada) e atualizar `MaterialPage.tsx`.

**✅ Corrigido, mas na direção oposta à sugerida:** verificação mostrou que o padrão `rgba(...,0.55)` para cartões brancos de "Processo" é na verdade o dominante em **9 outros ficheiros** (`ServiceSnapshotStats.tsx`, `ServiceEliteGuarantee.tsx`, `ServiceBenefitsBar.tsx`, `FreguesiaServicePage.tsx`, `LocationServicePage.tsx`, `Packs.tsx`, `PricePage.tsx`, `ProblemPage.tsx`, `SofaVariantPage.tsx`), incluindo o próprio `SofaVariantPage.tsx` que serviu de referência para o hero das páginas de marca. As 3 páginas `Marca*Page.tsx` (criadas nesta sessão) é que eram o desvio. `MaterialPage.tsx` ficou inalterado; as 3 páginas de marca foram corrigidas para `rgba(212,175,55,0.55)`, e 2 outliers adicionais (`FreguesiaServicePage.tsx:542`, `LocationServicePage.tsx:710`, que já usavam 55% incorretamente num cartão branco) foram corrigidos para 100%.

### 26. 4 valores hex diferentes para "dourado escuro" (quase-duplicados)
`#B8912A` (`LocationServicePage.tsx:522,580`; `ServicePriceSection.tsx:76,412`; `ProblemPage.tsx:311,319`), `#A87C2A` (`GlossarioEstofos.tsx:273`; `NotFound.tsx:32`; `ErrorBoundary.tsx:76`), `#b8962e` (`BeforeAfterPage.tsx:125`), `#a07c1a` (admin).
**Fix:** adotar `#B8912A` como token único (`--gold-dark` em `src/index.css`) e substituir os restantes.

### 27. Botão CTA primário com duas famílias visuais não reconciliadas
Família A (hero/pill): `rounded-full`, gradiente `#C9A84C→#EDD96A→#C9A84C`, glow com blur. Família B (widget embutido, `ServicePriceSection.tsx:404-419`, `ServicePackBanner.tsx:113-122`): sem `rounded-*`, gradiente `#B8912A`, sem glow. Também `TopProgressBar.tsx:41` usa `#F0DC8A` em vez do `#EDD96A` usado em todos os outros gradientes idênticos.
**Fix:** decidir se a diferença é intencional (cantos retos só em widgets embutidos); se não for, padronizar na Família A.

**✅ Decisão: intencional, não alterado.** `ServicePriceSection.tsx` é um componente único reutilizado em milhares de páginas (é a calculadora de orçamento embutida em quase todo o site); os cantos retos e a paleta mais plana encaixam deliberadamente no contexto de "widget dentro de um cartão", distinto do CTA de hero/banner a solo. Mantidas as duas famílias. Apenas o desvio isolado e não-intencional (`TopProgressBar.tsx`'s `#F0DC8A`) foi corrigido para `#EDD96A`.

### 28. Tamanho/forma do "wrapper" de ícone inconsistente entre secções equivalentes
Pelo menos 5 combinações diferentes de tamanho/border-radius/opacidade para o mesmo elemento semântico ("ícone em círculo/quadrado dourado suave") entre `Marca*Page.tsx`, `Packs.tsx`, `ProblemPage.tsx`, `PackComboPage.tsx`, `PacksSitemap.tsx`.
**Fix:** adotar `w-9 h-9 rounded-xl`, fundo dourado 12%/borda 30% (padrão mais recente, `Marca*Page.tsx`) como canónico.

**✅ Decisão: não alterado.** Ao contrário do finding #25, aqui não existe um padrão dominante claro: as "5 combinações" servem contextos semânticos genuinamente diferentes (ícone de passo de processo vs. número de passo em timeline vs. avatar de testemunho vs. ícone de item incluído num pack), cada um com peso visual contextualmente justificável. Sem uma direção de fix defensável e de baixo risco, optou-se por não forçar uma uniformização especulativa neste finding de severidade cosmética.

### 29. Tracking/tamanho do overline desviado em vários ficheiros antigos
Canónico: `text-[10px] font-bold tracking-[0.28em] uppercase`. Desvios em `BeforeAfterPage.tsx:97`, `FAQEstofos.tsx:254,288`, `GlossarioEstofos.tsx:202,287`, `NotFound.tsx:67`, e as 3 páginas legais (`PoliticaDevolucoes.tsx:19`, `PoliticaPrivacidade.tsx:19`, `TermosCondicoes.tsx:19`).
**Fix:** padronizar todos para `text-[10px] font-bold tracking-[0.28em] uppercase`.

### 30. `chairPrices` em `QuizTypes.ts` é código morto
Nada importa este export; o motor real é `calcChairClean`/`calcChairWaterproof` em `quizHelpers.ts` (relacionado com finding #4).
**Fix:** apagar o export morto.

---

## 🟢 INFO

### 31. ✅ Resolvido — Em dash em `plainAnswer` só afeta o schema JSON-LD, não o DOM visível
`src/pages/FAQEstofos.tsx:24-114` (`plainAnswer`) alimenta apenas `FAQPage` JSON-LD (linha 137), não o `<answer>` renderizado. Confirmado em 2026-08-20: zero ocorrências de "—" no ficheiro atual.

### 32. Overline secundário ("Outros serviços" etc.) usa `0.26em` em vez de `0.28em`
Consistente em ~7 ficheiros (`LocationServicePage.tsx`, `FreguesiaServicePage.tsx`, `MaterialPage.tsx`, `PricePage.tsx`, `ProblemPage.tsx`, `ProblemCityPage.tsx`) — parece ser um nível secundário intencional, não drift acidental. Só a confirmar.

### 33. `MaterialPage.tsx:318` ("Explore mais") usa grid `gap-x-12 gap-y-10` em vez de hairline
Secção com pill-chips de links, não cartões — tratamento diferente é contextualmente razoável.

### 34. Páginas legais nunca usam `SectionHeader`
`PoliticaPrivacidade.tsx`, `PoliticaDevolucoes.tsx`, `TermosCondicoes.tsx` têm o seu próprio cabeçalho simplificado. Baixa prioridade (páginas de boilerplate legal são convencionalmente mais simples).

### 35. Rotas `/admin/*` com as mesmas violações (travessão, Sparkles) mas não públicas
`AdminDeslocacoes.tsx:31`, `AdminSeoPages.tsx:321`, `AdminManager.tsx:16,48,130,316` — gated, menor prioridade que os públicos.

---

## Resumo (auditoria 2026-08-20)

| Severidade | Nº de findings |
|---|---|
| 🔴 CRITICAL | 13 |
| 🟡 WARNING | 17 |
| 🟢 INFO | 5 |

**Os 5 mais impactantes:**
1. "Sob orçamento" cobrado errado em todos os canais de comunicação com o cliente (#1)
2. Falhas de envio de lead 100% silenciosas — negócio pode perder pedidos sem saber (#2)
3. Travessão banido em ~40+ pontos de conteúdo visível, incluindo dados que alimentam centenas de páginas (#8)
4. Ícone Sparkles banido em 5 pontos de alta visibilidade, incluindo o banner global (#9)
5. Schema LocalBusiness duplicado/conflituoso + ausente em ~900 páginas — prejudica SEO local (#5, #6)

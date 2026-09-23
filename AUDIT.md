# Auditoria — 2026-09-23 (capacidade para tráfego elevado + UX, medida em produção)

Segunda auditoria do dia, independente da anterior. Método: build limpo a partir de `git archive HEAD` numa pasta à parte (16.259 rotas, 17.432 ficheiros), `npm run typecheck` (0 erros), `npm run lint` (0 erros, 16 avisos), `vitest` (73 ficheiros, 2.269 testes verdes), Lighthouse mobile contra cleansolutions.com.pt em três páginas, e percurso completo em browser (homepage, landing, 404, quiz do início ao formulário, em 375px e 1440px). Nenhum ficheiro do site foi alterado.

## Nível atual, em resumo

O site está preparado para muito tráfego de leitura: tudo o que o público vê é HTML estático servido pelo Cloudflare (TTFB medido entre 60 e 210 ms, CLS 0, SEO 100 nas três páginas, consola limpa). O que pode ceder com tráfego elevado não é o site, é o que está à volta dele: o limite de ficheiros do Cloudflare Pages, a tabela de métricas sem retenção, e a Pages Function na homepage. Em UX, o percurso do quiz é curto (6 ecrãs, 2 campos) e coerente; os problemas são de pormenor.

| Página (mobile, produção) | Perf | LCP | TBT | CLS | A11y | Boas práticas | SEO |
|---|---|---|---|---|---|---|---|
| `/` | 78 | 4,0 s | 330 ms | 0 | 96 | 81 | 100 |
| `/limpeza-sofas` | 85 | 3,6 s | 200 ms | 0,008 | 94 | 81 | 100 |
| `/limpeza-sofas-porto` | 92 | 2,9 s | 150 ms | 0,007 | 94 | 81 | 100 |

## 🔴 O que cede primeiro com tráfego ou crescimento

### 1. Ficheiros no deploy: 17.432 de um limite de 20.000 do Cloudflare Pages
O `dist` tem 17.432 ficheiros. O Cloudflare Pages recusa deploys acima de 20.000 ficheiros. Cada cidade nova gera à volta de uma centena de páginas (6 serviços, 12 variantes, preço, material, marcas, freguesias), por isso a margem é de duas ou três cidades, não de tráfego. Ao mesmo tempo, o `public/` envia em cada deploy cerca de 190 ficheiros e 180 MB que nenhuma página referencia: `public/imagenshomepage/` (40 PNG, 104 MB), `public/Imagens 169/` (5, 12 MB), `public/images-optimized/` (17, 6,4 MB) e 127 ficheiros soltos dentro de `public/images/` (57 MB, incluindo `fotos hero/hero-veludo.png` com 7,7 MB e `colchoes/v2.png` com 7,2 MB). Verificado com `grep` por nome de ficheiro em `src`, `scripts` e `index.html`: zero referências.
**Fix:** tirar essas pastas e ficheiros de `public/` (para `docs/` ou fora do repositório). Não muda nada para o visitante, porque nunca são pedidos. Recupera ~190 ficheiros de margem e encurta o deploy. A margem estrutural continua a ser o limite de 20.000: qualquer plano de expansão de cidades tem de contar com isso.

### 2. `quiz_events` cresce sem retenção, e `error_logs` sem travão
Cada visita com consentimento escreve em `quiz_events` uma linha por página vista, uma por mudança de rota (`session_time`) e uma por clique de contacto, cada uma com cerca de 40 colunas (a fotografia de atribuição inteira vai em todas). Não existe nenhuma tarefa de limpeza nem agregação (sem `pg_cron`, sem `delete` antigo em nenhuma migração). Ordem de grandeza, assumindo 60% de consentimento, 3 linhas por visita e ~1 KB por linha com os cinco índices:

| Visitas/dia | Linhas/mês | Crescimento/mês |
|---|---|---|
| 1.000 | ~54.000 | ~55 MB |
| 5.000 | ~270.000 | ~270 MB |
| 20.000 | ~1.100.000 | ~1,1 GB |

O plano gratuito do Supabase tem 500 MB de base de dados; o Pro tem 8 GB. Não consegui confirmar o plano a partir do código. `error_logs` é pior no pico: `src/lib/errorTracking.ts` insere uma linha por cada erro de JavaScript de cada visitante, sem limite por sessão nem deduplicação por mensagem. Um erro sistémico (um script de terceiros a falhar, uma extensão de browser) vira um insert por página vista.
**Fix:** política de retenção em `quiz_events` (agregar por dia e apagar linhas com mais de 90 dias, num `pg_cron` ou numa função chamada pelo painel), e em `errorTracking.ts` um teto por sessão (3 a 5 erros) mais deduplicação por mensagem.

### 3. A Pages Function corre na homepage, e o plano gratuito corta aos 100.000 pedidos/dia
`functions/_middleware.ts` só existe para redirecionar `admin.cleansolutions.com.pt/`, mas o `_routes.json` faz com que corra em **todos** os pedidos a `/`, no domínio principal. Acima de 100.000 invocações por dia, o Cloudflare deixa de servir as rotas que a Function cobre, ou seja a homepage cai exatamente no dia de mais tráfego. É a única computação por pedido que o site tem.
**Fix:** substituir a Function por uma Redirect Rule do Cloudflare (Rules → Redirect Rules, gratuito, com condição de hostname) e apagar `functions/` e `_routes.json`. O site passa a ser 100% estático.

### 4. A CSP em modo de relatório já está a acusar o Pixel da Meta
Observado em produção, na consola: `Sending form data to 'https://www.facebook.com/tr/' violates ... "form-action 'self'"`. O Pixel envia eventos por POST de formulário quando o `sendBeacon` não serve. No dia em que o cabeçalho passar a `Content-Security-Policy`, as conversões da Meta param sem erro visível.
**Fix:** acrescentar `https://www.facebook.com` a `form-action` no `public/_headers` antes de trocar o nome do cabeçalho.

## 🟡 Desempenho

### 5. A homepage carrega 743 KB de imagem a mais (LCP 4,0 s)
O LCP é `hero-sofa-mobile-extended.webp`, 887×1462 (161 KB) servido a 412 px de largura. As seis imagens do carrossel de serviços têm 1900 px e são mostradas a 376 px; as quatro do bloco "4 problemas" têm 1078 px e são mostradas a 413 px. A homepage pesa 1.227 KB contra 519 a 669 KB nas landing pages. O helper `src/lib/responsiveImages.ts` já existe, mas `HeroV1.tsx`, `Services.tsx` e `PainPointsSolutionsV1.tsx` não o usam.
**Fix:** variantes de 480 e 768 px com `srcset` nestes três componentes. É a única alteração com efeito direto no LCP da página mais visitada.

### 6. CSS a bloquear 150 ms e 19 KB sem uso
`index-*.css` (148 KB, 24 KB gzip) é render-blocking em todas as páginas e 19 KB nunca são usados. Baixa prioridade: o ganho é de 150 ms no FCP.

## 🟡 UX (percorrido em mobile e desktop)

### 7. O quiz pede a localização ao browser no instante em que abre
`QuizStepLocation.tsx` chama `detectServiceCity` no `useEffect` de montagem, que corre `navigator.geolocation.getCurrentPosition` logo ali. Quem abre o quiz pela primeira vez vê um pedido de permissão do sistema antes de ler uma linha; quem recusa vê como primeira mensagem "Não foi possível obter a localização" (foi o que aconteceu no teste). No iOS a recusa fica memorizada para o domínio, e o botão "Usar a minha localização" deixa de funcionar nas visitas seguintes.
**Fix:** só pedir a localização quando a pessoa toca em "Usar a minha localização". A pesquisa por nome já resolve o caso comum em dois toques.

### 8. Na primeira visita, o aviso de cookies tapa a barra fixa de WhatsApp
`CookieBanner` (`z-[90]`) e `MobileStickyBar` (`z-30`) ficam os dois colados ao fundo. Até a pessoa decidir, o CTA fixo de WhatsApp não existe. O botão do hero continua visível, por isso não é bloqueante.
**Fix:** um banner de uma linha, ou subir a barra fixa acima do banner enquanto ele está aberto.

### 9. O upsell final anuncia "Tapete: Limpe 5 m², pague 4"
`QuizComboUpsellScreen.tsx:393`. Desde 2026-09-06 os tapetes nunca têm preço e o quiz deixou de estimar por m². Uma oferta por área contradiz essa decisão e cria uma expectativa de preço por m² no ecrã seguinte. **Confirmar com o dono** se a oferta está em vigor antes de mexer.

### 10. Acessibilidade: três falhas concretas do Lighthouse, nas mesmas páginas todas
- `CustomerReviewCard.tsx:22`: `aria-label="5 de 5 estrelas"` num `<div>` sem `role`, o que é proibido; passa com `role="img"`.
- O dourado `#D4AF37` em fundo claro não chega ao contraste mínimo (cerca de 2,1:1). Aparece nos rótulos em maiúsculas e nas palavras destacadas do `SectionHeader.tsx` sempre que a secção é clara. Em fundo escuro passa. O `#aa862b` já usado nas estrelas passa em fundo claro.
- `HomeHeroTrust.tsx:20`: o `aria-label` da ligação às avaliações não contém o texto visível, o que confunde comandos de voz.
- O carrossel de serviços da homepage repete os seis `<h3>` três vezes (clones), sem `aria-hidden` nos clones: um leitor de ecrã lê 18 títulos.

## 🟡 SEO e dados estruturados

### 11. A homepage é a única página com o schema escrito à mão, e está desatualizado
`index.html` mantém três blocos JSON-LD estáticos que o prerender não substitui na rota `/`. O `LocalBusiness` tem `sameAs` a apontar para `instagram.com/kyroclean.pt` e `facebook.com/kyroclean`, perfis que **não existem** (o dono confirmou em 2026-09-17 que não há nenhum, e `business.ts` tem `BUSINESS_PROFILES = []`), mais o próprio site como referência. O `areaServed` não tem Aveiro, Coimbra nem Faro; o catálogo diz "Limpeza de Carpetes"; o bloco `Service` declara `price` exato (49, 20, 59) em vez de `minPrice`, como a fase 2 do GEO corrigiu em todas as outras páginas. O `twitter:site` `@KyroClean` também não existe. O cliente remove o bloco marcado com `data-ssr-schema` ao hidratar, mas os motores leem o HTML estático, e a homepage é a página mais rastreada do site.
**Fix:** o prerender emitir para `/` o mesmo grafo de `seoSchema.ts` que emite para as outras páginas, e apagar os três blocos do `index.html`.

### 12. `lastmod` continua ausente em produção
16.231 dos 16.257 URLs dos sitemaps em produção saem sem `lastmod`; só os 26 do blog têm. É o clone shallow do Cloudflare, já descrito no `CLAUDE.md`. Continua por resolver do lado do Cloudflare.

### 13. Sem `hreflang` nas 24 páginas EN
As páginas `/en/*` têm `lang="en"` mas não declaram alternância com as páginas PT. Baixa prioridade enquanto o `/en` não tiver decisão.

## 🟢 Confirmado a funcionar (não precisa de ação)

- reCAPTCHA v3 está ligado ao `submit-lead` (verificação no servidor), o que fecha o achado #5 da auditoria de 2026-09-08. `submit-lead` e `send-lead-email` têm rate limit de 8 pedidos por 10 minutos por IP.
- Um só `gtag.js`, Consent Mode v2 por omissão negado, Pixel da Meta só após consentimento: confirmado na rede, com e sem consentimento.
- Cabeçalhos de segurança em produção (HSTS, X-Frame-Options, Permissions-Policy, CSP report-only) chegam como o `_headers` define.
- Assets com hash em `immutable` por um ano; `/images/*` com 4 h no edge.
- 404 real (HTTP 404) para rotas inexistentes, com página útil (ligações, telefone).
- Percurso do quiz: localidade, serviço, tratamento, quantidades, upsell de proteção com "Continuar sem extras", upsell combinado, contacto com dois campos (`type="tel"`, `autoComplete`). Sem erros na consola em nenhum passo.

---
---

# Auditoria — 2026-09-08 (código: dead code, segurança, type-safety, arquitetura)

Auditoria realizada com 4 agentes paralelos, cada um numa frente diferente: dead code/duplicação, segurança, type-safety/correção, arquitetura/performance. Apenas leitura — nenhum ficheiro foi alterado durante a investigação. Esta auditoria é **diferente** da de 2026-08-20 mais abaixo neste documento (aquela focou-se em layout/design/SEO/conteúdo); esta foca-se em qualidade e segurança do código em `src/`.

Severidade: **CRITICAL** (bug real que afeta dinheiro, dados de clientes, ou segurança agora) · **WARNING** (problema real, não urgente) · **INFO** (vale a pena saber, baixa prioridade).

---

## Estado em 2026-09-14 (reverificado no código, não assumido)

- **#1 RLS aberta nas tabelas `leads`/`quiz_events`/`error_logs`: ✅ corrigido.** A migração `20260908000000_restrict_admin_tables_to_authenticated.sql` restringe select/update/delete a `authenticated`; o insert público continua aberto só onde o quiz precisa.
- **#2 e #3 password de admin no bundle e fallback `'kyro2025'`: ✅ corrigidos.** `AdminPanel.tsx` usa `supabase.auth.signInWithPassword`; já não existe nenhum `ADMIN_PASSWORD` nem password literal em `src/`.
- **#4 sofá 4+ lugares no upsell: ✅ corrigido** (ver "Correções aplicadas" abaixo).
- **#5 reCAPTCHA existe mas não está ligado: 🟡 continua aberto.** `src/lib/recaptcha.ts` é importado por zero ficheiros. **Não apagar este ficheiro** — a correção é ligá-lo a `submissionService.ts`, não removê-lo.
- **#10 `QuizForm.tsx` com responsabilidades a mais: parcialmente resolvido.** Desceu de 1224 para 972 linhas com a extração dos hooks `use-quiz-*`.
### Novo finding (2026-09-14): os leads do quiz continuam a entrar na base de dados, mas nenhuma rota chega à UI que os lê

`src/services/submissionService.ts:99` continua a inserir cada pedido em `public.leads`. A única interface que lê, edita ou apaga essa tabela é `src/pages/AdminDashboard.tsx` — e esse componente **não está registado em nenhuma rota** de `App.tsx`. A aba "CRM" atual (`src/pages/admin/CrmPanel.tsx`) lê `service_requests`, que é outra tabela; `QuizMetricsPanel.tsx` só conta linhas de `leads` para o funil, não as mostra.

Consequência prática: os pedidos continuam a chegar por Formspree (email), por isso nada se perde do lado comercial, mas a cópia em base de dados está a acumular sem forma de ser consultada no painel.

**Não apagar `AdminDashboard.tsx` como "código morto"** sem decidir isto primeiro. É código órfão, não código inútil: a tabela que ele gere está viva. As opções são voltar a ligá-lo como aba do painel, ou aposentar a tabela `leads` de forma explícita. Qualquer das duas é uma decisão do dono.

- **Restantes findings: não reverificados** nesta passagem. Verificar antes de agir, não assumir que continuam válidos.

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

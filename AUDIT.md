# Auditoria Completa — Kyro Clean Solutions

Auditoria realizada com 8 agentes paralelos (layout, código, inconsistências/incoerências, funcionalidade/otimização para o cliente, mobile, SEO, design, coerência de texto). Apenas leitura — nenhum ficheiro foi alterado durante a auditoria. Findings ordenados por severidade; cada um inclui ficheiro:linha e uma correção concreta.

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

### 26. 4 valores hex diferentes para "dourado escuro" (quase-duplicados)
`#B8912A` (`LocationServicePage.tsx:522,580`; `ServicePriceSection.tsx:76,412`; `ProblemPage.tsx:311,319`), `#A87C2A` (`GlossarioEstofos.tsx:273`; `NotFound.tsx:32`; `ErrorBoundary.tsx:76`), `#b8962e` (`BeforeAfterPage.tsx:125`), `#a07c1a` (admin).
**Fix:** adotar `#B8912A` como token único (`--gold-dark` em `src/index.css`) e substituir os restantes.

### 27. Botão CTA primário com duas famílias visuais não reconciliadas
Família A (hero/pill): `rounded-full`, gradiente `#C9A84C→#EDD96A→#C9A84C`, glow com blur. Família B (widget embutido, `ServicePriceSection.tsx:404-419`, `ServicePackBanner.tsx:113-122`): sem `rounded-*`, gradiente `#B8912A`, sem glow. Também `TopProgressBar.tsx:41` usa `#F0DC8A` em vez do `#EDD96A` usado em todos os outros gradientes idênticos.
**Fix:** decidir se a diferença é intencional (cantos retos só em widgets embutidos); se não for, padronizar na Família A.

### 28. Tamanho/forma do "wrapper" de ícone inconsistente entre secções equivalentes
Pelo menos 5 combinações diferentes de tamanho/border-radius/opacidade para o mesmo elemento semântico ("ícone em círculo/quadrado dourado suave") entre `Marca*Page.tsx`, `Packs.tsx`, `ProblemPage.tsx`, `PackComboPage.tsx`, `PacksSitemap.tsx`.
**Fix:** adotar `w-9 h-9 rounded-xl`, fundo dourado 12%/borda 30% (padrão mais recente, `Marca*Page.tsx`) como canónico.

### 29. Tracking/tamanho do overline desviado em vários ficheiros antigos
Canónico: `text-[10px] font-bold tracking-[0.28em] uppercase`. Desvios em `BeforeAfterPage.tsx:97`, `FAQEstofos.tsx:254,288`, `GlossarioEstofos.tsx:202,287`, `NotFound.tsx:67`, e as 3 páginas legais (`PoliticaDevolucoes.tsx:19`, `PoliticaPrivacidade.tsx:19`, `TermosCondicoes.tsx:19`).
**Fix:** padronizar todos para `text-[10px] font-bold tracking-[0.28em] uppercase`.

### 30. `chairPrices` em `QuizTypes.ts` é código morto
Nada importa este export; o motor real é `calcChairClean`/`calcChairWaterproof` em `quizHelpers.ts` (relacionado com finding #4).
**Fix:** apagar o export morto.

---

## 🟢 INFO

### 31. Em dash em `plainAnswer` só afeta o schema JSON-LD, não o DOM visível
`src/pages/FAQEstofos.tsx:24-114` (`plainAnswer`) alimenta apenas `FAQPage` JSON-LD (linha 137), não o `<answer>` renderizado. Vale a pena limpar porque o Google pode mostrar este texto em rich snippets, mas não é uma violação visível em sentido estrito.

### 32. Overline secundário ("Outros serviços" etc.) usa `0.26em` em vez de `0.28em`
Consistente em ~7 ficheiros (`LocationServicePage.tsx`, `FreguesiaServicePage.tsx`, `MaterialPage.tsx`, `PricePage.tsx`, `ProblemPage.tsx`, `ProblemCityPage.tsx`) — parece ser um nível secundário intencional, não drift acidental. Só a confirmar.

### 33. `MaterialPage.tsx:318` ("Explore mais") usa grid `gap-x-12 gap-y-10` em vez de hairline
Secção com pill-chips de links, não cartões — tratamento diferente é contextualmente razoável.

### 34. Páginas legais nunca usam `SectionHeader`
`PoliticaPrivacidade.tsx`, `PoliticaDevolucoes.tsx`, `TermosCondicoes.tsx` têm o seu próprio cabeçalho simplificado. Baixa prioridade (páginas de boilerplate legal são convencionalmente mais simples).

### 35. Rotas `/admin/*` com as mesmas violações (travessão, Sparkles) mas não públicas
`AdminDeslocacoes.tsx:31`, `AdminSeoPages.tsx:321`, `AdminManager.tsx:16,48,130,316` — gated, menor prioridade que os públicos.

---

## Resumo

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

# Kyro Clean Solutions — Full Project Context

> Cola isto no início de uma nova conversa para retomar o trabalho sem perder nada.

---

## Projeto

**Kyro Clean Solutions** — site React/TypeScript de landing + quiz de orçamento para empresa de limpeza de estofos em Porto, Portugal.
- Área de serviço: Norte e Centro de Portugal
- WhatsApp: 351925530647
- Email: cleansolutions.pt25@gmail.com

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + react-i18next + Supabase (CRM PostgreSQL) + Formspree (captura principal) + React Router

**Raiz do projeto:** `C:\Users\im a god bruh\Downloads\spotless-pro-flow-main\`

---

## Design Tokens

| Token | Valor |
|---|---|
| Gold (Kyro) | `#D4AF37` / alias Tailwind `text-gold`, `bg-gold`, `border-gold` |
| Dark bg | `#12121e` / `#13132B` (modal) |
| Lavender bg | `#F2EBFF` |
| Heading font | Playfair Display (`font-playfair`) |
| Container padrão | `max-w-7xl mx-auto px-5 sm:px-6 lg:px-8` |
| Botão primário | `bg-gradient-to-r from-gold to-[#d4c57b]` texto `#12121e` font-bold, shadow `0_4px_28px_rgba(212,175,55,0.40)` |
| Borda card hover | `hover:border-gold/50` |

---

## Rotas

| Rota | Página |
|---|---|
| `/` | Index (homepage) |
| `/limpeza-sofas` | LimpezaSofas |
| `/limpeza-colchoes` | LimpezaColchoes |
| `/limpeza-tapetes` | LimpezaTapetes |
| `/limpeza-alcatifas` | LimpezaAlcatifas |
| `/limpeza-cadeiras` | LimpezaCadeiras |
| `/impermeabilizacao` | Impermeabilizacao |
| `/obrigado` | Obrigado (pós-submissão) |
| `/blog/*` | Artigos de blog |

---

## Quiz Form — Arquitetura Completa

**Ficheiro principal:** `src/components/QuizForm.tsx`
**Sub-componentes:** `src/components/quiz/`

### Fluxo de passos

```
Step 0 — Localização (cards Porto/Lisboa/Braga + autocomplete)
Step 1 — Seleção de serviço (sofa/mattress/carpet/chairs/headboard/other)
Step 2 — Tipo de tratamento (cleaning/waterproofing/both) — SALTADO para carpet/chairs/headboard/other
Step 3 — Quantidades / detalhes do serviço
Step 4 — Seletor de vaga/calendário
── ECRÃ DE UPSELL (intercetado entre step 4 e 5, só uma vez) ──
Step 5 — Formulário de contacto (nome + telefone + foto)
→ Submissão → /obrigado
```

**Regra de navegação:**
- `shouldSkipServiceType` = carpet / chairs / headboard / other → salta step 2
- Back de step 3 → step 1 (se shouldSkipServiceType), senão step 2
- Back de step 5 → volta ao ecrã de upsell (se `upsellShown=true`)
- Step 4 (calendário) usa `!showUpsell` na condição — ao activar upsell, calendário some do DOM

---

## Sub-componentes do Quiz (`src/components/quiz/`)

| Ficheiro | Responsabilidade |
|---|---|
| `QuizTypes.ts` | Interfaces + todas as tabelas de preços |
| `QuizStep1Service.tsx` | Grelha de serviços com imagens |
| `ServiceTypeSelector.tsx` | Cards Higienização / Impermeabilização / Pack |
| `QuizStep2Sofa.tsx` | Config sofás (qty [-/+], toggle Pack por item) |
| `QuizStep2Mattress.tsx` | Config colchões (qty [-/+], toggle Pack por item) |
| `QuizStep2Carpet.tsx` | Config tapetes |
| `QuizStep2Chairs.tsx` | Config cadeiras |
| `QuizStep2Headboard.tsx` | Config cabeceiras |
| `QuizStep2Other.tsx` | Config outros |
| `QuizStepCalendar.tsx` | Seletor de slot |
| `index.ts` | Re-exports de todos os sub-componentes e tipos |

---

## Tabelas de Preços (`QuizTypes.ts`) — VALORES SAGRADOS

```ts
// SOFÁS
sofaPrices = [
  { id: '1-lugar',    label: '1 Lugar',    cleaningPrice: 49, waterproofingPrice: 49, bothPrice: 79,  originalBothPrice: 98  },
  { id: '2-lugares',  label: '2 Lugares',  cleaningPrice: 69, waterproofingPrice: 59, bothPrice: 89,  originalBothPrice: 128 },
  { id: '3-lugares',  label: '3 Lugares',  cleaningPrice: 79, waterproofingPrice: 69, bothPrice: 99,  originalBothPrice: 148 },
  { id: '4+-lugares', label: '4+ Lugares', cleaningPrice: 'Sob orçamento', waterproofingPrice: 'Sob orçamento', bothPrice: 'Sob orçamento' },
]
sofaChaisePrice = { cleaning: 10, waterproofing: 10 }

// COLCHÕES — não alterar sem aprovação
mattressPrices = [
  { id: 'solteiro', label: 'Solteiro',     cleaningPrice: 49, waterproofingPrice: 45, bothPrice: 79,  originalBothPrice: 94  },
  { id: 'casal',    label: 'Casal',        cleaningPrice: 59, waterproofingPrice: 50, bothPrice: 89,  originalBothPrice: 109 },
  { id: 'king',     label: 'King / Queen', cleaningPrice: 69, waterproofingPrice: 55, bothPrice: 99,  originalBothPrice: 124 },
]

// CADEIRAS
≤3  cadeiras → 17.5€/cad
≤6  cadeiras → 15€/cad
≤10 cadeiras → 12.5€/cad
>10           → sob orçamento
waterproofing → +7.5€/cad

// TAPETES
≤5m²  → 10€/m²
≤10m² → 8€/m²
≤15m² → 7€/m²
>15m² → sob orçamento

// LOCALIZAÇÃO
Porto → 0€, Matosinhos/Maia/Gaia/Gondomar/Valongo/Trofa/Santo Tirso/Espinho → 5€
Braga/Guimarães/Póvoa/Vila do Conde/Paredes/Penafiel/Lousada/Paços/Felgueiras/Arouca/Aveiro → 10€
Lisboa/Cascais/Oeiras/Sintra/Almada/Setúbal → 15€
isFreeTravel: quando calculateServicePrice >= 150€
```

---

## Interfaces TypeScript Chave

```ts
// QuizTypes.ts
interface PriceOption {
  id: string; label: string;
  cleaningPrice: number | string;
  waterproofingPrice: number | string;
  bothPrice: number | string;
  originalBothPrice?: number | string;  // soma cleaning+waterproofing para risco
}

// QuizStep2Sofa.tsx (exportado)
export interface SofaItem {
  sizeId: string;
  qty: number;
  packEnabled: boolean;   // toggle de Proteção Total por item
}

// QuizStep2Mattress.tsx (exportado)
export interface MattressItem {
  sizeId: string;
  qty: number;
  waterproof: boolean;    // legacy
  packEnabled: boolean;   // toggle de Proteção Total por item
}

// QuizForm.tsx (local)
interface UpsellItemConfig {
  id: string;             // 'sofa' | 'mattress' | 'carpet' | 'chairs'
  sofaSize?: string;
  mattressSize?: string;
  carpetArea?: string;
  chairQty?: string;
  qty?: number;
  price: number;
  label: string;
  waterproof?: boolean;
  waterproofPrice?: number;
}
```

---

## Lógica de Preços e Descontos

```ts
// Preço do serviço principal — calculateServicePrice (useMemo)
// Sofá: usa item.packEnabled como prioridade (bothPrice se ON, else cleaning/waterproofing)
// Colchão: idem com item.packEnabled
// 4+ lugares: não soma (string, não number)

// Deslocação
travelCost = locationPrices[formData.location] ?? 0
isFreeTravel = calculateServicePrice >= 150
finalTravelCost = isFreeTravel ? 0 : travelCost

// Total
totalPrice = calculateServicePrice + upsellItemsTotal + finalTravelCost

// Descontos — NÃO ACUMULAM
isDiscountActive = countdown > 0          // timer 10min
discountedPrice = Math.round(totalPrice * 0.95)    // −5% timer

packDiscountActive = upsellItems.length > 0 && totalPrice > 200  // gatilho 200€
packDiscountPct = 0.10
packDiscountedPrice = Math.round(totalPrice * 0.90)  // −10% pack (substitui timer)

// Todos os preços exibidos usam Math.round() — números inteiros
```

---

## Toggle de Proteção Total (Pack por Item)

Implementado em **Sofás** e **Colchões**, funciona de forma idêntica:

```
serviceType === 'both' (Pack global):
  → Todos os cards dourados (borda gold, badge VIP, preço riscado)
  → Preços: bothPrice (79/89/99€)
  → Sem toggle individual — Pack já incluído
  → Banner: "🏆 Pack Proteção Total VIP — Poupa até X€ vs. separado"

serviceType === 'cleaning' ou 'waterproofing':
  → Cards neutros enquanto qty = 0
  → Ao adicionar qty > 0: toggle "Adicionar Proteção Total (+X€)" aparece abaixo
  → Toggle ON → borda dourada, badge VIP, preço salta para bothPrice
  → Toggle OFF → reverte instantaneamente

defaultPack = (serviceType === 'both')  → novos itens herdam estado global
upgradeAmt = bothPrice - basePrice  (calculado por item)

Sofá 1L: +30€ | 2L: +20€ | 3L: +20€
Colchão: +30€ em todos os tamanhos
```

---

## Estados Principais do QuizForm

```ts
// Navegação
currentStep: number                   // 0–5
showUpsell: boolean                   // ecrã de upsell visível
upsellShown: boolean                  // já foi mostrado (evita re-intercetar)
upsellSubStep: 'select' | 'config'   // sub-passo dentro do upsell
showSummary: boolean                  // ecrã de resumo (actualmente false hardcoded)

// Itens
sofaItems: SofaItem[]
mattressItems: MattressItem[]
upsellItems: UpsellItemConfig[]

// Upsell config em curso
pendingUpsellId: string | null
pendingMattressSize: string           // reutilizado para sofá no upsell
pendingMattressQty: number            // reutilizado para sofá no upsell
pendingCarpetArea: string
pendingChairQty: string
pendingChairQtyNum: number
pendingWaterproof: boolean

// Preço e UI
countdown: number                     // timer 10min em segundos (localStorage 'kyro_timer_expiry')
displayPrice: number                  // preço animado (ticker, step de 35ms)
hypoallergenic: boolean | null

// Reset ao trocar serviço no step 1:
setSofaItems([]), setMattressItems([]), setUpsellItems([]), setUpsellShown(false)
```

---

## Ticker de Preço (Header Sticky)

```tsx
// Visível quando:
(totalPrice > 0 || hasSobOrcamento)
&& (showUpsell || (currentStep !== 1 && currentStep !== 2 && currentStep !== 4))

// hasSobOrcamento = sofaItems.some(i => i.sizeId === '4+-lugares' && i.qty > 0)
// Quando hasSobOrcamento: mostra "X€ + Sob Orçamento" ou apenas "Sob Orçamento"

// Estilo: sticky top-0 z-20, bg-[#13132B] sólido, pr-8 (afastamento borda direita)
// Preço: sempre style={{ color: '#D4AF37' }} — nasce dourado, nunca muda de cor
// Animação: displayPrice sobe/desce em incrementos de Math.ceil(diff/6), a cada 35ms
// Scroll reset: scrollContainerRef.current?.scrollTo({ top: 0 }) em cada mudança de step/showUpsell
```

---

## Ecrã de Upsell — Pack Família

```
Gatilho: após step 4 (calendário), só uma vez (upsellShown)

Sub-passo 'select':
  - Barra de progresso: totalPrice / 200 × 100%
  - Canto esq: "X€ no carrinho" (Math.round(totalPrice))
  - Canto dir: ">200€ → 10%"
  - Texto: "Faltam apenas X€ para ganhares 10% de desconto imediato!"
  - Quando ≥200€: "🎉 Pack Família: 10% de desconto ativado!"
  - Cards de sugestão (por ordem de prioridade):
      Sofá → Colchão → Tapete → Cadeiras
      (o serviço principal do utilizador é excluído automaticamente)
  - Botões: [Voltar (outline)] [Continuar (dourado, flex-1)]
  - Voltar: fecha upsell → regressa ao calendário (step 4)

Sub-passo 'config':
  - Sofá: seletor de tamanho (1/2/3 lugares) + qty stepper + botão Adicionar
  - Colchão: seletor tamanho + qty stepper + toggle impermeabilização
  - Tapete: input área m² + estimativa em tempo real
  - Cadeiras: stepper qty + toggle impermeabilização (+5€/cad)
  - Botão "Voltar" → 'select'
```

---

## ServiceTypeSelector

```tsx
// Títulos das opções:
'cleaning'      → 'Higienização Profunda'         // ← terminologia final
'waterproofing' → 'Impermeabilização Premium'
'both'          → 'PACK PROTEÇÃO TOTAL'  (badge "O MAIS SOLICITADO")

// Pack só aparece quando packPrice !== undefined
// Para carpet/chairs/headboard/other → packPrice=undefined → Pack escondido
// Para sofa e mattress → packPrice=79 → Pack visível

// Props: cleaningPrice, waterproofingPrice, packPrice, waterproofingDesc
```

---

## Toggle na QuizStep2Sofa / QuizStep2Mattress

```tsx
// Texto quando toggle ATIVO:
'Proteção Total ativa — Higienização + Impermeabilização'

// Texto quando toggle INATIVO (serviceType = cleaning):
`Adicionar Proteção Total (+${upgradeAmt}€)`

// 4+ Lugares (Sofá): sem toggle, sem preço, mensagem:
'Um técnico irá preparar o seu orçamento personalizado no próximo passo.'
```

---

## Submissão

```ts
// 1. Formspree (primário)
POST https://formspree.io/f/xreozzbp  (suporta fotos)

// 2. Supabase (backup CRM silencioso)
supabase.from('leads').insert({
  name, phone, email, service, service_type,
  details,  // buildDetailsSummary()
  location, value, slot, booking_id, message,
  status: 'pending', source: 'Website', priority: 'Quente',
  notes,    // "Sofá: 2 Lugares + Pack | Colchão: Casal"
})

// 3. sessionStorage → /obrigado
kyro_booking_id, kyro_wa_url, kyro_summary

// Em caso de erro: toast com links diretos WhatsApp + Email
```

---

## Tudo o que foi feito — Sessão 1

1. **QuizStep2Mattress** — clone completo do padrão Sofá: qty [-/+], toggle Pack por item, badge VIP, strikethrough
2. **Preços sagrados dos colchões**: 49/59/69 cleaning, 45/50/55 waterproofing, 79/89/99 pack
3. **ServiceTypeSelector** — reescrita: títulos, badge "O MAIS SOLICITADO", filtro Pack por packPrice
4. **Ticker de preço** — corrigido: z-20, bg sólido, `style={{ color: '#D4AF37' }}`, pr-8, visível na página de Upsell
5. **Step 1 limpo** — ticker oculto em step 1; reset de sofaItems+mattressItems+upsellItems ao trocar serviço
6. **Sofa toggle** — QuizStep2Sofa reescrita com toggle Pack por item (idêntica ao colchão)
7. **SofaItem exportado** de QuizStep2Sofa, importado em QuizForm (sem duplicação)
8. **Sofá no Pack Família** — incluído na lista de sugestões (prioridade máxima), config sub-step adicionado
9. **Upsell sofaSize** — campo `sofaSize?` em UpsellItemConfig, display correcto no resumo
10. **Terminologia** — "Limpeza e Lavagem Profunda" → "Higienização Profunda" em todo o projecto
11. **Sofa bothPrices corrigidos**: 79/89/99 (era 79/109/139)
12. **Arredondamento global** — todos os preços exibidos usam Math.round() (inteiros)
13. **Pack Família** — gatilho 100€ → 200€; barra mostra valor real do carrinho sincronizado com ticker
14. **Anti-acumulação** — Pack 10% substitui (não acumula com) timer 5%
15. **Botão Voltar no Upsell** — layout horizontal [Voltar outline] + [Continuar dourado flex-1]
16. **Scroll reset** — scrollContainerRef + useEffect → scrollTo top em cada transição de passo
17. **Fix sobreposição step 4 + Upsell** — `{currentStep === 4 && !showUpsell && ...}`
18. **hasSobOrcamento** — ticker mostra "X€ + Sob Orçamento" quando 4+ lugares activo
19. **Botão Continuar** — shadow reforçada `rgba(212,175,55,0.40)` → `0.55` no hover

---

## Tudo o que foi feito — Sessão 2

20. **Services.tsx — Carrossel de Luxo** — grid 2×3 estático substituído por carrossel horizontal infinito
    - 3 cards desktop / 2 tablet / 1.2 mobile (próximo card espreita à direita)
    - Cards full-bleed portrait (358px altura fixa), imagem ocupa 100% do card
    - Card "hero" (centro/activo): `scale(1.03)`, `opacity 1`, sombra gold + linha gold no fundo
    - Cards laterais: `scale(1)`, `opacity 0.76`; cards distantes: `scale(0.96)`, `opacity 0.42`
    - Setas glassmorphism (fundo escuro + blur + borda gold) nas laterais
    - Dots gold: activo alarga para 22px wide com glow, inativos 7px circulares
    - Autoplay 4.6s, easing `cubic-bezier(0.33, 1, 0.68, 1)`, pause on hover/touch

21. **Services.tsx — Loop Infinito Robusto** — fix crítico do `onTransitionEnd`
    - Bug: eventos `transitionend` de filhos (scale/opacity dos cards) subiam para o track via bubbling e disparavam o reset silencioso na altura errada
    - Fix: duas guardas no handler: `e.target !== e.currentTarget` + `e.propertyName !== 'transform'`
    - Extended array: `[last 3, ...6 reais, first 3]` = 12 items; offsetIndex começa em `CLONES=3`
    - Reset silencioso: quando offsetIndex ≥ CLONES+N → salta para CLONES; quando < CLONES → salta para CLONES+N-1
    - Re-enable animação com `setTimeout(30ms)` após reset silencioso

22. **Services.tsx — Contraste e Legibilidade Premium**
    - Gradiente de 4 paragens (inline style): `97% → 85% → 50% → 14% → transparent` — fundo do texto impenetrável em qualquer foto
    - Overlay hover: segunda camada que faz `opacity-0` no hover, revelando mais da imagem sem comprometer leitura
    - Título: `font-semibold` → `font-bold`, `text-base` → `text-[15px] md:text-[17px]`, textShadow duplo (próximo + halo difuso)
    - Preço: `text-white/55` → `rgba(255,255,255,0.88)`, `font-medium` → `font-semibold`, textShadow própria

---

## Arquitectura do Carrossel (`Services.tsx`)

```ts
// Constantes
GAP         = 28      // px entre cards
AUTOPLAY_MS = 4600    // ms por slide
SLIDE_MS    = 720     // duração da transição
CLONES      = 3       // items clonados em cada extremo
N           = 6       // items reais

// Layout responsivo
getLayout(w): { visibleCount: 3|2|1.2, cardWidth }
  cardWidth = (containerW - (ceil(vc)-1) * GAP) / vc

// Hero slot (qual posição da janela visível é "centro")
heroOffset(vc) = floor((floor(vc)-1) / 2)
  desktop(3) → 1 (card do meio)
  tablet(2)  → 0 (card da esquerda)
  mobile(1.2)→ 0 (único card completo)

// translateX (left-aligned)
translateX = -(offsetIndex * (cardWidth + GAP))

// Prominence por distância ao heroExtIdx
dist=0 → "hero" | dist=1 → "side" | dist≥2 → "far"
```

---

---

## Tudo o que foi feito — Sessão 3

23. **Fluxo de Decisão Sofá/Colchão — Step 2 restaurado**
    - Sofá e Colchão deixaram de saltar o passo 2 (`shouldSkipServiceType` removidos)
    - Step 2 mostra agora 2 cards grandes: **"Higienização Profunda"** e **"Impermeabilização Premium"**
    - Card "Pack Proteção Total" **removido** do step 2 — passa a ser upsell inline no step 3
    - Ao trocar o tipo de tratamento, `sofaItems` e `mattressItems` são resetados

24. **Upsell Cruzado Inline (Step 3 — por item)**
    - Se serviceType = `cleaning` → toggle por item: **"Adicionar Proteção Total VIP (+30€/unid)"**
    - Se serviceType = `waterproofing` → toggle por item: **"Adicionar Higienização Profunda (+30€/unid)"**
    - Visual VIP quando ativo: borda dourada + badge VIP + preço base **riscado** + preço novo em gold

25. **Matemática de Preços Refatorada (Sofá + Colchão)**
    - Base price = `cleaningPrice` (se Higienização) ou `waterproofingPrice` (se Impermeabilização)
    - Pack ativo = base + 30€ fixos (não usa mais `bothPrice` da tabela)
    - `calculateServicePrice` atualizado para ambos os serviços com a mesma lógica

26. **Limpeza da Interface**
    - Caixas "Total Estimado" removidas de `QuizStep2Sofa.tsx` e `QuizStep2Mattress.tsx`
    - Link de escape WhatsApp removido do rodapé — só o botão "Continuar" permanece

---

## Estado do Fluxo do Quiz (atualizado)

```
Step 0 — Localização (cards Porto/Lisboa/Braga + autocomplete)
Step 1 — Seleção de serviço (sofa/mattress/carpet/chairs/headboard/other)
Step 2 — Tipo de tratamento:
  - Sofá/Colchão: 2 cards grandes (Higienização / Impermeabilização)  ← NOVO
  - carpet/chairs/headboard/other → SALTADO (serviceType='cleaning' auto)
Step 3 — Quantidades / detalhes do serviço
  - Sofá/Colchão: upsell cruzado inline por item (+30€ fixos)          ← NOVO
── ECRÃ DE UPSELL (Pack Família, intercetado entre step 3 e 4) ──
Step 4 — Formulário de contacto (nome + telefone + foto)
Step 5 — Seletor de vaga/calendário
→ Submissão → /obrigado
```

**Regra de navegação (atualizada):**
- `shouldSkipServiceType` = carpet / chairs / headboard / other (NÃO inclui sofa/mattress)
- Back de step 3 → step 2 para sofa/mattress; step 1 para outros
- Upsell intercept: ao avançar do step 3, sempre mostra Pack Família (se `!upsellShown` OR sempre re-mostra)
- Back de step 4 → volta ao ecrã de upsell (se `upsellShown=true`)

---

## Tudo o que foi feito — Sessão 4 (2026-05-18)

### Deploy & Infraestrutura

27. **GitHub + Cloudflare Pages — pipeline de auto-deploy configurado**
    - Projeto sem remote → criado repo no GitHub
    - Segredo (Cloudflare API token) estava em `.claude/settings.local.json` no histórico git
    - Fix: criado orphan branch para eliminar todo o histórico contendo o segredo
    - `.gitignore` atualizado: `.claude/`, `.env*`, `package-lock.json`
    - `package.json`: adicionado `"packageManager": "npm@10.9.2"`, removidos `@rollup/rollup-win32-x64-msvc` e `@swc/core-win32-x64-msvc` (Windows-only, falham no Linux)
    - `.npmrc`: `legacy-peer-deps=true` (antes tinha `omit=optional` que impedia o rollup Linux de instalar)
    - Cloudflare Pages build command: `npm run build`, output dir: `dist`

28. **`public/_redirects` criado**
    - Conteúdo: `/* /index.html 200`
    - Causa raiz do site em branco: Cloudflare Pages sem este ficheiro devolvia 404 em qualquer rota React
    - Cloudflare "Always Use HTTPS" ativado (estava desligado → HTTP não redirecionava para HTTPS)

### SEO — Google Search Console

29. **Problema de indexação: 3000/3500 páginas não indexadas**
    - 2813 "Discovered not indexed" = crawl budget esgotado (domínio novo)
    - 109 "Crawled not indexed" = conteúdo demasiado thin
    - 57 erros 5xx = causados pelo `_redirects` em falta (agora corrigido)
    - 88 erros 403 = rotas sem dados correspondentes → 404s aceitáveis

30. **Noindex nas 1570 Keyword Variant pages (`SofaVariantPage.tsx`)**
    - Adicionado `useEffect` que injeta `<meta name="robots" content="noindex, follow">`
    - Objetivo: liberar crawl budget para as 942 páginas de localidade/freguesia com conteúdo real
    - Cleanup: reverte o meta para `index, follow` ao desmontar o componente

31. **Conteúdo único adicionado a `LocationServicePage.tsx`**
    - `RESULT_CONTENT` — object com `desc` e `checks` únicos por serviço+cidade
    - Secção "Como Funciona" — parágrafo `data.howItWorks` (inclui nome da cidade)
    - Secção "Benefícios" nova (fundo `#12121e`, grid de cards com `data.benefits`)
    - Cobertura com `data.localSection` na secção de área de serviço

32. **Conteúdo único adicionado a `FreguesiaServicePage.tsx`** (mesmo padrão)
    - `RESULT_CONTENT` com `data.name` (nome da freguesia)
    - Secção "Benefícios" antes da "REDE INTERNA"
    - `data.howItWorks` e `data.localSection` incorporados

---

## Tudo o que foi feito — Sessão 5 (2026-05-19)

### SEO Authority & Internal Linking

33. **Bot Fight Mode desligado** (Cloudflare Dashboard → Security → Bots)
    - Estava ativo → causava 403 nos 88 crawls do Googlebot → corrigido

34. **Redirect Paranhos** em `public/_redirects`
    - `/limpeza-sofas-paranhos` → `/limpeza-sofas-porto-paranhos 301`
    - URL incorreta tinha sido sugerida em sessão anterior

35. **`index.html` + `PageHead.tsx` — título brand-first**
    - Antes: "Limpeza de Sofás Porto | ... Kyro Clean Solutions" (brand no fim, cortado pelo Google)
    - Depois: "Kyro Clean Solutions | Limpeza de Sofás, Colchões e Tapetes ao Domicílio"
    - `PageHead.tsx` rota "/" sincronizada; OG tags e Twitter tags também atualizadas

36. **`LocalBusinessSchema.tsx` — reescrito com @graph**
    - `@id: "https://cleansolutions.com.pt/#business"` para cross-reference com ServiceLocationSchema (942 páginas)
    - `WebSite` schema + `SearchAction` (sitelinks search box)
    - `logo`, `image` fields adicionados
    - `sameAs` inclui Google Maps URL via `GOOGLE_MAPS_URL` de `src/constants/google.ts`

37. **`ServiceCityLinks.tsx` — novo componente reutilizável**
    - Links para todas as cidades com slug de serviço → `/limpeza-sofas-porto`, etc.
    - Adicionado em todas as 6 páginas de serviço principais

38. **Internal linking — LocationServicePage + FreguesiaServicePage**
    - Links para problem×city pages (`/mancha-sofa-porto`, etc.) na secção "Área de Serviço"
    - Filtro: METRO_CITIES + relatedCities do problema

39. **`ProblemPage.tsx` — city links corrigidos**
    - Antes: apontavam para `/serviço-cidade` (errado)
    - Depois: apontam para `/problema-cidade` (correto)
    - Expandido: metro cities completas + relatedCities (não só relatedCities)

40. **`PricePage.tsx` — link para service×city page**
    - Link proeminente "página completa" adicionado na secção de internal links

---

## Tudo o que foi feito — Sessão 7 (2026-05-19)

### Quiz Cadeiras — Layout Upsell + Preços Dinâmicos

41. **Step 2 (ServiceTypeSelector) — preço errado em cadeiras corrigido**
    - `cleaningPrice` estava hardcoded a `49` para todos os serviços não-colchão
    - Para cadeiras → agora `undefined` → ServiceTypeSelector não mostra nenhum "a partir de"
    - Correto: preço de cadeiras depende da quantidade, não faz sentido mostrar preço fixo

42. **Step 3 cadeiras — layout reescrito para ser idêntico ao upsell**
    - Antes: tier-grid (4 caixas de preço) + input de texto + stepper separado de add-on
    - Depois: price box no topo + stepper grande (w-14 h-14 / text-4xl) + toggle card de add-on
    - Mesmo layout pixel-a-pixel do bloco `pendingUpsellId === 'chairs'`

43. **Dinâmico por `formData.serviceType`:**
    - `serviceType === 'waterproofing'` → preços primários = `calcChairWaterproof(qty)` | add-on = "Adicionar Higienização" com `calcChairClean`
    - Caso contrário → preços primários = `calcChairClean(qty)` | add-on = "Adicionar Impermeabilização" com `calcChairWaterproof`

44. **Sync de `chairWaterproofQty`:** quando qty muda via stepper e toggle está ativo, `chairWaterproofQty` atualiza automaticamente (para `calculateServicePrice` funcionar)

45. **`Droplets` importado** de lucide-react (ícone para add-on de higienização)

---

## Estado atual do site (2026-05-19)

- **URL ao vivo:** cleansolutions.com.pt (Cloudflare Pages, HTTPS)
- **GitHub repo:** conectado, auto-deploy a cada push para main
- **Admin panel:** `/admin/panel` (password protegido)
- **Google Search Console:** 10 sitemaps submetidos; Bot Fight Mode agora OFF → crawl desbloqueado
- **Bot Fight Mode:** OFF (corrigido nesta sessão)

---

## Próximas tarefas SEO (por prioridade)

1. Re-indexação manual no GSC para páginas que estavam 403: `/limpeza-colchoes`, `/limpeza-sofas-vila-nova-de-gaia`, `/limpeza-alcatifas-porto`, `/limpeza-tapetes-lisboa`
2. Google Business Profile: adicionar fotos (antes/depois), categorias secundárias, posts semanais
3. Diretórios PT: Habitissimo.pt, Fixando.pt, Páginas Amarelas, Bing Places, Yelp PT, Facebook Business, LinkedIn
4. Adicionar Instagram/Facebook URLs ao `sameAs` do LocalBusinessSchema (comment já está no código)
5. `VITE_ADMIN_PASSWORD=kyro@admin2025` — variável de ambiente no Cloudflare Pages (user faz manualmente)
6. Blog — artigos long-tail ("como limpar sofá em casa", "limpeza colchões porto")

---

## Possíveis próximas tarefas (funcionalidades)

- Verificar que a imagem `/images/services/sofa.png` existe (usada no card de upsell de Sofá)
- Animação `animate-fade-in` — verificar se a classe existe no tailwind.config ou definir em globals.css
- Auditoria de performance mobile (Lighthouse)
- Conteúdo dos artigos do blog
- Slider Before/After nas páginas de serviço
- A/B test no copy do CTA do ServiceSchedulingBar
- Swipe/drag touch no carrossel (arrastar com o dedo em mobile)

---

## ⚠️ AVISO: este ficheiro está desatualizado desde a Sessão 5 (2026-05-19)

Este ficheiro não foi mantido em sincronia nas sessões seguintes. O histórico completo e atualizado (sessões 6-46+, incluindo redesigns, SEO técnico, quiz refactor, auditorias) está na memória do Claude Code (`project_kyro.md`), não aqui. Pasta local também mudou: `spotless-pro-flow-main` → `sitekyroclean`.

## Sessão pós-férias — Audit SEO técnico + conversão (2026-07-13)

**Commits:** `c16fac9` → `405b700` — publicados, deploy Cloudflare Pages automático.

Correções aplicadas: canonical URLs em branco nas 17 páginas core, BreadcrumbList inválida removida, preços errados no Service JSON-LD, hreflang bloqueado por robots.txt removido, imagem OG movida para local (`public/images/og-social.webp`), `initialLocation` no widget de preços das 2041 páginas de variante (`ServicePriceSection.tsx`), mensagem de horário no `/obrigado` fora do expediente (seg-sáb 08:00-00:00), horário errado no `LocalBusinessSchema.tsx` da homepage corrigido, logo 404 no schema corrigido (`public/images/kyro-logo.png`).

**Pendente:** confirmar no Google Ads que os anúncios apontam para páginas de cidade (`/limpeza-sofas-porto`) e não para páginas genéricas (`/limpeza-sofas`) — ação do user no dashboard, não código.

## Sessão pós-férias, parte 2/3 (2026-07-14)

**Commits:** `05c9dca` → `89b7173` — publicados, deploy Cloudflare Pages automático.

- Fotos de hero variadas por cidade/freguesia em todos os 6 serviços (antes só sofás tinham variedade, via `SofaVariantPage.tsx`; agora `LocationServicePage.tsx`/`FreguesiaServicePage.tsx` também, usando o mesmo pool de imagens já existente em `public/images/variant-heroes/`).
- **Preços de colchão +10€** em todas as referências site-wide (higienização 49/59/69€, impermeabilização 55/60/65€ antes de ser removida — ver abaixo).
- **Impermeabilização de colchão descontinuada** (decisão de negócio): removida do quiz (toggle "Adicionar Impermeabilização"), das páginas SEO (`/impermeabilizacao-colchao-{cidade}` deixaram de ser geradas, 2041→1884 keyword variant pages) com redirect 301 para `/limpeza-colchoes-{cidade}`, e de todo o copy de marketing (blog, FAQ). Sofá e cadeiras continuam a oferecer impermeabilização normalmente.

## Sessão — Expansão Lisboa/Algarve + auditoria de preços + admin panel (2026-07-17)

**Commits (6, todos publicados, deploy Cloudflare automático):** `80b6450` → `fed0a39` → `31ea8f2` → `ab2e9cd` → `8f06c8f` → `8e14a7f` → `eb29c22`

- **Expansão SEO massiva Lisboa/Algarve:** user passou a delegar operação também nessas regiões (equipa local própria, não a do Porto). `cities` (locationSeoData.ts) 25→53 concelhos; `municipiosComFreguesias` (freguesiaSeoData.ts) +172 freguesias (Lisboa completa com as 24 pós-2012, todo o Algarve incluindo Quinta do Lago/Vale do Lobo/Vilamoura/Quarteira como localidades de Loulé). Cada região (Porto/Lisboa/Algarve) com o seu próprio sistema de zonas de deslocação (equipa local = 0€ na cidade-sede). Rotas: 3963→8514. Sitemap: ~3806→7906 URLs.
- **Problema×Cidade e Marca×Cidade expandidos** para as mesmas regiões via `METRO_CITY_SLUGS` (`src/constants/metroCities.ts`, 7→18 cidades-topo): 375→943 e 80→144 páginas.
- **Admin panel reorganizado por região:** nova distinção interna AMP (17 municípios oficiais) vs Norte-sem-Porto (Braga/Guimarães, que na realidade não pertencem à AMP) — `src/data/regionUtils.ts`. Aba "SEO Pages" ganhou filtro/coluna Região; aba "Sitemaps" estava completamente desatualizada (nomes de ficheiro fictícios, contagens hardcoded de sessões antigas) e foi reescrita com os 10 sitemaps reais + drill-down por região.
- **Bug crítico de URL:** o sitemap índice chama-se `sitemap.xml`, não `sitemap-index.xml` (confirmado por `robots.txt`) — o admin panel tinha o nome errado, corrigido.
- **Auditoria de preços site-wide** (pedido do user após encontrar "sofá 39€" numa página): descobertos e corrigidos ~50+ pontos de drift em sofá/cadeiras/tapetes/alcatifas espalhados por dezenas de ficheiros, incluindo o array `services` canónico (cadeiras tinha priceFrom errado, usado por todas as páginas de localidade) e um blog post inteiro a descrever um esquema de preços de cadeiras que corresponde a código morto nunca usado. **Bug real de subcobrança** encontrado e corrigido: upsell de impermeabilização de cadeiras cobrava `qty×10€` fixo em vez do bracket real `calcChairWaterproof()` (2 cadeiras: 20€ cobrado vs 35€ real). Bug de schema JSON-LD também corrigido: regex apagava vírgula decimal, preço "17,50€" virava "1750" no schema.org.
- **+48 freguesias com conteúdo local único** (landmarks/tips curados, não fallback genérico) para as cidades-topo que faltavam: Sintra, Cascais, Oeiras, Amadora, Almada, Loures + resto do Algarve top.
- **GBP:** aconselhado a criar 2 perfis novos (Lisboa + Algarve) em vez de reaproveitar o do Porto — proximidade é o fator de ranking dominante, o Porto não vai aparecer no Local Pack a 300km de distância independentemente do nº de reviews.

**Pendente (ação do user):** GSC já resubmetido; criar perfis GBP para Lisboa/Algarve; confirmar limite do Formspree (50 submissões/mês) dado o aumento de alcance.

## Sessão — Redesign visual: hero/stats/pills, PricePage, Material, WhatsApp único, páginas de Problema (2026-07-17/18)

**Commits:** `3ecea24` → `bbe68cf` (hero Variantes Keyword + widget) → `40d4d06` → `3ea36ef` (Preço + Material) → `f0d45a9` → `3007db1` → `6caf9fe` (hero homepage) → `0ac58f2` (WhatsApp) → `35952f9` → `977596f` → `aaa8d6a` → `b521766` (páginas de Problema)

- **Novo `src/components/ServiceSnapshotStats.tsx`**: faixa de stats (5.0★/preço/zonas/tempo resposta) partilhada entre Localidade/Freguesia/Variantes Keyword. Fundo = mesma foto do hero a continuar (hero + faixa partilham um único `<img>` num wrapper comum) — 1ª tentativa com `background-image` separado ficou errada (amplia demasiado o centro da foto).
- **`TrustRatingBadge.tsx` nova variante `mapsLinkClients`**: pill de avaliações + pill "+1000 clientes", aplicada em 5 sítios. Bug mobile corrigido (`flex-col sm:flex-row` em vez de `flex-wrap` que sobrepunha as pills).
- **WhatsApp — bug de duplicação:** a homepage (`HeroV1.tsx`) tinha a sua própria barra fixa de WhatsApp mobile, diferente e sem coordenação com o componente global `MobileStickyBar.tsx` já montado em todas as páginas — por isso o botão "mudava sem motivo" consoante o scroll. Duplicação removida, fica só a global (que ganhou sombra premium).
- **Homepage — audit de densidade mobile:** hero tinha 7 blocos de conteúdo empilhados em 320px. Stat principal + avaliações fundidos numa linha, repartição por serviço passou a `hidden md:flex`.
- **PricePage.tsx:** hero com imagens variadas por localidade (`pickServiceHero`); `priceFactors` padronizado a 6 itens por serviço (grid 3 colunas); alternância de fundo corrigida.
- **MaterialPage.tsx:** ícones em círculo no "Como limpamos" removidos, ficou só o número (user achou os ícones "emoji-like").
- **Páginas de Problema (`ProblemPage.tsx` + `ProblemCityPage.tsx`, 995 páginas) — trabalho mais extenso da sessão:** alternância de fundo corrigida (regra: secção após hero tem de ser branca); "Processo" virou timeline horizontal; "Problema+Solução" reescrita como 2 cartões fotográficos (não texto) — **foto do Problema a preto-e-branco, foto da Solução a cores cheias**, é o contraste visual que conta a história em vez de precisar de vermelho. User vai criar imagens dedicadas por problema no futuro (spec: 4:3, antes/depois do mesmo objeto).
- **Descoberta:** `problemDetail`/`solutionDetail` (e provavelmente outros campos) nunca estiveram no HTML pré-renderizado estático — só existem depois da hidratação React. Não é regressão desta sessão, é limitação pré-existente do `scripts/prerender.ts` para este campo. Vale um audit futuro de cobertura do prerender por tipo de página.

## Sessão — Overhaul de preços impermeabilização/cadeiras + bugs críticos + reviews link + IVA (2026-07-21)

**Commit:** `09b7a33`

**Preços novos (pedido explícito do user):**
- Sofá impermeabilização: 69/89/109€ (1L/2L/3L), era 49/69/89€. Pack recalculado com o mesmo desconto (9/9/19€): 109/149/169€.
- Chaise longue impermeabilização: 20€ → 25€.
- Cadeiras impermeabilização: 1-6un 25€, 7-10un 20€, 11+ sob orçamento.
- Cadeiras limpeza: 1-4un 20€, 5-7un 17,50€, 8-10un 15€, 11+ sob orçamento (cutoff sob-orçamento mudou de 10 para 11).
- Pack "3L+Chaise" (Sofá+Impermeabilização): 199€ fixo, definido explicitamente pelo user.

**Bugs de preço encontrados e corrigidos (todos com o mesmo padrão: números hardcoded desligados da fonte única `QuizTypes.ts`):**
1. `QuizForm.tsx` step "Escolha o seu tratamento" tinha `49/45/39€` hardcoded, nunca acompanhava alterações reais de preço — era o bug que o user via no ecrã. Agora lê de `sofaPrices[0]`/`mattressPrices[0]`.
2. `priceWidgetCalc.ts` — motor de preços duplicado usado pelos widgets SEO (Localidade/Freguesia/ServicePriceSection), tinha as suas próprias cópias das fórmulas de cadeiras e chaise, desalinhadas do motor do quiz.
3. Off-by-one no corte "sob orçamento" das cadeiras (`qty>=10` em vez de `qty>10`) em `QuizStepConfig.tsx` e `QuizUpsellOverlay.tsx`.
4. `index.html` raiz — schema JSON-LD estático da homepage tinha preço de cadeiras fixo em "12.50" (nunca apanhado por greps anteriores por estar fora de `src/`).
5. `submissionService.ts` — preço unitário do recibo para "Impermeabilização Cadeiras" usava tabela de tiers completamente diferente e obsoleta.

**Bug do "Pack:" repetido no WhatsApp/Formspree:** corrigido para aparecer uma única vez no início da lista de upsells.

**Link de avaliações Google partido (site inteiro):** `GOOGLE_REVIEWS_SHORT_URL` usava um link curto `share.google/...` expirado que redirecionava para uma página genérica do Google. Substituído por `GOOGLE_REVIEWS_VIEW_URL` baseado no place_id (não expira). Afetava o ícone de avaliações em quase todo o site.

**"IVA incl." removido** de todo o site (quiz, WhatsApp, Formspree, CRM) — pedido explícito do user.

**`PackComboPage.tsx`:** removido o preço confuso de baixo dos 4 cards de opção de sofá (só aparece agora ao selecionar, na caixa de resumo com desconto).

**Verificação:** sem Playwright/chromium-cli instalados neste ambiente — escrito um driver CDP mínimo em Node puro (fetch+WebSocket nativos) para confirmar visualmente via screenshot real que o quiz mostra os preços corretos. Vale a pena gerar uma skill `/run-skill-generator` para isto numa sessão futura.

**Pendente no fim desta sessão:** nenhum — os 3 pontos abaixo foram todos concluídos na continuação desta mesma sessão maratona (ver secção seguinte).

## Sessão — Continuação: imagens, redesign /packs, expansão cidades, fórmula final cadeiras (2026-07-21)

- **Imagens otimizadas:** 35 PNG/JPG gigantes (até 11MB) convertidas para WebP, ~125MB poupados, originais removidos.
- **`/packs` redesenhado** (~15 rondas de feedback iterativo com screenshots via driver CDP): cards de seleção com ícone, títulos alinhados à esquerda de forma consistente, caixa de preço reescrita (preço riscado cinza à esquerda / pack dourado à direita), botão WhatsApp com o gradiente premium já usado no `MobileStickyBar.tsx`, fotos reais por serviço do pack (corrigido bug em "Sala Completa" que mostrava foto errada), "Garantias incluídas" em grelha 2×2. Ícone `Sparkles` banido do site.
- **`packCities` expandido de 5 (incluía Coimbra, que nem é cidade operacional) para 22 cidades reais** das 3 regiões (Porto/Lisboa/Algarve) → 88 páginas de pack (era 20).
- **Fórmula final de preço de cadeiras** (corrigida várias vezes pelo user ao longo da sessão): limpeza 1-4@20€/5-6@15€/7-10@12,50€; impermeabilização 1-4@25€/5-10@20€. Propagada a todos os motores de cálculo e cópias de marketing.
- **Pack 2-lugares (Sofá+Impermeabilização) → 145€** (era 149€), "3L+Chaise" → 199€ (valores finais dados explicitamente pelo user).
- Verificação final: script standalone confirmou os 22 preços-base dos 4 packs batem 100% com as fórmulas canónicas.

**Footer.tsx corrigido no fecho da sessão:** texto (descrição, copyright, links legais) usava `text-[#111111]/NN` sobre fundo verde escuro — invisível; trocado para `text-white/NN`. Ícone "≡" trocado por `ChevronRight`. "Limpeza e Lavagem de X" → "Higienização de X". Removida linha de cabeceiras/estrados e bloco de redes sociais (não existem). Descrição da empresa reescrita e movida do meio de uma coluna de links para debaixo do logo (mais legível). Cobertura: "Portugal Continental inteiro".

## Sessão — Audit Formspree/deslocação + baixa preço impermeabilização sofá (2026-08-05)

**Bug reportado pelo user:** emails do Formspree diziam "Deslocação: Grátis (pedido >150€)" mesmo quando o pedido não chegava aos 150€. Investigação confirmou que o cálculo do preço (`use-quiz-pricing.ts`) sempre esteve correto — `finalTravelCost` é sempre o preço fixo da zona (0/5/10/15€), nunca varia com o total do pedido. O bug era só o texto em `QuizForm.tsx:472`, que atribuía a razão errada ("pedido >150€") sempre que a zona tinha custo 0€ (Porto/Lisboa/Faro-Loulé centro). Corrigido para "Grátis (zona sem custo)". A mesma alegação fictícia de "grátis acima de 150€, independente da zona" existia também no painel `/admin/deslocacoes` — banner e coluna removidos (não correspondiam a nenhuma regra real no código).

**Bug adicional encontrado no audit (não relacionado):** `ServicePriceSection.tsx` chamava `useState` depois de um `return null` condicional — viola Rules of Hooks, risco de crash se `serviceSlug` for inválido. Corrigido (hook movido antes do early return).

**Baixa de preço (pedido explícito do user): impermeabilização de sofás −10€ em todo o site:**
- 1 lugar: 69€ → 59€ | 2 lugares: 89€ → 79€ | 3 lugares: 109€ → 99€ (fonte única `QuizTypes.ts`)
- Pack Sofá+Impermeabilização 1 lugar: 109€ → 99€ (decisão do user, via pergunta) — sem isto o pack ficava mais caro (109€) que fazer os dois serviços em separado (108€ com o novo preço). Os packs 2L/3L/3L+chaise mantiveram-se (145/169/199€), já ficavam com poupança positiva sem alteração.
- `originalBothPrice` (preço riscado) recalculado para 1L/2L/3L: 108/148/178€.
- Atualizadas ~17 referências estáticas de texto (SEO, blog, FAQ, homepage) em 10 ficheiros além do `QuizTypes.ts` e `packComboData.ts` — grep final confirmou zero referências antigas (69/89/109€) ligadas a impermeabilização de sofá.

**2 commits separados** (`fix(quiz): ...` e `fix(pricing): ...`), ainda não fez push para o remoto (Cloudflare Pages faz deploy automático no push a `main` — a confirmar com o user antes).

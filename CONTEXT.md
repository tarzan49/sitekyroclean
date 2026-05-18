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

## Possíveis próximas tarefas

- Verificar que a imagem `/images/services/sofa.png` existe (usada no card de upsell de Sofá)
- Animação `animate-fade-in` — verificar se a classe existe no tailwind.config ou definir em globals.css
- Auditoria de performance mobile (Lighthouse)
- Conteúdo dos artigos do blog
- Slider Before/After nas páginas de serviço
- A/B test no copy do CTA do ServiceSchedulingBar
- Swipe/drag touch no carrossel (arrastar com o dedo em mobile)

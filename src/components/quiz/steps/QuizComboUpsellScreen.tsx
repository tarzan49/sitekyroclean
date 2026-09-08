import { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { UpsellItemConfig, CarpetItem } from '@/components/quiz/QuizTypes';
import {
  calcChairClean,
  carpetAddItem, carpetRemoveItem, carpetUpdateItem, carpetItemArea, carpetTotalArea,
} from '@/components/quiz/quizHelpers';
import { PACK_DISCOUNT_MIN_SERVICE, PACK_DISCOUNT_MIN_UPSELL_ITEM } from '@/lib/priceWidgetCalc';

interface QuizComboUpsellScreenProps {
  upsellItems: UpsellItemConfig[];
  setUpsellItems: (items: UpsellItemConfig[]) => void;
  onContinue: () => void;
  onBack: () => void;
  // Preço já calculado pelo use-quiz-pricing.ts (fonte única de verdade do
  // desconto de 10% sobre o PEDIDO TODO, não só sobre o extra) — permite
  // mostrar a poupança em euros concretos aqui sem duplicar a regra
  // (pedido explícito 2026-09-08: reforço de copy, "o desconto aplica-se a
  // tudo, não só ao extra").
  totalPrice: number;
  packDiscountActive: boolean;
  packDiscountedPrice: number;
}

type View = 'summary' | 'mattress' | 'sofa' | 'chairs' | 'carpet';

const CHAIRS_STARTING_PRICE = 20;
// Mínimo subiu de 3 para 4 (2026-09-08, pedido explícito do dono): 4 é o
// número mais comum de cadeiras numa casa (conjunto de mesa de jantar
// standard), fica mais realista que 3 como ponto de partida do upsell.
const CHAIRS_MIN_QTY = 4;

function fmt(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1).replace('.', ',');
}

// Upsell final "estilo companhia aérea": uma única tela com as 3 categorias
// (Colchão, Sofá, Cadeiras), cada uma abre a sua própria página de
// quantidades com os tamanhos/preços reais do negócio, em vez do fluxo
// anterior de escolher um item de cada vez. Substitui QuizUpsellOverlay
// no ponto "antes de finalizar" (pedido explícito, aprovado em mockup).
const QuizComboUpsellScreen = ({ upsellItems, setUpsellItems, onContinue, onBack, totalPrice, packDiscountActive, packDiscountedPrice }: QuizComboUpsellScreenProps) => {
  const [view, setView] = useState<View>('summary');
  const [mattressQty, setMattressQty] = useState<Record<string, number>>({});
  const [sofaQty, setSofaQty] = useState<Record<string, number>>({});
  const [chairsQty, setChairsQty] = useState(0);
  const [carpetItems, setCarpetItems] = useState<CarpetItem[]>([{ id: 'upsell-tapete-1', largura: '', comprimento: '' }]);

  const setMattQty = (id: string, qty: number) => setMattressQty(prev => ({ ...prev, [id]: Math.max(0, Math.min(9, qty)) }));
  const setSofaQtyFor = (id: string, qty: number) => setSofaQty(prev => ({ ...prev, [id]: Math.max(0, Math.min(9, qty)) }));
  // Cadeiras no upsell só compensam a partir de 4un (80€, acima do mínimo de
  // 49€ do artigo extra para o desconto de 10% do pack) — pedido explícito do
  // dono para não deixar escolher 1-3 cadeiras aqui e nunca chegar ao
  // desconto anunciado. 4 também é o nº mais comum de cadeiras numa casa.
  const decChairs = () => setChairsQty(q => (q <= CHAIRS_MIN_QTY ? 0 : q - 1));
  const incChairs = () => setChairsQty(q => (q <= 0 ? CHAIRS_MIN_QTY : Math.min(9, q + 1)));

  // Este upsell final é sempre e só limpeza (2026-09-08, pedido explícito do
  // dono): quem queria impermeabilização já teve essa opção como serviço
  // principal lá atrás — oferecer proteção outra vez aqui, para um item
  // novo, só complicava um ecrã que é suposto ser rápido e leve.
  const mattressTotal = mattressPrices.reduce((sum, opt) => {
    const q = mattressQty[opt.id] ?? 0;
    return sum + (typeof opt.cleaningPrice === 'number' ? q * opt.cleaningPrice : 0);
  }, 0);
  const sofaTotal = sofaPrices.reduce((sum, opt) => {
    const q = sofaQty[opt.id] ?? 0;
    return sum + (typeof opt.cleaningPrice === 'number' ? q * opt.cleaningPrice : 0);
  }, 0);
  const chairsCleanPrice = calcChairClean(chairsQty);
  const chairsTotal = chairsQty > 0 ? (chairsCleanPrice ?? 0) : 0;

  const mattressQtyTotal = Object.values(mattressQty).reduce((a, b) => a + b, 0);
  const sofaQtyTotal = Object.values(sofaQty).reduce((a, b) => a + b, 0);
  const anySelected = mattressQtyTotal > 0 || sofaQtyTotal > 0 || chairsQty > 0;
  const carpetTotalAreaValue = carpetTotalArea(carpetItems);
  const carpetValidCount = carpetItems.filter(it => carpetItemArea(it) !== null).length;

  // Copy curta tipo "a partir de X€" (mesma convenção do Passo 1 — QuizStep1Service)
  // — as frases de marketing anteriores ("Também aproveita?", "Some ao pedido")
  // não cabiam nos cartões mais pequenos e liam-se mal (pedido explícito 2026-09-08).
  const mattressSummary = mattressPrices
    .filter(opt => (mattressQty[opt.id] ?? 0) > 0)
    .map(opt => `${mattressQty[opt.id]}x ${opt.label}`)
    .join(', ') || 'a partir de 59€';
  const sofaSummaryBase = sofaPrices
    .filter(opt => (sofaQty[opt.id] ?? 0) > 0)
    .map(opt => `${sofaQty[opt.id]}x ${opt.label}`)
    .join(', ');
  const sofaSummary = sofaSummaryBase || 'a partir de 49€';
  const chairsSummary = chairsQty > 0
    ? `${chairsQty} cadeira${chairsQty > 1 ? 's' : ''}`
    : `a partir de ${CHAIRS_STARTING_PRICE}€/un.`;
  const carpetSummary = carpetValidCount > 0
    ? `${carpetValidCount} tapete${carpetValidCount > 1 ? 's' : ''} · sob orçamento`
    : 'Sob orçamento';

  // Sincroniza o subtotal e os itens em tempo real com o formData do quiz —
  // a "Estimativa" no topo do modal tem de acompanhar cada +1/-1 aqui dentro,
  // não só depois de "Confirmar"/"Finalizar Orçamento" (bug real: a pessoa
  // ficava sem feedback nenhum de preço enquanto ajustava quantidades).
  useEffect(() => {
    const items: UpsellItemConfig[] = [];
    mattressPrices.forEach(opt => {
      const q = mattressQty[opt.id] ?? 0;
      if (q > 0 && typeof opt.cleaningPrice === 'number') {
        items.push({ id: `mattress-${opt.id}`, mattressSize: opt.id, qty: q, price: q * opt.cleaningPrice, label: `${q}x Colchão ${opt.label}` });
      }
    });
    sofaPrices.forEach(opt => {
      const q = sofaQty[opt.id] ?? 0;
      if (q <= 0) return;
      // "4+ Lugares" não tem cleaningPrice numérico (é sempre sob orçamento)
      // — sem este ramo, o item desaparecia em silêncio: o cartão mostrava
      // selecionado mas nunca chegava a upsellItems, nunca era cobrado nem
      // enviado ao negócio (bug real, achado no audit 2026-09-08). Mesmo
      // padrão já usado para tapete: price:0 para acionar hasUpsellSobItem.
      if (typeof opt.cleaningPrice === 'number') {
        items.push({
          id: `sofa-${opt.id}`,
          sofaSize: opt.id,
          qty: q,
          price: q * opt.cleaningPrice,
          label: `${q}x Sofá ${opt.label}`,
        });
      } else {
        items.push({
          id: `sofa-${opt.id}`,
          sofaSize: opt.id,
          qty: q,
          price: 0,
          label: `${q}x Sofá ${opt.label} (sob orçamento)`,
        });
      }
    });
    if (chairsQty > 0) {
      items.push({
        id: 'chairs',
        chairQty: String(chairsQty),
        qty: chairsQty,
        price: chairsCleanPrice ?? 0,
        label: `${chairsQty} Cadeira${chairsQty > 1 ? 's' : ''}`,
      });
    }
    if (carpetValidCount > 0) {
      items.push({
        id: 'carpet',
        carpetArea: String(Math.round(carpetTotalAreaValue * 100) / 100),
        qty: carpetValidCount,
        price: 0,
        label: `${carpetValidCount} Tapete${carpetValidCount > 1 ? 's' : ''} (sob orçamento)`,
      });
    }
    setUpsellItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mattressQty, sofaQty, chairsQty, carpetItems]);

  const baseTotal = mattressTotal + sofaTotal + chairsTotal;
  const subtotalLabel = `${fmt(baseTotal)}€`;

  // Mesmo tamanho/peso visual das linhas do início do orçamento
  // (QuizStepConfig: botões w-14 h-14, container max-w-sm) — estava mais
  // pequeno aqui e ficava mal para quem já vê pior (pedido explícito
  // 2026-09-08). Tracejado quando vazio / sólido dourado quando ativo,
  // mesma convenção agora uniformizada em todo o quiz.
  const StepperRow = ({ label, unitLabel, qty, onDec, onInc }: { label: string; unitLabel: string; qty: number; onDec: () => void; onInc: () => void }) => (
    <div className={cn(
      'w-full flex items-center justify-between gap-2 rounded-sm border-2 px-4 py-3 transition-all duration-200',
      qty > 0 ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : 'border-dashed border-gold/30 bg-gold/[0.03]'
    )}>
      <div className="text-left">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-white/35">{unitLabel}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onDec} disabled={qty <= 0} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-20 disabled:border-transparent disabled:bg-transparent active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
        <span className={cn('w-7 text-center font-bold tabular-nums text-base', qty > 0 ? 'text-gold' : 'text-white/30')}>{qty}</span>
        <button onClick={onInc} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
      </div>
    </div>
  );

  if (view === 'mattress' || view === 'sofa' || view === 'chairs' || view === 'carpet') {
    const label = view === 'mattress' ? 'Colchão' : view === 'sofa' ? 'Sofá(s)' : view === 'chairs' ? 'Cadeiras' : 'Tapete(s)';
    return (
      <div className="flex flex-col gap-2 overflow-hidden items-center w-full">
        {/* "Voltar" só no rodapé agora (2026-09-08) — este link duplicado no
            topo, mais a frase de intro do sofá, empurravam o Confirmar para
            fora do ecrã em telemóvel quando as 4 linhas já estavam reveladas
            (pedido explícito: "importante o botão continuar aparecer
            sempre"). O rodapé já tem Voltar + Confirmar, chega. */}
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">
          Detalhes do{view === 'sofa' || view === 'carpet' ? '(s)' : ''} {label}
        </h2>

        {view === 'mattress' && (
          // Scroll interno próprio (não a página toda) acima de ~3 linhas —
          // garante que o rodapé Voltar/Confirmar fica sempre à vista mesmo
          // em ecrãs pequenos, em vez de ser empurrado para fora (pedido
          // explícito 2026-09-08: "importante o botão continuar aparecer
          // sempre").
          <div className="flex flex-col gap-2 w-full max-w-sm max-h-[280px] overflow-y-auto pr-0.5">
            {mattressPrices.map(opt => (
              <StepperRow
                key={opt.id}
                label={opt.label}
                unitLabel={typeof opt.cleaningPrice === 'number' ? `${opt.cleaningPrice}€/un.` : 'Sob orçamento'}
                qty={mattressQty[opt.id] ?? 0}
                onDec={() => setMattQty(opt.id, (mattressQty[opt.id] ?? 0) - 1)}
                onInc={() => setMattQty(opt.id, (mattressQty[opt.id] ?? 0) + 1)}
              />
            ))}
          </div>
        )}
        {view === 'sofa' && (
          // Sempre limpeza, sem escolha de proteção (2026-09-08, pedido
          // explícito) — mesmo padrão do colchão. Scroll interno próprio
          // acima de ~3 linhas para o rodapé nunca ficar de fora.
          <div className="flex flex-col gap-2 w-full max-w-sm max-h-[280px] overflow-y-auto pr-0.5">
            {sofaPrices.map(opt => (
              <StepperRow
                key={opt.id}
                label={opt.label}
                unitLabel={typeof opt.cleaningPrice === 'number' ? `${opt.cleaningPrice}€/un.` : 'Sob orçamento'}
                qty={sofaQty[opt.id] ?? 0}
                onDec={() => setSofaQtyFor(opt.id, (sofaQty[opt.id] ?? 0) - 1)}
                onInc={() => setSofaQtyFor(opt.id, (sofaQty[opt.id] ?? 0) + 1)}
              />
            ))}
          </div>
        )}
        {view === 'chairs' && (
          // Sempre limpeza, sem escolha de proteção (2026-09-08, pedido
          // explícito, mesma razão do sofá).
          <>
            <div className="flex items-center justify-center gap-6">
              <button onClick={decChairs} disabled={chairsQty <= 0} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
              <span className="text-4xl font-black text-gold w-10 text-center tabular-nums leading-none">{chairsQty}</span>
              <button onClick={incChairs} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
            </div>
            {/* Preço da quantidade escolhida sempre visível — antes só se via
                um número de cadeiras sem preço nenhum, ao contrário do
                colchão/sofá que mostram sempre "X€/un." (pedido explícito
                2026-09-08: "senão o cliente não sabe o que está a pagar"). */}
            <p className="font-playfair text-2xl font-bold text-gold tabular-nums">
              {chairsCleanPrice !== null ? `${fmt(chairsCleanPrice)}€` : 'Sob orçamento'}
            </p>
            <p className="text-xs text-white/30 text-center leading-snug">Mínimo de {CHAIRS_MIN_QTY} cadeiras</p>
          </>
        )}
        {view === 'carpet' && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <p className="text-xs text-white/35 text-center leading-snug -mt-1 mb-1">
              Sem preço fixo por m², cada tapete é sempre orçamentado à parte.
            </p>
            {/* Scroll interno próprio a partir do 2º tapete — o rodapé
                Voltar/Confirmar nunca deve ficar de fora (pedido explícito
                2026-09-08). */}
            <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-0.5">
            {carpetItems.map((item, i) => {
              const area = carpetItemArea(item);
              return (
                <div key={item.id} className="rounded-sm border border-gold/15 bg-[#1a2a1a] p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Tapete {i + 1}</span>
                    {carpetItems.length > 1 && (
                      <button
                        onClick={() => setCarpetItems(prev => carpetRemoveItem(prev, item.id))}
                        aria-label="Remover tapete"
                        className="w-5 h-5 rounded-sm flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors touch-manipulation"
                      >×</button>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
                        value={item.largura}
                        onChange={(e) => setCarpetItems(prev => carpetUpdateItem(prev, item.id, 'largura', e.target.value))}
                        className="w-full h-11 text-center text-base font-bold bg-white/[0.05] text-white placeholder:text-white/25 rounded-sm border-2 border-white/15 focus:border-gold focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] text-center uppercase tracking-wide text-white/30">Largura (m)</span>
                    </div>
                    <span className="text-white/25 text-sm pb-4">×</span>
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
                        value={item.comprimento}
                        onChange={(e) => setCarpetItems(prev => carpetUpdateItem(prev, item.id, 'comprimento', e.target.value))}
                        className="w-full h-11 text-center text-base font-bold bg-white/[0.05] text-white placeholder:text-white/25 rounded-sm border-2 border-white/15 focus:border-gold focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] text-center uppercase tracking-wide text-white/30">Comprimento (m)</span>
                    </div>
                  </div>
                  <div className="text-right pt-1 border-t border-white/[0.06]">
                    <span className="text-[10px] text-white/30">Área </span>
                    <span className="text-sm font-bold text-gold tabular-nums">{area !== null ? `${area % 1 === 0 ? area : area.toFixed(2).replace('.', ',')} m²` : '0 m²'}</span>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setCarpetItems(prev => carpetAddItem(prev))}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border-2 border-dashed border-gold/30 text-gold/80 text-sm font-bold hover:border-gold/60 hover:bg-gold/[0.04] transition-all touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar outro tapete
            </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 w-full max-w-xs mt-1">
          <button
            onClick={() => setView('summary')}
            className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/50 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </button>
          <button
            onClick={() => setView('summary')}
            className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-sm tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
          >
            Confirmar
          </button>
        </div>
      </div>
    );
  }

  const rowConfig: { view: View; label: string; summary: string; selected: boolean }[] = [
    { view: 'mattress', label: 'Colchão', summary: mattressSummary, selected: mattressQtyTotal > 0 },
    { view: 'sofa', label: 'Sofá', summary: sofaSummary, selected: sofaQtyTotal > 0 },
    { view: 'chairs', label: 'Cadeiras', summary: chairsSummary, selected: chairsQty > 0 },
    { view: 'carpet', label: 'Tapete', summary: carpetSummary, selected: carpetValidCount > 0 },
  ];

  const savings = packDiscountActive ? Math.max(0, Math.round(totalPrice) - packDiscountedPrice) : 0;

  return (
    <div className="flex flex-col gap-2 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">UM BÓNUS PARA SI</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Poupe 10% no pedido todo</h2>
      <p className="text-xs text-white/55 text-center max-w-xs leading-relaxed -mt-1">
        Se juntar mais um serviço, o desconto aplica-se a tudo, não só ao extra.{' '}
        <span className="text-white/25 text-[10px]">Válido a partir de {PACK_DISCOUNT_MIN_SERVICE}€, extra de {PACK_DISCOUNT_MIN_UPSELL_ITEM}€+.</span>
      </p>

      {/* Grelha 2x2 compacta — mesma proporção do Passo 1 (QuizStep1Service),
          só que sem foto: cartão tracejado + "+"/✓, para caber tudo em
          mobile sem cortar o rodapé Voltar/Finalizar (pedido explícito
          2026-09-08: a versão em lista vertical empurrava o rodapé para
          fora do ecrã). */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {rowConfig.map(row => (
          <button
            key={row.view}
            onClick={() => setView(row.view)}
            className={cn(
              'relative min-h-[76px] flex flex-col items-start justify-center gap-0.5 rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation active:scale-[0.98]',
              row.selected
                ? 'border-gold bg-[#1a2a1a] shadow-[0_0_14px_rgba(212,175,55,0.20)]'
                : 'border-dashed border-gold/30 bg-gold/[0.03] hover:border-gold/55 hover:bg-gold/[0.05]'
            )}
          >
            <span className={cn(
              'absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
              row.selected ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
            )}>
              {row.selected
                ? <Check className="w-2.5 h-2.5 text-[#12121e]" strokeWidth={3} />
                : <Plus className="w-2.5 h-2.5 text-gold" strokeWidth={3} />}
            </span>
            <p className="text-sm font-bold text-white pr-5">{row.label}</p>
            <p className={cn('text-[11px] truncate w-full pr-1', row.selected ? 'text-gold/80' : 'text-white/45')}>{row.summary}</p>
          </button>
        ))}
      </div>

      {anySelected && (
        <div className="w-full max-w-xs rounded-sm border border-gold/35 bg-gold/[0.06] px-4 py-2.5 animate-fade-slide-up">
          {/* Só reivindica o desconto quando REALMENTE está ativo — antes
              dizia sempre "Desconto de 10% ativo" mesmo no ramo em que
              packDiscountActive era false (bug real 2026-09-08: cliente via
              "ativo" com um pedido de 108€, bem abaixo do mínimo de 149€,
              porque o texto do "senão" nunca tinha sido escrito a sério). */}
          {packDiscountActive && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                Poupa {fmt(savings)}€ no pedido todo
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-white/45">Subtotal do extra</span>
            <span className="font-playfair text-xl font-bold text-gold tabular-nums">{subtotalLabel}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 w-full max-w-xs">
        <button
          onClick={onBack}
          className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/50 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button
          onClick={onContinue}
          className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-sm tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
        >
          Finalizar Orçamento
        </button>
      </div>
    </div>
  );
};

export default QuizComboUpsellScreen;

import QuizCarpetMeasureGuide from '../QuizCarpetMeasureGuide';
import QuizCareIntro from '../QuizCareIntro';
import QuizFurnitureImage from '../QuizFurnitureImage';
import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { UpsellItemConfig, CarpetItem } from '@/components/quiz/QuizTypes';
import {
  calcChairWaterproof, calcChairWaterproofPremium, calcChairClean,
  carpetAddItem, carpetRemoveItem, carpetUpdateItem, carpetItemArea, carpetTotalArea,
} from '@/components/quiz/quizHelpers';

interface QuizComboUpsellScreenProps {
  offerPreview?: boolean;
  travelFee?: number;
  primaryService: string;
  upsellItems: UpsellItemConfig[];
  setUpsellItems: (items: UpsellItemConfig[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

// Preço riscado (tabela normal) + preço com desconto em destaque — usado em
// cada artigo deste upsell (pedido explícito do dono 2026-09-10: nada de
// desconto de 10% sobre o pedido todo; cada artigo extra já vem com o seu
// próprio preço reduzido, mostrado sempre lado a lado com o preço normal).
const PriceCompare = ({ original, promo, suffix = '' }: { original: number; promo: number; suffix?: string }) => (
  <span className="inline-flex items-baseline gap-1.5 tabular-nums">
    <s className="text-white/80 font-normal">{original}€</s>
    <span className="text-gold font-black tracking-tight">{promo}€{suffix}</span>
  </span>
);

type View = 'summary' | 'mattress' | 'sofa' | 'chairs' | 'carpet';

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
const QuizComboUpsellScreen = ({ offerPreview = false, travelFee = 10, primaryService, upsellItems, setUpsellItems, onContinue, onBack }: QuizComboUpsellScreenProps) => {
  const mattressUnitPrice = (opt: typeof mattressPrices[number]) => offerPreview && typeof opt.cleaningPrice === 'number' ? opt.cleaningPrice - 14 : opt.cleaningPrice;
  // Preços fixos do sofá neste upsell (pedido explícito do dono, mesmo
  // padrão do colchão acima): 1L 49→35€, 2L 69→55€, 3L 79→65€. "4+ Lugares"
  // fica de fora (sempre sob orçamento, sem preço fixo possível).
  const SOFA_OFFER_PRICE: Record<string, number> = { '1-lugar': 35, '2-lugares': 55, '3-lugares': 65 };
  const sofaUnitPrice = (opt: typeof sofaPrices[number]) => offerPreview && typeof opt.cleaningPrice === 'number' ? (SOFA_OFFER_PRICE[opt.id] ?? opt.cleaningPrice) : opt.cleaningPrice;
  const casalSeparate = Number(mattressPrices.find(opt => opt.id === 'casal')!.cleaningPrice) + travelFee;
  const [initialChairs] = useState(() => upsellItems.find(i => i.id === 'chairs'));
  const [preservedTreatments] = useState(() => upsellItems.filter(i => i.id.endsWith('-anti-acaros')));
  const [view, setView] = useState<View>('summary');
  // This screen remounts when returning from contact. Restore the selection
  // before the synchronization effect can overwrite the parent's items.
  const [mattressQty, setMattressQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(upsellItems.filter(item => item.mattressSize).map(item => [item.mattressSize!, item.qty ?? 1]))
  );
  const [sofaQty, setSofaQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(upsellItems.filter(item => item.sofaSize).map(item => [item.sofaSize!, item.qty ?? 1]))
  );
  const [chairsQty, setChairsQty] = useState(() => {
    const chairs = upsellItems.find(item => item.id === 'chairs');
    return chairs ? Number(chairs.chairQty ?? chairs.qty ?? 0) : 0;
  });
  const [carpetItems, setCarpetItems] = useState<CarpetItem[]>(() =>
    upsellItems.find(item => item.id === 'carpet')?.carpetItems
      ?? [{ id: 'upsell-tapete-1', largura: '', comprimento: '' }]
  );

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
  const chairsRegularPrice = initialChairs?.waterproof ? (initialChairs.waterproofingTier === 'premium' ? calcChairWaterproofPremium(chairsQty) : calcChairWaterproof(chairsQty)) : calcChairClean(chairsQty);
  const chairsFree = offerPreview && !initialChairs?.waterproof ? Math.floor(chairsQty / 4) : 0;
  const chairsCleanPrice = chairsRegularPrice === null ? null : chairsQty > 0 ? Math.round(chairsRegularPrice * (chairsQty - chairsFree) / chairsQty * 100) / 100 : 0;

  const mattressQtyTotal = Object.values(mattressQty).reduce((a, b) => a + b, 0);
  const sofaQtyTotal = Object.values(sofaQty).reduce((a, b) => a + b, 0);
  const carpetTotalAreaValue = carpetTotalArea(carpetItems);
  const incompleteCarpets = carpetItems.some(item => item.largura || item.comprimento) && carpetItems.some(item => carpetItemArea(item) === null);
  const carpetValidCount = carpetItems.filter(it => carpetItemArea(it) !== null).length;
  // Na escolha de extras mostramos o próximo passo, sem antecipar preços.
  const mattressSummary = mattressPrices
    .filter(opt => (mattressQty[opt.id] ?? 0) > 0)
    .map(opt => `${mattressQty[opt.id]}x ${opt.label}`)
    .join(', ') || 'Escolher tamanho e quantidade';
  const sofaSummaryBase = sofaPrices
    .filter(opt => (sofaQty[opt.id] ?? 0) > 0)
    .map(opt => `${sofaQty[opt.id]}x ${opt.label}`)
    .join(', ');
  const sofaSummary = sofaSummaryBase || 'Escolher tamanho e quantidade';
  const chairsSummary = chairsQty > 0
    ? `${chairsQty} cadeira${chairsQty > 1 ? 's' : ''}`
    : 'Escolher quantidade';
  const carpetSummary = carpetValidCount > 0
    ? `${carpetValidCount} tapete${carpetValidCount > 1 ? 's' : ''} · sob orçamento`
    : 'Indicar medidas';

  // Preço riscado + preço com desconto, por artigo — mostrado no resumo e nos
  // ecrãs de quantidade. Sem seleção ainda, usa-se um tamanho de referência
  // (Casal para colchão, 2 Lugares para sofá) como "a partir de".
  const mattressCasal = mattressPrices.find(opt => opt.id === 'casal')!;
  const mattressPriceLine = mattressQtyTotal > 0
    ? <PriceCompare
        original={mattressPrices.reduce((sum, opt) => sum + (mattressQty[opt.id] ?? 0) * Number(opt.cleaningPrice), 0)}
        promo={mattressPrices.reduce((sum, opt) => sum + (mattressQty[opt.id] ?? 0) * Number(mattressUnitPrice(opt)), 0)}
      />
    : <PriceCompare original={Number(mattressCasal.cleaningPrice)} promo={Number(mattressUnitPrice(mattressCasal))} suffix="/un." />;

  const sofaReference = sofaPrices.find(opt => opt.id === '2-lugares')!;
  const sofaPriceLine = sofaQtyTotal > 0
    ? <PriceCompare
        original={sofaPrices.reduce((sum, opt) => sum + (typeof opt.cleaningPrice === 'number' ? (sofaQty[opt.id] ?? 0) * opt.cleaningPrice : 0), 0)}
        promo={sofaPrices.reduce((sum, opt) => sum + (typeof opt.cleaningPrice === 'number' ? (sofaQty[opt.id] ?? 0) * Number(sofaUnitPrice(opt)) : 0), 0)}
      />
    : <PriceCompare original={Number(sofaReference.cleaningPrice)} promo={Number(sofaUnitPrice(sofaReference))} suffix="/un." />;

  // Cadeiras não têm preço fixo por unidade (é por escalão), por isso o
  // desconto mostra-se sempre no total do lote, nunca por cadeira.
  const chairsPriceLine: ReactNode = chairsQty > 0
    ? (chairsRegularPrice !== null && chairsCleanPrice !== null
        ? <PriceCompare original={chairsRegularPrice} promo={chairsCleanPrice} />
        : 'Sob orçamento')
    : 'Limpe 4, pague 3';

  // Sincroniza o subtotal e os itens em tempo real com o formData do quiz —
  // a "Estimativa" no topo do modal tem de acompanhar cada +1/-1 aqui dentro,
  // não só depois de "Confirmar"/"Finalizar Orçamento" (bug real: a pessoa
  // ficava sem feedback nenhum de preço enquanto ajustava quantidades).
  useEffect(() => {
    const items: UpsellItemConfig[] = [...preservedTreatments];
    mattressPrices.forEach(opt => {
      const q = mattressQty[opt.id] ?? 0;
      if (q > 0 && typeof opt.cleaningPrice === 'number') {
        items.push({ id: `mattress-${opt.id}`, mattressSize: opt.id, qty: q, price: q * Number(mattressUnitPrice(opt)), label: `${q}x Colchão ${opt.label}` });
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
          price: q * Number(sofaUnitPrice(opt)),
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
        ...initialChairs,
        id: 'chairs',
        chairQty: String(chairsQty),
        qty: chairsQty,
        price: chairsCleanPrice ?? 0,
        label: `${chairsQty} Cadeira${chairsQty > 1 ? 's' : ''}${initialChairs?.waterproof ? ` (Impermeabilização ${initialChairs.waterproofingTier === 'premium' ? 'Premium' : 'Essencial'})` : offerPreview ? ` (paga ${chairsQty - chairsFree})` : ''}`,
      });
    }
    if (carpetValidCount > 0) {
      items.push({
        id: 'carpet',
        carpetArea: String(Math.round(carpetTotalAreaValue * 100) / 100),
        carpetItems,
        qty: carpetValidCount,
        price: 0,
        label: `${carpetValidCount} Tapete${carpetValidCount > 1 ? 's' : ''} (sob orçamento)${offerPreview ? ` · ${fmt(carpetTotalAreaValue)} m², paga ${fmt(carpetTotalAreaValue - Math.floor(carpetTotalAreaValue / 5))} m²` : ''}`,
      });
    }
    setUpsellItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mattressQty, sofaQty, chairsQty, carpetItems]);

  // Mesmo tamanho/peso visual das linhas do início do orçamento
  // (QuizStepConfig: botões w-14 h-14, container max-w-sm) — estava mais
  // pequeno aqui e ficava mal para quem já vê pior (pedido explícito
  // 2026-09-08). Tracejado quando vazio / sólido dourado quando ativo,
  // mesma convenção agora uniformizada em todo o quiz.
  const StepperRow = ({ label, sizeId, unitLabel, qty, onDec, onInc }: { sizeId: string; label: string; unitLabel: ReactNode; qty: number; onDec: () => void; onInc: () => void }) => (
    <div className={cn(
      'w-full flex items-center justify-between gap-2 rounded-sm border-2 px-2.5 sm:px-3 py-3 transition-all duration-200',
      qty > 0 ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : 'border-dashed border-gold/30 bg-gold/[0.03]'
    )}>
      <QuizFurnitureImage service={view === 'sofa' ? 'sofa' : 'mattress'} sizeId={sizeId} />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-base font-semibold text-white">{label}</p>
        <p className="text-sm text-white/70">{unitLabel}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={onDec} disabled={qty <= 0} className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-20 disabled:border-transparent disabled:bg-transparent active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
        <span className={cn('w-5 text-center font-bold tabular-nums text-base', qty > 0 ? 'text-gold' : 'text-white/80')}>{qty}</span>
        <button onClick={onInc} className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
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
        <p className="text-gold text-sm font-bold tracking-[0.08em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="type-quote-title font-playfair    text-white text-center w-full">
          Detalhes do{view === 'sofa' || view === 'carpet' ? '(s)' : ''} {label}
        </h2>

        {view === 'carpet' && <QuizCarpetMeasureGuide />}
        {offerPreview && view === 'mattress' && <p className="text-sm text-white/80 text-center">Casal: 55 € nesta visita. Poupa {casalSeparate - 55} € face a uma visita separada de {casalSeparate} €.</p>}
        {offerPreview && view === 'carpet' && <p className="text-sm text-white/80 text-center">Por cada 5 m², paga 4. Preço por m² confirmado após avaliação.{carpetValidCount > 0 && ` Área: ${fmt(carpetTotalAreaValue)} m² · paga ${fmt(carpetTotalAreaValue - Math.floor(carpetTotalAreaValue / 5))} m².`}</p>}
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
                sizeId={opt.id}
                label={opt.label}
                unitLabel={typeof opt.cleaningPrice === 'number' ? <PriceCompare original={opt.cleaningPrice} promo={Number(mattressUnitPrice(opt))} suffix="/un." /> : 'Sob orçamento'}
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
                sizeId={opt.id}
                label={opt.label}
                unitLabel={typeof opt.cleaningPrice === 'number' ? <PriceCompare original={opt.cleaningPrice} promo={Number(sofaUnitPrice(opt))} suffix="/un." /> : 'Sob orçamento'}
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
            <QuizCareIntro service="chairs">Escolha quantas cadeiras quer juntar à mesma visita.</QuizCareIntro>
            <div className="flex items-center justify-center gap-6">
              <button onClick={decChairs} disabled={chairsQty <= 0} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
              <span className="text-4xl font-black text-gold w-10 text-center tabular-nums leading-none">{chairsQty}</span>
              <button onClick={incChairs} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
            </div>
            {/* Preço da quantidade escolhida sempre visível — antes só se via
                um número de cadeiras sem preço nenhum, ao contrário do
                colchão/sofá que mostram sempre "X€/un." (pedido explícito
                2026-09-08: "senão o cliente não sabe o que está a pagar"). */}
            <p className="font-playfair text-2xl font-bold tabular-nums">
              {chairsRegularPrice !== null && chairsCleanPrice !== null
                ? <PriceCompare original={chairsRegularPrice} promo={chairsCleanPrice} />
                : <span className="text-gold">Sob orçamento</span>}
            </p>
            <p className="text-sm text-white/80 text-center leading-snug">{offerPreview ? `${chairsQty} cadeiras · paga ${chairsQty - chairsFree}. Uma oferta por conjunto de 4.` : `Mínimo de ${CHAIRS_MIN_QTY} cadeiras`}</p>
          </>
        )}
        {view === 'carpet' && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <p className="text-sm text-white/80 text-center leading-snug -mt-1 mb-1">
              {offerPreview ? "A oferta fica incluída no pedido de avaliação." : "Sem preço fixo por m², cada tapete é sempre orçamentado à parte."}
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
                    <span className="text-sm font-bold uppercase tracking-wider text-white/80">Tapete {i + 1}</span>
                    {carpetItems.length > 1 && (
                      <button
                        onClick={() => setCarpetItems(prev => carpetRemoveItem(prev, item.id))}
                        aria-label="Remover tapete"
                        className="w-5 h-5 rounded-sm flex items-center justify-center text-white/80 hover:text-white/70 hover:bg-white/10 transition-colors touch-manipulation"
                      >×</button>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
                        value={item.largura}
                        onChange={(e) => setCarpetItems(prev => carpetUpdateItem(prev, item.id, 'largura', e.target.value))}
                        className="w-full h-11 text-center text-base font-bold bg-white/[0.05] text-white placeholder:text-white/80 rounded-sm border-2 border-white/15 focus:border-gold focus:outline-none transition-colors"
                      />
                      <span className="text-sm text-center uppercase tracking-wide text-white/80">Largura (m)</span>
                    </div>
                    <span className="text-white/80 text-base pb-4">×</span>
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
                        value={item.comprimento}
                        onChange={(e) => setCarpetItems(prev => carpetUpdateItem(prev, item.id, 'comprimento', e.target.value))}
                        className="w-full h-11 text-center text-base font-bold bg-white/[0.05] text-white placeholder:text-white/80 rounded-sm border-2 border-white/15 focus:border-gold focus:outline-none transition-colors"
                      />
                      <span className="text-sm text-center uppercase tracking-wide text-white/80">Comprimento (m)</span>
                    </div>
                  </div>
                  <div className="text-right pt-1 border-t border-white/[0.06]">
                    <span className="text-sm text-white/80">Área </span>
                    <span className="text-base font-bold text-gold tabular-nums">{area !== null ? `${area % 1 === 0 ? area : area.toFixed(2).replace('.', ',')} m²` : '0 m²'}</span>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setCarpetItems(prev => carpetAddItem(prev))}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border-2 border-dashed border-gold/30 text-gold/80 text-base font-bold hover:border-gold/60 hover:bg-gold/[0.04] transition-all touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar outro tapete
            </button>
            </div>
          </div>
        )}

        {view === 'carpet' && incompleteCarpets && <p className="text-sm text-amber-200">Preencha as duas medidas de cada tapete ou remova a peça incompleta.</p>}
        <div className="flex items-center gap-3 w-full max-w-xs mt-1">
          <button
            onClick={() => setView('summary')}
            className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/80 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-base font-semibold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </button>
          <button
            disabled={view === 'carpet' && incompleteCarpets}
            onClick={() => setView('summary')}
            className="disabled:opacity-40 flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base   touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
          >
            Confirmar
          </button>
        </div>
      </div>
    );
  }

  const rowConfig: { view: View; label: string; summary: string; priceLine: ReactNode; selected: boolean; imagePosition: string }[] = [
    { view: 'mattress', imagePosition: '0% 0%', label: 'Colchão', summary: mattressSummary, priceLine: mattressPriceLine, selected: mattressQtyTotal > 0 },
    { view: 'sofa', imagePosition: '100% 0%', label: 'Sofá', summary: sofaSummary, priceLine: sofaPriceLine, selected: sofaQtyTotal > 0 },
    { view: 'chairs', imagePosition: '0% 100%', label: 'Cadeiras', summary: chairsSummary, priceLine: chairsPriceLine, selected: chairsQty > 0 },
    { view: 'carpet', imagePosition: '100% 100%', label: 'Tapete', summary: carpetSummary, priceLine: 'Limpe 5 m², pague 4', selected: carpetValidCount > 0 },
  ];

  const visibleRows = rowConfig.filter(row => row.view !== primaryService || row.selected);
  const compactRows = visibleRows.length <= 3;

  return (
    <div className="flex flex-col gap-2 overflow-hidden items-center w-full">
      <p className="text-gold text-sm font-bold tracking-[0.08em] uppercase mb-0.5 text-center w-full">
        {offerPreview ? 'APROVEITE A MESMA VISITA' : 'UM BÓNUS PARA SI'}
      </p>
      <h2 className="type-quote-title font-playfair    text-white text-center w-full">
        {offerPreview ? 'Quer limpar mais alguma coisa?' : 'Adicione mais um serviço'}
      </h2>
      <p className="text-sm text-white/80 text-center max-w-xs leading-relaxed -mt-1">
        {offerPreview
          ? <>Preço reduzido em cada artigo que juntar a esta visita. Deslocação excluída.</>
          : <>Combine mais um serviço na mesma visita e poupe no preço de cada artigo. Deslocação excluída.</>}
      </p>

      {/* Até três sugestões: linhas compactas, sem cartão isolado à esquerda.
          Com quatro sugestões, preservar a grelha 2x2 para limitar a altura. */}
      <div className={cn('grid gap-2 w-full max-w-sm mt-2', compactRows ? 'grid-cols-1' : 'grid-cols-2')}>
        {visibleRows.map(row => (
          <button
            key={row.view}
            onClick={() => { if (offerPreview && row.view === 'mattress' && mattressQtyTotal === 0) setMattQty('casal', 1); setView(row.view); }}
            className={cn(
              'group relative flex items-center gap-3 rounded-sm border px-3 text-left transition-all duration-200 touch-manipulation active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
              compactRows ? 'min-h-[78px] py-1.5 pr-12' : 'min-h-[132px] flex-col justify-center py-2.5',
              row.selected
                ? offerPreview ? 'border-gold/40 bg-white/[0.04]' : 'border-gold bg-[#1a2a1a] shadow-[0_0_14px_rgba(212,175,55,0.20)]'
                : offerPreview ? 'border-white/10 bg-white/[0.025] hover:border-gold/30' : 'border-dashed border-gold/55 bg-gold/[0.025] hover:border-gold hover:bg-gold/[0.05]'
            )}
          >
            <span className={cn(
              'absolute w-7 h-7 rounded-full border flex items-center justify-center transition-colors duration-200',
              compactRows ? 'top-1/2 right-3 -translate-y-1/2' : 'top-1.5 right-1.5',
              row.selected ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
            )}>
              {row.selected
                ? <Check className="w-2.5 h-2.5 text-[#12121e]" strokeWidth={3} />
                : <Plus className="w-2.5 h-2.5 text-gold" strokeWidth={3} />}
            </span>
            <span
              aria-hidden="true"
              className="block w-16 h-16 shrink-0 transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
              style={{ backgroundImage: 'url(/images/services/quote-furniture.png)', backgroundSize: '200% 200%', backgroundPosition: row.imagePosition }}
            />
            <span className={cn('min-w-0 flex flex-col gap-1', !compactRows && 'w-full')}>
              <span className="text-base font-bold text-white">{row.label}</span>
              {offerPreview ? <span className="flex flex-col gap-1">
                <span className="text-sm font-bold uppercase tracking-[0.16em] text-white/80">Preço nesta visita</span>
                <span className="text-lg font-black leading-none text-gold">{row.priceLine}</span>
              </span> : <span className="text-sm font-normal leading-relaxed text-gold/75">{row.summary}</span>}
              {offerPreview && row.selected && <span className="text-sm text-white/80">{row.summary}</span>}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 w-full max-w-sm mt-2">
        <button
          onClick={onBack}
          className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/80 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-base font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button
          disabled={incompleteCarpets}
          onClick={onContinue}
          className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base   touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
        >
          Finalizar Orçamento
        </button>
      </div>
    </div>
  );
};

export default QuizComboUpsellScreen;

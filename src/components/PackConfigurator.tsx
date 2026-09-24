import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Plus, Trash2, MessageCircle, BadgePercent, Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cities } from '@/data/serviceCatalog';
import QuizFurnitureImage from '@/components/quiz/QuizFurnitureImage';
import QuizTopBadge from '@/components/quiz/QuizTopBadge';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import { calculateCustomPack, makePackItem, PACK_KIND_LABEL, type PackKind, type CustomPackItem, type PackExtra } from '@/lib/customPack';
import { PACK_PERK_MATTRESS_OFF, PACK_PERK_SOFA_PRICE, PACK_PERK_CHAIRS_SET, PACK_PERK_MIN_ORDER } from '@/constants/packPerks';
import { WHATSAPP_BASE } from '@/constants/business';

const money = (n: number) => n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

/** Sprite de artigo (o mesmo do quiz) por tipo de pack. Tapete e alcatifa
 * partilham o quadrante "carpet" do sprite — decorativo, não distingue os
 * dois visualmente, mas identifica logo o artigo entre sofá/colchão/cadeiras. */
const KIND_ICON: Record<PackKind, 'sofa' | 'mattress' | 'chairs' | 'carpet'> = { sofa: 'sofa', mattress: 'mattress', chairs: 'chairs', rug: 'carpet', carpet: 'carpet' };

const EXTRA_CHIP_LABEL: Record<PackExtra, string> = { none: 'Só limpeza', premium: 'Impermeabilizar Premium', essencial: 'Impermeabilizar Essencial', 'anti-acaros': 'Anti-ácaros' };

type Treatment = 'none' | 'waterproof' | 'anti-acaros';
const TREATMENT_LABEL: Record<Treatment, string> = { none: 'Só limpeza', waterproof: 'Impermeabilizar', 'anti-acaros': 'Anti-ácaros' };
const treatmentOf = (extra: PackExtra): Treatment => extra === 'premium' || extra === 'essencial' ? 'waterproof' : extra;
/** Colchão não se impermeabiliza; sofá e cadeiras têm as três escolhas. */
const treatmentsFor = (kind: PackKind): Treatment[] => kind === 'mattress' ? ['none', 'anti-acaros'] : ['none', 'waterproof', 'anti-acaros'];

/** Escolha de tratamento: uma linha larga por opção, com círculo de seleção,
 * nome e preço à direita. Em três colunas o "Impermeabilizar" não cabia a
 * 375px sem letra pequena demais, e a lista lê-se melhor por quem tem mais
 * dificuldade com botões pequenos. */
const TreatmentRow = ({ active, onClick, title, price, top }: { active: boolean; onClick: () => void; title: string; price: string; top?: boolean }) => (
  <button type="button" role="radio" aria-checked={active} onClick={onClick}
    className={cn('flex min-h-[48px] w-full items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-left transition-colors touch-manipulation',
      active ? 'border-gold bg-gold/10' : 'border-white/15 bg-white/[0.04] hover:border-gold/50')}>
    <span aria-hidden="true" className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-gold bg-gold' : 'border-white/35')}>
      {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </span>
    <span className="min-w-0 flex-1 text-[15px] font-semibold text-white">{title}</span>
    {top && <QuizTopBadge className="!gap-0.5 !px-1.5 !py-0.5 [&>span]:!text-[10px]" />}
    <span className={cn('shrink-0 text-sm font-semibold tabular-nums', active ? 'text-gold' : 'text-white/60')}>{price}</span>
  </button>
);

/** Nível de impermeabilização: dois cartões lado a lado, Premium com o selo TOP. */
const TierCard = ({ active, onClick, title, price, note, top }: { active: boolean; onClick: () => void; title: string; price: string; note: string; top?: boolean }) => (
  <button type="button" role="radio" aria-checked={active} onClick={onClick}
    className={cn('relative flex min-h-[76px] flex-col items-center justify-center rounded-xl border-2 px-2 pb-2 pt-3 text-center transition-colors touch-manipulation',
      active ? 'border-gold bg-white/[0.06] shadow-[0_0_0_3px_rgba(212,175,55,0.18)]' : 'border-white/15 bg-white/[0.04] hover:border-gold/50')}>
    {top && <QuizTopBadge className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 !gap-0.5 !px-1.5 !py-0.5 [&>span]:!text-[10px]" />}
    <span className="flex items-center gap-1 text-[15px] font-bold text-white">
      {active && <Check className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />}{title}
    </span>
    <span className={cn('text-sm font-semibold tabular-nums', active ? 'text-gold' : 'text-white/75')}>{price}</span>
    <span className="mt-0.5 whitespace-pre-line text-xs leading-tight text-white/60">{note}</span>
  </button>
);

/** Chip compacto (tamanho, tratamento, chaise longue): ativo com borda dourada. */
const Chip = ({ active, onClick, children, className, check = true }: { active: boolean; onClick: () => void; children: ReactNode; className?: string; check?: boolean }) => (
  <button type="button" aria-pressed={active} onClick={onClick}
    className={cn('inline-flex h-9 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg border px-2.5 text-[13px] font-semibold transition-colors touch-manipulation',
      active ? 'border-gold bg-gold/10 text-gold' : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-gold/40', className)}>
    {active && check && <Check className="h-3.5 w-3.5 shrink-0 text-gold" />}
    {children}
  </button>
);

const Stepper = ({ value, onChange, min = 1 }: { value: number; onChange: (n: number) => void; min?: number }) => (
  <div className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.04]">
    <button type="button" aria-label="Diminuir quantidade" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
      className="flex h-full w-9 items-center justify-center disabled:opacity-30 touch-manipulation"><Minus className="h-3.5 w-3.5" /></button>
    <span className="w-6 text-center text-sm font-bold tabular-nums">{value}</span>
    <button type="button" aria-label="Aumentar quantidade" onClick={() => onChange(value + 1)}
      className="flex h-full w-9 items-center justify-center text-gold touch-manipulation"><Plus className="h-3.5 w-3.5" /></button>
  </div>
);

interface Props {
  /** Artigos com que o configurador abre. Vazio abre só com um sofá. */
  initialKinds?: PackKind[];
  /** Tratamento inicial dos artigos que o aceitam (packs de impermeabilização). */
  initialExtra?: PackExtra;
  initialCity?: string;
  /** Origem do clique de WhatsApp, lida pelo delegado global de tracking. */
  source: string;
}

/**
 * Configurador de packs, usado pelas páginas pack × cidade (`/packs`, o
 * configurador sem cidade, foi removido — estas são os únicos packs do
 * site). Não deve voltar a existir uma cópia inline deste JSX numa página
 * nova — é a armadilha que já aconteceu com o widget de preços.
 */
export default function PackConfigurator({ initialKinds, initialExtra = 'none', initialCity = '', source }: Props) {
  const [items, setItems] = useState<CustomPackItem[]>([]);
  const [city, setCity] = useState('');
  /** Ordem de exibição dos cartões (sofá, colchão, …): fixa-se na primeira vez
   * que cada tipo aparece e nunca se reordena depois. Sem isto, a posição de
   * cada cartão vinha da posição do seu artigo mais antigo dentro de `items` —
   * remover só um tamanho (ex. "1 Lugar" do sofá) podia deixar outro grupo com
   * um índice mais baixo e o cartão saltava de sítio sozinho. */
  const groupOrderRef = useRef<string[]>([]);

  useEffect(() => {
    setCity(initialCity);
    const kinds = initialKinds?.length ? initialKinds : (['sofa'] as PackKind[]);
    setItems(kinds.map((kind, i) => ({ ...makePackItem(kind, `initial-${i}`), extra: initialExtra })));
    groupOrderRef.current = [];
  }, [initialCity, initialExtra, initialKinds]);

  const prices = calculateCustomPack(items, city);
  const patch = (id: string, values: Partial<CustomPackItem>) => setItems(old => old.map(item => item.id === id ? { ...item, ...values } : item));
  /** Sofás e colchões ficam num só cartão por tipo, com um tamanho por linha:
   * a pessoa escolhe vários tamanhos (Solteiro e Casal) e a quantidade de
   * cada um. Por baixo continuam a ser artigos separados, por isso o cálculo
   * do preço de pack (primeiro artigo a tabela) não muda. */
  const groupKey = (item: CustomPackItem) => item.kind === 'sofa' || item.kind === 'mattress' ? item.kind : item.id;
  const groups = items.reduce<{ key: string; kind: PackKind; idx: number[] }[]>((acc, item, i) => {
    const key = groupKey(item);
    const group = acc.find(g => g.key === key);
    if (group) group.idx.push(i); else acc.push({ key, kind: item.kind, idx: [i] });
    return acc;
  }, []);
  groups.forEach(g => { if (!groupOrderRef.current.includes(g.key)) groupOrderRef.current.push(g.key); });
  groups.sort((a, b) => groupOrderRef.current.indexOf(a.key) - groupOrderRef.current.indexOf(b.key));
  const toggleSize = (kind: PackKind, groupItems: CustomPackItem[], size: string) => {
    const existing = groupItems.find(i => i.size === size);
    if (existing) { if (groupItems.length > 1) setItems(old => old.filter(i => i.id !== existing.id)); return; }
    setItems(old => [...old, { ...makePackItem(kind, crypto.randomUUID()), size, extra: groupItems[0]?.extra ?? 'none' }]);
  };
  const missingKinds = (Object.keys(PACK_KIND_LABEL) as PackKind[]).filter(kind => !items.some(i => i.kind === kind));
  const add = (kind: PackKind) => setItems(old => {
    if (kind !== 'sofa' && kind !== 'mattress') return [...old, makePackItem(kind, crypto.randomUUID())];
    const fresh = makePackItem(kind, crypto.randomUUID());
    const same = old.find(i => i.kind === kind && i.size === fresh.size);
    if (same) return old.map(i => i === same ? { ...i, qty: i.qty + 1 } : i);
    return [...old, { ...fresh, extra: old.find(i => i.kind === kind)?.extra ?? 'none' }];
  });

  const msg = [
    `Olá! Gostaria de confirmar este pack personalizado em ${city}:`,
    ...prices.lines.map(l => `${l.label}: ${l.amount === null ? 'sob orçamento' : money(l.amount)}${l.perkApplied ? ` (preço de pack, tabela ${money(l.tablePrice ?? 0)})` : ''}${l.quote && l.amount !== null ? ' + extra sob orçamento' : ''}`),
    `Serviços: ${money(prices.subtotal)}`,
    ...(prices.savings > 0 ? [`Poupança do pack: ${money(prices.savings)}`] : []),
    `Deslocação: ${prices.travel === null ? 'a confirmar' : money(prices.travel)}`,
    `${prices.quote ? 'Subtotal conhecido' : 'Estimativa total'}: ${money(prices.total)}${prices.quote ? ' + valores sob orçamento' : ''}`,
    'Podem confirmar o valor e a disponibilidade?',
  ].join('\n');

  /** Resumo curto de um artigo para o cartão lateral; a versão longa
   * (`line.label`) fica para a mensagem de WhatsApp. */
  const shortLabel = (item: CustomPackItem) => {
    const options = item.kind === 'sofa' ? sofaPrices : item.kind === 'mattress' ? mattressPrices : null;
    const size = options?.find(p => p.id === item.size)?.label;
    return [
      PACK_KIND_LABEL[item.kind],
      size,
      item.kind === 'rug' || item.kind === 'carpet' ? (item.width && item.length ? `${item.width} × ${item.length} m` : null) : `×${item.qty}`,
      item.kind === 'sofa' && item.chaise ? 'chaise' : null,
      item.extra !== 'none' && item.kind !== 'rug' && item.kind !== 'carpet' ? EXTRA_CHIP_LABEL[item.extra] : null,
    ].filter(Boolean).join(' · ');
  };

  // Em desktop, localidade e resumo ficam numa coluna à direita dos artigos, para o configurador caber num só ecrã.
  // Com um só cartão, a grelha dos artigos teria a segunda coluna vazia: cartão e resumo ficam juntos e centrados,
  // com as mesmas larguras que têm quando há vários cartões (metade da coluna dos artigos + 320px).
  const singleGroup = groups.length === 1;
  return (
    <div className={cn('space-y-4 lg:grid lg:grid-rows-[auto_1fr_auto] lg:gap-x-4 lg:gap-y-3 lg:space-y-0', singleGroup ? 'lg:grid-cols-[minmax(0,calc((100%_-_348px)/2))_320px] lg:justify-center' : 'lg:grid-cols-[minmax(0,1fr)_320px]')}>
      <label className="flex items-center gap-3 rounded-xl border border-white/15 bg-checker-modal text-white px-3 py-2 lg:col-start-2 lg:row-start-1 lg:py-1">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-white/60">Localidade</span>
        <select className="h-9 min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none [&>option]:text-[#111111]" value={city} onChange={e => setCity(e.target.value)}>
          <option value="">Escolha a localidade</option>
          {cities.map(c => <option key={c.slug}>{c.name}</option>)}
          <option>Outra localidade</option>
        </select>
      </label>

      <section aria-label="Configurar artigos" className={cn('min-w-0 space-y-3 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:grid lg:gap-3 lg:space-y-0', !singleGroup && 'lg:grid-cols-2')}>

        {groups.map(group => {
          const lead = items[group.idx[0]];
          const groupItems = group.idx.map(i => items[i]);
          const lines = group.idx.map(i => prices.lines[i]).filter(Boolean);
          const sizeOptions = group.kind === 'sofa' ? sofaPrices : group.kind === 'mattress' ? mattressPrices : null;
          const measured = group.kind === 'rug' || group.kind === 'carpet';
          const isMain = group.idx.includes(0);
          const perk = lines.some(l => l.perkApplied);
          const amount = lines.some(l => l.amount === null) ? null : lines.reduce((sum, l) => sum + (l.amount ?? 0), 0);
          const table = lines.reduce((sum, l) => sum + (l.tablePrice ?? 0), 0);
          const perkNote = lines.length === 1 && lines[0].perkNote && lines[0].perkNote !== 'preço de pack' ? lines[0].perkNote : null;
          return <article key={group.key} className={cn('space-y-2.5 rounded-xl border bg-checker-modal p-3 text-white', isMain ? 'border-white/15' : 'border-gold/45')}>
            <div className="flex items-center gap-2.5">
              <QuizFurnitureImage service={KIND_ICON[group.kind]} sizeId={sizeOptions ? lead.size : undefined} className="!h-9 !w-9 shrink-0 rounded-lg bg-[#F5F2E8]" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold leading-tight">{PACK_KIND_LABEL[group.kind]}</h3>
                {isMain && !perk
                  ? <p className="text-[11px] text-white/60">Artigo principal</p>
                  : perk
                    ? <p className="flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37]"><BadgePercent className="h-3 w-3 shrink-0" />{perkNote ? `Preço de pack · ${perkNote}` : 'Preço de pack'}</p>
                    : <p className="text-[11px] text-white/60">{lead.extra !== 'none' ? 'Com tratamento: preço de tabela' : !prices.perkEligible ? 'Preço de tabela' : 'Preço de pack'}</p>}
              </div>
              <div className="shrink-0 text-right leading-tight tabular-nums">
                {amount === null ? <span className="text-xs font-semibold text-white/75">Sob orçamento</span> : <>
                  {perk && <s className="block text-[11px] text-white/45">{money(table)}</s>}
                  <span className={cn('text-sm font-bold', perk && 'text-[#D4AF37]')}>{money(amount)}</span>
                </>}
              </div>
              <button type="button" aria-label={`Remover ${PACK_KIND_LABEL[group.kind]}`} onClick={() => setItems(old => old.filter(i => !groupItems.includes(i)))} className="-mr-1 shrink-0 p-1.5 text-white/50 hover:text-[#D4AF37]"><Trash2 className="h-4 w-4" /></button>
            </div>

            {sizeOptions && <>
              <div className={cn('grid gap-1.5', sizeOptions.length >= 4 ? 'grid-cols-4' : 'grid-cols-3')} role="group" aria-label="Tamanhos (pode escolher vários)">
                {sizeOptions.map(p => <Chip key={p.id} active={groupItems.some(i => i.size === p.id)} onClick={() => toggleSize(group.kind, groupItems, p.id)} className="px-1 text-xs" check={false}>{p.label}</Chip>)}
              </div>
              <ul className="divide-y divide-white/10 rounded-lg bg-white/[0.04] px-2.5">
                {sizeOptions.filter(p => groupItems.some(i => i.size === p.id)).map(p => {
                  const item = groupItems.find(i => i.size === p.id)!;
                  const line = prices.lines[items.indexOf(item)];
                  return <li key={p.id} className="flex items-center gap-2 py-1.5">
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-xs font-semibold">{p.label}</p>
                      {line && line.amount !== null && <p className="text-[11px] tabular-nums text-white/60">
                        {line.perkApplied && line.tablePrice !== null && <s className="mr-1">{money(line.tablePrice)}</s>}{money(line.amount)}
                      </p>}
                    </div>
                    {group.kind === 'sofa' && <Chip active={item.chaise} onClick={() => patch(item.id, { chaise: !item.chaise })} className="h-8 px-2 text-xs">Chaise</Chip>}
                    <Stepper value={item.qty || 1} onChange={n => patch(item.id, { qty: n })} />
                  </li>;
                })}
              </ul>
            </>}

            {group.kind === 'chairs' && <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold">Quantidade</span>
              <Stepper value={lead.qty || 1} onChange={n => patch(lead.id, { qty: n })} />
            </div>}

            {measured ? <>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-white/60">Largura (m)<input inputMode="decimal" className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-white/[0.04] px-3 text-base text-white" value={lead.width} onChange={e => patch(lead.id, { width: e.target.value })} /></label>
                <label className="text-xs text-white/60">Comprimento (m)<input inputMode="decimal" className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-white/[0.04] px-3 text-base text-white" value={lead.length} onChange={e => patch(lead.id, { length: e.target.value })} /></label>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-white/60">Sempre sob orçamento.</p>
                {groups.filter(g => g.kind === group.kind).at(-1)?.key === group.key && <button type="button" onClick={() => add(group.kind)}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-[#D4AF37]/60 px-2.5 text-xs font-semibold text-[#D4AF37] transition-colors touch-manipulation hover:border-[#D4AF37] hover:bg-[#D4AF37]/10">
                  <Plus className="h-3 w-3" />Outra peça com medidas diferentes
                </button>}
              </div>
            </> : (() => {
              const current = treatmentOf(lead.extra);
              const setExtra = (extra: PackExtra) => setItems(old => old.map(i => groupItems.includes(i) ? { ...i, extra } : i));
              // Quanto custa este cartão com cada tratamento, com as regras do
              // pack aplicadas (um artigo com tratamento perde o preço de pack).
              const totalWith = (extra: PackExtra) => {
                const withExtra = items.map(i => groupItems.includes(i) ? { ...i, extra } : i);
                const withLines = group.idx.map(i => calculateCustomPack(withExtra, city).lines[i]);
                return withLines.some(l => !l || l.amount === null || l.quote) ? null : withLines.reduce((sum, l) => sum + (l.amount ?? 0), 0);
              };
              const base = totalWith('none');
              const delta = (extra: PackExtra) => {
                // Anti-ácaros nas cadeiras: sempre a taxa unitária, nunca um total.
                if (extra === 'anti-acaros' && group.kind === 'chairs') return '+5€/un.';
                const value = totalWith(extra);
                return value === null || base === null ? 'Sob orçamento' : `+${(value - base).toLocaleString('pt-PT')}€`;
              };
              const options = treatmentsFor(group.kind);
              return <div className="space-y-2.5 border-t border-white/10 pt-2.5">
                <p className="text-xs font-semibold text-white/75">Tratamento</p>
                <div role="radiogroup" aria-label="Tratamento" className="space-y-1.5">
                  {options.map(t => <TreatmentRow key={t} active={current === t} top={t === 'anti-acaros'}
                    onClick={() => setExtra(t === 'waterproof' ? (current === 'waterproof' ? lead.extra : 'premium') : t)}
                    title={TREATMENT_LABEL[t]}
                    price={t === 'none' ? 'Incluído' : t === 'waterproof' ? (delta('essencial').startsWith('+') ? `desde ${delta('essencial')}` : delta('essencial')) : delta('anti-acaros')} />)}
                </div>
                {current === 'waterproof' && <div role="radiogroup" aria-label="Nível de impermeabilização" className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.04] p-2 pt-4">
                  <TierCard active={lead.extra === 'premium'} top onClick={() => setExtra('premium')} title="Premium" price={delta('premium')} note={"Até 10 anos\naté 5 lavagens"} />
                  <TierCard active={lead.extra === 'essencial'} onClick={() => setExtra('essencial')} title="Essencial" price={delta('essencial')} note={"1 a 2 anos\naté 2 lavagens"} />
                </div>}
              </div>;
            })()}
          </article>;
        })}

      </section>

      {/* Só se oferecem os tipos que ainda não estão no pack: um tipo já
          acrescentado ganha tamanhos, quantidade ou outra peça no próprio cartão. */}
      {missingKinds.length > 0 && <section aria-label="Juntar à mesma visita" className={cn('rounded-xl border border-dashed border-[#D4AF37]/50 bg-checker-modal p-3 text-white lg:col-start-1 lg:row-start-3 lg:flex lg:items-center lg:gap-4 lg:py-2.5', singleGroup && 'lg:col-span-2')}>
        <div className="mb-2.5 flex items-baseline justify-between gap-2 lg:mb-0 lg:shrink-0 lg:flex-col lg:gap-0.5">
          <h3 className="text-[15px] font-semibold leading-tight">Juntar à mesma visita</h3>
          <span className="text-[11px] text-white/60">Uma só deslocação</span>
        </div>
        <div className={cn('grid gap-2 lg:flex lg:min-w-0 lg:flex-1 lg:flex-wrap lg:justify-end', missingKinds.length >= 3 ? 'grid-cols-3' : 'grid-cols-2', missingKinds.length >= 4 && 'sm:grid-cols-4', missingKinds.length === 5 && 'grid-cols-3 sm:grid-cols-5')}>
          {missingKinds.map(kind => <button type="button" key={kind} onClick={() => add(kind)} aria-label={`Acrescentar ${PACK_KIND_LABEL[kind]}`}
            className="group flex flex-col items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-1.5 pb-2 pt-2.5 text-center lg:flex-row lg:gap-2 lg:py-1.5 lg:pl-1.5 lg:pr-3 lg:text-left transition-colors touch-manipulation hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/10 active:scale-[0.98]">
            <QuizFurnitureImage service={KIND_ICON[kind]} className="!h-9 !w-9 shrink-0 rounded-lg bg-[#F5F2E8] lg:!h-8 lg:!w-8 lg:rounded-md" />
            <span className="text-xs font-semibold leading-tight">{PACK_KIND_LABEL[kind]}</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#D4AF37]"><Plus className="h-3 w-3" /><span className="lg:sr-only">Acrescentar</span></span>
          </button>)}
        </div>
      </section>}

      <section aria-label="O seu pack" className="rounded-xl border border-white/15 bg-checker-modal p-3 text-white sm:p-4 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6 lg:col-start-2 lg:row-start-2 lg:flex lg:flex-col lg:items-stretch">
        <div className="min-w-0 lg:mb-3">
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/60">O seu pack</h3>
          <ul className="divide-y divide-white/10">
            {prices.lines.map((line, i) => <li key={items[i].id} className="flex items-baseline justify-between gap-3 py-2 text-sm first:pt-0 lg:py-1">
              <span className="min-w-0 text-white/80">{shortLabel(items[i])}</span>
              <span className="shrink-0 tabular-nums">
                {line.amount === null ? <span className="text-white/75">Sob orçamento</span> : <>
                  {line.perkApplied && line.tablePrice !== null && <s className="mr-1 text-xs text-white/45">{money(line.tablePrice)}</s>}
                  <span className={cn('font-semibold', line.perkApplied ? 'text-[#D4AF37]' : 'text-white')}>{money(line.amount)}</span>
                  {line.quote && <span className="text-white/45"> +</span>}
                </>}
              </span>
            </li>)}
          </ul>
          <dl className="space-y-1 border-t border-white/10 pt-2 text-sm lg:pt-1">
            <div className="flex items-baseline justify-between"><dt className="text-white/60">Deslocação</dt><dd className="font-semibold tabular-nums">{prices.travel === null ? 'a confirmar' : prices.travel === 0 ? 'Grátis' : money(prices.travel)}</dd></div>
            {prices.savings > 0 && <div className="flex items-baseline justify-between font-semibold text-[#D4AF37]"><dt className="flex items-center gap-1"><BadgePercent className="h-4 w-4" />Poupa com o pack</dt><dd className="tabular-nums">{money(prices.savings)}</dd></div>}
          </dl>
          {prices.quote && <p className="mt-1.5 text-xs text-[#D4AF37]">+ artigos ou extras sob orçamento</p>}
          {items.length > 1 && !prices.perkEligible && <p className="mt-1.5 text-xs leading-snug text-gold">
            Faltam {money(PACK_PERK_MIN_ORDER - prices.tableSubtotal)} de subtotal para o preço de pack nos artigos acrescentados.
          </p>}
          {items.length === 1 && <p className="mt-1.5 text-xs leading-snug text-white/60">
            A partir de {PACK_PERK_MIN_ORDER}€ de subtotal, cada artigo que acrescentar entra com preço de pack: sofá desde {PACK_PERK_SOFA_PRICE['1-lugar']}€, menos {PACK_PERK_MATTRESS_OFF}€ em cada colchão, uma cadeira oferecida por cada {PACK_PERK_CHAIRS_SET}.
          </p>}
        </div>

        <div className="mt-3 rounded-xl border border-gold/25 bg-white/[0.04] p-3 md:mt-0 md:w-[320px] md:border-0 md:bg-none md:p-0 lg:mt-auto lg:w-auto lg:rounded-none lg:bg-transparent lg:border-t lg:border-white/10 lg:pt-3">
          <p className="flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60">{prices.quote ? 'Subtotal' : 'Total estimado'}</span>
            <span className="text-2xl font-bold tabular-nums text-[#D4AF37]">{money(prices.total)}</span>
          </p>
          {prices.valid
            ? <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
                className="mt-3 flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] px-3 py-3 text-[15px] font-semibold uppercase tracking-[0.02em] text-[#071a12] lg:gap-1.5 lg:px-2 lg:text-sm lg:tracking-normal shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]">
                <MessageCircle className="h-5 w-5 shrink-0" />Confirmar o meu orçamento
              </a>
            : <p role="status" className="mt-3 rounded-[10px] bg-white/[0.06] p-3 text-xs text-white/75">Escolha a localidade e complete quantidades e medidas válidas para pedir a confirmação.</p>}
          <p className="mt-1.5 text-center text-[11px] leading-snug text-white/60">Resposta em menos de 10 minutos · Uma só deslocação</p>
        </div>
      </section>
    </div>
  );
}

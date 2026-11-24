/**
 * QuizFormLazy: o questionário do site. Desde 24 Nov 2026 (dono: "o questionário vai precisar de subir de
 * nível") abre o cesto da visita (quiz/VisitBasket) em todo o site, já com o que a página sabe: a cidade, o
 * artigo, o tamanho, a quantidade e o pack. Carrega só quando se abre (fora do JS inicial).
 * As props antigas continuam aceites para não partir quem as passa.
 */
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { BasketItem, BasketPack } from './quiz/VisitBasket';

const VisitBasket = lazy(() => import('./quiz/VisitBasket'));

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  initialService?: string;
  initialServiceType?: 'cleaning' | 'waterproofing' | 'both';
  initialSofaSizeId?: string;
  initialSofaQty?: number;
  initialSofaItems?: { sizeId: string; qty: number; packEnabled?: boolean }[];
  initialMattressSizeId?: string;
  initialMattressQty?: number;
  initialMattressItems?: { sizeId: string; qty: number; packEnabled?: boolean }[];
  initialChairQty?: string;
  initialChairWaterproofing?: boolean;
  initialCarpetArea?: string;
  initialCarpetKind?: 'tapete' | 'alcatifa';
  initialCarpetItems?: import('./quiz/QuizTypes').CarpetItem[];
  initialWaterproofingTier?: 'essencial' | 'premium';
  problema?: string;
  skipToUpsell?: boolean;
  initialUpsellItems?: import('./quiz/QuizTypes').UpsellItemConfig[];
}

let seq = 0;
const id = () => `q${Date.now()}${seq++}`;

/** O que a página já sabe, como artigos do cesto. Sem tamanho escolhido, o cesto abre vazio (com as fotografias). */
export function itemsFromProps(p: Props): BasketItem[] {
  const treated = p.initialServiceType === 'waterproofing' || p.initialServiceType === 'both';
  const pack = (on?: boolean): BasketPack => (on ?? treated) ? (p.initialWaterproofingTier === 'essencial' ? 'essencial' : 'premium') : 'none';
  const out: BasketItem[] = [];
  const sofas = p.initialSofaItems ?? (p.initialSofaSizeId ? [{ sizeId: p.initialSofaSizeId, qty: p.initialSofaQty ?? 1 }] : []);
  for (const s of sofas) if (s.qty > 0 && s.sizeId !== '4+-lugares' && s.sizeId !== 'canto') out.push({ id: id(), kind: 'sofa', size: s.sizeId, qty: s.qty, pack: pack((s as { packEnabled?: boolean }).packEnabled) });
  const mattresses = p.initialMattressItems ?? (p.initialMattressSizeId ? [{ sizeId: p.initialMattressSizeId, qty: p.initialMattressQty ?? 1 }] : []);
  for (const m of mattresses) if (m.qty > 0) out.push({ id: id(), kind: 'mattress', size: m.sizeId, qty: m.qty, pack: (m as { packEnabled?: boolean }).packEnabled ? 'premium' : 'none' });
  const chairs = parseInt(p.initialChairQty ?? '', 10);
  if (chairs > 0) out.push({ id: id(), kind: 'chairs', qty: chairs, pack: pack(p.initialChairWaterproofing) });
  const rugKind = p.initialCarpetKind === 'alcatifa' ? 'carpet' : 'rug';
  for (const c of p.initialCarpetItems ?? []) if (c.largura && c.comprimento) out.push({ id: id(), kind: rugKind, qty: 1, pack: 'none', width: c.largura, length: c.comprimento });
  return out;
}

/** Sem artigo escolhido mas com o serviço da página: abre logo a folha desse artigo. */
export function kindFromProps(p: Props): BasketItem['kind'] | undefined {
  const s = p.initialService;
  if (s === 'sofa' || s === 'mattress' || s === 'chairs') return s;
  if (s === 'carpet') return p.initialCarpetKind === 'alcatifa' ? 'carpet' : 'rug';
  return undefined;
}

const QuizFormLazy = (props: Props) => {
  // Import on first opening, then retain the form across closing/reopening.
  const [hasOpened, setHasOpened] = useState(props.isOpen);
  useEffect(() => { if (props.isOpen) setHasOpened(true); }, [props.isOpen]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => itemsFromProps(props), [props.isOpen]);
  if (!hasOpened && !props.isOpen) return null;
  return <Suspense fallback={null}><VisitBasket isOpen={props.isOpen} onClose={props.onClose} initialCity={props.initialLocation ?? ''} initialItems={items} startKind={items.length ? undefined : kindFromProps(props)} /></Suspense>;
};

export default QuizFormLazy;

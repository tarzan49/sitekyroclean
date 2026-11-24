// A escolha do widget de preço (WaterproofPackPicker) como primeiro artigo do cesto da visita.
// Ficheiro à parte para o cesto (VisitBasket) continuar a carregar só quando se abre.
import type { PackChoice } from '../WaterproofPackPicker';
import type { BasketItem } from './VisitBasket';

export function choiceToItem(c: PackChoice): BasketItem {
  const id = `w${Date.now()}`;
  if (c.kind === 'chairs') return { id, kind: 'chairs', qty: c.qty, pack: c.extra };
  if (c.size === '6-lugares') return { id, kind: 'sofa', size: '5-lugares', seats: 6, qty: 1, pack: c.extra };
  return { id, kind: 'sofa', size: c.size === 'foto' ? '3-lugares' : c.size, qty: 1, pack: c.extra };
}

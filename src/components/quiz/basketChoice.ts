// A escolha do widget de preço (WaterproofPackPicker) como primeiro artigo do cesto da visita.
// Ficheiro à parte para o cesto (VisitBasket) continuar a carregar só quando se abre.
import type { PackChoice } from '../WaterproofPackPicker';
import type { BasketItem } from './VisitBasket';

export function choiceToItem(c: PackChoice): BasketItem {
  const id = `w${Date.now()}`;
  // O widget só oferece Blindado/Protegido/Renovado; outro extra entra como só limpeza.
  const pack: BasketItem['pack'] = c.extra === 'premium' || c.extra === 'essencial' ? c.extra : 'none';
  if (c.kind === 'chairs') return { id, kind: 'chairs', qty: c.qty, pack };
  if (c.size === '6-lugares') return { id, kind: 'sofa', size: '5-lugares', seats: 6, qty: c.qty || 1, pack };
  return { id, kind: 'sofa', size: c.size === 'foto' ? '3-lugares' : c.size, qty: c.qty || 1, pack };
}

/** Todos os artigos da escolha: um por tamanho de sofá (dono, 24 Nov: combinar 1, 2 e 3 lugares). */
export function choiceToItems(c: PackChoice): BasketItem[] {
  if (c.kind !== 'sofa' || !c.sofas?.length) return [choiceToItem(c)];
  return c.sofas.map((s, i) => ({ ...choiceToItem({ ...c, size: s.size, qty: s.qty }), id: `w${Date.now()}_${i}` }));
}

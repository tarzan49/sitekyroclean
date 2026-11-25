// Preço na barra fixa (dono, 25 Nov): quando o widget "O seu preço" tem um total do motor, a barra mostra-o ao lado do
// WhatsApp com a mensagem desse pedido. Sem total (nada escolhido ou sob orçamento) a barra fica só com o botão.
import { useSyncExternalStore } from 'react';

export interface PriceBarDeal { total: string; was?: string; travel?: string; href: string; source: string }

let deal: PriceBarDeal | null = null;
let owner: object | null = null;
const listeners = new Set<() => void>();
const emit = () => { listeners.forEach(l => l()); };

/** `key` é quem põe o preço (um widget): só ele o pode tirar, e o último a escolher ganha. */
export function setPriceBar(key: object, next: PriceBarDeal | null) {
  if (next) { owner = key; deal = next; emit(); return; }
  if (owner === key) { owner = null; deal = null; emit(); }
}
export const usePriceBar = () => useSyncExternalStore(l => { listeners.add(l); return () => { listeners.delete(l); }; }, () => deal, () => null);

import { useState, useEffect } from 'react';
import type { CarpetItem } from '@/components/quiz/QuizTypes';
import { type PriceRowQuizConfig } from '@/data/locationPriceTestimonialsData';
import { buildWidgetQuizConfig, type WidgetTier } from '@/lib/priceWidgetCalc';

// Estado + handlers do widget de preços, extraído (2026-09-08) das 3 cópias
// que existiam — ServicePriceSection.tsx, LocationServicePage.tsx e
// FreguesiaServicePage.tsx, ver "terceira armadilha" no CLAUDE.md. As 3
// tinham exatamente esta mesma lógica copiada à mão (só o JSX de apresentação
// divergia entre elas); agora vive uma única vez aqui, consumida por
// PriceWidget.tsx.
export function usePriceWidgetState(serviceSlug: string) {
  const [rowQuantities, setRowQuantities] = useState<Record<number, number>>({});
  const [chaiseLongueAddon, setChaiseLongueAddon] = useState(0);
  const [addonRows, setAddonRows] = useState<Set<number>>(new Set());
  const [addonTier, setAddonTier] = useState<WidgetTier>('premium');
  const [antiAcarosRows, setAntiAcarosRows] = useState<Set<number>>(new Set());
  // Simulador de tapetes (2026-09-06): várias peças medidas por linha, mesma
  // lógica do quiz — nunca uma área única. Alcatifa continua com rowQuantities.
  const [carpetItemsByRow, setCarpetItemsByRow] = useState<Record<number, CarpetItem[]>>({});

  // LocationServicePage/FreguesiaServicePage reaproveitam a mesma instância
  // do componente ao navegar entre serviços (troca de rota sem remount) — sem
  // isto, quantidades de um serviço ficavam presas ao mudar para outro.
  useEffect(() => {
    setRowQuantities({});
    setChaiseLongueAddon(0);
    setAddonRows(new Set());
    setAntiAcarosRows(new Set());
    setCarpetItemsByRow({});
  }, [serviceSlug]);

  const getCarpetItems = (i: number): CarpetItem[] => carpetItemsByRow[i] ?? [{ id: `tapete-${i}-1`, largura: '', comprimento: '' }];
  const carpetItemArea = (item: CarpetItem): number => {
    const l = parseFloat((item.largura + '').replace(',', '.'));
    const c = parseFloat((item.comprimento + '').replace(',', '.'));
    return !isNaN(l) && !isNaN(c) && l > 0 && c > 0 ? l * c : 0;
  };
  const setCarpetRow = (i: number, items: CarpetItem[]) => {
    setCarpetItemsByRow(prev => ({ ...prev, [i]: items }));
    const validCount = items.filter(it => carpetItemArea(it) > 0).length;
    setRowQuantities(prev => ({ ...prev, [i]: validCount }));
  };
  const updateCarpetItem = (i: number, id: string, field: 'largura' | 'comprimento', value: string) => {
    setCarpetRow(i, getCarpetItems(i).map(it => (it.id === id ? { ...it, [field]: value } : it)));
  };
  const addCarpetItem = (i: number) => {
    setCarpetRow(i, [...getCarpetItems(i), { id: `tapete-${i}-${Date.now()}`, largura: '', comprimento: '' }]);
  };
  const removeCarpetItem = (i: number, id: string) => {
    setCarpetRow(i, getCarpetItems(i).filter(it => it.id !== id));
  };

  const adjustQty = (i: number, delta: number) => {
    setRowQuantities(prev => {
      const next = Math.min(99, Math.max(0, (prev[i] ?? 0) + delta));
      if (next === 0) {
        setAddonRows(a => { if (!a.has(i)) return a; const n = new Set(a); n.delete(i); return n; });
        setAntiAcarosRows(a => { if (!a.has(i)) return a; const n = new Set(a); n.delete(i); return n; });
      }
      return { ...prev, [i]: next };
    });
  };

  const setAlcatifaQty = (i: number, value: number) => {
    setRowQuantities(prev => ({ ...prev, [i]: Math.max(0, value) }));
  };

  const toggleAddonRow = (i: number) => {
    setAddonRows(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };
  const toggleAntiAcarosRow = (i: number) => {
    setAntiAcarosRows(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };

  const buildConfig = (): PriceRowQuizConfig | null =>
    buildWidgetQuizConfig(serviceSlug, rowQuantities, chaiseLongueAddon, addonRows, addonTier, antiAcarosRows, carpetItemsByRow);

  return {
    rowQuantities, chaiseLongueAddon, setChaiseLongueAddon, addonRows, addonTier, setAddonTier, antiAcarosRows,
    getCarpetItems, updateCarpetItem, addCarpetItem, removeCarpetItem, carpetItemArea,
    adjustQty, setAlcatifaQty, toggleAddonRow, toggleAntiAcarosRow, buildConfig,
  };
}

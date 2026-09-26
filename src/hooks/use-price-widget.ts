import { carpetItemArea as measureCarpet } from '@/components/quiz/quizHelpers';
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
  const [tierChosen, setTierChosen] = useState(false);
  const [addonTier, setAddonTier] = useState<WidgetTier>('premium');
  // Simulador de tapetes (2026-09-06): várias peças medidas por linha, mesma
  // lógica do quiz — nunca uma área única.
  //
  // Alcatifa passou a usar o MESMO simulador de várias peças (2026-09-09,
  // pedido explícito: "e so replicar o widget de tapetes") — uma alcatifa
  // raramente é um único retângulo (várias divisões, corredores, recortes),
  // por isso faz sentido medir peça a peça como um tapete. A diferença: para
  // alcatifa, `rowQuantities[i]` guarda a SOMA das áreas (m² reais, usada no
  // cálculo "área×3€"), não a contagem de peças — para tapete continua a ser
  // a contagem (tapete nunca teve preço por m², é sempre "sob orçamento").
  const isAlcatifaService = serviceSlug === 'limpeza-alcatifas';
  const [carpetItemsByRow, setCarpetItemsByRow] = useState<Record<number, CarpetItem[]>>({});

  // LocationServicePage/FreguesiaServicePage reaproveitam a mesma instância
  // do componente ao navegar entre serviços (troca de rota sem remount) — sem
  // isto, quantidades de um serviço ficavam presas ao mudar para outro.
  useEffect(() => {
    setTierChosen(false);
    setAddonTier('premium');
    setRowQuantities({});
    setCarpetItemsByRow({});
  }, [serviceSlug]);

  const getCarpetItems = (i: number): CarpetItem[] => carpetItemsByRow[i] ?? [{ id: `tapete-${i}-1`, largura: '', comprimento: '' }];
  const carpetItemArea = (item: CarpetItem): number => measureCarpet(item) ?? 0;
  const setCarpetRow = (i: number, items: CarpetItem[]) => {
    setCarpetItemsByRow(prev => ({ ...prev, [i]: items }));
    const value = isAlcatifaService
      ? items.reduce((sum, it) => sum + carpetItemArea(it), 0)
      : items.filter(it => carpetItemArea(it) > 0).length;
    setRowQuantities(prev => ({ ...prev, [i]: value }));
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
    setRowQuantities(prev => ({ ...prev, [i]: Math.min(99, Math.max(0, (prev[i] ?? 0) + delta)) }));
  };

  // Impermeabilização e anti-ácaros não se escolhem aqui: decidem-se no ecrã
  // de tratamento do quiz, a seguir ao "Continuar" (pedido explícito
  // 2026-09-08). O caminho de extras que existia neste widget nunca corria e
  // guardava preços próprios; foi apagado a 2026-09-26.
  const buildConfig = (): PriceRowQuizConfig | null =>
    buildWidgetQuizConfig(serviceSlug, rowQuantities, addonTier, carpetItemsByRow);

  return {
    carpetItemsByRow, tierChosen, setTierChosen, rowQuantities, addonTier, setAddonTier,
    getCarpetItems, updateCarpetItem, addCarpetItem, removeCarpetItem, carpetItemArea,
    adjustQty, buildConfig,
  };
}

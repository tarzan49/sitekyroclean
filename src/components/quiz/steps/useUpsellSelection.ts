import { useState } from 'react';
import type { SofaItem, MattressItem } from '@/components/quiz/QuizTypes';

/** Owns the "pending item being configured" state for the Pack Família upsell overlay. */
export function useUpsellSelection() {
  const [pendingUpsellId, setPendingUpsellId] = useState<string | null>(null);
  const [pendingSofaItems, setPendingSofaItems] = useState<SofaItem[]>([]);
  const [pendingMattressItems, setPendingMattressItems] = useState<MattressItem[]>([]);
  const [pendingCarpetArea, setPendingCarpetArea] = useState('');
  const [pendingChairQtyNum, setPendingChairQtyNum] = useState(1);
  const [pendingWaterproof, setPendingWaterproof] = useState(false);

  const resetPending = () => {
    setPendingUpsellId(null);
    setPendingSofaItems([]);
    setPendingMattressItems([]);
    setPendingCarpetArea('');
    setPendingChairQtyNum(1);
    setPendingWaterproof(false);
  };

  return {
    pendingUpsellId, setPendingUpsellId,
    pendingSofaItems, setPendingSofaItems,
    pendingMattressItems, setPendingMattressItems,
    pendingCarpetArea, setPendingCarpetArea,
    pendingChairQtyNum, setPendingChairQtyNum,
    pendingWaterproof, setPendingWaterproof,
    resetPending,
  };
}

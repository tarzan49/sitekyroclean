/**
 * QuizFormLazy, thin wrapper that lazy-loads QuizForm on demand.
 * Keeps the heavy quiz bundle (~300 kB) OUT of the initial JS payload.
 * All components that render the quiz modal should import this instead
 * of importing QuizForm directly.
 */
import { lazy, Suspense } from 'react';

const QuizForm = lazy(() => import('./QuizForm'));

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  initialService?: string;
  initialServiceType?: 'cleaning' | 'waterproofing' | 'both';
  initialSofaSizeId?: string;
  initialSofaQty?: number;
  initialSofaItems?: { sizeId: string; qty: number; chaiseLongue?: boolean }[];
  initialMattressSizeId?: string;
  initialMattressQty?: number;
  initialMattressItems?: { sizeId: string; qty: number }[];
  initialChairQty?: string;
  initialCarpetArea?: string;
  problema?: string;
  skipToUpsell?: boolean;
  initialUpsellItems?: import('./quiz/QuizTypes').UpsellItemConfig[];
}

const QuizFormLazy = (props: Props) => (
  // Fallback is null, the modal manages its own visibility,
  // so there is nothing to show while the chunk loads.
  <Suspense fallback={null}>
    <QuizForm {...props} />
  </Suspense>
);

export default QuizFormLazy;

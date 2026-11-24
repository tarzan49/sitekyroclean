// Widget de preço dos tapetes (medidas, lavagem / + anti-odor, preço do bot) com o "+ Juntar mais artigos" a abrir
// o cesto da visita. Para as páginas fora do LandingServiceSections (problemas, materiais, página principal).
import { lazy, Suspense, useState } from 'react';
import TreatmentPackPicker from '@/components/TreatmentPackPicker';
import { treatmentToItem } from '@/components/quiz/basketChoice';
import type { BasketItem } from '@/components/quiz/VisitBasket';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));

export default function RugPricePicker({ city, source }: { city: string; source: string }) {
  const [basket, setBasket] = useState<BasketItem | null>(null);
  return <>
    <TreatmentPackPicker kind="rug" city={city} source={source} onMore={c => setBasket(treatmentToItem(c))} />
    {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(null)} initialCity={city} initialItems={[basket]} /></Suspense>}
  </>;
}

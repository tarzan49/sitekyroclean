// Widget de preço do modelo novo para qualquer limpeza (sofá, cadeiras, colchão), já com o
// "+ Juntar mais artigos à mesma visita" a abrir o cesto (dono, 24 Nov). Para páginas fora do
// LandingServiceSections (problemas, marcas, páginas principais).
import { lazy, Suspense, useState } from 'react';
import WaterproofPackPicker from '@/components/WaterproofPackPicker';
import TreatmentPackPicker from '@/components/TreatmentPackPicker';
import { choiceToItem, treatmentToItem } from '@/components/quiz/basketChoice';
import type { BasketItem } from '@/components/quiz/VisitBasket';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));

export type PickerService = 'limpeza-sofas' | 'limpeza-cadeiras' | 'limpeza-colchoes';
export const PICKER_SERVICES: string[] = ['limpeza-sofas', 'limpeza-cadeiras', 'limpeza-colchoes'];

export default function ServicePricePicker({ service, city, source }: { service: PickerService; city: string; source: string }) {
  const [basket, setBasket] = useState<BasketItem | null>(null);
  return <>
    {service === 'limpeza-colchoes'
      ? <TreatmentPackPicker kind="mattress" city={city} source={source} onMore={c => setBasket(treatmentToItem(c))} />
      : <WaterproofPackPicker kind={service === 'limpeza-cadeiras' ? 'chairs' : 'sofa'} city={city} source={source} onMore={c => setBasket(choiceToItem(c))} />}
    {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(null)} initialCity={city} initialItems={[basket]} /></Suspense>}
  </>;
}

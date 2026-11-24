// Widget de preço dos sofás com o botão "+ Juntar mais artigos à mesma visita" a abrir o cesto da visita
// (regra do dono, 24 Nov: em todas as páginas de serviço, por baixo dos lugares). Para as páginas fora do
// LandingServiceSections (problemas, materiais, marcas, página principal).
import { lazy, Suspense, useState } from 'react';
import WaterproofPackPicker, { type PackChoice } from '@/components/WaterproofPackPicker';
import { choiceToItems } from '@/components/quiz/basketChoice';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));

export default function SofaPricePicker({ city, source }: { city: string; source: string }) {
  const [basket, setBasket] = useState<PackChoice | null>(null);
  return <>
    <WaterproofPackPicker kind="sofa" city={city} source={source} onMore={c => setBasket(c)} />
    {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(null)} initialCity={city} initialItems={choiceToItems(basket)} /></Suspense>}
  </>;
}

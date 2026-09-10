import { useState } from 'react';
import QuizForm from '@/components/QuizForm';
import IndexV1 from './IndexV1';

// Development-only entry into the real form, using the real pricing engine.
export default function QuoteVisualPreview() {
  const [open, setOpen] = useState(true);
  const example = new URLSearchParams(window.location.search).get('exemplo');
  const service = example === 'antiacaros' ? 'mattress' : example === 'cadeiras' ? 'chairs' : example === 'tapetes' ? 'carpet' : 'sofa';
  const fromStart = !example || example === 'inicio';
  const original = example === 'pack';
  return <>
    <IndexV1 />
    {!open && <button className="fixed bottom-6 left-6 z-50 bg-gold text-[#071a12] px-5 py-3 font-bold" onClick={() => setOpen(true)}>Reabrir exemplo do orçamento</button>}
    <QuizForm isOpen={open} onClose={() => setOpen(false)} {...(fromStart ? {} : { initialLocation: "Porto",
      initialService: service, initialServiceType: original ? 'both' : 'cleaning',
      initialSofaItems: service === 'sofa' ? [{ sizeId: '3-lugares', qty: original || example === 'varios' ? 3 : 1, packEnabled: original }] : undefined,
      initialMattressSizeId: service === 'mattress' ? 'casal' : undefined,
      initialMattressQty: 1,
      initialChairQty: service === 'chairs' ? '4' : undefined,
      initialWaterproofingTier: 'premium' as const, skipToUpsell: service !== 'carpet' })} />
  </>;
}

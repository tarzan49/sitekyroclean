import { useState } from 'react';
import QuizForm from '@/components/QuizForm';
import IndexV1 from './IndexV1';

// Development-only entry into the real form, using the real pricing engine.
export default function QuoteVisualPreview() {
  const [open, setOpen] = useState(true);
  return <>
    <IndexV1 />
    {!open && <button className="fixed bottom-6 left-6 z-50 bg-gold text-[#071a12] px-5 py-3 font-bold" onClick={() => setOpen(true)}>Reabrir exemplo do orçamento</button>}
    <QuizForm isOpen={open} onClose={() => setOpen(false)} initialLocation="Porto"
      initialService="sofa" initialServiceType="both"
      initialSofaItems={[{ sizeId: '3-lugares', qty: 3, packEnabled: true }]}
      initialWaterproofingTier="premium" skipToUpsell />
  </>;
}

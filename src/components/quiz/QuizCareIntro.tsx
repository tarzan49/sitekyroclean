import QuizFurnitureImage from './QuizFurnitureImage';

export default function QuizCareIntro({ service, sizeId, children }: {
  service: 'sofa' | 'mattress' | 'chairs' | 'carpet'; sizeId?: string; children: React.ReactNode;
}) {
  return <div className="flex items-center gap-3 w-full max-w-sm rounded-sm border border-gold/15 bg-white/[0.025] px-3 py-2 text-left">
    <QuizFurnitureImage service={service} sizeId={sizeId} className="!w-16 !h-16" />
    <p className="text-xs text-white/75 leading-relaxed">{children}</p>
  </div>;
}

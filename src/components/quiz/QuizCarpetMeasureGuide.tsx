import QuizFurnitureImage from './QuizFurnitureImage';

export default function QuizCarpetMeasureGuide() {
  return <div className="w-full max-w-sm flex items-center gap-4 rounded-sm border border-gold/20 bg-white/[0.025] px-4 py-3">
    <div aria-hidden="true" className="relative shrink-0 pr-3 pb-3">
      <QuizFurnitureImage service="carpet" className="!w-20 !h-20" />
      <span className="absolute bottom-0 left-0 w-20 text-center text-sm text-gold">↔ largura</span>
      <span className="absolute right-0 top-4 text-gold">↕</span>
    </div>
    <div className="text-left min-w-0">
      <p className="text-base font-semibold text-white">Largura × comprimento</p>
      <p className="mt-1 text-sm leading-relaxed text-white/70">Meça de uma ponta à outra e indique os valores em metros.</p>
      <p className="mt-1 text-sm text-gold">Exemplo: 1,5 × 2 m</p>
    </div>
  </div>;
}

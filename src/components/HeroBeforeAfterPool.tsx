import ServiceResultsGallery from "@/components/ServiceResultsGallery";
import type { BeforeAfterCategory } from "@/data/beforeAfterPool";

interface Props {
  category: BeforeAfterCategory | BeforeAfterCategory[];
  className?: string;
  intervalMs?: number;
}

// Todos os heroes partilham os mesmos controlos e a pool completa da categoria.
// Nos heroes a galeria anda sozinha: 4 segundos por par (pedido explícito
// 2026-09-15), durante os quais a comparação começa em "Antes" e desliza
// devagar até "Depois" antes de trocar para o par seguinte. `category` pode
// ser uma lista (páginas de pack, que combinam dois serviços): os pares saem
// intercalados, ver `interleavePools`.
export default function HeroBeforeAfterPool({ category, className, intervalMs = 4000 }: Props) {
  const key = Array.isArray(category) ? category.join('+') : category;
  return (
    <div className={className}>
      <ServiceResultsGallery autoplay priority key={key} category={category} intervalMs={intervalMs} />
    </div>
  );
}

import ServiceResultsGallery from "@/components/ServiceResultsGallery";
import type { BeforeAfterCategory } from "@/data/beforeAfterPool";

interface Props {
  category: BeforeAfterCategory;
  className?: string;
  intervalMs?: number;
}

// All hero galleries share the same controls and complete category pool.
export default function HeroBeforeAfterPool({ category, className, intervalMs }: Props) {
  return (
    <div className={className}>
      <ServiceResultsGallery key={category} category={category} intervalMs={intervalMs} />
    </div>
  );
}

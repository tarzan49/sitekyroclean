import VisualExamplesGallery from './VisualExamplesGallery';
import { getServiceExamples } from '@/data/serviceExamples';
import type { LandingService } from '@/data/landingFaqPool';

export default function ServiceExamplesGallery({ serviceSlug }: { serviceSlug: LandingService }) {
  return (
    <VisualExamplesGallery
      id="exemplos"
      overline="Exemplos"
      heading="Veja alguns"
      name="exemplos"
      examples={getServiceExamples(serviceSlug)}
    />
  );
}

import VisualExamplesGallery from './VisualExamplesGallery';
import { getServiceExamples } from '@/data/serviceExamples';
import type { LandingService } from '@/data/landingFaqPool';

/** National service pages retain two columns at every screen size. */
export default function ServiceExamplesGallery({ serviceSlug }: { serviceSlug: LandingService }) {
  return (
    <div className="[&_[data-visual-gallery]_.grid]:!grid-cols-2">
      <VisualExamplesGallery
        id="exemplos"
        overline="Exemplos"
        heading="Veja alguns"
        name="exemplos"
        examples={getServiceExamples(serviceSlug)}
      />
    </div>
  );
}

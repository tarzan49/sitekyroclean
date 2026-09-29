import type { ProblemPage } from '@/data/problemSeoData';
import { getProblemHero, type BreadcrumbStep } from '@/data/problemHero';
import CommercialHero from './CommercialHero';

/** `breadcrumb` é o mesmo array que a página passa ao seu JSON-LD (`problemBreadcrumb`). */
export default function ProblemHero({ problem, city, breadcrumb }: { problem: ProblemPage; city?: string; breadcrumb: BreadcrumbStep[] }) {
  const hero = getProblemHero(problem, city);
  // O último passo é a própria página: texto, sem ligação, como no HTML estático.
  const breadcrumbs = breadcrumb.map((step, index) => ({ label: step.name, to: index < breadcrumb.length - 1 ? step.path : undefined }));
  return <CommercialHero title={hero.heading} subtitle={hero.intro} serviceSlug={hero.service.slug} city={city} breadcrumbs={breadcrumbs} whatsappHref={hero.waHref} source={`problem_hero_${problem.slug}_${city ?? 'national'}`} />;
}

import type { ProblemPage } from '@/data/problemSeoData';
import { getProblemHero } from '@/data/problemHero';
import CommercialHero from './CommercialHero';

export default function ProblemHero({ problem, city }: { problem: ProblemPage; city?: string }) {
  const hero = getProblemHero(problem, city);
  return <CommercialHero title={hero.heading} subtitle={hero.intro} serviceSlug={hero.service.slug} city={city} whatsappHref={hero.waHref} source={`problem_hero_${problem.slug}_${city ?? 'national'}`} />;
}

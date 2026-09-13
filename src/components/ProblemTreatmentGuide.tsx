import IllustratedProcessGuide from './IllustratedProcessGuide';
import type { ProblemTreatmentGuide as Guide } from '@/data/problemTreatmentGuides';

export default function ProblemTreatmentGuide({ guide, slug }: { guide: Guide; slug: string }) {
  return <IllustratedProcessGuide key={slug} guide={guide} heading="Como tratamos este" goldWord="problema" downloadName={slug} dark />;
}

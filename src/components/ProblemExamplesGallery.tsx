import VisualExamplesGallery from './VisualExamplesGallery';
import { getProblemLayout } from '@/data/problemLayout';
import { PROBLEM_IMAGES } from '@/constants/problemCardHelpers';
import type { ProblemPage } from '@/data/problemSeoData';

export default function ProblemExamplesGallery({ problem }: { problem: ProblemPage }) {
  return <VisualExamplesGallery id="exemplos" overline="Problemas comuns" heading="Veja alguns" name="exemplos" examples={getProblemLayout(problem).examples.map(example => ({
    id: example.id, label: example.title,
    alt: example.image?.alt ?? example.title,
    src: example.image?.src ?? PROBLEM_IMAGES[problem.relatedServices[0]][example.imageIndex],
  }))} />;
}

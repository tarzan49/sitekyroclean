import { getLandingProblems } from './landingServiceCopy';
import { selectLandingProblemImage } from './landingProblemImages';
import type { LandingService } from './landingFaqPool';

/** The same four service-specific examples in React and initial HTML. */
export function getServiceExamples(service: LandingService) {
  return getLandingProblems(service).map(problem => {
    const image = selectLandingProblemImage(service, problem.id, `/${service}`);
    if (!image) throw new Error(`Missing service example: ${problem.id}`);
    return { id: problem.id, label: problem.title, description: problem.description, src: image.src, alt: image.alt,
      thumbnailSrc: `/images/service-examples/${image.id}-400.webp`,
      thumbnailSrcSet: `/images/service-examples/${image.id}-400.webp 400w, /images/service-examples/${image.id}-800.webp 800w`,
      thumbnailSizes: "(max-width: 1279px) calc(50vw - 30px), 600px" };
  });
}

import { getProblemTreatmentGuide } from './problemTreatmentGuides';
import { selectLandingProblemImage } from './landingProblemImages';
import { getLandingProblems } from './landingServiceCopy';
import type { LandingService } from './landingFaqPool';
import type { ProblemPage } from './problemSeoData';
import { PRICE_PROMISE, RESPONSE_PROMISE, SATISFACTION_PROMISE } from '../constants/commercialPolicy';

// Base editorial do novo layout de /problemas, partilhada com o HTML inicial.
export function getProblemLayout(problem: ProblemPage) {
  const fallbackFaqs = [
    { question: 'Como é confirmado o orçamento?', answer: PRICE_PROMISE },
    { question: 'Quanto tempo demora a resposta ao pedido?', answer: `${RESPONSE_PROMISE}. Envie fotografias do artigo e indique a sua localidade para avaliarmos o pedido.` },
    { question: 'O que acontece se não ficar satisfeito?', answer: SATISFACTION_PROMISE },
    { question: 'É necessário avaliar o artigo antes do serviço?', answer: 'Sim. Confirmamos o material, o estado do artigo e os cuidados pretendidos. Explicamos as limitações antes de executar a intervenção.' },
  ];
  const faqs = [...problem.faqs];
  for (const faq of fallbackFaqs) {
    if (faqs.length >= 4) break;
    if (!faqs.some(item => item.question === faq.question)) faqs.push(faq);
  }
  const serviceSlug = problem.relatedServices[0];
  const processGuide = getProblemTreatmentGuide(problem);
  return {
    processGuide,
    examples: getLandingProblems(serviceSlug as LandingService).map((example, index) => ({ ...example,
      title: problem.slug === 'manchas-sofa' && index === 2 ? 'Estofos com animais em casa' : example.title,
      image: problem.slug === 'manchas-sofa' ? {
        src: `/images/problem-examples/sofa-${['stain', 'fibers', 'pets', 'wear'][index]}.webp`,
        alt: ['Mancha de café num sofá claro', 'Resíduos nas costuras de tecido cinzento', 'Pelos de animal num sofá verde', 'Borboto e desgaste num braço de sofá'][index],
      } : selectLandingProblemImage(serviceSlug, example.id, `/problemas/${problem.slug}`),
    })),
    process: processGuide.steps,
    faqs: faqs.slice(0, 4),
  };
}

import { getLandingProblems } from './landingServiceCopy';
import type { LandingService } from './landingFaqPool';
import { MATERIAL_PROCESS_GUIDES } from './materialProcessGuides';
import { SERVICE_PROCESS_GUIDES, type ProcessServiceSlug } from './serviceProcessGuides';
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
  const processGuide = MATERIAL_PROCESS_GUIDES[problem.slug]
    ?? (serviceSlug === 'limpeza-sofas' ? MATERIAL_PROCESS_GUIDES['limpeza-sofa-tecido'] : SERVICE_PROCESS_GUIDES[serviceSlug as ProcessServiceSlug]);
  return {
    processGuide,
    examples: getLandingProblems(serviceSlug as LandingService),
    process: processGuide.steps,
    faqs: faqs.slice(0, 4),
  };
}

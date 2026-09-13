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
  return {
    characteristics: [
      'O tipo de tecido e as indicações do fabricante.',
      'A origem e a antiguidade das manchas ou odores.',
      'Os produtos e tratamentos já aplicados no artigo.',
      'O estado do estofo e os limites da intervenção.',
    ],
    process: [
      { title: 'Avaliação do artigo', description: 'Identificamos o material, o estado do estofo e o cuidado pretendido.' },
      { title: 'Confirmação do serviço', description: 'Explicamos o tratamento adequado, as limitações e o orçamento antes de começar.' },
      { title: 'Intervenção', description: 'Executamos os cuidados acordados, de acordo com o material e as condições do artigo.' },
      { title: 'Verificação e cuidados', description: 'Revemos o resultado consigo e indicamos os cuidados e o tempo de espera antes de voltar a usar.' },
    ],
    faqs: faqs.slice(0, 4),
  };
}

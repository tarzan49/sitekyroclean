import type { ProblemPage } from './problemSeoData';
import { services, cityPrep } from './serviceCatalog';
import { locationPrices } from '../constants/travel';
import { WHATSAPP_BASE } from '../constants/business';
import { RESPONSE_PROMISE } from '../constants/commercialPolicy';

const introductions: Record<ProblemPage['category'], string> = {
  manchas: 'Cuidados profissionais para as manchas no seu estofo.',
  odores: 'Avaliamos a origem do odor e o cuidado adequado ao tecido.',
  saude: 'Limpeza e tratamentos opcionais, de acordo com o cuidado pretendido.',
  materiais: 'Cuidados específicos para o material do seu estofo.',
  animais: 'Cuidado profissional para estofos que fazem parte da vida dos seus animais.',
  preco: 'Conheça o orçamento para cuidar dos seus estofos.',
  urgencia: 'Disponibilidade para o próprio dia ou seguinte, sob confirmação.',
  metodo: 'Limpeza profissional adaptada ao tecido e ao estado do artigo.',
  protecao: 'Proteção do tecido para facilitar os cuidados do dia a dia.',
};

/** Hero content shared by both problem templates and initial HTML. */
export function getProblemHero(problem: ProblemPage, city?: string) {
  const service = services.find(item => item.slug === problem.relatedServices[0])!;
  const location = city ? `${cityPrep(city)} ${city}` : '';
  const price = service.priceFrom;
  const isQuote = /orçamento/i.test(price);
  const fee = city ? locationPrices[city] : undefined;
  const priceLabel = isQuote ? 'Sob orçamento' : `${service.slug === 'impermeabilizacao' ? 'Proteção' : 'Limpeza'} desde ${price}`;
  const travelLabel = fee === undefined ? 'Deslocação a partir de 10€' : `Deslocação ${fee}€`;
  return {
    heading: `${problem.h1}${location ? ` ${location}` : ''}`,
    title: problem.h1,
    location,
    intro: introductions[problem.category],
    eyebrow: 'Cuidado profissional ao domicílio',
    priceLabel,
    travelLabel,
    response: RESPONSE_PROMISE,
    priceLinkLabel: isQuote ? 'Como pedir orçamento' : 'Ver preços',
    service,
    waHref: `${WHATSAPP_BASE}?text=${encodeURIComponent(`Olá! Gostaria de pedir uma avaliação e orçamento: ${problem.keyword}${location ? ` ${location}` : ''}. Posso enviar fotografias do artigo.`)}`,
  };
}

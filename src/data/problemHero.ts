import type { ProblemPage } from './problemSeoData';
import { services, cityPrep } from './locationSeoData';
import { locationPrices } from '../constants/travel';
import { WHATSAPP_BASE } from '../constants/business';
import { AVAILABILITY_PROMISE, RESPONSE_PROMISE } from '../constants/commercialPolicy';

const introductions: Record<ProblemPage['category'], string> = {
  manchas: 'Avaliamos o tecido e a origem da mancha. Envie uma fotografia para confirmar o tratamento e o orçamento.',
  odores: 'Antes de tratar um odor, é preciso perceber a sua origem. Conte-nos o que aconteceu e ajudamos a avaliar o próximo passo.',
  saude: 'A limpeza e o tratamento anti-ácaros são cuidados distintos. Diga-nos o que procura para confirmarmos o serviço e o orçamento.',
  materiais: 'Cada revestimento pede cuidados próprios. Avaliamos o material e o seu estado antes de escolher o método de limpeza.',
  animais: 'Pelos, marcas ou odores dos seus animais? Conte-nos o que aconteceu para avaliarmos os cuidados de que o estofo precisa.',
  preco: 'Consulte os valores do serviço e indique o que precisa de limpar. Confirmamos os artigos, a deslocação e o preço antes de marcar.',
  urgencia: `Conte-nos o que aconteceu e indique a sua localidade. ${AVAILABILITY_PROMISE}`,
  metodo: 'O cuidado começa pela avaliação do artigo. Confirmamos o tratamento, o orçamento e as limitações antes de começar.',
  protecao: 'Quer facilitar os cuidados com o seu sofá? Avaliamos o tecido e explicamos as opções de proteção antes da aplicação.',
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
    intro: isQuote && problem.category === 'preco'
      ? 'O orçamento depende das medidas, do material e do estado do artigo. Envie uma fotografia, a largura e o comprimento para avaliarmos.'
      : introductions[problem.category],
    eyebrow: 'Cuidado profissional ao domicílio',
    priceLabel,
    travelLabel,
    response: RESPONSE_PROMISE,
    priceLinkLabel: isQuote ? 'Como pedir orçamento' : 'Ver preços',
    service,
    waHref: `${WHATSAPP_BASE}?text=${encodeURIComponent(`Olá! Gostaria de pedir uma avaliação e orçamento: ${problem.keyword}${location ? ` ${location}` : ''}. Posso enviar fotografias do artigo.`)}`,
  };
}

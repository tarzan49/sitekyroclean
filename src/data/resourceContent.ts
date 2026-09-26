import { PRICE_TABLE } from './locationPriceTestimonialsData';
import { pickReviewSubset } from './reviewsPool';
import { getTrustPointsForSeed } from '../constants/serviceTrustPool';
import { commercialHeroPriceLine, commercialHeroStats } from './commercialHeroCopy';
import { WHATSAPP_BASE } from '../constants/business';
import { RESPONSE_PROMISE, DRYING_PROMISE, SATISFACTION_PROMISE, PRICE_PROMISE, TREATMENT_EXTRAS, COVERAGE_PROMISE, AVAILABILITY_PROMISE } from '../constants/commercialPolicy';
import { locationPrices } from '../constants/travel';
import { sofaPrices, mattressPrices } from '../components/quiz/QuizTypes';
import type { BlogPost } from './blogData';

export const RESOURCE_BLOG_TITLE = 'Guias de limpeza, cuidados e preços';
export const RESOURCE_BLOG_INTRO = 'Encontre a resposta para o seu estofo e saiba como pedir o serviço certo.';
export const RESOURCE_FAQ_TITLE = 'Antes de marcar a limpeza';
export const RESOURCE_FAQ_INTRO = 'Preço, preparação, secagem e garantia: quatro respostas para decidir com confiança.';
export const RESOURCE_TRAVEL = `Deslocação à parte, a partir de ${Math.min(...Object.values(locationPrices))}€, confirmada pela localidade e morada.`;
export const RESOURCE_SERVICES = [
  { href: '/limpeza-sofas', label: 'Sofás' },
  { href: '/limpeza-colchoes', label: 'Colchões' },
  { href: '/limpeza-cadeiras', label: 'Cadeiras' },
  { href: '/limpeza-tapetes', label: 'Tapetes' },
  { href: '/limpeza-alcatifas', label: 'Alcatifas' },
  { href: '/impermeabilizacao', label: 'Impermeabilização' },
];
export const RESOURCE_FAQS = [
  { id: 'preco-e-deslocacao', question: 'Como sei o preço e o que está incluído?', answer: `${PRICE_PROMISE} ${RESOURCE_TRAVEL} Tapetes e alcatifas são sempre sob orçamento, com largura e comprimento de cada peça ou área. ${TREATMENT_EXTRAS}` },
  { id: 'preparar-e-marcar', question: 'Como preparo a visita e confirmo a disponibilidade?', answer: `Envie fotografias, medidas e localidade. Deixe espaço de trabalho e acesso a água e eletricidade conforme combinado; não aplique produtos previamente. ${RESPONSE_PROMISE}. ${AVAILABILITY_PROMISE} ${COVERAGE_PROMISE} Aveiro, Coimbra e Alentejo Litoral sob consulta.` },
  { id: 'secagem-e-protecao', question: 'Quando posso voltar a utilizar a peça?', answer: `${DRYING_PROMISE} Aguarde a secagem completa e siga as instruções dadas no final. A impermeabilização tem um tempo de cura próprio, que pode exigir 24 horas. A proteção é aplicada apenas em sofás e cadeiras compatíveis.` },
  { id: 'garantia-e-manchas', question: 'E se as manchas não saírem ou eu não ficar satisfeito?', answer: `Avaliamos o tecido, a origem da mancha e os produtos já aplicados. Não prometemos remover todas as manchas nem reparar desgaste. Esses limites são explicados antes do trabalho e as manchas preexistentes não excluem a repetição gratuita. ${SATISFACTION_PROMISE}` },
];

export function getResourceOffer(post?: BlogPost) {
  const href = post?.relatedService.href ?? '/#servicos';
  const base = { href, title: 'Vamos avaliar o seu caso?', detail: 'Envie fotografias, medidas e localidade. Confirmamos o serviço adequado e o preço antes de marcar.', action: 'Pedir orçamento por WhatsApp', link: 'Ver serviços e preços' };
  if (href === '/limpeza-alcatifas' || href === '/limpeza-tapetes') {
    const label = href === '/limpeza-alcatifas' ? 'Alcatifas' : 'Tapetes';
    return { ...base, title: `${label} sob orçamento`, detail: 'Envie largura × comprimento, fotografias e localidade. Receba uma proposta para a sua peça ou área.', link: `Ver limpeza de ${label.toLowerCase()}` };
  }
  if (href === '/limpeza-sofas') return { ...base, title: `Limpeza de sofás desde ${sofaPrices[0].cleaningPrice}€`, detail: 'Valor de partida para 1 lugar. Envie uma fotografia do sofá e indique a sua localidade.', link: 'Ver preços de sofás' };
  if (href === '/limpeza-colchoes') return { ...base, title: `Limpeza de colchões desde ${mattressPrices.find(p => p.id === 'solteiro')!.cleaningPrice}€`, detail: 'Valor de partida para solteiro. Indique o tamanho, as faces a tratar e a sua localidade.', link: 'Ver preços de colchões' };
  if (href === '/impermeabilizacao') return { ...base, title: 'Escolha a proteção do seu sofá', detail: 'Compare Essencial e Premium. Confirmamos a compatibilidade e as condições de aplicação antes de marcar.', link: 'Comparar proteção e preços' };
  return base;
}

export function getResourceWhatsapp(post?: BlogPost) {
  const message = post ? `Olá! Li o guia «${post.title}» e gostaria de pedir avaliação e orçamento. A minha localidade é: ` : 'Olá! Gostaria de pedir avaliação e orçamento para os meus estofos. A minha localidade é: ';
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}
export const resourceQuizService: Record<string, string> = { 'limpeza-sofas': 'sofa', 'limpeza-colchoes': 'mattress', 'limpeza-cadeiras': 'chairs', 'limpeza-tapetes': 'carpet', 'limpeza-alcatifas': 'carpet', impermeabilizacao: 'sofa' };

export const RESOURCE_GLOSSARY_TITLE = 'Glossário de limpeza de estofos';
export const resourceGlossaryIntro = (count: number) => `${count} termos para compreender os materiais, os tratamentos e o seu orçamento.`;

export const resourceHeroSubtitle = (post: BlogPost) => {
  const offer = getResourceOffer(post);
  return `${offer.title.replace(/[?!.]$/, '')}. ${offer.detail}`;
};
export function getResourceCommercial(post: BlogPost) {
  const serviceSlug = post.relatedService.href.slice(1);
  return {
    serviceSlug,
    priceLine: commercialHeroPriceLine(serviceSlug),
    stats: commercialHeroStats(serviceSlug),
    priceRows: PRICE_TABLE[serviceSlug] ?? [],
    trustPoints: getTrustPointsForSeed(serviceSlug, `${serviceSlug}:0:default`) ?? [],
    reviews: pickReviewSubset(serviceSlug, `/blog/${post.slug}:blog-${post.slug}`, 6),
  };
}

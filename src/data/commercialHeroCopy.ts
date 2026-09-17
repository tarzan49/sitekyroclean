import { services } from './serviceCatalog';
import { locationPrices } from '../constants/travel';
import { REVIEW_COUNT, REVIEW_RATING } from '../constants/business';

const subtitles: Record<string, string> = {
  'limpeza-sofas': 'Cuidado profissional para o seu sofá, sem sair de casa.',
  'limpeza-colchoes': 'Limpeza do colchão com cuidados adaptados ao tecido.',
  'limpeza-cadeiras': 'Cuidamos dos assentos, encostos e tecidos das suas cadeiras.',
  'limpeza-tapetes': 'Cuidados adaptados às fibras e ao estado do seu tapete.',
  'limpeza-alcatifas': 'Limpeza da alcatifa com atenção às zonas de maior uso.',
  impermeabilizacao: 'Proteção do tecido para facilitar os cuidados do dia a dia.',
};
export const commercialHeroSubtitle = (serviceSlug: string, city?: string) => `${subtitles[serviceSlug] ?? 'Cuidados profissionais adaptados aos seus estofos.'}${city === 'Aveiro' || city === 'Coimbra' ? ' Disponibilidade sob consulta.' : ''}`;

/**
 * Os factos que o hero mostra: a linha de preço e os três indicadores.
 *
 * Vivem aqui, e não dentro do `CommercialHero`, porque têm dois leitores com
 * necessidades opostas. O `CommercialHero` desenha-os para quem visita o site.
 * O `scripts/landing-page-html.ts` escreve-os no HTML estático, que é o único
 * que os crawlers sem JavaScript chegam a ver: o `main.tsx` monta com
 * `createRoot` e não com `hydrateRoot`, por isso o React deita fora o HTML
 * prerenderizado e nenhuma pessoa o lê, tal como nenhum crawler destes lê o
 * hero em React.
 *
 * Eram duas audiências a receber informação diferente da mesma página: o preço
 * de partida, a taxa de deslocação da cidade e a avaliação estavam no hero para
 * as pessoas e não apareciam uma única vez no HTML estático. Partilhar estas
 * funções é o que garante que as duas versões dizem o mesmo número. Se a copy
 * do hero mudar aqui, o HTML estático muda com ela; se alguém a duplicar, volta
 * a haver duas verdades, que é precisamente o que isto existe para impedir.
 */
export const commercialHeroPriceLine = (serviceSlug: string, municipality?: string, price?: string): string => {
  const service = services.find(item => item.slug === serviceSlug);
  const fee = municipality ? locationPrices[municipality] : undefined;
  const value = price ?? service?.priceFrom ?? 'Sob orçamento';
  const priceText = /orçamento/i.test(value) ? 'Sob orçamento' : `Desde ${value}`;
  return `${priceText} + deslocação ${fee === undefined ? 'a partir de 10€' : `${fee}€`}.`;
};

export interface HeroStat { value: string; label: string }

export const commercialHeroStats = (serviceSlug: string): HeroStat[] => [
  { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google` },
  { value: '<10 min', label: 'Resposta' },
  // A impermeabilização não seca, ativa: o tratamento precisa de até 24 h para
  // ficar operacional, ao contrário da limpeza, que devolve o artigo em 3 a 6 h.
  serviceSlug === 'impermeabilizacao'
    ? { value: 'Até 24 h', label: 'Ativação da proteção' }
    : { value: '3 a 6 h', label: 'Secagem média' },
];

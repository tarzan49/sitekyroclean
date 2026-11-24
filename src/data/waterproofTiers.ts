// "Essencial ou Premium?": os factos e os preços (bot) dos cartões da página e do HTML estático,
// de uma só fonte para dizerem o mesmo (dono, 24 Nov).
import { botQuote } from '../lib/botQuote';
import { formatEuro } from './enginePrices';
import { CHAIR_WATERPROOF_BIG_ESSENTIAL, CHAIR_WATERPROOF_BIG_PREMIUM } from '../constants/chairPricing';

export interface WaterproofTierCard { name: string; top: boolean; years: string; yearsLabel: string; washes: number; base: string; ideal: string; sofa: string; chair: string }

const sofaPrice = (city: string, treatment: 'premium' | 'essencial') => {
  const r = botQuote({ city, items: [{ kind: 'sofa', size: '3-lugares', treatment }] }) as { ok: boolean; quote?: boolean; total?: number | null };
  return r.ok && !r.quote && typeof r.total === 'number' ? formatEuro(r.total) : 'sob orçamento';
};

export function waterproofTierCards(city: string): WaterproofTierCard[] {
  return [
    { name: 'Premium', top: true, years: '10', yearsLabel: 'anos de proteção', washes: 5, base: 'Base solvente', ideal: 'Crianças, animais, uso intenso', sofa: sofaPrice(city, 'premium'), chair: `desde ${formatEuro(CHAIR_WATERPROOF_BIG_PREMIUM)}/un` },
    { name: 'Essencial', top: false, years: '1-2', yearsLabel: 'anos de proteção', washes: 2, base: 'Base água', ideal: 'Uso moderado, 1.ª proteção', sofa: sofaPrice(city, 'essencial'), chair: `desde ${formatEuro(CHAIR_WATERPROOF_BIG_ESSENTIAL)}/un` },
  ];
}

/** Texto do HTML estático, igual aos cartões. */
export function waterproofTiersHtml(city: string, prep: string, esc: (s: string) => string): string {
  const cards = waterproofTierCards(city);
  return `<h2>Essencial ou Premium?</h2>${cards.map(c => `<article><h3>${esc(c.name)}${c.top ? ' (mais escolhido)' : ''}</h3><ul><li>${esc(c.base)}</li><li>${esc(c.years)} ${esc(c.yearsLabel)}</li><li>Até ${c.washes} lavagens</li><li>Ideal para: ${esc(c.ideal)}</li><li>Sofá de 3 lugares: ${esc(c.sofa)}</li><li>Cadeira: ${esc(c.chair)}</li></ul></article>`).join('')}<p>Nas duas, os líquidos ficam à superfície e saem com um pano. Preços ${esc(prep)} ${esc(city)}, com a deslocação incluída. Só em tecido: na pele não fazemos impermeabilização.</p>`;
}

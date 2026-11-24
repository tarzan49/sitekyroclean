// Textos de preço de tapetes e alcatifas no site, a partir das taxas do motor do bot (dono, 24 Nov 2026:
// o site deixa de ser sob orçamento e volta com os valores; alcatifas também, por escalões da área).
import { RUG_RATE_COMMON, RUG_RATE_NATURAL, RUG_RATE_CARPET, CARPET_TIERS } from './rugRates';

export const RUG_PRICE_FROM = `Desde ${RUG_RATE_COMMON}€/m²`;
export const RUG_PRICE_NOTE = `${RUG_RATE_COMMON}€/m² em tapete comum, com a deslocação incluída; juta e sisal ${RUG_RATE_NATURAL}€/m².`;
export const CARPET_PRICE_FROM = `Desde ${RUG_RATE_CARPET}€/m²`;
const carpetTierText = CARPET_TIERS.slice(0, -1).map((t, i) => `até ${CARPET_TIERS[i + 1].from} m² ${t.rate}€/m²`).join(', ');
export const CARPET_PRICE_NOTE = `Alcatifa a partir de ${RUG_RATE_CARPET}€/m², conforme a área (${carpetTierText}), com a deslocação incluída.`;

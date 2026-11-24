import { GOOGLE_REVIEW_LINK_LISBOA, GOOGLE_REVIEW_LINK_PORTO } from '../constants/google';
import { cities } from './serviceCatalog';

const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/**
 * A ficha do Google onde o cliente avalia: a de Lisboa para quem foi servido pelas equipas de Lisboa (Grande
 * Lisboa, Margem Sul, Setúbal, Alentejo Litoral), a do Porto para todos os outros (dono, 24 Nov 2026).
 * `zona=lisboa` no endereço manda, para localidades que não estão na lista de cidades.
 */
export function reviewLinkForCity(city?: string | null, zone?: string | null): string {
  if (zone) return fold(zone) === 'lisboa' ? GOOGLE_REVIEW_LINK_LISBOA : GOOGLE_REVIEW_LINK_PORTO;
  const key = fold(city ?? '');
  const found = key && cities.find(c => fold(c.name) === key || c.slug === key);
  return found && found.area === 'lisboa' ? GOOGLE_REVIEW_LINK_LISBOA : GOOGLE_REVIEW_LINK_PORTO;
}

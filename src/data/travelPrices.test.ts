import { describe, expect, it } from 'vitest';
import { locationPrices } from '../components/quiz/QuizTypes';
import { cities, getLocationServiceData } from './locationSeoData';

describe('travel fees shared by quote and SEO pages', () => {
  it('keeps generated location copy aligned with the quote table for every city', () => {
    for (const city of cities) {
      const page = getLocationServiceData('limpeza-sofas', city.slug)!;
      expect(page.localSection, city.name).toContain(`taxa de deslocação de ${locationPrices[city.name]}€`);
    }
  });
  it('uses Braga as a local base and charges Algarve extremities separately', () => {
    expect(locationPrices.Braga).toBe(10);
    expect(locationPrices.Guimarães).toBe(10);
    expect(locationPrices.Fafe).toBeGreaterThan(locationPrices.Braga);
    expect(locationPrices['Viana do Castelo']).toBeGreaterThan(locationPrices.Fafe);
    for (const city of ['Vila Real de Santo António', 'Castro Marim', 'Monchique', 'Aljezur', 'Vila do Bispo', 'Alcoutim']) expect(locationPrices[city]).toBe(25);
    expect(locationPrices.Portimão).toBe(15);
    expect(locationPrices.Lagos).toBe(15);
    expect(locationPrices.Faro).toBe(10);
  });
});

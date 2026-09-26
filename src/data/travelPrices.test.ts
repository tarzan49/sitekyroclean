import { describe, expect, it } from 'vitest';
import { locationPrices } from '../components/quiz/QuizTypes';
import { cities, getLocationServiceData } from './locationSeoData';
import { EXTENDED_TRIP_CITIES } from '../constants/travel';

describe('travel fees shared by quote and SEO pages', () => {
  it('keeps generated location copy aligned with the quote table for every city', () => {
    for (const city of cities) {
      const page = getLocationServiceData('limpeza-sofas', city.slug)!;
      expect(page.localSection, city.name).toContain(`taxa de deslocação de ${locationPrices[city.name]}€`);
    }
  });
  it('uses Braga as a local base and charges Algarve extremities separately', () => {
    expect(locationPrices.Braga).toBe(10);
    expect(locationPrices.Guimarães).toBe(20);
    expect(locationPrices.Barcelos).toBe(20);
    expect(locationPrices['Póvoa de Lanhoso']).toBe(15);
    expect(locationPrices.Fafe).toBeGreaterThan(locationPrices.Braga);
    expect(locationPrices['Viana do Castelo']).toBe(20);
    for (const city of ['Vila Real de Santo António', 'Castro Marim', 'Monchique', 'Aljezur', 'Vila do Bispo', 'Alcoutim']) expect(locationPrices[city]).toBe(25);
    expect(locationPrices.Portimão).toBe(15);
    expect(locationPrices.Lagos).toBe(15);
    expect(locationPrices.Faro).toBe(10);
  });
  it('gives every served city a page and every page a travel fee', () => {
    // O questionário só aceita localidades com taxa; uma cidade sem taxa dá
    // "Localidade não encontrada" a quem vive lá. Aconteceu com as oito
    // localidades que as campanhas de Google Ads passaram a abranger.
    expect(Object.keys(locationPrices).sort()).toEqual(cities.map(city => city.name).sort());
  });
  it('prices the Sul do Douro and Alentejo Litoral towns by the existing zones', () => {
    expect(locationPrices['Santa Maria da Feira']).toBe(locationPrices.Espinho);
    for (const city of ['São João da Madeira', 'Ovar', 'Oliveira de Azeméis']) expect(locationPrices[city], city).toBe(locationPrices.Penafiel);
    for (const city of ['Alcácer do Sal', 'Grândola', 'Santiago do Cacém', 'Sines']) {
      expect(locationPrices[city], city).toBe(locationPrices.Coimbra);
      expect(EXTENDED_TRIP_CITIES.has(city), city).toBe(true);
    }
    expect(Math.max(...cities.filter(city => city.area === 'lisboa').map(city => locationPrices[city.name]))).toBe(15);
  });
});

import { describe, expect, it } from 'vitest';
import { getAllProblems, getProblemBySlug } from './problemSeoData';
import { getProblemHero } from './problemHero';
import { PROBLEM_WA_REQUESTS } from '../lib/whatsappMessages';
import { locationPrices } from '../constants/travel';
import { CHAIR_PRICE_LABEL } from './enginePrices';
import { getAllProblemCityRoutes } from './problemCitySeoData';
import { cities } from './serviceCatalog';

const problem = (slug: string) => getProblemBySlug(slug)!;

describe('problem hero content', () => {
  it('keeps every problem identity and a contextual WhatsApp destination', () => {
    for (const item of getAllProblems()) {
      const hero = getProblemHero(item, 'Lisboa');
      // Numa pergunta (as páginas de preço), a cidade entra antes do "?".
      expect(hero.heading).toBe(item.h1.endsWith('?') ? `${item.h1.slice(0, -1)} em Lisboa?` : `${item.h1} em Lisboa`);
      const url = new URL(hero.waHref);
      expect(url.origin).toBe('https://wa.me');
      expect(url.searchParams.get('text')).toContain(PROBLEM_WA_REQUESTS[item.slug].request);
      expect(url.searchParams.get('text')).toContain('em Lisboa');
      expect(hero.intro).not.toMatch(/99%|garantimos|bactérias|benefícios clínicos|—/i);
      expect(hero.response).toContain('menos de 10 minutos');
    }
  });
  it('uses the actual travel table and correct Portuguese prepositions', () => {
    for (const city of ['Porto', 'Lisboa', 'Barcelos', 'Vila Real de Santo António']) {
      const hero = getProblemHero(problem('manchas-sofa'), city);
      expect(hero.travelLabel).toBe(`Deslocação ${locationPrices[city]}€`);
    }
    expect(getProblemHero(problem('manchas-sofa'), 'Porto').location).toBe('no Porto');
    expect(getProblemHero(problem('manchas-sofa')).travelLabel).toBe('Deslocação a partir de 10€');
  });
  it('never presents a numeric starting price for rugs or fitted carpets', () => {
    for (const item of getAllProblems().filter(item => ['limpeza-tapetes', 'limpeza-alcatifas'].includes(item.relatedServices[0]))) {
      const hero = getProblemHero(item);
      expect(hero.priceLabel).toBe('Sob orçamento');
      expect(hero.priceLinkLabel).toBe('Como pedir orçamento');
    }
  });
  it('distinguishes cleaning from treatment and protection', () => {
    const mites = getProblemHero(problem('acaros-colchao'));
    expect(mites.intro).toContain('tratamentos opcionais');
    expect(mites.priceLabel).toMatch(/^Limpeza desde /);
    expect(getProblemHero(problem('impermeabilizar-sofa')).priceLabel).toMatch(/^Proteção desde /);
    // Cadeiras: o preço é por cadeira, nunca "desde" (pedido do dono, 26/09/2026).
    expect(getProblemHero(problem('limpeza-cadeiras-escritorio')).priceLabel).toBe(`Limpeza ${CHAIR_PRICE_LABEL.toLowerCase()}`);
  });
  it('puts the city inside a question heading, never after the question mark', () => {
    // Visto em produção: "Quanto Custa a Lavagem Profissional de Tapetes? no Porto".
    expect(getProblemHero(problem('preco-limpeza-tapete'), 'Porto').heading).toBe('Quanto Custa a Lavagem Profissional de Tapetes no Porto?');
    expect(getProblemHero(problem('preco-limpeza-sofa'), 'Amadora').heading).toBe('Quanto Custa Limpar um Sofá Profissionalmente na Amadora?');
    expect(getProblemHero(problem('preco-limpeza-colchao'), 'Braga').heading).toBe('Quanto Custa a Higienização Profissional de Colchão em Braga?');
    // Sem cidade (a página nacional), a pergunta fica como está.
    expect(getProblemHero(problem('preco-limpeza-tapete')).heading).toBe('Quanto Custa a Lavagem Profissional de Tapetes?');
    for (const route of getAllProblemCityRoutes()) {
      const city = cities.find(item => item.slug === route.citySlug)!;
      expect(getProblemHero(problem(route.problemSlug), city.name).heading, route.path).not.toMatch(/\?./);
    }
  });
  it('makes urgent availability conditional', () => {
    expect(getProblemHero(problem('limpeza-sofa-urgente')).intro).toContain('sob confirmação');
  });
});

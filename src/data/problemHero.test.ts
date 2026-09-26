import { describe, expect, it } from 'vitest';
import { getAllProblems, getProblemBySlug } from './problemSeoData';
import { getProblemHero } from './problemHero';
import { locationPrices } from '../constants/travel';
import { CHAIR_PRICE_LABEL } from './enginePrices';

const problem = (slug: string) => getProblemBySlug(slug)!;

describe('problem hero content', () => {
  it('keeps every problem identity and a contextual WhatsApp destination', () => {
    for (const item of getAllProblems()) {
      const hero = getProblemHero(item, 'Lisboa');
      expect(hero.heading).toBe(`${item.h1} em Lisboa`);
      const url = new URL(hero.waHref);
      expect(url.origin).toBe('https://wa.me');
      expect(url.searchParams.get('text')).toContain(item.keyword);
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
    expect(getProblemHero(problem('limpeza-cadeiras-escritorio')).priceLabel).toBe(`Limpeza a ${CHAIR_PRICE_LABEL}`);
  });
  it('makes urgent availability conditional', () => {
    expect(getProblemHero(problem('limpeza-sofa-urgente')).intro).toContain('sob confirmação');
  });
});

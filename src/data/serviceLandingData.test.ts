import { describe, expect, it } from 'vitest';
import { getServiceLandingData } from './serviceLandingData';
import { getAllLocationRoutes, getLocationServiceData } from './locationSeoData';
import { getAllFreguesiaRoutes, getFreguesia, generateFreguesiaContent } from './freguesiaSeoData';
import { getAllKeywordVariantRoutes, getKeywordVariantData } from './keywordVariantData';
import { getAllPriceRoutes, getPricePageData } from './priceSeoData';
import { getExpansionRoutes } from './treatmentSeoData';

describe('shared landing content adapters', () => {
  it('resolves every URL in the five requested sitemap families', () => {
    const routes = [...getAllLocationRoutes(), ...getAllFreguesiaRoutes(), ...getAllKeywordVariantRoutes(), ...getAllPriceRoutes(), ...getExpansionRoutes()];
    const failed: string[] = [];
    for (const route of routes) {
      const page = getServiceLandingData(route.path);
      if (!page?.h1 || !page.quoteCity || !page.intro || !page.faqs.length || !page.problems.length) failed.push(route.path);
    }
    expect(failed).toEqual([]);
    expect(routes.length).toBeGreaterThan(12000);
  }, 30000);

  it('preserves Ramalde content but uses Porto for the quote and travel', () => {
    const page = getServiceLandingData('/limpeza-sofas-porto-ramalde')!;
    const parish = getFreguesia('porto', 'ramalde')!;
    const original = generateFreguesiaContent(page.service, page.serviceSlug, page.priceFrom, parish.name, parish.slug, parish.municipio);
    expect(page.intro).toBe(original.intro);
    expect(page.faqs).toEqual(original.faqs);
    expect(page.city).toBe('Ramalde');
    expect(page.quoteCity).toBe('Porto');
    expect(page.parentPlace).toBe('Porto');
  });

  it('keeps price intent and variant-specific content instead of copying city text', () => {
    const city = getServiceLandingData('/limpeza-sofas-porto')!;
    const price = getServiceLandingData('/preco-limpeza-sofas-porto')!;
    const variant = getServiceLandingData('/higienizacao-sofa-porto-ramalde')!;
    expect(city.intro).toBe(getLocationServiceData('limpeza-sofas', 'porto')!.intro);
    expect(price.intro).toBe(getPricePageData('limpeza-sofas', 'porto')!.intro);
    expect(variant.intro).toBe(getKeywordVariantData('higienizacao', 'sofa', 'porto-ramalde')!.intro);
    expect(new Set([city.intro, price.intro, variant.intro]).size).toBe(3);
    expect(variant.quoteCity).toBe('Porto');
  });

  it('retains consultation-only coverage and distinct expansion city content', () => {
    const aveiro = getServiceLandingData('/limpeza-sofas-aveiro')!;
    const coimbra = getServiceLandingData('/limpeza-sofas-coimbra')!;
    expect(aveiro.coverageNote).toContain('sob consulta');
    expect(coimbra.coverageNote).toContain('sob consulta');
    expect(aveiro.intro).not.toBe(coimbra.intro);
    expect(getServiceLandingData('/limpeza-estofos-coimbra')!.generalService).toBe(true);
    expect(getServiceLandingData('/limpeza-tapetes-aveiro')!.priceFrom).not.toMatch(/^\d/);
    expect(getServiceLandingData('/impermeabilizacao-cadeiras-porto')!.serviceSlug).toBe('impermeabilizacao');
  });
});

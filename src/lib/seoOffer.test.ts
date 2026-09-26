import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { priceFromLabel, offerForPriceLabel, buildServicePageSchema, buildHomepageBusinessNode } from './seoSchema';

const read = (relative: string) => fs.readFileSync(path.resolve(__dirname, relative), 'utf-8');

describe('oferta a partir de um rótulo de preço', () => {
  it('lê o número com vírgula decimal e recusa rótulos sem preço', () => {
    expect(priceFromLabel('49€')).toBe('49');
    expect(priceFromLabel('Desde 12,50€')).toBe('12.5');
    expect(priceFromLabel('20€/un')).toBe('20');
    expect(priceFromLabel(20)).toBe('20');
    expect(priceFromLabel('Sob orçamento')).toBeNull();
    expect(priceFromLabel('Sob consulta')).toBeNull();
    expect(priceFromLabel('')).toBeNull();
    expect(priceFromLabel(undefined)).toBeNull();
  });

  it('não inventa uma oferta quando não há preço, nem declara validade', () => {
    expect(offerForPriceLabel('Sob orçamento')).toBeUndefined();
    const offer = offerForPriceLabel('59€')!;
    expect(offer.price).toBe('59');
    expect(offer.priceSpecification.minPrice).toBe('59');
    expect(offer).not.toHaveProperty('priceValidUntil');
  });

  it('o grafo das páginas-pilar só tem oferta nos serviços com preço', () => {
    const service = (schema: ReturnType<typeof buildServicePageSchema>) =>
      schema['@graph'].find(node => (node as { '@type'?: unknown })['@type'] === 'Service') as Record<string, unknown>;
    expect(service(buildServicePageSchema({ url: '/limpeza-tapetes', serviceName: 'Limpeza de Tapetes', description: 'x', priceFrom: 'Sob orçamento' }))).not.toHaveProperty('offers');
    const mattress = service(buildServicePageSchema({ url: '/limpeza-colchoes', serviceName: 'Limpeza de Colchões', description: 'x', priceFrom: '59€' }));
    expect((mattress.offers as { price: string }).price).toBe('59');
  });

  it('o catálogo da homepage continua sem preço em tapetes e alcatifas', () => {
    const offers = buildHomepageBusinessNode().hasOfferCatalog.itemListElement;
    for (const offer of offers) {
      const quoteOnly = /Tapetes|Alcatifas/.test(offer.itemOffered.name);
      expect('priceSpecification' in offer, offer.itemOffered.name).toBe(!quoteOnly);
    }
  });

  it('nenhum componente de schema cai para um preço por omissão nem escreve uma data de validade', () => {
    for (const file of ['../components/ServiceSchema.tsx', '../components/ServiceLocationSchema.tsx', '../pages/PricePage.tsx', '../pages/MaterialPage.tsx', '../pages/MarcaSofaPage.tsx', '../pages/MarcaColchaoPage.tsx', '../pages/MarcaCadeirasPage.tsx', '../../scripts/prerender.ts']) {
      const source = read(file);
      expect(source, file).not.toContain('DEFAULT_PRICE_FROM');
      expect(source, file).not.toContain('priceValidUntil');
      expect(source, file).not.toMatch(/replace\(\/\[\^0-9/);
      expect(source, file).not.toContain('maxPrice');
    }
  });
});

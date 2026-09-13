import { describe, expect, it } from 'vitest';
import { getLandingFaqRoutes } from '../../scripts/landing-faq-routes';
import { getLandingPageModel } from './landingPageModel';
import { getLandingEditorial } from './landingEditorial';

describe('landing editorial descriptions', () => {
  it('replaces unsupported claims in introductions and metadata throughout the four families', () => {
    for (const route of getLandingFaqRoutes()) {
      const model = getLandingPageModel(route.path)!;
      const text = `${model.intro} ${model.metaDescription}`;
      expect(text, route.path).not.toMatch(/certificad|milhões|elimina|saudáve|saúde|sem resíduos|recolha.*incluíd|residentes.*confiam|referência|—|99\s*%/i);
      expect(model.intro.length, route.path).toBeLessThan(500);
      expect(model.intro).toContain(model.locationName);
      expect(model.metaDescription).toContain(model.locationName);
      if (['Aveiro', 'Coimbra'].includes(model.municipalityName)) {
        expect(model.intro).toContain('Disponibilidade sob consulta');
        expect(model.metaDescription).toContain('Disponibilidade sob consulta');
      }
      if (model.family === 'freguesia') expect(model.metaDescription).toContain(model.municipalityName);
      if (['limpeza-tapetes', 'limpeza-alcatifas'].includes(model.serviceSlug)) expect(model.metaDescription).toContain('Sob orçamento');
    }
  });
  it('explains price intent without presenting waterproofing as extraction cleaning', () => {
    const protection = getLandingPageModel('/preco-impermeabilizacao-lisboa')!;
    expect(protection.intro).toContain('Essencial e Premium');
    expect(protection.intro).not.toMatch(/extração|água quente/);
    const cleaning = getLandingPageModel('/preco-limpeza-sofas-lisboa')!;
    expect(cleaning.intro).toContain('configurações');
    expect(cleaning.intro).not.toBe(getLandingPageModel('/limpeza-sofas-lisboa')!.intro);
  });
  it('does not fabricate municipal facts to create local variation', () => {
    const base = { serviceSlug: 'limpeza-colchoes', serviceLabel: 'Limpeza de Colchões', family: 'freguesia', municipality: 'Porto' } as const;
    expect(getLandingEditorial({ ...base, place: 'Paranhos' }).intro).toContain('município de Porto');
    expect(getLandingEditorial({ ...base, place: 'Ramalde' }).intro).not.toMatch(/habitantes|edifícios|humidade|turismo|já confiam/);
  });
});

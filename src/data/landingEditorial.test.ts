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
      expect(model.h1).toContain(model.locationName);
      expect(model.intro.length).toBeLessThan(180);
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
    expect(protection.intro).toContain('Proteção');
    expect(protection.intro).not.toMatch(/extração|água quente/);
    const cleaning = getLandingPageModel('/preco-limpeza-sofas-lisboa')!;
    expect(cleaning.priceHeading).toContain('sofá');
    expect(cleaning.metaDescription).not.toBe(getLandingPageModel('/limpeza-sofas-lisboa')!.metaDescription);
  });
  it('does not fabricate municipal facts to create local variation', () => {
    const base = { serviceSlug: 'limpeza-colchoes', serviceLabel: 'Limpeza de Colchões', family: 'freguesia', municipality: 'Porto' } as const;
    expect(getLandingEditorial({ ...base, place: 'Paranhos' }).intro).toContain('município de Porto');
    expect(getLandingEditorial({ ...base, place: 'Ramalde' }).intro).not.toMatch(/habitantes|edifícios|humidade|turismo|já confiam/);
  });
  it('uses the same preposition as the h1 for every city, not only Porto', () => {
    const base = { serviceSlug: 'limpeza-sofas', serviceLabel: 'Limpeza de Sofás', family: 'localidade' } as const;
    expect(getLandingEditorial({ ...base, place: 'Barreiro', municipality: 'Barreiro' }).intro).toContain('no Barreiro');
    expect(getLandingEditorial({ ...base, place: 'Amadora', municipality: 'Amadora' }).metaDescription).toContain('na Amadora');
    expect(getLandingEditorial({ ...base, place: 'Braga', municipality: 'Braga' }).intro).toContain('em Braga');
    const model = getLandingPageModel('/preco-limpeza-sofas-seixal')!;
    expect(model.h1).toContain('no Seixal');
    expect(model.metaDescription).toContain('no Seixal');
  });
  it('no longer asks about or prices the chaise longue', () => {
    for (const family of ['localidade', 'preco', 'variante'] as const) {
      const editorial = getLandingEditorial({ serviceSlug: 'limpeza-sofas', serviceLabel: 'Limpeza de Sofás', family, place: 'Porto', municipality: 'Porto' });
      expect(`${editorial.intro} ${editorial.metaDescription}`).not.toMatch(/chaise/i);
    }
  });
});

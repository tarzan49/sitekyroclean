import { describe, expect, it } from 'vitest';
import { TRAVEL_FEE_MAX, TRAVEL_FEE_MIN } from '@/constants/commercialPolicy';
import { formatEuro, MATTRESS_CLEANING_FROM } from './enginePrices';
import { getAllMaterials, getMaterialBySlug } from './materialSeoData';
import { PRICE_FACTORS } from './priceFactors';
import { getPricePageData } from './priceSeoData';
import { getAllProblems, getProblemBySlug } from './problemSeoData';

// Nos serviços com preço de tabela, o preço depende do tamanho ou da
// quantidade, do tratamento e da deslocação. Tipo de tecido, manchas e
// sujidade não o mudam; um sofá em pele pode custar mais e é confirmado no
// orçamento (dono, 2026-09-30). Tapetes, alcatifas, cabeceiras e puffs são
// sob orçamento.

const strings = (value: unknown): string[] => typeof value === 'string' ? [value]
  : Array.isArray(value) ? value.flatMap(strings)
  : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

describe('o que muda o preço', () => {
  it('nenhuma página diz que o preço varia com o tecido, as manchas ou a sujidade', () => {
    const VARIES = /pode variar conforme|pode influenciar[^.]*pre[çc]o|pre[çc]o final depende|variam conforme v[áa]rios fatores/i;
    for (const page of [...getAllProblems(), ...getAllMaterials()]) {
      for (const text of strings(page)) expect(text, page.slug).not.toMatch(VARIES);
    }
  });

  it('o sofá em pele pode custar mais do que um de tecido e fica confirmado no orçamento', () => {
    const faq = getMaterialBySlug('limpeza-sofa-pele')!.faqs.find(item => /Quanto custa/.test(item.question))!;
    expect(faq.answer).toContain('confirmado no orçamento');
    expect(faq.answer).toContain('pode custar mais');
  });

  it('a cabeceira e o puff não têm preço escrito', () => {
    for (const slug of ['limpeza-cabeceira-cama', 'limpeza-puff']) {
      const text = strings(getProblemBySlug(slug)).join('\n');
      expect(text, slug).not.toMatch(/\d\s*€/);
      expect(text, slug).toMatch(/sob orçamento/i);
    }
  });

  it('as páginas de colchão partem do preço do colchão, não do do sofá', () => {
    const mattressPages = getAllProblems().filter(page => page.relatedServices.join() === 'limpeza-colchoes');
    expect(mattressPages.length).toBeGreaterThan(0);
    for (const page of mattressPages) {
      for (const [, amount] of strings(page).join('\n').matchAll(/desde (\d+(?:,\d{2})?€)/gi)) expect(amount, page.slug).toBe(formatEuro(MATTRESS_CLEANING_FROM));
    }
  });
});

describe('"Como é calculado o preço?"', () => {
  it('nos serviços com preço de tabela, mostra só tamanho ou quantidade, tratamento e deslocação', () => {
    for (const slug of ['limpeza-sofas', 'limpeza-colchoes', 'limpeza-cadeiras', 'impermeabilizacao']) {
      const cards = PRICE_FACTORS[slug];
      expect(cards, slug).toHaveLength(3);
      expect(strings(cards).join('\n'), slug).not.toMatch(/tecido|mancha|sujidade|estado|material|espuma|molas/i);
      expect(cards[2].description, slug).toContain(`entre ${TRAVEL_FEE_MIN}€ e ${TRAVEL_FEE_MAX}€`);
    }
    expect(PRICE_FACTORS['limpeza-sofas'][0].examples).toContain('Sofá em pele: confirmado no orçamento');
  });

  it('nos tapetes e alcatifas, que são sob orçamento, continua a olhar para o material e o estado', () => {
    expect(strings(PRICE_FACTORS['limpeza-tapetes']).join('\n')).toContain('Manchas e sujidade acumulada');
    expect(strings(PRICE_FACTORS['limpeza-alcatifas']).join('\n')).toContain('Manchas e estado geral');
  });

  it('as páginas de preço não guardam uma segunda lista de fatores', () => {
    for (const slug of Object.keys(PRICE_FACTORS)) {
      expect(getPricePageData(slug, 'porto')!.factors, slug).toEqual(PRICE_FACTORS[slug].flatMap(card => card.examples));
    }
  });
});

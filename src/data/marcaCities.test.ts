import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { marcaPageCopy, otherMarcaLinks, MARCA_CITIES, type MarcaKind } from './marcaCities';
import { marcas, getAllMarcaSofaRoutes } from './marcaSofaData';
import { marcasColchao, getAllMarcaColchaoRoutes } from './marcaColchaoData';
import { marcasCadeiras, getAllMarcaCadeirasRoutes } from './marcaCadeirasData';
import { formatEuro, SOFA_CLEANING_FROM, MATTRESS_CLEANING_FROM, CHAIR_CLEANING_FROM } from './enginePrices';

const read = (relative: string) => fs.readFileSync(path.resolve(__dirname, relative), 'utf-8');

const FAMILIES: { kind: MarcaKind; brands: readonly { name: string; slug: string; material: string; faqs: { question: string; answer: string }[] }[]; routes: { path: string }[]; from: number; page: string }[] = [
  { kind: 'sofa', brands: marcas, routes: getAllMarcaSofaRoutes(), from: SOFA_CLEANING_FROM, page: 'MarcaSofaPage' },
  { kind: 'colchao', brands: marcasColchao, routes: getAllMarcaColchaoRoutes(), from: MATTRESS_CLEANING_FROM, page: 'MarcaColchaoPage' },
  { kind: 'cadeiras', brands: marcasCadeiras, routes: getAllMarcaCadeirasRoutes(), from: CHAIR_CLEANING_FROM, page: 'MarcaCadeirasPage' },
];

describe('páginas de marca', () => {
  it('mostram o preço de partida do motor, igual em todas as marcas e sem máximo', () => {
    for (const family of FAMILIES) {
      for (const brand of family.brands) {
        for (const city of MARCA_CITIES) {
          const copy = marcaPageCopy(family.kind, brand, city);
          expect(copy.priceFrom).toBe(formatEuro(family.from));
          expect(copy.description).toContain(`Limpeza desde ${formatEuro(family.from)}`);
          expect(copy.description).not.toMatch(/\d+€ - \d+€|Sob consulta|12\.5/);
        }
      }
    }
    // Cadeiras começam na 1.ª cadeira (20€), não no escalão da 7.ª (12,50€).
    expect(marcaPageCopy('cadeiras', marcasCadeiras[0], MARCA_CITIES[0]).priceFrom).toBe('20€');
  });

  it('usam a preposição de cada cidade, e o caminho que a rota gera', () => {
    for (const family of FAMILIES) {
      const paths = new Set(family.routes.map(route => route.path));
      for (const brand of family.brands) {
        for (const city of MARCA_CITIES) expect(paths.has(marcaPageCopy(family.kind, brand, city).path)).toBe(true);
      }
    }
    const porto = MARCA_CITIES.find(city => city.slug === 'porto')!;
    const amadora = MARCA_CITIES.find(city => city.slug === 'amadora')!;
    expect(marcaPageCopy('sofa', marcas[0], porto).h1).toBe(`Limpeza de Sofá ${marcas[0].name} no Porto`);
    expect(marcaPageCopy('sofa', marcas[0], amadora).title).toContain(' na Amadora,');
  });

  it('ligam às outras marcas pelo nome real', () => {
    const links = otherMarcaLinks('sofa', marcas, 'ikea', 'porto');
    expect(links.map(link => link.label)).toContain('El Corte Inglés');
    expect(links.some(link => link.href === '/limpeza-sofa-ikea-porto')).toBe(false);
  });

  it('nenhuma FAQ de marca diz que a marca muda o preço', () => {
    for (const family of FAMILIES) {
      for (const brand of family.brands) {
        for (const faq of brand.faqs) {
          if (/preço é diferente/i.test(faq.question)) expect(faq.answer, brand.name).toMatch(/^Não/);
        }
      }
    }
  });

  it('o React e o HTML estático leem o mesmo texto', () => {
    const prerender = read('../../scripts/prerender.ts');
    expect(prerender).toContain('marcaPageCopy(family.kind, data.marca, data.city)');
    expect(prerender).toContain('MARCA_PROCESS_STEPS[family.kind]');
    expect(prerender).toContain('otherMarcaLinks(family.kind');
    for (const family of FAMILIES) {
      const source = read(`../pages/${family.page}.tsx`);
      expect(source, family.page).toContain(`marcaPageCopy('${family.kind}'`);
      expect(source, family.page).toContain(`MARCA_PROCESS_STEPS.${family.kind}`);
      expect(source, family.page).toContain(`otherMarcaLinks('${family.kind}'`);
      expect(source, family.page).toContain('title={pageCopy.h1}');
      expect(source, family.page).toContain('price={pageCopy.priceFrom}');
      expect(source, family.page).not.toContain('slug.replace(/-/g, " ")');
    }
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PILLAR_PAGES } from './pillarPages';
import { services } from './serviceCatalog';
import { formatEuro, CLEANING_FROM_BY_SERVICE, chairTierSentence } from './enginePrices';

// As seis páginas-pilar eram escritas em três sítios (componente React,
// PageHead e o bloco CORE do prerender) e cada um dizia uma coisa diferente.
// Este teste rebenta se algum dos três voltar a ter a sua própria cópia. É o
// mesmo padrão do `legalPages.test.ts`: ler o código-fonte de cada leitor.
const read = (relative: string) => fs.readFileSync(path.resolve(__dirname, relative), 'utf-8');

describe('páginas-pilar: uma fonte, três leitores', () => {
  it('cobre os seis serviços do catálogo, um por página', () => {
    expect(PILLAR_PAGES.map(page => page.path).sort()).toEqual(services.map(service => service.baseRoute).sort());
    for (const page of PILLAR_PAGES) {
      const service = services.find(item => item.baseRoute === page.path)!;
      expect(page.serviceSlug).toBe(service.slug);
      expect(page.priceFrom).toBe(service.priceFrom);
    }
  });

  it('o componente React lê o h1, as FAQs e o schema daqui, sem cópia própria', () => {
    for (const page of PILLAR_PAGES) {
      const source = read(`../pages/${page.component}.tsx`);
      expect(source, page.component).toContain(`getPillarPage('${page.path}')`);
      expect(source, page.component).toContain('title={pillar.h1}');
      expect(source, page.component).toContain('faqs={pillar.faqs}');
      expect(source, page.component).toContain('priceFrom={pillar.priceFrom}');
      expect(source, page.component).not.toMatch(/const faqs = \[/);
      expect(source, page.component).not.toMatch(/<ServiceHero\s+title="/);
      expect(source, page.component).not.toContain('DEFAULT_PRICE_FROM');
    }
  });

  it('o PageHead lê o título e a descrição daqui e não guarda outra versão', () => {
    const source = read('../components/PageHead.tsx');
    expect(source).toContain('import("@/data/pillarPages")');
    const listed = /const PILLAR_PATHS = new Set\(\[([^\]]*)\]\)/.exec(source)?.[1] ?? '';
    const paths = [...listed.matchAll(/"([^"]+)"/g)].map(match => match[1]).sort();
    expect(paths).toEqual(PILLAR_PAGES.map(page => page.path).sort());
    for (const page of PILLAR_PAGES) expect(source, page.path).not.toContain(`"${page.path}": {`);
  });

  it('o prerender gera as seis a partir desta lista, sem título nem FAQ escritos à mão', () => {
    const source = read('../../scripts/prerender.ts');
    expect(source).toContain('PILLAR_PAGES.map(pillar =>');
    expect(source).toContain('title: pillar.title');
    expect(source).toContain('h1: pillar.h1');
    expect(source).toContain('faqs: pillar.faqs');
    for (const page of PILLAR_PAGES) expect(source, page.path).not.toContain(`path: '${page.path}'`);
  });

  it('uma resposta por pergunta, e as perguntas só-estáticas passaram a ser vistas por quem visita', () => {
    for (const page of PILLAR_PAGES) {
      const questions = page.faqs.map(faq => faq.question.toLowerCase());
      expect(new Set(questions).size, page.path).toBe(questions.length);
      expect(page.faqs.length, page.path).toBeGreaterThanOrEqual(6);
      expect(page.faqs.some(faq => /quanto custa/i.test(faq.question)), page.path).toBe(true);
    }
    const sofa = PILLAR_PAGES.find(page => page.path === '/limpeza-sofas')!;
    const durations = sofa.faqs.filter(faq => /quanto tempo demora/i.test(faq.question));
    expect(durations).toHaveLength(1);
  });

  it('os preços vêm do motor', () => {
    for (const page of PILLAR_PAGES) {
      const from = CLEANING_FROM_BY_SERVICE[page.serviceSlug];
      if (from !== null && /Desde/.test(page.title)) expect(page.title, page.path).toContain(`Desde ${formatEuro(from)}`);
    }
    const chairs = PILLAR_PAGES.find(page => page.path === '/limpeza-cadeiras')!;
    expect(chairs.faqs[0].answer).toContain(chairTierSentence());
    expect(chairs.faqs.map(faq => faq.answer).join(' ')).not.toMatch(/de 7 a 10|a partir de 11/);
  });

  it('sem travessão em texto visível', () => {
    for (const page of PILLAR_PAGES) {
      const text = [page.title, page.description, page.h1, ...page.faqs.flatMap(faq => [faq.question, faq.answer])].join(' ');
      expect(text, page.path).not.toContain('—');
      expect(text, page.path).not.toMatch(/\$\{/);
    }
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LEGAL_PAGES } from './legalPages';
import { LEGAL_CONTENT, legalSectionId, renderLegalHtml } from './legalContent';

const appSource = () => fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf-8');

describe('páginas legais', () => {
  // O texto tem uma fonte só (legalContent.ts): a página e o HTML estático desenham-na.
  it('cada página tem o seu texto, e nenhum texto fica sem página', () => {
    expect(Object.keys(LEGAL_CONTENT).sort()).toEqual(LEGAL_PAGES.map(page => page.path).sort());
    for (const page of LEGAL_PAGES) {
      const sections = LEGAL_CONTENT[page.path];
      expect(sections.length, page.path).toBeGreaterThan(5);
      const ids = sections.map(section => legalSectionId(section.title));
      expect(new Set(ids).size, page.path).toBe(ids.length);
      for (const section of sections) {
        const html = section.body.join('');
        expect(html, section.title).not.toMatch(/undefined|—/);
        expect(html.replace(/<[^>]+>/g, '').trim().length, section.title).toBeGreaterThan(20);
      }
    }
  });

  it('o HTML estático leva o texto todo de cada secção', () => {
    for (const page of LEGAL_PAGES) {
      const html = renderLegalHtml(page.path, []);
      for (const section of LEGAL_CONTENT[page.path]) {
        expect(html).toContain(`<h2>${section.title}</h2>`);
        for (const block of section.body) expect(html).toContain(block);
      }
    }
  });

  // A numeração é do documento: uma secção retirada por engano deixa um buraco.
  it('as secções numeradas seguem por ordem', () => {
    for (const page of LEGAL_PAGES) {
      const numbers = LEGAL_CONTENT[page.path].map(section => /^(\d+)\./.exec(section.title)?.[1]).filter(Boolean).map(Number);
      expect(numbers, page.path).toEqual(numbers.map((_, index) => index + 1));
    }
  });

  // A causa do 404 em produção: existia rota React mas não existia ficheiro
  // estático. Uma rota sem entrada aqui volta a cair no 404.html.
  it('cobre todas as rotas legais registadas no App.tsx', () => {
    const declared = new Set(LEGAL_PAGES.map(page => page.path));
    const inApp = [...appSource().matchAll(/path="(\/(?:politica|termos)[^"]*)"/g)].map(m => m[1]);
    expect(inApp.length).toBeGreaterThan(0);
    for (const route of inApp) expect(declared, `${route} sem entrada em legalPages.ts`).toContain(route);
  });

  it('dá a cada página um título e uma descrição próprios', () => {
    const titles = LEGAL_PAGES.map(page => page.title);
    const descriptions = LEGAL_PAGES.map(page => page.description);
    expect(new Set(titles).size).toBe(LEGAL_PAGES.length);
    expect(new Set(descriptions).size).toBe(LEGAL_PAGES.length);
    for (const page of LEGAL_PAGES) {
      expect(page.description.length, page.path).toBeGreaterThan(70);
      expect(page.description.length, page.path).toBeLessThanOrEqual(175);
    }
  });
});

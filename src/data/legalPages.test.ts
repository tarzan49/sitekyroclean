import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LEGAL_PAGES } from './legalPages';

// `legalPages.ts` guarda os títulos das secções para o HTML estático; o texto
// legal em si vive nos componentes React. São duas cópias da mesma lista de
// títulos, exatamente o padrão que o `problemRouteData.test.ts` já vigia: o
// remédio é um teste que rebenta quando divergirem, não confiar na memória.
const readPage = (component: string) =>
  fs.readFileSync(path.resolve(__dirname, `../pages/${component}.tsx`), 'utf-8');

const appSource = () => fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf-8');

describe('páginas legais', () => {
  it('declara as mesmas secções que o componente React desenha, pela mesma ordem', () => {
    for (const page of LEGAL_PAGES) {
      const source = readPage(page.component);
      const rendered = [...source.matchAll(/<Section title="([^"]*)"/g)].map(m => m[1]);
      expect(rendered, page.path).toEqual(page.sections);
    }
  });

  it('usa o <h1> e a data de atualização do componente', () => {
    for (const page of LEGAL_PAGES) {
      const source = readPage(page.component);
      expect(source, page.path).toContain(page.h1);
      expect(source, page.path).toContain(`Última atualização: ${page.updated}`);
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

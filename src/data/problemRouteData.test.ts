import { describe, it, expect } from 'vitest';
import { PROBLEM_ROUTE_SLUGS } from './problemRouteData';
import { getAllProblems } from './problemSeoData';

describe('rotas de problema', () => {
  // A lista de rotas e escrita a mao e vive separada de problemSeoData.ts para
  // manter o conteudo fora do bundle inicial. O preco disso e poder divergir:
  // em 2026-09-17 oito problemas novos ficaram sem paginas problema x cidade
  // porque ninguem se lembrou da segunda lista. Este teste apanha isso.
  it('cobre todos os problemas, sem sobras', () => {
    const problemas = getAllProblems().map(p => p.slug).sort();
    const rotas = PROBLEM_ROUTE_SLUGS.map(r => r.slug).sort();
    expect(rotas).toEqual(problemas);
  });

  it('usa as mesmas cidades que o problema declara', () => {
    const porSlug = new Map(getAllProblems().map(p => [p.slug, p.relatedCities]));
    for (const rota of PROBLEM_ROUTE_SLUGS) {
      expect(rota.relatedCities, rota.slug).toEqual(porSlug.get(rota.slug));
    }
  });
});

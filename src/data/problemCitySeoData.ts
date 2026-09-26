// Programmatic SEO: Problem × City combinations
// Targets searches like "tirar manchas sofá porto", "remover cheiro urina sofá matosinhos"

import { PROBLEM_ROUTE_SLUGS } from "./problemRouteData";
import { cities, cityPrep } from "./serviceCatalog";
import { METRO_CITIES as TOP_METRO } from "../constants/metroCities";
import { RESPONSE_PROMISE } from "../constants/commercialPolicy";

export interface ProblemCityRoute {
  path: string;
  problemSlug: string;
  citySlug: string;
}

// Generate all problem × city routes
export function getAllProblemCityRoutes(): ProblemCityRoute[] {
  const routes: ProblemCityRoute[] = [];

  for (const problem of PROBLEM_ROUTE_SLUGS) {
    const targetCities = cities.filter(c =>
      problem.relatedCities.includes(c.slug) || TOP_METRO.has(c.slug)
    );

    for (const city of targetCities) {
      routes.push({
        path: `/${problem.slug}-${city.slug}`,
        problemSlug: problem.slug,
        citySlug: city.slug,
      });
    }
  }

  return routes;
}

/**
 * As cidades onde a página de um problema existe mesmo.
 *
 * Usa exatamente o mesmo critério de `getAllProblemCityRoutes`, e não a lista
 * `relatedCities` do problema. A diferença não era pequena: a página mostrava
 * 179 cidades ao todo quando existiam 1.354 páginas, e as que ficavam de fora
 * não eram ligadas por mais ninguém — 173 delas só eram alcançáveis pelo
 * sitemap. A lista que a página mostra passa a vir da mesma função que decide
 * que páginas são geradas, por isso não pode voltar a ficar incompleta.
 *
 * Lida pela página React e pelo scripts/prerender.ts, para as duas audiências
 * receberem a mesma lista.
 */
export function getProblemCities(problemSlug: string): (typeof cities)[number][] {
  const slugs = new Set(
    getAllProblemCityRoutes()
      .filter(route => route.problemSlug === problemSlug)
      .map(route => route.citySlug),
  );
  return cities.filter(city => slugs.has(city.slug));
}

/**
 * Título e descrição de uma página problema × cidade.
 *
 * O React (ProblemCityPage.tsx) e o scripts/prerender.ts escreviam cada um o
 * seu: "{problema} no Porto ... Orçamento grátis em menos de 10 minutos" para
 * as pessoas e "{problema} em Porto ... Resposta em menos de 10 minutos" para
 * os motores. Uma função, lida pelos dois.
 */
export function problemCityMeta(problem: { h1: string; metaDescription: string }, cityName: string) {
  const where = `${cityPrep(cityName)} ${cityName}`;
  return {
    title: `${problem.h1} ${where} | Kyro Clean Solutions`,
    description: `${problem.h1} ${where}: serviço profissional ao domicílio. ${problem.metaDescription.split('.')[0]}. ${RESPONSE_PROMISE}.`,
  };
}

/** Rotação sobre uma ordem fixa: `size` elementos a partir de `start`. */
function rotatingWindow<T>(items: readonly T[], start: number, size: number): T[] {
  if (items.length <= size) return [...items];
  const offset = ((start % items.length) + items.length) % items.length;
  return Array.from({ length: size }, (_, index) => items[(offset + index) % items.length]);
}

/** Quantas cidades vizinhas cada página problema × cidade liga. */
export const PROBLEM_CITY_NEIGHBOURS = 6;

/**
 * "Este problema noutras cidades": as cidades a ligar a partir de uma página.
 *
 * Só cidades onde a página existe mesmo (`getProblemCities`), e numa janela
 * que roda com a cidade desenhada em vez de um `.slice()`: com uma ordem fixa,
 * as primeiras entradas recebiam todas as ligações e as restantes nenhuma. É a
 * correção da fase 8 que o HTML estático já tinha e a página React não (ainda
 * fazia `.slice(0, 8)`). A mesma regra de `coverageWindow` em
 * landingPageModel.ts, repetida aqui para a página React não ter de carregar o
 * modelo das páginas landing inteiro.
 */
export function problemCityNeighbours(problemSlug: string, citySlug: string, size = PROBLEM_CITY_NEIGHBOURS): (typeof cities)[number][] {
  const withPage = getProblemCities(problemSlug);
  const others = withPage.filter(city => city.slug !== citySlug);
  const start = withPage.findIndex(city => city.slug === citySlug);
  return rotatingWindow(others, start < 0 ? 0 : start, size);
}

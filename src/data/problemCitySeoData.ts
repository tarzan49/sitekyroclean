// Programmatic SEO: Problem × City combinations
// Targets searches like "tirar manchas sofá porto", "remover cheiro urina sofá matosinhos"

import { PROBLEM_ROUTE_SLUGS } from "./problemRouteData";
import { cities } from "./serviceCatalog";
import { METRO_CITIES as TOP_METRO } from "../constants/metroCities";

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

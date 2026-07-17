// Programmatic SEO: Problem × City combinations
// Targets searches like "tirar manchas sofá porto", "remover cheiro urina sofá matosinhos"

import { PROBLEM_ROUTE_SLUGS } from "./problemRouteData";
import { cities } from "./locationSeoData";
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

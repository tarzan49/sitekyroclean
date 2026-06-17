// Programmatic SEO: Problem × City combinations
// Targets searches like "tirar manchas sofá porto", "remover cheiro urina sofá matosinhos"

import { PROBLEM_ROUTE_SLUGS } from "./problemRouteData";
import { cities } from "./locationSeoData";

export interface ProblemCityRoute {
  path: string;
  problemSlug: string;
  citySlug: string;
}

const TOP_METRO = new Set(["porto", "matosinhos", "maia", "vila-nova-de-gaia", "gondomar", "braga", "lisboa"]);

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

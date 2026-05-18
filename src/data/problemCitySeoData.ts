// Programmatic SEO: Problem × City combinations
// Targets searches like "tirar manchas sofá porto", "remover cheiro urina sofá matosinhos"

import { getAllProblems } from "./problemSeoData";
import { cities } from "./locationSeoData";

export interface ProblemCityRoute {
  path: string;
  problemSlug: string;
  citySlug: string;
}

// Generate all problem × city routes
export function getAllProblemCityRoutes(): ProblemCityRoute[] {
  const problems = getAllProblems().filter(p => p.visible);
  const routes: ProblemCityRoute[] = [];

  for (const problem of problems) {
    // Only generate city pages for cities listed in the problem's relatedCities
    // plus top metro cities for broader coverage
    const targetCities = cities.filter(c =>
      problem.relatedCities.includes(c.slug) ||
      ["porto", "matosinhos", "maia", "vila-nova-de-gaia", "gondomar", "braga", "lisboa"].includes(c.slug)
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

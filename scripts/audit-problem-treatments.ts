import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAllProblems, getProblemBySlug } from '../src/data/problemSeoData';
import { getAllProblemCityRoutes } from '../src/data/problemCitySeoData';
import { getProblemLayout } from '../src/data/problemLayout';
const escaped = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const routes = [...getAllProblems().map(p => ({ path: `/problemas/${p.slug}`, problemSlug: p.slug })), ...getAllProblemCityRoutes()];
const failures: string[] = [];
for (const route of routes) {
  const layout = getProblemLayout(getProblemBySlug(route.problemSlug)!);
  const html = readFileSync(join('dist', `${route.path.slice(1)}.html`), 'utf8');
  for (const step of layout.process) if (!html.includes(escaped(step.description))) failures.push(`${route.path}: missing ${step.label}`);
  for (const example of layout.examples) if (example.image && !html.includes(escaped(example.image.src))) failures.push(`${route.path}: missing example image`);
}
console.log(JSON.stringify({routes: routes.length, problems: getAllProblems().length, failures}, null, 2));
if (failures.length) process.exit(1);

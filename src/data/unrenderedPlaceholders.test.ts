import { describe, it, expect } from 'vitest';
import { getAllProblems } from './problemSeoData';
import * as problemTips from './problemTipsData';
import * as enTourist from './enTouristSeoData';
import * as blog from './blogData';
import * as landingFaq from './landingFaqPool';
import * as resources from './resourceContent';
import * as keywordVariants from './keywordVariantData';
import * as study from './studyData';
import * as glossary from './glossaryTerms';
import * as legal from './legalPages';

// `"${REVIEW_RATING}"` entre aspas não interpola: fica texto literal. Aconteceu
// em produção (2026-09-23), com as páginas inglesas para anfitriões Airbnb a
// mostrarem `${REVIEW_RATING}★ on Google` a visitantes reais, e com duas
// páginas de problema a fazerem o mesmo. O TypeScript não avisa, porque é uma
// string válida, e o HTML estático dessas páginas não continha o campo — por
// isso só se via no site a sério.
//
// Este teste percorre os dados exportados já resolvidos e rebenta se algum
// valor ainda tiver sintaxe de template por expandir.
const MODULES: Record<string, unknown> = {
  problemSeoData: getAllProblems(),
  problemTipsData: problemTips,
  enTouristSeoData: enTourist,
  blogData: blog,
  landingFaqPool: landingFaq,
  resourceContent: resources,
  keywordVariantData: keywordVariants,
  studyData: study,
  glossaryTerms: glossary,
  legalPages: legal,
};

const PLACEHOLDER = /\$\{[^}]*\}/;

function findPlaceholders(value: unknown, path: string, seen: Set<unknown>, out: string[]): void {
  if (typeof value === 'string') {
    if (PLACEHOLDER.test(value)) out.push(`${path} => ${value.slice(0, 90)}`);
    return;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => findPlaceholders(item, `${path}[${index}]`, seen, out));
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'function') continue;
    findPlaceholders(item, `${path}.${key}`, seen, out);
  }
}

describe('conteúdo publicado', () => {
  it('não tem sintaxe de template por expandir em nenhum texto', () => {
    const found: string[] = [];
    for (const [name, value] of Object.entries(MODULES)) {
      findPlaceholders(value, name, new Set(), found);
    }
    expect(found).toEqual([]);
  });
});

// A migalha de uma página, tal como a pessoa a vê (a <nav> do hero, ou a do
// HTML estático) e tal como a página a declara (o BreadcrumbList do JSON-LD),
// para os testes que confirmam que são a mesma. Serve qualquer família: não
// sabe nada de preços nem de problemas.
import { expect } from 'vitest';
import { SITE_URL } from '../constants/business';
import type { BreadcrumbStep } from '../data/breadcrumb';

/** Um passo: o texto e, se for ligação, o destino (relativo, como na <nav>). */
export interface TrailStep { name: string | null; href: string | null }

interface ListItem { position: number; name: string; item: string }

/** A migalha que o React desenha: os filhos da <nav>, sem os separadores. */
export function visibleTrail(container: ParentNode): TrailStep[] {
  const navs = container.querySelectorAll('nav[aria-label="Breadcrumb"]');
  expect(navs).toHaveLength(1);
  return [...navs[0].children]
    .filter(node => node.getAttribute('aria-hidden') !== 'true')
    .map(node => ({ name: node.textContent, href: node.getAttribute('href') }));
}

/** A migalha do HTML estático: um <li> por passo, com ligação ou em texto. */
export function staticTrail(html: string): TrailStep[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const navs = doc.querySelectorAll('nav[aria-label="Breadcrumb"]');
  expect(navs).toHaveLength(1);
  return [...navs[0].querySelectorAll('li')]
    .map(li => ({ name: li.textContent, href: li.querySelector('a')?.getAttribute('href') ?? null }));
}

/** Os passos de um BreadcrumbList, pela ordem das posições. */
export function listTrail(list: { itemListElement: ListItem[] }): TrailStep[] {
  return [...list.itemListElement]
    .sort((a, b) => a.position - b.position)
    .map(entry => ({
      name: entry.name,
      href: entry.item.startsWith(SITE_URL) ? entry.item.slice(SITE_URL.length) || '/' : entry.item,
    }));
}

/** A migalha declarada no JSON-LD que o React desenha (tem de haver uma só). */
export function declaredTrail(container: ParentNode): TrailStep[] {
  const nodes = [...container.querySelectorAll('script[type="application/ld+json"]')]
    .map(script => JSON.parse(script.textContent || '{}'))
    .flatMap(block => block['@graph'] ?? [block]);
  const lists = nodes.filter(node => node['@type'] === 'BreadcrumbList');
  expect(lists).toHaveLength(1);
  return listTrail(lists[0]);
}

/** Os passos de uma função de migalha, como um BreadcrumbList os declara. */
export function stepsTrail(steps: BreadcrumbStep[]): TrailStep[] {
  return steps.map(step => ({ name: step.name, href: step.path }));
}

/**
 * O que se vê e o que se declara são a mesma migalha: os mesmos passos, pela
 * mesma ordem, com as mesmas ligações. O último passo é a própria página, em
 * texto na <nav> e com o URL da página no JSON-LD.
 */
export function expectSameSteps(visible: TrailStep[], declared: TrailStep[], pagePath: string) {
  expect(visible.map(step => step.name), pagePath).toEqual(declared.map(step => step.name));
  expect(visible.slice(0, -1).map(step => step.href), pagePath).toEqual(declared.slice(0, -1).map(step => step.href));
  expect(visible[visible.length - 1]?.href, pagePath).toBeNull();
  expect(declared[declared.length - 1]?.href, pagePath).toBe(pagePath);
}

/** A <nav> e o JSON-LD de uma página React desenhada. Devolve a declarada. */
export function expectSameTrail(container: ParentNode, pagePath: string): TrailStep[] {
  const declared = declaredTrail(container);
  expectSameSteps(visibleTrail(container), declared, pagePath);
  return declared;
}

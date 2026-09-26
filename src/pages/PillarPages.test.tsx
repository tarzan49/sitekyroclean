import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComponentType } from 'react';
import { PILLAR_PAGES } from '@/data/pillarPages';
import LimpezaSofas from './LimpezaSofas';
import LimpezaColchoes from './LimpezaColchoes';
import LimpezaTapetes from './LimpezaTapetes';
import LimpezaCadeiras from './LimpezaCadeiras';
import LimpezaAlcatifas from './LimpezaAlcatifas';
import Impermeabilizacao from './Impermeabilizacao';

// O que a pessoa recebe depois de o React montar: o <h1> do hero, as FAQs e o
// JSON-LD. Tem de ser o mesmo que o HTML estático (scripts/prerender.ts) já
// escreveu a partir de src/data/pillarPages.ts. As secções pesadas e sem
// relação com isto ficam simuladas.
vi.mock('@/components/CommercialHero', () => ({ default: (props: { title: string }) => <h1>{props.title}</h1> }));
vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/ServicePriceSection', () => ({ default: () => null }));
vi.mock('@/components/ServiceReviewsGrid', () => ({ default: () => null }));
vi.mock('@/components/ServiceExamplesGallery', () => ({ default: () => null }));
vi.mock('@/components/SofaProcessGuide', () => ({ default: () => null }));
vi.mock('@/components/ServiceProcessGuide', () => ({ default: () => null }));
vi.mock('@/components/ServiceEliteGuarantee', () => ({ default: () => null }));
vi.mock('@/components/ServiceExpertTips', () => ({ default: () => null }));
vi.mock('@/components/ServiceCityLinks', () => ({ default: () => null }));

const COMPONENTS: Record<string, ComponentType> = { LimpezaSofas, LimpezaColchoes, LimpezaTapetes, LimpezaCadeiras, LimpezaAlcatifas, Impermeabilizacao };

afterEach(() => cleanup());

describe('páginas-pilar depois de montar', () => {
  it('mostram o h1 e as FAQs de pillarPages e declaram um só FAQPage igual', () => {
    for (const page of PILLAR_PAGES) {
      const Page = COMPONENTS[page.component];
      const { container } = render(<MemoryRouter initialEntries={[page.path]}><Page /></MemoryRouter>);
      expect(container.querySelector('h1')?.textContent, page.path).toBe(page.h1);
      for (const faq of page.faqs) expect(container.textContent, `${page.path}: ${faq.question}`).toContain(faq.question);

      const blocks = [...container.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent || '{}'));
      const faqPages = blocks.filter(block => block['@type'] === 'FAQPage');
      expect(faqPages, page.path).toHaveLength(1);
      expect(faqPages[0].mainEntity.map((entry: { name: string }) => entry.name)).toEqual(page.faqs.map(faq => faq.question));

      const service = blocks.flatMap(block => block['@graph'] ?? []).find((node: { '@type'?: string }) => node['@type'] === 'Service');
      if (/orçamento/i.test(page.priceFrom)) expect(service, page.path).not.toHaveProperty('offers');
      else expect(service.offers.price, page.path).toBe(page.priceFrom.replace('€', ''));
      cleanup();
    }
  });
});

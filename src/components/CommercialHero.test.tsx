import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommercialHero from './CommercialHero';
vi.mock('./HeroBeforeAfterPool', () => ({ default: () => <div>Antes e depois</div> }));
afterEach(cleanup);

describe('mandatory commercial hero', () => {
  it('keeps the approved order and a real background for every service', () => {
    for (const serviceSlug of ['limpeza-sofas', 'limpeza-colchoes', 'limpeza-tapetes', 'limpeza-alcatifas', 'limpeza-cadeiras', 'impermeabilizacao']) {
      const { container } = render(<MemoryRouter><CommercialHero title="Cuidado profissional" serviceSlug={serviceSlug} whatsappHref="https://wa.me/351925530647" source="test" /></MemoryRouter>);
      expect([...container.querySelectorAll('[data-hero-part]')].map(node => node.getAttribute('data-hero-part'))).toEqual(['breadcrumb', 'title', 'subtitle', 'whatsapp', 'prices', 'comparison', 'stats']);
      expect(container.querySelector('picture img')?.getAttribute('src')).toBeTruthy();
      expect(container.querySelector('[data-hero-part="subtitle"]')!.textContent!.length).toBeLessThan(120);
      expect(container.querySelector('[data-hero-part="prices"]')!.textContent).toBe('Ver preços');
      expect(container.querySelector('[data-hero-part="prices"]')?.getAttribute('href')).toBe('#precos');
      const stats = container.querySelector('[data-hero-part="stats"]')!.textContent!;
      expect(stats).toContain('avaliações');
      expect(stats).toContain('<10 min');
      expect(stats).toContain(serviceSlug === 'impermeabilizacao' ? 'Ativação da proteção' : 'Secagem média');
      if (['limpeza-tapetes', 'limpeza-alcatifas'].includes(serviceSlug)) expect(container.textContent).toContain('Sob orçamento');
      cleanup();
    }
  });
  it('keeps the material image and uses municipality travel charges', () => {
    const { container } = render(<MemoryRouter><CommercialHero title="Sofá em tecido" serviceSlug="limpeza-sofas" image="/images/material.webp" city="Porto" breadcrumbs={[{label:'Início',to:'/'},{label:'Limpeza de Sofás'},{label:'Paranhos'}]} whatsappHref="https://wa.me/351925530647" source="test" /></MemoryRouter>);
    expect(container.querySelector('picture img')?.getAttribute('src')).toBe('/images/material.webp');
    expect(container.querySelector('nav')?.textContent).toContain('Paranhos');
    expect(container.textContent).toContain('deslocação 10€');
  });
});

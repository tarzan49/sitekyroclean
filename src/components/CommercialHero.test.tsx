import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommercialHero from './CommercialHero';
vi.mock('./HeroBeforeAfterPool', () => ({ default: () => <div>Antes e depois</div> }));
afterEach(cleanup);

describe('mandatory commercial hero', () => {
  it('keeps parish labels but uses the municipality for travel and consultation', () => {
    const { container } = render(<MemoryRouter><CommercialHero title="Higienização em Santa Clara, Coimbra" serviceSlug="limpeza-sofas" city="Santa Clara, Coimbra" municipality="Coimbra" whatsappHref="https://wa.me/351925530647" source="test" /></MemoryRouter>);
    expect(container.querySelector('nav')?.textContent).toContain('Santa Clara, Coimbra');
    expect(container.querySelector('[data-hero-part="subtitle"]')?.textContent).toContain('Disponibilidade sob consulta.');
    expect(container.textContent).toContain('deslocação 15€');
    expect(container.textContent).not.toContain('a partir de 10€');
  });
  it('opts the homepage out of mobile restyling and preserves its original photo', () => {
    const props = { title: 'Homepage', serviceSlug: 'limpeza-sofas', whatsappHref: 'https://wa.me/351925530647', source: 'home_hero', image: { m: '/mobile.webp', d: '/desktop.webp' } };
    const { container, rerender } = render(<MemoryRouter><CommercialHero {...props} preserveMobileHero /></MemoryRouter>);
    expect(container.querySelector('[data-mobile-hero]')).toBeNull();
    expect(container.querySelector('source')?.getAttribute('srcset')).toBe('/mobile.webp');
    rerender(<MemoryRouter><CommercialHero {...props} /></MemoryRouter>);
    expect(container.querySelector('[data-mobile-hero]')).not.toBeNull();
    expect(container.querySelector('source')?.getAttribute('srcset')).toMatch(/^data:image\/gif/);
    expect(container.querySelector('picture img')?.getAttribute('src')).toBe('/desktop.webp');
  });
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

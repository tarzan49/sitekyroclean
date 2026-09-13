import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import LandingServiceSections from './LandingServiceSections';
import { LANDING_SECTION_ORDER } from '../data/landingServiceCopy';
import { getLandingPageModel } from '../data/landingPageModel';

vi.mock('./ProblemCarousel', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('./CustomerReviews', () => ({ default: () => <div>Avaliações</div> }));
vi.mock('./PriceWidget', () => ({ default: (props: object) => <div data-testid="widget">{JSON.stringify(props)}</div> }));
vi.mock('./SofaProcessGuide', () => ({ default: () => <div>Processo sofá</div> }));
vi.mock('./ServiceProcessGuide', () => ({ default: () => <div>Processo serviço</div> }));
vi.mock('./QuizFormLazy', () => ({ default: ({ isOpen, ...props }: { isOpen: boolean; [key: string]: unknown }) => isOpen ? <div data-testid="quiz">{JSON.stringify(props)}</div> : null }));
afterEach(cleanup);

describe('landing section integration', () => {
  it('shows the editorial introduction and the same trust descriptions as initial HTML', () => {
    for (const route of ['/limpeza-sofas-lisboa', '/limpeza-sofas-porto-paranhos', '/preco-limpeza-sofas-lisboa', '/higienizacao-sofa-coimbra-santa-clara']) {
      const model = getLandingPageModel(route)!;
      const { container } = render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      expect(container.querySelector('[data-landing-editorial]')?.textContent).toBe(model.editorialIntro);
      fireEvent.click(screen.getByRole('button', { name: 'Porquê escolher a Kyro Clean?' }));
      for (const point of model.trustPoints) expect(screen.getAllByText(point.desc)).toHaveLength(2);
      expect(container.querySelectorAll('#duvidas button[aria-expanded]')).toHaveLength(4);
      cleanup();
    }
  });
  it('uses the rug selection in React across all four families', () => {
    for (const route of ['/limpeza-tapetes-lisboa', '/limpeza-tapetes-porto-paranhos', '/preco-limpeza-tapetes-lisboa', '/higienizacao-tapetes-lisboa']) {
      const model = getLandingPageModel(route)!;
      expect(model).not.toBeNull();
      const { container } = render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      const images = [...container.querySelectorAll('[data-problem-id] img')];
      expect(images).toHaveLength(4);
      expect(images.map(img => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') }))).toEqual(model.problems.map(card => ({ src: card.image!.src, alt: card.image!.alt })));
      expect(container.querySelectorAll('#duvidas button[aria-expanded]')).toHaveLength(4);
      cleanup();
    }
  });
  it('uses the mattress selection in React across all four families', () => {
    for (const route of ['/limpeza-colchoes-lisboa', '/limpeza-colchoes-porto-paranhos', '/preco-limpeza-colchoes-lisboa', '/higienizacao-colchao-lisboa']) {
      const model = getLandingPageModel(route)!;
      expect(model).not.toBeNull();
      const { container } = render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      const images = [...container.querySelectorAll('[data-problem-id] img')];
      expect(images).toHaveLength(4);
      expect(images.map(img => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') }))).toEqual(model.problems.map(card => ({ src: card.image!.src, alt: card.image!.alt })));
      expect(container.querySelectorAll('#duvidas button[aria-expanded]')).toHaveLength(4);
      cleanup();
    }
  });
  it('uses the public sofa library with or without the old preview parameter', () => {
    for (const [route, expected] of [
      ['/limpeza-sofas-lisboa?teste=imagens-sofas', 4],
      ['/limpeza-sofas-lisboa', 4],
      ['/limpeza-sofas-porto-paranhos', 4],
      ['/preco-limpeza-sofas-lisboa', 4],
      ['/higienizacao-sofa-lisboa', 4],
      ['/limpeza-colchoes-lisboa?teste=imagens-sofas', 0],
    ] as const) {
      const { container } = render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      expect(container.querySelectorAll('img[src^="/images/landing-problems/sofas/"]')).toHaveLength(expected);
      if (expected) {
        const selected = getLandingPageModel(route)!.problems.map(card => card.image!);
        expect([...container.querySelectorAll('[data-problem-id] img')].map(img => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') }))).toEqual(selected.map(image => ({ src: image.src, alt: image.alt })));
      }
      expect(container.querySelectorAll('[data-problem-id]')).toHaveLength(4);
      cleanup();
    }
  });
  it('keeps the seven-section order and four problem/FAQ cards in every family', () => {
    for (const route of ['/limpeza-sofas-lisboa', '/limpeza-colchoes-porto-paranhos', '/preco-limpeza-alcatifas-lisboa', '/higienizacao-tapetes-lisboa']) {
      const { container } = render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      expect([...container.querySelectorAll('[data-landing-section]')].map(element => element.getAttribute('data-landing-section'))).toEqual(LANDING_SECTION_ORDER);
      expect(container.querySelectorAll('[data-problem-id]')).toHaveLength(4);
      expect(container.querySelectorAll('#duvidas button[aria-expanded]')).toHaveLength(4);
      cleanup();
    }
  });
  it('preserves the reduced Ads directory without changing the FAQs or problems', () => {
    for (const route of ['/limpeza-sofas-lisboa?ads=1', '/higienizacao-sofa-lisboa?utm_medium=cpc']) {
      const { container } = render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      expect(container.querySelector('#zonas')).toBeNull();
      expect(container.querySelectorAll('[data-problem-id]')).toHaveLength(4);
      expect(container.querySelectorAll('#duvidas button[aria-expanded]')).toHaveLength(4);
      cleanup();
    }
  });
  it('passes the municipality and correct service to the widget and problem enquiry', () => {
    const cases = [
      { route: '/impermeabilizacao-cadeiras-porto-paranhos', serviceSlug: 'impermeabilizacao', initialService: 'chairs', initialServiceType: 'waterproofing', initialCarpetKind: 'tapete' },
      { route: '/limpeza-alcatifas-porto-paranhos', serviceSlug: 'limpeza-alcatifas', initialService: 'carpet', initialServiceType: 'cleaning', initialCarpetKind: 'alcatifa' },
      { route: '/higienizacao-sofa-porto-paranhos', serviceSlug: 'limpeza-sofas', initialService: 'sofa', initialServiceType: 'cleaning', initialCarpetKind: 'tapete' },
    ];
    for (const { route, serviceSlug, ...expected } of cases) {
      render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      expect(JSON.parse(screen.getByTestId('widget').textContent!)).toEqual({ initialLocation: 'Porto', serviceSlug });
      fireEvent.click(screen.getAllByRole('button', { name: /^Ampliar imagem:/ })[0]);
      fireEvent.click(screen.getByRole('button', { name: /^Pedir avaliação:/ }));
      expect(JSON.parse(screen.getByTestId('quiz').textContent!)).toMatchObject({ initialLocation: 'Porto', ...expected });
      cleanup();
    }
  });
});

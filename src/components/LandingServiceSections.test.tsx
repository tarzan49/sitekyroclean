import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import LandingServiceSections from './LandingServiceSections';
import { LANDING_SECTION_ORDER } from '../data/landingServiceCopy';

vi.mock('./ProblemCarousel', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('./CustomerReviews', () => ({ default: () => <div>Avaliações</div> }));
vi.mock('./PriceWidget', () => ({ default: (props: object) => <div data-testid="widget">{JSON.stringify(props)}</div> }));
vi.mock('./SofaProcessGuide', () => ({ default: () => <div>Processo sofá</div> }));
vi.mock('./ServiceProcessGuide', () => ({ default: () => <div>Processo serviço</div> }));
vi.mock('./QuizFormLazy', () => ({ default: ({ isOpen, ...props }: { isOpen: boolean; [key: string]: unknown }) => isOpen ? <div data-testid="quiz">{JSON.stringify(props)}</div> : null }));
afterEach(cleanup);

describe('landing section integration', () => {
  it('shows the image demonstration only on explicitly requested sofa previews', () => {
    for (const [route, expected] of [
      ['/limpeza-sofas-lisboa?teste=imagens-sofas', 4],
      ['/limpeza-sofas-lisboa', 0],
      ['/limpeza-colchoes-lisboa?teste=imagens-sofas', 0],
    ] as const) {
      const { container } = render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      expect(container.querySelectorAll('img[src^="/docs/sofa-image-pilot/"]')).toHaveLength(expected);
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
      fireEvent.click(screen.getAllByRole('button', { name: /^Pedir avaliação:/ })[0]);
      expect(JSON.parse(screen.getByTestId('quiz').textContent!)).toMatchObject({ initialLocation: 'Porto', ...expected });
      cleanup();
    }
  });
});

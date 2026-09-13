import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import LandingServiceSections from './LandingServiceSections';
import { installLandingModel, clearLandingModel } from '../test/landingModelDom';
import { LANDING_SECTION_ORDER } from '../data/landingServiceCopy';
import { getLandingPageModel } from '../data/landingPageModel';

vi.mock('./ProblemCarousel', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('./CustomerReviews', () => ({ default: () => <div>Avaliações</div> }));
vi.mock('./PriceWidget', () => ({ default: (props: object) => <div data-testid="widget">{JSON.stringify(props)}</div> }));
vi.mock('./SofaProcessGuide', () => ({ default: () => <div>Processo sofá</div> }));
vi.mock('./ServiceProcessGuide', () => ({ default: () => <div>Processo serviço</div> }));
vi.mock('./QuizFormLazy', () => ({ default: ({ isOpen, ...props }: { isOpen: boolean; [key: string]: unknown }) => isOpen ? <div data-testid="quiz">{JSON.stringify(props)}</div> : null }));
afterEach(() => { cleanup(); clearLandingModel(); });

describe('chair image integration', () => {
  it('uses the chair selection in React across all four families', () => {
    for (const route of ['/limpeza-cadeiras-lisboa', '/limpeza-cadeiras-porto-paranhos', '/preco-limpeza-cadeiras-lisboa', '/higienizacao-cadeiras-lisboa']) {
      const model = getLandingPageModel(route)!;
      expect(model).not.toBeNull();
      installLandingModel(route);
      const { container } = render(<MemoryRouter initialEntries={[route]}><LandingServiceSections /></MemoryRouter>);
      const images = [...container.querySelectorAll('[data-problem-id] img')];
      expect(images).toHaveLength(4);
      expect(images.map(img => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') }))).toEqual(model.problems.map(card => ({ src: card.image!.src, alt: card.image!.alt })));
      expect(container.querySelectorAll('#duvidas button[aria-expanded]')).toHaveLength(4);
      cleanup();
    }
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SofaProcessGuide from './SofaProcessGuide';
import ServiceProcessGuide from './ServiceProcessGuide';
import { SERVICE_PROCESS_GUIDES } from '../data/serviceProcessGuides';

afterEach(cleanup);

describe('process guide image containment', () => {
  const cases = [
    { name: 'sofa', component: <SofaProcessGuide /> },
    ...Object.keys(SERVICE_PROCESS_GUIDES).map(serviceSlug => ({
      name: serviceSlug,
      component: <ServiceProcessGuide serviceSlug={serviceSlug as keyof typeof SERVICE_PROCESS_GUIDES} />,
    })),
  ];
  for (const { name, component } of cases) {
    it(`constrains the image to its own grid column through all steps: ${name}`, () => {
      render(component);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
      for (const tab of tabs) {
        fireEvent.click(tab);
        const panel = screen.getByRole('tabpanel');
        const [media, copy] = Array.from(panel.children);
        // Definite width + no stretching prevent aspect-ratio transferring
        // the row height into an image width larger than the desktop track.
        for (const token of ['min-w-0', 'w-full', 'self-start', 'overflow-hidden']) {
          expect(media.classList.contains(token)).toBe(true);
        }
        expect(copy.classList.contains('min-w-0')).toBe(true);
        expect(copy.querySelector('h3')?.textContent).toBeTruthy();
        expect(media.querySelector('img')?.getAttribute('alt')).toBeTruthy();
        expect(tab.getAttribute('aria-selected')).toBe('true');
      }
    });
  }
});

describe('process guide image node reuse', () => {
  const cases = [
    { name: 'sofa', component: <SofaProcessGuide /> },
    ...Object.keys(SERVICE_PROCESS_GUIDES).map(serviceSlug => ({
      name: serviceSlug,
      component: <ServiceProcessGuide serviceSlug={serviceSlug as keyof typeof SERVICE_PROCESS_GUIDES} />,
    })),
  ];
  for (const { name, component } of cases) {
    // Um <img loading="lazy"> recriado já dentro do viewport não chega a carregar
    // no Safari do iOS: as etapas seguintes à primeira ficavam em branco. O nó tem
    // de sobreviver à troca de etapa, só as posições mudam.
    it(`keeps the same img element across steps: ${name}`, () => {
      render(component);
      const tabs = screen.getAllByRole('tab');
      const first = screen.getByRole('tabpanel').querySelector('img');
      expect(first).not.toBeNull();
      for (const tab of tabs.slice(1)) {
        fireEvent.click(tab);
        expect(screen.getByRole('tabpanel').querySelector('img')).toBe(first);
      }
    });
  }
});

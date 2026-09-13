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

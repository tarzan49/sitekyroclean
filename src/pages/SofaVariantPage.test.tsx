import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SofaVariantPage from './SofaVariantPage';
vi.mock('@/components/CommercialHero', () => ({ default: (props: {city: string; municipality: string}) => <div data-testid="hero">{JSON.stringify(props)}</div> }));
vi.mock('@/components/Header', () => ({default: () => null}));
vi.mock('@/components/Footer', () => ({default: () => null}));
vi.mock('@/components/LandingServiceSections', () => ({default: () => null}));
afterEach(cleanup);
describe('variant municipality wiring', () => {
  it('passes separate location and municipality to the real shared hero boundary', () => {
    for (const [route, place, municipality] of [
      ['/higienizacao-sofa-coimbra-santa-clara', 'Santa Clara, Coimbra', 'Coimbra'],
      ['/lavagem-tapetes-aveiro-gloria', 'Glória, Aveiro', 'Aveiro'],
      ['/impermeabilizacao-cadeiras-lisboa', 'Lisboa', 'Lisboa'],
      ['/higienizacao-sofa-porto-paranhos', 'Paranhos, Porto', 'Porto'],
    ]) {
      const { getByTestId } = render(<MemoryRouter initialEntries={[route]}><SofaVariantPage /></MemoryRouter>);
      const props = JSON.parse(getByTestId('hero').textContent!);
      expect(props.city).toBe(place);
      expect(props.municipality).toBe(municipality);
      cleanup();
    }
  });
});

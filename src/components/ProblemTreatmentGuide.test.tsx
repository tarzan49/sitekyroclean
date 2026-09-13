import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import ProblemTreatmentGuide from './ProblemTreatmentGuide';
import { getProblemBySlug } from '../data/problemSeoData';
import { getProblemTreatmentGuide } from '../data/problemTreatmentGuides';
afterEach(cleanup);
it('opens one treatment stage at a time and preserves local downloads', () => {
  const guide = getProblemTreatmentGuide(getProblemBySlug('manchas-cafe-sofa')!);
  const {container} = render(<ProblemTreatmentGuide guide={guide} slug="manchas-cafe-sofa" />);
  expect(screen.getAllByRole('region')).toHaveLength(1);
  expect(screen.getByRole('region').textContent).toContain('leite ou açúcar');
  fireEvent.click(screen.getByRole('button', {name:'2. Tratar'}));
  expect(screen.getAllByRole('region')).toHaveLength(1);
  expect(screen.getByRole('region').textContent).toContain('resíduos da bebida');
  expect([...container.querySelectorAll('a[download]')].map(a => a.getAttribute('href'))).toEqual([...new Set(guide.steps.map(s => s.image))]);
});

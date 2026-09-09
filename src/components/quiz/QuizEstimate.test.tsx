import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import QuizEstimate from './QuizEstimate';

beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: true })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const base = { totalPrice: 607, discountedPrice: 547, discountActive: true, needsQuote: false, travelOnly: false, location: 'Porto' };

describe('quote savings presentation', () => {
  it('uses the actual rounded quote amount and savings, keeping travel out of the discount', () => {
    render(<QuizEstimate {...base} />);
    expect(screen.getByLabelText('547 euros')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Poupa 60€ nesta visita');
    expect(screen.getByText('607€').tagName).toBe('S');
  });

  it('updates when extras are added and removes the savings when eligibility is lost', () => {
    const { rerender } = render(<QuizEstimate {...base} />);
    rerender(<QuizEstimate {...base} totalPrice={676} discountedPrice={609} />);
    expect(screen.getByLabelText('609 euros')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Poupa 67€');
    rerender(<QuizEstimate {...base} totalPrice={89} discountedPrice={89} discountActive={false} />);
    expect(screen.getByLabelText('89 euros')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('keeps unpriced services explicit and does not claim a saving on travel alone', () => {
    const { rerender } = render(<QuizEstimate {...base} needsQuote />);
    expect(screen.getByText('+ Sob orçamento')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('aos valores estimados');
    rerender(<QuizEstimate {...base} needsQuote travelOnly totalPrice={10} discountedPrice={10} />);
    expect(screen.getByLabelText('10 euros')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });
});

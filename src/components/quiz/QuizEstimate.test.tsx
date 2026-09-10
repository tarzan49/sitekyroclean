import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import QuizEstimate from './QuizEstimate';

beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: true })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const base = { totalPrice: 607, needsQuote: false, travelOnly: false, location: 'Porto' };

describe('quote total presentation', () => {
  it('shows the rounded total, with no discount concept involved', () => {
    render(<QuizEstimate {...base} />);
    expect(screen.getByLabelText('607 euros')).toBeTruthy();
  });

  it('updates the amount as extras are added', () => {
    const { rerender } = render(<QuizEstimate {...base} />);
    rerender(<QuizEstimate {...base} totalPrice={676} />);
    expect(screen.getByLabelText('676 euros')).toBeTruthy();
  });

  it('keeps unpriced services explicit', () => {
    const { rerender } = render(<QuizEstimate {...base} needsQuote />);
    expect(screen.getByText('+ Sob orçamento')).toBeTruthy();
    rerender(<QuizEstimate {...base} needsQuote travelOnly totalPrice={10} />);
    expect(screen.getByLabelText('10 euros')).toBeTruthy();
  });
});

// Bug real reportado: 1 cadeira (20€) + 10€ de deslocação aparecia só como
// "30€" no topo, sem nada visível a explicar a diferença — o cliente achava
// que a cadeira sozinha custava 30€. A composição detalhada já existia mas
// estava escondida atrás de um <details> fechado por omissão.
describe('travel cost visibility', () => {
  it('always shows the travel cost inline, without needing to open the breakdown', () => {
    render(<QuizEstimate {...base} totalPrice={30} travelCost={10} />);
    expect(screen.getByText(/Inclui 10€ de deslocação a Porto/)).toBeTruthy();
  });

  it('stays silent when there is no travel cost to explain', () => {
    render(<QuizEstimate {...base} />);
    expect(screen.queryByText(/deslocação/)).toBeNull();
  });

  it('does not repeat itself on the travel-only step', () => {
    render(<QuizEstimate {...base} travelOnly totalPrice={10} travelCost={10} />);
    expect(screen.queryByText(/Inclui/)).toBeNull();
  });
});

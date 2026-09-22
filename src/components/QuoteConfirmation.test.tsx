import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import QuoteConfirmation, { type ConfirmationReceipt } from './QuoteConfirmation';

afterEach(cleanup);
const receipt: ConfirmationReceipt = { lines: [{ label: 'Sofá de 4+ lugares', qty: 1, unitPrice: null, total: null }, { label: 'Deslocação', qty: 1, unitPrice: 10, total: 10 }], subtotal: 10, discountLabel: null, discountAmount: 0, total: 10, sobOrcamento: true, location: 'Lisboa', slot: 'Não especificado', bookingId: 'ABC123', name: '' };
const show = (data: ConfirmationReceipt | null) => render(<MemoryRouter><QuoteConfirmation receipt={data} waUrl="https://wa.me/351925530647?text=pedido" /></MemoryRouter>);
describe('Quote confirmation', () => {
  it('preserves quote-only items without presenting the known amount as a final total', () => {
    show(receipt);
    expect(screen.getByText('Sob orçamento')).toBeTruthy();
    expect(screen.getByText('Subtotal conhecido')).toBeTruthy();
    expect(screen.queryByText('Total estimado')).toBeNull();
    expect(screen.queryByText('Não especificado')).toBeNull();
    expect(screen.getByText('Lisboa')).toBeTruthy();
  });
  it('uses the supplied WhatsApp link for the single primary action', () => {
    show(receipt);
    const links = screen.getAllByRole('link', { name: 'Confirmar pelo WhatsApp' });
    expect(links).toHaveLength(1);
    links.forEach(link => expect(link.getAttribute('href')).toBe('https://wa.me/351925530647?text=pedido'));
  });
  it('does not invent a successful submission or a total without session data', () => {
    show(null);
    expect(screen.queryByText('Pedido recebido')).toBeNull();
    expect(screen.queryByText('Total estimado')).toBeNull();
    expect(screen.getByText(/Os detalhes do pedido não estão disponíveis/)).toBeTruthy();
  });
});

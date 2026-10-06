import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import QuoteConfirmation, { needsPhotoQuote, type ConfirmationReceipt } from './QuoteConfirmation';

afterEach(cleanup);
const receipt: ConfirmationReceipt = { lines: [{ label: 'Sofá de 4+ lugares', qty: 1, unitPrice: null, total: null }, { label: 'Deslocação', qty: 1, unitPrice: 10, total: 10 }], subtotal: 10, discountLabel: null, discountAmount: 0, total: 10, sobOrcamento: true, location: 'Lisboa', slot: 'Não especificado', bookingId: 'ABC123', name: '' };
// Um artigo com preço e outro sob orçamento.
const mixed: ConfirmationReceipt = { ...receipt, lines: [{ label: 'Limpeza de sofá de 3 lugares', qty: 1, unitPrice: 79, total: 79 }, ...receipt.lines], subtotal: 89, total: 89 };
const show = (data: ConfirmationReceipt | null) => render(<MemoryRouter><QuoteConfirmation receipt={data} waUrl="https://wa.me/351925530647?text=pedido" /></MemoryRouter>);
describe('Quote confirmation', () => {
  it('preserves quote-only items without presenting the known amount as a final total', () => {
    show(mixed);
    expect(screen.getByText('Sob orçamento')).toBeTruthy();
    expect(screen.getByText('Subtotal conhecido')).toBeTruthy();
    expect(screen.queryByText('Total estimado')).toBeNull();
    expect(screen.queryByText('Não especificado')).toBeNull();
    expect(screen.getByText('Lisboa')).toBeTruthy();
  });
  it('uses the supplied WhatsApp link for the single primary action', () => {
    show(mixed);
    const links = screen.getAllByRole('link', { name: 'Confirmar pelo WhatsApp' });
    expect(links).toHaveLength(1);
    links.forEach(link => expect(link.getAttribute('href')).toBe('https://wa.me/351925530647?text=pedido'));
  });
  it('asks for photos instead of showing the travel fee as a subtotal when nothing else has a price', () => {
    expect(needsPhotoQuote(receipt)).toBe(true);
    expect(needsPhotoQuote(mixed)).toBe(false);
    expect(needsPhotoQuote({ ...receipt, lines: [{ label: 'Tapete 1: 2 × 3 m (6 m²)', qty: 1, unitPrice: null, total: null }, { label: 'Recolha, entrega e deslocação (até 4 dias úteis)', qty: 1, unitPrice: 10, total: 10 }] })).toBe(true);
    show(receipt);
    expect(screen.queryByText('Subtotal conhecido')).toBeNull();
    expect(screen.getByText('O preço é dado por fotografia')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'Enviar fotografias no WhatsApp' })).toHaveLength(1);
  });
  it('does not invent a successful submission or a total without session data', () => {
    show(null);
    expect(screen.queryByText('Pedido recebido')).toBeNull();
    expect(screen.queryByText('Total estimado')).toBeNull();
    expect(screen.getByText(/Os detalhes do pedido não estão disponíveis/)).toBeTruthy();
  });
});

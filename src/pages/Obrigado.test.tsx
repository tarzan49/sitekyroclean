import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WHATSAPP_BASE } from '@/constants/business';
import Obrigado from './Obrigado';

const receipt = {
  lines: [{ label: 'Limpeza de sofá de 3 lugares', qty: 1, unitPrice: 79, total: 79 }, { label: 'Deslocação', qty: 1, unitPrice: 10, total: 10 }],
  subtotal: 89, total: 89, discountLabel: null, discountAmount: 0,
  sobOrcamento: false, location: 'Lisboa', slot: 'Não especificado', bookingId: 'ABC123', name: '',
};
const show = () => render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Obrigado /></MemoryRouter>);
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.unstubAllEnvs();
});

describe('Obrigado session integration', () => {
  it('restores the receipt and a usable WhatsApp reference after remounting', () => {
    sessionStorage.setItem('kyro_receipt', JSON.stringify(receipt));
    sessionStorage.setItem('kyro_wa_url', `${WHATSAPP_BASE}?text=${encodeURIComponent('Confirmar pedido #ABC123')}`);
    show();
    expect(screen.getByText('Limpeza de sofá de 3 lugares')).toBeTruthy();
    expect(screen.getByText('89,00 €', { exact: false })).toBeTruthy();
    const url = new URL(screen.getByRole('link', { name: 'Confirmar pelo WhatsApp' }).getAttribute('href')!);
    expect(url.origin + url.pathname).toBe(WHATSAPP_BASE);
    expect(url.searchParams.get('text')).toContain('ABC123');
    cleanup();
    show();
    expect(screen.getByText('#ABC123')).toBeTruthy();
  });

  it('keeps the contact action available if saved JSON is damaged', () => {
    sessionStorage.setItem('kyro_receipt', '{invalid');
    show();
    expect(screen.getByText(/Os detalhes do pedido não estão disponíveis/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Confirmar pelo WhatsApp' }).getAttribute('href')).toContain(WHATSAPP_BASE);
    expect(screen.queryByText('Pedido recebido')).toBeNull();
  });

  it('never displays the example receipt in production', () => {
    vi.stubEnv('DEV', false);
    window.history.replaceState({}, '', '/obrigado?exemplo=pedido');
    show();
    expect(screen.queryByText('#EXEMPLO')).toBeNull();
    expect(screen.queryByText('Total estimado')).toBeNull();
    expect(screen.getByText(/Os detalhes do pedido não estão disponíveis/)).toBeTruthy();
  });
});

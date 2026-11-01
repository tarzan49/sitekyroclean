import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

// Dados inventados: o repositório é público.
const base = { booked_at: '2026-10-20T10:00:00Z', locality: 'Porto', city: 'Porto', phone: null, source: 'WhatsApp', created_at: '2026-10-20T10:00:00Z', calendar_event_id: null, calendar_updated_at: null, calendar_missing_since: null, needs_review: null, upsell_value: 0, upsell_team: null, invoice_ref: null, invoice_value: null, invoice_by: null, invoice_issued_on: null, vat_on_top: false, review_requested: true };
const rows = [
  { ...base, id: 'r1', request_date: '2026-10-19', description: 'Sofá IVA à parte', client_name: 'Rita Teste', billed_value: 257.07, my_cut: 105, paid: true, invoiced: true, invoice_by: 'Empresa', vat_on_top: true },
  { ...base, id: 'r2', request_date: '2026-10-19', description: 'Pack IVA incluído', client_name: 'Marta Teste', billed_value: 729, my_cut: 365, paid: true, invoiced: true, invoice_by: 'Empresa', upsell_value: 100, upsell_team: 'Lisboa 1', locality: 'Lisboa' },
  { ...base, id: 'r3', request_date: '2026-10-21', description: 'Colchão por pagar', client_name: 'Joana Teste', billed_value: 89, my_cut: 45, paid: false, invoiced: false },
  { ...base, id: 'r4', request_date: '2026-10-05', description: 'Fatura do Francisco', client_name: 'Ana Teste', billed_value: 79, my_cut: 40, paid: true, invoiced: true, invoice_by: 'Francisco', invoice_issued_on: '2026-10-05' },
  { ...base, id: 'r5', request_date: '2026-09-12', description: 'Setembro por passar', client_name: 'Lia Teste', billed_value: 99, my_cut: 50, paid: true, invoiced: true, invoice_by: 'Empresa' },
];
const updates: Array<{ patch: Record<string, unknown>; id: unknown }> = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chain = (data: unknown[]): any => {
  const result = Promise.resolve({ data, error: null });
  return Object.assign(result, {
    select: () => chain(data),
    order: () => chain(data),
    update: (patch: Record<string, unknown>) => ({ eq: async (_c: string, id: unknown) => { updates.push({ patch, id }); return { error: null }; } }),
  });
};
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: (t: string) => chain(t === 'service_requests' ? rows : []) } }));
vi.mock('@/lib/crmCalendarSync', () => ({ syncCalendarIntoCrm: async () => ({ status: 'done', changed: false, counts: { added: 0, updated: 0, missing: 0, restored: 0 } }) }));

import CrmPanel from './CrmPanel';

const filters = () => within(screen.getByRole('group', { name: 'Filtrar pedidos por estado' }));
const descriptions = () => screen.queryAllByText(/Sofá IVA à parte|Pack IVA incluído|Colchão por pagar|Fatura do Francisco|Setembro por passar/).map(e => e.textContent);
const shown = () => [...new Set(descriptions())].sort();

describe('CrmPanel, filtros e fatura (dono, 27/10)', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date('2026-10-27T11:00:00Z') }); updates.length = 0; window.history.replaceState(null, '', '/'); });
  afterEach(() => { vi.useRealTimers(); });

  it('filtra por estado, sem colunas de fatura nem de avaliação na lista', async () => {
    render(<CrmPanel />);
    await waitFor(() => expect(shown()).toHaveLength(4));
    expect(shown()).not.toContain('Setembro por passar');
    expect(filters().queryByRole('button', { name: /fatura/i })).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'Fatura' })).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'Avaliação' })).toBeNull();

    // Todos os meses: entra a de setembro.
    fireEvent.click(screen.getByLabelText('Todos os meses'));
    expect(shown()).toHaveLength(5);
    fireEvent.click(screen.getByLabelText('Todos os meses'));

    fireEvent.click(filters().getByRole('button', { name: /Por pagar/ }));
    expect(shown()).toEqual(['Colchão por pagar']);
    fireEvent.click(filters().getByRole('button', { name: /^Todos/ }));
    expect(shown()).toHaveLength(4);
  });

  it('Com fatura abre a aba Faturas e IVA: por passar de todos os meses, IVA do mês, Francisco à parte', async () => {
    render(<CrmPanel />);
    await waitFor(() => expect(shown()).toHaveLength(4));
    fireEvent.click(screen.getByRole('button', { name: /Com fatura/ }));
    expect(screen.getByRole('tab', { name: 'Faturas e IVA' }).getAttribute('aria-selected')).toBe('true');
    // A aba fica no endereço, para voltar à página não abrir os Pedidos.
    expect(new URL(window.location.href).searchParams.get('crm')).toBe('iva');
    // Outubro: 48,07 + 155,02 (com o upsell) = 203,09; o Francisco fica de fora.
    expect(screen.getAllByText('203.09€').length).toBeGreaterThan(0);
    // Faturas por passar: a de setembro aparece já, sem mudar de mês.
    expect(screen.getByText(/Faturas por passar \(3\)/)).toBeTruthy();
    expect(screen.getAllByText("Lia Teste").length).toBeGreaterThan(0);
    // As do Francisco ficam fechadas à parte.
    expect(screen.getByText(/Faturas do Francisco \(1\)/)).toBeTruthy();
    expect(screen.queryByText('Joana Teste')).toBeNull();

    // Passar a fatura com um toque.
    fireEvent.click(screen.getAllByRole("button", { name: "Marcar como passada" })[0]);
    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0]).toMatchObject({ id: 'r5', patch: { invoice_issued_on: '2026-10-27' } });
  });

  it('Por pagar mostra todos os meses e os clientes que me devem, mesmo com a equipa acertada', async () => {
    rows.push({ ...base, id: 'r6', request_date: '2026-09-20', description: 'Cliente paga-me a mim', client_name: 'Rui Teste', billed_value: 150, my_cut: 75, paid: true, invoiced: false, paid_to_owner: true } as typeof rows[number]);
    try {
      render(<CrmPanel />);
      await waitFor(() => expect(shown()).toHaveLength(4));
      fireEvent.click(filters().getByRole('button', { name: /Por pagar/ }));
      expect(screen.getAllByText('Cliente paga-me a mim').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Colchão por pagar').length).toBeGreaterThan(0);
      expect(screen.getByText(/clientes 150€ \(1\)/)).toBeTruthy();
    } finally {
      rows.pop();
    }
  });
});

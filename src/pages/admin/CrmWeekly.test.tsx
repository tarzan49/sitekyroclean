// Dados inventados: o repositório é público.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CrmWeekly from './CrmWeekly';
import { addDays, lisbonDay, weekdayOf } from '@/lib/crmClosings';

const lastMonday = (() => { const d = lisbonDay(new Date()); return addDays(d, -weekdayOf(d) - 7); })();

vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  from(table: string) {
    const recent = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const clients = Array.from({ length: 10 }, (_, i) => ({ phone: `35191000${String(i).padStart(4, '0')}`, status: i < 8 ? 'cliente' : 'por_marcar', services: ['Colchão'], first_contact_at: recent, from_google_ads: false }));
    const data = table === 'clients' ? clients : [];
    const query: Record<string, unknown> = { then: (resolve: (r: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve) };
    query.select = () => query;
    return query;
  },
} }));
afterEach(cleanup);

describe('aba Métricas do CRM', () => {
  it('mostra a semana, o ranking com a meta de 70% e as semanas', async () => {
    const records = [{ id: '1', booked_at: `${lastMonday}T10:00:00Z`, created_at: `${lastMonday}T10:00:00Z`, request_date: lastMonday, billed_value: 120, my_cut: 60,
      upsell_value: null, upsell_team: null, locality: 'Porto', phone: null, source: 'WhatsApp', client_name: null, description: 'Limpeza colchão casal' },
      { id: '2', booked_at: `${addDays(lastMonday, -14)}T10:00:00Z`, created_at: `${addDays(lastMonday, -14)}T10:00:00Z`, request_date: lastMonday, billed_value: 333, my_cut: 167,
      upsell_value: null, upsell_team: null, locality: 'Porto', phone: null, source: 'WhatsApp', client_name: null, description: 'Limpeza sofá' }];
    render(<CrmWeekly records={records} />);
    await screen.findByText('Colchão', { selector: 'td' });
    expect(screen.getByText('Fechos da semana').parentElement!.textContent).toContain('120€ faturado');
    expect(screen.getByText('80%')).toBeTruthy();
    expect(screen.getByText('atingida')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '30 dias' }));
    expect(screen.getByText(/30 dias até hoje/)).toBeTruthy();
    expect((screen.getByRole('button', { name: /Seguinte/ }) as HTMLButtonElement).disabled).toBe(true);
    // Recuar uma semana: a semana do fecho deixa de ser a mostrada e o ranking acaba no domingo dela.
    fireEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    expect(screen.getByText('Fechos da semana').parentElement!.textContent).toContain('0€ faturado');
    fireEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    expect(screen.getByText('Fechos da semana').parentElement!.textContent).toContain('333€ faturado');
    expect((screen.getByRole('button', { name: /Anterior/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/30 dias até \d\d\/\d\d/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Última' }));
    expect(screen.getByText('Fechos da semana').parentElement!.textContent).toContain('120€ faturado');
  });
});

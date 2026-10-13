// Dados inventados: o repositório é público.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CrmClosings from './CrmClosings';
import { addDays, lisbonDay, weekdayOf } from '@/lib/crmClosings';
import { summarizeQuizLeads } from '@/lib/crmQuizLeads';

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

const row = (id: string, day: string, billed: number, description: string) => ({
  id, booked_at: `${day}T10:00:00Z`, created_at: `${day}T10:00:00Z`, request_date: day, billed_value: billed, my_cut: billed / 2,
  upsell_value: null, upsell_team: null, locality: 'Porto', phone: null, source: 'WhatsApp', client_name: null, description,
});

describe('aba Fechos do CRM', () => {
  it('abre na última semana completa, anda pelas semanas e mostra a revisão e a taxa por serviço', async () => {
    const services = [row('1', lastMonday, 120, 'Limpeza colchão casal'), row('2', addDays(lastMonday, -14), 333, 'Limpeza sofá')];
    // Dois pedidos do site há 10 dias, um fechou (serviço no CRM com o mesmo telefone): 50%, a meta.
    const quizRows = [{ ...row('3', addDays(lisbonDay(new Date()), -9), 90, 'Limpeza tapete'), phone: '920000001' }];
    const at = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const quiz = summarizeQuizLeads([
      { id: 'a', created_at: at, name: 'Rui Costa', phone: '920000001', service: 'Tapete', location: null, value: null, source: 'Website' },
      { id: 'b', created_at: at, name: 'Eva Lopes', phone: '920000002', service: 'Tapete', location: null, value: null, source: 'Website' },
    ], quizRows);
    render(<CrmClosings records={services} services={[...services, ...quizRows]} quiz={quiz} />);
    expect(await screen.findByText(/Última semana completa/)).toBeTruthy();
    expect(screen.getByText('Revisão de segunda-feira')).toBeTruthy();
    expect(screen.getByText('120€ faturado')).toBeTruthy();
    // Contactos de há 10 dias: entram na taxa de 30 dias, colchão com a meta atingida (8 de 10).
    fireEvent.click(screen.getByRole('button', { name: '30 dias' }));
    await screen.findByText('Limpeza de colchão', { selector: 'td' });
    expect(screen.getAllByText('80%').length).toBeGreaterThan(0);
    expect(screen.getByText('atingida')).toBeTruthy();
    expect(screen.getByText('Questionário · meta 50%')).toBeTruthy();
    expect(screen.getByText('1 fecho de 2 orçamentos')).toBeTruthy();
    expect(screen.getByText('Meta atingida')).toBeTruthy();
    expect(screen.queryByText('Revisão de segunda-feira')).toBeNull();
    // Carregar numa coluna do gráfico volta à semana.
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Semana de ${addDays(lastMonday, -14).slice(8, 10)}/`) }));
    expect(screen.getByText('333€ faturado')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Semana anterior' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Semana seguinte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Semana seguinte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Semana seguinte' }));
    expect(screen.getByText(/Semana em curso/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Semana seguinte' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

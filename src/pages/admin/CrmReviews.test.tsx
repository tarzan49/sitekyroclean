// Dados inventados: o repositório é público.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CrmReviews from './CrmReviews';
import { lisbonDay, shiftMonth } from '@/lib/crmClosings';

const thisMonth = lisbonDay(new Date()).slice(0, 7);
const lastMonth = shiftMonth(thisMonth, -1);

const updates: unknown[] = [];
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  from() {
    const data = [
      { review_id: 'r1', profile: 'porto', author: 'Ana Teste', stars: 5, reviewed_at: `${lastMonth}-10T10:00:00Z`, service_request_id: 's1', excluded: null },
      { review_id: 'r2', profile: 'lisboa', author: 'Rui Teste', stars: 4, reviewed_at: `${lastMonth}-12T10:00:00Z`, service_request_id: null, excluded: null },
      { review_id: 'r3', profile: 'porto', author: 'Equipa Teste', stars: 5, reviewed_at: `${lastMonth}-12T10:00:00Z`, service_request_id: null, excluded: 'equipa' },
    ];
    const query: Record<string, unknown> = { then: (resolve: (r: unknown) => unknown) => Promise.resolve({ data, error: null }).then(resolve) };
    query.select = () => query;
    query.order = () => query;
    query.update = (patch: unknown) => { updates.push(patch); return query; };
    query.eq = () => query;
    return query;
  },
} }));
afterEach(cleanup);

const service = (id: string, day: string, name: string) => ({ id, request_date: day, client_name: name, city: 'Porto', locality: 'Porto', billed_value: 89 });

describe('aba Avaliações do CRM', () => {
  it('mostra o mês, os serviços com e sem avaliação, e liga uma avaliação a um serviço', async () => {
    render(<CrmReviews services={[service('s1', `${lastMonth}-08`, 'Ana Teste'), service('s2', `${lastMonth}-09`, 'Rui Teste')]} />);
    fireEvent.click(await screen.findByLabelText('Mês anterior'));
    expect(screen.getByText('1 de 2')).toBeTruthy();
    expect(screen.getByText('Avaliações de ' + new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${lastMonth}-15T12:00:00Z`)) + ' sem serviço ligado')).toBeTruthy();
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'r2' } });
    await vi.waitFor(() => expect(updates).toContainEqual({ service_request_id: 's2' }));
  });
});

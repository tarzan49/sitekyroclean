// Dados inventados: o repositório é público.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CrmReviews from './CrmReviews';
import { lisbonDay, shiftMonth } from '@/lib/crmClosings';

const thisMonth = lisbonDay(new Date()).slice(0, 7);
const lastMonth = shiftMonth(thisMonth, -1);

const updates: unknown[] = [];
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  from(table: string) {
    const data = table === 'service_procedure' ? [
      { calendar_event_id: 'ev1', service_request_id: 's1', team: 'Porto 2', service_day: `${lastMonth}-08`, prompt_msg_ids: ['m1'], prompted_at: `${lastMonth}-08T17:00:00Z`,
        before_msg_id: 'b', before_at: `${lastMonth}-08T17:05:00Z`, after_msg_id: 'a', after_at: `${lastMonth}-08T17:05:00Z`, video_msg_id: null, video_at: null,
        reminders_sent: 0, last_reminder_at: null, status: 'em_curso', closed_at: null, penalty_paid: false },
    ] : [
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
    expect(screen.getByText('Sem mensagem do bot')).toBeTruthy();
    expect(screen.getAllByText('Porto 2').length).toBeGreaterThan(0);
    expect(screen.getByTitle('vídeo: não')).toBeTruthy();
    expect(screen.getByText('Procedimento por semana e equipa')).toBeTruthy();
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'r2' } });
    await vi.waitFor(() => expect(updates).toContainEqual({ service_request_id: 's2' }));
  });
});

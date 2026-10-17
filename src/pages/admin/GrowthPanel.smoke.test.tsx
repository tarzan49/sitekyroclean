import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const ORGANIC_WEEKS = ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14'];
const tables: Record<string, Record<string, unknown>[]> = {
  service_requests: [
    ...ORGANIC_WEEKS.map((w, i) => ({ id: `o${i}`, booked_at: `${w}T10:00:00Z`, billed_value: 100, upsell_value: 0, my_cut: 50, description: 'Limpeza de sofá', locality: 'Porto' })),
    { id: 'a1', booked_at: '2026-09-29T10:00:00Z', billed_value: 300, upsell_value: 0, my_cut: 150, description: 'Limpeza de sofá 3 lugares', locality: 'Lisboa', source: 'Google Ads' },
    { id: 'a2', booked_at: '2026-10-06T10:00:00Z', billed_value: 400, upsell_value: 0, my_cut: 200, description: 'Impermeabilização Premium', locality: 'Porto' },
    { id: 'a3', booked_at: '2026-10-13T10:00:00Z', billed_value: 89, upsell_value: 0, my_cut: 45, description: 'Limpeza de colchão', locality: 'Braga' },
  ],
  ads_daily_stats: [
    { stat_date: '2026-09-29', cost: 80, clicks: 40, conversions: 2, campaign_name: 'Kyro | Porto | Limpeza e Proteção de Sofás | Set 2026' },
    { stat_date: '2026-10-06', cost: 80, clicks: 40, conversions: 2, campaign_name: 'Kyro | Porto | Limpeza e Proteção de Sofás | Set 2026' },
    { stat_date: '2026-10-13', cost: 30, clicks: 20, conversions: 1, campaign_name: 'Kyro | Porto | Limpeza e Proteção de Sofás | Set 2026' },
  ],
  whatsapp_weekly_stats: [...ORGANIC_WEEKS, '2026-09-28', '2026-10-05'].map(week => ({ week, source: 'whatsapp_web', new_people: week >= '2026-09-28' ? 6 : 2, people_wrote: 8, counted_at: '2026-10-12T07:30:00Z' })),
  whatsapp_conversations: [
    { first_at: '2026-09-30T10:00:00Z', started_by_us: false, origin: 'google', updated_at: '2026-10-14T10:17:00Z' },
    { first_at: '2026-10-07T10:00:00Z', started_by_us: false, origin: 'organico', updated_at: '2026-10-14T10:17:00Z' },
    { first_at: '2026-10-13T10:00:00Z', started_by_us: false, origin: 'google', updated_at: '2026-10-14T10:17:00Z' },
  ],
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chain = (rows: Record<string, unknown>[]): any => ({
  select: () => chain(rows),
  gte: (col: string, v: string) => chain(rows.filter(r => String(r[col]) >= v)),
  range: async (a: number, b: number) => ({ data: rows.slice(a, b + 1), error: null }),
});
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: (t: string) => chain(tables[t] ?? []) } }));
vi.mock('@/lib/crmCalendarSync', () => ({ syncCalendarIntoCrm: async () => ({ status: 'done', changed: false, counts: {} }) }));

import GrowthPanel from './GrowthPanel';

describe('GrowthPanel', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date('2026-10-14T11:00:00Z') }); });
  afterEach(() => { vi.useRealTimers(); });

  it('desenha o lucro dos anúncios, a semana ao vivo, as dicas, o gráfico, o simulador e as campanhas', async () => {
    render(<GrowthPanel />);
    await waitFor(() => expect(screen.getByText(/Lucro dos anúncios desde 28\/09/)).toBeTruthy());
    expect(screen.getByText('Esta semana, ao vivo')).toBeTruthy();
    expect(screen.getByText('Até quarta às 12:00, contra a semana passada à mesma hora.')).toBeTruthy();
    expect(screen.getByText('Dicas para crescer')).toBeTruthy();
    expect(screen.getByText('Porto | Set 2026')).toBeTruthy();
    expect(screen.getByText('Limpeza de colchão')).toBeTruthy();
    expect(screen.getByText('Média orgânica')).toBeTruthy();

    // Trocar o número do gráfico e escolher uma semana.
    const fechos = screen.getByRole('tab', { name: 'Fechos' });
    fireEvent.click(fechos);
    expect(fechos.getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /^Semana de 28\/09/ }));
    expect(screen.getByText('Semana de 28/09 a 04/10')).toBeTruthy();

    // O simulador responde aos atalhos.
    fireEvent.click(screen.getByRole('button', { name: '+10€ de ticket' }));
    expect(screen.getByText(/por semana \(.*por mês\) face a hoje/)).toBeTruthy();
  });
});

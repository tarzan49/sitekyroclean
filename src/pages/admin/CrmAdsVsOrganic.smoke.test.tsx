import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const tables: Record<string, unknown[]> = {
  service_requests: [{ booked_at: '2026-08-04T10:00:00Z', billed_value: 100, upsell_value: 0, my_cut: 50 }, { booked_at: '2026-09-29T10:00:00Z', billed_value: 300, upsell_value: 0, my_cut: 150 }],
  ads_daily_stats: [{ stat_date: '2026-09-29', cost: 80 }],
  whatsapp_weekly_stats: [{ week: '2026-08-03', source: 'whatsapp_web', new_people: 20, people_wrote: 30, counted_at: '2026-10-17T13:00:00Z' }],
};
const chain = (rows: unknown[]) => { const q: any = { select: () => q, gte: () => q, limit: () => q, then: (f: any) => Promise.resolve({ data: rows, error: null }).then(f) }; return q; };
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: (t: string) => chain(tables[t] ?? []) } }));

import CrmAdsVsOrganic from './CrmAdsVsOrganic';

describe('CrmAdsVsOrganic', () => {
  it('desenha as duas tabelas', async () => {
    render(<CrmAdsVsOrganic />);
    await waitFor(() => expect(screen.getByText('Média orgânica')).toBeTruthy());
    expect(screen.getByText('O que os anúncios trouxeram a mais do que a média orgânica')).toBeTruthy();
    expect(screen.getAllByText('Total').length).toBe(1);
  });
});

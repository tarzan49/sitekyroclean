import { describe, expect, it } from 'vitest';
import { teamWeek, weekStartOf } from './weeklySettlement';
import type { AccountEvent, AccountRow } from './teamAccounts';

const ev = (id: string, team: string): AccountEvent => ({ id, summary: 'Serviço', description: `Equipa: ${team}`, status: 'confirmed', start: null, end: null } as AccountEvent);
const row = (id: string, date: string, paid: boolean, event: string): AccountRow => ({
  id, request_date: date, client_name: 'Ana', city: 'Viana', locality: null, billed_value: 209, my_cut: 95,
  upsell_value: 0, upsell_team: null, paid, calendar_event_id: event, calendar_missing_since: null,
});

describe('teamWeek', () => {
  it('segunda a domingo, só a equipa escolhida, com o estado de cada serviço', () => {
    expect(weekStartOf('2026-11-01')).toBe('2026-10-26');
    const rows = [row('a', '2026-10-28', false, 'e1'), row('b', '2026-10-27', true, 'e1'), row('c', '2026-10-29', false, 'e2'), row('d', '2026-11-02', false, 'e1')];
    const events = [ev('e1', 'Porto 1'), ev('e2', 'Braga')];
    const week = teamWeek(rows, events, 'Porto 1', '2026-10-26', '2026-11-01');
    expect(week.map(w => [w.id, w.status, w.amount])).toEqual([['b', 'pago', 95], ['a', 'por_pagar', 95]]);
  });
});

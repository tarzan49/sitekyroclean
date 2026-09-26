import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from './calendarServices';
import { CALENDAR_SOURCE, planCalendarSync, type SyncableRow } from './calendarSync';

const since = '2026-09-26T15:00:00Z';
const now = '2026-09-28T09:00:00Z';

const event = (id: string, extra: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id,
  summary: 'Serviço 45€ (89€) Limpeza de sofá - 912 345 678 - Ana - Rua das Flores 1, 4400-100 Vila Nova de Gaia',
  description: '', location: '', startDate: '2026-10-01',
  created: '2026-09-27T10:00:00Z', updated: '2026-09-27T10:00:00Z', status: 'CONFIRMED', ...extra,
});

const row = (id: string, extra: Partial<SyncableRow> = {}): SyncableRow => ({
  id, city: null, locality: 'Porto', needs_review: null, booked_at: '2026-09-27T10:00:00+00:00',
  calendar_event_id: null, calendar_updated_at: null, calendar_missing_since: null, ...extra,
});

const plan = (rows: SyncableRow[], events: CalendarEvent[]) => planCalendarSync(rows, events, { since, now });

describe('planCalendarSync', () => {
  it('inserts a new service event with the event creation as closing date', () => {
    const { inserts, counts } = plan([], [event('e1')]);
    expect(counts).toEqual({ added: 1, updated: 0, missing: 0, restored: 0 });
    expect(inserts[0]).toMatchObject({
      calendar_event_id: 'e1', booked_at: '2026-09-27T10:00:00Z', calendar_updated_at: '2026-09-27T10:00:00Z',
      request_date: '2026-10-01', billed_value: 89, my_cut: 45, locality: 'Porto', source: CALENDAR_SOURCE, paid: false,
    });
  });

  it('ignores reminders, cancelled events and events created before the start', () => {
    const { inserts } = plan([], [
      event('reminder', { summary: 'Ligar Ana 912 345 678 follow up 89€' }),
      event('cancelled', { status: 'CANCELLED' }),
      event('old', { created: '2026-09-26T13:14:49Z' }),
    ]);
    expect(inserts).toEqual([]);
  });

  it('never inserts an event that is already linked', () => {
    const linked = row('r1', { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' });
    expect(plan([linked], [event('e1')])).toMatchObject({ inserts: [], updates: [] });
  });

  it('applies an edit made in the calendar after the last sync, but never touches "paid"', () => {
    const linked = row('r1', { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' });
    const edited = event('e1', { updated: '2026-09-27T18:00:00Z', summary: 'Serviço 50€ (99€) Limpeza de sofá - 4400-100 Vila Nova de Gaia' });
    const { updates, counts } = plan([linked], [edited]);
    expect(counts.updated).toBe(1);
    expect(updates[0].patch).toMatchObject({ billed_value: 99, my_cut: 50, calendar_updated_at: '2026-09-27T18:00:00Z' });
    expect(updates[0].patch).not.toHaveProperty('paid');
    expect(updates[0].patch).not.toHaveProperty('source');
  });

  it('marks a synced row whose event disappeared, and unmarks it if it comes back', () => {
    const linked = row('r1', { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' });
    const gone = plan([linked], [event('other', { summary: 'Jantar' })]);
    expect(gone.updates).toEqual([{ id: 'r1', patch: { calendar_missing_since: now } }]);
    expect(gone.counts.missing).toBe(1);

    const back = plan([{ ...linked, calendar_missing_since: now }], [event('e1')]);
    expect(back.updates).toEqual([{ id: 'r1', patch: { calendar_missing_since: null } }]);
    expect(back.counts.restored).toBe(1);
  });

  it('treats an event renamed away from "Serviço" as gone', () => {
    const linked = row('r1', { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' });
    expect(plan([linked], [event('e1', { summary: 'Cancelado - Ana sofá', updated: '2026-09-27T20:00:00Z' })]).counts.missing).toBe(1);
  });

  it('does not watch rows linked before the start (backfilled closing dates)', () => {
    const backfilled = row('r1', { calendar_event_id: 'old', booked_at: '2026-08-10T09:00:00+00:00' });
    expect(plan([backfilled], []).updates).toEqual([]);
  });

  it('uses places the owner already wrote in the CRM', () => {
    const rows = [row('manual', { city: 'Antas', locality: 'Porto' })];
    const { inserts } = plan(rows, [event('e1', { summary: 'Serviço 50€ (100€) Recolha de tapetes Antas' })]);
    expect(inserts[0]).toMatchObject({ locality: 'Porto', needs_review: null });
  });
});

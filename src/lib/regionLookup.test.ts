import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from './calendarServices';
import { planCalendarSync } from './calendarSync';
import { regionFromHits, regionFromPhone, resolveMissingRegions, type MapHit, type MapSearch } from './regionLookup';
import { streetForMap } from './calendarServices';

// Dados inventados: o repositório é público.
const event = (id: string, summary: string): CalendarEvent => ({
  id, summary, description: '', location: '', startDate: '2026-10-01',
  created: '2026-09-27T10:00:00Z', updated: '2026-09-27T10:00:00Z', status: 'CONFIRMED',
});
const since = '2026-09-26T15:00:00Z';
const now = '2026-09-28T09:00:00Z';
const noAddress = 'Serviço 45€ (89€) Limpeza de sofá - 912 345 678 - Rua D. João IV 376, 1º, 105';

const porto: MapHit = { postcode: '4000-370', names: ['Porto'] };
const famalicao: MapHit = { postcode: '4760-708', names: ['Ribeirão', 'Vila Nova de Famalicão'] };
const braga: MapHit = { postcode: '4710-422', names: ['Braga'] };

describe('streetForMap', () => {
  it('keeps only the street and the door number', () => {
    expect(streetForMap(event('e', noAddress))).toBe('Rua D. João IV 376');
    expect(streetForMap(event('e', 'Serviço 45€ (89€) Limpeza - Ana - 912 345 678 - Rua Inventada Moura 28 , cave esquerda'))).toBe('Rua Inventada Moura 28');
  });
});

describe('regionFromHits', () => {
  it('decides when every answer agrees', () => {
    expect(regionFromHits([braga])).toEqual({ locality: 'Braga', city: 'Braga', note: null });
  });

  it('takes the first answer and asks for confirmation when they disagree', () => {
    const found = regionFromHits([porto, famalicao, porto]);
    expect(found).toMatchObject({ locality: 'Porto', city: 'Porto' });
    expect(found?.note).toContain('também existe em Braga');
  });

  it('decides nothing without an answer', () => {
    expect(regionFromHits([])).toBeNull();
  });
});

describe('regionFromPhone', () => {
  const row = (id: string, phone: string, locality: 'Porto' | 'Lisboa', needs_review: string | null = null) =>
    ({ id, phone, city: null, locality, needs_review, calendar_event_id: null });

  it('uses a previous client with the same number, whatever the format', () => {
    expect(regionFromPhone([row('a', '+351 912 345 678', 'Lisboa')], '912345678')?.locality).toBe('Lisboa');
  });

  it('ignores contradictory or unconfirmed rows', () => {
    expect(regionFromPhone([row('a', '912345678', 'Lisboa'), row('b', '912345678', 'Porto')], '912345678')).toBeNull();
    expect(regionFromPhone([row('a', '912345678', 'Lisboa', 'Região deduzida')], '912345678')).toBeNull();
  });
});

describe('resolveMissingRegions', () => {
  const search = (hits: MapHit[]): MapSearch & { calls: string[] } => {
    const calls: string[] = [];
    return Object.assign(async (q: string) => { calls.push(q); return hits; }, { calls });
  };

  it('fills a new row from the map and keeps the other review notes', async () => {
    const plan = planCalendarSync([], [event('e1', noAddress)], { since, now });
    expect(plan.inserts[0].locality).toBeNull();
    const map = search([porto, famalicao]);
    expect(await resolveMissingRegions([], plan, [event('e1', noAddress)], { search: map, pauseMs: 0 })).toBe(1);
    expect(map.calls).toEqual(['Rua D. João IV 376']);
    expect(plan.inserts[0]).toMatchObject({ locality: 'Porto', city: 'Porto' });
    expect(plan.inserts[0].needs_review).toContain('confirmar');
    expect(plan.inserts[0].needs_review).not.toContain('Região por identificar');
  });

  it('prefers the phone of a previous client and does not ask the map', async () => {
    const previous = { id: 'old', phone: '+351 912 345 678', city: 'Maia', locality: 'Porto' as const, needs_review: null, calendar_event_id: null };
    const plan = planCalendarSync([], [event('e1', noAddress)], { since, now });
    const map = search([braga]);
    await resolveMissingRegions([previous], plan, [event('e1', noAddress)], { search: map, pauseMs: 0 });
    expect(map.calls).toEqual([]);
    expect(plan.inserts[0]).toMatchObject({ locality: 'Porto', city: 'Maia', needs_review: null });
  });

  it('retries rows already in the CRM, but not the ones the owner fixed', async () => {
    const waiting = { id: 'r1', phone: null, city: null, locality: null, needs_review: 'Região por identificar', calendar_event_id: 'e1' };
    const fixed = { ...waiting, id: 'r2', needs_review: null, calendar_event_id: 'e2' };
    const plan = { inserts: [], updates: [], counts: { added: 0, updated: 0, missing: 0, restored: 0 } };
    await resolveMissingRegions([waiting, fixed], plan, [event('e1', noAddress), event('e2', noAddress)], { search: search([braga]), pauseMs: 0 });
    expect(plan.updates).toEqual([{ id: 'r1', patch: { locality: 'Braga', city: 'Braga', needs_review: null } }]);
  });

  it('leaves the row as it was when the map is down', async () => {
    const plan = planCalendarSync([], [event('e1', noAddress)], { since, now });
    const failing: MapSearch = async () => { throw new Error('offline'); };
    expect(await resolveMissingRegions([], plan, [event('e1', noAddress)], { search: failing, pauseMs: 0 })).toBe(0);
    expect(plan.inserts[0]).toMatchObject({ locality: null, needs_review: 'Região por identificar' });
  });
});

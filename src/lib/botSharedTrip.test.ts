import { describe, expect, it } from 'vitest';
import { botAvailability, type AvailabilityEvent } from './botAvailability';
import { botQuote } from './botQuote';
import { planBotBooking } from './botHold';

// Monday 19 Oct 2026, 12:00 in Portugal (UTC+1). Invented data only: the repo is public.
const NOW = new Date('2026-10-19T11:00:00Z');
// 26 Oct is after the clocks go back: UTC+0.
const at = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00+00:00`).toISOString();
const ev = (date: string, from: string, to: string, summary: string, description = ''): AvailabilityEvent =>
  ({ summary, description, status: 'CONFIRMED', start: at(date, from), end: at(date, to) });
const SINES = ev('2026-10-26', '09:00', '10:00', 'Serviço 45€ (89€) Sofá - 910000000 - Ana - Rua X 1, 7520-000 Sines', 'Equipa: Lisboa 1');
const sofa5 = [{ kind: 'sofa', size: '5-lugares', qty: 1 }];

describe('far zone: piggyback on a booked service (owner, 19 Oct 2026)', () => {
  it('without a booked service in the zone, hands the date to the owner as before', () => {
    const r = botAvailability({ city: 'Santiago do Cacém', items: sofa5 }, [], NOW);
    expect('error' in r ? null : r.handToOwner).toMatch(/sob consulta/);
  });

  it('offers the day of the Sines job, right after it, same team', () => {
    const r = botAvailability({ city: 'Santiago do Cacém', items: sofa5 }, [SINES], NOW);
    if ('error' in r) throw new Error(r.error);
    expect(r.handToOwner).toBeNull();
    expect(r.sharedTrip?.team).toBe('Lisboa 1');
    expect(r.suggestion?.slots.map(s => [s.date, s.time])).toEqual([['2026-10-26', '10h30'], ['2026-10-26', '13h30']]);
  });

  it('a Lisbon job does not count', () => {
    const lx = ev('2026-10-26', '09:00', '10:00', 'Serviço 45€ (89€) Sofá - Rua X 1, 2780-000 Oeiras', 'Equipa: Lisboa 1');
    const r = botAvailability({ city: 'Sines', items: sofa5 }, [lx], NOW);
    expect('error' in r ? null : r.handToOwner).toMatch(/sob consulta/);
  });

  it('quotes without travel only on the shared trip: 139€ → 119€', () => {
    const normal = botQuote({ city: 'Santiago do Cacém', items: sofa5 });
    const shared = botQuote({ city: 'Santiago do Cacém', items: sofa5, sharedTrip: true });
    if ('error' in normal || 'error' in shared) throw new Error('quote');
    expect(normal.total).toBe(139);
    expect(normal.handToOwner).toBe(true);
    expect(shared.total).toBe(119);
    expect(shared.travel).toBe(0);
    expect(shared.handToOwner).toBe(false);
  });

  it('books it on the team already there, without travel', () => {
    const r = planBotBooking({ conversationId: 'c1', city: 'Santiago do Cacém', items: sofa5, date: '2026-10-26', time: '10h30',
      name: 'Cliente', address: 'Rua Y 2, Vila Nova de Santo André', phone: '910000001' }, [SINES], NOW);
    if (!('ok' in r) || !r.ok) throw new Error(JSON.stringify(r));
    expect(r.team).toBe('Lisboa 1');
    expect(r.event.title).toMatch(/^Serviço 60€ \(119€\)/);
  });
});

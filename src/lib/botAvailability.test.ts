import { describe, expect, it } from 'vitest';
import { botAvailability, dayLabel, eventRegion, eventTeam, visitMinutes, type AvailabilityEvent } from './botAvailability';

// Wednesday 7 Oct 2026, 09:45 in Portugal (summer time, UTC+1). Invented data only: the repo is public.
const NOW = new Date('2026-10-07T08:45:00Z');
/** A Lisbon wall-clock time as UTC ISO (October = UTC+1). */
const at = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00+01:00`).toISOString();
const ev = (date: string, from: string, to: string, summary: string, description = ''): AvailabilityEvent =>
  ({ summary, description, status: 'CONFIRMED', start: at(date, from), end: at(date, to) });

const ok = <T,>(r: T) => {
  if (r && typeof r === 'object' && 'error' in r) throw new Error(String((r as { error: string }).error));
  return r as Exclude<T, { error: string }>;
};

describe('visitMinutes', () => {
  it('adds the owner averages per article', () => {
    expect(visitMinutes([{ kind: 'sofa', qty: 1 }, { kind: 'chairs', qty: 6 }])).toBe(120);
    expect(visitMinutes([{ kind: 'sofa', qty: 1, treatment: 'clean+premium' }])).toBe(90); // 80 → rounded up to 15
    expect(visitMinutes([{ kind: 'mattress', qty: 1 }])).toBe(45);
    expect(visitMinutes([{ kind: 'rug', qty: 1, width: 2, length: 3 }])).toBe(45);
    expect(visitMinutes(undefined)).toBe(60);
  });
});

describe('reading the calendar', () => {
  it('takes the team from the line the team-calendar script writes', () => {
    expect(eventTeam(ev('2026-10-08', '10:00', '11:00', 'Serviço 45€ (89€) Sofá', 'Equipa: Lisboa 1\n\nnotas'))).toBe('Lisboa 1');
    expect(eventTeam(ev('2026-10-08', '10:00', '11:00', 'Serviço 45€ (89€) Sofá'))).toBeNull();
  });
  it('places a service without team by postal code, then by a served town', () => {
    expect(eventRegion(ev('2026-10-08', '10:00', '11:00', 'Serviço 45€ (89€) Sofá - Ana - Rua X 1, 2780-000 Oeiras'))).toBe('Lisboa');
    expect(eventRegion(ev('2026-10-08', '10:00', '11:00', 'A confirmar sofá - Rui - Matosinhos'))).toBe('Porto');
    expect(eventRegion(ev('2026-10-08', '10:00', '11:00', 'Jantar com amigos'))).toBeNull();
  });
  it('labels days the owner way', () => {
    expect(dayLabel('2026-10-07', '2026-10-07')).toBe('hoje (quarta)');
    expect(dayLabel('2026-10-08', '2026-10-07')).toBe('amanhã (quinta)');
    expect(dayLabel('2026-10-12', '2026-10-07')).toBe('segunda (dia 12)');
  });
});

describe('botAvailability', () => {
  it('offers two times from 10h, never too close to now, in the owner wording', () => {
    const r = ok(botAvailability({ city: 'Oeiras', items: [{ kind: 'sofa', qty: 1 }] }, [], NOW));
    expect(r.region).toBe('Lisboa');
    expect(r.teams).toEqual(['Lisboa 1', 'Lisboa 2']);
    expect(r.handToOwner).toBeNull();
    // 09:45 now + 90 min lead → first whole hour is 12h.
    expect(r.suggestion?.slots.map(s => [s.date, s.time])).toEqual([['2026-10-07', '12h'], ['2026-10-07', '15h']]);
    expect(r.suggestion?.text).toBe('hoje (quarta) às 12h ou às 15h');
    expect(r.free[0].times[0]).toBe('12h');
  });

  it('a time is free while one of the two teams of the zone is free', () => {
    const events = [
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Ana - Lisboa', 'Equipa: Lisboa 1'),
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Rui - Lisboa', 'Equipa: Lisboa 2'),
    ];
    const r = ok(botAvailability({ city: 'Lisboa', date: '2026-10-08' }, events, NOW));
    // Both busy 10-12 (+30 min drive): 10h, 11h and 12h are gone, 13h is the first.
    expect(r.free[0].times[0]).toBe('13h');
    const one = ok(botAvailability({ city: 'Lisboa', date: '2026-10-08' }, events.slice(0, 1), NOW));
    expect(one.free[0].times[0]).toBe('10h');
    expect(one.suggestion?.slots[0].teamsFree).toEqual(['Lisboa 2']);
  });

  it('a service, pre-booking or "A confirmar" without a team busies one team of its region', () => {
    const events = [
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Ana - Rua X, 2780-000 Oeiras', 'Equipa: Lisboa 1'),
      ev('2026-10-08', '10:00', '12:00', 'A confirmar colchão - Rui - Rua Y, 1000-001 Lisboa'),
    ];
    const r = ok(botAvailability({ city: 'Lisboa', date: '2026-10-08', time: '10h' }, events, NOW));
    expect(r.requested).toMatchObject({ time: '10h', free: false });
    expect(r.free[0].times[0]).toBe('13h');
  });

  it("the owner's own appointments and other regions do not busy the team", () => {
    const events = [
      ev('2026-10-08', '10:00', '20:00', 'Voo para Cracóvia'),
      ev('2026-10-08', '10:00', '20:00', 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 1'),
    ];
    const r = ok(botAvailability({ city: 'Faro', date: '2026-10-08' }, events, NOW));
    expect(r.teams).toEqual(['Algarve']);
    expect(r.free[0].times[0]).toBe('10h');
  });

  it('prefers a time next to a job the team already has that day', () => {
    const events = [ev('2026-10-08', '14:00', '15:00', 'Serviço 45€ (89€) Sofá - Faro', 'Equipa: Algarve')];
    const r = ok(botAvailability({ city: 'Loulé', date: '2026-10-08', items: [{ kind: 'mattress', qty: 1 }] }, events, NOW));
    // 12h ends 12h45 (75 min before the job) and 16h starts an hour after it: both on the team's way.
    expect(r.suggestion?.slots.map(s => [s.time, s.nearOtherJob])).toEqual([['12h', true], ['16h', true]]);
  });

  it('a long job must end by 21h', () => {
    const r = ok(botAvailability({ city: 'Porto', date: '2026-10-09', durationMin: 180 }, [], NOW));
    expect(r.free[0].times.at(-1)).toBe('18h');
  });

  it('answers whether the exact time a client asks for is free', () => {
    const events = [ev('2026-10-12', '15:00', '16:00', 'Serviço retificação - Rua Z, 2770-010 Paço de Arcos', 'Equipa: Lisboa 1')];
    const r = ok(botAvailability({ city: 'Oeiras', date: '2026-10-12', time: '15h' }, events, NOW));
    expect(r.requested).toEqual({ date: '2026-10-12', time: '15h', free: true, teamsFree: ['Lisboa 2'], start: at('2026-10-12', '15:00'), end: expect.any(String) });
  });

  it('hands the date to the owner where there is no team calendar or it is "sob consulta"', () => {
    for (const city of ['Coimbra', 'Figueira da Foz', 'Aveiro', 'Sines', 'Madrid']) {
      const r = ok(botAvailability({ city }, [], NOW));
      expect(r.handToOwner, city).toBeTruthy();
      expect(r.suggestion, city).toBeNull();
    }
  });

  it('cancelled and all-day events are ignored; bad input is refused', () => {
    const events: AvailabilityEvent[] = [
      { ...ev('2026-10-08', '10:00', '20:00', 'Serviço 1€ - Faro', 'Equipa: Algarve'), status: 'CANCELLED' },
      { summary: 'Serviço 1€ - Faro', description: 'Equipa: Algarve', status: 'CONFIRMED', start: null, end: null },
    ];
    expect(ok(botAvailability({ city: 'Faro', date: '2026-10-08' }, events, NOW)).free[0].times[0]).toBe('10h');
    expect(botAvailability({ city: 'Faro', date: '8/10' }, [], NOW)).toHaveProperty('error');
    expect(botAvailability({ city: 'Faro', date: '2026-10-01' }, [], NOW)).toHaveProperty('error');
    expect(botAvailability({ city: 'Faro', time: '15h' }, [], NOW)).toHaveProperty('error');
  });
});

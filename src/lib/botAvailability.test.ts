import { describe, expect, it } from 'vitest';
import { botAvailability, chooseTeam, dayLabel, eventRegion, eventTeam, visitMinutes, type AvailabilityEvent } from './botAvailability';

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
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Rui - Lisboa', 'Equipa: Lisboa 2'),
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Ana - Lisboa', 'Equipa: Lisboa 1'),
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Eva - Lisboa', 'Equipa: Lisboa 1'),
    ];
    const r = ok(botAvailability({ city: 'Lisboa', date: '2026-10-08' }, events, NOW));
    // Both busy 10-12 (+30 min drive): 10h, 11h and 12h are gone, 13h is the first.
    expect(r.free[0].times[0]).toBe('13h');
    const one = ok(botAvailability({ city: 'Lisboa', date: '2026-10-08' }, events.slice(1), NOW));
    // 10h still has a free team, but another service of the zone is there: offered only when nothing else is.
    expect(one.free[0].times[0]).toBe('10h');
    expect(one.suggestion?.slots.map(s => [s.time, s.sameTime])).toEqual([['13h', false], ['16h', false]]);
  });

  it('a service, pre-booking or "A confirmar" without a team busies one team of its region', () => {
    const events = [
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Ana - Rua X, 2780-000 Oeiras', 'Equipa: Lisboa 1'),
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Eva - Rua W, 2780-000 Oeiras', 'Equipa: Lisboa 2'),
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
    // Lisboa 1 is two people: one job leaves it room for a second.
    expect(r.requested).toEqual({ date: '2026-10-12', time: '15h', free: true, teamsFree: ['Lisboa 1', 'Lisboa 2'], sameTime: true, start: at('2026-10-12', '15:00'), end: expect.any(String) });
  });

  it('hands the date to the owner where there is no team or it is "sob consulta"', () => {
    for (const city of ['Aveiro', 'Sines', 'Madrid']) {
      const r = ok(botAvailability({ city }, [], NOW));
      expect(r.handToOwner, city).toBeTruthy();
      expect(r.suggestion, city).toBeNull();
    }
  });

  it('Coimbra and Figueira da Foz book on the Coimbra team (owner, 10 Oct 2026)', () => {
    const r = ok(botAvailability({ city: 'Figueira da Foz' }, [], NOW));
    expect(r.teams).toEqual(['Coimbra']);
    expect(r.handToOwner).toBeNull();
    expect(r.suggestion).not.toBeNull();
    // A Coimbra service still without a team busies the Coimbra team, not Porto's.
    expect(eventRegion(ev('2026-10-08', '15:00', '16:00', 'Serviço 45€ (89€) Sofá - Rua X 5, 3000-123 Coimbra', ''))).toBe('Coimbra');
    expect(eventRegion(ev('2026-10-08', '15:00', '16:00', 'A confirmar · Serviço 45€ (89€) Sofá - Figueira da Foz', ''))).toBe('Coimbra');
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

describe('two-person teams and the team the bot books on', () => {
  const lisbon1 = (from: string, to: string, who: string) => ev('2026-10-08', from, to, `Serviço 60€ (119€) Sofá - ${who} - Lisboa`, 'Equipa: Lisboa 1');

  it('Porto 1 and Lisboa 1 take two jobs at the same time, the other teams one', () => {
    const one = [lisbon1('10:00', '12:00', 'Ana'), ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Rui - Lisboa', 'Equipa: Lisboa 2')];
    const r = ok(botAvailability({ city: 'Lisboa', date: '2026-10-08', time: '10h' }, one, NOW));
    expect(r.requested).toMatchObject({ free: true, teamsFree: ['Lisboa 1'] });
    const two = [...one, lisbon1('10:00', '12:00', 'Eva')];
    expect(ok(botAvailability({ city: 'Lisboa', date: '2026-10-08', time: '10h' }, two, NOW)).requested?.free).toBe(false);
    const braga = [ev('2026-10-08', '10:00', '12:00', 'Serviço 45€ (89€) Sofá - Braga', 'Equipa: Braga')];
    expect(ok(botAvailability({ city: 'Braga', date: '2026-10-08', time: '10h' }, braga, NOW)).requested?.free).toBe(false);
  });

  it('books the team already working next to that time, then the one with fewer jobs that day', () => {
    const at15 = [at('2026-10-08', '15:00'), at('2026-10-08', '16:00')] as const;
    // Lisboa 2 has a job ending at 14h: next to 15h, so it goes there.
    const near = [ev('2026-10-08', '13:00', '14:00', 'Serviço 45€ (89€) Sofá - Lisboa', 'Equipa: Lisboa 2')];
    expect(chooseTeam(near, 'Lisboa', ...at15)).toBe('Lisboa 2');
    // Nothing next to it: the team with fewer jobs that day.
    const far = [lisbon1('09:00', '10:00', 'Ana'), lisbon1('19:00', '20:00', 'Eva'), ev('2026-10-08', '19:00', '20:00', 'Serviço 45€ (89€) Sofá - Lisboa', 'Equipa: Lisboa 2')];
    expect(chooseTeam(far, 'Lisboa', ...at15)).toBe('Lisboa 2');
    expect(chooseTeam([], 'Lisboa', ...at15)).toBe('Lisboa 1');
    // No room, no team; Coimbra and Figueira da Foz have their own team (10 Oct 2026).
    const full = [lisbon1('15:00', '16:00', 'Ana'), lisbon1('15:00', '16:00', 'Eva'), ev('2026-10-08', '15:00', '16:00', 'Serviço 45€ (89€) Sofá - Lisboa', 'Equipa: Lisboa 2')];
    expect(chooseTeam(full, 'Lisboa', ...at15)).toBeNull();
    expect(chooseTeam([], 'Coimbra', ...at15)).toBe('Coimbra');
    expect(chooseTeam([], 'Figueira da Foz', ...at15)).toBe('Coimbra');
  });
});

describe('different hours (owner, 9 Oct 2026: "tenta que os pedidos sejam sempre a horas diferentes")', () => {
  it('offers hours with no other service of the zone first, and only then a shared one', () => {
    const porto = [ev('2026-10-08', '10:00', '11:00', 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 1')];
    const r = ok(botAvailability({ city: 'Matosinhos', date: '2026-10-08' }, porto, NOW));
    expect(r.suggestion?.slots.every(s => !s.sameTime)).toBe(true);
    expect(ok(botAvailability({ city: 'Matosinhos', date: '2026-10-08', time: '10h' }, porto, NOW)).requested).toMatchObject({ free: true, sameTime: true });
    // Another zone's service at the same hour does not count.
    expect(ok(botAvailability({ city: 'Lisboa', date: '2026-10-08', time: '10h' }, porto, NOW)).requested?.sameTime).toBe(false);
    // A day where every free hour is shared: still two hours, flagged.
    const busyDay = ['10', '11', '12', '13', '14', '15', '16', '17', '18'].map(h => ev('2026-10-08', `${h}:00`, `${h}:59`, 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 1'));
    const full = ok(botAvailability({ city: 'Porto', date: '2026-10-08' }, busyDay, NOW));
    expect(full.suggestion?.slots).toHaveLength(2);
    expect(full.suggestion?.slots.every(s => s.sameTime)).toBe(true);
  });
});

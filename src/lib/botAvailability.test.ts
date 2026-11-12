import { describe, expect, it } from 'vitest';
import { ASK_WEEK_RULE, ASK_WEEK_ZONES, DAY_RULES, botAvailability, isMadeira, chooseTeam, teamBusyAt, teamWorks, teamsFor, teamTakesJob, waterproofingKind, dayLabel, eventRegion, eventTeam, visitMinutes, type AvailabilityEvent, type DayRule } from './botAvailability';

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

/** Denise (Porto 3, the backup team since 28 Oct 2026) busy all day, for tests about Porto 1 and Porto 2. */
const p3 = (date = '2026-10-08') => ev(date, '07:00', '22:00', 'Serviço 0€ (0€) Bloqueio - Porto', 'Equipa: Porto 3');

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
    expect(r.teams).toEqual(['Lisboa 1']);
    expect(r.handToOwner).toBeNull();
    // Never today (owner, 11 Nov 2026): first day offered is tomorrow.
    expect(r.suggestion?.slots.every(s => s.date >= '2026-10-08')).toBe(true);
    expect(r.suggestion?.text).toMatch(/^amanhã \(quinta\)/);
    expect(r.free.every(f => f.date !== '2026-10-07')).toBe(true);
  });

  it('Porto 2 takes at most two jobs on a weekday (Aleixo, 4 Nov 2026)', () => {
    const two = [
      ev('2026-10-08', '09:00', '10:00', 'Serviço 45€ (89€) Sofá - Rui - Porto', 'Equipa: Porto 2'),
      ev('2026-10-08', '11:30', '12:30', 'Serviço 45€ (89€) Sofá - Ana - Porto', 'Equipa: Porto 2'),
    ];
    expect(teamBusyAt(two, 'Porto 2', at('2026-10-08', '10:30'), at('2026-10-08', '11:30'))).toBe(true);
    expect(teamBusyAt(two.slice(0, 1), 'Porto 2', at('2026-10-08', '11:30'), at('2026-10-08', '12:30'))).toBe(false);
  });

  it('Porto 1 takes cleaning + waterproofing or Premium, not Essencial alone', () => {
    expect(teamsFor('Porto', waterproofingKind([{ treatment: 'clean+essencial' }]), 100, '2026-11-05')).toContain('Porto 1');
    expect(teamsFor('Porto', waterproofingKind([{ treatment: 'premium' }]), 100, '2026-11-05')).toContain('Porto 1');
    expect(teamsFor('Porto', waterproofingKind([{ treatment: 'essencial' }]), 100, '2026-11-05')).not.toContain('Porto 1');
  });

  it('a time is free while one of the two teams of the zone is free', () => {
    const events = [
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Rui - Porto', 'Equipa: Porto 2'),
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Ana - Porto', 'Equipa: Porto 1'),
      p3(),
    ];
    const r = ok(botAvailability({ city: 'Porto', date: '2026-10-08' }, events, NOW));
    // Two cleanings of a team start 1h30 apart; Porto 2 starts at 9h (Aleixo, 4 Nov 2026) and has no room before its 10h job.
    expect(r.free[0].times.slice(0, 2)).toEqual(['12h', '13h']);
    expect(r.free[0].times).not.toContain('11h');
    const one = ok(botAvailability({ city: 'Porto', date: '2026-10-08' }, events.slice(1, 2), NOW));
    // 10h still has Porto 2 free, but another service of the zone is there: offered only when nothing else is.
    expect(one.free[0].times).toContain('10h');
    expect(one.suggestion?.slots.every(s => !s.sameTime)).toBe(true);
  });

  it('Porto 1/2 and Lisboa 1: cleanings 1h30 apart, waterproofing only at any hour; Porto 2 weekdays 8h-13h (owner, 27 Oct 2026)', () => {
    const job = ev('2026-10-08', '10:00', '11:00', 'Serviço 45€ (89€) Sofá - Ana - Porto', 'Equipa: Porto 1');
    const busy3 = p3(), busy3Sat = p3('2026-10-10');
    const span = (h: string, h2: string) => [at('2026-10-08', h), at('2026-10-08', h2)] as const;
    // 11h is an hour after Porto 1's 10h cleaning: Porto 2 (morning), never Porto 1 again.
    expect(chooseTeam([job, busy3], 'Porto', ...span('11:00', '12:00'))).toBe('Porto 2');
    // 11h30 is 1h30 after it: Porto 1 again, the team already working next to it.
    expect(chooseTeam([job, busy3], 'Porto', ...span('11:30', '12:30'))).toBe('Porto 1');
    // Waterproofing only shares the hour; a cleaning with waterproofing does not.
    expect(chooseTeam([job, busy3], 'Porto', ...span('10:00', '11:00'), true, false)).not.toBeNull();
    expect(chooseTeam([job, busy3], 'Porto', ...span('14:00', '15:00'))).toBe('Porto 1');
    const p1Afternoon = ev('2026-10-08', '14:00', '15:00', 'Serviço 45€ (89€) Sofá - Eva - Porto', 'Equipa: Porto 1');
    expect(chooseTeam([p1Afternoon, busy3], 'Porto', ...span('15:00', '16:00'))).toBeNull();
    expect(chooseTeam([p1Afternoon, busy3], 'Porto', ...span('15:00', '16:00'), true, false)).toBe('Porto 1');
    // Two waterproofing-only jobs at the same hour.
    const imper = ev('2026-10-08', '14:00', '15:00', 'Serviço 45€ (89€) Impermeabilização Premium sofá - Eva - Porto', 'Equipa: Porto 1');
    expect(chooseTeam([imper, busy3], 'Porto', ...span('14:00', '15:00'), true, false)).toBe('Porto 1');
    expect(chooseTeam([imper, busy3], 'Porto', ...span('14:00', '15:00'))).toBe('Porto 1');
    // A job finishing after 13h does not go to Porto 2 on a weekday.
    const late = ev('2026-10-08', '12:00', '13:00', 'Serviço 45€ (89€) Sofá - Rui - Porto', 'Equipa: Porto 1');
    expect(chooseTeam([late, busy3], 'Porto', ...span('12:30', '13:30'))).toBeNull();
    // Saturday: Porto 2 works all day.
    expect(chooseTeam([ev('2026-10-10', '14:00', '15:00', 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 1'), busy3Sat], 'Porto', at('2026-10-10', '15:00'), at('2026-10-10', '16:00'))).toBe('Porto 2');
    // Weekdays start at 9h (Porto 2 from 9h, Aleixo 4 Nov 2026); never 8h.
    const thu = ok(botAvailability({ city: 'Porto', date: '2026-10-08' }, [], NOW));
    expect(thu.free[0].times.slice(0, 2)).toEqual(['9h', '10h']);
    const sat = ok(botAvailability({ city: 'Porto', date: '2026-10-10' }, [], NOW));
    expect(sat.free[0].times[0]).toBe('9h');
    expect(ok(botAvailability({ city: 'Braga', date: '2026-10-08' }, [], NOW)).free[0].times[0]).toBe('9h');
  });

  it('a service, pre-booking or "A confirmar" without a team busies one team of its region', () => {
    const events = [
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Ana - Rua X, 2780-000 Oeiras', 'Equipa: Lisboa 1'),
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Eva - Rua W, 2780-000 Oeiras', 'Equipa: Lisboa 2'),
      ev('2026-10-08', '10:00', '12:00', 'A confirmar colchão - Rui - Rua Y, 1000-001 Lisboa'),
    ];
    const r = ok(botAvailability({ city: 'Lisboa', date: '2026-10-08', time: '10h' }, events, NOW));
    expect(r.requested).toMatchObject({ time: '10h', free: false });
    expect(r.free[0].times[0]).toBe('12h');
  });

  it("the owner's own appointments and other regions do not busy the team", () => {
    const events = [
      ev('2026-10-08', '10:00', '20:00', 'Voo para Cracóvia'),
      ev('2026-10-08', '10:00', '20:00', 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 1'),
    ];
    const r = ok(botAvailability({ ownerTime: true, city: 'Faro', date: '2026-10-08' }, events, NOW));
    expect(r.teams).toEqual(['Algarve']);
    expect(r.free[0].times[0]).toBe('9h');
  });

  it('prefers a time next to a job the team already has that day', () => {
    const events = [ev('2026-10-08', '14:00', '15:00', 'Serviço 45€ (89€) Sofá - Faro', 'Equipa: Algarve')];
    const r = ok(botAvailability({ ownerTime: true, city: 'Loulé', date: '2026-10-08', items: [{ kind: 'mattress', qty: 1 }] }, events, NOW));
    // 12h ends 12h45 (75 min before the job) and 16h starts an hour after it: both on the team's way.
    expect(r.suggestion?.slots.map(s => [s.time, s.nearOtherJob])).toEqual([['12h', true], ['16h', true]]);
  });

  it('a long job must end by 21h', () => {
    const r = ok(botAvailability({ city: 'Porto', date: '2026-10-09', durationMin: 180 }, [], NOW));
    expect(r.free[0].times.at(-1)).toBe('18h');
  });

  it('answers whether the exact time a client asks for is free', () => {
    const events = [ev('2026-10-12', '15:00', '16:00', 'Serviço retificação - Rua Z, 2770-010 Paço de Arcos', 'Equipa: Lisboa 1')];
    expect(ok(botAvailability({ city: 'Oeiras', date: '2026-10-12', time: '15h' }, events, NOW)).requested?.free).toBe(false);
    // Waterproofing only can share the hour of a cleaning.
    const r = ok(botAvailability({ city: 'Oeiras', date: '2026-10-12', time: '15h', items: [{ kind: 'sofa', qty: 1, treatment: 'premium' }] }, events, NOW));
    expect(r.requested).toEqual({ date: '2026-10-12', time: '15h', free: true, teamsFree: ['Lisboa 1'], sameTime: true, start: at('2026-10-12', '15:00'), end: expect.any(String) });
  });

  it('hands the date to the owner where there is no team or it is "sob consulta"', () => {
    for (const city of ['Aveiro', 'Sines', 'Madrid']) {
      const r = ok(botAvailability({ city }, [], NOW));
      expect(r.handToOwner, city).toBeTruthy();
      expect(r.suggestion, city).toBeNull();
    }
  });

  it('Coimbra and Figueira da Foz: Coimbra team, but no hours since 12 Nov 2026 (the owner books from his calendar)', () => {
    const r = ok(botAvailability({ city: 'Figueira da Foz' }, [], NOW));
    expect(r.teams).toEqual(['Coimbra']);
    expect(r.handToOwner).toBe('Coimbra: o dono confirma o dia no calendário');
    expect(r.suggestion).toBeNull();
    // A time the owner gave is still booked on the Coimbra team.
    expect(ok(botAvailability({ city: 'Coimbra', date: '2026-10-08', time: '15h', ownerTime: true }, [], NOW)).requested?.free).toBe(true);
    // A Coimbra service still without a team busies the Coimbra team, not Porto's.
    expect(eventRegion(ev('2026-10-08', '15:00', '16:00', 'Serviço 45€ (89€) Sofá - Rua X 5, 3000-123 Coimbra', ''))).toBe('Coimbra');
    expect(eventRegion(ev('2026-10-08', '15:00', '16:00', 'A confirmar · Serviço 45€ (89€) Sofá - Figueira da Foz', ''))).toBe('Coimbra');
  });

  it('cancelled and all-day events are ignored; bad input is refused', () => {
    const events: AvailabilityEvent[] = [
      { ...ev('2026-10-08', '10:00', '20:00', 'Serviço 1€ - Faro', 'Equipa: Algarve'), status: 'CANCELLED' },
      { summary: 'Serviço 1€ - Faro', description: 'Equipa: Algarve', status: 'CONFIRMED', start: null, end: null },
    ];
    expect(ok(botAvailability({ ownerTime: true, city: 'Faro', date: '2026-10-08' }, events, NOW)).free[0].times[0]).toBe('9h');
    expect(botAvailability({ ownerTime: true, city: 'Faro', date: '8/10' }, [], NOW)).toHaveProperty('error');
    expect(botAvailability({ ownerTime: true, city: 'Faro', date: '2026-10-01' }, [], NOW)).toHaveProperty('error');
    expect(botAvailability({ ownerTime: true, city: 'Faro', time: '15h' }, [], NOW)).toHaveProperty('error');
  });
});

describe('two-person teams and the team the bot books on', () => {
  const porto1 = (from: string, to: string, who: string) => ev('2026-10-08', from, to, `Serviço 60€ (119€) Sofá - ${who} - Porto`, 'Equipa: Porto 1');

  it('Lisboa 1: a cleaning at 10h leaves 11h30 as the next cleaning; Braga stays one job at a time (owner, 27 Oct 2026)', () => {
    const lx = (who: string, summary = 'Sofá') => ev('2026-10-08', '10:00', '12:00', `Serviço 60€ (119€) ${summary} - ${who} - Lisboa`, 'Equipa: Lisboa 1');
    expect(ok(botAvailability({ city: 'Lisboa', date: '2026-10-08', time: '10h' }, [lx('Ana')], NOW)).requested?.free).toBe(false);
    expect(ok(botAvailability({ city: 'Lisboa', date: '2026-10-08', time: '11h30' }, [lx('Ana')], NOW)).requested).toMatchObject({ free: true, teamsFree: ['Lisboa 1'] });
    expect(ok(botAvailability({ city: 'Lisboa', date: '2026-10-08', time: '10h' }, [lx('Ana', 'Impermeabilização Essencial sofá')], NOW)).requested?.free).toBe(true);
    const braga = [ev('2026-10-08', '10:00', '12:00', 'Serviço 45€ (89€) Sofá - Braga', 'Equipa: Braga')];
    expect(ok(botAvailability({ city: 'Braga', date: '2026-10-08', time: '10h' }, braga, NOW)).requested?.free).toBe(false);
  });

  it('books the team already working next to that time, then the one with fewer jobs that day', () => {
    const at11 = [at('2026-10-08', '11:00'), at('2026-10-08', '12:00')] as const;
    // Porto 1 has a job ending at 10h: next to 11h, so it goes there (Porto 2 is the backup since 4 Nov).
    const near = [ev('2026-10-08', '09:00', '10:00', 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 1')];
    expect(chooseTeam(near, 'Porto', ...at11)).toBe('Porto 1');
    // Nothing next to it: the team with fewer jobs that day.
    const far = [porto1('16:00', '17:00', 'Ana'), porto1('19:00', '20:00', 'Eva'), ev('2026-10-08', '08:00', '08:30', 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 2')];
    expect(chooseTeam(far, 'Porto', ...at11)).toBe('Porto 3');
    expect(chooseTeam([], 'Porto', ...at11)).toBe('Porto 1');
    // No room, no team; Coimbra and Figueira da Foz have their own team (10 Oct 2026).
    const at15 = [at('2026-10-08', '15:00'), at('2026-10-08', '16:00')] as const;
    const full = [porto1('15:00', '16:00', 'Ana'), p3()];
    expect(chooseTeam(full, 'Porto', ...at15)).toBeNull();
    expect(chooseTeam([], 'Coimbra', ...at15)).toBe('Coimbra');
    expect(chooseTeam([], 'Figueira da Foz', ...at15)).toBe('Coimbra');
  });

  it('Porto 2 (Aleixo) takes a Porto job only when Porto 1 and Porto 3 (Denise) cannot (owner, 4 Nov 2026)', () => {
    const at11 = [at('2026-10-08', '11:00'), at('2026-10-08', '12:00')] as const;
    const at15 = [at('2026-10-08', '15:00'), at('2026-10-08', '16:00')] as const;
    // Free day: Porto 1 first, never the backup.
    expect(chooseTeam([], 'Porto', ...at15)).toBe('Porto 1');
    // Even when Porto 1 has more jobs that day, Denise comes before Porto 2.
    expect(chooseTeam([porto1('16:00', '17:00', 'Ana'), porto1('19:00', '20:00', 'Eva')], 'Porto', ...at11)).toBe('Porto 3');
    // Denise busy all day: Porto 2 takes the morning job.
    expect(chooseTeam([porto1('11:00', '12:00', 'Ana'), p3()], 'Porto', ...at11)).toBe('Porto 2');
    // Weekday afternoon with Porto 1 busy: Porto 2 only works mornings, so it goes to Denise.
    expect(chooseTeam([porto1('15:00', '16:00', 'Ana')], 'Porto', ...at15)).toBe('Porto 3');
    // Her free hours count when the bot offers slots.
    expect(ok(botAvailability({ city: 'Porto', date: '2026-10-08', time: '15h' }, [porto1('15:00', '16:00', 'Ana')], NOW)).requested).toMatchObject({ free: true });
  });

  it('in the Braga zone, waterproofing goes to Porto 1 and Braga keeps the cleaning (owner, 15 Oct 2026)', () => {
    const at15 = [at('2026-10-08', '15:00'), at('2026-10-08', '16:00')] as const;
    expect(chooseTeam([], 'Guimarães', ...at15)).toBe('Braga');
    expect(chooseTeam([], 'Guimarães', ...at15, true)).toBe('Porto 1');
    expect(chooseTeam([], 'Braga', ...at15, true)).toBe('Porto 1');
    expect(chooseTeam([], 'Porto', ...at15, true)).toBe('Porto 1');
    const premium = [{ kind: 'sofa', qty: 1, treatment: 'premium' }];
    // Denise (Porto 3) does no waterproofing (owner, 28 Oct 2026: "se for imper ou imper e limpeza tem q ser porto 1").
    expect(ok(botAvailability({ city: 'Guimarães', items: premium, date: '2026-10-08' }, [], NOW)).teams).toEqual(['Porto 2']);
    expect(chooseTeam([porto1('15:00', '16:00', 'Ana')], 'Guimarães', ...at15, true)).toBeNull();
    expect(chooseTeam([porto1('15:00', '16:00', 'Ana')], 'Porto', ...at15, true)).toBeNull();
    expect(ok(botAvailability({ city: 'Guimarães', items: [{ kind: 'sofa', qty: 1 }], date: '2026-10-08' }, [], NOW)).teams).toEqual(['Braga']);
  });
});

describe('Porto 1 off on the afternoon of 29 Oct 2026 (owner, 28 Oct: "amanha a tarde porto 1 n ta disponivel")', () => {
  const day = '2026-10-29';
  const now = new Date('2026-10-28T20:00:00Z');
  // After 25 Oct Portugal is on winter time (UTC+0).
  const span = (from: string, to: string) => [`${day}T${from}:00.000Z`, `${day}T${to}:00.000Z`] as const;
  it('a cleaning in the afternoon goes to Porto 3; the morning stays with Porto 1', () => {
    expect(chooseTeam([], 'Porto', ...span('15:00', '16:00'))).toBe('Porto 3');
    expect(chooseTeam([], 'Porto', ...span('12:30', '13:30'))).toBe('Porto 3');
    expect(chooseTeam([], 'Porto', ...span('11:30', '12:30'))).toBe('Porto 3');
    expect(chooseTeam([], 'Porto', ...span('10:00', '11:00'))).toBe('Porto 1');
  });
  it('waterproofing (alone or with cleaning) is not booked that afternoon', () => {
    const premium = [{ kind: 'sofa', qty: 1, treatment: 'clean+premium' }];
    expect(chooseTeam([], 'Porto', ...span('15:00', '16:30'), true)).toBeNull();
    expect(chooseTeam([], 'Guimarães', ...span('15:00', '16:30'), true)).toBeNull();
    expect(ok(botAvailability({ city: 'Porto', items: premium, date: day, time: '15h' }, [], now)).requested).toMatchObject({ free: false });
    expect(ok(botAvailability({ city: 'Porto', items: [{ kind: 'sofa', qty: 1 }], date: day, time: '15h' }, [], now)).requested).toMatchObject({ free: true, teamsFree: ['Porto 3'] });
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
    const busyDay = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'].map(h => ev('2026-10-08', `${h}:00`, `${h}:59`, 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 1'));
    const full = ok(botAvailability({ city: 'Porto', date: '2026-10-08' }, busyDay, NOW));
    expect(full.suggestion?.slots).toHaveLength(2);
    expect(full.suggestion?.slots.every(s => s.sameTime)).toBe(true);
  });
  it('Algarve: no hours from the bot, the owner picks the time (22 Oct 2026)', () => {
    const r = ok(botAvailability({ city: 'Faro', date: '2026-10-08' }, [], NOW));
    expect(r.free).toEqual([]);
    expect(r.handToOwner).toMatch(/Algarve/);
  });
  it('rug pickup in the Braga zone: no hours, the owner picks the team (27 Oct 2026, Viana do Castelo); home washing and other zones as before', () => {
    const rugs = [{ kind: 'rug', qty: 2, width: 3, length: 2.5 }];
    const pickup = ok(botAvailability({ city: 'Viana do Castelo', items: rugs, rugPickup: true }, [], NOW));
    expect(pickup.free).toEqual([]);
    expect(pickup.teams).toEqual([]);
    expect(pickup.handToOwner).toMatch(/Braga não faz recolhas/);
    expect(ok(botAvailability({ city: 'Guimarães', items: rugs, rugPickup: true, ownerTime: true }, [], NOW)).handToOwner).toMatch(/recolhas/);
    expect(ok(botAvailability({ city: 'Viana do Castelo', items: rugs, total: 149 }, [], NOW))).toMatchObject({ handToOwner: null, teams: ['Braga'] });
    expect(ok(botAvailability({ city: 'Matosinhos', items: rugs, rugPickup: true }, [], NOW)).handToOwner).toBeNull();
  });
  it('rug pickup in Porto: only Porto 3 (owner, 8 Nov 2026); home washing keeps the other teams', () => {
    const rugs = [{ kind: 'rug', qty: 2, width: 3, length: 2.5 }];
    expect(ok(botAvailability({ city: 'Matosinhos', items: rugs, rugPickup: true }, [], NOW)).teams).toEqual(['Porto 3']);
    expect(ok(botAvailability({ city: 'Matosinhos', items: rugs }, [], NOW)).teams).toContain('Porto 2');
    expect(teamsFor('Porto', false, 100, '2026-11-12', true)).toEqual(['Porto 3']);
    expect(teamsFor('Lisboa', false, 100, '2026-11-12', true)).toEqual(['Lisboa 1']);
    expect(teamTakesJob('Porto 2', { summary: 'Serviço 60€ (120€) Recolha de 2 tapetes - 912345678', description: '' }, '2026-11-12T10:00:00Z')).toBe(false);
    expect(teamTakesJob('Porto 3', { summary: 'Serviço 60€ (120€) Recolha de 2 tapetes - 912345678', description: '' }, '2026-11-12T10:00:00Z')).toBe(true);
  });
});

describe("the owner's rules for the next days (DAY_RULES)", () => {
  // As on 26 Oct 2026, with NOW's dates: Porto closed tomorrow and only Friday offered;
  // Lisboa tomorrow only from 14h, Friday first.
  const rules: DayRule[] = [
    { zone: 'Porto', from: '2026-10-07', until: '2026-10-08', closed: [{ date: '2026-10-08' }], prefer: ['2026-10-09'], onlyPreferred: true, note: 'Porto: só sexta.' },
    { zone: 'Lisboa', from: '2026-10-07', until: '2026-10-08', closed: [{ date: '2026-10-08', fromHour: 14 }], prefer: ['2026-10-09'], note: 'Lisboa: sexta primeiro.' },
  ];
  const sofa = [{ kind: 'sofa', qty: 1 }];

  it('Porto: no time on the closed day, only the preferred day offered, and the bot told why', () => {
    const r = ok(botAvailability({ city: 'Porto', items: sofa, days: 7 }, [], NOW, rules));
    expect(r.suggestion?.slots.every(s => s.date === '2026-10-09')).toBe(true);
    expect(r.free.map(d => d.date)).toEqual(['2026-10-09']);
    expect(r.dayRule).toBe('Porto: só sexta.');
  });

  it('a client who asks for the closed day gets the preferred day, and a booking there is refused', () => {
    const r = ok(botAvailability({ city: 'Porto', items: sofa, date: '2026-10-08', time: '11h' }, [], NOW, rules));
    expect(r.requested?.free).toBe(false);
    expect(r.suggestion?.slots.map(s => s.date)).toEqual(['2026-10-09', '2026-10-09']);
    expect(r.handToOwner).toBeNull();
    // Another day the client asks for himself still books (only the offer is limited).
    expect(ok(botAvailability({ city: 'Porto', items: sofa, date: '2026-10-12', time: '11h' }, [], NOW, rules)).requested?.free).toBe(true);
  });

  it('Porto: once the preferred day is full, the other days come back', () => {
    const fullFriday = ['10', '11', '12', '13', '14', '15', '16', '17', '18'].flatMap(h => ['Porto 1', 'Porto 1', 'Porto 2']
      .map(t => ev('2026-10-09', `${h}:00`, `${h}:59`, 'Serviço 45€ (89€) Sofá - Porto', `Equipa: ${t}`)));
    const r = ok(botAvailability({ city: 'Porto', items: sofa, days: 7 }, fullFriday, NOW, rules));
    expect(r.free.map(d => d.date)).not.toContain('2026-10-08');
    expect(r.free.length).toBeGreaterThan(0);
  });

  it('Lisboa: the closed morning is gone, the afternoon books, and the preferred day comes first', () => {
    const r = ok(botAvailability({ city: 'Oeiras', items: sofa, days: 7 }, [], NOW, rules));
    expect(r.suggestion?.slots.every(s => s.date === '2026-10-09')).toBe(true);
    expect(r.free[0].date).toBe('2026-10-09');
    expect(r.free.find(d => d.date === '2026-10-08')?.times[0]).toBe('14h');
    const morning = ok(botAvailability({ city: 'Oeiras', items: sofa, date: '2026-10-08', time: '11h' }, [], NOW, rules));
    expect(morning.requested?.free).toBe(false);
    expect(morning.suggestion?.slots.every(s => s.date === '2026-10-08' && s.minutes >= 14 * 60)).toBe(true);
    expect(ok(botAvailability({ city: 'Oeiras', items: sofa, date: '2026-10-08', time: '15h' }, [], NOW, rules)).requested?.free).toBe(true);
  });

  it('a time the owner gave himself and the other zones are not touched; rules switch themselves off', () => {
    expect(ok(botAvailability({ city: 'Porto', items: sofa, date: '2026-10-08', time: '11h', ownerTime: true }, [], NOW, rules)).requested?.free).toBe(true);
    const braga = ok(botAvailability({ city: 'Braga', items: sofa, days: 4 }, [], NOW, rules));
    expect(braga.dayRule).toBeUndefined();
    expect(braga.free[0].date).toBe('2026-10-08');
    const later = ok(botAvailability({ city: 'Porto', items: sofa, days: 4 }, [], new Date('2026-10-09T08:45:00Z'), rules));
    expect(later.dayRule).toBeUndefined();
  });

  it('the live rules are well formed', () => {
    for (const r of DAY_RULES) {
      expect(r.from <= r.until).toBe(true);
      for (const d of [...(r.closed ?? []).map(c => c.date), ...(r.prefer ?? [])]) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.note.length).toBeGreaterThan(0);
    }
  });
});

describe('cidades sem ninguém fixo (dono, 29 Oct 2026)', () => {
  const now = new Date('2026-10-29T09:00:00Z');
  it('Viana abaixo de 100€ e Leiria abaixo de 110€ não dão horas; acima dá (dono, 3 Nov)', () => {
    const low = botAvailability({ city: 'Viana do Castelo', total: 89 }, [], now) as { handToOwner: string | null };
    expect(low.handToOwner).toMatch(/verificar a disponibilidade/);
    // Leiria is in the Coimbra zone: since 12 Nov 2026 no hours at any total (ASK_WEEK_ZONES).
    const quoted = botAvailability({ city: 'Leiria', items: [{ kind: 'sofa', size: '3-lugares' }] }, [], now) as { handToOwner: string | null; askWeek?: true };
    expect([quoted.handToOwner, quoted.askWeek]).toEqual(['Coimbra: o dono confirma o dia no calendário', true]);
    const viana100 = botAvailability({ city: 'Viana do Castelo', total: 100 }, [], now) as { handToOwner: string | null };
    expect(viana100.handToOwner).toBeNull();
    const viana95 = botAvailability({ city: 'Viana do Castelo', total: 95 }, [], now) as { handToOwner: string | null };
    expect(viana95.handToOwner).toMatch(/abaixo de 100/);
    const ok = botAvailability({ city: 'Viana do Castelo', total: 115 }, [], now) as { handToOwner: string | null };
    expect(ok.handToOwner).toBeNull();
    const owner = botAvailability({ city: 'Viana do Castelo', total: 50, ownerTime: true }, [], now) as { handToOwner: string | null };
    expect(owner.handToOwner).toBeNull();
  });
});

describe('Porto 1 closed from 6 Nov 2026, 20:00', () => {
  const premium = [{ kind: 'sofa', qty: 1, treatment: 'premium' }];
  const lisbonUtc = (date: string, hhmm: string) => Date.parse(`${date}T${hhmm}:00Z`); // November = UTC

  it('works until 20:00 and takes nothing that ends later', () => {
    expect(teamWorks('Porto 1', lisbonUtc('2026-11-06', '18:00'), lisbonUtc('2026-11-06', '20:00'))).toBe(true);
    expect(teamWorks('Porto 1', lisbonUtc('2026-11-06', '19:00'), lisbonUtc('2026-11-06', '20:30'))).toBe(false);
    expect(teamWorks('Porto 1', lisbonUtc('2026-11-10', '10:00'), lisbonUtc('2026-11-10', '12:00'))).toBe(false);
    // Owner, 12 Nov 2026: Porto 1 is not reopened; the bot never gives it a job.
    expect(teamWorks('Porto 1', lisbonUtc('2026-12-01', '10:00'), lisbonUtc('2026-12-01', '12:00'))).toBe(false);
  });

  it('passes Porto and Braga waterproofing to Porto 2, cleanings keep their teams', () => {
    const now = new Date('2026-11-23T08:00:00Z'); // Porto 2 is off from 11 to 22 Nov
    for (const city of ['Porto', 'Guimarães']) {
      const r = ok(botAvailability({ city, items: premium }, [], now));
      expect(r.teams).toEqual(['Porto 2']);
      expect(r.handToOwner).toBeNull();
    }
    expect(ok(botAvailability({ city: 'Porto', items: [{ kind: 'sofa', qty: 1, treatment: 'clean' }] }, [], now)).teams).not.toContain('Porto 1');
    expect(chooseTeam([], 'Porto', '2026-12-01T10:00:00Z', '2026-12-01T12:00:00Z', 'premium', false, 300)).toBe('Porto 2');
  });
});

describe('waterproofing in Porto and Braga from 11 Nov 2026 (owner, 6 Nov 2026)', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const items = [{ kind: 'sofa', seats: 3, treatment: 'premium' }];
  it('goes to Porto 2 and starts on Wednesday', () => {
    for (const city of ['Porto', 'Braga']) {
      const r = botAvailability({ city, items, durationMin: 90 }, [], now);
      if ('error' in r) throw new Error(r.error);
      expect(r.teams).toEqual(['Porto 2']);
      // Porto 1 not reopened and Porto 2 off from 11 to 22 Nov (owner, 12 Nov): nothing before 23/11.
      expect(r.free.every(d => d.date >= '2026-11-23')).toBe(true);
    }
  });
  it('an earlier day or time is refused and later days are offered', () => {
    const r = botAvailability({ city: 'Porto', items, durationMin: 90, date: '2026-11-09', time: '10h' }, [], now);
    if ('error' in r) throw new Error(r.error);
    expect(r.requested?.free).toBe(false);
    expect(r.free.every(d => d.date >= '2026-11-23')).toBe(true);
    expect(chooseTeam([], 'Porto', '2026-11-10T10:00:00Z', '2026-11-10T11:30:00Z', 'premium', false)).toBeNull();
    expect(chooseTeam([], 'Porto', '2026-11-23T10:00:00Z', '2026-11-23T11:30:00Z', 'premium', false)).toBe('Porto 2');
  });
  it('cleanings are unchanged', () => {
    const r = botAvailability({ city: 'Porto', durationMin: 60, items: [{ kind: 'sofa', seats: 3 }] }, [], now);
    if ('error' in r) throw new Error(r.error);
    expect(r.free[0].date < '2026-11-11').toBe(true);
  });
});

describe('Coimbra e Madeira: fecha o serviço sem marcar hora (dono, 12 Nov 2026)', () => {
  it('free vazio, askWeek e handToOwner com a razão; o Algarve e o Porto ficam como estavam', () => {
    expect([...ASK_WEEK_ZONES]).toEqual(['Coimbra', 'Madeira']);
    for (const city of ['Coimbra', 'Figueira da Foz', 'Leiria', 'Batalha']) {
      const r = ok(botAvailability({ city, items: [{ kind: 'sofa', size: '3-lugares' }] }, [], NOW));
      expect([r.free, r.suggestion, r.askWeek, r.askWeekRule, r.handToOwner], city).toEqual([[], null, true, ASK_WEEK_RULE, 'Coimbra: o dono confirma o dia no calendário']);
    }
    for (const city of ['Funchal', 'Funchal, Madeira', 'Câmara de Lobos', 'Rua Y 2, 9000-100 Funchal']) {
      const r = ok(botAvailability({ city }, [], NOW));
      expect([r.free, r.askWeek, r.handToOwner], city).toEqual([[], true, 'Madeira (Funchal): o dono confirma o dia no calendário']);
    }
    expect(isMadeira('São João da Madeira')).toBe(false);
    const sjm = ok(botAvailability({ city: 'São João da Madeira' }, [], NOW));
    expect([sjm.region, sjm.askWeek]).toEqual(['Porto', undefined]);
    const algarve = ok(botAvailability({ city: 'Faro', date: '2026-10-08' }, [], NOW));
    expect([algarve.handToOwner, algarve.askWeek]).toEqual(['Algarve: o responsável escolhe o horário', undefined]);
    const porto = ok(botAvailability({ city: 'Matosinhos' }, [], NOW));
    expect([porto.askWeek, porto.suggestion !== null]).toEqual([undefined, true]);
  });
});

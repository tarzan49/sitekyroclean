import { describe, expect, it } from 'vitest';
import { DAY_RULES, botAvailability, chooseTeam, dayLabel, eventRegion, eventTeam, visitMinutes, type AvailabilityEvent, type DayRule } from './botAvailability';

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
    // 09:45 now + 90 min lead → first whole hour is 12h.
    expect(r.suggestion?.slots.map(s => [s.date, s.time])).toEqual([['2026-10-07', '12h'], ['2026-10-07', '15h']]);
    expect(r.suggestion?.text).toBe('hoje (quarta) às 12h ou às 15h');
    expect(r.free[0].times[0]).toBe('12h');
  });

  it('a time is free while one of the two teams of the zone is free', () => {
    const events = [
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Rui - Porto', 'Equipa: Porto 2'),
      ev('2026-10-08', '10:00', '12:00', 'Serviço 60€ (119€) Sofá - Ana - Porto', 'Equipa: Porto 1'),
      p3(),
    ];
    const r = ok(botAvailability({ city: 'Porto', date: '2026-10-08' }, events, NOW));
    // Two cleanings of a team start 1h30 apart: Porto 2 takes 8h before its 10h job, Porto 1 12h after it.
    expect(r.free[0].times.slice(0, 2)).toEqual(['8h', '12h']);
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
    // 8h and 9h only on weekdays, and only through Porto 2; Saturday starts at 9h.
    const thu = ok(botAvailability({ city: 'Porto', date: '2026-10-08' }, [], NOW));
    expect(thu.free[0].times.slice(0, 2)).toEqual(['8h', '9h']);
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
    // Porto 2 has a job ending at 10h: next to 11h, so it goes there.
    const near = [ev('2026-10-08', '09:00', '10:00', 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 2')];
    expect(chooseTeam(near, 'Porto', ...at11)).toBe('Porto 2');
    // Nothing next to it: the team with fewer jobs that day.
    const far = [porto1('16:00', '17:00', 'Ana'), porto1('19:00', '20:00', 'Eva'), ev('2026-10-08', '08:00', '08:30', 'Serviço 45€ (89€) Sofá - Porto', 'Equipa: Porto 2')];
    expect(chooseTeam(far, 'Porto', ...at11)).toBe('Porto 2');
    expect(chooseTeam([], 'Porto', ...at11)).toBe('Porto 1');
    // No room, no team; Coimbra and Figueira da Foz have their own team (10 Oct 2026).
    const at15 = [at('2026-10-08', '15:00'), at('2026-10-08', '16:00')] as const;
    const full = [porto1('15:00', '16:00', 'Ana'), p3()];
    expect(chooseTeam(full, 'Porto', ...at15)).toBeNull();
    expect(chooseTeam([], 'Coimbra', ...at15)).toBe('Coimbra');
    expect(chooseTeam([], 'Figueira da Foz', ...at15)).toBe('Coimbra');
  });

  it('Porto 3 (Denise) takes a Porto job only when Porto 1 and Porto 2 cannot (owner, 28 Oct 2026)', () => {
    const at11 = [at('2026-10-08', '11:00'), at('2026-10-08', '12:00')] as const;
    const at15 = [at('2026-10-08', '15:00'), at('2026-10-08', '16:00')] as const;
    // Free day: Porto 1 first, never the backup.
    expect(chooseTeam([], 'Porto', ...at15)).toBe('Porto 1');
    // Even when Porto 1 has more jobs that day, Porto 2 comes before Porto 3.
    expect(chooseTeam([porto1('16:00', '17:00', 'Ana'), porto1('19:00', '20:00', 'Eva')], 'Porto', ...at11)).toBe('Porto 2');
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
    // Porto 3 is the backup there too (owner, 28 Oct 2026: she covers what Porto 1 and Porto 2 do not).
    expect(ok(botAvailability({ city: 'Guimarães', items: premium, date: '2026-10-08' }, [], NOW)).teams).toEqual(['Porto 1', 'Porto 3']);
    expect(chooseTeam([porto1('15:00', '16:00', 'Ana')], 'Guimarães', ...at15, true)).toBe('Porto 3');
    expect(ok(botAvailability({ city: 'Guimarães', items: [{ kind: 'sofa', qty: 1 }], date: '2026-10-08' }, [], NOW)).teams).toEqual(['Braga']);
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
    expect(ok(botAvailability({ city: 'Viana do Castelo', items: rugs }, [], NOW))).toMatchObject({ handToOwner: null, teams: ['Braga'] });
    expect(ok(botAvailability({ city: 'Matosinhos', items: rugs, rugPickup: true }, [], NOW)).handToOwner).toBeNull();
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
    expect(braga.free[0].date).toBe('2026-10-07');
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

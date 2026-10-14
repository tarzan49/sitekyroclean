import { describe, expect, it } from 'vitest';
import { teamAccounts, type AccountEvent, type AccountRow } from './teamAccounts';

// Invented data only: the repo is public.
const ev = (id: string, team?: string): AccountEvent =>
  ({ id, summary: 'Serviço', description: team ? `Equipa: ${team}\n\nnotas` : '', status: 'CONFIRMED', start: null, end: null });
const row = (over: Partial<AccountRow>): AccountRow => ({
  request_date: '2026-10-13', client_name: 'Ana Teste', city: 'Odivelas', locality: 'Lisboa',
  billed_value: 79, my_cut: 40, upsell_value: 0, upsell_team: null, paid: false,
  calendar_event_id: 'e1', calendar_missing_since: null, review_requested: true, ...over,
});

describe('teamAccounts', () => {
  const events = [ev('e1', 'Lisboa 1'), ev('e2', 'Lisboa 1'), ev('e3', 'Porto 1'), ev('e4')];

  it('lists the day, what is left from before and the total, per team from the calendar line', () => {
    const r = teamAccounts([
      row({}),
      row({ calendar_event_id: 'e2', client_name: null, city: 'Barcarena', my_cut: 85, billed_value: 169 }),
      row({ calendar_event_id: 'e2', request_date: '2026-09-29', client_name: 'Rita Teste', city: 'Pinhal Novo', my_cut: 35 }),
    ], events, '2026-10-13');
    expect(r.teams.map(t => [t.team, t.todayTotal, t.beforeTotal, t.total])).toEqual([['Lisboa 1', 125, 35, 160]]);
    expect(r.teams[0].message).toBe([
      'Contas de terça, 13/10 (Lisboa 1)',
      '',
      'Hoje:',
      'Ana Teste, Odivelas: 40€',
      'Barcarena: 85€',
      'Total de hoje: 125€',
      '',
      'Para trás:',
      '29/09 Rita Teste, Pinhal Novo: 35€',
      'Total para trás: 35€',
      '',
      'Total que me devem: 160€',
    ].join('\n'));
  });

  it('a team that owes nothing gets no message; paid, future, cancelled and free revisits do not count', () => {
    const r = teamAccounts([
      row({ calendar_event_id: 'e3', paid: true }),
      row({ calendar_event_id: 'e3', request_date: '2026-10-14' }),
      row({ calendar_event_id: 'e3', calendar_missing_since: '2026-10-12T10:00:00Z' }),
      row({ calendar_event_id: 'e3', billed_value: 0, my_cut: 0 }),
    ], events, '2026-10-13');
    expect(r.teams).toEqual([]);
    expect(r.unassigned).toEqual([]);
  });

  it('only what is left from before still sends, and says there was nothing today', () => {
    const r = teamAccounts([row({ request_date: '2026-10-09', my_cut: 60 })], events, '2026-10-13');
    expect(r.teams[0].message).toContain('Hoje: nenhum serviço por pagar.');
    expect(r.teams[0].message).toContain('09/10 Ana Teste, Odivelas: 60€');
    expect(r.teams[0].total).toBe(60);
  });

  it('adds the owner share of the upsell, as the CRM cut does', () => {
    const r = teamAccounts([row({ my_cut: 40, upsell_value: 40, upsell_team: 'Lisboa 1' })], events, '2026-10-13');
    expect(r.teams[0].todayTotal).toBe(52);
    expect(r.teams[0].message).toContain('Ana Teste, Odivelas: 52€');
  });

  it('a service without a team in the calendar goes to nobody, only to the owner summary', () => {
    const r = teamAccounts([row({ calendar_event_id: 'e4' }), row({ calendar_event_id: null })], events, '2026-10-13');
    expect(r.teams).toEqual([]);
    expect(r.unassigned.map(l => l.amount)).toEqual([40, 40]);
  });

  it('cents are written with a comma', () => {
    const r = teamAccounts([row({ my_cut: 42.5 })], events, '2026-10-13');
    expect(r.teams[0].message).toContain('42,50€');
  });

  it('without the review asked: 5% of the service go to the owner, in Porto always, elsewhere from 19/10', () => {
    const noReview = { review_requested: false, billed_value: 80, my_cut: 40 };
    const porto = teamAccounts([row({ ...noReview, calendar_event_id: 'e3' })], events, '2026-10-13');
    expect(porto.teams[0].todayTotal).toBe(44);
    expect(porto.teams[0].message).toContain('Ana Teste, Odivelas: 44€ (inclui 4€ dos 5% sem avaliação)');
    expect(teamAccounts([row(noReview)], events, '2026-10-13').teams[0].todayTotal).toBe(40);
    expect(teamAccounts([row({ ...noReview, request_date: '2026-10-19' })], events, '2026-10-19').teams[0].todayTotal).toBe(44);
    expect(teamAccounts([row({ calendar_event_id: 'e3', billed_value: 80, my_cut: 40 })], events, '2026-10-13').teams[0].todayTotal).toBe(40);
  });
});

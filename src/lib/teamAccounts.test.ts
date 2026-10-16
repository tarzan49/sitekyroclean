import { describe, expect, it } from 'vitest';
import { teamAccounts, type AccountEvent, type AccountRow } from './teamAccounts';

// Invented data only: the repo is public.
const ev = (id: string, team?: string): AccountEvent =>
  ({ id, summary: 'Serviço', description: team ? `Equipa: ${team}\n\nnotas` : '', status: 'CONFIRMED', start: null, end: null });
const row = (over: Partial<AccountRow>): AccountRow => ({
  request_date: '2026-10-13', client_name: 'Ana Teste', city: 'Odivelas', locality: 'Lisboa',
  billed_value: 79, my_cut: 40, upsell_value: 0, upsell_team: null, paid: false,
  calendar_event_id: 'e1', calendar_missing_since: null, review_requested: true,
  description: 'Limpeza de sofá de 3 lugares', invoiced: false, ...over,
});

describe('teamAccounts', () => {
  const events = [ev('e1', 'Lisboa 1'), ev('e2', 'Lisboa 1'), ev('e3', 'Porto 1'), ev('e4'), ev('e5', 'Porto 2')];

  it('says the date, never the weekday, and lists every service point by point', () => {
    const r = teamAccounts([
      row({}),
      row({ calendar_event_id: 'e2', client_name: null, city: 'Barcarena', my_cut: 85, billed_value: 169, description: 'Impermeabilização de sofá' }),
      row({ calendar_event_id: 'e2', request_date: '2026-09-29', client_name: 'Rita Teste', city: 'Pinhal Novo', my_cut: 35, billed_value: 70, description: 'Recolha de tapete' }),
    ], events, '2026-10-13');
    expect(r.teams.map(t => [t.team, t.todayTotal, t.beforeTotal, t.total])).toEqual([['Lisboa 1', 125, 35, 160]]);
    expect(r.teams[0].message).toBe([
      'Contas até 13/10 (Lisboa 1)',
      '',
      'Serviços de 13/10:',
      '',
      '13/10 · Ana Teste, Odivelas · Limpeza de sofá de 3 lugares',
      'Serviço 79€ · a minha parte 40€ = deves-me 40€',
      '',
      '13/10 · Barcarena · Impermeabilização de sofá',
      'Serviço 169€ · a minha parte 85€ = deves-me 85€',
      '',
      'Total de 13/10: 125€',
      '',
      'Por pagar de dias anteriores:',
      '',
      '29/09 · Rita Teste, Pinhal Novo · Recolha de tapete',
      'Serviço 70€ · a minha parte 35€ = deves-me 35€',
      '',
      'Total de dias anteriores: 35€',
      '',
      'Total que me devem: 160€',
    ].join('\n'));
    expect(r.teams[0].message).not.toMatch(/segunda|terça|quarta|quinta|sexta|sábado|domingo/);
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

  it('only what is left from before still sends, and says the day had nothing', () => {
    const r = teamAccounts([row({ request_date: '2026-10-09', my_cut: 60 })], events, '2026-10-13');
    expect(r.teams[0].message).toContain('13/10: nenhum serviço por pagar.');
    expect(r.teams[0].message).toContain('09/10 · Ana Teste, Odivelas · Limpeza de sofá de 3 lugares');
    expect(r.teams[0].total).toBe(60);
  });

  it('adds the owner share of the upsell, as the CRM cut does', () => {
    const r = teamAccounts([row({ my_cut: 40, upsell_value: 40, upsell_team: 'Lisboa 1' })], events, '2026-10-13');
    expect(r.teams[0].todayTotal).toBe(52);
    expect(r.teams[0].message).toContain('a minha parte 52€ = deves-me 52€');
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

  it('no automatic 5% since 14/10 at night: the agreed ones come as adjustments', () => {
    const noReview = { review_requested: false, billed_value: 80, my_cut: 40 };
    const r = teamAccounts([row({ ...noReview, calendar_event_id: 'e3' })], events, '2026-10-13', [
      { team: 'Porto 1', day: '2026-10-10', label: 'Avaliações, lote até 10/10', amount: 85 },
      { team: 'Porto 1', day: '2026-10-20', label: 'Ainda não', amount: 10 },
    ]);
    expect(r.teams[0].todayTotal).toBe(40);
    expect(r.teams[0].total).toBe(125);
    expect(r.teams[0].message).toContain('Acertos combinados:\nAvaliações, lote até 10/10: 85€');
    expect(r.teams[0].message).not.toContain('Ainda não');
    expect(r.teams[0].message).not.toContain('5%');
  });

  it('a service paid to the owner is not owed by the team and its part comes off the total', () => {
    const r = teamAccounts([
      row({ calendar_event_id: 'e3' }),
      row({ calendar_event_id: 'e3', client_name: 'Sofia Teste', city: 'Porto', billed_value: 50, my_cut: 25, paid_to_owner: true, client_paid_owner_at: '2026-10-14T12:00:00Z' }),
    ], events, '2026-10-13');
    expect(r.teams[0].total).toBe(15);
    expect(r.teams[0].ownerOwes).toEqual([{ date: '2026-10-13', label: 'Sofia Teste, Porto', amount: 25 }]);
    expect(r.teams[0].message).toContain('Soma: 40€\n\nPagos diretamente a mim (desconto a vossa parte):\n13/10 Sofia Teste, Porto · a vossa parte 25€\n\nTotal que me devem: 15€');
  });

  it('nothing is sent when what the owner received covers what the team owes', () => {
    const r = teamAccounts([
      row({ calendar_event_id: 'e3' }),
      row({ calendar_event_id: 'e3', client_name: 'Sofia Teste', city: 'Porto', billed_value: 89, my_cut: 45, paid_to_owner: true, client_paid_owner_at: '2026-10-14T12:00:00Z' }),
    ], events, '2026-10-13');
    expect(r.teams).toEqual([]);
  });

  it('paid to the owner but the client has not paid yet: listed, nothing comes off (Catarina Foz, 16 Oct)', () => {
    const r = teamAccounts([
      row({ calendar_event_id: 'e3' }),
      row({ calendar_event_id: 'e3', client_name: 'Sofia Teste', city: 'Porto', billed_value: 50, my_cut: 25, paid_to_owner: true }),
    ], events, '2026-10-13');
    expect(r.teams[0].total).toBe(40);
    expect(r.teams[0].ownerOwes).toEqual([]);
    expect(r.teams[0].message).toContain('ainda não pagou (desconto a vossa parte quando pagar):\n13/10 Sofia Teste, Porto · a vossa parte 25€\n\nTotal que me devem: 40€');
  });

  it('with an invoice the 23% VAT goes on top and is all the owner\'s', () => {
    const r = teamAccounts([row({ calendar_event_id: 'e5', request_date: '2026-10-14', billed_value: 79, my_cut: 40, invoiced: true })], events, '2026-10-14');
    expect(r.teams[0].total).toBe(58.17);
    expect(r.teams[0].message).toContain('Serviço 79€ · a minha parte 40€ + IVA 23% 18,17€ = deves-me 58,17€');
  });
});

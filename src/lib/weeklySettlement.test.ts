import { describe, expect, it } from 'vitest';
import { cycleEndFor, cycleStartFor, groupOfTeam, isSettlementDay, weeklySettlement } from './weeklySettlement';
import type { AccountEvent, AccountRow } from './teamAccounts';

// 2026-11-01 é domingo.
const row = (id: string, day: string, my_cut: number, eventId: string, extra: Partial<AccountRow> = {}): AccountRow => ({
  id, request_date: day, client_name: 'Ana', city: 'Porto', locality: 'Porto', billed_value: my_cut * 2, my_cut,
  upsell_value: null, upsell_team: null, paid: false, calendar_event_id: eventId, calendar_missing_since: null, ...extra,
});
const ev = (id: string, team: string): AccountEvent => ({ id, summary: 'Serviço', description: `Equipa: ${team}`, status: 'confirmed', start: null, end: null });

describe('ciclo de domingo a domingo', () => {
  it('o ciclo fecha no domingo, hoje se for domingo', () => {
    expect(cycleEndFor('2026-11-01')).toBe('2026-11-01');
    expect(cycleEndFor('2026-11-02')).toBe('2026-11-08');
    expect(cycleEndFor('2026-11-07')).toBe('2026-11-08');
    expect(cycleStartFor('2026-11-08')).toBe('2026-11-02');
  });
  it('só se pode fechar ao domingo', () => {
    expect(isSettlementDay('2026-11-01')).toBe(true);
    expect(isSettlementDay('2026-11-02')).toBe(false);
    expect(isSettlementDay('2026-10-31')).toBe(false);
  });
});

describe('grupos', () => {
  it('cada equipa tem o seu grupo, sem somar Porto 2 a mais ninguém', () => {
    expect(groupOfTeam('Porto 1').id).toBe('porto1');
    expect(groupOfTeam('Lisboa 1').id).toBe('lisboa1');
    expect(groupOfTeam('Algarve').id).toBe('algarve');
    expect(groupOfTeam('Porto 2').id).toBe('porto2');
    expect(groupOfTeam('Braga').id).toBe('braga');
    expect(groupOfTeam('Coimbra').id).toBe('coimbra');
  });
});

describe('weeklySettlement', () => {
  const events = [ev('e1', 'Porto 1'), ev('e2', 'Porto 1'), ev('e3', 'Algarve'), ev('e4', 'Lisboa 1'), ev('e5', 'Braga'), ev('e6', 'Porto 2'), ev('e7', 'Porto 1')];
  const rows = [
    row('r1', '2026-10-27', 40, 'e1'),
    row('r2', '2026-11-01', 35, 'e2'),
    row('r3', '2026-10-30', 30, 'e3'),
    row('r4', '2026-10-31', 20, 'e4'),
    row('r5', '2026-10-29', 25, 'e5'),
    row('r6', '2026-10-30', 15, 'e6'),
    row('r7', '2026-10-20', 10, 'e7', { paid: true }),
    row('r8', '2026-11-03', 99, 'e1'),
  ];
  const s = weeklySettlement(rows, events, [], '2026-11-01');
  const g = (id: string) => s.groups.find(x => x.id === id)!;

  it('soma cada grupo e ignora o que já está pago ou ainda não aconteceu', () => {
    expect(g('porto1').total).toBe(75);
    expect(g('lisboa1').total).toBe(20);
    expect(g('algarve').total).toBe(30);
    expect(g('braga').total).toBe(25);
    expect(g('porto2').total).toBe(15);
    expect(g('porto1').serviceIds.sort()).toEqual(['r1', 'r2']);
    expect(g('porto2').serviceIds).toEqual(['r6']);
  });
  it('marca o que vem de semanas anteriores como atrasado', () => {
    // Ciclo de 26/10 a 01/11: r1 (27/10) está dentro; nada atrasado.
    expect(g('porto1').overdue).toBe(0);
    const late = weeklySettlement([row('x', '2026-10-20', 40, 'e1')], events, [], '2026-11-01');
    expect(late.groups.find(x => x.id === 'porto1')!.overdue).toBe(40);
  });
  it('só deixa fechar ao domingo', () => {
    expect(s.canSettle).toBe(true);
    expect(weeklySettlement(rows, events, [], '2026-10-30').canSettle).toBe(false);
  });
  it('os acertos combinados entram no total e fecham com o ciclo', () => {
    const withAdj = weeklySettlement([], events, [{ id: 'a1', team: 'Porto 1', day: '2026-10-10', label: '5% avaliações', amount: 85 }], '2026-11-01');
    expect(withAdj.groups.find(x => x.id === 'porto1')!.total).toBe(85);
    expect(withAdj.groups.find(x => x.id === 'porto1')!.adjustmentIds).toEqual(['a1']);
  });
  it('o que não tem equipa fica de fora dos grupos', () => {
    const noTeam = weeklySettlement([row('z', '2026-10-30', 20, 'sem-evento')], events, [], '2026-11-01');
    expect(noTeam.groups.every(x => x.total === 0)).toBe(true);
    expect(noTeam.unassigned).toHaveLength(1);
  });
});

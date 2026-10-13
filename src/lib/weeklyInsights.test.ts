// Dados inventados: o repositório é público.
import { describe, expect, it } from 'vitest';
import { atStake, computeWeekInsights, missingForGoal } from './weeklyInsights';
import type { ServiceRankRow, WeekRow } from './weeklyReview';

const week = (closes: number, ticket: number | null, extra: Partial<WeekRow> = {}): WeekRow => ({
  week: '2026-01-05', closes, billed: closes * (ticket ?? 0), share: 0, ticket, spend: 0, googleCloses: 0, costPerGoogleClient: null, ...extra,
});
const rank = (service: string, contacts: number, closed: number, ticket: number | null): ServiceRankRow =>
  ({ service, contacts, closed, rate: closed / contacts, ticket, valuePerContact: null });

describe('leitura da semana', () => {
  it('põe em "bom" o que está acima da média e em "melhorar" o que está abaixo, com uma ação', () => {
    const weeks = [week(10, 100), week(10, 100), week(14, 80)];
    const r = computeWeekInsights(weeks, []);
    expect(r.good.map(g => g.title)).toContain('Mais fechos que o normal');
    const low = r.improve.find(i => i.title === 'Ticket médio abaixo do normal')!;
    expect(low.detail).toContain('80€');
    expect(low.action).toBeTruthy();
    expect(r.baselineWeeks).toBe(2);
  });

  it('ignora diferenças abaixo de 10%', () => {
    const r = computeWeekInsights([week(10, 100), week(10, 105)], []);
    expect(r.good).toEqual([]);
    expect(r.improve).toEqual([]);
  });

  it('Google com gasto e sem clientes é um ponto a melhorar', () => {
    const r = computeWeekInsights([week(10, 100), week(10, 100, { spend: 200 })], []);
    expect(r.improve.map(i => i.title)).toContain('Google Ads sem clientes');
  });

  it('serviços: acima da meta em "bom", o que mais dinheiro deixa por fechar em "melhorar"', () => {
    const ranking = [rank('Recolha', 20, 15, 100), rank('Tapete', 40, 16, 100), rank('Sofá', 20, 12, 100), rank('Cadeira', 5, 0, 100)];
    expect(missingForGoal(ranking[1])).toBe(12);
    expect(atStake(ranking[1])).toBe(1200);
    const r = computeWeekInsights([week(10, 100)], ranking);
    expect(r.good[0].title).toBe('Recolha acima da meta');
    expect(r.improve[0].title).toBe('Tapete: 40% de fecho');
    expect(r.improve[0].detail).toContain('mais 12 fechos');
    // Com menos de 10 contactos não entra.
    expect(r.improve.some(i => i.title.startsWith('Cadeira'))).toBe(false);
  });

  it('questionário: abaixo de 50% em 90 dias é um ponto a melhorar, com os fechos em falta', () => {
    const low = computeWeekInsights([week(10, 100)], [], { quotes: 20, closed: 6 });
    expect(low.improve[0].title).toBe('Questionário: 30% de fecho');
    expect(low.improve[0].detail).toContain('mais 4 fechos');
    const ok = computeWeekInsights([week(10, 100)], [], { quotes: 20, closed: 11 });
    expect(ok.good[0].title).toBe('Questionário acima da meta: 55%');
    // Com menos de 10 pedidos não entra.
    expect(computeWeekInsights([week(10, 100)], [], { quotes: 5, closed: 0 }).improve).toEqual([]);
  });
});

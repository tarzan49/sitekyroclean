import { describe, expect, it } from 'vitest';
import { adsExtra, organicBaseline } from './adsVsOrganic';
import type { CampaignTrend, LiveWeek, WeekWithEstimate } from './growthLive';
import { costPerExtraRequest, growthInsights, growthLevers, recentWindow, type GrowthInsightInput } from './growthInsights';

// Sábado 17/10/2026 às 21:00 em Lisboa.
const NOW = new Date('2026-10-17T20:00:00Z');

const wk = (week: string, newPeople: number | null, closings: number, billed: number, share: number, extra: Partial<WeekWithEstimate> = {}): WeekWithEstimate => ({
  week, daysElapsed: 7, spend: 0, newPeople, peopleWrote: null, conversationsSource: 'whatsapp_web', closings, billed, share, requestsEstimated: false, ...extra,
});

// Agosto e setembro: 30 pedidos, 15 fechos (50%), 140€ de ticket, metade para o dono.
const ORGANIC = ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14'].map(w => wk(w, 30, 15, 2100, 1050));
const ADS = [
  wk('2026-09-21', 50, 22, 3300, 1650, { spend: 120 }),
  wk('2026-09-28', 80, 36, 5400, 2700, { spend: 500 }),
  wk('2026-10-05', 80, 36, 5400, 2700, { spend: 500 }),
];

function liveOf(over: Partial<LiveWeek> = {}): LiveWeek {
  const p = (now: number, then: number) => ({ now, then, change: then ? now / then - 1 : null });
  return {
    week: '2026-10-12', weekday: 5, moment: 'sábado às 21:00', fraction: (5 * 24 + 21) / (7 * 24),
    requests: { ...p(70, 70), estimated: true, projection: 80, google: 10 },
    closings: { ...p(30, 30), projection: 35 },
    billed: p(4500, 4500),
    share: { ...p(2250, 2250), projection: 2600 },
    spend: p(420, 420),
    serverUpdatedAt: '2026-10-17T19:17:00Z',
    ...over,
  };
}

function input(current: WeekWithEstimate, live: LiveWeek, campaigns: CampaignTrend[] = []): GrowthInsightInput {
  const weeks = [...ORGANIC, ...ADS, current];
  const base = organicBaseline(weeks);
  return { weeks, base, extra: adsExtra(weeks, base), live, campaigns, now: NOW };
}

const steady = wk('2026-10-12', 70, 30, 4500, 2250, { daysElapsed: 5.875, spend: 420, requestsEstimated: true });

describe('janela das últimas 4 semanas e alavancas', () => {
  it('usa só semanas completas com pedidos', () => {
    const win = recentWindow([...ORGANIC, ...ADS, steady]);
    expect(win.weeks).toBe(4);
    expect(win.requests).toBe((30 + 50 + 80 + 80) / 4);
    expect(win.rate).toBeCloseTo((15 + 22 + 36 + 36) / 240);
    expect(win.shareRatio).toBeCloseTo(0.5);
  });

  it('custo por pedido a mais = gasto ÷ pedidos acima da média, só nas semanas completas', () => {
    const { extra } = input(steady, liveOf());
    // 28/09 e 05/10: 1000€ por (50 + 50) pedidos a mais; a semana em curso fica de fora.
    expect(costPerExtraRequest(extra.rows)).toBeCloseTo(10);
  });

  it('ordena as alavancas pelo que dão por semana, os pedidos já sem o custo dos anúncios', () => {
    const win = { weeks: 4, requests: 60, closings: 30, billed: 4500, share: 2250, rate: 0.5, ticket: 150, shareRatio: 0.5 };
    const levers = growthLevers(win, 10);
    expect(levers.map(l => l.id)).toEqual(['pedidos', 'taxa', 'ticket']);
    expect(levers[0]).toMatchObject({ gain: 375, cost: 100, net: 275 });
    expect(levers[1].net).toBeCloseTo(225);
    expect(levers[2].net).toBeCloseTo(150);
  });
});

describe('growthInsights', () => {
  it('semana má: alertas primeiro, com os números da semana passada à mesma hora', () => {
    const live = liveOf({
      requests: { now: 45, then: 64, change: 45 / 64 - 1, estimated: true, projection: 52, google: 10 },
      closings: { now: 18, then: 40, change: 18 / 40 - 1, projection: 20 },
      billed: { now: 2150, then: 5800, change: 2150 / 5800 - 1 },
      share: { now: 1085, then: 2900, change: 1085 / 2900 - 1, projection: 1200 },
      spend: { now: 560, then: 500, change: 0.12 },
    });
    const out = growthInsights(input(wk('2026-10-12', 45, 18, 2150, 1085, { daysElapsed: 5.875, spend: 560, requestsEstimated: true }), live));
    const ids = out.map(i => i.id);
    expect(ids).toEqual(expect.arrayContaining(['pace-requests', 'pace-closings', 'ads-efficiency']));
    expect(out.find(i => i.id === 'pace-closings')).toMatchObject({ tone: 'alerta', detail: expect.stringContaining('18 fechos') });
    expect(out.find(i => i.id === 'pace-requests')!.detail).toContain('contra 64');
    expect(out.find(i => i.id === 'ads-efficiency')!.title).toBe('Cada pedido a mais está a sair mais caro');
    const tones = out.map(i => i.tone);
    expect(tones).toEqual([...tones].sort((a, b) => ['alerta', 'oportunidade', 'bom'].indexOf(a) - ['alerta', 'oportunidade', 'bom'].indexOf(b)));
  });

  it('anúncios sem pedidos acima da média dão alerta', () => {
    const live = liveOf({ requests: { now: 20, then: 20, change: 0, estimated: true, projection: 24, google: 2 } });
    const out = growthInsights(input(wk('2026-10-12', 20, 30, 4500, 2250, { daysElapsed: 5.875, spend: 420 }), live));
    expect(out.find(i => i.id === 'ads-efficiency')!.title).toBe('Os anúncios ainda não trouxeram pedidos a mais esta semana');
  });

  it('semana boa: bons sinais, e os anúncios a pagar-se', () => {
    const live = liveOf({
      requests: { now: 90, then: 64, change: 90 / 64 - 1, estimated: true, projection: 100, google: 20 },
      closings: { now: 45, then: 30, change: 0.5, projection: 50 },
    });
    const out = growthInsights(input(steady, live));
    expect(out.find(i => i.id === 'pace-requests')!.tone).toBe('bom');
    expect(out.find(i => i.id === 'pace-closings')!.tone).toBe('bom');
    expect(out.find(i => i.id === 'ads-roi')).toMatchObject({ tone: 'bom', title: 'Os anúncios estão a pagar-se' });
    expect(out.some(i => i.tone === 'alerta')).toBe(false);
  });

  it('nada a dizer sobre o ritmo no primeiro dia da semana', () => {
    const live = liveOf({ fraction: 0.1, requests: { now: 2, then: 10, change: -0.8, estimated: true, projection: null, google: 0 } });
    expect(growthInsights(input(steady, live)).some(i => i.id.startsWith('pace-'))).toBe(false);
  });

  it('taxa de fecho abaixo de agosto e setembro: oportunidade com o valor em euros', () => {
    const low = [wk('2026-09-21', 80, 24, 3360, 1680, { spend: 120 }), wk('2026-09-28', 80, 24, 3360, 1680, { spend: 500 }), wk('2026-10-05', 80, 24, 3360, 1680, { spend: 500 })];
    const weeks = [...ORGANIC, ...low, steady];
    const base = organicBaseline(weeks);
    const out = growthInsights({ weeks, base, extra: adsExtra(weeks, base), live: liveOf(), campaigns: [], now: NOW });
    const rate = out.find(i => i.id === 'close-rate')!;
    expect(rate.tone).toBe('oportunidade');
    expect(rate.detail).toMatch(/^\d+% nas últimas 4 semanas contra 50%\. Voltar aos 50% vale cerca de \d+€ por semana para ti\.$/);
  });

  it('campanha com o clique mais caro', () => {
    const c: CampaignTrend = { name: 'Kyro | Lisboa | Limpeza e Proteção de Sofás | Set 2026', cost7: 280, clicks7: 140, conversions7: 3, costPrev7: 210, clicksPrev7: 150, cost: 900, clicks: 500, conversions: 9 };
    const out = growthInsights(input(steady, liveOf(), [c]));
    expect(out.find(i => i.id.startsWith('cpc-'))!.title).toBe('Lisboa | Set 2026: o clique ficou 43% mais caro');
  });

  it('avisa quando falta a contagem do WhatsApp da semana passada, só depois de segunda às 10h', () => {
    const weeks = [...ORGANIC, ...ADS, { ...steady, daysElapsed: 7, requestsEstimated: true }, wk('2026-10-19', 3, 1, 150, 75, { daysElapsed: 0.4 })];
    const base = organicBaseline(weeks);
    const run = (now: Date) => growthInsights({ weeks, base, extra: adsExtra(weeks, base), live: null, campaigns: [], now });
    expect(run(new Date('2026-10-19T08:00:00Z')).some(i => i.id === 'whatsapp-count')).toBe(false); // segunda às 9h
    expect(run(new Date('2026-10-19T10:00:00Z')).find(i => i.id === 'whatsapp-count')!.detail).toContain('semana de 12/10');
  });

  it('avisa quando o servidor do bot deixa de mandar conversas', () => {
    const out = growthInsights(input(steady, liveOf({ serverUpdatedAt: '2026-10-17T15:17:00Z' })));
    expect(out.find(i => i.id === 'server-stale')!.title).toBe('O servidor do bot não manda conversas há 4 h');
  });

  it('nunca escreve travessão nem deixa contas por acabar', () => {
    const live = liveOf({ closings: { now: 10, then: 30, change: -2 / 3, projection: 12 } });
    for (const i of growthInsights(input(steady, live))) {
      const text = `${i.title} ${i.detail} ${i.action ?? ''}`;
      expect(text).not.toMatch(/—|NaN|Infinity|undefined|null/);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { lisbonMidnight } from './lisbonTime';
import type { WeekStats, WeeklyConversationRow } from './adsVsOrganic';
import {
  campaignTrends, conversationFactor, liveWeek, projectWeek, recentClosings, sinceVisit, timeAgo, withConversationEstimates,
  type ServerConversation,
} from './growthLive';

// Quarta-feira 14/10/2026 às 12:00 em Lisboa (UTC+1).
const NOW = new Date('2026-10-14T11:00:00Z');
const conv = (first_at: string, extra: Partial<ServerConversation> = {}): ServerConversation => ({ first_at, started_by_us: false, origin: 'organico', ...extra });
const closing = (booked_at: string, billed = 100, my_cut = 50, upsell_value = 0) => ({ booked_at, billed_value: billed, my_cut, upsell_value });
const week = (w: string, extra: Partial<WeekStats> = {}): WeekStats => ({
  week: w, daysElapsed: 7, spend: 0, newPeople: 30, peopleWrote: 40, conversationsSource: 'whatsapp_web', closings: 10, billed: 1500, share: 750, ...extra,
});

describe('lisbonMidnight', () => {
  it('é UTC+1 no verão e UTC no inverno', () => {
    expect(lisbonMidnight('2026-10-12')).toBe(Date.parse('2026-10-11T23:00:00Z'));
    expect(lisbonMidnight('2026-11-02')).toBe(Date.parse('2026-11-02T00:00:00Z'));
  });
});

describe('pedidos estimados pelo servidor do bot', () => {
  const weekly: WeeklyConversationRow[] = [
    { week: '2026-09-28', source: 'whatsapp_web', new_people: 12, people_wrote: 20, counted_at: '2026-10-05T07:30:00Z' },
    { week: '2026-10-05', source: 'whatsapp_web', new_people: 9, people_wrote: 15, counted_at: '2026-10-12T07:30:00Z' },
    // Contada a meio da semana: não serve para a razão.
    { week: '2026-10-12', source: 'whatsapp_web', new_people: 2, people_wrote: 3, counted_at: '2026-10-13T10:00:00Z' },
  ];
  const server = [
    ...Array.from({ length: 10 }, () => conv('2026-09-30T10:00:00Z')),
    ...Array.from({ length: 5 }, () => conv('2026-10-07T10:00:00Z')),
    conv('2026-10-07T11:00:00Z', { started_by_us: true }),
    ...Array.from({ length: 4 }, () => conv('2026-10-13T09:00:00Z')),
  ];

  it('a razão é WhatsApp Web ÷ servidor nas semanas completas', () => {
    expect(conversationFactor(weekly, server, NOW)).toBeCloseTo(21 / 15);
  });

  it('a semana em curso usa sempre a estimativa; as contadas ficam como estão', () => {
    const f = conversationFactor(weekly, server, NOW);
    const out = withConversationEstimates([week('2026-10-05', { newPeople: 9 }), week('2026-10-12', { daysElapsed: 2.5, newPeople: 2 })], server, f, NOW);
    expect(out[0]).toMatchObject({ newPeople: 9, requestsEstimated: false });
    expect(out[1]).toMatchObject({ newPeople: Math.round(4 * f!), requestsEstimated: true });
  });

  it('sem razão não inventa nada', () => {
    const out = withConversationEstimates([week('2026-10-12', { daysElapsed: 2.5, newPeople: null })], server, null, NOW);
    expect(out[0]).toMatchObject({ newPeople: null, requestsEstimated: false });
  });
});

describe('liveWeek', () => {
  const closings = [
    closing('2026-10-12T09:00:00Z', 100, 50),
    closing('2026-10-13T14:00:00Z', 200, 100),
    closing('2026-10-13T15:00:00Z', 0, 0), // revisita a 0€: não conta
    closing('2026-10-05T08:00:00Z', 90, 45),
    closing('2026-10-07T09:00:00Z', 110, 55), // quarta passada às 10:00, antes da mesma hora
    closing('2026-10-07T17:00:00Z', 120, 60), // quarta passada às 18:00, depois
    closing('2026-10-09T10:00:00Z', 130, 65),
  ];
  const spend = [
    { stat_date: '2026-10-12', cost: 10 }, { stat_date: '2026-10-13', cost: 20 }, { stat_date: '2026-10-14', cost: 5 },
    { stat_date: '2026-10-05', cost: 10 }, { stat_date: '2026-10-06', cost: 10 }, { stat_date: '2026-10-07', cost: 24 }, { stat_date: '2026-10-08', cost: 99 },
  ];
  const server = [
    conv('2026-10-12T08:00:00Z', { origin: 'google', updated_at: '2026-10-14T10:17:00Z' }),
    conv('2026-10-13T08:00:00Z'),
    conv('2026-10-13T09:00:00Z', { started_by_us: true }),
    conv('2026-10-06T08:00:00Z'),
    conv('2026-10-08T08:00:00Z'),
  ];
  const live = liveWeek({ closings, spend, server, factor: 1.25, now: NOW });

  it('compara com a semana passada à mesma hora', () => {
    expect(live.week).toBe('2026-10-12');
    expect(live.moment).toBe('quarta às 12:00');
    expect(live.fraction).toBeCloseTo(2.5 / 7);
    expect(live.closings).toMatchObject({ now: 2, then: 2, change: 0 });
    expect(live.billed).toMatchObject({ now: 300, then: 200 });
    expect(live.share.now).toBe(150);
  });

  it('o gasto de hoje é o de até agora; o da semana passada conta a parte do dia já passada', () => {
    expect(live.spend.now).toBe(35);
    expect(live.spend.then).toBeCloseTo(10 + 10 + 24 * 0.5);
  });

  it('os pedidos vêm do servidor × razão, sem as conversas que começámos nós', () => {
    expect(live.requests).toMatchObject({ now: 2 * 1.25, then: 1 * 1.25, estimated: true, google: 1 });
    expect(live.serverUpdatedAt).toBe('2026-10-14T10:17:00Z');
  });

  it('projeta o fim da semana', () => {
    expect(projectWeek(10, 20, 40, 0.5)).toBe(20); // perfil da semana passada
    expect(projectWeek(2, 2, 4, 2.5 / 7)).toBeCloseTo(2 / (2.5 / 7)); // pouco na semana passada: proporcional
    expect(projectWeek(1, 0, 0, 0.05)).toBeNull(); // cedo demais
    expect(live.closings.projection).toBeCloseTo(2 / (2.5 / 7));
    expect(live.share.projection).toBeCloseTo(75 * (2 / (2.5 / 7)));
  });
});

describe('novidades, últimos fechos e campanhas', () => {
  it('conta o que entrou desde a última visita', () => {
    const since = sinceVisit(
      [closing('2026-10-14T08:00:00Z', 89, 45), closing('2026-10-14T10:30:00Z', 0, 0), closing('2026-10-13T08:00:00Z')],
      [conv('2026-10-14T09:00:00Z'), conv('2026-10-14T09:30:00Z', { started_by_us: true })],
      Date.parse('2026-10-14T07:00:00Z'), NOW,
    );
    expect(since).toEqual({ hours: 4, closings: 1, billed: 89, share: 45, conversations: 1 });
  });

  it('os últimos fechos saem do mais novo para o mais antigo, sem revisitas', () => {
    const rows = recentClosings([closing('2026-10-12T09:00:00Z'), closing('2026-10-14T09:00:00Z', 0, 0), closing('2026-10-13T09:00:00Z')], 5);
    expect(rows.map(r => r.booked_at)).toEqual(['2026-10-13T09:00:00Z', '2026-10-12T09:00:00Z']);
  });

  it('diz há quanto tempo, em hora de Lisboa', () => {
    expect(timeAgo('2026-10-14T10:48:00Z', NOW)).toBe('há 12 min');
    expect(timeAgo('2026-10-14T08:00:00Z', NOW)).toBe('há 3 h');
    expect(timeAgo('2026-10-14T03:30:00Z', NOW)).toBe('hoje às 04:30');
    expect(timeAgo('2026-10-13T17:20:00Z', NOW)).toBe('ontem às 18:20');
    expect(timeAgo('2026-10-12T09:05:00Z', NOW)).toBe('segunda às 10:05');
    expect(timeAgo('2026-10-01T09:05:00Z', NOW)).toBe('01/10');
  });

  it('campanhas: últimos 7 dias, os 7 anteriores e desde o início', () => {
    const rows = [
      { stat_date: '2026-10-14', cost: 30, clicks: 20, conversions: 1, campaign_name: 'Kyro | Porto | Limpeza e Proteção de Sofás | Set 2026' },
      { stat_date: '2026-10-05', cost: 20, clicks: 20, conversions: 2, campaign_name: 'Kyro | Porto | Limpeza e Proteção de Sofás | Set 2026' },
      { stat_date: '2026-09-20', cost: 99, clicks: 9, conversions: 0, campaign_name: 'Kyro | Porto | Limpeza e Proteção de Sofás | Set 2026' },
    ];
    expect(campaignTrends(rows, '2026-09-28', NOW)).toEqual([{
      name: 'Kyro | Porto | Limpeza e Proteção de Sofás | Set 2026',
      cost7: 30, clicks7: 20, conversions7: 1, costPrev7: 20, clicksPrev7: 20, cost: 50, clicks: 40, conversions: 3,
    }]);
  });
});

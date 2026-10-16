import { describe, expect, it } from 'vitest';
import { compareEras, summarizeConversations, weeklyConversations, type ConversationRow } from './whatsappConversations';

const rows: ConversationRow[] = [
  { first_at: '2026-09-07T10:00:00Z', origin: 'organico' },
  { first_at: '2026-09-08T10:00:00Z', origin: 'organico' },
  { first_at: '2026-09-28T09:00:00Z', origin: 'google' },
  { first_at: '2026-09-29T23:30:00Z', origin: 'google' }, // 30/09 em Lisboa
  { first_at: '2026-09-30T12:00:00Z', origin: 'organico' },
];
const spend = [{ stat_date: '2026-09-28', cost: 60 }, { stat_date: '2026-09-30', cost: 40 }];

describe('whatsappConversations', () => {
  it('conta por origem e calcula o custo por conversa Google', () => {
    const s = summarizeConversations(rows, spend, '2026-09-28', '2026-10-04');
    expect(s.total).toBe(3);
    expect(s.byOrigin.google).toBe(2);
    expect(s.costPerGoogle).toBe(50);
    expect(s.days.find(d => d.day === '2026-09-30')?.total).toBe(2);
    expect(s.weekdays[2].total).toBe(2);
  });
  it('séries por semana e comparação orgânico vs anúncios', () => {
    const w = weeklyConversations(rows, spend, '2026-10-01', 4);
    expect(w.map(x => x.total)).toEqual([2, 0, 0, 3]);
    expect(w[3].withAds).toBe(true);
    const e = compareEras(rows, spend, '2026-09-07', '2026-10-06');
    expect(e.organic.weeks).toBe(2);
    expect(e.organic.perWeek).toBe(1);
    expect(e.ads.perWeek).toBe(3);
    expect(e.ads.costPerWeek).toBe(100);
  });
});

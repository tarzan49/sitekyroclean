import { describe, expect, it } from 'vitest';
import { compareEras, summarizeConversations, weeklyCloseRate, weeklyConversations, type ConversationRow } from './whatsappConversations';

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
  it('taxa de fecho por semana de contacto', () => {
    const contacts: ConversationRow[] = [
      { first_at: '2026-09-28T09:00:00Z', origin: 'google', contact_key: '351910000001' },
      { first_at: '2026-09-29T09:00:00Z', origin: 'organico', contact_key: '351910000002' },
      { first_at: '2026-09-30T09:00:00Z', origin: 'organico', contact_key: '351910000003' },
      { first_at: '2026-10-01T09:00:00Z', origin: 'organico', is_lid: true, contact_key: '999@lid' },
      { first_at: '2026-10-06T09:00:00Z', origin: 'organico', contact_key: '351910000004' },
    ];
    const closings = [
      { phone: '910000001', booked_at: '2026-09-28T12:00:00Z', billed_value: 89 }, // no próprio dia
      { phone: '+351 910 000 002', booked_at: '2026-10-09T12:00:00Z', billed_value: 69 }, // 10 dias depois: conta, fora dos 7
      { phone: '910000003', booked_at: '2026-09-20T12:00:00Z', billed_value: 79 }, // antes do contacto: não conta
      { phone: '910000003', booked_at: '2026-10-02T12:00:00Z', billed_value: 0 }, // revisita a 0€: não conta
      { phone: '910000004', booked_at: '2026-11-20T12:00:00Z', billed_value: 99 }, // depois dos 30 dias
    ];
    const [w1, w2] = weeklyCloseRate(contacts, closings, '2026-10-06', 2, new Date('2026-10-08T12:00:00Z'));
    expect(w1).toMatchObject({ week: '2026-09-28', contacts: 4, google: 1, noPhone: 1, closed: 2, closedIn7: 1, revenue: 158, open: false });
    expect(w1.rate).toBe(0.5);
    expect(w2).toMatchObject({ week: '2026-10-05', contacts: 1, closed: 0, open: true });
  });
});

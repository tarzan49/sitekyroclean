import { describe, expect, it } from 'vitest';
import { adsExtra, buildWeeks, organicBaseline, pickConversations, type WeeklyConversationRow } from './adsVsOrganic';

const conv: WeeklyConversationRow[] = [
  { week: '2026-08-03', source: 'whatsapp_web', new_people: 20, people_wrote: 30, counted_at: '2026-10-17T13:00:00Z' },
  { week: '2026-08-10', source: 'whatsapp_web', new_people: 30, people_wrote: 40, counted_at: '2026-10-17T13:00:00Z' },
  { week: '2026-09-28', source: 'whatsapp_web', new_people: 80, people_wrote: 100, counted_at: '2026-10-17T13:00:00Z' },
  // Semana em curso: a contagem do WhatsApp Web foi feita a meio, ganha a do servidor.
  { week: '2026-10-12', source: 'whatsapp_web', new_people: 10, people_wrote: 12, counted_at: '2026-10-14T13:00:00Z' },
  { week: '2026-10-12', source: 'servidor', new_people: 14, people_wrote: 20, counted_at: '2026-10-15T13:00:00Z' },
];
const closings = [
  { booked_at: '2026-08-04T10:00:00Z', billed_value: 100, my_cut: 50 },
  { booked_at: '2026-08-11T10:00:00Z', billed_value: 300, my_cut: 150 },
  { booked_at: '2026-08-12T10:00:00Z', billed_value: 0, my_cut: 0 }, // revisita a 0€: não é fecho
  { booked_at: '2026-09-29T10:00:00Z', billed_value: 500, my_cut: 250 },
  { booked_at: '2026-09-30T10:00:00Z', billed_value: 300, my_cut: 150 },
  { booked_at: '2026-10-13T10:00:00Z', billed_value: 200, my_cut: 100 },
];
const spend = [{ stat_date: '2026-09-29', cost: 100 }, { stat_date: '2026-10-13', cost: 70 }];

describe('adsVsOrganic', () => {
  it('escolhe a contagem do WhatsApp Web só depois de a semana acabar', () => {
    expect(pickConversations(conv, '2026-09-28')?.source).toBe('whatsapp_web');
    expect(pickConversations(conv, '2026-10-12')?.new_people).toBe(14);
    expect(pickConversations(conv, '2026-09-07')).toBeNull();
  });

  it('média orgânica e o que as semanas com anúncios trazem a mais', () => {
    // Quarta, 14/10 ao meio-dia em Lisboa: 2,5 dias da semana passados.
    const now = new Date('2026-10-14T11:00:00Z');
    const weeks = buildWeeks(closings, spend, conv, '2026-08-03', now);
    const base = organicBaseline(weeks, '2026-08-03', '2026-08-16');
    expect(base).toMatchObject({ weeks: 2, newPeople: 25, peopleWrote: 35, closings: 1, billed: 200, share: 100 });

    const { rows, total } = adsExtra(weeks, base, '2026-09-28');
    const [w1, , w3] = rows;
    expect(w1).toMatchObject({ week: '2026-09-28', partial: false, extraNewPeople: 55, extraClosings: 1, extraBilled: 600, extraShare: 300, spend: 100, profit: 200 });
    // Semana em curso: a média conta só os dias passados.
    expect(w3.partial).toBe(true);
    expect(w3.extraShare).toBeCloseTo(100 - 100 * (2.5 / 7), 5);
    expect(total.spend).toBe(170);
  });
});

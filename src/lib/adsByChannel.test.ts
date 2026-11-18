import { describe, expect, it } from 'vitest';
import { adsExtra, buildWeeks, organicBaseline, type WeeklyConversationRow } from './adsVsOrganic';
import { attributeMeta, metaView, phoneKey, totalView, withoutMeta, type ChannelClosing, type MetaConversation } from './adsByChannel';

const conversations: MetaConversation[] = [
  // Meta desde 18/11: conta.
  { contact_key: '351911111111', first_at: '2026-11-18T09:00:00Z', started_by_us: false, origin: 'meta' },
  { contact_key: '351922222222', first_at: '2026-11-18T10:00:00Z', started_by_us: false, origin: 'meta' },
  { contact_key: '123456789012345', is_lid: true, first_at: '2026-11-18T11:00:00Z', started_by_us: false, origin: 'meta' },
  // Meta de antes dos 500€: fica para trás, e os fechos dela também.
  { contact_key: '351933333333', first_at: '2026-11-16T10:00:00Z', started_by_us: false, origin: 'meta' },
  // Google e conversas que começámos nós não são pedidos Meta.
  { contact_key: '351944444444', first_at: '2026-11-18T10:00:00Z', started_by_us: false, origin: 'google' },
  { contact_key: '351955555555', first_at: '2026-11-18T10:00:00Z', started_by_us: true, origin: 'meta' },
];

const closings: ChannelClosing[] = [
  { id: 'm1', booked_at: '2026-11-18T12:00:00Z', billed_value: 150, my_cut: 75, phone: '+351 911 111 111' },
  // O mesmo cliente com a marca "Meta Ads" no CRM: conta uma vez só.
  { id: 'm2', booked_at: '2026-11-19T12:00:00Z', billed_value: 100, my_cut: 50, phone: '911111111', source: 'Meta Ads' },
  // Marcado "Meta Ads" sem conversa encontrada (telefone de outra pessoa): conta pelo CRM.
  { id: 'm3', booked_at: '2026-11-19T13:00:00Z', billed_value: 89, my_cut: 45, phone: null, source: 'Meta Ads' },
  // Fecho antes da conversa Meta (cliente que já estava a falar): não é da Meta.
  { id: 'x1', booked_at: '2026-11-18T08:00:00Z', billed_value: 200, my_cut: 100, phone: '922222222' },
  // Cliente da Meta de 16/11, mesmo marcado no CRM: gasto que ficou para trás.
  { id: 'x2', booked_at: '2026-11-18T12:00:00Z', billed_value: 300, my_cut: 150, phone: '933333333', source: 'Meta Ads' },
  // Antes de 18/11: fora.
  { id: 'x3', booked_at: '2026-11-17T12:00:00Z', billed_value: 89, my_cut: 45, phone: '911111111', source: 'Meta Ads' },
  // Revisita a 0€: não é fecho.
  { id: 'x4', booked_at: '2026-11-19T12:00:00Z', billed_value: 0, my_cut: 0, phone: '911111111' },
  // Google.
  { id: 'g1', booked_at: '2026-11-18T12:00:00Z', billed_value: 400, my_cut: 200, phone: '944444444' },
];

describe('adsByChannel', () => {
  it('liga o telefone pelos últimos 9 dígitos', () => {
    expect(phoneKey('+351 911 111 111')).toBe('911111111');
    expect(phoneKey('351911111111')).toBe('911111111');
    expect(phoneKey('12345')).toBeNull();
    expect(phoneKey(null)).toBeNull();
  });

  it('atribui à Meta os fechos desde 18/11, sem contar duas vezes', () => {
    const meta = attributeMeta(closings, conversations);
    expect(meta.requests.map(r => r.contact_key)).toEqual(['351911111111', '351922222222', '123456789012345']);
    expect(meta.closings.map(c => c.id)).toEqual(['m1', 'm2', 'm3']);
    expect(meta.byCrmOnly).toBe(1);
  });

  it('sem leitura da Marketing API o gasto Meta é null, nunca 0€', () => {
    const meta = attributeMeta(closings, conversations);
    const off = metaView(meta, [], null);
    expect(off).toMatchObject({ connected: false, spend: null, profit: null, costPerRequest: null, requests: 3, closings: 3, billed: 339, share: 170 });

    const failed = metaView(meta, [], { last_ok_at: null, last_error: 'sem ads_read', last_error_at: '2026-11-18T12:00:00Z' });
    expect(failed).toMatchObject({ connected: false, spend: null, syncError: 'sem ads_read' });
  });

  it('lucro Meta = para ti dos fechos Meta − gasto Meta desde 18/11', () => {
    const meta = attributeMeta(closings, conversations);
    const spend = [
      { stat_date: '2026-11-17', spend: 60, conversations: 4, clicks: 30 }, // antes dos 500€
      { stat_date: '2026-11-18', spend: 60, conversations: 5, clicks: 40 },
      { stat_date: '2026-11-19', spend: 30, conversations: 2, clicks: 20 },
    ];
    const v = metaView(meta, spend, { last_ok_at: '2026-11-19T15:00:00Z' });
    expect(v).toMatchObject({ connected: true, syncError: null, spend: 90, metaConversations: 7, clicks: 60, share: 170, profit: 80, costPerRequest: 30, costPerClosing: 30 });
  });

  it('o Google perde a parte da Meta e Google + Meta = Total', () => {
    const conv: WeeklyConversationRow[] = [
      { week: '2026-08-03', source: 'whatsapp_web', new_people: 20, people_wrote: 30, counted_at: '2026-10-17T13:00:00Z' },
      { week: '2026-11-16', source: 'servidor', new_people: 40, people_wrote: 50, counted_at: '2026-11-19T15:00:00Z' },
    ];
    const organic = [{ id: 'o1', booked_at: '2026-08-04T10:00:00Z', billed_value: 100, my_cut: 50 }];
    const all = [...organic, ...closings];
    const now = new Date('2026-11-19T15:00:00Z');
    const weeks = buildWeeks(all, [{ stat_date: '2026-11-18', cost: 40 }], conv, '2026-08-03', now);
    const base = organicBaseline(weeks, '2026-08-03', '2026-08-09');
    const meta = attributeMeta(all, conversations);
    const spend = [{ stat_date: '2026-11-18', spend: 60 }, { stat_date: '2026-11-19', spend: 30 }];
    const status = { last_ok_at: '2026-11-19T15:00:00Z' };

    const everything = adsExtra(weeks, base, '2026-11-16');
    const google = adsExtra(withoutMeta(weeks, meta), base, '2026-11-16');
    const metaV = metaView(meta, spend, status);
    const total = totalView(everything, spend, true, '2026-11-18', '2026-11-16');

    // Semana de 16/11: a Meta trouxe 3 pedidos, 3 fechos, 339€, 170€ para ti.
    expect(everything.rows[0].extraClosings - google.rows[0].extraClosings).toBeCloseTo(3, 5);
    expect(everything.rows[0].extraShare - google.rows[0].extraShare).toBeCloseTo(170, 5);
    expect(everything.rows[0].extraNewPeople! - google.rows[0].extraNewPeople!).toBeCloseTo(3, 5);
    expect(total.metaSpend).toBe(90);
    expect(google.total.profit + metaV.profit!).toBeCloseTo(total.profit!, 5);

    // Sem a Meta ligada o total fica por ligar.
    expect(totalView(everything, [], false, '2026-11-18', '2026-11-16')).toMatchObject({ metaSpend: null, profit: null });
  });
});

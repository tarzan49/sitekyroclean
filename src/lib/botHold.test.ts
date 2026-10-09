import { describe, expect, it } from 'vitest';
import { planBotHold, planOwnerBooking, type BotHoldPlan } from './botHold';
import { botAvailability, eventRegion, type AvailabilityEvent } from './botAvailability';

// Wednesday 7 Oct 2026, 09:45 in Portugal. Invented data only: the repo is public.
const NOW = new Date('2026-10-07T08:45:00Z');
const sofa = [{ kind: 'sofa', size: '3-lugares', qty: 1 }];
const req = (over: Record<string, unknown> = {}) =>
  ({ conversationId: 'c1', city: 'Oeiras', items: sofa, date: '2026-10-08', time: '15h', name: 'Ana Teste', phone: '+351 900 000 000', ...over });
const asEvent = (p: BotHoldPlan, id: string): AvailabilityEvent & { id: string } =>
  ({ id, summary: p.event.title, description: p.event.description, status: 'CONFIRMED', start: p.event.start, end: p.event.end });
const plan = (r: unknown, events: (AvailabilityEvent & { id?: string })[] = [], own?: string) => {
  const p = planBotHold(r, events, NOW, own);
  if (!('ok' in p) || !p.ok) throw new Error(JSON.stringify(p));
  return p;
};

describe('planBotHold', () => {
  it('writes a "Pré-reserva" with the town, the articles and the engine total, at the accepted time', () => {
    const p = plan(req());
    expect(p.event.title).toMatch(/^Pré-reserva – Ana Teste – Oeiras – .+ – \d+€$/);
    expect(p.event.start).toBe('2026-10-08T14:00:00.000Z'); // 15h in Lisbon
    expect(p.slot).toEqual({ date: '2026-10-08', time: '15h', durationMin: 60 });
    expect(p.event.description).toContain('bot:c1');
    expect(p.event.description).toContain('Morada: por pedir');
    // It is not a service: the team script and the CRM ignore it, availability places it by its town.
    expect(eventRegion(asEvent(p, 'e1'))).toBe('Lisboa');
  });

  it('busies a team, so the same time is not given to a third client in a two-team region', () => {
    const a = plan(req({ conversationId: 'a' }));
    const b = plan(req({ conversationId: 'b' }), [asEvent(a, 'ea')]);
    const third = planBotHold(req({ conversationId: 'c' }), [asEvent(a, 'ea'), asEvent(b, 'eb')], NOW);
    expect(third).toMatchObject({ ok: false, taken: true });
    const after = botAvailability({ city: 'Oeiras', items: sofa, date: '2026-10-08', time: '15h' }, [asEvent(a, 'ea'), asEvent(b, 'eb')], NOW);
    expect('requested' in after && after.requested?.free).toBe(false);
  });

  it('a conversation moving its own pre-booking is not blocked by it', () => {
    const a = plan(req({ conversationId: 'a' }));
    const b = plan(req({ conversationId: 'b' }), [asEvent(a, 'ea')]);
    expect(plan(req({ conversationId: 'b', time: '15h' }), [asEvent(a, 'ea'), asEvent(b, 'eb')], 'eb').ok).toBe(true);
  });

  it('hands to the owner where the bot has no calendar, and checks its input', () => {
    expect(planBotHold(req({ city: 'Coimbra' }), [], NOW)).toMatchObject({ ok: false, handToOwner: expect.any(String) });
    expect(planBotHold(req({ conversationId: '' }), [], NOW)).toHaveProperty('error');
    expect(planBotHold(req({ time: undefined }), [], NOW)).toHaveProperty('error');
    expect(planBotHold(req({ date: '2026-10-01' }), [], NOW)).toHaveProperty('error');
  });

  it('keeps "sob orçamento" when the engine has no price, and the name on one line', () => {
    const p = plan(req({ items: [{ kind: 'rug', width: 2, length: 3 }], name: 'Rui\nTeste', rugPickup: true }));
    expect(p.event.title).toMatch(/– sob orçamento$/);
    expect(p.event.title).toContain('Rui Teste');
    expect(p.event.description).toContain('Recolha e entrega: 10€');
  });
});

describe('planOwnerBooking', () => {
  const base = { conversationId: 'c9', date: '2026-10-12', time: '15h', service: 'Recolha de 2 tapetes (2x3)', total: 159, phone: '+351 900 000 001', name: 'Cliente Inventado', address: 'Rua Inventada 1, Oeiras' };
  it('builds his own title with "A confirmar · " in front, share rounded up, Lisbon time', () => {
    const p = planOwnerBooking(base, []);
    if (!('ok' in p) || !p.ok) throw new Error(JSON.stringify(p));
    expect(p.event.title).toBe('A confirmar · Serviço 80€ (159€) Recolha de 2 tapetes (2x3) - +351 900 000 001 - Cliente Inventado - Rua Inventada 1, Oeiras');
    expect(p.event.start).toBe('2026-10-12T14:00:00.000Z');
    expect(p.event.description).toContain('bot:c9');
    // Neither the CRM nor the team script treat it as a service; availability does count it.
    expect(eventRegion({ summary: p.event.title, description: '', status: 'CONFIRMED', start: p.event.start, end: p.event.end })).toBe('Lisboa');
  });
  it('rug pickup: half the total minus the pickup price he set, rounded up', () => {
    const p = planOwnerBooking({ ...base, pickupFee: 20 }, []);
    expect('ok' in p && p.ok && p.event.title).toMatch(/^A confirmar · Serviço 60€ \(159€\)/);
    const q = planOwnerBooking({ ...base, total: 119, pickupFee: 15 }, []);
    expect('ok' in q && q.ok && q.event.title).toMatch(/^A confirmar · Serviço 45€ \(119€\)/);
  });
  it('unknown total keeps his "?€ (?€)" and the ads mark goes before the service', () => {
    const p = planOwnerBooking({ ...base, total: null, fromAds: true }, []);
    expect('ok' in p && p.ok && p.event.title).toBe('A confirmar · Serviço ?€ (?€) (anúncio) Recolha de 2 tapetes (2x3) - +351 900 000 001 - Cliente Inventado - Rua Inventada 1, Oeiras');
  });
  it('writes nothing when he already has a Serviço for that phone that day', () => {
    const mine: AvailabilityEvent = { summary: 'Serviço ?€ (?€) Recolha de tapete - +351 900 000 001 - Cliente', description: '', status: 'CONFIRMED', start: '2026-10-12T14:00:00Z', end: '2026-10-12T14:30:00Z' };
    expect(planOwnerBooking(base, [mine])).toMatchObject({ ok: false, exists: true });
    expect(planOwnerBooking({ ...base, date: '2026-10-13' }, [mine])).toMatchObject({ ok: true });
  });
  it('checks its input', () => {
    expect(planOwnerBooking({ ...base, time: 'amanhã' }, [])).toHaveProperty('error');
    expect(planOwnerBooking({ ...base, service: '' }, [])).toHaveProperty('error');
  });
});

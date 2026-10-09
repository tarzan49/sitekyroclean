import { describe, expect, it } from 'vitest';
import { planBotHold, type BotHoldPlan } from './botHold';
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

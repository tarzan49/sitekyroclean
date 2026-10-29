import { describe, expect, it } from 'vitest';
import { ownerShare, planBotBooking, planBotHold, planOwnerBooking, type BotHoldPlan } from './botHold';
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

  it('busies a team: a second cleaning needs 1h30 after the first, waterproofing only can share the hour (owner, 27 Oct 2026)', () => {
    const a = plan(req({ conversationId: 'a' }));
    expect(planBotHold(req({ conversationId: 'b' }), [asEvent(a, 'ea')], NOW)).toMatchObject({ ok: false, taken: true });
    expect(planBotHold(req({ conversationId: 'b', time: '16h' }), [asEvent(a, 'ea')], NOW)).toMatchObject({ ok: false, taken: true });
    expect(plan(req({ conversationId: 'b', time: '16h30' }), [asEvent(a, 'ea')]).ok).toBe(true);
    expect(plan(req({ conversationId: 'b', items: [{ kind: 'sofa', size: '3-lugares', qty: 1, treatment: 'premium' }] }), [asEvent(a, 'ea')]).ok).toBe(true);
  });

  it('a conversation moving its own pre-booking is not blocked by it', () => {
    const a = plan(req({ conversationId: 'a' }));
    const b = plan(req({ conversationId: 'b', time: '17h' }), [asEvent(a, 'ea')]);
    expect(plan(req({ conversationId: 'b', time: '16h30' }), [asEvent(a, 'ea'), asEvent(b, 'eb')], 'eb').ok).toBe(true);
  });

  it('hands to the owner where the bot has no calendar, and checks its input', () => {
    expect(planBotHold(req({ city: 'Aveiro' }), [], NOW)).toMatchObject({ ok: false, handToOwner: expect.any(String) });
    expect(planBotHold(req({ conversationId: '' }), [], NOW)).toHaveProperty('error');
    expect(planBotHold(req({ time: undefined }), [], NOW)).toHaveProperty('error');
    expect(planBotHold(req({ date: '2026-10-01' }), [], NOW)).toHaveProperty('error');
  });

  it('never a pre-booking next to a service the client already has (27 Oct: Viana do Castelo, duplicate at the same hour)', () => {
    const booked: AvailabilityEvent & { id: string } = { id: 's1', summary: 'Serviço 45€ (89€) Limpeza de sofá - 900000000 - Ana Teste - Rua X 1, Oeiras', description: 'Equipa: Lisboa 1\n\nbot:c1', status: 'CONFIRMED', start: '2026-10-09T09:00:00Z', end: '2026-10-09T10:00:00Z' };
    // Also when the conversation's own row points at that service (after marcar_servico it does).
    expect(planBotHold(req(), [booked], NOW, 's1')).toEqual({ ok: false, alreadyBooked: true });
    expect(plan(req({ phone: '+351 900 000 009' }), [booked]).ok).toBe(true);
  });

  it('keeps "sob orçamento" when the engine has no price, and the name on one line', () => {
    const p = plan(req({ items: [{ kind: 'rug', width: 2, length: 3 }], name: 'Rui\nTeste', rugPickup: true }));
    expect(p.event.title).toMatch(/– sob orçamento$/);
    expect(p.event.title).toContain('Rui Teste');
    expect(p.event.description).toContain('Recolha e entrega: 20€');
  });
});

describe('planOwnerBooking', () => {
  const base = { conversationId: 'c9', date: '2026-10-12', time: '15h', service: 'Recolha de 2 tapetes (2x3)', total: 159, phone: '+351 900 000 001', name: 'Cliente Inventado', address: 'Rua Inventada 1, Oeiras' };
  it('never puts a job on a team the chat named while that team is off (owner, 28 Oct 2026: Porto 1 on 29/10 afternoon)', () => {
    const off = { ...base, date: '2026-10-29', time: '15h', city: 'Porto', address: 'Rua Inventada 1, 4000-000 Porto', team: 'Porto 1' };
    const clean = planOwnerBooking({ ...off, service: 'Limpeza de sofá 3 lugares', total: 89 }, [], NOW.getTime());
    expect(clean).toMatchObject({ ok: true, team: 'Porto 3' });
    const imper = planOwnerBooking({ ...off, service: 'Impermeabilização Premium de sofá 3 lugares', total: 149 }, [], NOW.getTime());
    expect(imper).toMatchObject({ ok: true });
    expect('team' in imper && imper.team).toBeFalsy();
    expect(planOwnerBooking({ ...off, time: '10h', service: 'Limpeza de sofá 3 lugares', total: 89 }, [], NOW.getTime())).toMatchObject({ team: 'Porto 1' });
  });
  it('never books an hour already gone (22 Oct: 10h booked at 19:34 the same day)', () => {
    expect(planOwnerBooking({ ...base, date: '2026-10-07', time: '9h' }, [], NOW.getTime())).toMatchObject({ error: expect.stringMatching(/já passou/) });
  });
  it('with a price it is his real Serviço, even without confirmed (owner, 19 Oct), share rounded up, Lisbon time', () => {
    const p = planOwnerBooking(base, [], NOW.getTime());
    if (!('ok' in p) || !p.ok) throw new Error(JSON.stringify(p));
    expect(p.event.title).toBe('Serviço 80€ (159€) Recolha de 2 tapetes (2x3) - 900000001 - Cliente Inventado - Rua Inventada 1, Oeiras');
    expect(p.event.start).toBe('2026-10-12T14:00:00.000Z');
    expect(p.event.description).toContain('bot:c9');
    expect(eventRegion({ summary: p.event.title, description: '', status: 'CONFIRMED', start: p.event.start, end: p.event.end })).toBe('Lisboa');
  });
  it('rug pickup: half the total minus 10€ of fuel for whoever picks it up, rounded up (owner, 27 Oct)', () => {
    const p = planOwnerBooking({ ...base, total: 139, pickupFee: 20 }, [], NOW.getTime());
    expect('ok' in p && p.ok && p.event.title).toMatch(/^Serviço 60€ \(139€\)/);
    expect('ok' in p && p.ok && p.event.description).toContain('menos 10€ de gasolina');
    const q = planOwnerBooking({ ...base, total: 159, pickupFee: 20 }, [], NOW.getTime());
    expect('ok' in q && q.ok && q.event.title).toMatch(/^Serviço 70€ \(159€\)/);
    expect(ownerShare(119)).toBe(60);
    expect(ownerShare(119, 5)).toBe(55);
  });
  it('unknown total keeps his "?€ (?€)" and the ads mark goes before the service', () => {
    const p = planOwnerBooking({ ...base, total: null, fromAds: true }, [], NOW.getTime());
    expect('ok' in p && p.ok && p.event.title).toBe('A confirmar · Serviço ?€ (?€) (anúncio) Recolha de 2 tapetes (2x3) - +351 900 000 001 - Cliente Inventado - Rua Inventada 1, Oeiras');
  });
  it('writes nothing when that phone already has a Serviço on that day or a nearby one (a reschedule, owner 19 Oct)', () => {
    const mine: AvailabilityEvent = { summary: 'Serviço ?€ (?€) Recolha de tapete - +351 900 000 001 - Cliente', description: '', status: 'CONFIRMED', start: '2026-10-12T14:00:00Z', end: '2026-10-12T14:30:00Z' };
    expect(planOwnerBooking(base, [mine], NOW.getTime())).toMatchObject({ ok: false, exists: true });
    expect(planOwnerBooking({ ...base, date: '2026-10-16' }, [mine], NOW.getTime())).toMatchObject({ ok: false, exists: true });
    expect(planOwnerBooking({ ...base, date: '2027-01-20' }, [mine], NOW.getTime())).toMatchObject({ ok: true });
    expect(planOwnerBooking({ ...base, phone: '+351 900 000 002', date: '2026-10-16' }, [mine], NOW.getTime())).toMatchObject({ ok: true });
  });
  it('a settled booking (confirmed, price, address) goes in as his Serviço in a team colour', () => {
    const p = planOwnerBooking({ ...base, confirmed: true, city: 'Oeiras' }, [], NOW.getTime());
    if (!('ok' in p) || !p.ok) throw new Error(JSON.stringify(p));
    expect(p.team).toBe('Lisboa 1');
    expect(p.event.colorId).toBe('6');
    expect(p.event.title).toBe('Serviço 80€ (159€) Recolha de 2 tapetes (2x3) - 900000001 - Cliente Inventado - Rua Inventada 1, Oeiras');
    // Lisboa 2 no longer books (owner, 19 Oct 2026): a chat that names it goes to Lisboa 1.
    expect(planOwnerBooking({ ...base, confirmed: true, team: 'Lisboa 2' }, [], NOW.getTime())).toMatchObject({ team: 'Lisboa 1', event: { colorId: '6' } });
    // Without a price it stays "A confirmar".
    const q = planOwnerBooking({ ...base, confirmed: true, city: 'Oeiras', total: null }, [], NOW.getTime());
    expect('ok' in q && q.ok && q.event.title).toMatch(/^A confirmar · /);
  });
  it('a rug pickup in the Braga zone stays "A confirmar" for the owner, unless the chat named a team from outside (owner, 27 Oct)', () => {
    const viana = { ...base, confirmed: true, city: 'Viana do Castelo', address: 'Rua Inventada 1, 4900-000 Viana do Castelo', total: 209, pickupFee: 20 };
    const p = planOwnerBooking(viana, [], NOW.getTime());
    if (!('ok' in p) || !p.ok) throw new Error(JSON.stringify(p));
    expect(p.team).toBeUndefined();
    expect(p.event.title).toMatch(/^A confirmar · Serviço 95€ \(209€\) Recolha/);
    expect(p.event.description).toContain('a equipa Braga não faz recolhas');
    expect(planOwnerBooking({ ...viana, team: 'Braga' }, [], NOW.getTime())).not.toHaveProperty('team');
    expect(planOwnerBooking({ ...viana, team: 'Porto 1' }, [], NOW.getTime())).toMatchObject({ team: 'Porto 1', event: { colorId: '9' } });
    // Only the town's postal code: still the Braga zone.
    expect(planOwnerBooking({ ...viana, city: undefined }, [], NOW.getTime())).not.toHaveProperty('team');
    // A home cleaning there is still Braga's.
    expect(planOwnerBooking({ ...viana, service: 'Limpeza de sofá 3 lugares', pickupFee: undefined, total: 89 }, [], NOW.getTime())).toMatchObject({ team: 'Braga' });
  });
  it('checks its input', () => {
    expect(planOwnerBooking({ ...base, time: 'amanhã' }, [], NOW.getTime())).toHaveProperty('error');
    expect(planOwnerBooking({ ...base, service: '' }, [], NOW.getTime())).toHaveProperty('error');
  });
});

describe('planBotBooking', () => {
  const book = (over: Record<string, unknown> = {}) => ({ ...req(over), address: 'Rua das Flores 10, 2.º Esq, 2780-000 Oeiras', service: 'Limpeza de sofá 3 lugares', ...over });

  it('on a weekday writes his own "Serviço X€ (Y€)" in the colour of a team with room, share rounded up', () => {
    const p = planBotBooking(book({ adOrigin: 'google' }), [], NOW);
    if (!('ok' in p) || !p.ok) throw new Error(JSON.stringify(p));
    expect(p.team).toBe('Lisboa 1');
    expect(p.event.colorId).toBe('6');
    expect(p.event.title).toMatch(/^Serviço (\d+)€ \((\d+)€\) \(anúncio\) Limpeza de sofá 3 lugares - 900000000 - Ana Teste - Rua das Flores 10/);
    const [, share, total] = /^Serviço (\d+)€ \((\d+)€\)/.exec(p.event.title)!.map(Number);
    expect(share).toBe(Math.ceil(total / 2));
    expect(p.event.start).toBe('2026-10-08T14:00:00.000Z');
    expect(p.event.description).toContain('bot:c1');
  });

  it('a total agreed in the chat closes it, even with an item off the table (owner, 18 Oct: 7 chairs at 15€ + headboard 29€ = 134€)', () => {
    const chairs = [{ kind: 'chairs', qty: 7 }];
    const p = planBotBooking(book({ items: chairs, agreedTotal: 134, service: 'Limpeza de 7 cadeiras e cabeceira' }), [], NOW);
    expect(p).toMatchObject({ ok: true });
    if (!('ok' in p) || !p.ok) return;
    expect(p.event.title).toMatch(/^Serviço 67€ \(134€\) Limpeza de 7 cadeiras e cabeceira/);
    expect(p.event.description).toContain('Preço combinado na conversa (tabela 122,50€)');
    // A rug with no engine price closes too once the price was agreed; without it, it goes to the owner.
    expect(planBotBooking(book({ items: [{ kind: 'rug', width: 2, length: 3 }], agreedTotal: 79 }), [], NOW)).toMatchObject({ ok: true });
    expect(planBotBooking(book({ agreedTotal: -5, items: [{ kind: 'rug', width: 2, length: 3 }] }), [], NOW)).toMatchObject({ ok: false });
  });

  it('never closes a rug pickup in the Braga zone: the Braga team does not pick up rugs (owner, 27 Oct, Viana do Castelo)', () => {
    const rugs = [{ kind: 'rug', width: 3.66, length: 2.44, material: 'lã' }, { kind: 'rug', width: 2.44, length: 3.3, material: 'lã' }];
    const viana = { city: 'Viana do Castelo', address: 'Rua Inventada 1, 4900-000 Viana do Castelo', items: rugs, agreedTotal: 209 };
    const reason = expect.stringMatching(/Braga não faz recolhas/);
    expect(planBotBooking(book({ ...viana, rugPickup: true, service: 'Lavagem de 2 tapetes' }), [], NOW)).toEqual({ ok: false, handToOwner: reason });
    // The bot forgot the flag but the service says it.
    expect(planBotBooking(book({ ...viana, service: 'Recolha de 2 tapetes com lavagem e entrega' }), [], NOW)).toEqual({ ok: false, handToOwner: reason });
    // Not even at an hour he gave himself: the team is his to pick.
    expect(planBotBooking(book({ ...viana, rugPickup: true, ownerApprovedTime: true }), [], NOW)).toEqual({ ok: false, handToOwner: reason });
    // Washing at home there, and pickups elsewhere, still close.
    expect(planBotBooking(book({ ...viana, agreedTotal: 189, service: 'Lavagem de 2 tapetes em casa' }), [], NOW)).toMatchObject({ ok: true, team: 'Braga' });
    expect(planBotBooking(book({ items: rugs, agreedTotal: 209, rugPickup: true, service: 'Recolha de 2 tapetes' }), [], NOW)).toMatchObject({ ok: true, team: 'Lisboa 1' });
  });

  it('closes Saturdays and Sundays from the calendar (owner, 18 Oct), leaves anything without an engine price', () => {
    expect(planBotBooking(book({ date: '2026-10-10' }), [], NOW)).toMatchObject({ ok: true });
    expect(planBotBooking(book({ date: '2026-10-11' }), [], NOW)).toMatchObject({ ok: true });
    expect(planBotBooking(book({ items: [{ kind: 'rug', width: 2, length: 3 }] }), [], NOW)).toMatchObject({ ok: false, handToOwner: expect.stringContaining('sob orçamento') });
    expect(planBotBooking(book({ city: 'Aveiro' }), [], NOW)).toMatchObject({ ok: false, handToOwner: expect.any(String) });
  });

  it('closes a Saturday or Sunday time the owner chose, even at the hour of another service', () => {
    const p = planBotBooking(book({ date: '2026-10-10', ownerApprovedWeekend: true }), [], NOW);
    if (!('ok' in p) || !p.ok) throw new Error(JSON.stringify(p));
    expect(p.event.start).toBe('2026-10-10T14:00:00.000Z');
    expect(p.event.description).toContain('escolhida por ti');
    const other = { id: 'o', summary: 'Serviço 45€ (89€) Impermeabilização Premium sofá - 911 111 111 - Rui - Lisboa', description: 'Equipa: Lisboa 1', status: 'CONFIRMED', start: '2026-10-10T14:00:00.000Z', end: '2026-10-10T15:00:00.000Z' };
    expect(planBotBooking(book({ date: '2026-10-10', ownerApprovedWeekend: true }), [other], NOW)).toMatchObject({ ok: true });
    // Only true counts, and only on a weekend: a weekday still refuses a shared hour.
    expect(planBotBooking(book({ date: '2026-10-10', ownerApprovedWeekend: 'yes' }), [other], NOW)).toEqual({ ok: false, sameTime: true });
    expect(planBotBooking(book({ ownerApprovedWeekend: true }), [{ ...other, start: '2026-10-08T14:00:00.000Z', end: '2026-10-08T15:00:00.000Z' }], NOW)).toEqual({ ok: false, sameTime: true });
  });

  it('needs the name and the full address first', () => {
    expect(planBotBooking(book({ name: '', address: 'Oeiras' }), [], NOW)).toEqual({ ok: false, missing: ['nome', 'morada completa'] });
  });

  it('turns its own pre-booking into the service, but not a time another client took', () => {
    const hold = plan(req({ conversationId: 'c1' }));
    const p = planBotBooking(book(), [asEvent(hold, 'e1')], NOW, 'e1');
    expect('ok' in p && p.ok).toBe(true);
    const busy = [1, 2, 3].map(i => ({ id: `x${i}`, summary: `Serviço 45€ (89€) Sofá - Lisboa`, description: `Equipa: ${i < 3 ? 'Lisboa 1' : 'Lisboa 2'}`, status: 'CONFIRMED', start: '2026-10-08T14:00:00.000Z', end: '2026-10-08T15:00:00.000Z' }));
    expect(planBotBooking(book(), busy, NOW)).toMatchObject({ ok: false, taken: true });
  });

  it('a client who already has a service on another day is a reschedule, never a second booking (Filipa, 19 Oct)', () => {
    const mine = { id: 'm', summary: 'Serviço 40€ (79€) Sofá - 900 000 000 - Ana - Oeiras', description: 'Equipa: Lisboa 1', status: 'CONFIRMED', start: '2026-10-07T09:00:00.000Z', end: '2026-10-07T10:00:00.000Z' };
    expect(planBotBooking(book(), [mine], NOW)).toMatchObject({ ok: false, reschedule: { eventId: 'm', date: '2026-10-08' } });
    expect(planBotBooking(book(), [{ ...mine, summary: mine.summary.replace('900 000 000', '911 222 333') }], NOW)).toMatchObject({ ok: true });
  });

  it('never books the same phone twice on the same day', () => {
    const mine = { id: 'm', summary: 'Serviço 40€ (79€) Sofá - 900 000 000 - Ana - Oeiras', description: 'Equipa: Lisboa 1', status: 'CONFIRMED', start: '2026-10-08T09:00:00.000Z', end: '2026-10-08T10:00:00.000Z' };
    expect(planBotBooking(book(), [mine], NOW)).toEqual({ ok: false, exists: true });
  });

  it('a time another service of the zone already has goes to the owner ("se for a mesma hora tem que me consultar")', () => {
    const other = { id: 'o', summary: 'Serviço 45€ (89€) Impermeabilização Premium sofá - 911 111 111 - Rui - Lisboa', description: 'Equipa: Lisboa 1', status: 'CONFIRMED', start: '2026-10-08T14:00:00.000Z', end: '2026-10-08T15:00:00.000Z' };
    expect(planBotBooking(book(), [other], NOW)).toEqual({ ok: false, sameTime: true });
    expect('ok' in planBotBooking(book({ time: '17h' }), [other], NOW) && (planBotBooking(book({ time: '17h' }), [other], NOW) as { ok: boolean }).ok).toBe(true);
    // An hour the owner gave in the chat closes even next to another service (owner, 29 Oct 2026).
    const mine = planBotBooking(book({ ownerApprovedTime: true }), [other], NOW);
    expect(mine).toMatchObject({ ok: true });
    if ('ok' in mine && mine.ok) expect(mine.event.description).toContain('numa hora escolhida por ti');
  });

  it('a visit that runs into the next hour\'s service is not "the same hour" (owner, 29 Oct 2026, Marlene: "se reservas é porque confirmas")', () => {
    // Waterproofing at 16h (90 minutes) with a Porto 1 cleaning at 17h: Porto 1 takes both.
    const cleaning = { id: 'o', summary: 'Serviço 75€ (149€) Limpeza de sofá e tapete - 911 111 111 - Rua Inventada 1, 4100-000 Porto', description: 'Equipa: Porto 1', status: 'CONFIRMED', start: '2026-10-08T16:00:00.000Z', end: '2026-10-08T17:00:00.000Z' };
    const marlene = book({ city: 'São João da Madeira', address: 'Rua Inventada 2, 3700-000 São João da Madeira', items: [{ kind: 'sofa', size: '3-lugares', qty: 1, treatment: 'premium' }], service: 'Impermeabilização Premium sofá 3 lugares', time: '16h' });
    expect(planBotBooking(marlene, [cleaning], NOW)).toMatchObject({ ok: true, team: 'Porto 1' });
    // Starting at the same hour still goes to the owner.
    expect(planBotBooking({ ...marlene, time: '16h30' }, [cleaning], NOW)).toEqual({ ok: false, sameTime: true });
  });
});

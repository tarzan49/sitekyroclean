import { describe, expect, it } from 'vitest';
import { mergedAddress, planBookingUpdate } from './botBookingUpdate';

const ev = {
  id: 'e1',
  summary: 'Serviço 45€ (89€) Limpeza de sofá - +351 914 000 111 - Liliana - Rua 20, nº 853, Espinho',
  description: 'Equipa: Porto 1\n\nLimpeza de sofá, 89€.\n\nbot:351914000111@s.whatsapp.net',
  start: '2026-10-17T08:00:00Z', end: '2026-10-17T09:00:00Z',
};
const now = new Date('2026-10-15T18:42:00Z');

describe('planBookingUpdate', () => {
  it('adds the postcode and the floor to the address, and a dated line before the bot mark', () => {
    const p = planBookingUpdate(ev, '351914000111', { postcode: '4500-266', floor: 'moradia, sem andar' }, now);
    if (!p.ok) throw new Error(p.reason);
    expect(p.title).toBe('Serviço 45€ (89€) Limpeza de sofá - +351 914 000 111 - Liliana - Rua 20, nº 853, Espinho, 4500-266, moradia, sem andar');
    expect(p.description.split('\n')[0]).toBe('Equipa: Porto 1');
    expect(p.description).toMatch(/Atualizado pela conversa \(15\/10.*código postal 4500-266; moradia, sem andar\.\n\nbot:/);
    expect(p.moved).toBe(false);
  });
  it('moves the event to the new agreed hour, keeping the duration (Lisbon time)', () => {
    const p = planBookingUpdate(ev, '914000111', { date: '2026-10-18', time: '11:30' }, now);
    if (!p.ok) throw new Error(p.reason);
    expect([p.start, p.end, p.moved]).toEqual(['2026-10-18T10:30:00.000Z', '2026-10-18T11:30:00.000Z', true]);
    expect(p.summary[0]).toBe('mudou de 17/10 às 09:00 para 18/10 às 11:30');
  });
  it('never touches another client, a pre-booking, or writes when nothing is new', () => {
    expect(planBookingUpdate(ev, '911222333', { postcode: '4500-266' }, now)).toMatchObject({ ok: false });
    expect(planBookingUpdate({ ...ev, summary: 'Pré-reserva – Liliana – 914000111' }, '914000111', { postcode: '4500-266' }, now)).toMatchObject({ ok: false });
    expect(planBookingUpdate({ ...ev, summary: ev.summary + ', 4500-266' }, '914000111', { postcode: '4500-266' }, now)).toMatchObject({ ok: false, reason: 'nada de novo' });
  });
  it('a cancel request is written for the owner, the event stays', () => {
    const p = planBookingUpdate(ev, '914000111', { cancel: 'teve um imprevisto, volta a falar para a semana' }, now);
    if (!p.ok) throw new Error(p.reason);
    expect(p.cancel).toBe(true);
    expect(p.title).toBe(ev.summary);
    expect(p.description).toContain('PEDIU PARA DESMARCAR: teve um imprevisto');
  });
  it('fills a missing name and replaces a changed address', () => {
    const bare = { ...ev, summary: 'Serviço 45€ (89€) Limpeza de sofá - +351 914 000 111' };
    const p = planBookingUpdate(bare, '914000111', { name: 'Natércia Reis', address: 'Rua dos Bombeiros 5, 2.º esq., Castanheira do Ribatejo' }, now);
    if (!p.ok) throw new Error(p.reason);
    expect(p.title).toBe('Serviço 45€ (89€) Limpeza de sofá - +351 914 000 111 - Natércia Reis - Rua dos Bombeiros 5, 2.º esq., Castanheira do Ribatejo');
  });
});

// 29 Oct 2026: the event had the floor and the postcode, the reader sent the street and the town only,
// and the update rewrote the title without the floor. Invented addresses, same shapes.
describe('an address update never drops the floor, door or postcode the event has', () => {
  const booked = (address: string, description = ev.description) =>
    ({ ...ev, summary: `Serviço 80€ (159€) Impermeabilização Premium sofá 3 lugares - 910000222 - Rita - ${address}`, description });
  const title = (p: ReturnType<typeof planBookingUpdate>) => { if (!p.ok) throw new Error(p.reason); return p.title.split(' - ').slice(3).join(' - '); };
  const full = 'Rua das Camélias nº 41, 3º AB, 4400-123 Vila Nova de Gaia';

  it('the same address with less in it is nothing new: the event keeps its own', () => {
    const shorter = { address: 'Rua das Camélias nº 41, Vila Nova de Gaia', postcode: '4400-123' };
    expect(planBookingUpdate(booked(full), '910000222', shorter, now)).toMatchObject({ ok: false, reason: 'nada de novo' });
    // The client's own spelling: "4 ºAB", "n.º", "V. N. de Gaia".
    expect(planBookingUpdate(booked(full), '910000222', { ...shorter, floor: '3 ºAB' }, now)).toMatchObject({ ok: false, reason: 'nada de novo' });
    expect(planBookingUpdate(booked(full), '910000222', { address: 'R. das Camélias n.º 41 3ºAB, 4400-123 Gaia' }, now)).toMatchObject({ ok: false, reason: 'nada de novo' });
  });

  it('the same street and door with something new: the new one, with the floor and postcode it left out', () => {
    const p = planBookingUpdate(booked('Rua das Camélias nº 41, 3º AB, 4400-123'), '910000222', { address: 'Rua das Camélias 41, Vila Nova de Gaia' }, now);
    expect(title(p)).toBe('Rua das Camélias 41, 3º AB, Vila Nova de Gaia, 4400-123');
    // A floor written after the door number with no comma, and a block.
    expect(title(planBookingUpdate(booked('Rua das Camélias 41 3º AB, Bloco C, Gaia'), '910000222', { address: 'Rua das Camélias 41, Vila Nova de Gaia' }, now)))
      .toBe('Rua das Camélias 41, 3º AB, Bloco C, Vila Nova de Gaia');
    // The floor sent apart as well: written once.
    expect(title(planBookingUpdate(booked('Rua das Camélias 41, 3º AB, Gaia'), '910000222', { address: 'Rua das Camélias 41, Vila Nova de Gaia', floor: '3º AB' }, now)))
      .toBe('Rua das Camélias 41, 3º AB, Vila Nova de Gaia');
  });

  it('a floor or postcode the client changes replaces the old one', () => {
    expect(title(planBookingUpdate(booked(full), '910000222', { address: 'Rua das Camélias nº 41, 1º dto, Vila Nova de Gaia', postcode: '4400-321' }, now)))
      .toBe('Rua das Camélias nº 41, 1º dto, Vila Nova de Gaia, 4400-321');
  });

  it('fewer door numbers than the event: the event keeps its address and gets what is new', () => {
    const p = planBookingUpdate(booked('Rua 20, nº 853, 2º esq., Espinho'), '910000222', { address: 'Rua 20, Espinho, 4500-266' }, now);
    expect(title(p)).toBe('Rua 20, nº 853, 2º esq., Espinho, 4500-266');
  });

  it('another street or door number is another address: it goes in as the client wrote it', () => {
    expect(title(planBookingUpdate(booked(full), '910000222', { address: 'Avenida da Liberdade 200, Braga' }, now))).toBe('Avenida da Liberdade 200, Braga');
    expect(title(planBookingUpdate(booked(full), '910000222', { address: 'Rua das Camélias nº 47, Vila Nova de Gaia' }, now))).toBe('Rua das Camélias nº 47, Vila Nova de Gaia');
    expect(title(planBookingUpdate(booked(full), '910000222', { address: 'Rua das Rosas nº 41, Vila Nova de Gaia' }, now))).toBe('Rua das Rosas nº 41, Vila Nova de Gaia');
  });

  it('a floor named only in an earlier "(era …)" line is still missing from the title, so it goes back in', () => {
    const description = `Equipa: Porto 1\n\nAtualizado pela conversa (28/10, 10:00): morada Rua das Camélias nº 41, Gaia (era ${full}).\n\nbot:351910000222@s.whatsapp.net`;
    expect(title(planBookingUpdate(booked('Rua das Camélias nº 41, Gaia', description), '910000222', { floor: '3º AB' }, now))).toBe('Rua das Camélias nº 41, Gaia, 3º AB');
  });

  it('mergedAddress: null when nothing changes; an abbreviated town still keeps the floor and postcode', () => {
    expect(mergedAddress(full, 'Rua das Camélias 41, Vila Nova de Gaia', false)).toBeNull();
    expect(mergedAddress(full, 'Rua das Camélias 41, V. N. Gaia', false)).toBe('Rua das Camélias 41, 3º AB, V. N. Gaia, 4400-123');
    expect(mergedAddress('Rua das Camélias 41, 3º AB', 'Rua das Camélias 41, 3º AB', false)).toBeNull();
  });
});

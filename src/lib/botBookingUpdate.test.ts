import { describe, expect, it } from 'vitest';
import { planBookingUpdate } from './botBookingUpdate';

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

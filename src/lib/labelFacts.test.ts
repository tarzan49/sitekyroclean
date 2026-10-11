import { describe, expect, it } from 'vitest';
import { labelFacts, phoneKeysIn, type LabelFactsEvent } from './labelFacts';

// Sunday 11 Oct 2026, 16:00 in Portugal (UTC+1). Invented data only: the repo is public.
const NOW = new Date('2026-10-11T15:00:00Z');
const ev = (start: string | null, summary: string, extra: Partial<LabelFactsEvent> = {}): LabelFactsEvent =>
  ({ summary, description: '', location: '', status: 'CONFIRMED', start, ...extra });
const job = (phone: string) => `Serviço 45€ (89€) Limpeza de sofá 3 lugares - ${phone} - Ana Teste - Rua das Flores 12, 4000-123 Porto`;
const A = '912 345 678';
const B = '913 000 111';

describe('phoneKeysIn', () => {
  it('reads the phone in the formats the owner writes it, and never glues it to the postal code', () => {
    for (const text of [
      job('912 345 678'), job('+351 912 345 678'), job('‪+351 912 345 678‬'), job('912.345.678'),
      job('912-345-678'), job('351912345678'), job('00351 912 345 678'), 'Serviço 2 - 912 345 678 - 4000-123 Porto',
    ]) expect(phoneKeysIn(text), text).toContain('912345678');
  });

  it('reads foreign numbers by their last 9 digits and skips short numbers', () => {
    expect(phoneKeysIn('Serviço - +44 7700 900123 - Rua X')).toContain('700900123');
    expect(phoneKeysIn('Serviço - +33 6 12 34 56 78 - Rua X')).toContain('612345678');
    expect(phoneKeysIn('Serviço - 06.12.34.56.78 - Rua X')).toContain('612345678');
    expect(phoneKeysIn('Serviço 45€ (89€) às 10:00, 4000-123 Porto, lote 12')).toEqual(new Set());
  });

  it('makes no phone out of prices, postal codes, dates and hours', () => {
    expect(phoneKeysIn('Serviço 46€ (92 €) Sofá 3L - Rua 5 de Outubro 120, 4755-186 Barcelos, 12/10/2026 15:00, 2.º esq.')).toEqual(new Set());
    expect(phoneKeysIn('Serviço 60,5€ (121€) 12.10.2026 15h30 - 4755-186')).toEqual(new Set());
    expect(phoneKeysIn('Rua X 12 4755-186 Barcelos, 2026-10-12 15 30')).toEqual(new Set());
  });

  it('reads the phone through HTML spaces, Unicode hyphens and zero-width spaces', () => {
    for (const text of ['Telefone:&nbsp;912&nbsp;345&nbsp;678<br>', '912‑345‑678', '912​345​678', '912 345 678'])
      expect(phoneKeysIn(text), JSON.stringify(text)).toContain('912345678');
  });
});

describe('labelFacts', () => {
  it('gives the latest past service, the next service and the next pre-booking, as Lisbon dates', () => {
    const facts = labelFacts([`+351 ${A}`], [
      ev('2026-09-02T09:00:00Z', job(A)),
      ev('2026-10-01T13:00:00Z', job(A)),
      ev('2026-10-20T09:00:00Z', job(A)),
      ev('2026-10-14T23:30:00Z', job(A)), // 00:30 of the 15th in Portugal
      ev('2026-10-13T10:00:00Z', `Pré-reserva – Ana Teste – Porto – sofá – 89€ – ${A}`),
      ev('2026-10-16T10:00:00Z', `Pre reserva – ${A}`),
    ], NOW);
    expect(facts).toEqual({ '912345678': { past: '2026-10-01', next: '2026-10-15', pending: '2026-10-13' } });
  });

  it('keeps a service that started less than 3 hours ago as booked, not done', () => {
    expect(labelFacts([A], [ev('2026-10-11T13:00:00Z', job(A))], NOW)['912345678'])
      .toEqual({ past: null, next: '2026-10-11', pending: null });
    expect(labelFacts([A], [ev('2026-10-11T11:30:00Z', job(A))], NOW)['912345678'])
      .toEqual({ past: '2026-10-11', next: null, pending: null });
  });

  it('counts "A confirmar · Serviço" as pending, and drops pre-bookings that already passed', () => {
    const facts = labelFacts([A], [
      ev('2026-10-12T14:00:00Z', `A confirmar · ${job(A)}`),
      ev('2026-10-10T14:00:00Z', `Pré-reserva – ${A}`),
    ], NOW);
    expect(facts).toEqual({ '912345678': { past: null, next: null, pending: '2026-10-12' } });
  });

  it('ignores cancelled events and anything that is not a service or a pre-booking', () => {
    const facts = labelFacts([A], [
      ev('2026-10-12T09:00:00Z', job(A), { status: 'CANCELLED' }),
      ev('2026-10-12T09:00:00Z', `Voo Porto - ligar ${A}`),
      ev('2026-10-12T09:00:00Z', `Bloqueio Porto 2 - ${A}`),
      ev('2026-10-12T09:00:00Z', `Limpeza sofá - ${A}`),
      ev('2026-10-12T09:00:00Z', `Serviços pessoais - ${A}`),
      ev('2026-10-12T09:00:00Z', `Equipa Porto 1: Serviço 45€ - ${A}`),
    ], NOW);
    expect(facts).toEqual({});
  });

  it('counts what the CRM and the team calendars count as a service: "Limpeza" with euros too', () => {
    expect(labelFacts([A], [ev('2026-10-12T09:00:00Z', `Limpeza 45€ (89€) sofá - ${A} - Rua X 1`)], NOW)['912345678'])
      .toEqual({ past: null, next: '2026-10-12', pending: null });
    expect(labelFacts([A], [ev('2026-10-12T09:00:00Z', `‪Serviço 45€ (89€) sofá - ${A}`)], NOW)['912345678'])
      .toEqual({ past: null, next: '2026-10-12', pending: null });
    expect(labelFacts([A], [ev('2026-10-12T09:00:00Z', `Pré‑reserva – ${A}`)], NOW)['912345678'])
      .toEqual({ past: null, next: null, pending: '2026-10-12' });
  });

  it('finds the phone in the description or the location, with WhatsApp\'s invisible marks', () => {
    const facts = labelFacts(['351913000111', `${A}`], [
      ev('2026-10-12T09:00:00Z', 'Serviço 30€ (59€) Colchão casal', { description: `Equipa: Porto 1\n\nTelefone: ‪+351 ${B}‬` }),
      ev('2026-09-12T09:00:00Z', 'SERVIÇO 30€ (59€) Colchão', { location: `Rua X 3, Porto (${A})` }),
    ], NOW);
    expect(facts).toEqual({
      '913000111': { past: null, next: '2026-10-12', pending: null },
      '912345678': { past: '2026-09-12', next: null, pending: null },
    });
  });

  it('keeps an all-day service booked for the whole day, done from midnight', () => {
    expect(labelFacts([A], [ev(null, job(A), { startDate: '2026-10-11' })], NOW)['912345678'])
      .toEqual({ past: null, next: '2026-10-11', pending: null });
    expect(labelFacts([A], [ev(null, job(A), { startDate: '2026-10-10' })], NOW)['912345678'])
      .toEqual({ past: '2026-10-10', next: null, pending: null });
  });

  it('answers only for the phones asked that have an event, and never with names, addresses or titles', () => {
    const facts = labelFacts([A, '910 000 000', '12345', 'abc'], [ev('2026-10-12T09:00:00Z', job(A)), ev('2026-10-12T09:00:00Z', job(B))], NOW);
    expect(Object.keys(facts)).toEqual(['912345678']);
    expect(JSON.stringify(facts)).not.toMatch(/Ana|Flores|Porto|Serviço|sofá|€/);
    expect(labelFacts([], [ev('2026-10-12T09:00:00Z', job(A))], NOW)).toEqual({});
  });
});

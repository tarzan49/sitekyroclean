import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from './calendarServices';
import { CALENDAR_SOURCE, planCalendarSync, VAT_HINT, type SyncableRow } from './calendarSync';

const since = '2026-09-26T15:00:00Z';
const now = '2026-09-28T09:00:00Z';

const event = (id: string, extra: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id,
  summary: 'Serviço 45€ (89€) Limpeza de sofá - 912 345 678 - Ana - Rua das Flores 1, 4400-100 Vila Nova de Gaia',
  description: '', location: '', startDate: '2026-10-01',
  created: '2026-09-27T10:00:00Z', updated: '2026-09-27T10:00:00Z', status: 'CONFIRMED', ...extra,
});

const row = (id: string, extra: Partial<SyncableRow> = {}): SyncableRow => ({
  id, city: null, locality: 'Porto', needs_review: null, booked_at: '2026-09-27T10:00:00+00:00',
  calendar_event_id: null, calendar_updated_at: null, calendar_missing_since: null, ...extra,
});

const plan = (rows: SyncableRow[], events: CalendarEvent[]) => planCalendarSync(rows, events, { since, now });

describe('planCalendarSync', () => {
  it('inserts a new service event with the event creation as closing date', () => {
    const { inserts, counts } = plan([], [event('e1')]);
    expect(counts).toEqual({ added: 1, updated: 0, missing: 0, restored: 0 });
    expect(inserts[0]).toMatchObject({
      calendar_event_id: 'e1', booked_at: '2026-09-27T10:00:00Z', calendar_updated_at: '2026-09-27T10:00:00Z',
      request_date: '2026-10-01', billed_value: 89, my_cut: 45, locality: 'Porto', source: CALENDAR_SOURCE, paid: false,
    });
  });

  it('closes on the last change when the event only became a service later (A confirmar, Pré-reserva)', () => {
    const late = event('e1', { created: '2026-10-10T22:02:03Z', updated: '2026-10-11T15:38:14Z' });
    expect(plan([], [late]).inserts[0].booked_at).toBe('2026-10-11T15:38:14Z');
    const repainted = event('e2', { created: '2026-10-10T22:02:03Z', updated: '2026-10-10T22:02:40Z' });
    expect(plan([], [repainted]).inserts[0].booked_at).toBe('2026-10-10T22:02:03Z');
  });

  it('closes a bot booking on creation even when it was edited later (team change)', () => {
    const bot = event('e3', { created: '2026-10-22T19:16:24Z', updated: '2026-10-23T11:29:10Z',
      description: 'Equipa: Coimbra\n\nMarcado pelo bot do WhatsApp numa vaga livre, equipa Coimbra.' });
    expect(plan([], [bot]).inserts[0].booked_at).toBe('2026-10-22T19:16:24Z');
  });

  it('ignores reminders, cancelled events and events created before the start', () => {
    const { inserts } = plan([], [
      event('reminder', { summary: 'Ligar Ana 912 345 678 follow up 89€' }),
      event('cancelled', { status: 'CANCELLED' }),
      event('old', { created: '2026-09-26T13:14:49Z' }),
    ]);
    expect(inserts).toEqual([]);
  });

  it('never recreates a row the owner deleted in the CRM while the event is still in the calendar', () => {
    const result = planCalendarSync([], [event('e1'), event('e2')], { since, now, ignored: new Set(['e1']) });
    expect(result.inserts.map(i => i.calendar_event_id)).toEqual(['e2']);
  });

  it('never inserts an event that is already linked', () => {
    const linked = row('r1', { client_name: 'Ana', calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' });
    expect(plan([linked], [event('e1')])).toMatchObject({ inserts: [], updates: [] });
  });

  it('fills an empty client name without waiting for a calendar edit, and leaves a written one alone', () => {
    const linked = { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' };
    expect(plan([row('r1', { ...linked, client_name: null })], [event('e1')]).updates)
      .toEqual([{ id: 'r1', patch: { client_name: 'Ana' } }]);
    expect(plan([row('r1', { ...linked, client_name: 'Ana Maria' })], [event('e1')]).updates).toEqual([]);
  });

  it('applies an edit made in the calendar after the last sync, but never touches "paid"', () => {
    const linked = row('r1', { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' });
    const edited = event('e1', { updated: '2026-09-27T18:00:00Z', summary: 'Serviço 50€ (99€) Limpeza de sofá - 4400-100 Vila Nova de Gaia' });
    const { updates, counts } = plan([linked], [edited]);
    expect(counts.updated).toBe(1);
    expect(updates[0].patch).toMatchObject({ billed_value: 99, my_cut: 50, calendar_updated_at: '2026-09-27T18:00:00Z' });
    expect(updates[0].patch).not.toHaveProperty('paid');
    expect(updates[0].patch).not.toHaveProperty('source');
  });

  it('marks a synced row whose event disappeared, and unmarks it if it comes back', () => {
    const linked = row('r1', { client_name: 'Ana', calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' });
    const gone = plan([linked], [event('other', { summary: 'Jantar' })]);
    expect(gone.updates).toEqual([{ id: 'r1', patch: { calendar_missing_since: now } }]);
    expect(gone.counts.missing).toBe(1);

    const back = plan([{ ...linked, calendar_missing_since: now }], [event('e1')]);
    expect(back.updates).toEqual([{ id: 'r1', patch: { calendar_missing_since: null } }]);
    expect(back.counts.restored).toBe(1);
  });

  it('treats an event renamed away from "Serviço" as gone', () => {
    const linked = row('r1', { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' });
    expect(plan([linked], [event('e1', { summary: 'Cancelado - Ana sofá', updated: '2026-09-27T20:00:00Z' })]).counts.missing).toBe(1);
  });

  it('does not watch rows linked before the start (backfilled closing dates)', () => {
    const backfilled = row('r1', { calendar_event_id: 'old', booked_at: '2026-08-10T09:00:00+00:00' });
    expect(plan([backfilled], []).updates).toEqual([]);
  });

  it('moves an older linked service that has not happened yet, and keeps everything else the owner typed', () => {
    const old = { created: '2026-09-22T18:54:20Z' };
    const linked = row('r1', {
      client_name: 'Ana Maria', calendar_event_id: 'e1', booked_at: '2026-09-22T18:54:20+00:00',
      request_date: '2026-10-01',
    });
    const moved = plan([linked], [event('e1', { ...old, startDate: '2026-10-16', updated: '2026-09-29T10:43:11Z' })]);
    expect(moved.updates).toEqual([{ id: 'r1', patch: { request_date: '2026-10-16' } }]);
    expect(moved.inserts).toEqual([]);
    // Os valores escritos no CRM ficam, mesmo que o título diga outro.
    expect(plan([linked], [event('e1', { ...old, summary: 'Serviço 55€ (109€) Limpeza de sofá' })]).updates).toEqual([]);
    // Nada muda se já bate certo, nem em serviços que já passaram.
    expect(plan([linked], [event('e1', old)]).updates).toEqual([]);
    const past = { ...linked, request_date: '2026-09-20' };
    expect(plan([past], [event('e1', { ...old, startDate: '2026-09-21' })]).updates).toEqual([]);
    // Um evento antigo sem linha não cria nada: esses foram passados à mão.
    expect(plan([], [event('e2', old)]).inserts).toEqual([]);
  });

  it('uses places the owner already wrote in the CRM', () => {
    const rows = [row('manual', { city: 'Antas', locality: 'Porto' })];
    const { inserts } = plan(rows, [event('e1', { summary: 'Serviço 50€ (100€) Recolha de tapetes Antas' })]);
    expect(inserts[0]).toMatchObject({ locality: 'Porto', needs_review: null });
  });

  it('marks a service from the ads by the "(anúncio)" tag, also when it is added later', () => {
    const ads = 'Serviço 45€ (89€) (anúncio) Limpeza de sofá - 4400-100 Vila Nova de Gaia';
    expect(plan([], [event('e1', { summary: ads })]).inserts[0]).toMatchObject({ source: 'Google Ads', description: 'Limpeza de sofá' });

    const linked = { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00+00:00' };
    const tagged = event('e1', { updated: '2026-09-27T18:00:00Z', summary: ads });
    expect(plan([row('r1', { ...linked, source: CALENDAR_SOURCE })], [tagged]).updates[0].patch).toMatchObject({ source: 'Google Ads' });
    // Uma origem escolhida à mão no CRM não é substituída.
    expect(plan([row('r1', { ...linked, source: 'Referência' })], [tagged]).updates[0].patch).not.toHaveProperty('source');
    // Tirar a marca volta a pôr a origem do calendário.
    const untagged = event('e1', { updated: '2026-09-27T18:00:00Z' });
    expect(plan([row('r1', { ...linked, source: 'Google Ads' })], [untagged]).updates[0].patch).toMatchObject({ source: CALENDAR_SOURCE });
  });

  describe('invoice (owner, 27 Oct: the VAT value has to stay right in the CRM)', () => {
    const linked = { calendar_event_id: 'e1', calendar_updated_at: '2026-09-27T10:00:00Z' };
    const edited = (extra: Partial<CalendarEvent> = {}) => event('e1', { updated: '2026-09-28T08:00:00Z', ...extra });

    it('keeps the value with VAT when the title says the price before VAT', () => {
      // Título "(209€)", CRM 257,07€ (209€ + 48,07€ de IVA por cima).
      const r = row('r1', { ...linked, invoiced: true, billed_value: 257.07, my_cut: 105 });
      const patch = plan([r], [edited({ summary: 'Serviço 105€ (209€) Limpeza de sofá - 912 345 678 - Ana - Rua das Flores 1, 4400-100 Vila Nova de Gaia' })]).updates[0].patch;
      expect(patch).toMatchObject({ billed_value: 257.07, my_cut: 105, needs_review: null });
    });

    it('also with an invoice for part of the service', () => {
      // 159€ no título; o colchão (60€ + IVA = 73,80€) vai na fatura: 172,80€ no CRM.
      const r = row('r1', { ...linked, invoiced: true, billed_value: 172.8, my_cut: 80, invoice_value: 73.8 });
      const patch = plan([r], [edited({ summary: 'Serviço 80€ (159€) Limpeza de sofá - 912 345 678 - Ana - Rua das Flores 1, 4400-100 Vila Nova de Gaia' })]).updates[0].patch;
      expect(patch).toMatchObject({ billed_value: 172.8, my_cut: 80 });
    });

    it('follows a real price change in the calendar and asks to review it', () => {
      const r = row('r1', { ...linked, invoiced: true, billed_value: 89, my_cut: 45 });
      const patch = plan([r], [edited({ summary: 'Serviço 60€ (119€) Limpeza de sofá - 912 345 678 - Ana - Rua das Flores 1, 4400-100 Vila Nova de Gaia' })]).updates[0].patch;
      expect(patch.billed_value).toBe(119);
      expect(patch.needs_review).toContain('Com fatura: o calendário passou a dizer 119€ e o CRM tinha 89€');
    });

    it('a new service whose event talks about an invoice is left to review, never marked on its own', () => {
      const insert = plan([], [event('e1', { description: 'Fatura com NIF 500000000; total 98,10€ + IVA.' })]).inserts[0];
      expect(insert.needs_review).toBe(VAT_HINT);
      expect('invoiced' in insert).toBe(false);
    });

    it('an existing row without invoice is flagged when the event starts talking about VAT', () => {
      const r = row('r1', { ...linked, billed_value: 148, my_cut: 74 });
      const patch = plan([r], [edited({ description: 'Nota: Valor de 148€ sem IVA. Com fatura fica em 182,04€.' })]).updates[0].patch;
      expect(patch.needs_review).toBe(VAT_HINT);
      // Palavras que só contêm as letras (positiva, motivo) não contam.
      const quiet = plan([r], [edited({ description: 'Avaliação positiva, sem motivo de queixa.' })]).updates[0].patch;
      expect(quiet.needs_review).toBeNull();
    });

    it('no flag when the row already has the invoice', () => {
      const r = row('r1', { ...linked, invoiced: true, billed_value: 89, my_cut: 45 });
      expect(plan([r], [edited({ description: 'Fatura em nome da empresa.' })]).updates[0].patch.needs_review).toBeNull();
    });
  });
});

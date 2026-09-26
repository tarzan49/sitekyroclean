import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { parseIcs } from './ics.ts';

const enc = new TextEncoder();

const calendar = (...events: string[]) => [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Copenhagen',
  'END:VTIMEZONE',
  ...events,
  'END:VCALENDAR',
  '',
].join('\r\n');

const event = (lines: string[]) => ['BEGIN:VEVENT', ...lines, 'END:VEVENT'].join('\r\n');

Deno.test('reads a Google Calendar event', () => {
  const { events, totalEvents } = parseIcs(calendar(event([
    'DTSTART;TZID=Europe/Copenhagen:20260926T143000',
    'DTEND;TZID=Europe/Copenhagen:20260926T153000',
    'UID:jfnp0o03vb7q0bevcvf2q2v0fs@google.com',
    'CREATED:20260926T091529Z',
    'LAST-MODIFIED:20260926T091707Z',
    'STATUS:CONFIRMED',
    'SUMMARY:Serviço 70€ (140€) Limpeza sofá - 933 621 863 - Rua X\\, 8\\n2835-683 Charneca',
  ])));
  assertEquals(totalEvents, 1);
  assertEquals(events, [{
    id: 'jfnp0o03vb7q0bevcvf2q2v0fs',
    summary: 'Serviço 70€ (140€) Limpeza sofá - 933 621 863 - Rua X, 8\n2835-683 Charneca',
    description: '',
    location: '',
    startDate: '2026-09-26',
    created: '2026-09-26T09:15:29Z',
    updated: '2026-09-26T09:17:07Z',
    status: 'CONFIRMED',
  }]);
});

Deno.test('unfolds a line cut in the middle of a UTF-8 character', () => {
  const head = enc.encode(calendar(event([
    'DTSTART;VALUE=DATE:20261001',
    'UID:a@google.com',
    'CREATED:20260926T100000Z',
    'SUMMARY:Servi',
  ])).split('SUMMARY:Servi')[0] + 'SUMMARY:Servi');
  // "ç" é 0xC3 0xA7; o Google pode dobrar a linha entre os dois octetos.
  const tail = enc.encode('o 45€\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n');
  const bytes = new Uint8Array([...head, 0xc3, 0x0d, 0x0a, 0x20, 0xa7, ...tail]);
  const { events } = parseIcs(bytes);
  assertEquals(events[0].summary, 'Serviço 45€');
  assertEquals(events[0].startDate, '2026-10-01');
  assertEquals(events[0].updated, '2026-09-26T10:00:00Z');
});

Deno.test('UTC start times resolve to the Lisbon day', () => {
  const { events } = parseIcs(calendar(event([
    'DTSTART:20260926T233000Z',
    'UID:b@google.com',
    'CREATED:20260920T100000Z',
    'SUMMARY:Serviço 10€',
  ])));
  assertEquals(events[0].startDate, '2026-09-27');
});

Deno.test('recurring events and their exceptions are left out but still counted', () => {
  const { events, totalEvents } = parseIcs(calendar(
    event(['DTSTART:20260901T090000Z', 'RRULE:FREQ=WEEKLY', 'UID:c@google.com', 'CREATED:20260801T100000Z', 'SUMMARY:Aula']),
    event(['DTSTART:20260908T090000Z', 'RECURRENCE-ID:20260908T090000Z', 'UID:c@google.com', 'CREATED:20260801T100000Z', 'SUMMARY:Aula']),
    event(['DTSTART:20260910T090000Z', 'UID:d@google.com', 'CREATED:20260801T100000Z', 'STATUS:CANCELLED', 'SUMMARY:Serviço 20€']),
  ));
  assertEquals(totalEvents, 3);
  assertEquals(events.map(e => [e.id, e.status]), [['d', 'CANCELLED']]);
});

Deno.test('a colon inside a quoted parameter does not split the value', () => {
  const { events } = parseIcs(calendar(event([
    'DTSTART;TZID="Europe/Lisbon:x":20261002T150000',
    'UID:e@google.com',
    'CREATED:20260925T100000Z',
    'SUMMARY:Serviço 50€ (99€)',
  ])));
  assertEquals(events[0].startDate, '2026-10-02');
});

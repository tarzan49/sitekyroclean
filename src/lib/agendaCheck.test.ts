import { describe, expect, it } from 'vitest';
import { agendaCheck } from './agendaCheck';
import type { AvailabilityEvent } from './botAvailability';

// Thursday 8 Oct 2026, 19:00 in Portugal (UTC+1). Invented data only: the repo is public.
const NOW = new Date('2026-10-08T18:00:00Z');
const TOMORROW = '2026-10-09';
const at = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00+01:00`).toISOString();
const ev = (from: string, to: string, summary: string, team?: string, date = TOMORROW): AvailabilityEvent =>
  ({ summary, description: team ? `Equipa: ${team}\n\nnotas` : '', status: 'CONFIRMED', start: at(date, from), end: at(date, to) });
const GOOD = 'Serviço 45€ (89€) Limpeza de sofá 3 lugares - 912 345 678 - Ana Teste - Rua das Flores 12, 4000-123 Porto';

describe('agendaCheck', () => {
  it('finds nothing wrong in a well formed day', () => {
    const r = agendaCheck([ev('10:00', '11:00', GOOD, 'Porto 2'), ev('14:00', '15:00', GOOD, 'Porto 2')], TOMORROW, NOW);
    expect(r.services).toHaveLength(2);
    expect(r.issues).toEqual([]);
    expect(r.day).toBe('amanhã (sexta)');
    expect(r.message).toContain('Nada a corrigir');
  });

  it('flags a service without team, phone or street', () => {
    const r = agendaCheck([ev('10:00', '11:00', 'Serviço 30€ (59€) Colchão casal - Ana Teste - Porto')], TOMORROW, NOW);
    expect(r.issues.map(i => i.problem)).toEqual([
      'sem equipa escolhida (falta a cor)', 'sem telefone', 'morada sem rua e número nem código postal',
    ]);
    expect(r.issues[0].what).toBe('Colchão casal');
  });

  it('never puts the client name, phone or address in the report', () => {
    const r = agendaCheck([ev('10:00', '11:00', GOOD.replace(' - Rua das Flores 12, 4000-123 Porto', ''))], TOMORROW, NOW);
    expect(r.message).not.toMatch(/Ana Teste|912 345 678|Flores/);
    expect(JSON.stringify(r)).not.toMatch(/Ana Teste|912 345 678|Flores/);
  });

  it('flags two jobs at once for a one-person team, not for a two-person team', () => {
    const one = agendaCheck([ev('10:00', '11:00', GOOD, 'Porto 2'), ev('10:30', '11:30', GOOD, 'Porto 2')], TOMORROW, NOW);
    expect(one.issues.filter(i => i.problem.includes('mesma hora'))).toHaveLength(2);
    const two = agendaCheck([ev('10:00', '11:00', GOOD, 'Porto 1'), ev('10:30', '11:30', GOOD, 'Porto 1')], TOMORROW, NOW);
    expect(two.issues).toEqual([]);
  });

  it('flags too little travel time and hours outside 10h-21h', () => {
    const r = agendaCheck([ev('09:00', '10:00', GOOD, 'Braga'), ev('10:10', '11:00', GOOD, 'Braga')], TOMORROW, NOW);
    expect(r.issues.map(i => `${i.time} ${i.problem}`)).toEqual([
      '9h fora do horário (10h às 21h)', '10h10 menos de 30 min de viagem desde o serviço anterior',
    ]);
  });

  it('flags a job on top of a team block and ignores the owner\'s own appointments', () => {
    const r = agendaCheck([
      ev('09:00', '18:00', 'Bloqueio Lisboa 2', 'Lisboa 2'),
      ev('15:00', '16:00', GOOD, 'Lisboa 2'),
      ev('15:00', '16:00', 'Jantar com amigos'),
    ], TOMORROW, NOW);
    expect(r.services).toHaveLength(1);
    expect(r.issues.map(i => i.problem)).toEqual(['a equipa tem um bloqueio a essa hora']);
  });

  it('lists open pre-bookings and "A confirmar" of the next days, by time and region only', () => {
    const r = agendaCheck([
      ev('11:00', '12:00', 'Pré-reserva – Rui Teste – Matosinhos – sofá – 89€'),
      ev('16:00', '17:00', `A confirmar · ${GOOD}`, undefined, '2026-10-12'),
      ev('16:00', '17:00', 'Pré-reserva – velha – Porto', undefined, '2026-10-01'),
    ], TOMORROW, NOW);
    expect(r.pending).toEqual([
      { day: 'amanhã (sexta)', time: '11h', kind: 'Pré-reserva', region: 'Porto' },
      { day: 'segunda (dia 12)', time: '16h', kind: 'A confirmar', region: 'Porto' },
    ]);
    expect(r.message).not.toContain('Rui Teste');
  });

  it('accepts a free redo without a value and ignores team events that are not blocks', () => {
    const r = agendaCheck([
      ev('15:00', '16:00', 'Serviço RETIFICAÇÃO GRATUITA (sem custo, não cobrar) - 912 345 678 - Ana Teste - Rua X 3, Porto', 'Porto 2'),
      ev('14:00', '18:00', 'Entrega de tapetes', 'Porto 2'),
    ], TOMORROW, NOW);
    expect(r.issues).toEqual([]);
  });

  it('ignores cancelled and all-day events', () => {
    const r = agendaCheck([
      { ...ev('10:00', '11:00', GOOD, 'Porto 2'), status: 'CANCELLED' },
      { summary: GOOD, description: '', status: 'CONFIRMED', start: null, end: null },
    ], TOMORROW, NOW);
    expect(r.services).toEqual([]);
  });
});

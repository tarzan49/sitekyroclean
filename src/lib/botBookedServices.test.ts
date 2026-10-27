import { describe, expect, it } from 'vitest';
import { bookedServices } from './botBookedServices';

const ev = (start: string, summary: string, description = '') => ({ id: summary, start, end: start, summary, description }) as any;
const now = new Date('2026-10-15T19:00:00Z');

describe('bookedServices', () => {
  it('finds the client service by phone, in Lisbon time, without other clients', () => {
    const r = bookedServices('+351 965 540 640', [
      ev('2026-10-17T08:30:00Z', 'Serviço 108€ (215€) Impermeabilização Premium de 8 cadeiras - 965540640 - Adriana - Rua X'),
      ev('2026-10-17T09:00:00Z', 'Serviço 45€ (89€) Limpeza de sofá - 911111222 - Outra - Rua Y'),
      ev('2026-10-01T09:00:00Z', 'Serviço 45€ (89€) Limpeza de sofá - 965540640 - Adriana - antigo'),
    ], now);
    expect(r.map(({ date, time, kind, service }) => ({ date, time, kind, service }))).toEqual([{ date: '2026-10-17', time: '9h30', kind: 'serviço', service: 'Impermeabilização Premium de 8 cadeiras' }]);
    expect(r[0].id).toContain('Serviço 108€');
  });
  it('reads "A confirmar" and pré-reservas, and the phone in the description', () => {
    const r = bookedServices('351920529136', [
      ev('2026-10-16T13:00:00Z', 'A confirmar · Serviço ?€ (?€) Limpeza de sofá de 3 lugares - +351 920 529 136'),
      ev('2026-10-18T09:00:00Z', 'Pré-reserva – Ana – Porto – sofá – 89€', 'bot:351920529136@s.whatsapp.net'),
    ], now);
    expect(r.map(x => [x.kind, x.time])).toEqual([['a confirmar', '14h'], ['pré-reserva', '10h']]);
    expect(r[0].service).toBe('Limpeza de sofá de 3 lugares');
  });
  it('passes on when the event was created, and leaves it out when the event has none', () => {
    const r = bookedServices('351912345678', [
      { ...ev('2026-10-28T09:00:00Z', 'Serviço 89€ (89€) Limpeza de sofá - 912345678 - Juliana'), created: '2026-10-25T14:02:11Z' },
      { ...ev('2026-10-29T09:00:00Z', 'Pré-reserva – Juliana – Porto – sofá – 89€'), description: 'bot:351912345678@s.whatsapp.net' },
    ], now);
    expect(r.map(x => x.created)).toEqual(['2026-10-25T14:02:11Z', undefined]);
    expect('created' in r[1]).toBe(false);
  });
});

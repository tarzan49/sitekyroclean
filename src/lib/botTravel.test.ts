import { describe, expect, it } from 'vitest';
import { chooseTeam, teamBusyAt } from './botAvailability';
import { driveMinutes, CITY_COORDS } from '../constants/cityCoords';

const ev = (summary: string, team: string, start: string, end: string) =>
  ({ id: summary, summary, description: `Equipa: ${team}`, start, end, status: 'CONFIRMED' }) as never;

describe('travel logistics', () => {
  it('estimates driving time from town to town', () => {
    expect(driveMinutes(CITY_COORDS['Porto'], CITY_COORDS['Matosinhos'])).toBeLessThan(25);
    expect(driveMinutes(CITY_COORDS['Porto'], CITY_COORDS['Penafiel'])).toBeGreaterThan(45);
  });
  it('a far job right after another does not fit without the drive', () => {
    // Braga team: job in Viana do Castelo until 11h Lisbon (10h UTC); Fafe at 11h30 is ~1h away.
    const events = [ev('Serviço 50€ (99€) Limpeza - Rua X, Viana do Castelo', 'Braga', '2026-11-04T09:00:00Z', '2026-11-04T11:00:00Z')];
    expect(teamBusyAt(events, 'Braga', '2026-11-04T11:30:00Z', '2026-11-04T12:30:00Z', true, 'Fafe')).toBe(true);
    expect(teamBusyAt(events, 'Braga', '2026-11-04T12:30:00Z', '2026-11-04T13:30:00Z', true, 'Fafe')).toBe(false);
    expect(chooseTeam(events, 'Fafe', '2026-11-04T11:30:00Z', '2026-11-04T12:30:00Z')).toBeNull();
  });
});

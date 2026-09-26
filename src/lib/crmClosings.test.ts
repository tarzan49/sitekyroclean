import { describe, expect, it } from 'vitest';
import { addDays, lisbonDay, summarizeClosings, weekdayOf } from './crmClosings';

describe('calendar helpers', () => {
  it('counts the day in Lisbon, not in UTC or Copenhagen', () => {
    expect(lisbonDay('2026-09-26T22:30:00Z')).toBe('2026-09-26'); // 23:30 em Lisboa (verão)
    expect(lisbonDay('2026-09-26T23:30:00Z')).toBe('2026-09-27');
    expect(lisbonDay('2026-12-01T23:30:00Z')).toBe('2026-12-01'); // inverno, UTC+0
  });

  it('walks days across the daylight-saving change', () => {
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('starts the week on Monday', () => {
    expect(weekdayOf('2026-09-28')).toBe(0); // segunda
    expect(weekdayOf('2026-09-26')).toBe(5); // sábado
    expect(weekdayOf('2026-09-27')).toBe(6); // domingo
  });
});

describe('summarizeClosings', () => {
  const rows = [
    { booked_at: '2026-09-26T09:15:29Z', billed_value: 140, my_cut: 70 },
    { booked_at: '2026-09-26T12:08:16+00:00', billed_value: 75, my_cut: 37.5 },
    { booked_at: '2026-09-21T10:00:00Z', billed_value: 89, my_cut: 45 },
    { booked_at: '2026-08-01T10:00:00Z', billed_value: 50, my_cut: 25 }, // fora do período
    { booked_at: null, billed_value: 60, my_cut: 30 },
  ];

  it('totals each day, including the days with no closings', () => {
    const s = summarizeClosings(rows, '2026-09-20', '2026-09-26');
    expect(s.perDay).toHaveLength(7);
    expect(s.perDay.find(d => d.day === '2026-09-26')).toEqual({ day: '2026-09-26', count: 2, billed: 215, cut: 107.5 });
    expect(s.perDay.find(d => d.day === '2026-09-22')?.count).toBe(0);
    expect(s).toMatchObject({ count: 3, billed: 304, cut: 152.5, withoutDate: 1 });
  });

  it('averages each weekday over how many times it falls in the period', () => {
    // 21/09 a 04/10: duas semanas certas, cada dia aparece 2 vezes.
    const s = summarizeClosings(rows, '2026-09-21', '2026-10-04');
    const saturday = s.byWeekday[5];
    expect(saturday).toMatchObject({ count: 2, occurrences: 2, average: 1 });
    expect(s.byWeekday[0]).toMatchObject({ count: 1, occurrences: 2, average: 0.5 });
    expect(s.byWeekday[2]).toMatchObject({ count: 0, occurrences: 2, average: 0 });
  });
});

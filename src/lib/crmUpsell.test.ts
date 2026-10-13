import { describe, expect, it } from 'vitest';
import { defaultTeamFor, ownerUpsellOf, splitUpsell, summarizeUpsells, teamShareOf, UPSELL_TEAMS } from './crmUpsell';

describe('upsell split', () => {
  it('gives Porto teams 60/40 and the others 70/30', () => {
    expect(splitUpsell(50, 'Porto 1')).toEqual({ team: 30, owner: 20 });
    expect(splitUpsell(50, 'Porto 2')).toEqual({ team: 30, owner: 20 });
    expect(splitUpsell(50, 'Lisboa 1')).toEqual({ team: 35, owner: 15 });
    expect(splitUpsell(50, 'Algarve')).toEqual({ team: 35, owner: 15 });
  });

  it('always gives the team the larger share', () => {
    for (const team of UPSELL_TEAMS) expect(teamShareOf(team)).toBeGreaterThan(0.5);
  });

  it('keeps the two parts adding up to the value', () => {
    const s = splitUpsell(33.33, 'Braga');
    expect(s.team + s.owner).toBeCloseTo(33.33, 2);
  });

  it('proposes the first team of the region', () => {
    expect(defaultTeamFor('Lisboa')).toBe('Lisboa 1');
    expect(defaultTeamFor('Braga')).toBe('Braga');
    expect(defaultTeamFor(null)).toBe('Porto 1');
  });
});

describe('summarizeUpsells', () => {
  it('totals by team and skips rows without upsell', () => {
    const s = summarizeUpsells([
      { upsell_value: 40, upsell_team: 'Porto 2', locality: 'Porto' },
      { upsell_value: 20, upsell_team: null, locality: 'Lisboa' },
      { upsell_value: 0, upsell_team: 'Braga', locality: 'Braga' },
      { upsell_value: null, upsell_team: null, locality: 'Porto' },
    ]);
    expect(s.teams.map(t => t.team)).toEqual(['Porto 2', 'Lisboa 1']);
    expect(s).toMatchObject({ count: 2, value: 60, teamPart: 38, ownerPart: 22 });
  });
});

describe('ownerUpsellOf', () => {
  it('is the owner part, using the region team when none is set', () => {
    expect(ownerUpsellOf({ upsell_value: 50, upsell_team: 'Porto 1', locality: 'Porto' })).toBe(20);
    expect(ownerUpsellOf({ upsell_value: 50, upsell_team: null, locality: 'Lisboa' })).toBe(15);
    expect(ownerUpsellOf({ upsell_value: null, upsell_team: null, locality: 'Porto' })).toBe(0);
  });
});

describe('tiered split from 19/10/2026 (guião das equipas)', () => {
  it('70% of the first 100€ and 60% above, the same in every team, Porto included', () => {
    expect(splitUpsell(50, 'Porto 1', '2026-10-19')).toEqual({ team: 35, owner: 15 });
    expect(splitUpsell(150, 'Porto 2', '2026-10-20')).toEqual({ team: 100, owner: 50 });
    expect(splitUpsell(110, 'Lisboa 1', '2026-11-02')).toEqual({ team: 76, owner: 34 });
  });
  it('services before 19/10 keep the old rule', () => {
    expect(splitUpsell(50, 'Porto 1', '2026-10-18')).toEqual({ team: 30, owner: 20 });
    expect(ownerUpsellOf({ upsell_value: 150, upsell_team: 'Lisboa 1', locality: 'Lisboa', request_date: '2026-10-10' })).toBe(45);
    expect(ownerUpsellOf({ upsell_value: 150, upsell_team: 'Lisboa 1', locality: 'Lisboa', request_date: '2026-10-21' })).toBe(50);
  });
});

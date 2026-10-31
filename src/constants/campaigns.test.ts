import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isBlackFriday } from './campaigns';
import { calculateTravelFee } from './travel';
import { priceWithPackPerks } from './packPerks';

describe('isBlackFriday', () => {
  it('vale de sexta 27/11 a segunda 30/11, hora de Lisboa', () => {
    expect(isBlackFriday(new Date('2026-11-26T23:59:59Z'))).toBe(false);
    expect(isBlackFriday(new Date('2026-11-27T00:00:00Z'))).toBe(true);
    expect(isBlackFriday(new Date('2026-11-30T23:59:59Z'))).toBe(true);
    expect(isBlackFriday(new Date('2026-12-01T00:00:00Z'))).toBe(false);
  });

  it('fica desligada nos testes sem data', () => {
    expect(isBlackFriday()).toBe(false);
  });
});

describe('o motor na Black Friday', () => {
  let env: string | undefined;
  beforeEach(() => {
    env = process.env.KYRO_CAMPAIGNS;
    delete process.env.KYRO_CAMPAIGNS;
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    process.env.KYRO_CAMPAIGNS = env;
  });

  it('a deslocação fica por nossa conta', () => {
    vi.setSystemTime(new Date('2026-11-28T15:00:00Z'));
    expect(calculateTravelFee(15, 79)).toBe(0);
    vi.setSystemTime(new Date('2026-12-02T15:00:00Z'));
    expect(calculateTravelFee(15, 79)).toBe(15);
  });

  it('o preço de pack vale abaixo dos 100€', () => {
    const lines = [
      { kind: 'sofa', sizeId: '1-lugar', qty: 1, tablePrice: 49 },
      { kind: 'mattress', qty: 1, tablePrice: 39 },
    ];
    vi.setSystemTime(new Date('2026-11-28T15:00:00Z'));
    const bf = priceWithPackPerks(lines);
    vi.setSystemTime(new Date('2026-12-02T15:00:00Z'));
    const normal = priceWithPackPerks(lines);
    expect(JSON.stringify(bf)).not.toBe(JSON.stringify(normal));
    expect(JSON.stringify(normal)).toContain('"perkApplied":false');
    expect(JSON.stringify(bf)).toContain('"perkApplied":true');
  });
});

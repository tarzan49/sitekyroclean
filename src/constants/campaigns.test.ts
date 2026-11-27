import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isBlackFriday } from './campaigns';
import { calculateTravelFee } from './travel';
import { botQuote } from '../lib/botQuote';

describe('isBlackFriday', () => {
  it('vale de sexta 27/11 a segunda 30/11, hora de Lisboa', () => {
    expect(isBlackFriday(new Date('2026-11-26T23:59:59Z'), true)).toBe(false);
    expect(isBlackFriday(new Date('2026-11-27T00:00:00Z'), true)).toBe(true);
    expect(isBlackFriday(new Date('2026-11-30T23:59:59Z'), true)).toBe(true);
    expect(isBlackFriday(new Date('2026-12-01T00:00:00Z'), true)).toBe(false);
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

  it('com a janela desligada (dono, 27 Nov), a deslocação paga-se a 27/11 como num dia normal', () => {
    vi.setSystemTime(new Date('2026-11-28T15:00:00Z'));
    expect(isBlackFriday()).toBe(false);
    expect(calculateTravelFee(10, 69)).toBe(10);
    const q = botQuote({ city: 'Coimbra', items: [{ kind: 'mattress', size: 'casal', qty: 1, treatment: 'clean' }] }) as { total?: number };
    expect(q.total).toBe(79);
  });
});

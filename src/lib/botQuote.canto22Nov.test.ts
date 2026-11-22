import { describe, it, expect } from 'vitest';
import { botQuote } from './botQuote';

describe('sofá de canto, impermeabilização sozinha (dono, 22 Nov 2026)', () => {
  it('Premium 199€ e Essencial 139€ com a deslocação incluída', () => {
    for (const [treatment, total] of [['premium', 199], ['essencial', 139]] as const) {
      const q = botQuote({ city: 'Viana do Castelo', items: [{ kind: 'sofa', size: 'canto', treatment }] }) as any;
      expect(q.total).toBe(total);
    }
  });
});

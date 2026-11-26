import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';

// Tabela de sofás do dono (22 Nov 2026, Rosângela), peça sozinha em Viana do Castelo: serviço + 10€ de deslocação (dono, 26 Nov 2026); 200€ ou mais sem deslocação (dono, 26 Nov 2026, Sesimbra).
const sizes = {
  '3L': { size: '3-lugares' },
  '4L': { size: '4-lugares' },
  '5L': { size: '5-lugares', seats: 5 },
  '6L': { size: '5-lugares', seats: 6, look: 'compacto' },
} as const;
const table: Record<keyof typeof sizes, Record<string, number>> = {
  '3L': { clean: 99, premium: 169, essencial: 109, 'clean+premium': 219, 'clean+essencial': 159 },
  '4L': { clean: 119, premium: 199, essencial: 139, 'clean+premium': 269, 'clean+essencial': 209 },
  '5L': { clean: 129, premium: 219, essencial: 169, 'clean+premium': 309, 'clean+essencial': 249 },
  '6L': { clean: 139, premium: 249, essencial: 199, 'clean+premium': 349, 'clean+essencial': 289 },
};

describe('tabela de sofás 22 Nov 2026', () => {
  for (const [name, cells] of Object.entries(table)) for (const [treatment, total] of Object.entries(cells)) {
    it(`${name} ${treatment} = ${total}€`, () => {
      const q = botQuote({ city: 'Viana do Castelo', items: [{ kind: 'sofa', ...sizes[name as keyof typeof sizes], treatment }] }) as { ok: boolean; total: number; quote: boolean };
      expect(q.ok).toBe(true);
      expect(q.quote).toBe(false);
      expect(q.total).toBe(total);
    });
  }
});

import { describe, it, expect } from 'vitest';
import { depositFor } from './commercialPolicy';
describe('depositFor', () => {
  it('só acima de 2 semanas', () => { expect(depositFor(300, 14)).toBe(0); expect(depositFor(300, 15)).toBe(50); });
  it('mínimo 20€, dezena', () => { expect(depositFor(89, 30)).toBe(20); expect(depositFor(219, 30)).toBe(30); expect(depositFor(450, 30)).toBe(70); });
});

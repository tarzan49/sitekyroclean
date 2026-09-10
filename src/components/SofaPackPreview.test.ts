import { describe, expect, it } from 'vitest';
import { previewPackPrice } from './SofaPackPreview';

describe('local pack proposal', () => {
  it('discounts services only and explains the actual extra cost', () => {
    expect(previewPackPrice(79, 69, 10)).toEqual({ saving: 14.8, total: 143.2, additional: 54.2 });
    expect(previewPackPrice(79, 69, 25)).toEqual({ saving: 14.8, total: 158.2, additional: 54.2 });
  });
  it('updates the extra and total when the mattress size changes', () => {
    expect(previewPackPrice(79, 59, 10)).toEqual({ saving: 13.8, total: 134.2, additional: 45.2 });
    expect(previewPackPrice(79, 79, 10)).toEqual({ saving: 15.8, total: 152.2, additional: 63.2 });
  });
});

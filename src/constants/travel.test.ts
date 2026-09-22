import { describe, expect, it } from 'vitest';
import { calculateTravelFee } from './travel';

describe('automatic free travel', () => {
  it.each([
    [10, 119.99, 10], [10, 120, 10], [10, 120.01, 0],
    [15, 134.99, 15], [15, 135, 15], [15, 135.01, 0],
    [20, 149.99, 20], [20, 150, 0], [20, 150.01, 0],
    [25, 500, 25], [0, 500, 0], [10, 0, 10], [10, NaN, 10],
  ])('base %s on services %s results in %s', (base, subtotal, expected) => {
    expect(calculateTravelFee(base, subtotal)).toBe(expected);
  });
});

import { describe, expect, it } from 'vitest';
import { matchServiceCity } from './locationDetection';

describe('service locality matching', () => {
  it('uses the canonical priced locality with accent-insensitive matching', () => {
    expect(matchServiceCity({ countryCode: 'PT', city: 'Povoa de Varzim' })).toBe('Póvoa de Varzim');
  });
  it('does not assume a foreign city with the same name is in Portugal', () => {
    expect(matchServiceCity({ countryCode: 'ES', city: 'Gondomar' })).toBeUndefined();
  });
  it('does not substitute an unserved town with its district', () => {
    expect(matchServiceCity({ countryCode: 'PT', city: 'Baião' })).toBeUndefined();
  });
});

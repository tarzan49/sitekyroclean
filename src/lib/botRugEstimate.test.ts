import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';
import { rugEstimate, rugMaterialClass, roundToNine } from './botRugEstimate';

describe('rugEstimate (owner, 10 Oct 2026)', () => {
  it("matches the owner's own rug quotes", () => {
    const sandra = rugEstimate([{ width: 2, length: 2.9, qty: 1, material: 'microfibra' }], 'Póvoa de Varzim');
    expect(sandra.ok && [sandra.homePrice, sandra.pickupPrice, sandra.sofaUpsellPrice, sandra.sofaUsualPrice]).toEqual([69, 89, 70, 89]);
    const liliana = rugEstimate([{ width: 3, length: 2.5, qty: 1, material: 'juta' }], 'Vila Nova de Gaia');
    expect(liliana.ok && [liliana.homePrice, liliana.pickupPrice]).toEqual([99, 119]);
    const sonia = rugEstimate([{ width: 2.5, length: 3.5, qty: 1, material: 'Juta' }], 'Vila Nova de Gaia');
    expect(sonia.ok && sonia.homePrice).toBe(119);
  });

  it('adds the site pickup fee (20€) where a pickup exists, and no pickup above 20 m²', () => {
    const r = rugEstimate([{ width: 2, length: 2.9, qty: 1, material: 'microfibra' }], 'Porto');
    expect(r.ok && [r.pickupFee, r.pickupPrice]).toEqual([20, 89]);
    const big = rugEstimate([{ width: 4, length: 6, qty: 1, material: 'sintético' }], 'Porto');
    expect(big.ok && big.pickupPrice).toBeNull();
  });

  it('leaves delicate rugs, small orders and unknown places to the owner', () => {
    expect(rugEstimate([{ width: 2, length: 3, qty: 1, material: 'lã' }], 'Porto').ok).toBe(false);
    expect(rugEstimate([{ width: 2, length: 3, qty: 1, material: 'persa feito à mão' }], 'Porto').ok).toBe(false);
    expect(rugEstimate([{ width: 1, length: 2, qty: 1 }], 'Porto').ok).toBe(false);
    expect(rugEstimate([{ width: 2, length: 3, qty: 1 }], null).ok).toBe(false);
  });

  it('no material, no price: the bot must read it from the photo or ask', () => {
    const r = rugEstimate([{ width: 2, length: 3, qty: 1 }], 'Porto');
    expect(r.ok).toBe(false);
    expect(!r.ok && r.needsMaterial).toBe(true);
    expect(rugEstimate([{ width: 2, length: 3, qty: 1, material: ' ' }, { width: 2, length: 3, qty: 1, material: 'juta' }], 'Porto').ok).toBe(false);
  });

  it('classifies materials and rounds to 9', () => {
    expect(rugMaterialClass('Sisal natural')).toBe('natural');
    expect(rugMaterialClass('viscose')).toBe('delicate');
    expect(rugMaterialClass('poliéster')).toBe('common');
    expect(rugMaterialClass(undefined)).toBe('common');
    expect([68, 100, 115, 85].map(roundToNine)).toEqual([69, 99, 119, 89]);
  });

  it('botQuote prices rugs-only orders itself and keeps mixed orders with the owner', () => {
    const rugs = botQuote({ items: [{ kind: 'rug', width: 200, length: 290, material: 'microfibra' }], city: 'Póvoa de Varzim' });
    expect('ok' in rugs && rugs.ok && rugs.handToOwner).toBe(false);
    expect('ok' in rugs && rugs.ok && rugs.rugEstimate?.ok && rugs.rugEstimate.homePrice).toBe(69);
    const mixed = botQuote({ items: [{ kind: 'rug', width: 2, length: 3 }, { kind: 'sofa', size: '3-lugares' }], city: 'Porto' });
    expect('ok' in mixed && mixed.ok && mixed.handToOwner).toBe(true);
    expect('ok' in mixed && mixed.ok && mixed.rugEstimate).toBeNull();
  });
});

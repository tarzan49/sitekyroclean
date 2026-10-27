import { describe, expect, it } from 'vitest';
import { invoiceStatusOf, invoiceVatOf, priceBeforeVatOf, serviceVatOf } from './invoiceVat';

describe('invoiceVat', () => {
  it('VAT is inside the value, 23%', () => {
    expect(serviceVatOf({ billed_value: 79, invoiced: true })).toBe(14.77);
    // IVA por cima: o valor do CRM já é o total (209€ + 48,07€).
    expect(serviceVatOf({ billed_value: 257.07, invoiced: true })).toBe(48.07);
  });

  it('no invoice, no VAT', () => {
    expect(serviceVatOf({ billed_value: 79, invoiced: false })).toBe(0);
    expect(invoiceVatOf({ billed_value: 79, invoiced: false, upsell_value: 50 })).toBe(0);
  });

  it('an invoice for part of the service has the VAT of that part only', () => {
    expect(serviceVatOf({ billed_value: 172.8, invoiced: true, invoice_value: 73.8 })).toBe(13.8);
    // Nunca mais do que o serviço inteiro.
    expect(serviceVatOf({ billed_value: 79, invoiced: true, invoice_value: 500 })).toBe(14.77);
  });

  it('the upsell goes on the same invoice', () => {
    // 729€ + 100€ de upsell: 829€, IVA 155,02€.
    expect(invoiceVatOf({ billed_value: 729, invoiced: true, upsell_value: 100 })).toBe(155.02);
  });

  it('status: none, to issue, issued', () => {
    expect(invoiceStatusOf({ billed_value: 79, invoiced: false })).toBe('none');
    expect(invoiceStatusOf({ billed_value: 79, invoiced: true })).toBe('to_issue');
    expect(invoiceStatusOf({ billed_value: 79, invoiced: true, invoice_issued_on: '2026-10-28' })).toBe('issued');
  });

  it('VAT on top: the agreed price is the value minus the VAT', () => {
    expect(priceBeforeVatOf({ billed_value: 257.07, invoiced: true, vat_on_top: true })).toBe(209);
    // Só o colchão com IVA por cima: 159€ + 13,80€.
    expect(priceBeforeVatOf({ billed_value: 172.8, invoiced: true, invoice_value: 73.8, vat_on_top: true })).toBe(159);
  });
});

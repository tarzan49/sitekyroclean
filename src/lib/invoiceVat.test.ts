import { describe, expect, it } from 'vitest';
import { invoiceStatusOf, invoiceVatOf, ownerServiceCutWithoutVat, priceBeforeVatOf, serviceVatOf, upsellWithoutVatOf, vatToDeliverOf } from './invoiceVat';

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

  it('VAT to deliver: only company invoices, never Francisco\'s (already delivered)', () => {
    expect(vatToDeliverOf({ billed_value: 123, invoiced: true, invoice_by: 'Empresa' })).toBe(23);
    expect(vatToDeliverOf({ billed_value: 123, invoiced: true, invoice_by: 'Francisco' })).toBe(0);
    expect(vatToDeliverOf({ billed_value: 123, invoiced: false })).toBe(0);
  });

  it('owner cut without VAT: half of the value without VAT, team gets the cent rounded down', () => {
    // Kseniia: 98,10 + 22,56 de IVA = 120,66
    expect(ownerServiceCutWithoutVat({ billed_value: 120.66, invoiced: true, invoice_by: 'Empresa', vat_on_top: true })).toBe(49.05);
    // só uma parte com fatura: 172,80 com 73,80 faturado (60 + 13,80)
    expect(ownerServiceCutWithoutVat({ billed_value: 172.8, invoiced: true, invoice_by: 'Empresa', invoice_value: 73.8 })).toBe(79.5);
    expect(ownerServiceCutWithoutVat({ billed_value: 120, invoiced: true, invoice_by: 'Francisco' })).toBeNull();
    expect(ownerServiceCutWithoutVat({ billed_value: 120, invoiced: false })).toBeNull();
  });

  it('upsell on a company invoice is split without its VAT', () => {
    expect(upsellWithoutVatOf({ upsell_value: 123, invoiced: true, invoice_by: 'Empresa' })).toBe(100);
    expect(upsellWithoutVatOf({ upsell_value: 123, invoiced: true, invoice_by: 'Francisco' })).toBe(123);
  });
});

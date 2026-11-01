import { describe, expect, it } from 'vitest';
import { invoicesToIssue, vatByMonth } from './crmVat';

// Dados inventados: o repositório é público.
const today = '2026-10-27';
const rows = [
  { id: 'a', request_date: '2026-10-19', billed_value: 123, invoiced: true, invoice_by: 'Empresa', paid: true },
  { id: 'b', request_date: '2026-10-21', billed_value: 246, invoiced: true, invoice_by: 'Empresa', paid: false, invoice_issued_on: '2026-10-22' },
  { id: 'c', request_date: '2026-10-30', billed_value: 123, invoiced: true, invoice_by: 'Empresa', paid: false },
  { id: 'd', request_date: '2026-10-05', billed_value: 123, invoiced: true, invoice_by: 'Francisco', paid: true },
  { id: 'e', request_date: '2026-10-06', billed_value: 500, invoiced: false, paid: true },
  { id: 'f', request_date: '2026-09-10', billed_value: 61.5, invoiced: true, invoice_by: 'Empresa', paid: true },
  { id: 'g', request_date: '2026-11-03', billed_value: 123, invoiced: true, invoice_by: 'Empresa', paid: false },
];

describe('vatByMonth', () => {
  const months = vatByMonth(rows, today);

  it('one entry per month with invoices, newest first', () => {
    expect(months.map(m => m.month)).toEqual(['2026-11', '2026-10', '2026-09']);
  });

  it('VAT to deliver only from company invoices already done, split paid / unpaid', () => {
    const oct = months[1];
    expect(oct.services.map(s => s.id)).toEqual(['a', 'b', 'c']);
    expect(oct.vat).toBe(69);
    expect(oct.vatPaid).toBe(23);
    expect(oct.vatUnpaid).toBe(46);
    expect(oct.vatUpcoming).toBe(23);
    expect(oct.toIssue).toBe(2);
  });

  it("Francisco's invoices are listed apart and never in the VAT to deliver", () => {
    expect(months[1].francisco.map(s => s.id)).toEqual(['d']);
    expect(months[1].franciscoVat).toBe(23);
  });

  it('a month with only future services has nothing to deliver yet', () => {
    expect(months[0].vat).toBe(0);
    expect(months[0].vatUpcoming).toBe(23);
  });
});

describe('dinheiro por receber e faturas por passar (dono, 1/11)', () => {
  it('a client who pays the owner directly and has not paid counts as unpaid, even with the team settled', () => {
    const [oct] = vatByMonth([
      { id: 'x', request_date: '2026-10-14', billed_value: 123, invoiced: true, invoice_by: 'Empresa', paid: true, paid_to_owner: true },
      { id: 'y', request_date: '2026-10-15', billed_value: 123, invoiced: true, invoice_by: 'Empresa', paid: true, paid_to_owner: true, client_paid_owner_at: '2026-10-16' },
    ], today);
    expect(oct.vatUnpaid).toBe(23);
    expect(oct.vatPaid).toBe(23);
  });

  it('lists company invoices to issue from every month, done services first, never Francisco', () => {
    expect(invoicesToIssue(rows, today).map(r => r.id)).toEqual(['f', 'a', 'c', 'g']);
  });
});

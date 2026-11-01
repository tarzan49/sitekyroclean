import { describe, expect, it } from 'vitest';
import { debtKindOf, moneyReceived } from './crmDebts';

// Dados inventados: o repositório é público.
const today = '2026-11-01';

describe('debtKindOf (dono, 1/11: "Por pagar" mostra também os clientes que me devem)', () => {
  it('team has not paid the owner', () => {
    expect(debtKindOf({ request_date: '2026-10-20', paid: false }, today)).toBe('team');
  });
  it('client owes the owner even after the team was settled (paid = true)', () => {
    const r = { request_date: '2026-10-02', paid: true, paid_to_owner: true };
    expect(debtKindOf(r, today)).toBe('client');
    expect(moneyReceived(r)).toBe(false);
  });
  it('client paid: nobody owes', () => {
    const r = { request_date: '2026-10-02', paid: true, paid_to_owner: true, client_paid_owner_at: '2026-10-05T10:00:00Z' };
    expect(debtKindOf(r, today)).toBeNull();
    expect(moneyReceived(r)).toBe(true);
  });
  it('future services and rows deleted from the calendar are not debts', () => {
    expect(debtKindOf({ request_date: '2026-11-03', paid: false }, today)).toBeNull();
    expect(debtKindOf({ request_date: '2026-10-20', paid: false, calendar_missing_since: '2026-10-21' }, today)).toBeNull();
  });
});

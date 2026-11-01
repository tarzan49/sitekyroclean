// IVA por mês, para a aba "Faturas e IVA" do CRM (dono, 2026-10-27: "tem que
// acompanhar durante os meses para eu perceber qual é o IVA que eu tenho que
// entregar de cada mês", "se elas já me pagaram ou se não me pagaram").
//
// Um serviço conta no mês do dia do serviço. Só as faturas da empresa têm IVA a
// entregar (as do Francisco já foram entregues por ele) e só depois de o serviço
// ser feito (vatToDeliverOf). As contas do IVA estão em invoiceVat.ts.

import { invoiceStatusOf, invoiceVatOf, vatToDeliverOf, type InvoiceRow } from './invoiceVat';
import { moneyReceived } from './crmDebts';

export interface VatRow extends InvoiceRow {
  id: string;
  request_date: string;
  paid?: boolean | null;
  paid_to_owner?: boolean | null;
  client_paid_owner_at?: string | null;
}

export interface VatMonth<T extends VatRow = VatRow> {
  /** AAAA-MM */
  month: string;
  /** Serviços com fatura da empresa, já feitos e ainda por fazer, por dia. */
  services: T[];
  /** Faturas do Francisco: IVA já entregue por ele, só para referência. */
  francisco: T[];
  /** IVA a entregar ao Estado (serviços já feitos). */
  vat: number;
  /** Desse IVA, o de serviços cujo dinheiro já me chegou e o dos que ainda não (equipa ou cliente por pagar). */
  vatPaid: number;
  vatUnpaid: number;
  /** IVA dos serviços com fatura ainda por fazer: entra no dia do serviço. */
  vatUpcoming: number;
  /** Faturas por passar. */
  toIssue: number;
  franciscoVat: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Meses com faturas, do mais recente para o mais antigo. */
export function vatByMonth<T extends VatRow>(rows: T[], today: string): VatMonth<T>[] {
  const byMonth = new Map<string, VatMonth<T>>();
  const monthOf = (m: string) => {
    let v = byMonth.get(m);
    if (!v) {
      v = { month: m, services: [], francisco: [], vat: 0, vatPaid: 0, vatUnpaid: 0, vatUpcoming: 0, toIssue: 0, franciscoVat: 0 };
      byMonth.set(m, v);
    }
    return v;
  };
  for (const r of rows) {
    if (!r.invoiced) continue;
    const m = monthOf(r.request_date.slice(0, 7));
    if (r.invoice_by === 'Francisco') {
      m.francisco.push(r);
      m.franciscoVat = round2(m.franciscoVat + invoiceVatOf(r));
      continue;
    }
    m.services.push(r);
    if (invoiceStatusOf(r) === 'to_issue') m.toIssue++;
    const due = vatToDeliverOf(r, today);
    if (r.request_date > today) { m.vatUpcoming = round2(m.vatUpcoming + invoiceVatOf(r)); continue; }
    m.vat = round2(m.vat + due);
    if (moneyReceived({ ...r, paid: !!r.paid })) m.vatPaid = round2(m.vatPaid + due); else m.vatUnpaid = round2(m.vatUnpaid + due);
  }
  for (const m of byMonth.values()) {
    m.services.sort((a, b) => a.request_date.localeCompare(b.request_date));
    m.francisco.sort((a, b) => a.request_date.localeCompare(b.request_date));
  }
  return [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month));
}

/**
 * Faturas da empresa por passar, de todos os meses (dono, 2026-11-01: "é muito
 * importante dar tracking a isso"): primeiro as dos serviços já feitos, do mais
 * antigo para o mais recente, depois as dos serviços por fazer.
 */
export function invoicesToIssue<T extends VatRow>(rows: T[], today: string): T[] {
  return rows
    .filter(r => invoiceStatusOf(r) === 'to_issue' && r.invoice_by !== 'Francisco')
    .sort((a, b) => Number(a.request_date > today) - Number(b.request_date > today) || a.request_date.localeCompare(b.request_date));
}

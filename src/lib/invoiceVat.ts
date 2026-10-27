// IVA de um serviço com fatura, para o CRM e para as contas das equipas
// (teamAccounts.ts, que vai no pacote do bot: só imports relativos aqui).
//
// Com fatura (`invoiced`), o valor do serviço no CRM é o que o cliente paga e
// tem o IVA de 23% lá dentro: IVA = valor × 23 ÷ 123 (dono, 2026-10-16). Como
// foi combinado fica em `vat_on_top` (dono, 2026-10-27): false = IVA incluído
// no preço (Marina, 729€); true = IVA à parte, e o valor do CRM é o total com
// IVA (Regina, 209€ + 48,07€ = 257,07€). As contas fazem-se igual nos dois. Uma fatura de só uma parte do serviço (só o
// colchão, para o condomínio) leva o valor dessa parte em `invoice_value`.
//
// O upsell de um serviço com fatura também vai na fatura (Marina, 19/10), por
// isso o IVA do CRM soma-o; as contas das equipas continuam a usar só o do
// serviço (`serviceVatOf`), como antes.

/** Taxa do IVA. */
export const INVOICE_VAT = 0.23;

export type InvoiceStatus = 'none' | 'to_issue' | 'issued';

export interface InvoiceRow {
  billed_value?: number | string | null;
  invoiced?: boolean | null;
  invoice_value?: number | string | null;
  invoice_issued_on?: string | null;
  upsell_value?: number | string | null;
  /** IVA à parte (por cima do preço combinado); false = IVA incluído no preço. */
  vat_on_top?: boolean | null;
  /** Quem passou a fatura: "Francisco" (até 20/10, IVA já entregue por ele) ou "Empresa". */
  invoice_by?: string | null;
  /** Dia do serviço (AAAA-MM-DD). */
  request_date?: string | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** IVA dentro de um valor com IVA, com o mesmo arredondamento das contas: valor menos o valor sem IVA. */
export function vatInside(gross: number): number {
  return round2(gross - round2(gross / (1 + INVOICE_VAT)));
}

/** IVA do serviço (sem o upsell). Fatura de parte do serviço: o IVA dessa parte. */
export function serviceVatOf(r: InvoiceRow): number {
  if (!r.invoiced) return 0;
  const billed = Number(r.billed_value) || 0;
  const part = r.invoice_value === null || r.invoice_value === undefined || r.invoice_value === ''
    ? billed : Math.min(Number(r.invoice_value) || 0, billed);
  return vatInside(part);
}

/** IVA de toda a fatura: o do serviço mais o do upsell. */
export function invoiceVatOf(r: InvoiceRow): number {
  if (!r.invoiced) return 0;
  return round2(serviceVatOf(r) + vatInside(Number(r.upsell_value) || 0));
}

/** Sem fatura, fatura por passar ou fatura passada. */
export function invoiceStatusOf(r: InvoiceRow): InvoiceStatus {
  if (!r.invoiced) return 'none';
  return r.invoice_issued_on ? 'issued' : 'to_issue';
}

/** O preço combinado sem o IVA, quando o IVA foi à parte: o valor do serviço menos o IVA. */
export function priceBeforeVatOf(r: InvoiceRow): number {
  return round2((Number(r.billed_value) || 0) - serviceVatOf(r));
}

/**
 * IVA que a empresa tem de entregar ao Estado por este serviço (dono, 2026-10-27:
 * "o valor exatamente certinho que eu tenho que entregar"): só os serviços com
 * fatura da empresa. As faturas do Francisco ficam de fora: o IVA delas já foi
 * entregue por ele, e o cut desses serviços fica como estava.
 *
 * Só serviços já feitos (dono, 2026-10-27: "só serviços já feitos"): um serviço
 * marcado para depois de `today` (dia de Lisboa, AAAA-MM-DD) ainda não conta.
 */
export function vatToDeliverOf(r: InvoiceRow, today: string): number {
  if (!r.invoiced || r.invoice_by === 'Francisco') return 0;
  if (r.request_date && r.request_date > today) return 0;
  return invoiceVatOf(r);
}

/**
 * A parte do dono num serviço com fatura da empresa, sem o IVA: o valor sem IVA
 * menos a parte da equipa, que é metade do valor sem IVA arredondada ao cêntimo
 * para baixo (a mesma conta de teamAccounts.ts). null = não tem fatura da
 * empresa, e o cut é o `my_cut` escrito.
 */
export function ownerServiceCutWithoutVat(r: InvoiceRow): number | null {
  if (!r.invoiced || r.invoice_by === 'Francisco') return null;
  const net = round2((Number(r.billed_value) || 0) - serviceVatOf(r));
  return round2(net - Math.floor(round2(net * 50)) / 100);
}

/** O upsell sem o IVA, quando vai na fatura da empresa; senão o upsell como está. */
export function upsellWithoutVatOf(r: InvoiceRow): number {
  const value = Number(r.upsell_value) || 0;
  if (!r.invoiced || r.invoice_by === 'Francisco') return value;
  return round2(value - vatInside(value));
}

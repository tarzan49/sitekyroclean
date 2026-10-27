// Textos e cores da fatura, partilhados pela aba Pedidos e pela aba Faturas e IVA do CRM.
import { invoiceStatusOf, invoiceVatOf, type InvoiceRow, type InvoiceStatus } from "@/lib/invoiceVat";

export const money = (n: number) => `${n.toFixed(2).replace(/\.00$/, "")}€`;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** "28/10", a partir de AAAA-MM-DD. */
export const dayMonth = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export const INVOICE_CHIP: Record<InvoiceStatus, { short: string; long: string; cls: string }> = {
  none: { short: "Não", long: "Sem fatura", cls: "bg-gray-50 text-gray-500 border-gray-200" },
  to_issue: { short: "Por passar", long: "Fatura por passar", cls: "bg-amber-50 text-amber-800 border-amber-300" },
  issued: { short: "Passada", long: "Fatura passada", cls: "bg-blue-50 text-blue-700 border-blue-200" },
};

type Row = InvoiceRow & { billed_value: number; invoice_ref?: string | null; invoice_by?: string | null };

/**
 * Como o IVA foi combinado (dono, 2026-10-27: "coloca lá que o IVA já está
 * incluído nesse preço [...] nas outras em que eu pedi IVA à parte, tens que
 * mostrar que o IVA estava realmente à parte"). Curto para a tabela.
 */
export function vatLine(r: Row, short = false): string {
  const vat = invoiceVatOf(r);
  const gross = r.billed_value + (Number(r.upsell_value) || 0);
  if (r.vat_on_top) return short ? `+ IVA ${money(vat)}` : `IVA à parte: ${money(round2(gross - vat))} + ${money(vat)} de IVA = ${money(gross)}`;
  return short ? `IVA incl. ${money(vat)}` : `IVA incluído no preço: ${money(gross)}, dos quais ${money(vat)} de IVA`;
}

export function invoiceTitle(r: Row): string {
  const status = invoiceStatusOf(r);
  if (status === "none") return "Sem fatura. Carrega para passar a com fatura (IVA 23% incluído no valor).";
  const vat = `${vatLine(r)}${r.invoice_value != null ? ` (fatura de ${money(Number(r.invoice_value))})` : ""}`;
  if (status === "to_issue") return `Fatura por passar · ${vat}. Carrega quando a passares.${r.invoice_ref ? ` ${r.invoice_ref}` : ""}`;
  return `Fatura passada a ${dayMonth(r.invoice_issued_on!)}${r.invoice_by ? ` (${r.invoice_by})` : ""} · ${vat}. Carrega para editar.${r.invoice_ref ? ` ${r.invoice_ref}` : ""}`;
}

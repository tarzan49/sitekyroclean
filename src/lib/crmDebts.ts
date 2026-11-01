// Quem me deve dinheiro, para o filtro "Por pagar" do CRM (dono, 2026-11-01:
// "devia-me aparecer todos os clientes que me faltam efetivamente pagar, que eu
// até posso já ter pago aos meus funcionários, mas que não me pagaram").
//
// Há duas dívidas, e as duas contam:
// - a equipa ainda não me pagou a minha parte (`paid` false);
// - o cliente paga-me diretamente (`paid_to_owner`) e ainda não pagou
//   (`client_paid_owner_at` vazio). A equipa pode já estar acertada, e o acerto
//   de domingo marca a linha como `paid`: por isso esta dívida não se lê do `paid`.
// Um serviço só é dívida depois de ser feito (dia do serviço até hoje), e uma
// linha apagada no calendário não é dívida de ninguém.

export interface DebtRow {
  request_date: string;
  paid: boolean;
  paid_to_owner?: boolean | null;
  client_paid_owner_at?: string | null;
  calendar_missing_since?: string | null;
}

export type DebtKind = 'client' | 'team';

/** O cliente paga-me diretamente e ainda não pagou. */
export const clientOwesOwner = (r: DebtRow) =>
  !!r.paid_to_owner && !r.client_paid_owner_at && !r.calendar_missing_since;

/** Quem me deve este serviço hoje (AAAA-MM-DD de Lisboa), ou null. */
export function debtKindOf(r: DebtRow, today: string): DebtKind | null {
  if (r.calendar_missing_since || r.request_date > today) return null;
  if (clientOwesOwner(r)) return 'client';
  if (!r.paid) return 'team';
  return null;
}

/** O dinheiro deste serviço já chegou ao dono. */
export const moneyReceived = (r: DebtRow) => r.paid && !clientOwesOwner(r);

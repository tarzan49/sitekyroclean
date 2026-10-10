/**
 * Test orders: "TESTE GOOGLE ADS", "teste", "não contactar", and numbers like
 * 911111111, 999999999 or 910000000. Shared by the CRM's quiz tab
 * (`crmQuizLeads.ts`) and the bot's first message to new quiz orders
 * (`bot-api` new-orders, through the bot engine bundle), so a test never gets
 * a WhatsApp message and never counts as a close. `phone9` = last 9 digits.
 * No `@/` imports: the bot engine bundle reads it.
 */
export function isTestOrder(name: string | null | undefined, phone9: string): boolean {
  if (/teste|n[aã]o contactar/i.test(name ?? '')) return true;
  return /^9(\d)\1{7}$/.test(phone9) || /^9\d0{7}$/.test(phone9);
}

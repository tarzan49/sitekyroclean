// Corre com: deno test supabase/functions/bot-api/orderPrice.test.ts
import { assert, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { buildWhatsAppMessage, SHOW_STRUCK_TOTAL } from "../_shared/whatsappReply.ts";
import { orderPrice } from "./orderPrice.ts";

const order = (items: Record<string, unknown>[], total: number | null, city = "Lisboa") => ({
  name: "Maria", location: city, service: "", service_type: "Cesto da visita", details: "",
  quiz_order: { v: 1, service: "sofa", city, lines: [], quote: { items, exact: true }, rugs: [], rugPickup: items.some((i) => i.kind === "rug") ? false : null, total, priceText: "", sobOrcamento: total === null, observations: null, slot: null },
});
// deno-lint-ignore no-explicit-any
const msg = (o: any) => buildWhatsAppMessage(o, orderPrice(o));
const sofa = { kind: "sofa", size: "3-lugares", qty: 1, treatment: "clean" }, bed = { kind: "mattress", size: "casal", qty: 1, treatment: "clean" };

Deno.test("sofá e colchão: cada peça com o preço do cesto, a oferta e o riscado (dono, 25 Nov)", () => {
  const m = msg(order([sofa, bed], 149));
  assert(m.includes("• Sofá 3 lugares, limpeza\n• Colchão de casal, limpeza\n• Anti-ácaros no colchão: oferecido (normalmente 40€)\n• Deslocação grátis\n\nTotal: 149€"), m);
  assertEquals(m.includes("(em vez de 209€)"), SHOW_STRUCK_TOTAL);
});

Deno.test("uma peça só: serviço, deslocação e total", () => {
  const p = orderPrice(order([{ ...sofa, treatment: "clean+premium" }], 219))!;
  assertEquals([p.lines[0].amount, p.total, p.usual], [219, 219, null]);
  const c = orderPrice(order([sofa], 89))!;
  assertEquals([c.lines[0].amount, c.travel, c.total], [79, 10, 89]);
});

Deno.test("tapete com o preço que o site mostrou; sem preço no site, sem preço na mensagem", () => {
  const rug = { kind: "rug", qty: 1, treatment: "clean", width: 2, length: 3, material: "sintético ou lã" };
  assertEquals(orderPrice(order([rug], 69))!.total, 69);
  assertEquals(orderPrice(order([rug], null)), null);
  const both = orderPrice(order([{ ...sofa, treatment: "clean+premium" }, rug], 289))!;
  assertEquals([both.total, both.gifts?.[0].label], [279, "Anti-odor no tapete"]);
});

Deno.test("as linhas e a deslocação somam sempre o total", () => {
  const pool = [sofa, { ...sofa, treatment: "clean+premium" }, { ...sofa, size: "1-lugar", treatment: "clean+premium" }, bed, { ...bed, treatment: "clean+anti-acaros" }, { kind: "chairs", qty: 6, treatment: "clean" }];
  for (const a of pool) for (const b of pool) for (const city of ["Lisboa", "Porto"]) {
    const p = orderPrice(order([a, b], 1, city));
    if (!p) continue;
    const sum = p.lines.reduce((t, l) => t + l.amount, 0);
    assertEquals(Math.round((sum + (p.travel ?? 0)) * 100) / 100, p.total, JSON.stringify([a, b]));
  }
});

Deno.test("quem não tem preço fechado continua sem preço", () => {
  assertEquals(orderPrice(order([sofa], 89, "Terra Que Não Existe")), null);
  assertEquals(orderPrice({ details: "1x Sofá 3 Lugares: 79€", location: "Porto" }), null);
});

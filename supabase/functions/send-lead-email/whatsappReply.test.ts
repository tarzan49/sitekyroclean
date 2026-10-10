// Corre com: deno test supabase/functions/send-lead-email/whatsappReply.test.ts
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { buildWhatsAppMessage } from "./whatsappReply.ts";

Deno.test("um só artigo: serviço, localidade e fotografia, sem horários nem morada", () => {
  const msg = buildWhatsAppMessage({
    name: "maria silva", service: "Sofá", service_type: "Higienização Profunda", location: "Porto",
  });
  assertEquals(msg, [
    "Olá Maria, tudo bem?",
    "Aqui é o António, da Kyro Clean Solutions. Recebemos o seu pedido de orçamento para limpeza de sofá no Porto.",
    "Tem fotografias do sofá?",
  ].join("\n\n"));
});

Deno.test("pedido com upsell: todos os artigos, não só o primeiro", () => {
  const msg = buildWhatsAppMessage({
    name: "Rui", service: "Sofá, 2x Colchão Casal, 4 Cadeiras (Impermeabilização Premium)",
    service_type: "Higienização Profunda", location: "Lisboa",
  });
  assertEquals(msg.split("\n\n").slice(1), [
    "Aqui é o António, da Kyro Clean Solutions. Recebemos o seu pedido de orçamento para limpeza de sofá e colchões, e impermeabilização de cadeiras em Lisboa.",
    "Tem fotografias do sofá, dos colchões e das cadeiras?",
  ]);
});

Deno.test("impermeabilização como serviço principal, com tapete no upsell", () => {
  const msg = buildWhatsAppMessage({
    name: "Ana", service: "Sofá, 1 Tapete (sob orçamento)", service_type: "Impermeabilização Essencial", location: "Amadora",
  });
  assertEquals(msg.split("\n\n").slice(1), [
    "Aqui é o António, da Kyro Clean Solutions. Recebemos o seu pedido de orçamento para impermeabilização de sofá e limpeza de tapete na Amadora.",
    "Tem fotografias do sofá e do tapete?",
  ]);
});

Deno.test("contacto simples sem serviço: sem pergunta de fotografias", () => {
  const msg = buildWhatsAppMessage({ name: "Joana", message: "Olá" });
  assertEquals(msg, "Olá Joana, tudo bem?\n\nAqui é o António, da Kyro Clean Solutions. Recebemos o seu pedido de orçamento.");
});

Deno.test("com details: cada artigo com o que a pessoa escolheu, sem preços", () => {
  const msg = buildWhatsAppMessage({
    name: "julia", service: "Sofá, 1x Colchão Casal, 1 Tapete (sob orçamento)", service_type: "Higienização Profunda", location: "Faro",
    details: "1x Sofá 3 Lugares + Impermeab. Premium: 189€\n2x Colchão Casal (Limpeza): 118€\n1x Tapete 1: 2,3 × 1,6 m (3,68 m²): Sob orçamento\n1x Recolha, entrega e deslocação (até 4 dias úteis): 15€\n1x Deslocação: Faro: 10€",
  });
  assertEquals(msg.split("\n\n").slice(1), [
    "Aqui é o António, da Kyro Clean Solutions. Recebemos o seu pedido de orçamento em Faro:",
    "• Sofá 3 Lugares + impermeabilização Premium\n• 2 × Colchão Casal\n• Tapete de 2,3 × 1,6 m (3,68 m²)\n• Com recolha e entrega",
    "Tem fotografias do sofá, do colchão e do tapete?",
  ]);
});

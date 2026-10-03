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

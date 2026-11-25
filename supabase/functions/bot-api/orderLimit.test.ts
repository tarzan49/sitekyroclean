import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { ORDERS_PER_DAY, overOrderLimit } from "./index.ts";

const row = (i: number, phone: string, email = "") => ({ created_at: new Date(Date.UTC(2026, 10, 25, 10, i)).toISOString(), phone, email });
Deno.test("4.º pedido do mesmo telefone em 24 h não leva mensagem", () => {
  assertEquals(overOrderLimit([0, 1, 2, 3].map(i => row(i, "+351 900 000 001"))).size, 1);
});
Deno.test("o mesmo email com telefones diferentes também", () => {
  assertEquals(overOrderLimit([0, 1, 2, 3].map(i => row(i, `90000000${i}`, "a@b.pt"))).size, 1);
});
Deno.test("limite do dia; um dia normal passa todo", () => {
  assertEquals(overOrderLimit(Array.from({ length: 8 }, (_, i) => row(i, `9100000${10 + i}`))).size, 0);
  assertEquals(overOrderLimit(Array.from({ length: ORDERS_PER_DAY + 5 }, (_, i) => row(i, `9100001${100 + i}`.slice(-9)))).size, 5);
});

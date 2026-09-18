// Testa só `resolveDuplicateLeadConflict`, a peça que decide se um `23505`
// (ou o pré-check por lead_id) pode ser devolvido ao cliente como sucesso.
// Não monta `serve()` nem fala com uma base de dados real — um cliente
// Supabase falso, com só o método usado, chega para provar a lógica.
//
// Corre com: deno test supabase/functions/submit-lead/index.test.ts
import { assertEquals, assertStrictEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { resolveDuplicateLeadConflict } from "./index.ts";

function fakeLeadsTable(row: { id: string; booking_id: string | null } | null) {
  return {
    select(_columns: string) {
      return {
        eq(_column: "lead_id", _value: string) {
          return { maybeSingle: () => Promise.resolve({ data: row }) };
        },
      };
    },
  };
}

// Cenário A: duas submissões simultâneas com o mesmo lead_id. A que perde a
// corrida (23505) tem de devolver o booking_id realmente persistido, não o
// que ela própria gerou para a sua tentativa.
Deno.test("corrida real: devolve o booking_id da linha persistida, nao o do pedido perdedor", async () => {
  const persisted = { id: "row-1", booking_id: "REAL123" };
  const result = await resolveDuplicateLeadConflict(fakeLeadsTable(persisted), "L-teste", "FAKE999");
  assertEquals(result, { bookingId: "REAL123", leadId: "L-teste" });
});

// Cenário D: um 23505 (ou uma consulta) que não corresponde a nenhuma linha
// por lead_id não pode ser tratado como sucesso.
Deno.test("conflito sem linha correspondente: nao resolve, nao inventa sucesso", async () => {
  const result = await resolveDuplicateLeadConflict(fakeLeadsTable(null), "L-teste", "FAKE999");
  assertStrictEquals(result, null);
});

// Sem lead_id (leads antigos, de antes do identificador de submissão
// existir) nunca há verificação de duplicado — sempre segue para o insert.
Deno.test("sem lead_id: nunca resolve", async () => {
  const result = await resolveDuplicateLeadConflict(fakeLeadsTable({ id: "row-1", booking_id: "X" }), undefined, "FAKE999");
  assertStrictEquals(result, null);
});

// Linha persistida sem booking_id (defensivo — não deve acontecer na
// prática, já que buildLeadRow sempre define um): usa o do pedido como
// referência de exibição, sem deixar o booking vazio.
Deno.test("linha persistida sem booking_id: usa o do pedido como recurso", async () => {
  const persisted = { id: "row-1", booking_id: null };
  const result = await resolveDuplicateLeadConflict(fakeLeadsTable(persisted), "L-teste", "FAKE999");
  assertEquals(result, { bookingId: "FAKE999", leadId: "L-teste" });
});

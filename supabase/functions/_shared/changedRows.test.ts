import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { changedRows } from "./changedRows.ts";

Deno.test("changedRows: ignora iguais, mantém novas e alteradas", () => {
  const existing = [
    { contact_key: "1", inbound_count: 2, first_at: "2026-11-01T10:00:00+00:00", updated_at: "x" },
    { contact_key: "2", inbound_count: 1, first_at: "2026-11-01T10:00:00+00:00", updated_at: "x" },
  ];
  const incoming = [
    { contact_key: "1", inbound_count: 2, first_at: "2026-11-01T10:00:00.000Z", updated_at: "y" },
    { contact_key: "2", inbound_count: 3, first_at: "2026-11-01T10:00:00.000Z", updated_at: "y" },
    { contact_key: "3", inbound_count: 1, first_at: "2026-11-02T10:00:00.000Z", updated_at: "y" },
  ];
  assertEquals(changedRows(incoming, existing, ["contact_key"]).map(r => r.contact_key), ["2", "3"]);
});

Deno.test("changedRows: chave composta e números em texto", () => {
  const existing = [{ stat_date: "2026-11-01", campaign_id: "9", cost: "12.50" }];
  assertEquals(changedRows([{ stat_date: "2026-11-01", campaign_id: "9", cost: 12.5 }], existing, ["stat_date", "campaign_id"]).length, 0);
});

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sweepWaterproofBase } from "./index.ts";

const ev = (id: string, summary: string, start: string, description = "") =>
  ({ id, summary, description, status: "CONFIRMED", start, end: start.replace("T15", "T16") });
const NOW = new Date("2026-11-13T10:00:00Z");

Deno.test("sweepWaterproofBase marca só impermeabilizações futuras com telefone, uma vez", async () => {
  const writes: Record<string, unknown>[] = [];
  const events = [
    ev("a", "Serviço 75€ (149€) Impermeabilização Premium de sofá - 912 345 678 - Ana - Porto", "2026-11-14T15:00:00Z"),
    ev("b", "Serviço 40€ (79€) Impermeabilização Essencial sofá - Rui - Lisboa", "2026-11-15T15:00:00Z", "bot:351911111111@s.whatsapp.net"),
    ev("c", "Serviço 75€ (149€) Impermeabilização Premium (solvente) sofá - 913000000", "2026-11-14T15:00:00Z"),
    ev("d", "Serviço 75€ (149€) Impermeabilização Premium sofá - 914000000", "2026-11-10T15:00:00Z"),
    ev("e", "Serviço 45€ (89€) Limpeza de sofá - 915000000", "2026-11-14T15:00:00Z"),
    ev("f", "Serviço 45€ (89€) Impermeabilização Premium sofá - Sem número", "2026-11-14T15:00:00Z"),
  ];
  const r = await sweepWaterproofBase(events as never, p => { writes.push(p); return Promise.resolve({ ok: true }); }, NOW);
  assertEquals(r, { tagged: 2, failed: 0 });
  assertEquals(writes.map(w => [w.eventId, w.phone, w.title, w.description]), [
    ["a", "912345678", "Serviço 75€ (149€) Impermeabilização Premium (solvente) de sofá - 912 345 678 - Ana - Porto", ""],
    ["b", "351911111111", "Serviço 40€ (79€) Impermeabilização Essencial (à base de água) sofá - Rui - Lisboa", ""],
  ]);
});

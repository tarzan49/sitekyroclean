import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sweepHolds, type HoldRow } from "./index.ts";

const ev = (id: string, summary: string, start: string, description = "") =>
  ({ id, summary, description, location: "", startDate: start.slice(0, 10), created: start, updated: start, status: "CONFIRMED", start, end: start });

Deno.test("a pre-booking replaced by a service for the same phone is released", async () => {
  const rows: HoldRow[] = [
    { conversation_id: "351911222333@s.whatsapp.net", event_id: "h1", title: "Pré-reserva – Ana – Porto – sofá – 89€", starts_at: "2026-10-13T13:00:00Z", ends_at: "2026-10-13T14:00:00Z", updated_at: "2026-10-11T10:00:00Z", released_at: null },
    { conversation_id: "351911000000@s.whatsapp.net", event_id: "h2", title: "Pré-reserva – Rui – Gaia – sofá – 69€", starts_at: "2026-10-14T13:00:00Z", ends_at: "2026-10-14T14:00:00Z", updated_at: "2026-10-11T10:00:00Z", released_at: null },
    { conversation_id: "351911999999@s.whatsapp.net", event_id: "h3", title: "Pré-reserva – Zé – Maia – sofá – 69€", starts_at: "2026-10-15T13:00:00Z", ends_at: "2026-10-15T14:00:00Z", updated_at: "2026-10-01T10:00:00Z", released_at: null },
  ];
  const released: string[] = []; const written: string[] = [];
  const store = { get: async () => null, recent: async () => rows, save: async () => null, release: async (id: string) => { released.push(id); return null; } };
  const events = [ev("h1", rows[0].title, rows[0].starts_at), ev("h2", rows[1].title, rows[1].starts_at),
    ev("s1", "Serviço 45€ (89€) Limpeza de sofá - 911 222 333 - Ana - Rua X", "2026-10-13T13:00:00Z")];
  const r = await sweepHolds(events, store, async p => { written.push(String(p.eventId)); return { ok: true, released: true }; }, new Date("2026-10-11T20:00:00Z"));
  assertEquals(r, { released: 1, gone: 1 });
  assertEquals(written, ["h1"]);
  assertEquals(released, ["351911222333@s.whatsapp.net", "351911999999@s.whatsapp.net"]);
});

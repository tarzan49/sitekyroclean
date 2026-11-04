import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { buildConversionsCsv, e164, sha256, utcTime } from "./index.ts";

const now = new Date("2026-11-03T18:00:00Z");

Deno.test("e164", () => {
  assertEquals(e164("912 345 678"), "+351912345678");
  assertEquals(e164("+351 912345678"), "+351912345678");
  assertEquals(e164("0044 7700 900123"), "+447700900123");
  assertEquals(e164("123"), null);
});

Deno.test("hora UTC com fuso", () => {
  assertEquals(utcTime("2026-07-01T12:00:00.000Z"), "2026-07-01 12:00:00+00:00");
});

Deno.test("só vão fechos com código de anúncio, sem telefone quando há gclid", async () => {
  const { csv, rows, withClick } = await buildConversionsCsv({
    now,
    services: [
      { id: "s1", phone: "912345678", booked_at: "2026-11-02T10:00:00Z", billed_value: 189, my_cut: 95, calendar_event_id: "e1" },
      { id: "s2", phone: "936000000", booked_at: "2026-11-02T11:00:00Z", billed_value: 0, my_cut: 0 },
      { id: "s3", phone: "936000001", booked_at: "2026-11-02T11:00:00Z", billed_value: 89, my_cut: 45, calendar_missing_since: "2026-11-03" },
      { id: "s4", phone: "936000002", booked_at: "2026-11-03T09:00:00Z", billed_value: 129, my_cut: 65, calendar_event_id: "e4" },
      { id: "organico", phone: "936000003", booked_at: "2026-11-03T09:00:00Z", billed_value: 89, my_cut: 45 },
    ],
    extras: [{ id: "x1", calendar_event_id: "e4", added_at: "2026-11-03T12:00:00Z", value: 40, my_cut: 20 }],
    conversations: [{ contact_key: "351912345678", ad_ref: "K7F2Q" }, { contact_key: "936000002", ad_ref: "M3N4P" }],
    clicks: [
      { ref: "K7F2Q", gclid: "CjwKCAjwABC", created_at: "2026-11-02T09:30:00Z" },
      { ref: "M3N4P", gclid: "CjwKCAjwDEF", created_at: "2026-11-03T08:30:00Z" },
    ],
  });
  assertEquals(rows, 3);
  assertEquals(withClick, 3);
  const lines = csv.trim().split("\n");
  assertEquals(lines[0].startsWith("Google Click ID,"), true);
  assertEquals(lines[1], "CjwKCAjwABC,,Serviço fechado,2026-11-02 10:00:00+00:00,95.00,EUR,s1");
  assertEquals(lines[2], "CjwKCAjwDEF,,Serviço fechado,2026-11-03 12:00:00+00:00,20.00,EUR,x1");
  assertEquals(lines[3], "CjwKCAjwDEF,,Serviço fechado,2026-11-03 09:00:00+00:00,45.00,EUR,s4");
  assertEquals(csv.includes("936000003"), false);
});

Deno.test("sem gclid vai o telefone cifrado, nunca em claro, e só até 63 dias", async () => {
  const hash = await sha256("+351912345678");
  const base = { extras: [], conversations: [{ contact_key: "912345678", ad_ref: "K7F2Q" }], clicks: [{ ref: "K7F2Q", gbraid: "0AAAAAx9yzAB", created_at: "2026-08-01T09:00:00Z" }] };
  const recent = await buildConversionsCsv({ ...base, now, services: [{ id: "s1", phone: "912345678", booked_at: "2026-11-02T10:00:00Z", billed_value: 89, my_cut: 45 }] });
  assertEquals(recent.csv.trim().split("\n")[1], `,${hash},Serviço fechado,2026-11-02 10:00:00+00:00,45.00,EUR,s1`);
  assertEquals(recent.csv.includes("912345678"), false);
  const old = await buildConversionsCsv({ ...base, now, services: [{ id: "s1", phone: "912345678", booked_at: "2026-08-15T10:00:00Z", billed_value: 89, my_cut: 45 }] });
  assertEquals(old.rows, 0);
});

Deno.test("clique depois do fecho não conta", async () => {
  const { rows } = await buildConversionsCsv({
    now,
    services: [{ id: "s1", phone: "912345678", booked_at: "2026-11-02T10:00:00Z", billed_value: 89, my_cut: 45 }],
    extras: [], conversations: [{ contact_key: "912345678", ad_ref: "K7F2Q" }],
    clicks: [{ ref: "K7F2Q", gclid: "CjwKCAjwABC", created_at: "2026-11-02T11:00:00Z" }],
  });
  assertEquals(rows, 0);
});

import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { buildConversionsCsv, e164, lisbonTime } from "./index.ts";

const now = new Date("2026-11-03T18:00:00Z");

Deno.test("e164", () => {
  assertEquals(e164("912 345 678"), "+351912345678");
  assertEquals(e164("+351 912345678"), "+351912345678");
  assertEquals(e164("0044 7700 900123"), "+447700900123");
  assertEquals(e164("123"), null);
});

Deno.test("hora de Lisboa", () => {
  assertEquals(lisbonTime("2026-07-01T12:00:00Z"), "2026-07-01 13:00:00");
  assertEquals(lisbonTime("2026-11-03T12:00:00Z"), "2026-11-03 12:00:00");
});

Deno.test("liga o fecho ao clique pelo código e separa o acrescento", () => {
  const { csv, rows, withClick } = buildConversionsCsv({
    now,
    services: [
      { id: "s1", phone: "912345678", booked_at: "2026-11-02T10:00:00Z", billed_value: 189, my_cut: 95, calendar_event_id: "e1" },
      { id: "s2", phone: "936000000", booked_at: "2026-11-02T11:00:00Z", billed_value: 0, my_cut: 0 },
      { id: "s3", phone: "936000001", booked_at: "2026-11-02T11:00:00Z", billed_value: 89, my_cut: 45, calendar_missing_since: "2026-11-03" },
      { id: "s4", phone: "936000002", booked_at: "2026-11-03T09:00:00Z", billed_value: 129, my_cut: 65, calendar_event_id: "e4" },
    ],
    extras: [{ id: "x1", calendar_event_id: "e4", added_at: "2026-11-03T12:00:00Z", value: 40, my_cut: 20 }],
    conversations: [{ contact_key: "351912345678", ad_ref: "K7F2Q" }],
    clicks: [{ ref: "K7F2Q", gclid: "CjwKCAjwABC", created_at: "2026-11-02T09:30:00Z" }],
  });
  assertEquals(rows, 3);
  assertEquals(withClick, 1);
  const lines = csv.trim().split("\n");
  assertEquals(lines[0], "Parameters:TimeZone=Europe/Lisbon");
  assertEquals(lines[2], "CjwKCAjwABC,+351912345678,Serviço fechado,2026-11-02 10:00:00,95.00,EUR,s1");
  assertEquals(lines[3], ",+351936000002,Serviço fechado,2026-11-03 12:00:00,20.00,EUR,x1");
  assertEquals(lines[4], ",+351936000002,Serviço fechado,2026-11-03 09:00:00,45.00,EUR,s4");
});

Deno.test("clique depois do fecho não conta", () => {
  const { withClick } = buildConversionsCsv({
    now,
    services: [{ id: "s1", phone: "912345678", booked_at: "2026-11-02T10:00:00Z", billed_value: 89, my_cut: 45 }],
    extras: [], conversations: [{ contact_key: "912345678", ad_ref: "K7F2Q" }],
    clicks: [{ ref: "K7F2Q", gclid: "CjwKCAjwABC", created_at: "2026-11-02T11:00:00Z" }],
  });
  assertEquals(withClick, 0);
});

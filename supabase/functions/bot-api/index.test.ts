// Runs with: deno test --no-lock --allow-env --allow-net supabase/functions/bot-api/
// A fake `leads` table stands in for the database: what is tested is who gets
// in, what comes back, and that one conversation never becomes two leads.
import { assert, assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handleBotRequest, type LeadsStore } from "./index.ts";

const KEY = "k".repeat(40);
type Row = Record<string, unknown>;

function fakeLeads(rows: Row[] = []) {
  const store = {
    rows,
    findBy(column: "booking_id" | "lead_id", value: string) {
      return Promise.resolve({ data: rows.filter(r => r[column] === value).slice(0, 1), error: null });
    },
    insert(row: Row) {
      rows.push(row);
      return Promise.resolve({ data: [{ booking_id: row.booking_id }], error: null });
    },
  };
  return store as LeadsStore & { rows: Row[] };
}

let ip = 0;
const call = (body: unknown, opts: { key?: string; botKey?: string; leads?: LeadsStore | null } = {}) =>
  handleBotRequest(
    new Request("https://x/functions/v1/bot-api", {
      method: "POST",
      // A different IP per call so the in-memory rate limit never interferes.
      headers: { "x-bot-key": opts.key ?? KEY, "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ip % 250}` },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { botKey: "botKey" in opts ? opts.botKey : KEY, leads: opts.leads === undefined ? fakeLeads() : opts.leads },
  );

Deno.test("fails closed without the secret, and rejects a wrong key", async () => {
  assertEquals((await call({ action: "cities" }, { botKey: undefined })).status, 503);
  assertEquals((await call({ action: "cities" }, { botKey: "short" })).status, 503);
  assertEquals((await call({ action: "cities" }, { key: "wrong" })).status, 401);
  assertEquals((await call({ action: "cities" }, { key: "" })).status, 401);
});

Deno.test("quote runs the site engine: sofa 3 seats + double mattress in Porto is 134€", async () => {
  const res = await call({ action: "quote", city: "porto", items: [{ kind: "sofa", size: "3-lugares" }, { kind: "mattress", size: "casal" }] });
  assertEquals(res.status, 200);
  const { quote } = await res.json();
  assertEquals([quote.city, quote.subtotal, quote.travel, quote.total, quote.handToOwner], ["Porto", 134, 0, 134, false]);
});

Deno.test("quote explains a bad item instead of guessing", async () => {
  const res = await call({ action: "quote", city: "Porto", items: [{ kind: "mattress", size: "casal", treatment: "premium" }] });
  assertEquals(res.status, 400);
  assert((await res.json()).error.includes("colchões"));
});

Deno.test("find-order returns a summary without phone, email or message", async () => {
  const leads = fakeLeads([{ booking_id: "K7X2P9", name: "Maria Silva", phone: "912000000", email: "m@example.invalid", message: "x", service: "Sofá", details: "3 lugares", location: "Porto", value: "79€", funnel_status: "NEW" }]);
  const body = await (await call({ action: "find-order", order: "#k7x2p9" }, { leads })).json();
  assertEquals(body.found, true);
  assertEquals(body.order.firstName, "Maria");
  const text = JSON.stringify(body);
  for (const secret of ["912000000", "example.invalid", "Silva"]) assert(!text.includes(secret), secret);
  assertEquals((await (await call({ action: "find-order", order: "ZZZZ99" }, { leads })).json()).found, false);
  assertEquals((await call({ action: "find-order", order: "'; drop table leads" }, { leads })).status, 400);
});

Deno.test("create-lead saves one lead per conversation, as WhatsApp, with the ad origin", async () => {
  const leads = fakeLeads();
  const lead = { action: "create-lead", conversationId: "351912000000:2026-09-28", name: "Maria", phone: "+351 912 000 000", service: "Limpeza de sofá", details: "3 lugares", location: "Porto", value: 89, adOrigin: "google" };
  const first = await (await call(lead, { leads })).json();
  const second = await (await call(lead, { leads })).json();
  assertEquals([first.duplicate, second.duplicate, second.orderNumber], [false, true, first.orderNumber]);
  assertEquals(leads.rows.length, 1);
  const row = leads.rows[0];
  assertEquals([row.source, row.value, row.quoted_value, row.funnel_status], ["WhatsApp", "89€", 89, "NEW"]);
  assert(String(row.notes).includes("Google"));
  assert(String(row.lead_id).startsWith("W-"));
});

Deno.test("create-lead rejects missing or malformed fields", async () => {
  for (const bad of [
    { action: "create-lead", name: "Maria", phone: "912000000", service: "Sofá" },
    { action: "create-lead", conversationId: "c", name: "Maria", phone: "abc", service: "Sofá" },
    { action: "create-lead", conversationId: "c", name: "Maria", phone: "912000000", service: "Sofá", value: "89" },
    { action: "create-lead", conversationId: "c", name: "Maria", phone: "912000000", service: "Sofá", adOrigin: "tiktok" },
  ]) assertEquals((await call(bad)).status, 400);
});

Deno.test("rejects bodies that are not a JSON object, and unknown actions", async () => {
  assertEquals((await call("not json")).status, 400);
  assertEquals((await call([1, 2])).status, 400);
  assertEquals((await call({ action: "delete-everything" })).status, 400);
});

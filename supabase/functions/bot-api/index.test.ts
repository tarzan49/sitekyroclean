// Runs with: deno test --no-lock --allow-env --allow-net supabase/functions/bot-api/
// A fake `leads` table stands in for the database: what is tested is who gets
// in, what comes back, and that one conversation never becomes two leads.
import { assert, assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handleBotRequest, type CalendarWriter, type HoldRow, type HoldStore, type LeadsStore } from "./index.ts";
import { cleanPhone, type FollowUpStore } from "./followUps.ts";

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

// ── Seguimento de clientes (dados inventados: o repositório é público) ──────

const NOW = new Date("2026-10-06T10:00:00Z"); // 11h em Lisboa

function fakeFollowUps() {
  const clients: Row[] = [{
    id: "c1", phone: "351900000001", name: null, whatsapp_name: "Maria Teste", status: "cliente",
    services: ["Sofá"], region: "Lisboa", from_google_ads: true, reviewed_google: false, labels: [],
    first_contact_at: "2026-10-01T10:00:00Z", last_contact_at: "2026-10-05T18:00:00Z",
    last_client_message_at: "2026-10-05T17:00:00Z", notes: null, source: "WhatsApp", contact_preference: "normal",
  }];
  const services: Row[] = [{
    id: "s1", request_date: "2026-10-05", description: "Limpeza sofá 3 lugares", billed_value: 89,
    client_name: null, city: null, phone: "+351 900 000 001", locality: "Lisboa",
  }];
  const touches: Row[] = [];
  const store: FollowUpStore = {
    load: () => Promise.resolve({ clients, services, touches }),
    findClient: key => Promise.resolve(clients.find(c => String(c.phone).endsWith(key)) ?? null),
    insertClient: row => { const c = { id: `c${clients.length + 1}`, ...row }; clients.push(c); return Promise.resolve(c); },
    updateClient: (id, patch) => { Object.assign(clients.find(c => c.id === id)!, patch); return Promise.resolve(null); },
    insertTouch: row => { touches.push({ id: `t${touches.length + 1}`, created_at: NOW.toISOString(), ...row }); return Promise.resolve(null); },
  };
  return { store, clients, touches };
}

const callF = (body: unknown, followUps: FollowUpStore) =>
  handleBotRequest(
    new Request("https://x/functions/v1/bot-api", {
      method: "POST",
      headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": `10.0.1.${++ip % 250}` },
      body: JSON.stringify(body),
    }),
    { botKey: KEY, leads: fakeLeads(), followUps, now: () => NOW },
  ).then(r => r.json());

Deno.test("follow-ups lists what to send now, with the message and whether it can go alone", async () => {
  const { store } = fakeFollowUps();
  const body = await callF({ action: "follow-ups" }, store);
  assertEquals(body.quietNow, false);
  assertEquals(body.items.length, 1);
  const item = body.items[0];
  assertEquals([item.kind, item.send, item.phone, item.firstName], ["avaliacao", "auto", "351900000001", "Maria"]);
  assert(item.messages[0].text.includes("https://g.page/r/CRc7F7lX3xcEECE/review"));
  assertEquals((await callF({ action: "follow-ups", kinds: ["seguimento"] }, store)).items.length, 0);
});

Deno.test("client-plan tells the bot who is writing and what not to do", async () => {
  const { store, clients } = fakeFollowUps();
  const plan = await callF({ action: "client-plan", phone: "900 000 001" }, store);
  assertEquals([plan.found, plan.client.stage, plan.client.firstName], [true, "cliente_recente", "Maria"]);
  assert(plan.guidance.some((g: string) => g.startsWith("Já é cliente")));
  assert(plan.guidance.includes("Veio do anúncio Google."));
  clients[0].contact_preference = "nao_contactar";
  const stop = await callF({ action: "client-plan", phone: "+351900000001" }, store);
  assertEquals(stop.today.length, 0);
  assert(stop.doNot[0].reason.startsWith("Pediu para não receber mensagens"));
  assertEquals((await callF({ action: "client-plan", phone: "+351 911 111 111" }, store)).found, false);
});

Deno.test("log-touch records what the bot sent; optOut stops all messages", async () => {
  const { store, touches, clients } = fakeFollowUps();
  assertEquals((await callF({ action: "log-touch", phone: "351900000001", kind: "avaliacao", template: "avaliacao-a", message: "Olá" }, store)).ok, true);
  assertEquals([touches[0].kind, touches[0].channel, touches[0].template], ["avaliacao", "bot", "avaliacao-a"]);
  assertEquals((await callF({ action: "follow-ups" }, store)).items.length, 0);
  await callF({ action: "log-touch", phone: "351900000001", kind: "outro", optOut: true, optOutNote: "Pediu: não me mandem mensagens" }, store);
  assertEquals([clients[0].contact_preference, clients[0].contact_note], ["nao_contactar", "Pediu: não me mandem mensagens"]);
  assertEquals((await callF({ action: "log-touch", phone: "351900000001", kind: "spam" }, store)).error !== undefined, true);
});

Deno.test("log-message keeps the client card dates and labels up to date, and creates new contacts", async () => {
  const { store, clients } = fakeFollowUps();
  await callF({ action: "log-message", phone: "912 345 678", direction: "in", name: "Joana Teste", at: "2026-10-06T09:55:00Z", labels: ["Por marcar serviço", "Colchão", "Porto", "Google"] }, store);
  const added = clients.find(c => c.phone === "351912345678")!;
  assertEquals([added.status, added.region, added.from_google_ads, added.whatsapp_name], ["por_marcar", "Porto", true, "Joana Teste"]);
  assertEquals([added.last_client_message_at, added.last_contact_at, added.first_contact_at], ["2026-10-06T09:55:00.000Z", "2026-10-06T09:55:00.000Z", "2026-10-06T09:55:00.000Z"]);
  await callF({ action: "log-message", phone: "351912345678", direction: "out" }, store);
  assertEquals([added.last_contact_at, added.last_client_message_at], [NOW.toISOString(), "2026-10-06T09:55:00.000Z"]);
  assertEquals((await callF({ action: "log-message", phone: "351912345678", direction: "in", at: "2026-09-01T10:00:00Z" }, store)).error !== undefined, true);
  assertEquals(cleanPhone("00351 912 345 678"), "351912345678");
  assertEquals(cleanPhone("12345"), null);
});

const calendarCall = (body: unknown, calendar: Parameters<typeof handleBotRequest>[1]["calendar"]) =>
  handleBotRequest(
    new Request("https://x/functions/v1/bot-api", {
      method: "POST",
      headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": `10.0.1.${++ip % 250}` },
      body: JSON.stringify(body),
    }),
    { botKey: KEY, leads: null, calendar, now: () => new Date("2026-10-07T08:45:00Z") },
  );

Deno.test("availability gives two times and no client data, and never guesses without the calendar", async () => {
  const busy = {
    id: "x", summary: "Serviço 45€ (89€) Sofá - 912 000 000 - Cliente Inventado - Rua X 1, 2780-000 Oeiras",
    description: "Equipa: Lisboa 1", location: "", startDate: "2026-10-08", created: "", updated: "", status: "CONFIRMED",
    start: "2026-10-08T09:00:00Z", end: "2026-10-08T11:00:00Z",
  };
  const res = await calendarCall({ action: "availability", city: "Oeiras", date: "2026-10-08", items: [{ kind: "sofa", qty: 1 }] },
    () => Promise.resolve({ events: [busy] }));
  assertEquals(res.status, 200);
  const text = await res.text();
  assert(!text.includes("912") && !text.includes("Inventado") && !text.includes("Rua X"), text);
  const { availability } = JSON.parse(text);
  assertEquals(availability.teams, ["Lisboa 1", "Lisboa 2"]);
  assertEquals(availability.suggestion.slots.length, 2);

  assertEquals((await calendarCall({ action: "availability", city: "Oeiras" }, () => Promise.resolve({ error: "O calendário veio vazio" }))).status, 502);
  assertEquals((await calendarCall({ action: "availability", city: "Oeiras" }, null)).status, 503);
  assertEquals((await calendarCall({ action: "availability", city: "Oeiras", date: "amanhã" }, () => Promise.resolve({ events: [] }))).status, 400);
});

// Pre-bookings (2026-10-08): a fake table and a fake Apps Script.
function fakeHolds() {
  const rows = new Map<string, HoldRow>();
  const store: HoldStore = {
    get: id => Promise.resolve(rows.get(id) ?? null),
    recent: since => Promise.resolve([...rows.values()].filter(r => !r.released_at && (r.updated_at ?? "") >= since)),
    save: row => { rows.set(row.conversation_id, row); return Promise.resolve(null); },
    release: id => { const r = rows.get(id); if (r) r.released_at = "2026-10-07T09:00:00Z"; return Promise.resolve(null); },
  };
  return { rows, store };
}
function fakeScript() {
  const calls: Record<string, unknown>[] = [];
  let n = 0;
  const write: CalendarWriter = p => {
    calls.push(p);
    if (p.action === "release") return Promise.resolve({ ok: true, released: true });
    return Promise.resolve({ ok: true, eventId: (p.eventId as string) || `ev${++n}` });
  };
  return { calls, write };
}
const holdCall = (body: unknown, holds: HoldStore, write: CalendarWriter | null) =>
  handleBotRequest(
    new Request("https://x/functions/v1/bot-api", {
      method: "POST",
      headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": `10.0.2.${++ip % 250}` },
      body: JSON.stringify(body),
    }),
    // The feed never shows the new events here: the table has to cover Google's delay.
    { botKey: KEY, leads: null, calendar: () => Promise.resolve({ events: [] }), holds, writeCalendar: write, now: () => new Date("2026-10-07T08:45:00Z") },
  );
const hold = (conversationId: string, time = "15h") =>
  ({ action: "hold", conversationId, city: "Oeiras", items: [{ kind: "sofa", size: "3-lugares", qty: 1 }], date: "2026-10-08", time, name: "Cliente Inventado", phone: "900000000" });

Deno.test("hold writes one pre-booking per conversation, returns only times, and busies the slot before the feed shows it", async () => {
  const { rows, store } = fakeHolds();
  const script = fakeScript();
  const res = await holdCall(hold("a"), store, script.write);
  assertEquals(res.status, 200);
  const text = await res.text();
  assert(!text.includes("Inventado") && !text.includes("900000000"), text);
  assertEquals(JSON.parse(text).hold, { ok: true, slot: { date: "2026-10-08", time: "15h", durationMin: 60 }, moved: false });
  assert(String(script.calls[0].title).startsWith("Pré-reserva – Cliente Inventado – Oeiras"));

  // Moving: same event, not a second one.
  await holdCall(hold("a", "16h"), store, script.write);
  assertEquals(script.calls[1].eventId, "ev1");
  assertEquals(rows.size, 1);

  // Oeiras: Lisboa 1 is two people and Lisboa 2 one, so a third client fits at 16h and a fourth does not.
  assertEquals(JSON.parse(await (await holdCall(hold("b", "16h"), store, script.write)).text()).hold.ok, true);
  assertEquals(JSON.parse(await (await holdCall(hold("c", "16h"), store, script.write)).text()).hold.ok, true);
  const fourth = JSON.parse(await (await holdCall(hold("d", "16h"), store, script.write)).text()).hold;
  assertEquals(fourth.ok, false);
  assertEquals(fourth.taken, true);
  assertEquals(script.calls.length, 4);

  const rel = await holdCall({ action: "release", conversationId: "a" }, store, script.write);
  assertEquals(JSON.parse(await rel.text()).release.released, true);
  assertEquals(script.calls[4], { action: "release", eventId: "ev1" });
  assertEquals((await holdCall(hold("e"), store, null)).status, 503);
});

// The bot closes the job itself on weekdays (owner, 2026-10-09).
const book = (conversationId: string, over: Record<string, unknown> = {}) =>
  ({ ...hold(conversationId), action: "book", address: "Rua Inventada 1, 2780-000 Oeiras", service: "Limpeza de sofá 3 lugares", ...over });

Deno.test("book writes the owner's 'Serviço' in a team colour on a weekday, over the conversation's own pre-booking", async () => {
  const { rows, store } = fakeHolds();
  const script = fakeScript();
  await holdCall(hold("a"), store, script.write);
  const res = await holdCall(book("a"), store, script.write);
  const text = await res.text();
  assert(!text.includes("Inventad") && !text.includes("900000000"), text);
  assertEquals(JSON.parse(text).booking, { ok: true, slot: { date: "2026-10-08", time: "15h", durationMin: 60 }, team: "Lisboa 1" });
  const call = script.calls[1];
  assertEquals([call.action, call.eventId, call.colorId], ["book", "ev1", "6"]);
  assert(/^Serviço \d+€ \(\d+€\) Limpeza de sofá 3 lugares - 900000000 - Cliente Inventado - Rua Inventada 1/.test(String(call.title)), String(call.title));
  assertEquals(rows.get("a")?.title, call.title);
});

Deno.test("book leaves weekends, prices to confirm and missing data as a pre-booking for the owner", async () => {
  const { store } = fakeHolds();
  const script = fakeScript();
  const sat = JSON.parse(await (await holdCall(book("s", { date: "2026-10-10" }), store, script.write)).text()).booking;
  assertEquals([sat.ok, sat.weekend, sat.hold.ok], [false, true, true]);
  assert(String(script.calls[0].title).startsWith("Pré-reserva"));
  const rug = JSON.parse(await (await holdCall(book("r", { items: [{ kind: "rug", width: 2, length: 3 }] }), store, script.write)).text()).booking;
  assertEquals([rug.ok, typeof rug.handToOwner, rug.hold.ok], [false, "string", true]);
  const noAddress = JSON.parse(await (await holdCall(book("n", { address: "" }), store, script.write)).text()).booking;
  assertEquals([noAddress.ok, noAddress.missing, noAddress.hold.ok], [false, ["morada completa"], true]);
  assert(script.calls.every(c => c.action === "hold"));
});

Deno.test("book at an hour another service of the zone has: pre-booking for the owner (owner, 2026-10-09)", async () => {
  const { store } = fakeHolds();
  const script = fakeScript();
  await holdCall(book("first"), store, script.write);
  const second = JSON.parse(await (await holdCall(book("second", { phone: "911111111" }), store, script.write)).text()).booking;
  assertEquals([second.ok, second.sameTime, second.hold.ok], [false, true, true]);
  assertEquals(script.calls.map(c => c.action), ["book", "hold"]);
});

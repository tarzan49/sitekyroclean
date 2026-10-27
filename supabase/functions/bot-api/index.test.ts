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
    recentQuiz() {
      return Promise.resolve({ data: rows.filter(r => r.source !== "WhatsApp"), error: null });
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

Deno.test("find-order gives the bot the order as data, by number or by the chat's phone", async () => {
  const quizOrder = {
    v: 1, service: "carpet", city: "Faro", lines: [{ label: "Tapete 1: 2,3 × 1,6 m (3,68 m²)", qty: 1, price: null }],
    quote: { items: [{ kind: "rug", qty: 1, treatment: "clean", width: 2.3, length: 1.6 }], exact: true },
    rugs: [{ kind: "rug", typed: "230 × 160", width: 2.3, length: 1.6, areaM2: 3.68, fromCm: true, doubtful: false }],
    rugPickup: false, total: null, priceText: "Sob orçamento", sobOrcamento: true, observations: "Rua das Flores 3", slot: null,
  };
  const leads = fakeLeads([{ booking_id: "AB12CD34", name: "Julia Costa", phone: "+351 912 345 678", source: "Website", service: "Tapete", details: "x", location: "Faro", value: "Sob orçamento", quiz_order: quizOrder }]);
  const byNumber = await (await call({ action: "find-order", order: "AB12CD34", phone: "351912345678" }, { leads })).json();
  assertEquals([byNumber.found, byNumber.matchedBy, byNumber.phoneMatches], [true, "number", true]);
  assertEquals(byNumber.order.brief.quoteRequest, { items: quizOrder.quote.items, city: "Faro" });
  assert(byNumber.order.brief.alreadyKnown.includes("as medidas de cada tapete ou alcatifa"));
  assertEquals(byNumber.order.brief.observations, "Rua das Flores 3");
  const byPhone = await (await call({ action: "find-order", phone: "912345678" }, { leads })).json();
  assertEquals([byPhone.found, byPhone.matchedBy, byPhone.order.number], [true, "phone", "AB12CD34"]);
  // Someone else's number typed in another chat: the order, never its observations.
  const other = await (await call({ action: "find-order", order: "AB12CD34", phone: "939999999" }, { leads })).json();
  assertEquals([other.phoneMatches, other.order.brief.observations], [false, null]);
  assert(!JSON.stringify(other).includes("912 345 678"));
  assertEquals((await call({ action: "find-order" }, { leads })).status, 400);
});

Deno.test("new-orders: quiz orders after since, oldest first, with phone and the first message; no tests", async () => {
  const leads = fakeLeads([
    { booking_id: "NEW00002", created_at: "2026-10-11T10:05:00Z", name: "Rui Costa", phone: "+351 913 456 789", source: "Website", service: "Sofá", service_type: "Higienização Profunda", details: "1x Sofá 3 Lugares: 79€", location: "Porto" },
    { booking_id: "NEW00001", created_at: "2026-10-11T10:01:00Z", name: "Ana", phone: "912345678", source: "Website", service: "Tapete", service_type: "Higienização Profunda", details: "1x Tapete 1: 2,3 × 1,6 m (3,68 m²): Sob orçamento", location: "Faro" },
    { booking_id: "OLD00001", created_at: "2026-10-11T09:00:00Z", name: "Velho", phone: "934567890", source: "Website", service: "Sofá", location: "Porto" },
    { booking_id: "TEST0001", created_at: "2026-10-11T10:02:00Z", name: "Teste Google", phone: "911111111", source: "Website", service: "Sofá", location: "Porto" },
  ]);
  const body = await (await call({ action: "new-orders", since: "2026-10-11T10:00:00Z" }, { leads })).json();
  assertEquals(body.orders.map((o: Row) => o.number), ["NEW00001", "NEW00002"]);
  assertEquals(body.orders[0].phone, "912345678");
  assert(body.orders[0].message.startsWith("Olá Ana, tudo bem?"));
  assert(body.orders[0].message.includes("• Tapete de 2,3 × 1,6 m (3,68 m²)"));
  assertEquals((await call({ action: "new-orders" }, { leads })).status, 400);
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
  assertEquals(availability.teams, ["Lisboa 1"]);
  assertEquals(availability.suggestion.slots.length, 2);

  assertEquals((await calendarCall({ action: "availability", city: "Oeiras" }, () => Promise.resolve({ error: "O calendário veio vazio" }))).status, 502);
  assertEquals((await calendarCall({ action: "availability", city: "Oeiras" }, null)).status, 503);
  assertEquals((await calendarCall({ action: "availability", city: "Oeiras", date: "amanhã" }, () => Promise.resolve({ events: [] }))).status, 400);
});

Deno.test("agenda-check reports tomorrow's problems without client data", async () => {
  const job = {
    id: "y", summary: "Serviço 30€ (59€) Colchão casal - Cliente Inventado - Porto",
    description: "", location: "", startDate: "2026-10-08", created: "", updated: "", status: "CONFIRMED",
    start: "2026-10-08T09:00:00Z", end: "2026-10-08T10:00:00Z",
  };
  const res = await calendarCall({ action: "agenda-check" }, () => Promise.resolve({ events: [job] }));
  assertEquals(res.status, 200);
  const text = await res.text();
  assert(!text.includes("Inventado"), text);
  const { agenda } = JSON.parse(text);
  assertEquals(agenda.date, "2026-10-08");
  assertEquals(agenda.issues.map((i: { problem: string }) => i.problem), ["sem equipa escolhida (falta a cor)", "sem telefone", "morada sem rua e número nem código postal"]);
  assertEquals((await calendarCall({ action: "agenda-check", date: "amanhã" }, () => Promise.resolve({ events: [] }))).status, 400);
  assertEquals((await calendarCall({ action: "agenda-check" }, null)).status, 503);
});

Deno.test("label-facts gives past, next and pending dates by the phone's last 9 digits, never titles or names", async () => {
  // Invented data only: the repo is public. Calendar "now" is 7 Oct 2026, 09:45 in Portugal.
  const ev = (id: string, start: string, summary: string, extra: Record<string, string> = {}) => ({
    id, summary, description: "", location: "", startDate: start.slice(0, 10), created: "", updated: "", status: "CONFIRMED",
    start, end: null, ...extra,
  });
  const events = [
    ev("a", "2026-09-20T09:00:00Z", "Serviço 45€ (89€) Sofá - \u202a+351 912 345 678\u202c - Cliente Inventado - Rua X 1, 4000-123 Porto"),
    ev("b", "2026-10-09T13:00:00Z", "Serviço 30€ (59€) Colchão - 912.345.678 - Cliente Inventado - Rua X 1"),
    ev("c", "2026-10-08T09:00:00Z", "Pré-reserva – Outro Inventado – Gaia – sofá – 89€ – 913 000 111"),
    ev("d", "2026-10-08T09:00:00Z", "Serviço 45€ (89€) Sofá - 914 222 333", { status: "CANCELLED" }),
    ev("e", "2026-10-08T09:00:00Z", "Voo para o Porto - 915 444 555"),
  ];
  const res = await calendarCall({
    action: "label-facts",
    phones: ["351912345678@s.whatsapp.net", "351913000111:7@s.whatsapp.net", "914222333", "+351 915 444 555", "912345678123456@lid", "1234", "120363000000000000@g.us"],
  }, () => Promise.resolve({ events }));
  assertEquals(res.status, 200);
  const text = await res.text();
  for (const secret of ["Inventado", "Rua", "Serviço", "Gaia", "€"]) assert(!text.includes(secret), secret);
  assertEquals(JSON.parse(text).facts, {
    "912345678": { past: "2026-09-20", next: "2026-10-09", pending: null },
    "913000111": { past: null, next: null, pending: "2026-10-08" },
  });
  // A lid or a group whose digits end like a client's phone is not that client.
  const lids = await calendarCall({ action: "label-facts", phones: ["100000912345678@lid", "120363000913000111@g.us"] }, () => Promise.resolve({ events }));
  assertEquals((await lids.json()).facts, {});
});

Deno.test("label-facts sees the bot's own booking before Google's feed shows it", async () => {
  const holds: HoldStore = {
    get: () => Promise.resolve(null),
    recent: () => Promise.resolve([{ conversation_id: "conv", event_id: "new", title: "Serviço 45€ (89€) Sofá - 916 777 888 - Inventado - Rua Y 2", starts_at: "2026-10-12T09:00:00Z", ends_at: "2026-10-12T10:00:00Z", updated_at: "2026-10-07T08:30:00Z", released_at: null }]),
    save: () => Promise.resolve(null),
    release: () => Promise.resolve(null),
  };
  const res = await handleBotRequest(
    new Request("https://x/functions/v1/bot-api", {
      method: "POST",
      headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": `10.0.1.${++ip % 250}` },
      body: JSON.stringify({ action: "label-facts", phones: ["916777888"] }),
    }),
    { botKey: KEY, leads: null, calendar: () => Promise.resolve({ events: [] }), holds, now: () => new Date("2026-10-07T08:45:00Z") },
  );
  assertEquals((await res.json()).facts, { "916777888": { past: null, next: "2026-10-12", pending: null } });
});

Deno.test("label-facts takes 800 phones in any format, and only that action may pass 20 KB", async () => {
  const phones = Array.from({ length: 800 }, (_, i) => `3519${String(10_000_000 + i).padStart(8, "0")}:12@s.whatsapp.net`);
  const big = JSON.stringify({ action: "label-facts", phones });
  assert(big.length > 20_000 && big.length < 40_000, String(big.length));
  const ok = await calendarCall({ action: "label-facts", phones }, () => Promise.resolve({ events: [] }));
  assertEquals([ok.status, (await ok.json()).facts], [200, {}]);
  assertEquals((await calendarCall({ action: "cities", padding: "x".repeat(25_000) }, null)).status, 413);
  assertEquals((await calendarCall({ action: "label-facts", phones: phones.concat(["912345678"]) }, () => Promise.resolve({ events: [] }))).status, 400);
  assertEquals((await calendarCall({ action: "label-facts", phones: "912345678" }, () => Promise.resolve({ events: [] }))).status, 400);
  assertEquals((await calendarCall({ action: "label-facts", phones: [912345678] }, () => Promise.resolve({ events: [] }))).status, 400);
  assertEquals((await calendarCall({ action: "label-facts", phones: ["912345678"] }, () => Promise.resolve({ error: "O calendário veio vazio" }))).status, 502);
  assertEquals((await calendarCall({ action: "label-facts", phones: ["912345678"] }, null)).status, 503);
  // Nothing that is a phone: no need to read the calendar at all.
  const none = await calendarCall({ action: "label-facts", phones: ["123@lid", "abc"] }, () => Promise.resolve({ error: "não devia ser lido" }));
  assertEquals([none.status, (await none.json()).facts], [200, {}]);
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

  // Oeiras: only Lisboa 1 since 19 Oct (two people), so a second client fits at 16h and a third does not.
  assertEquals(JSON.parse(await (await holdCall(hold("b", "16h"), store, script.write)).text()).hold.ok, true);
  const third = JSON.parse(await (await holdCall(hold("c", "16h"), store, script.write)).text()).hold;
  assertEquals(third.ok, false);
  assertEquals(third.taken, true);
  assertEquals(script.calls.length, 3);

  const rel = await holdCall({ action: "release", conversationId: "a" }, store, script.write);
  assertEquals(JSON.parse(await rel.text()).release.released, true);
  assertEquals(script.calls[3], { action: "release", eventId: "ev1" });
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

Deno.test("book leaves prices to confirm and missing data as a pre-booking for the owner; weekends close (owner, 18 Oct)", async () => {
  const { store } = fakeHolds();
  const script = fakeScript();
  const sat = JSON.parse(await (await holdCall(book("s", { date: "2026-10-10" }), store, script.write)).text()).booking;
  assertEquals(sat.ok, true);
  assertEquals(script.calls[0].action, "book");
  script.calls.length = 0;
  const rug = JSON.parse(await (await holdCall(book("r", { phone: "911000001", items: [{ kind: "rug", width: 2, length: 3 }] }), store, script.write)).text()).booking;
  assertEquals([rug.ok, typeof rug.handToOwner, rug.hold.ok], [false, "string", true]);
  // Another phone: the Saturday client above already has a service, and a second one of the same phone is a reschedule.
  const noAddress = JSON.parse(await (await holdCall(book("n", { phone: "911000002", address: "" }), store, script.write)).text()).booking;
  assertEquals([noAddress.ok, noAddress.missing, noAddress.hold.ok], [false, ["morada completa"], true]);
  // A rug pickup in the Braga zone is never closed by the bot: the Braga team does not pick up rugs (owner, 27 Oct).
  const viana = JSON.parse(await (await holdCall(book("v", { phone: "911000003", city: "Viana do Castelo", address: "Rua Inventada 1, 4900-000 Viana do Castelo",
    items: [{ kind: "rug", width: 3, length: 2.5 }], rugPickup: true, agreedTotal: 129, service: "Recolha de tapete" }), store, script.write)).text()).booking;
  assertEquals([viana.ok, /Braga não faz recolhas/.test(viana.handToOwner), viana.hold.ok], [false, true, true]);
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

Deno.test("notify-owner emails the owner and refuses without subject or text", async () => {
  const sent: (string | undefined)[][] = [];
  const env = { botKey: KEY, leads: null, notifyOwner: (s: string, t: string, h?: string) => { sent.push(h ? [s, t, h] : [s, t]); return Promise.resolve(null); } };
  const post = (body: unknown) => handleBotRequest(new Request("https://x/functions/v1/bot-api", {
    method: "POST", headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": `10.0.9.${++ip % 250}` }, body: JSON.stringify(body),
  }), env);
  const ok = await post({ action: "notify-owner", subject: "Agenda\nde amanhã", text: "3 serviços" });
  assertEquals(ok.status, 200);
  assertEquals(sent, [["Agenda de amanhã", "3 serviços"]]);
  assertEquals((await post({ action: "notify-owner", subject: "", text: "x" })).status, 400);
  // The handoff alerts also carry an HTML version, laid out for the phone (16 Oct 2026).
  await post({ action: "notify-owner", subject: "Responde tu", text: "texto", html: "<p>texto</p>" });
  assertEquals(sent[1], ["Responde tu", "texto", "<p>texto</p>"]);
  const off = await handleBotRequest(new Request("https://x/functions/v1/bot-api", {
    method: "POST", headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": `10.0.9.${++ip % 250}` }, body: JSON.stringify({ action: "notify-owner", subject: "a", text: "b" }),
  }), { botKey: KEY, leads: null });
  assertEquals(off.status, 503);
});

Deno.test("team-accounts: what each team owes, from the CRM and the calendar's team line, never phones", async () => {
  // Invented data only: the repo is public.
  const events = [{
    id: "e1", summary: "Serviço 40€ (79€) Sofá - 912 345 678 - Ana Inventada - Rua X 1", description: "Equipa: Lisboa 1",
    location: "", startDate: "2026-10-13", created: "", updated: "", status: "CONFIRMED", start: null, end: null,
  }];
  const rows = [{
    request_date: "2026-10-13", client_name: "Ana Inventada", city: "Odivelas", locality: "Lisboa", billed_value: 79,
    my_cut: 40, upsell_value: 0, upsell_team: null, paid: false, calendar_event_id: "e1", calendar_missing_since: null,
  }];
  const call = (body: unknown, accounts: (() => Promise<{ rows: Record<string, unknown>[] } | { error: string }>) | null) =>
    handleBotRequest(new Request("https://x/functions/v1/bot-api", {
      method: "POST",
      headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": `10.0.2.${++ip % 250}` },
      body: JSON.stringify(body),
    }), { botKey: KEY, leads: null, calendar: () => Promise.resolve({ events }), accounts, now: () => new Date("2026-10-13T23:05:00Z") });
  const res = await call({ action: "team-accounts", date: "2026-10-13" }, () => Promise.resolve({ rows }));
  assertEquals(res.status, 200);
  const text = await res.text();
  assert(!text.includes("912"), text);
  const { accounts } = JSON.parse(text);
  assertEquals(accounts.teams.map((t: { team: string; total: number }) => [t.team, t.total]), [["Lisboa 1", 40]]);
  assertEquals((await call({ action: "team-accounts", date: "ontem" }, () => Promise.resolve({ rows }))).status, 400);
  assertEquals((await call({ action: "team-accounts" }, null)).status, 503);
});

Deno.test("conversations-upsert grava linhas válidas e recusa as inválidas", async () => {
  const saved: Row[][] = [];
  const env = { botKey: KEY, leads: fakeLeads(), conversations: async (rows: Row[]) => { saved.push(rows); return {}; } };
  const send = (body: unknown) => handleBotRequest(new Request("https://x/functions/v1/bot-api", {
    method: "POST", body: JSON.stringify(body),
    headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": "10.9.9.9" },
  }), env);
  const ok = await send({ action: "conversations-upsert", rows: [{ contact_key: "351910000001", first_at: "2026-10-01T10:00:00Z", origin: "google", inbound_count: 3 }] });
  assertEquals(ok.status, 200);
  assertEquals(saved[0][0].origin, "google");
  const bad = await send({ action: "conversations-upsert", rows: [{ contact_key: "x", first_at: "2026-10-01", origin: "google" }] });
  assertEquals(bad.status, 400);
});

Deno.test("a reschedule keeps the event's team: a busy team keeps the old hour and the owner is told (16 Oct)", async () => {
  const ev = (id: string, phone: string, start: string, end: string, team: string) => ({
    id, summary: `Serviço 108€ (215€) Impermeabilização Premium de 8 cadeiras - ${phone} - Cliente Inventado - Rua X 1, 2640-000 Mafra`,
    description: `Equipa: ${team}\n\nbot:${phone}@s.whatsapp.net`, location: "", startDate: start.slice(0, 10), created: "", updated: "", status: "CONFIRMED", start, end,
  });
  const events = [ev("mine", "900000001", "2026-10-19T09:00:00Z", "2026-10-19T10:45:00Z", "Porto 2"),
    ev("other", "900000002", "2026-10-19T07:00:00Z", "2026-10-19T08:00:00Z", "Porto 2")];
  const writes: Record<string, unknown>[] = [], mails: string[] = [];
  const call = (time: string) => handleBotRequest(
    new Request("https://x/functions/v1/bot-api", {
      method: "POST",
      headers: { "x-bot-key": KEY, "content-type": "application/json", "x-forwarded-for": `10.0.3.${++ip % 250}` },
      body: JSON.stringify({ action: "update-booking", eventId: "mine", phone: "900000001", changes: { date: "2026-10-19", time, postcode: "2640-813" } }),
    }),
    { botKey: KEY, leads: null, calendar: () => Promise.resolve({ events }), now: () => new Date("2026-10-16T12:30:00Z"),
      writeCalendar: p => { writes.push(p); return Promise.resolve({ ok: true, eventId: "mine" }); },
      notifyOwner: (subject: string) => { mails.push(subject); return Promise.resolve(null); } },
  ).then(r => r.json());

  // Porto 2 works weekdays 8h-13h (owner, 27 Oct), so the fixture stays in the morning.
  // 09:00 Lisbon = 08:00 UTC: Porto 2 (one person) has the 8h job until 9h, plus the drive.
  const busy = await call("09:00");
  assertEquals([busy.update.ok, busy.update.moved, busy.update.teamBusy], [true, false, "Porto 2"]);
  assertEquals(writes[0].start, "2026-10-19T09:00:00Z");
  assert(String(writes[0].title).includes("2640-813"));
  assert(mails.some(m => m.includes("Porto 2 está ocupada")), mails.join());

  // 11:00 Lisbon is free for the team and the 1h45 job ends by 13h: the event moves.
  const free = await call("11:00");
  assertEquals([free.update.ok, free.update.moved, free.update.teamBusy], [true, true, undefined]);
  assertEquals(writes[1].start, "2026-10-19T10:00:00.000Z");

  // 15:00 Lisbon on a weekday: no other job, but Porto 2 does not work afternoons (owner, 27 Oct).
  const afternoon = await call("15:00");
  assertEquals([afternoon.update.ok, afternoon.update.moved, afternoon.update.teamBusy], [true, false, "Porto 2"]);
  assertEquals(writes[2].start, "2026-10-19T09:00:00Z");
});

// Runs with: deno test --no-lock --allow-env --allow-net supabase/functions/follow-up-digest/
// Dados inventados: o repositório é público.
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handleDigestRequest, type DigestEnv, type DigestStore, type Mailer } from "./index.ts";

const KEY = "k".repeat(40);

const CLIENT = {
  id: "c1", phone: "351900000001", name: null, whatsapp_name: "Maria Teste", status: "cliente",
  services: ["Sofá"], region: "Lisboa", from_google_ads: false, reviewed_google: false, labels: [],
  first_contact_at: "2026-10-01T10:00:00Z", last_contact_at: "2026-10-05T18:00:00Z",
  last_client_message_at: "2026-10-05T17:00:00Z", notes: null, source: "WhatsApp",
};
const SERVICE = {
  id: "s1", request_date: "2026-10-05", description: "Limpeza sofá 3 lugares", billed_value: 89,
  client_name: null, city: null, phone: "+351 900 000 001", locality: "Lisboa",
};

function fakes(opts: { sent?: boolean; clients?: unknown[] } = {}) {
  const log = { recorded: [] as [string, number, string | null][], mails: [] as string[] };
  const store: DigestStore = {
    load: () => Promise.resolve({ clients: (opts.clients ?? [CLIENT]) as never[], services: [SERVICE], touches: [] }),
    sentOn: () => Promise.resolve(!!opts.sent),
    record: (day, items, error) => { log.recorded.push([day, items, error]); return Promise.resolve(); },
  };
  const mailer: Mailer = { send: (subject) => { log.mails.push(subject); return Promise.resolve(null); } };
  return { store, mailer, log };
}

const call = (now: string, opts: { key?: string | null; admin?: boolean; body?: unknown; sent?: boolean; clients?: unknown[] } = {}) => {
  const f = fakes(opts);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.key !== null) headers["x-digest-key"] = opts.key ?? KEY;
  const env: DigestEnv = { key: KEY, store: f.store, mailer: f.mailer, isAdmin: () => Promise.resolve(!!opts.admin), now: () => new Date(now) };
  const req = new Request("https://x/functions/v1/follow-up-digest", { method: "POST", headers, body: JSON.stringify(opts.body ?? { send: true }) });
  return handleDigestRequest(req, env).then(async res => ({ res, json: await res.json(), log: f.log }));
};

Deno.test("rejects a wrong key and calls without key or admin session", async () => {
  assertEquals((await call("2026-10-06T08:30:00Z", { key: "wrong" })).res.status, 401);
  assertEquals((await call("2026-10-06T08:30:00Z", { key: null })).res.status, 401);
});

Deno.test("cron sends only at 9h in Lisbon, once a day", async () => {
  // Hora de verão: 8h30 UTC são 9h30 em Lisboa; 9h30 UTC já são 10h30.
  const summer = await call("2026-10-06T08:30:00Z");
  assertEquals(summer.json.sent, true);
  assertEquals(summer.log.recorded[0][0], "2026-10-06");
  assertEquals((await call("2026-10-06T09:30:00Z")).json.skipped, "fora da hora");
  assertEquals((await call("2026-10-06T08:30:00Z", { sent: true })).json.skipped, "já enviado hoje");
  // Hora de inverno: 9h30 UTC são 9h30 em Lisboa.
  assertEquals((await call("2026-12-07T09:30:00Z")).json.sent !== undefined, true);
  // Ver sem enviar funciona a qualquer hora, e não regista o dia.
  const preview = await call("2026-10-06T21:00:00Z", { body: { send: false } });
  assertEquals([preview.json.count, preview.log.mails.length, preview.log.recorded.length], [1, 0, 0]);
});

Deno.test("an admin can preview the e-mail without sending it", async () => {
  const { json, log } = await call("2026-10-06T15:00:00Z", { key: null, admin: true, body: { send: false } });
  assertEquals(log.mails.length, 0);
  assertEquals(json.count, 1);
  assertStringIncludes(json.subject, "1 pessoa para seguir hoje");
  assertStringIncludes(json.html, "Pedir avaliação");
  assertStringIncludes(json.html, "https://g.page/r/CRc7F7lX3xcEECE/review");
});

Deno.test("nothing to follow: records the day and sends nothing", async () => {
  const quiet = { ...CLIENT, status: "nao_interessado", last_contact_at: "2026-06-01T10:00:00Z", last_client_message_at: "2026-06-01T09:00:00Z", phone: "351900000009" };
  const { json, log } = await call("2026-10-06T08:30:00Z", { clients: [quiet] });
  assertEquals(json.sent, false);
  assertEquals(log.mails.length, 0);
  assertEquals(log.recorded, [["2026-10-06", 0, null]]);
});

Deno.test("pending bot pre-bookings go on top of the email and count", async () => {
  const { withHolds } = await import("./index.ts");
  const base = { subject: "Kyro · nada para seguir hoje", html: "<p>x</p>", text: "x", count: 0, campaigns: [] };
  assertEquals(withHolds(base, []), base);
  const d = withHolds(base, [{ title: "Pré-reserva – Cliente Inventado – Porto – Sofá – 89€", starts_at: "2026-10-21T14:00:00Z" }]);
  assertEquals(d.count, 1);
  assertEquals(d.subject, "Kyro · 1 pré-reserva do bot por confirmar");
  assertEquals(d.html.startsWith("<h3>Pré-reservas do bot por confirmar (1)</h3>"), true);
  assertStringIncludes(d.text, "15:00 · Pré-reserva – Cliente Inventado");
});

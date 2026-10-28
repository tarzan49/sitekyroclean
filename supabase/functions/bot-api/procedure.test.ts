import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { procedureDue, procedureMedia, procedureSent, type ProcedureStore } from "./procedure.ts";

// Invented data only: the repo is public.
type Row = Record<string, unknown>;
const ev = (id: string, summary: string, start: string, end: string, team?: string) =>
  ({ id, summary, description: team ? `Equipa: ${team}\n\nnotas` : "", location: "", startDate: start.slice(0, 10), created: start, updated: start, status: "CONFIRMED", start, end });

function fakeStore(initial: Row[] = [], services: Row[] = [], reviews: Row[] = [], clients: Row[] = []) {
  const table = new Map(initial.map(r => [String(r.calendar_event_id), { ...r }]));
  const store: ProcedureStore = {
    records: async since => [...table.values()].filter(r => String(r.service_day) >= since),
    byPrompt: async id => [...table.values()].find(r => (r.prompt_msg_ids as string[]).includes(id)) ?? null,
    services: async ids => services.filter(s => ids.includes(String(s.calendar_event_id))),
    reviews: async ids => reviews.filter(r => ids.includes(String(r.service_request_id))),
    clients: async keys => clients.filter(c => keys.some(k => String(c.phone).endsWith(k))),
    upsert: async row => { table.set(String(row.calendar_event_id), { ...(table.get(String(row.calendar_event_id)) ?? {}), ...row }); return null; },
    update: async (id, patch) => { const r = table.get(id); if (r) Object.assign(r, patch); return null; },
  };
  return { store, table };
}
const json = async (r: Response) => (await r.json()) as Row;

Deno.test("a service that just ended gets its message; revisits, other events and old services do not", async () => {
  const now = new Date("2026-10-15T17:30:00Z");
  const events = [
    ev("s1", "Serviço 40€ (80€) Limpeza de sofá - 912000000 - Ana Teste - Rua Inventada 1", "2026-10-15T14:00:00Z", "2026-10-15T15:00:00Z", "Porto 2"),
    ev("s2", "Serviço 0€ (0€) Revisita - 912000001 - Rui", "2026-10-15T12:00:00Z", "2026-10-15T13:00:00Z", "Porto 2"),
    ev("s3", "Jantar", "2026-10-15T12:00:00Z", "2026-10-15T13:00:00Z"),
    ev("s4", "Serviço 40€ (80€) sofá", "2026-10-15T18:00:00Z", "2026-10-15T19:00:00Z", "Porto 2"),
    ev("s5", "Serviço 40€ (80€) sofá", "2026-10-13T14:00:00Z", "2026-10-13T15:00:00Z", "Porto 2"),
    ev("s6", "Serviço 40€ (80€) sofá", "2026-10-15T14:00:00Z", "2026-10-15T15:00:00Z", "Lisboa 1"),
  ];
  const { store } = fakeStore([], [{ id: "c1", calendar_event_id: "s1", client_name: "Ana Teste", city: "Paranhos", description: "Limpeza de sofá de 3 lugares" }]);
  const body = await json(await procedureDue(events, store, now));
  const prompts = body.prompts as Row[];
  // s6: Lisboa 1 counts from 15/10, like Porto (owner, 14 Oct).
  assertEquals(prompts.map(p => p.eventId), ["s1", "s6"]);
  assertEquals(prompts[0].label, "Ana, Paranhos");
  assert(String(prompts[0].message).startsWith("Serviço terminado: Ana, Paranhos (Limpeza de sofá de 3 lugares), 15/10 às 15h."));
  // The review request no longer goes to the team (owner, 28 Oct): the bot sends it to the client.
  assertEquals(prompts[0].clientMessage, undefined);
  assert(!JSON.stringify(prompts).includes("912000000"), "no phone in the team prompts");
  assertEquals(body.clientReviews, []);
});

Deno.test("prompt ids saved; photos and video in reply fill the slots once; a reply to something else is not found", async () => {
  const now = new Date("2026-10-15T17:40:00Z");
  const { store, table } = fakeStore();
  await procedureSent({ eventId: "s1", team: "Porto 2", serviceDay: "2026-10-15", messageIds: ["m1", "m2"] }, store, now);
  assertEquals(table.get("s1")?.prompt_msg_ids, ["m1", "m2"]);

  const r1 = await json(await procedureMedia({ quotedId: "m2", label: "Ana", items: [
    { kind: "image", messageId: "p1", at: "2026-10-15T17:35:00Z" },
    { kind: "image", messageId: "p2", at: "2026-10-15T17:35:05Z" },
  ] }, store, now));
  assertEquals(r1.received, ["before", "after"]);
  assertEquals(r1.message, "Recebido para Ana: fotografia de antes e fotografia de depois. Falta: vídeo. E a avaliação do cliente até 22/10.");

  const r2 = await json(await procedureMedia({ quotedId: "m1", label: "Ana", items: [
    { kind: "image", messageId: "p3", caption: "antes" }, { kind: "video", messageId: "v1" },
  ] }, store, now));
  assertEquals(r2.received, ["video"]);
  assertEquals(table.get("s1")?.before_msg_id, "p1");
  assertEquals(table.get("s1")?.video_msg_id, "v1");

  assertEquals((await json(await procedureMedia({ quotedId: "zz", items: [{ kind: "video", messageId: "v9" }] }, store, now))).found, false);
});

Deno.test("the day after, a reminder; at the end of the 7th day, closed with a notice and the state saved", async () => {
  const rec = { calendar_event_id: "s1", service_request_id: "c1", team: "Porto 2", service_day: "2026-10-15", prompt_msg_ids: ["m1"],
    prompted_at: "2026-10-15T17:00:00Z", before_msg_id: "p1", before_at: "2026-10-15T17:35:00Z", after_msg_id: null, after_at: null,
    video_msg_id: null, video_at: null, reminders_sent: 0, last_reminder_at: null, status: "em_curso", closed_at: null, penalty_paid: false };
  const events = [ev("s1", "Serviço 40€ (80€) sofá", "2026-10-15T14:00:00Z", "2026-10-15T15:00:00Z", "Porto 2")];
  const services = [{ id: "c1", calendar_event_id: "s1", client_name: "Ana Teste", city: "Paranhos" }];

  const { store } = fakeStore([rec], services);
  const day1 = await json(await procedureDue(events, store, new Date("2026-10-16T09:30:00Z")));
  assertEquals((day1.reminders as Row[]).map(r => r.reminderIndex), [0]);
  assertEquals(day1.closed, []);

  const late = fakeStore([{ ...rec, reminders_sent: 2 }], services);
  const day8 = await json(await procedureDue(events, late.store, new Date("2026-10-23T00:10:00Z")));
  assertEquals(day8.reminders, []);
  assertEquals((day8.closed as Row[]).map(c => c.message), [
    "O prazo do serviço Ana, Paranhos, 15/10, acabou sem fotografia de depois, vídeo e avaliação do cliente. O procedimento deste serviço ficou incompleto. Neste serviço a equipa fica com 45%.",
  ]);
  assertEquals(late.table.get("s1")?.status, "fechado");
  // Next round: already closed, no second notice.
  assertEquals((await json(await procedureDue(events, late.store, new Date("2026-10-23T09:00:00Z")))).closed, []);
});

Deno.test("a service deleted from the calendar or moved to another team gets no reminder and no closing notice (Kseniia, 27/10)", async () => {
  const rec = { calendar_event_id: "s1", service_request_id: "c1", team: "Porto 2", service_day: "2026-10-15", prompt_msg_ids: ["m1"],
    prompted_at: "2026-10-15T17:00:00Z", before_msg_id: null, before_at: null, after_msg_id: null, after_at: null,
    video_msg_id: null, video_at: null, reminders_sent: 0, last_reminder_at: null, status: "em_curso", closed_at: null, penalty_paid: false };
  const services = [{ id: "c1", calendar_event_id: "s1", client_name: "Ana Teste", city: "Paranhos" }];
  const moved = [ev("s1", "Serviço 40€ (80€) sofá", "2026-10-15T14:00:00Z", "2026-10-15T15:00:00Z", "Porto 1")];
  for (const events of [[], moved]) {
    const day1 = await json(await procedureDue(events, fakeStore([rec], services).store, new Date("2026-10-16T09:30:00Z")));
    assertEquals(day1.reminders, []);
    const day8 = await json(await procedureDue(events, fakeStore([{ ...rec, reminders_sent: 2 }], services).store, new Date("2026-10-23T00:10:00Z")));
    assertEquals(day8.closed, []);
  }
});

Deno.test("only the review missing: the team keeps 45% (owner's rule of 20/10; 27/10 the bot told Aleixo 50%)", async () => {
  const rec = { calendar_event_id: "s1", service_request_id: "c1", team: "Porto 2", service_day: "2026-10-19", prompt_msg_ids: ["m1"],
    prompted_at: "2026-10-19T11:00:00Z", before_msg_id: "p1", before_at: "2026-10-19T11:30:00Z", after_msg_id: "p2", after_at: "2026-10-19T11:31:00Z",
    video_msg_id: "v1", video_at: "2026-10-19T11:32:00Z", reminders_sent: 2, last_reminder_at: null, status: "em_curso", closed_at: null, penalty_paid: false };
  const events = [ev("s1", "Serviço 40€ (79€) sofá", "2026-10-19T09:00:00Z", "2026-10-19T10:30:00Z", "Porto 2")];
  const services = [{ id: "c1", calendar_event_id: "s1", client_name: "Larry", city: "Porto" }];
  const day8 = await json(await procedureDue(events, fakeStore([rec], services).store, new Date("2026-10-27T08:00:00Z")));
  assertEquals((day8.closed as Row[]).map(c => c.message), [
    "O prazo do serviço Larry, Porto, 19/10, acabou sem avaliação do cliente. O procedimento deste serviço ficou incompleto. Neste serviço a equipa fica com 45%.",
  ]);
});

Deno.test("client review request: once, at the end of the service, never to a paused, opted-out or reviewed client", async () => {
  const base = { prompt_msg_ids: ["m1"], prompted_at: "2026-10-15T15:01:00Z", team: "Porto 2", service_day: "2026-10-15", status: "em_curso", reminders_sent: 0 };
  const events = [
    ev("s1", "Serviço 40€ (80€) Limpeza de sofá - 912000000 - Ana Teste - Rua Inventada 1", "2026-10-15T14:00:00Z", "2026-10-15T15:00:00Z", "Porto 2"),
    ev("s2", "Serviço 40€ (80€) sofá - 912000001 - Rui Teste - Rua Inventada 2", "2026-10-15T14:00:00Z", "2026-10-15T15:00:00Z", "Porto 2"),
    ev("s3", "Serviço 40€ (80€) sofá - 912000002 - Eva Teste - Rua Inventada 3", "2026-10-15T14:00:00Z", "2026-10-15T15:00:00Z", "Lisboa 1"),
    ev("s4", "Serviço 40€ (80€) sofá - Sem Telefone - Rua Inventada 4", "2026-10-15T14:00:00Z", "2026-10-15T15:00:00Z", "Porto 2"),
  ];
  const { store, table } = fakeStore(
    [
      { ...base, calendar_event_id: "s1", after_at: "2026-10-15T15:10:00Z" },
      { ...base, calendar_event_id: "s2" },
      { ...base, calendar_event_id: "s3", team: "Lisboa 1" },
      { ...base, calendar_event_id: "s4" },
    ],
    [{ id: "c1", calendar_event_id: "s1", client_name: "Ana Teste", city: "Paranhos", description: "Limpeza de sofá de 3 lugares" }],
    [],
    [{ phone: "351912000001", contact_preference: "normal", on_hold_reason: "Queixa: mancha", reviewed_google: false }],
  );
  // 16h15 in Lisbon: s1 has the after photo, the others are only 1h15 past the end.
  let body = await json(await procedureDue(events, store, new Date("2026-10-15T15:15:00Z")));
  assertEquals((body.clientReviews as Row[]).map(c => c.eventId), ["s1"]);
  const first = (body.clientReviews as Row[])[0];
  assertEquals(first.phone, "351912000000");
  assert(String(first.message).startsWith("Olá Ana, obrigado por nos ter recebido hoje! Esperamos que tenha gostado do resultado do serviço (limpeza de sofá de 3 lugares)."));
  assert(String(first.message).includes("10% de desconto no próximo serviço"));
  assert(String(first.message).includes("instagram.com"));
  await procedureSent({ eventId: "s1", kind: "client-review", messageIds: ["w1"] }, store, new Date("2026-10-15T15:16:00Z"));
  assertEquals(table.get("s1")!.client_review_msg_id, "w1");
  // Two hours after the end: s3 goes (Lisbon link), s2 is on hold and s4 has no phone; s1 is not sent again.
  body = await json(await procedureDue(events, store, new Date("2026-10-15T17:05:00Z")));
  assertEquals((body.clientReviews as Row[]).map(c => c.eventId), ["s3"]);
  assert(String((body.clientReviews as Row[])[0].message).includes("g.page/r/CRc7F7lX3xcEECE/review"));
  assert(String(table.get("s2")!.client_review_skip).startsWith("em pausa"));
  assertEquals(table.get("s4")!.client_review_skip, "sem telefone no título");
});

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { procedureDue, procedureMedia, procedureSent, type ProcedureStore } from "./procedure.ts";

// Invented data only: the repo is public.
type Row = Record<string, unknown>;
const ev = (id: string, summary: string, start: string, end: string, team?: string) =>
  ({ id, summary, description: team ? `Equipa: ${team}\n\nnotas` : "", location: "", startDate: start.slice(0, 10), created: start, updated: start, status: "CONFIRMED", start, end });

function fakeStore(initial: Row[] = [], services: Row[] = [], reviews: Row[] = []) {
  const table = new Map(initial.map(r => [String(r.calendar_event_id), { ...r }]));
  const store: ProcedureStore = {
    records: async since => [...table.values()].filter(r => String(r.service_day) >= since),
    byPrompt: async id => [...table.values()].find(r => (r.prompt_msg_ids as string[]).includes(id)) ?? null,
    services: async ids => services.filter(s => ids.includes(String(s.calendar_event_id))),
    reviews: async ids => reviews.filter(r => ids.includes(String(r.service_request_id))),
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
  // s6: Lisboa 1 only counts from 19/10.
  assertEquals(prompts.map(p => p.eventId), ["s1"]);
  assertEquals(prompts[0].label, "Ana, Paranhos");
  assert(String(prompts[0].message).startsWith("Serviço terminado: Ana, Paranhos (Limpeza de sofá de 3 lugares), 15/10 às 15h."));
  assert(String(prompts[0].clientMessage).startsWith("Olá Ana, obrigado por nos ter recebido hoje! Esperamos que tenha gostado do resultado do serviço (limpeza de sofá de 3 lugares)."));
  assert(!JSON.stringify(body).includes("912000000"), "no phone leaves");
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

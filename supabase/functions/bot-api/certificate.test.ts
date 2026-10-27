import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { certificateAction, type CertificateStore } from "./certificate.ts";

// Invented data only: the repo is public.
type Row = Record<string, unknown>;
const now = new Date("2026-10-27T10:00:00Z");
const job = (o: Row = {}): Row => ({
  id: "c1", request_date: "2026-10-19", description: "Pré-limpeza e impermeabilização Premium: sofá, 2 puffs e 4 cadeirões",
  client_name: "Ana", city: "Ericeira", locality: "Lisboa", phone: "+351 912 000 111", billed_value: 300, calendar_missing_since: null, ...o,
});

function fakeStore(services: Row[], issued: Row[] = []) {
  const table = [...issued];
  const store: CertificateStore = {
    waterproofingServices: async () => services,
    issued: async id => table.find(r => r.service_request_id === id) ?? null,
    numbersOn: async d => table.filter(r => r.service_date === d).map(r => String(r.number)),
    insert: async row => {
      if (table.some(r => r.number === row.number || r.service_request_id === row.service_request_id)) return { error: "dup", code: "23505" };
      table.push(row);
      return {};
    },
  };
  return { store, table };
}
const json = async (r: Response) => (await r.json()) as Row;

Deno.test("a done job gets a numbered certificate, kept for next time with the same number and name", async () => {
  const { store, table } = fakeStore([job()], [{ number: "KYRO-IMP-20261019-01", service_request_id: "x", service_date: "2026-10-19" }]);
  const first = await json(await certificateAction({ phone: "351912000111@s.whatsapp.net", name: "Ana Teste", items: "sofá de canto, 2 puffs e 4 cadeirões" }, store, now));
  assertEquals(first.ok, true);
  assertEquals(first.again, false);
  const c = first.certificate as Row;
  assertEquals([c.number, c.name, c.items, c.place, c.team, c.tier, c.years], ["KYRO-IMP-20261019-02", "Ana Teste", "sofá de canto, 2 puffs e 4 cadeirões", "Ericeira", "Lisboa", "premium", 10]);
  assertEquals(table.length, 2);

  const again = await json(await certificateAction({ phone: "912000111", name: "Ana Outra", items: "outra coisa" }, store, now));
  assertEquals(again.again, true);
  assertEquals([(again.certificate as Row).number, (again.certificate as Row).name, (again.certificate as Row).items], ["KYRO-IMP-20261019-02", "Ana Teste", "sofá de canto, 2 puffs e 4 cadeirões"]);
  assertEquals(table.length, 2);
});

Deno.test("a chat name that is not the client's is ignored", async () => {
  const { store } = fakeStore([job()]);
  const r = await json(await certificateAction({ phone: "912000111", name: "Joana Silva" }, store, now));
  assertEquals((r.certificate as Row).name, "Ana");
  assertEquals((r.certificate as Row).items, "sofá, 2 puffs e 4 cadeirões");
});

Deno.test("no job, a job still to come or no tier: no certificate, with what to tell the client", async () => {
  const none = await json(await certificateAction({ phone: "912999999" }, fakeStore([job()]).store, now));
  assertEquals([none.ok, none.reason], [false, "none"]);
  assert(String(none.instrucao).includes("exemplo"));
  const upcoming = await json(await certificateAction({ phone: "912000111" }, fakeStore([job({ request_date: "2026-11-02" })]).store, now));
  assertEquals([upcoming.reason, upcoming.serviceDate], ["upcoming", "2026-11-02"]);
  const tier = await json(await certificateAction({ phone: "912000111" }, fakeStore([job({ description: "Impermeabilização sofá 2 lugares" })]).store, now));
  assertEquals(tier.reason, "tier");
});

Deno.test("dryRun numbers without writing; a missing phone is refused", async () => {
  const { store, table } = fakeStore([job()]);
  const r = await json(await certificateAction({ phone: "912000111", dryRun: true }, store, now));
  assertEquals([(r.certificate as Row).number, table.length], ["KYRO-IMP-20261019-01", 0]);
  assertEquals((await certificateAction({ phone: "12" }, store, now)).status, 400);
});

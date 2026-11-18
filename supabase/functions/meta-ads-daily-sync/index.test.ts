// Runs with: deno test --no-lock --allow-env --allow-net supabase/functions/meta-ads-daily-sync/
import { assert, assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { conversationsFrom, handleMetaSync, META_FROM, parseInsight, sinceDay, type MetaStatRow, type MetaStore, type SyncStatus } from "./index.ts";

const KEY = "k".repeat(40);

function fakeStore(last: string | null = null) {
  const saved = { stats: [] as MetaStatRow[], status: [] as SyncStatus[] };
  const store: MetaStore = {
    lastStatDate: () => Promise.resolve(last),
    upsertStats(rows) { saved.stats.push(...rows); return Promise.resolve(null); },
    setStatus(s) { saved.status.push(s); return Promise.resolve(); },
  };
  return { store, saved };
}

const insight = (o: Record<string, unknown> = {}) => ({
  campaign_id: "120241234567890", campaign_name: "Conversas WhatsApp · 4 Reels finais · 16 Nov 2026",
  spend: "41.37", impressions: "5120", clicks: "88", date_start: "2026-11-18", date_stop: "2026-11-18",
  actions: [{ action_type: "link_click", value: "88" }, { action_type: "onsite_conversion.messaging_conversation_started_7d", value: "6" }],
  ...o,
});

const reply = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } }));

const call = (opts: { key?: string; token?: string | undefined; store?: MetaStore; fetch?: typeof fetch; now?: Date } = {}) =>
  handleMetaSync(
    new Request("https://x/functions/v1/meta-ads-daily-sync", { method: "POST", headers: { "x-meta-sync-key": opts.key ?? KEY } }),
    { key: KEY, token: "token" in opts ? opts.token : "EAA-test", store: opts.store ?? fakeStore().store, fetch: opts.fetch, now: opts.now ?? new Date("2026-11-18T15:00:00Z") },
  );

Deno.test("lê uma linha das insights com as conversas iniciadas", () => {
  assertEquals(parseInsight(insight()), {
    stat_date: "2026-11-18", campaign_id: "120241234567890", campaign_name: "Conversas WhatsApp · 4 Reels finais · 16 Nov 2026",
    spend: 41.37, impressions: 5120, clicks: 88, conversations: 6,
  });
  assertEquals(conversationsFrom(undefined), 0);
  assertEquals(parseInsight(insight({ date_start: "18/11/2026" })), null);
  assertEquals(parseInsight(insight({ spend: "-1" })), null);
});

Deno.test("lê de 18/11 na primeira vez e depois só os últimos 7 dias", () => {
  assertEquals(sinceDay(null), META_FROM);
  assertEquals(sinceDay("2026-11-20"), META_FROM);
  assertEquals(sinceDay("2026-12-10"), "2026-12-03");
});

Deno.test("sem a chave certa não lê nada", async () => {
  assertEquals((await call({ key: "x".repeat(40) })).status, 401);
});

Deno.test("sem token fica por ligar e diz porquê", async () => {
  const { store, saved } = fakeStore();
  const res = await call({ token: undefined, store });
  assertEquals(res.status, 503);
  assertEquals(saved.status[0].ok, false);
  assert(saved.status[0].error!.includes("ads_read"));
});

Deno.test("sem ads_read grava o erro da Meta e não grava gasto", async () => {
  const { store, saved } = fakeStore();
  const res = await call({ store, fetch: () => reply({ error: { message: "(#200) Ad account owner has NOT grant ads_management or ads_read permission" } }) });
  assertEquals(res.status, 502);
  assertEquals(saved.stats.length, 0);
  assert(saved.status[0].error!.includes("ads_read"));
});

Deno.test("grava as linhas de todas as páginas a partir de 18/11", async () => {
  const { store, saved } = fakeStore();
  const urls: string[] = [];
  const pages = [
    { data: [insight(), insight({ date_start: "2026-11-17", spend: "60" })], paging: { next: "https://graph.facebook.com/v21.0/act_618524496228897/insights?after=abc" } },
    { data: [insight({ campaign_id: "120240000000001", spend: "10" })] },
  ];
  const res = await call({ store, fetch: (u => { urls.push(String(u)); return reply(pages[urls.length - 1]); }) as typeof fetch });
  assertEquals(res.status, 200);
  assertEquals(urls.length, 2);
  assert(decodeURIComponent(urls[0]).includes('"since":"2026-11-18"'));
  // O dia 17 (antes dos 500€) fica de fora.
  assertEquals(saved.stats.map(r => r.spend), [41.37, 10]);
  assertEquals(saved.status, [{ ok: true, rows: 2 }]);
});

Deno.test("um link de página fora da Graph API não é seguido", async () => {
  const { store } = fakeStore();
  let calls = 0;
  await call({ store, fetch: (() => { calls++; return reply({ data: [insight()], paging: { next: "https://evil.example/x" } }); }) as typeof fetch });
  assertEquals(calls, 1);
});

// Runs with: deno test --no-lock --allow-env --allow-net supabase/functions/ads-daily-sync/
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handleAdsRequest, parseRow, spendByDay, type StatRow, type StatsStore } from "./index.ts";

const KEY = "a".repeat(40);

function fakeStore() {
  const saved = { stats: [] as StatRow[], spend: [] as { platform: string; spend_date: string; amount: number }[] };
  const store: StatsStore = {
    upsertStats(rows) { saved.stats.push(...rows); return Promise.resolve(null); },
    upsertSpend(rows) { saved.spend.push(...rows); return Promise.resolve(null); },
  };
  return { store, saved };
}

const row = (o: Record<string, unknown> = {}) => ({
  date: "2026-10-06", campaignId: "24286916320", campaignName: "Kyro | Porto",
  impressions: 120, clicks: 18, cost: 33.4, conversions: 2, ...o,
});

const call = (body: unknown, opts: { key?: string; envKey?: string | undefined; store?: StatsStore | null } = {}) =>
  handleAdsRequest(
    new Request("https://x/functions/v1/ads-daily-sync", {
      method: "POST",
      headers: { "x-ads-key": opts.key ?? KEY, "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { key: "envKey" in opts ? opts.envKey : KEY, store: opts.store === undefined ? fakeStore().store : opts.store },
  );

Deno.test("fails closed without the secret and rejects a wrong key", async () => {
  assertEquals((await call({ rows: [] }, { envKey: undefined })).status, 503);
  assertEquals((await call({ rows: [] }, { envKey: "short" })).status, 503);
  assertEquals((await call({ rows: [] }, { key: "wrong" })).status, 401);
});

Deno.test("saves the rows and the daily spend as the sum of the campaigns", async () => {
  const { store, saved } = fakeStore();
  const res = await call({ rows: [row(), row({ campaignId: "24275823960", campaignName: "Kyro | Lisboa", cost: "39,88" })] }, { store });
  assertEquals(res.status, 200);
  assertEquals(saved.stats.length, 2);
  assertEquals(saved.spend, [{ platform: "google", spend_date: "2026-10-06", amount: 73.28 }]);
});

Deno.test("rejects a malformed row instead of saving half", async () => {
  const { store, saved } = fakeStore();
  const res = await call({ rows: [row(), row({ date: "6/10/2026" })] }, { store });
  assertEquals(res.status, 400);
  assertEquals(saved.stats.length, 0);
  assertEquals(parseRow(row({ cost: -1 })), null);
  assertEquals(parseRow(row({ campaignId: "abc" })), null);
});

Deno.test("spendByDay groups by day", () => {
  const a = parseRow(row({ cost: 10 }))!, b = parseRow(row({ campaignId: "2", cost: 5.5 }))!, c = parseRow(row({ date: "2026-10-05", cost: 1 }))!;
  assertEquals(spendByDay([a, b, c]).map(s => [s.spend_date, s.amount]), [["2026-10-06", 15.5], ["2026-10-05", 1]]);
});

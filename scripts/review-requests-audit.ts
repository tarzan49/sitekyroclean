// Auditoria: pedidos de avaliação Google vs avaliações reais (só leitura; não envia nada).
// Uso: bun scripts/review-requests-audit.ts [desde=2026-11-01] [avaliacoes.json]
//   Lê /opt/kyro/data/kyro.db no VPS por ssh. avaliacoes.json = [{name, date:"AAAA-MM-DD", profile:"Porto"|"Lisboa"}]
//   lidas à mão das fichas Google. Escreve reports/avaliacoes-<data>.{json,md} (pasta ignorada pelo Git: dados de clientes).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
const since = process.argv[2] ?? "2026-11-01";
const reviewsFile = process.argv[3];
const remote = `
import {Database} from "bun:sqlite";const d=new Database("/opt/kyro/data/kyro.db",{readonly:true});
const s=Date.parse("${since}T00:00:00Z")/1000;
const ev=d.query("select event_id, min(ts) ts, group_concat(distinct team) team, max(label) label from procedure_prompts where ts>=? group by event_id").all(s);
const rc=Object.fromEntries(d.query("select * from review_checkins where asked_ts>=?").all(s).map(r=>[r.event_id,r]));
const pr=Object.fromEntries(d.query("select event_id, group_concat(result) res, max(chat_jid) jid from procedure_client_reviews where ts>=? group by event_id").all(s).map(r=>[r.event_id,r]));
const w=Object.fromEntries(d.query("select * from procedure_review_watch").all().map(r=>[r.event_id,r]));
const ids=new Set([...ev.map(e=>e.event_id),...Object.keys(rc)]);
console.log(JSON.stringify([...ids].map(id=>{const e=ev.find(x=>x.event_id===id)||{};const c=rc[id]||{};const p=pr[id]||{};const x=w[id]||{};
return {event_id:id,team:e.team??null,label:e.label??null,team_ts:e.ts??null,phone:c.phone??x.phone??((p.jid||"").split("@")[0]||null),
first_name:c.first_name??x.first_name??null,state:c.state??null,asked_ts:c.asked_ts??null,answer:c.answer??null,proc:p.res??null,skip:x.client_review_skip??null};})));`;
const rows = JSON.parse(execFileSync("ssh", ["root@187.6.166.29", "cat > /tmp/kyro-audit.ts && bun /tmp/kyro-audit.ts"], { input: remote, maxBuffer: 1 << 26 }).toString());
const reviews: { name: string; date: string; profile: string }[] = reviewsFile && existsSync(reviewsFile) ? JSON.parse(readFileSync(reviewsFile, "utf8")) : [];
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/\s+/)[0] ?? "";
const day = (t: number | null) => (t ? new Date(t * 1000).toISOString().slice(0, 10) : null);
const LIS = /Lisboa|Algarve/;
const used = new Set<number>();
// Cada avaliação conta uma vez: primeiro quem recebeu o link, depois o serviço mais recente antes da data.
rows.sort((a: any, b: any) => (b.state === "sent" ? 1 : 0) - (a.state === "sent" ? 1 : 0) || String(b.team_ts ?? b.asked_ts).localeCompare(String(a.team_ts ?? a.asked_ts)));
for (const r of rows) {
  r.profile = LIS.test(r.team ?? "") ? "Lisboa" : "Porto";
  r.service_day = day(r.team_ts ?? r.asked_ts);
  const fn = norm(r.first_name ?? r.label ?? "");
  const i = reviews.findIndex((v, k) => !used.has(k) && fn && norm(v.name) === fn && v.date >= (r.service_day ?? since));
  if (i >= 0) used.add(i);
  const hit = i >= 0 ? reviews[i] : null;
  r.review = hit ? `${hit.name} ${hit.date} ${hit.profile}` : null;
  r.cls = hit ? "a" : r.state === "sent" || r.state === "followed" || r.proc?.includes("sent") ? "b"
    : r.state === "asked" || r.state === "answered" ? "c" : r.state ? `outro:${r.state}` : "d";
}
mkdirSync("reports", { recursive: true });
const out = `reports/avaliacoes-${new Date().toISOString().slice(0, 10)}`;
writeFileSync(out + ".json", JSON.stringify(rows, null, 1));
const sec = (k: string, t: string) => `## ${t}\n` + rows.filter((r) => r.cls === k).map((r) => `- ${r.service_day} ${r.profile} ${r.team ?? "?"} ${r.first_name ?? r.label ?? "?"} ${r.phone ?? "(sem telefone)"} ${r.state ?? ""} ${(r.answer ?? "").slice(0, 60).replace(/\n/g, " ")}`).join("\n");
const counts = ["Porto", "Lisboa"].map((p) => `${p}: ` + ["a", "b", "c", "d"].map((k) => `${k}=${rows.filter((r) => r.profile === p && r.cls === k).length}`).join(" ") + ` outro=${rows.filter((r) => r.profile === p && r.cls.startsWith("outro")).length}`).join("\n");
writeFileSync(out + ".md", `# Pedidos de avaliação desde ${since}\n\n${counts}\n\n${sec("a", "(a) pediu e avaliou")}\n\n${sec("b", "(b) link enviado / correu bem, sem avaliação")}\n\n${sec("c", "(c) Como correu? sem resposta")}\n\n${sec("d", "(d) nunca recebeu Como correu?")}\n\n## outros (negativo, não feito, recolha)\n` + rows.filter((r) => r.cls.startsWith("outro")).map((r) => `- ${r.service_day} ${r.first_name ?? r.label} ${r.phone} ${r.cls}`).join("\n") + "\n");
console.log(counts + "\n→ " + out + ".md");

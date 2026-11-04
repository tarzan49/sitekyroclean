/**
 * Ficheiro de conversões offline para o Google Ads: os serviços fechados reais,
 * com o valor "para ti" (dono, 2026-11-03: o Google otimizava para cliques no
 * WhatsApp e nunca sabia quem fechou nem quanto valeu).
 *
 * O Google Ads vai buscar este endereço todos os dias (importação agendada por
 * HTTPS, com utilizador e palavra-passe: ADS_FEED_USER / ADS_FEED_PASSWORD).
 *
 * Só vão fechos de quem veio de um anúncio com código "ref." (dono, 2026-11-04,
 * depois da pesquisa ao RGPD): telefone → whatsapp_conversations.ad_ref →
 * ad_clicks. Orgânicos e clientes anteriores ao código ficam de fora: não têm
 * finalidade de medição e quase não ensinam o Google.
 * Vai o gclid; o telefone só quando o clique não tem gclid (gbraid/wbraid no
 * iPhone), sempre cifrado em SHA-256 e só até 63 dias, o limite da Google.
 * O Google ignora linhas repetidas (mesmo clique, nome e hora), por isso reenviar
 * todos os dias não duplica nada.
 *
 * Artigos acrescentados (service_extras) vão como fecho próprio na hora em que
 * foram aceites, como no painel. Desmarcados (calendar_missing_since) não vão.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const CONVERSION_NAME = "Serviço fechado";
const DAYS = 90;
const PHONE_DAYS = 63;

type Row = Record<string, unknown>;
export interface FeedInput { services: Row[]; extras: Row[]; conversations: Row[]; clicks: Row[]; now: Date }

/** +351… para números portugueses de 9 dígitos; os outros com o indicativo que trazem. */
export function e164(phone: unknown): string | null {
  let d = String(phone ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (/^[29]\d{8}$/.test(d)) return `+351${d}`;
  if (/^\d{10,15}$/.test(d)) return `+${d}`;
  return null;
}

const key9 = (phone: string) => phone.replace(/\D/g, "").slice(-9);

/**
 * "2026-11-03 14:05:00+00:00": hora UTC com o fuso escrito. Sem linha
 * "Parameters:TimeZone" no topo, porque o Gestor de dados do Google Ads lê a
 * primeira linha como os nomes das colunas.
 */
export function utcTime(iso: string): string {
  return `${new Date(iso).toISOString().slice(0, 19).replace("T", " ")}+00:00`;
}

/** SHA-256 em hexadecimal, o formato que a Google aceita para o telefone em E.164. */
export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

const money = (v: unknown) => Math.round((Number(v) || 0) * 100) / 100;
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);

export async function buildConversionsCsv({ services, extras, conversations, clicks, now }: FeedInput): Promise<{ csv: string; rows: number; withClick: number }> {
  const since = now.getTime() - DAYS * 86_400_000;
  const clickByRef = new Map(clicks.map(c => [String(c.ref), c]));
  const refByPhone = new Map<string, string>();
  for (const c of conversations) if (c.ad_ref) refByPhone.set(key9(String(c.contact_key)), String(c.ad_ref));
  const extrasByEvent = new Map<string, Row[]>();
  for (const x of extras) extrasByEvent.set(String(x.calendar_event_id), [...(extrasByEvent.get(String(x.calendar_event_id)) ?? []), x]);

  const lines: string[] = [];
  let withClick = 0;
  const push = async (id: string, phone: string, at: string, cut: number, billed: number) => {
    const t = Date.parse(at);
    if (!(t >= since) || t > now.getTime()) return;
    const value = cut > 0 ? cut : money(billed / 2);
    if (value <= 0) return;
    const ref = refByPhone.get(key9(phone));
    const click = ref ? clickByRef.get(ref) : undefined;
    // Sem código de anúncio não vai; o clique tem de ser anterior ao fecho.
    if (!click || Date.parse(String(click.created_at)) > t) return;
    const gclid = click.gclid ? String(click.gclid) : "";
    if (!gclid && now.getTime() - t > PHONE_DAYS * 86_400_000) return;
    if (gclid) withClick++;
    lines.push([gclid, gclid ? "" : await sha256(phone), CONVERSION_NAME, utcTime(at), value.toFixed(2), "EUR", id].map(csvCell).join(","));
  };

  for (const s of services) {
    if (s.calendar_missing_since || !s.booked_at) continue;
    const phone = e164(s.phone);
    if (!phone) continue;
    let billed = money(s.billed_value) + money(s.upsell_value);
    let cut = money(s.my_cut);
    if (billed <= 0) continue;
    const mine = s.calendar_event_id ? extrasByEvent.get(String(s.calendar_event_id)) ?? [] : [];
    const extraValue = mine.reduce((a, x) => a + money(x.value), 0);
    // Como no painel: o acrescento sai do serviço só quando o total já o inclui.
    if (mine.length && money(s.billed_value) > extraValue) {
      billed = money(billed - extraValue);
      cut = money(cut - mine.reduce((a, x) => a + money(x.my_cut), 0));
      for (const x of mine) await push(String(x.id), phone, String(x.added_at), money(x.my_cut), money(x.value));
    }
    await push(String(s.id), phone, String(s.booked_at), cut, billed);
  }

  const header = ["Google Click ID,Phone Number,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID"];
  return { csv: [...header, ...lines].join("\n") + "\n", rows: lines.length, withClick };
}

function authorized(req: Request): boolean {
  const user = Deno.env.get("ADS_FEED_USER"), pass = Deno.env.get("ADS_FEED_PASSWORD");
  if (!user || !pass) return false;
  return req.headers.get("authorization") === `Basic ${btoa(`${user}:${pass}`)}`;
}

if (import.meta.main) {
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  Deno.serve(async req => {
    if (!authorized(req)) return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="ads"' } });
    const from = new Date(Date.now() - (DAYS + 30) * 86_400_000).toISOString();
    const [s, x, c, k] = await Promise.all([
      client.from("service_requests").select("id, phone, booked_at, billed_value, upsell_value, my_cut, calendar_event_id, calendar_missing_since").gte("booked_at", from),
      client.from("service_extras").select("id, calendar_event_id, added_at, value, my_cut").gte("added_at", from),
      client.from("whatsapp_conversations").select("contact_key, ad_ref").not("ad_ref", "is", null),
      client.from("ad_clicks").select("ref, gclid, created_at").gte("created_at", from),
    ]);
    const error = s.error ?? x.error ?? c.error ?? k.error;
    if (error) { console.error(error.message); return new Response("error", { status: 500 }); }
    const out = await buildConversionsCsv({ services: s.data ?? [], extras: x.data ?? [], conversations: c.data ?? [], clicks: k.data ?? [], now: new Date() });
    console.log(`feed: ${out.rows} fechos, ${out.withClick} com clique`);
    return new Response(out.csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
  });
}

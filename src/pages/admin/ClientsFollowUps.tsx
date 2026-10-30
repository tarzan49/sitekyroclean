import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone } from "@/lib/clientRecords";

// Vista "Follow-ups" do separador Clientes (dono, 2026-10-30: "uma aba de follow
// ups onde trabalhávamos follow ups ativamente"). Lê a tabela follow_up_queue:
// uma linha por pessoa a quem demos preço e que não fechou, com a leitura da
// conversa e a mensagem proposta. Daqui nada é enviado sozinho: o dono edita o
// texto, abre o WhatsApp com ele e marca o que aconteceu.

export interface FollowUpRow {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  service: string | null;
  price_given: string | null;
  temperature: string;
  score: number;
  summary: string | null;
  unanswered_follow_ups: number;
  proposed_message: string | null;
  missing_for_quote: string | null;
  wait_until: string | null;
  status: string;
  owner_note: string | null;
  sent_at: string | null;
  analysed_at: string;
}

const TEMPS: [string, string, string][] = [
  ["devemos_resposta", "Devemos resposta", "bg-red-50 text-red-800 border-red-200"],
  ["ja_marcado", "Marcado, falta no CRM", "bg-blue-50 text-blue-800 border-blue-200"],
  ["quente", "Quente", "bg-orange-50 text-orange-800 border-orange-200"],
  ["morno", "Morno", "bg-amber-50 text-amber-800 border-amber-200"],
  ["aguardar", "Aguardar data", "bg-sky-50 text-sky-800 border-sky-200"],
  ["perdido", "Perdido", "bg-gray-100 text-gray-600 border-gray-200"],
  ["ignorar", "Ignorar", "bg-gray-100 text-gray-500 border-gray-200"],
];
const TEMP_ORDER = Object.fromEntries(TEMPS.map(([k], i) => [k, i]));
const TEMP_LABEL = Object.fromEntries(TEMPS.map(([k, l]) => [k, l]));
const TEMP_STYLE = Object.fromEntries(TEMPS.map(([k, , s]) => [k, s]));

const STATUSES: [string, string][] = [
  ["proposta", "Por aprovar"],
  ["aprovado", "Aprovado"],
  ["enviado", "Enviado"],
  ["respondeu", "Respondeu"],
  ["fechou", "Fechou"],
  ["descartado", "Descartado"],
];
const STATUS_LABEL = Object.fromEntries(STATUSES);

/** Os que estão para trabalhar: sem os perdidos e os ignorados, e "aguardar" só quando chega o dia. */
export function isWorkable(r: FollowUpRow, today: string) {
  if (r.temperature === "perdido" || r.temperature === "ignorar") return false;
  if (r.temperature === "aguardar" && (r.wait_until ?? "9999") > today) return false;
  return r.status === "proposta" || r.status === "aprovado";
}

export function sortRows(rows: FollowUpRow[]) {
  return [...rows].sort((a, b) =>
    (TEMP_ORDER[a.temperature] ?? 9) - (TEMP_ORDER[b.temperature] ?? 9) || b.score - a.score);
}

const waLink = (phone: string, text: string | null) =>
  `https://wa.me/${phone.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`px-2.5 py-1 text-xs rounded-full border whitespace-nowrap ${active ? "bg-navy text-white border-navy" : "bg-white text-navy border-gray-200 hover:border-navy/30"}`}>
      {children}
    </button>
  );
}

function Card({ row, onSave }: { row: FollowUpRow; onSave: (id: string, patch: Partial<FollowUpRow>) => Promise<void> }) {
  const [text, setText] = useState(row.proposed_message ?? "");
  const [note, setNote] = useState(row.owner_note ?? "");
  const [busy, setBusy] = useState(false);
  const dirty = text !== (row.proposed_message ?? "") || note !== (row.owner_note ?? "");
  const save = async (patch: Partial<FollowUpRow>) => {
    setBusy(true);
    try { await onSave(row.id, { proposed_message: text || null, owner_note: note || null, ...patch }); } finally { setBusy(false); }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <p className="font-semibold text-navy">{row.name || "Sem nome"} <span className="font-normal text-gray-500 text-sm">· {formatPhone(row.phone)}</span></p>
          <p className="text-xs text-gray-500">{[row.city, row.service].filter(Boolean).join(" · ")}</p>
          {row.price_given && <p className="text-xs text-navy mt-0.5">Preço dado: <strong>{row.price_given}</strong></p>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${TEMP_STYLE[row.temperature] ?? ""}`}>{TEMP_LABEL[row.temperature] ?? row.temperature}{row.score ? ` ${row.score}/5` : ""}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">{STATUS_LABEL[row.status] ?? row.status}</span>
        </div>
      </div>
      {row.summary && <p className="text-sm text-gray-700">{row.summary}</p>}
      <div className="flex gap-3 flex-wrap text-xs">
        {row.unanswered_follow_ups > 0 && <span className={row.unanswered_follow_ups >= 2 ? "text-red-700" : "text-amber-700"}>Seguimentos sem resposta: {row.unanswered_follow_ups}</span>}
        {row.wait_until && <span className="text-sky-700">Voltar a falar: {row.wait_until.slice(8, 10)}/{row.wait_until.slice(5, 7)}</span>}
        {row.sent_at && <span className="text-gray-500">Enviado {new Date(row.sent_at).toLocaleDateString("pt-PT")}</span>}
      </div>
      {row.missing_for_quote && <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg p-2">Falta para o orçamento: {row.missing_for_quote}</p>}
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="Mensagem"
        className="w-full text-sm border border-gray-200 rounded-lg p-2 outline-none focus:border-navy/40" />
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Nota tua (porquê, o que ela respondeu…)"
        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-navy/40" />
      <div className="flex gap-2 flex-wrap">
        <a href={waLink(row.phone, text || null)} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-green-600 text-white">
          <MessageCircle className="w-3.5 h-3.5" /> Abrir no WhatsApp
        </a>
        {dirty && <button disabled={busy} onClick={() => save({})} className="px-3 py-2 text-xs rounded-lg border border-navy text-navy">Guardar</button>}
        {row.status === "proposta" && <button disabled={busy} onClick={() => save({ status: "aprovado" })} className="px-3 py-2 text-xs rounded-lg bg-navy text-white">Aprovar</button>}
        <button disabled={busy} onClick={() => save({ status: "enviado", sent_at: new Date().toISOString() })} className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-navy">Enviei</button>
        <button disabled={busy} onClick={() => save({ status: "respondeu" })} className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-navy">Respondeu</button>
        <button disabled={busy} onClick={() => save({ status: "fechou" })} className="px-3 py-2 text-xs rounded-lg border border-green-300 text-green-800">Fechou</button>
        <button disabled={busy} onClick={() => save({ status: "descartado" })} className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-500">Descartar</button>
      </div>
    </div>
  );
}

export default function ClientsFollowUps() {
  const [rows, setRows] = useState<FollowUpRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temp, setTemp] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: e } = await (supabase as any).from("follow_up_queue").select("*");
    if (e) setError(`Não consegui ler os follow-ups: ${e.message}`);
    else setRows(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const onSave = useCallback(async (id: string, patch: Partial<FollowUpRow>) => {
    const full = { ...patch, updated_at: new Date().toISOString() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: e } = await (supabase as any).from("follow_up_queue").update(full).eq("id", id);
    if (e) { setError(`Não gravou: ${e.message}`); return; }
    setRows(rs => rs.map(r => (r.id === id ? { ...r, ...full } : r)));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter(r => {
      if (q) return [r.name, r.phone, r.city, r.service, r.summary].some(v => v?.toLowerCase().includes(q));
      if (status) return r.status === status && (!temp || r.temperature === temp);
      if (temp) return r.temperature === temp;
      return isWorkable(r, today);
    });
    return sortRows(list);
  }, [rows, temp, status, search, today]);

  const count = (pred: (r: FollowUpRow) => boolean) => rows.filter(pred).length;

  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm text-gray-600">
            <strong className="text-navy">{count(r => isWorkable(r, today))}</strong> para trabalhar ·
            {" "}{count(r => r.status === "enviado")} enviados · {count(r => r.status === "fechou")} fecharam
          </p>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-navy">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nome, telefone, cidade ou serviço"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40" />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Chip active={!temp && !status} onClick={() => { setTemp(null); setStatus(null); }}>Para trabalhar</Chip>
          {TEMPS.map(([k, l]) => (
            <Chip key={k} active={temp === k} onClick={() => setTemp(temp === k ? null : k)}>{l} ({count(r => r.temperature === k)})</Chip>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUSES.map(([k, l]) => (
            <Chip key={k} active={status === k} onClick={() => setStatus(status === k ? null : k)}>{l} ({count(r => r.status === k)})</Chip>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
      {shown.map(r => <Card key={r.id} row={r} onSave={onSave} />)}
      {!loading && !shown.length && <p className="text-sm text-gray-500 text-center py-6">Nada nesta lista.</p>}
    </div>
  );
}

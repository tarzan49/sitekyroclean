import { useEffect, useState, useCallback, Fragment } from 'react';
import { MessageCircle, Download, RefreshCw, LogOut, TrendingUp, Users, Filter, Bell, Plus, Zap, X, Trash2, Check, Lock, AlertTriangle, CalendarDays, MapPin, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Lead, type LeadStatus } from '@/lib/supabase';
import { cities as ALL_CITIES } from '@/data/locationSeoData';

// Deriva a região macro (Porto/Lisboa/Algarve/Braga) a partir do texto livre
// de `location` dos leads do quiz — pedido do dono para não ter de preencher
// isto à mão como faz nos serviços do WhatsApp. Braga sai do bucket "porto"
// da tabela de cidades (que a trata como área operacional do Porto) porque o
// dono usa Braga como região própria na sua notação P/L/A/B.
function guessRegionFromLocation(location: string | null): string {
  if (!location) return '-';
  const text = location.toLowerCase();
  if (text.includes('braga')) return 'Braga';
  const match = ALL_CITIES.find(c => text.includes(c.name.toLowerCase()));
  if (!match) return '-';
  if (match.area === 'lisboa') return 'Lisboa';
  if (match.area === 'algarve') return 'Algarve';
  return 'Porto';
}

// ── Password gate ─────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'kyro2025';

// ── Status config — covers both quiz CRM statuses and legacy CSV Funil values ─
const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  // Quiz CRM statuses
  pending:                    { label: 'Novo Lead',              color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',   dot: '●' },
  contacted:                  { label: 'Contactado',             color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',         dot: '●' },
  scheduled:                  { label: 'Agendado',               color: 'bg-green-500/15 text-green-300 border-green-500/30',      dot: '●' },
  lost:                       { label: 'Perdido',                color: 'bg-red-500/15 text-red-300 border-red-500/30',             dot: '●' },
  // Legacy CSV Funil values
  'Contacto inicial':         { label: 'Contacto inicial',       color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',         dot: '●' },
  'Interesse demonstrado':    { label: 'Interesse demonstrado',  color: 'bg-orange-500/15 text-orange-300 border-orange-500/30',   dot: '●' },
  'Follow-up':                { label: 'Follow-up',              color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',   dot: '●' },
  'Orçamento enviado':        { label: 'Orçamento enviado',      color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',      dot: '●' },
  'Demonstração marcada':     { label: 'Demonstração marcada',   color: 'bg-teal-500/15 text-teal-300 border-teal-500/30',         dot: '●' },
  'Marcar demonstração':      { label: 'Marcar demonstração',    color: 'bg-teal-500/15 text-teal-300 border-teal-500/30',         dot: '●' },
  'A decidir':                { label: 'A decidir',              color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',   dot: '●' },
  'A responder':              { label: 'A responder',            color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',         dot: '●' },
  'Fechado':                  { label: 'Fechado',                color: 'bg-green-500/15 text-green-300 border-green-500/30',      dot: '●' },
  'Cliente recorrente':       { label: 'Cliente recorrente',     color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',dot: '●' },
  'Sem interesse':            { label: 'Sem interesse',          color: 'bg-red-500/15 text-red-300 border-red-500/30',             dot: '●' },
  'Ainda não houve contacto': { label: 'Sem contacto',           color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',         dot: '●' },
  'Reunião marcada':          { label: 'Reunião marcada',        color: 'bg-teal-500/15 text-teal-300 border-teal-500/30',         dot: '●' },
};

const DEFAULT_STATUS = { label: 'Desconhecido', color: 'bg-white/[0.05] text-white/40 border-white/10', dot: '●' };

function getStatusCfg(s: string) { return STATUS_MAP[s] ?? DEFAULT_STATUS; }

// ── Canonical status buckets (5, not 15) for the badge shown in the table —
// the legacy dropdown below still lists every historical value so old CSV
// leads keep an exact, editable status; this is only the display grouping.
const CANONICAL_STATUS: Record<string, { label: string; cls: string }> = {
  pendente:   { label: 'Novo',        cls: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  contactado: { label: 'Contactado',  cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  agendado:   { label: 'Agendado',    cls: 'bg-green-500/15 text-green-300 border-green-500/30' },
  recorrente: { label: 'Concluído',   cls: 'bg-gold/15 text-gold border-gold/30' },
  perdido:    { label: 'Perdido',     cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
};
function getCanonicalStatus(s: string): { label: string; cls: string } {
  const grp = FILTER_STATUSES.find(g => g.matches.includes(s));
  return grp ? CANONICAL_STATUS[grp.value] : DEFAULT_STATUS_CANONICAL;
}
const DEFAULT_STATUS_CANONICAL = { label: 'Desconhecido', cls: 'bg-white/[0.05] text-white/40 border-white/10' };

const REGION_LABEL: Record<string, string> = { Porto: 'Porto', Lisboa: 'Lisboa', Algarve: 'Algarve', Braga: 'Braga' };
const REGIONS = ['Porto', 'Lisboa', 'Algarve', 'Braga'] as const;

// Legacy alias for dropdown (quiz CRM statuses that can be assigned)
const STATUS_CONFIG = STATUS_MAP;

// ── Simplified filter groups (dropdown) ──────────────────────────────────────
const FILTER_STATUSES = [
  { value: 'pendente',   label: 'Pendente',
    matches: ['pending', 'A decidir', 'A responder', 'Ainda não houve contacto'] },
  { value: 'contactado', label: 'Contactado',
    matches: ['contacted', 'Contacto inicial', 'Interesse demonstrado', 'Follow-up', 'Orçamento enviado', 'Marcar demonstração'] },
  { value: 'agendado',   label: 'Agendado',
    matches: ['scheduled', 'Demonstração marcada', 'Reunião marcada'] },
  { value: 'perdido',    label: 'Perdido',
    matches: ['lost', 'Sem interesse'] },
  { value: 'recorrente', label: 'Recorrente',
    matches: ['Cliente recorrente', 'Fechado'] },
];

// Dropdown de mudar estado dentro da linha expandida — reduzido a 4 passos
// (pedido do dono: a lista completa de 19 estados legados do funil CSV era
// "demasiada coisa"). "Contactado" fica de fora de propósito: nesta operação
// o contacto acontece quase sempre no mesmo dia via WhatsApp, não é uma fase
// separada que valha a pena gerir manualmente — o que importa é se já está
// agendado, se aconteceu, ou se caiu.
const CRUCIAL_STATUSES = [
  { value: 'pendente',   label: 'Novo' },
  { value: 'agendado',   label: 'Agendado' },
  { value: 'recorrente', label: 'Concluído' },
  { value: 'perdido',    label: 'Perdido' },
];
const CRUCIAL_STATUS_RAW: Record<string, string> = {
  pendente: 'pending', agendado: 'scheduled', recorrente: 'Fechado', perdido: 'lost',
};

const FILTER_PRIORITIES = [
  { value: 'Frio',    label: 'Frio' },
  { value: 'Morno',   label: 'Morno' },
  { value: 'Quente',  label: 'Quente' },
  { value: 'Urgente', label: 'Urgente' },
];

const SELECT_CLS = 'h-9 px-3 text-xs font-medium bg-[#1a1a2e] border border-white/[0.15] rounded-xl text-white focus:outline-none focus:border-gold cursor-pointer';
const OPTION_CLS = 'bg-[#1a1a2e] text-white';

// ── Follow-up staleness logic ─────────────────────────────────────────────────
const STALE_STATUSES = new Set([
  'pending', 'Orçamento enviado', 'A decidir', 'A responder',
  'Ainda não houve contacto', 'Interesse demonstrado', 'Contacto inicial',
  'Follow-up', 'Marcar demonstração',
]);
const STALE_DAYS = 3;

function isStale(lead: Lead): boolean {
  if (!STALE_STATUSES.has(lead.status)) return false;
  const ageMs = Date.now() - new Date(lead.created_at).getTime();
  return ageMs > STALE_DAYS * 24 * 60 * 60 * 1000;
}

function parseValue(v: string): number {
  const m = v.match(/[\d,.]+/);
  return m ? parseFloat(m[0].replace(',', '.')) : 0;
}

function exportCSV(leads: Lead[]) {
  const headers = ['Data', 'Responsável', 'Nome', 'Telefone', 'Serviço', 'Tipo', 'Detalhes', 'Localização', 'Valor', 'Vaga', 'Código', 'Status', 'Prioridade', 'Origem', 'Próximo passo', 'Notas'];
  const rows = leads.map(l => [
    new Date(l.created_at).toLocaleString('pt-PT'),
    l.assigned_to ?? '',
    l.name, l.phone, l.service, l.service_type, l.details,
    l.location, l.value, l.slot, l.booking_id,
    getStatusCfg(l.status).label,
    l.priority ?? '',
    l.source ?? '',
    l.next_step ?? '',
    l.notes,
  ].map(c => `"${String(c ?? '').replace(/"/g, '""')}"`));

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `kyro-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Sales intelligence ────────────────────────────────────────────────────────

function getSalesInsight(lead: Lead): { emoji: string; text: string; type: 'price' | 'ghost' | 'hot' } | null {
  const txt = `${lead.notes ?? ''} ${lead.next_step ?? ''}`.toLowerCase();
  if (/preço|caro|apreensiv|analis|pensar|cust|barato|desconto/.test(txt))
    return { emoji: '', text: 'Objeção de preço: propor 10% desconto', type: 'price' };
  if (/não respondeu|sem retorno|parou de respond|não quer mais|arquiv/.test(txt))
    return { emoji: '', text: 'Sem resposta: considerar mudar para Frio', type: 'ghost' };
  if (/urgent|esta semana|hoje|confirmo|quer para/.test(txt))
    return { emoji: '', text: 'Lead quente: ligar agora', type: 'hot' };
  return null;
}

function getUpsellBadge(lead: Lead): string | null {
  const svc = (lead.service ?? '').toLowerCase();
  const notes = (lead.notes ?? '').toLowerCase();
  const hasSofa = svc.includes('sofá') || svc.includes('sofa') || notes.includes('sofá') || notes.includes('sofa');
  const hasImpermeab = notes.includes('impermeab') || (lead.service_type ?? '').toLowerCase().includes('impermeab');
  const isClosed = lead.status === 'Fechado' || lead.status === 'scheduled';
  if (hasSofa && isClosed) return 'Re-contacto em 6 meses';
  if (hasSofa && !hasImpermeab) return 'Sugestão: Impermeabilização';
  const hasMattress = svc.includes('colchão') || notes.includes('colchão');
  if (hasMattress && !hasImpermeab) return 'Sugestão: Impermeabilização';
  return null;
}

function buildWAMsg(lead: Lead): string {
  const svc = (lead.service ?? '').toLowerCase();
  const notes = (lead.notes ?? '').toLowerCase();
  const loc = lead.location ? ` em ${lead.location}` : '';
  if (svc.includes('colchão') || notes.includes('colchão'))
    return `Olá ${lead.name}, aqui é o António da Kyro Clean Solutions. Tenho o seu orçamento para a limpeza do colchão${loc}. Podemos agendar?`;
  if (svc.includes('sofá') || svc.includes('sofa') || notes.includes('sofá'))
    return `Olá ${lead.name}, aqui é o António da Kyro Clean Solutions. Tenho o orçamento para a limpeza do sofá${loc}. Quando seria bom para si?`;
  if (svc.includes('tapete') || notes.includes('tapete'))
    return `Olá ${lead.name}, aqui é o António da Kyro Clean Solutions. Tenho o orçamento para os seus tapetes${loc}. Podemos falar?`;
  return `Olá ${lead.name}, aqui é o António da Kyro Clean Solutions. Gostaria de dar seguimento ao seu orçamento de higienização${loc}. Podemos falar?`;
}

function parseRawLead(raw: string): { name: string; phone: string; email: string; location: string } {
  const phoneMatch = raw.match(/\b(?:(?:\+351|351)?\s?)?[239]\d[\s\d]{7,10}\b/);
  const emailMatch = raw.match(/[\w.+-]+@[\w.-]+\.\w+/);
  const CITIES = ['Porto', 'Lisboa', 'Braga', 'Gaia', 'Matosinhos', 'Aveiro', 'Maia', 'Gondomar', 'Espinho', 'Viseu', 'Évora', 'Leiria', 'Faro', 'Coimbra', 'Setúbal', 'Santarém', 'Sintra', 'Cascais', 'Almada'];
  const location = CITIES.find(c => raw.toLowerCase().includes(c.toLowerCase())) ?? '';
  const cleaned = raw
    .replace(phoneMatch?.[0] ?? '', '')
    .replace(emailMatch?.[0] ?? '', '')
    .replace(new RegExp(location, 'i'), '')
    .replace(/[,;|0-9]/g, ' ')
    .trim();
  const nameParts = cleaned.split(/\s+/).filter(p => p.length > 1).slice(0, 3);
  return {
    name: nameParts.join(' '),
    phone: (phoneMatch?.[0] ?? '').replace(/\s/g, ''),
    email: emailMatch?.[0] ?? '',
    location,
  };
}

// ── Components ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) => (
  <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-white/40 uppercase tracking-wider font-bold">{label}</p>
      <p className="text-2xl font-bold text-white font-playfair leading-tight">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const AdminDashboard = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();

  // Auth
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('kyro_admin') === '1');
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  // Data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState('all');
  const [filterAssigned] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStaleOnly, setFilterStaleOnly] = useState(false);

  // Inline edit state
  const [edits, setEdits] = useState<Record<string, { notes: string; next_step: string; status: LeadStatus; priority: string; value: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  // Quick Add state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [quickAddSaving, setQuickAddSaving] = useState(false);

  // Registar Serviço (WhatsApp job) state
  const [jobOpen, setJobOpen] = useState(false);
  const [jobSaving, setJobSaving] = useState(false);
  const [jobRegion, setJobRegion] = useState<string>('Porto');
  const [jobService, setJobService] = useState<string>('Sofá');
  const [jobMargin, setJobMargin] = useState('');
  const [jobTotal, setJobTotal] = useState('');
  const [jobDone, setJobDone] = useState(true);
  const [jobNotes, setJobNotes] = useState('');
  const JOB_SERVICES = ['Sofá', 'Colchão', 'Tapete', 'Cadeiras', 'Alcatifa', 'Outro'];

  const fetchLeads = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) { setError(err.message); setLoading(false); return; }
    let rows = (data as Lead[]) ?? [];

    // Auto-concluir serviços do WhatsApp cuja data já passou e continuam
    // "Agendado" — pedido do dono (2026-09-05): não há cron/edge function,
    // mas como o painel é aberto com regularidade, correr esta verificação a
    // cada carregamento tem o mesmo efeito prático de "todos os dias".
    // Só mexe em source='WhatsApp' (datas reais de agendamento) — nunca em
    // leads do quiz, cujo created_at é a data de submissão, não de serviço.
    const todayStr = new Date().toISOString().slice(0, 10);
    const toClose = rows.filter(l => l.source === 'WhatsApp' && l.status === 'scheduled' && l.created_at.slice(0, 10) < todayStr);
    if (toClose.length > 0) {
      await supabase.from('leads').update({ status: 'Fechado' }).in('id', toClose.map(l => l.id));
      const closedIds = new Set(toClose.map(l => l.id));
      rows = rows.map(l => closedIds.has(l.id) ? { ...l, status: 'Fechado' } : l);
    }

    setLeads(rows);
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) fetchLeads(); }, [authed, fetchLeads]);

  // Realtime: append new leads instantly without a full refetch
  useEffect(() => {
    if (!authed) return;
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          setLeads((prev) => [payload.new as Lead, ...prev]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authed]);

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('kyro_admin', '1');
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('kyro_admin');
    setAuthed(false);
  };

  const getEdit = (lead: Lead) => edits[lead.id] ?? {
    notes: lead.notes ?? '',
    next_step: lead.next_step ?? '',
    status: lead.status,
    priority: lead.priority ?? '',
    value: lead.value ?? '',
  };

  const flashSaved = (leadId: string) => {
    setSaved(s => ({ ...s, [leadId]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [leadId]: false })), 1800);
  };

  const saveEdit = async (leadId: string) => {
    const edit = edits[leadId];
    if (!edit) return;
    setSaving(s => ({ ...s, [leadId]: true }));
    const { error: err } = await supabase.from('leads').update({
      status: edit.status,
      notes: edit.notes,
      next_step: edit.next_step,
      priority: edit.priority,
      value: edit.value,
    }).eq('id', leadId);
    if (!err) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...edit } : l));
      flashSaved(leadId);
    }
    setSaving(s => ({ ...s, [leadId]: false }));
  };

  // Auto-save a single field immediately (for dropdown changes)
  const autoSaveField = async (leadId: string, field: 'status' | 'priority', value: string) => {
    const baseLead = leads.find(l => l.id === leadId);
    if (!baseLead) return;
    const currentEdit = getEdit(baseLead);
    const newEdit = { ...currentEdit, [field]: value as LeadStatus };
    setEdits(prev => ({ ...prev, [leadId]: newEdit }));
    const { error: err } = await supabase.from('leads').update({ [field]: value }).eq('id', leadId);
    if (!err) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, [field]: value } : l));
      flashSaved(leadId);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!window.confirm('Apagar este lead definitivamente?')) return;
    const { error: err } = await supabase.from('leads').delete().eq('id', leadId);
    if (!err) setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const handleQuickAdd = async () => {
    if (!quickAddText.trim()) return;
    setQuickAddSaving(true);
    const parsed = parseRawLead(quickAddText);
    const { error: err } = await supabase.from('leads').insert({
      name: parsed.name || 'Sem nome',
      phone: parsed.phone,
      email: parsed.email || null,
      location: parsed.location,
      status: 'pending',
      priority: 'Frio',
      source: 'Manual',
      assigned_to: '',
      notes: quickAddText.trim(),
      service: '',
      service_type: '',
      details: '',
      value: '',
      slot: '',
      booking_id: `QA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      message: '',
      next_step: '',
    });
    if (!err) {
      setQuickAddText('');
      setQuickAddOpen(false);
      fetchLeads();
    }
    setQuickAddSaving(false);
  };

  const handleSaveJob = async () => {
    const margin = parseValue(jobMargin);
    if (margin <= 0) return;
    const total = jobTotal.trim() ? parseValue(jobTotal) : margin;
    setJobSaving(true);
    const { error: err } = await supabase.from('leads').insert({
      name: 'Sem nome',
      phone: '',
      email: null,
      location: jobRegion,
      region: jobRegion,
      status: jobDone ? 'Fechado' : 'scheduled',
      priority: 'Frio',
      source: 'WhatsApp',
      assigned_to: '',
      notes: jobNotes,
      service: jobService,
      service_type: '',
      details: '',
      value: `${margin}€`,
      margin_value: margin,
      total_value: total,
      slot: '',
      booking_id: `WA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      message: '',
      next_step: '',
    });
    if (!err) {
      setJobOpen(false);
      setJobMargin(''); setJobTotal(''); setJobNotes(''); setJobDone(true);
      fetchLeads();
    }
    setJobSaving(false);
  };

  // Computed stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = leads.filter(l => new Date(l.created_at) >= monthStart);
  const pending = leads.filter(l => l.status === 'pending' || l.status === 'Orçamento enviado' || l.status === 'Interesse demonstrado');
  const closed = leads.filter(l => l.status === 'scheduled' || l.status === 'Fechado');
  const potentialValue = pending.reduce((s, l) => {
    const v = edits[l.id]?.value ?? l.value;
    return s + parseValue(v);
  }, 0);
  const conversionRate = leads.length > 0 ? Math.round((closed.length / leads.length) * 100) : 0;

  const staleLeads = leads.filter(isStale);

  const cities = [...new Set(leads.map(l => l.location).filter(Boolean))].sort();
  const persons = [...new Set(leads.map(l => l.assigned_to).filter(Boolean))].sort();
  const priorities = ['Urgente', 'Quente', 'Morno', 'Frio', 'Fechado'];

  // ── Money metrics (2026-09-05): margin_value/total_value when set (WhatsApp
  // jobs + any lead edited since), falling back to the legacy text `value`
  // field for older quiz leads where both are treated as the same number
  // (no partner split tracked for those).
  const moneyOf = (l: Lead) => {
    const margin = l.margin_value ?? parseValue(edits[l.id]?.value ?? l.value);
    const total = l.total_value ?? margin;
    return { margin, total };
  };
  const isDone = (l: Lead) => l.status === 'Fechado' || l.status === 'scheduled';
  const doneThisMonth = thisMonth.filter(isDone);
  const monthMoney = doneThisMonth.reduce((acc, l) => {
    const m = moneyOf(l);
    return { margin: acc.margin + m.margin, total: acc.total + m.total };
  }, { margin: 0, total: 0 });
  const discountPct = monthMoney.total > 0 ? Math.round((1 - monthMoney.margin / monthMoney.total) * 100) : 0;

  const originCounts: Record<string, number> = { Website: 0, WhatsApp: 0 };
  leads.forEach(l => {
    const src = l.source === 'WhatsApp' ? 'WhatsApp' : 'Website';
    originCounts[src] = (originCounts[src] ?? 0) + 1;
  });
  const originTotal = Math.max(1, originCounts.Website + originCounts.WhatsApp);

  const regionMoney: Record<string, number> = {};
  leads.filter(isDone).forEach(l => {
    const region = l.region || (REGIONS.find(r => (l.location ?? '').includes(r)) ?? null);
    if (!region) return;
    regionMoney[region] = (regionMoney[region] ?? 0) + moneyOf(l).margin;
  });
  const maxRegionMoney = Math.max(1, ...Object.values(regionMoney));

  // suppress unused variable warnings — these are kept for compatibility
  void STATUS_CONFIG;
  void persons;
  void priorities;
  void filterAssigned;

  const filtered = leads.filter(l => {
    if (filterStatus !== 'all') {
      const grp = FILTER_STATUSES.find(g => g.value === filterStatus);
      if (grp && !grp.matches.includes(l.status)) return false;
    }
    if (filterCity !== 'all' && l.location !== filterCity) return false;
    if (filterPriority !== 'all' && l.priority !== filterPriority) return false;
    if (filterStaleOnly && !isStale(l)) return false;
    return true;
  });

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-gold" />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-white">Kyro Admin</h1>
            <p className="text-white/40 text-sm mt-1">Acesso restrito à equipa Kyro</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••••••"
              className={`w-full h-12 px-4 text-sm bg-white/[0.06] border rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors ${pwError ? 'border-red-500' : 'border-white/15'}`}
            />
            {pwError && <p className="text-red-400 text-xs mt-1.5">Password incorrecta</p>}
            <button
              onClick={handleLogin}
              className="w-full h-12 mt-4 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className={`text-white ${embedded ? "" : "min-h-screen bg-[#0D0D1A]"}`}>
      {/* Header */}
      {!embedded && (
        <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h1 className="font-playfair font-bold text-white text-lg leading-none">Kyro CRM</h1>
              <p className="text-[11px] text-white/30">Gestão de Leads</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/panel')} className="hidden sm:flex items-center gap-2 h-9 px-4 text-xs font-bold text-white/50 border border-white/10 rounded-xl hover:bg-white/[0.06] transition-colors">
              <Zap className="w-3.5 h-3.5" /> Painel
            </button>
            <button onClick={() => setJobOpen(true)} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-[#12121e] bg-gradient-to-r from-gold to-[#d4c57b] rounded-xl hover:opacity-90 transition-opacity">
              <Plus className="w-3.5 h-3.5" /> Registar Serviço
            </button>
            <button onClick={() => setQuickAddOpen(true)} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-white border border-white/20 rounded-xl hover:bg-white/[0.08] transition-colors">
              <Plus className="w-3.5 h-3.5" /> Novo Lead
            </button>
            <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-white/70 border border-white/[0.12] rounded-xl hover:bg-white/[0.06] transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
            <button onClick={fetchLeads} disabled={loading} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-gold border border-gold/30 rounded-xl hover:bg-gold/[0.08] transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
            </button>
            <button onClick={handleLogout} className="p-2 text-white/30 hover:text-white/60 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Embedded action bar */}
      {embedded && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <button onClick={() => setJobOpen(true)} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-[#12121e] bg-gradient-to-r from-gold to-[#d4c57b] rounded-xl hover:opacity-90 transition-opacity">
            <Plus className="w-3.5 h-3.5" /> Registar Serviço
          </button>
          <button onClick={() => setQuickAddOpen(true)} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-white border border-white/20 rounded-xl hover:bg-white/[0.08] transition-colors bg-white/[0.04]">
            <Plus className="w-3.5 h-3.5" /> Novo Lead
          </button>
          <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-white/70 border border-white/[0.12] rounded-xl hover:bg-white/[0.06] transition-colors bg-white/[0.04]">
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
          <button onClick={fetchLeads} disabled={loading} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-gold border border-gold/30 rounded-xl hover:bg-gold/[0.08] transition-colors bg-white/[0.04]">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </button>
        </div>
      )}

      <div className={`py-6 space-y-6 max-w-[1400px] ${embedded ? "" : "px-6 mx-auto"}`}>

        {/* Money-first stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-2xl p-5">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">Margem própria este mês</p>
            <p className="text-3xl font-playfair font-bold text-gold leading-none">{monthMoney.margin.toFixed(0)}€</p>
            <p className="text-[11.5px] text-white/35 mt-1.5">de <b className="text-white/60">{monthMoney.total.toFixed(0)}€</b> faturado {discountPct > 0 && `· ${discountPct}% p/ parceiros`}</p>
          </div>
          <StatCard icon={Users}      label="Leads este mês"    value={thisMonth.length} sub={`${leads.length} total histórico`}           color="bg-blue-500/15 text-blue-300" />
          <StatCard icon={TrendingUp} label="Taxa de conversão"  value={`${conversionRate}%`} sub={`${closed.length} concluídos`} color="bg-green-500/15 text-green-300" />
          <StatCard icon={Bell}       label="Follow-ups urgentes" value={staleLeads.length} sub={`Sem resposta há +${STALE_DAYS} dias`}     color="bg-amber-500/15 text-amber-300" />
        </div>

        {/* Origin + region breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs font-bold text-white/60 mb-3.5 flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-white/40" /> Origem dos leads</p>
            {(['Website', 'WhatsApp'] as const).map(src => (
              <div key={src} className="flex items-center gap-2.5 mb-2.5 last:mb-0">
                <span className="text-xs text-white/55 w-20 flex-shrink-0">{src}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(originCounts[src] / originTotal) * 100}%`, background: src === 'WhatsApp' ? '#5fd68a' : '#5b9bf0' }} />
                </div>
                <span className="text-xs font-bold text-white/75 w-8 text-right flex-shrink-0">{originCounts[src]}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-xs font-bold text-white/60 mb-3.5 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-white/40" /> Margem por região (concluídos)</p>
            {REGIONS.filter(r => regionMoney[r]).length === 0 && <p className="text-xs text-white/30">Sem dados de região ainda.</p>}
            {REGIONS.filter(r => regionMoney[r]).map(r => (
              <div key={r} className="flex items-center gap-2.5 mb-2.5 last:mb-0">
                <span className="text-xs text-white/55 w-16 flex-shrink-0">{REGION_LABEL[r]}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-[#d4c57b]" style={{ width: `${(regionMoney[r] / maxRegionMoney) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-gold w-16 text-right flex-shrink-0">{regionMoney[r].toFixed(0)}€</span>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up alert banner */}
        {staleLeads.length > 0 && (
          <button
            onClick={() => setFilterStaleOnly(v => !v)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
              filterStaleOnly
                ? 'bg-amber-500/20 border-amber-500/50'
                : 'bg-amber-900/15 border-amber-500/25 hover:bg-amber-900/25'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <span className="text-amber-300 font-bold text-sm">
                {staleLeads.length} lead{staleLeads.length !== 1 ? 's precisam' : ' precisa'} de follow-up
              </span>
              <span className="text-amber-300/60 text-xs ml-2">
                {filterStaleOnly ? 'Clica para ver todos' : `Status "Aguardar resposta" ou "Orçamento enviado" há mais de ${STALE_DAYS} dias`}
              </span>
            </div>
            <span className="text-amber-400 text-xs font-bold">{filterStaleOnly ? 'Ver todos ›' : 'Filtrar ›'}</span>
          </button>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-white/30 flex-shrink-0" />

          {/* Status — chips (canonical, matches the top-level status badges) */}
          <button
            onClick={() => setFilterStatus('all')}
            className={`h-8 px-3 text-[11.5px] font-bold rounded-lg border transition-colors ${filterStatus === 'all' ? 'border-gold text-gold bg-gold/[0.08]' : 'border-white/[0.12] text-white/60 bg-[#1a1a2e] hover:border-white/25'}`}
          >
            Todos
          </button>
          {FILTER_STATUSES.map(g => (
            <button
              key={g.value}
              onClick={() => setFilterStatus(g.value)}
              className={`h-8 px-3 text-[11.5px] font-bold rounded-lg border transition-colors ${filterStatus === g.value ? 'border-gold text-gold bg-gold/[0.08]' : 'border-white/[0.12] text-white/60 bg-[#1a1a2e] hover:border-white/25'}`}
            >
              {CANONICAL_STATUS[g.value]?.label ?? g.label}
            </button>
          ))}

          {/* Priority + City — secondary, compact selects */}
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={SELECT_CLS} style={{ colorScheme: 'dark' }}>
            <option value="all" className={OPTION_CLS}>Todas as prioridades</option>
            {FILTER_PRIORITIES.map(p => (
              <option key={p.value} value={p.value} className={OPTION_CLS}>{p.label}</option>
            ))}
          </select>
          <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className={SELECT_CLS} style={{ colorScheme: 'dark' }}>
            <option value="all" className={OPTION_CLS}>Todas as cidades</option>
            {cities.map(c => <option key={c} value={c} className={OPTION_CLS}>{c}</option>)}
          </select>

          <span className="text-xs text-white/30 ml-auto">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 inline mr-1" />Erro ao carregar leads: {error}. Confirma que a tabela <code className="bg-red-900/30 px-1 rounded">leads</code> existe no Supabase.
          </div>
        )}

        {/* Leads table — 7 columns by default; clica numa linha para ver/editar
            prioridade, responsável, próximo passo, notas e ações (guardar/apagar),
            tudo preservado, só escondido até se precisar (pedido do dono: menos
            poluição visual sem perder nenhuma função existente). */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  {['Data', 'Cliente', 'Serviço', 'Região', 'Origem', 'Valor', 'Estado'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[11px] font-bold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="text-center py-12 text-white/30">A carregar leads...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-white/30">
                    {leads.length === 0
                      ? 'Ainda não há leads. Cria a tabela no Supabase e aguarda o primeiro pedido!'
                      : 'Nenhum lead corresponde aos filtros seleccionados.'}
                  </td></tr>
                )}
                {(() => { let lastMonthKey = ''; return filtered.map((lead, i) => {
                  const edit = getEdit(lead);
                  const isDirty = edit.notes !== (lead.notes ?? '') || edit.next_step !== (lead.next_step ?? '') || edit.value !== (lead.value ?? '');
                  const isSaving = saving[lead.id];
                  const waPhone = (lead.phone ?? '').replace(/\D/g, '');
                  const waMsg = encodeURIComponent(buildWAMsg(lead));
                  const stale = isStale(lead);
                  const isExpanded = expandedId === lead.id;
                  const hasMargin = lead.margin_value != null;
                  const displayMargin = hasMargin ? lead.margin_value : (edit.value || lead.value || '-');
                  const displayTotal = hasMargin && lead.total_value != null && lead.total_value !== lead.margin_value ? lead.total_value : null;
                  const rowBg = stale ? 'bg-amber-900/[0.07]' : (i % 2 === 0 ? '' : 'bg-white/[0.01]');

                  // Cabeçalho de mês (pedido do dono: organizar por mês) — a
                  // lista já vem ordenada por created_at desc, por isso um
                  // header aparece sempre que o mês muda em relação à linha
                  // anterior, sem precisar de agrupar tudo antecipadamente.
                  const rowDate = new Date(lead.created_at);
                  const monthKey = `${rowDate.getFullYear()}-${rowDate.getMonth()}`;
                  const showMonthHeader = monthKey !== lastMonthKey;
                  lastMonthKey = monthKey;
                  let monthLabel = '', monthCount = 0, monthMargin = 0;
                  if (showMonthHeader) {
                    const monthLeads = filtered.filter(l => {
                      const d = new Date(l.created_at);
                      return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
                    });
                    monthCount = monthLeads.length;
                    monthMargin = monthLeads.reduce((s, l) => s + (l.margin_value ?? parseValue(l.value ?? '')), 0);
                    monthLabel = rowDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
                  }

                  return (
                    <Fragment key={lead.id}>
                      {showMonthHeader && (
                        <tr className="bg-white/[0.05]">
                          <td colSpan={7} className="px-3 py-2 text-[11px] font-bold text-gold/85 uppercase tracking-wider capitalize">
                            {monthLabel} <span className="text-white/35 normal-case font-medium tracking-normal">· {monthCount} serviço{monthCount !== 1 ? 's' : ''} · {monthMargin.toFixed(0)}€ margem</span>
                          </td>
                        </tr>
                      )}
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        className={`border-b cursor-pointer transition-colors hover:bg-indigo-500/[0.06] ${stale ? 'border-amber-500/20' : 'border-white/[0.04]'} ${rowBg}`}
                      >
                        {/* Date */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <p className="text-white/80 text-xs font-mono">{new Date(lead.created_at).toLocaleDateString('pt-PT')}</p>
                            {stale && (
                              <span title={`Sem follow-up há +${STALE_DAYS} dias`}>
                                <Bell className="w-3 h-3 text-amber-400 flex-shrink-0" />
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Client */}
                        <td className="px-3 py-2">
                          <p className="font-semibold text-white whitespace-nowrap">{lead.name}</p>
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-white/50 text-xs">{lead.phone}</span>
                              {waPhone.length >= 9 && (
                                <a
                                  href={`https://wa.me/351${waPhone}?text=${waMsg}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="flex-shrink-0 w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#20bd5a] transition-colors"
                                  title="Abrir WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 text-white" />
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                        {/* Service */}
                        <td className="px-3 py-2 max-w-[200px]">
                          {lead.service && lead.service !== 'Histórico' && (
                            <p className="font-semibold text-white/90 text-xs">{lead.service}{lead.service_type ? `: ${lead.service_type}` : ''}</p>
                          )}
                        </td>
                        {/* Região */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="text-white/55 text-[11px]">{lead.region || guessRegionFromLocation(lead.location)}</span>
                        </td>
                        {/* Source */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${lead.source === 'WhatsApp' ? 'bg-[#25D366]/15 text-[#5fd68a]' : 'bg-blue-500/15 text-blue-300'}`}>
                            {lead.source === 'WhatsApp' ? 'WhatsApp' : (lead.source || 'Website')}
                          </span>
                        </td>
                        {/* Value — nunca riscar o total: nao e desconto, e a
                            margem propria (esquerda) vs o corte do parceiro
                            (direita), dois valores reais, nao um "antes/depois". */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="font-bold text-gold text-xs">
                            {typeof displayMargin === 'number' ? `${displayMargin}€` : displayMargin}
                          </span>
                          {displayTotal != null && (
                            <span className="text-[10px] text-white/35 ml-1.5">· parceiro {(displayTotal - (displayMargin as number)).toFixed(2).replace(/\.00$/, '')}€</span>
                          )}
                        </td>
                        {/* Status — canonical badge only, edit inside the expanded row */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${getCanonicalStatus(edit.status).cls}`}>
                            {getCanonicalStatus(edit.status).label}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className={`border-b border-white/[0.04] ${rowBg}`}>
                          <td colSpan={7} className="px-4 py-4 bg-white/[0.015]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-white/35 uppercase tracking-wider mb-1">Localização</label>
                                <span className="text-white/80 text-xs font-medium flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{lead.location || '-'}</span>
                                {lead.details && <p className="text-white/40 text-[10px] mt-1 leading-snug">{lead.details}</p>}
                                {lead.slot && <p className="text-gold/50 text-[10px] mt-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{lead.slot}</p>}
                                {lead.email && <p className="text-white/25 text-[10px] mt-1">{lead.email}</p>}
                                {lead.booking_id && !lead.booking_id.startsWith('CSV-') && (
                                  <p className="text-gold/50 text-[10px] font-mono mt-1">#{lead.booking_id}</p>
                                )}

                                <label className="block text-[10px] font-bold text-white/35 uppercase tracking-wider mt-3 mb-1">Valor (legado, texto livre)</label>
                                <input
                                  type="text"
                                  value={getEdit(lead).value}
                                  onChange={e => setEdits(prev => ({ ...prev, [lead.id]: { ...getEdit(lead), value: e.target.value } }))}
                                  placeholder="ex: 89€"
                                  className="w-full max-w-[120px] h-7 px-2 text-[11px] font-bold bg-gold/[0.08] border border-gold/20 rounded text-gold placeholder:text-gold/30 focus:outline-none focus:border-gold"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-white/35 uppercase tracking-wider mb-1">Região</label>
                                <span className="inline-block text-xs font-medium text-white/70 mb-3">
                                  {lead.region || guessRegionFromLocation(lead.location)}
                                </span>

                                <label className="block text-[10px] font-bold text-white/35 uppercase tracking-wider mb-1">Estado</label>
                                <select
                                  value={FILTER_STATUSES.find(g => g.matches.includes(edit.status))?.value ?? 'pendente'}
                                  onChange={e => autoSaveField(lead.id, 'status', CRUCIAL_STATUS_RAW[e.target.value] ?? 'pending')}
                                  className="block text-[11px] font-bold px-2 py-1.5 rounded-lg border border-white/20 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold bg-[#1a1a2e] text-white max-w-[200px]"
                                  style={{ colorScheme: 'dark' }}
                                >
                                  {CRUCIAL_STATUSES.map(s => (
                                    <option key={s.value} value={s.value} className="bg-[#1a1a2e] text-white">
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-white/35 uppercase tracking-wider mb-1">Próximo passo / Notas</label>
                                {(() => {
                                  const insight = getSalesInsight(lead);
                                  const upsell = getUpsellBadge(lead);
                                  return (
                                    <>
                                      {upsell && (
                                        <span className="inline-block text-[9px] font-bold bg-blue-500/15 text-blue-300 border border-blue-400/20 px-1.5 py-0.5 rounded-full mb-1 mr-1">
                                          {upsell}
                                        </span>
                                      )}
                                      {insight && (
                                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1 border ${
                                          insight.type === 'price' ? 'bg-amber-500/15 text-amber-300 border-amber-400/20' :
                                          insight.type === 'ghost' ? 'bg-zinc-500/15 text-zinc-400 border-zinc-400/20' :
                                          'bg-red-500/15 text-red-300 border-red-400/20'
                                        }`}>
                                          {insight.emoji} {insight.text}
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                                <input
                                  type="text"
                                  value={edit.next_step}
                                  onChange={e => setEdits(prev => ({ ...prev, [lead.id]: { ...getEdit(lead), next_step: e.target.value } }))}
                                  placeholder="→ Próximo passo..."
                                  className="w-full h-7 px-2.5 text-[11px] font-semibold bg-gold/[0.06] border border-gold/20 rounded-lg text-gold placeholder:text-gold/30 focus:outline-none focus:border-gold transition-colors mb-1.5"
                                />
                                <textarea
                                  value={edit.notes}
                                  onChange={e => setEdits(prev => ({
                                    ...prev,
                                    [lead.id]: { ...getEdit(lead), notes: e.target.value },
                                  }))}
                                  placeholder="Histórico e notas..."
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white/[0.05] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors resize-y min-h-[40px] max-h-[120px]"
                                />
                                {(stale || getSalesInsight(lead)) && waPhone.length >= 9 && (
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    <a
                                      href={`https://wa.me/351${waPhone}?text=${encodeURIComponent(`Olá ${lead.name}, aqui é o António da Kyro Clean Solutions. Temos uma promoção especial esta semana: 10% de desconto. Posso enviar um orçamento atualizado?`)}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1 h-6 px-2 text-[9px] font-bold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/25 rounded-md hover:bg-[#25D366]/25 transition-colors whitespace-nowrap"
                                    >
                                      <Zap className="w-2.5 h-2.5" /> Enviar Promo
                                    </a>
                                    <a
                                      href={`https://wa.me/351${waPhone}?text=${encodeURIComponent(`Olá ${lead.name}, aqui é o António da Kyro Clean Solutions. Que tal marcarmos uma demonstração gratuita sem compromisso${lead.location ? ` em ${lead.location}` : ''}?`)}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1 h-6 px-2 text-[9px] font-bold bg-blue-500/15 text-blue-300 border border-blue-400/25 rounded-md hover:bg-blue-500/25 transition-colors whitespace-nowrap"
                                    >
                                      <MessageCircle className="w-2.5 h-2.5" /> Agendar Demo
                                    </a>
                                    <button
                                      onClick={() => setEdits(prev => ({ ...prev, [lead.id]: { ...getEdit(lead), priority: 'Frio' } }))}
                                      className="flex items-center gap-1 h-6 px-2 text-[9px] font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-400/25 rounded-md hover:bg-zinc-500/25 transition-colors whitespace-nowrap"
                                    >
                                      Mudar para Frio
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                              {saved[lead.id] ? (
                                <span className="flex items-center gap-1 h-8 px-3 text-[11px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg">
                                  <Check className="w-3.5 h-3.5" /> Guardado
                                </span>
                              ) : isDirty && (
                                <button
                                  onClick={() => saveEdit(lead.id)}
                                  disabled={isSaving}
                                  className="h-8 px-4 text-[11px] font-bold bg-gold text-[#12121e] rounded-lg hover:bg-[#d4c57b] transition-colors disabled:opacity-50"
                                >
                                  {isSaving ? '...' : 'Guardar alterações'}
                                </button>
                              )}
                              <button
                                onClick={() => deleteLead(lead.id)}
                                className="flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Apagar lead
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                }); })()}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Registar Serviço Modal (WhatsApp / telefone / cliente habitual) */}
      {jobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#14141f] border border-white/[0.10] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-playfair font-bold text-white text-lg">Registar Serviço</h3>
              <button onClick={() => setJobOpen(false)} className="p-1 text-white/30 hover:text-white/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/40 text-[11px] mb-4">Para pedidos que vieram por WhatsApp, telefone ou cliente habitual (fora do quiz do site).</p>

            <p className="text-[10.5px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Região</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {REGIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setJobRegion(r)}
                  className={`h-8 px-3.5 rounded-lg text-xs font-bold border-2 transition-colors ${jobRegion === r ? 'border-gold text-gold bg-gold/10' : 'border-white/12 text-white/60 bg-white/[0.03]'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <p className="text-[10.5px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Serviço</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {JOB_SERVICES.map(s => (
                <button
                  key={s}
                  onClick={() => setJobService(s)}
                  className={`h-8 px-3.5 rounded-lg text-xs font-bold border-2 transition-colors ${jobService === s ? 'border-gold text-gold bg-gold/10' : 'border-white/12 text-white/60 bg-white/[0.03]'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[10.5px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Margem própria</p>
                <input
                  type="text" value={jobMargin} onChange={e => setJobMargin(e.target.value)} placeholder="ex: 55€"
                  className="w-full h-10 px-3 text-sm bg-white/[0.05] border border-white/[0.12] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <p className="text-[10.5px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Valor total (opcional)</p>
                <input
                  type="text" value={jobTotal} onChange={e => setJobTotal(e.target.value)} placeholder="se houve parceiro"
                  className="w-full h-10 px-3 text-sm bg-white/[0.05] border border-white/[0.12] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
              <input type="checkbox" checked={jobDone} onChange={e => setJobDone(e.target.checked)} className="w-4 h-4 accent-gold" />
              <span className="text-xs text-white/60">Já concluído (desmarcar se ainda está agendado)</span>
            </label>

            <textarea
              value={jobNotes}
              onChange={e => setJobNotes(e.target.value)}
              placeholder="Notas (opcional)..."
              rows={2}
              className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-gold resize-none mb-4"
            />

            <div className="flex gap-3">
              <button onClick={() => setJobOpen(false)} className="flex-1 h-10 text-sm text-white/50 border border-white/[0.10] rounded-xl hover:bg-white/[0.05] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSaveJob}
                disabled={jobSaving || parseValue(jobMargin) <= 0}
                className="flex-1 h-10 text-sm font-bold bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {jobSaving ? 'A guardar...' : 'Guardar Serviço'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Lead Modal */}
      {quickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#13132B] border border-white/[0.10] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair font-bold text-white text-lg">Novo Lead Rápido</h3>
              <button onClick={() => setQuickAddOpen(false)} className="p-1 text-white/30 hover:text-white/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/40 text-xs mb-3 leading-relaxed">
              Cola o texto bruto (nome, telemóvel, localidade) e o sistema extrai automaticamente os dados.
              <br />Ex: <span className="text-white/60 font-mono">João Silva, 912345678, Porto, sofá</span>
            </p>
            <textarea
              value={quickAddText}
              onChange={e => setQuickAddText(e.target.value)}
              placeholder="Cola o texto aqui..."
              rows={4}
              className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-gold resize-none mb-3"
            />
            {quickAddText.trim() && (() => {
              const p = parseRawLead(quickAddText);
              return (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 mb-3 space-y-1">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">Preview</p>
                  <p className="text-xs text-white"><span className="text-white/40">Nome:</span> {p.name || '-'}</p>
                  <p className="text-xs text-white"><span className="text-white/40">Tel:</span> {p.phone || '-'}</p>
                  <p className="text-xs text-white"><span className="text-white/40">Cidade:</span> {p.location || '-'}</p>
                  {p.email && <p className="text-xs text-white"><span className="text-white/40">Email:</span> {p.email}</p>}
                </div>
              );
            })()}
            <div className="flex gap-3">
              <button
                onClick={() => setQuickAddOpen(false)}
                className="flex-1 h-10 text-sm text-white/50 border border-white/[0.10] rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleQuickAdd}
                disabled={quickAddSaving || !quickAddText.trim()}
                className="flex-1 h-10 text-sm font-bold bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {quickAddSaving ? 'A guardar...' : 'Adicionar Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

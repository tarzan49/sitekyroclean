import { useEffect, useState, useCallback } from 'react';
import { MessageCircle, Download, RefreshCw, LogOut, TrendingUp, Users, Euro, Filter, Upload, Bell, Plus, Zap, X, Trash2, Check, Lock, AlertTriangle, CalendarDays, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Lead, type LeadStatus } from '@/lib/supabase';

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

  const fetchLeads = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setLeads(data as Lead[] ?? []);
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
            <button onClick={() => navigate('/admin/import')} className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-gold/70 border border-gold/20 rounded-xl hover:bg-gold/[0.06] transition-colors">
              <Upload className="w-3.5 h-3.5" /> Importar BD Histórica
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard icon={Users}      label="Leads este mês"    value={thisMonth.length} sub={`${leads.length} total histórico`}           color="bg-blue-500/15 text-blue-300" />
          <StatCard icon={Euro}       label="Valor em potencial" value={`${potentialValue.toFixed(0)}€`} sub={`${pending.length} em progresso`} color="bg-gold/15 text-gold" />
          <StatCard icon={TrendingUp} label="Taxa de conversão"  value={`${conversionRate}%`} sub={`${closed.length} fechados`} color="bg-green-500/15 text-green-300" />
          <StatCard icon={Bell}       label="Follow-ups urgentes" value={staleLeads.length} sub={`Sem resposta há +${STALE_DAYS} dias`}     color="bg-amber-500/15 text-amber-300" />
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

          {/* Status */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={SELECT_CLS} style={{ colorScheme: 'dark' }}>
            <option value="all" className={OPTION_CLS}>Todos os estados</option>
            {FILTER_STATUSES.map(g => (
              <option key={g.value} value={g.value} className={OPTION_CLS}>{g.label}</option>
            ))}
          </select>

          {/* Priority */}
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={SELECT_CLS} style={{ colorScheme: 'dark' }}>
            <option value="all" className={OPTION_CLS}>Todas as prioridades</option>
            {FILTER_PRIORITIES.map(p => (
              <option key={p.value} value={p.value} className={OPTION_CLS}>{p.label}</option>
            ))}
          </select>

          {/* City */}
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

        {/* Leads table */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  {['Data', 'Resp.', 'Cliente', 'Serviço & Item', 'Localização', 'Prioridade', 'Status', 'Origem', 'Próx. passo / Notas', ''].map(h => (
                    <th key={h} className="text-left px-3 py-1.5 text-[11px] font-bold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={10} className="text-center py-12 text-white/30">A carregar leads...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-12 text-white/30">
                    {leads.length === 0
                      ? 'Ainda não há leads. Cria a tabela no Supabase e aguarda o primeiro pedido!'
                      : 'Nenhum lead corresponde aos filtros seleccionados.'}
                  </td></tr>
                )}
                {filtered.map((lead, i) => {
                  const edit = getEdit(lead);
                  const isDirty = edit.notes !== (lead.notes ?? '') || edit.next_step !== (lead.next_step ?? '') || edit.value !== (lead.value ?? '');
                  const isSaving = saving[lead.id];
                  const waPhone = (lead.phone ?? '').replace(/\D/g, '');
                  const waMsg = encodeURIComponent(buildWAMsg(lead));
                  const cfg = getStatusCfg(edit.status);
                  const stale = isStale(lead);

                  // cfg is used implicitly via the select styling — keep reference
                  void cfg;

                  return (
                    <tr key={lead.id} className={`border-b transition-colors hover:bg-indigo-500/[0.06] ${stale ? 'border-amber-500/20 bg-amber-900/[0.07]' : 'border-white/[0.04]' + (i % 2 === 0 ? '' : ' bg-white/[0.01]')}`}>
                      {/* Date */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white/80 text-xs font-mono">{new Date(lead.created_at).toLocaleDateString('pt-PT')}</p>
                          {stale && (
                            <span title={`Sem follow-up há +${STALE_DAYS} dias`}>
                              <Bell className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                        {lead.booking_id && !lead.booking_id.startsWith('CSV-') && (
                          <p className="text-gold/50 text-[10px] font-mono mt-0.5">#{lead.booking_id}</p>
                        )}
                        {stale && (
                          <span className="text-[9px] font-bold text-amber-400/70 uppercase tracking-wide">Follow-up!</span>
                        )}
                      </td>
                      {/* Assigned to */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="text-white/60 text-xs font-medium">{lead.assigned_to || '-'}</span>
                      </td>
                      {/* Client */}
                      <td className="px-3 py-1.5">
                        <p className="font-semibold text-white whitespace-nowrap">{lead.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {lead.phone && (
                            <>
                              <span className="text-white/50 text-xs">{lead.phone}</span>
                              {waPhone.length >= 9 && (
                                <a
                                  href={`https://wa.me/351${waPhone}?text=${waMsg}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#20bd5a] transition-colors"
                                  title="Abrir WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 text-white" />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                        {lead.email && <p className="text-white/25 text-[10px] mt-0.5">{lead.email}</p>}
                      </td>
                      {/* Service */}
                      <td className="px-3 py-1.5 max-w-[180px]">
                        {lead.service && lead.service !== 'Histórico' && (
                          <p className="font-semibold text-white/90 text-xs">{lead.service}{lead.service_type ? `: ${lead.service_type}` : ''}</p>
                        )}
                        {lead.details && <p className="text-white/40 text-[10px] mt-0.5 leading-snug">{lead.details}</p>}
                        {lead.slot && <p className="text-gold/50 text-[10px] mt-0.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{lead.slot}</p>}
                      </td>
                      {/* Location + value input */}
                      <td className="px-3 py-1.5">
                        <span className="text-white/80 text-xs font-medium whitespace-nowrap flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{lead.location}</span>
                        <input
                          type="text"
                          value={getEdit(lead).value}
                          onChange={e => setEdits(prev => ({ ...prev, [lead.id]: { ...getEdit(lead), value: e.target.value } }))}
                          placeholder="ex: 89€"
                          className="mt-0.5 w-full max-w-[70px] h-6 px-1.5 text-[11px] font-bold bg-gold/[0.08] border border-gold/20 rounded text-gold placeholder:text-gold/30 focus:outline-none focus:border-gold"
                        />
                      </td>
                      {/* Priority — auto-save on change */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <select
                          value={getEdit(lead).priority}
                          onChange={e => autoSaveField(lead.id, 'priority', e.target.value)}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg border cursor-pointer focus:outline-none bg-[#1a1a2e] text-white border-white/20"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="" className="bg-[#1a1a2e] text-white">-</option>
                          {FILTER_PRIORITIES.map(p => <option key={p.value} value={p.value} className="bg-[#1a1a2e] text-white">{p.label}</option>)}
                        </select>
                      </td>
                      {/* Status — auto-save on change */}
                      <td className="px-3 py-1.5">
                        <select
                          value={edit.status}
                          onChange={e => autoSaveField(lead.id, 'status', e.target.value)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold bg-[#1a1a2e] text-white max-w-[160px]"
                          style={{ colorScheme: 'dark' }}
                        >
                          {Object.keys(STATUS_MAP).map(s => (
                            <option key={s} value={s} className="bg-[#1a1a2e] text-white">
                              {STATUS_MAP[s].dot} {STATUS_MAP[s].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Source */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="text-white/40 text-[10px]">{lead.source || '-'}</span>
                      </td>
                      {/* Next step + Notes */}
                      <td className="px-3 py-1.5 min-w-[200px]">
                        {/* Sales insight */}
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
                      </td>
                      {/* Actions: save + delete */}
                      <td className="px-3 py-1.5">
                        <div className="flex flex-col items-center gap-1.5">
                          {saved[lead.id] ? (
                            <span className="flex items-center gap-1 h-7 px-2.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg whitespace-nowrap">
                              <Check className="w-3 h-3" /> Guardado
                            </span>
                          ) : isDirty && (
                            <button
                              onClick={() => saveEdit(lead.id)}
                              disabled={isSaving}
                              className="h-7 px-3 text-[10px] font-bold bg-gold text-[#12121e] rounded-lg hover:bg-[#d4c57b] transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {isSaving ? '...' : 'Guardar'}
                            </button>
                          )}
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Apagar lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

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

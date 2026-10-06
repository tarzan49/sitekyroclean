// Fichas de clientes (dono, 2026-10-06): um contacto por pessoa do WhatsApp
// Business, com o estado, os artigos e a região tirados das etiquetas, e os
// serviços lidos do CRM de vendas pelo telefone. Serve para escolher um grupo
// (ex.: "não interessados de Lisboa com sofá") e mandar a cada um uma mensagem
// própria no Natal, na Black Friday, etc.

export const CLIENT_STATUSES = ['cliente', 'marcado', 'por_marcar', 'nao_interessado', 'sem_estado'] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const STATUS_LABEL: Record<ClientStatus, string> = {
  cliente: 'Cliente (serviço feito)',
  marcado: 'Serviço marcado',
  por_marcar: 'Por marcar',
  nao_interessado: 'Não interessado',
  sem_estado: 'Sem estado',
};

export const CLIENT_SERVICES = ['Sofá', 'Colchão', 'Tapete', 'Cadeira', 'Impermeabilização', 'Recolha'] as const;
export const CLIENT_REGIONS = ['Porto', 'Lisboa', 'Braga', 'Algarve', 'Coimbra'] as const;

/** Etiquetas do WhatsApp Business que dizem o estado, da mais forte para a mais fraca. */
const STATUS_BY_LABEL: [string, ClientStatus][] = [
  ['Concluído', 'cliente'],
  ['Deu Avaliação Google', 'cliente'],
  ['Serviço Marcado', 'marcado'],
  ['Por marcar serviço', 'por_marcar'],
  ['1 mês followup', 'por_marcar'],
  ['Dar seguimento', 'por_marcar'],
  ['Lead', 'por_marcar'],
  ['Não está interessado', 'nao_interessado'],
];

/** O WhatsApp põe um caráter invisível à frente de alguns nomes de etiqueta ("‎Concluído"). */
const cleanLabel = (name: string) => name.replace(/[‎‏‪-‮]/g, '').trim();

export interface LabelFacts {
  status: ClientStatus;
  services: string[];
  region: string | null;
  fromGoogleAds: boolean;
  reviewedGoogle: boolean;
  labels: string[];
}

export function factsFromLabels(rawLabels: string[]): LabelFacts {
  const labels = rawLabels.map(cleanLabel).filter(Boolean);
  const has = (l: string) => labels.includes(l);
  const status = STATUS_BY_LABEL.find(([l]) => has(l))?.[1] ?? 'sem_estado';
  return {
    status,
    services: CLIENT_SERVICES.filter(has),
    region: CLIENT_REGIONS.find(has) ?? null,
    fromGoogleAds: has('Google'),
    reviewedGoogle: has('Deu Avaliação Google'),
    labels,
  };
}

/** Só os dígitos, com indicativo (o WhatsApp guarda assim: 351912345678). */
export const normalizePhone = (phone: string) => phone.replace(/\D/g, '').replace(/^00/, '');

/** Os últimos 9 dígitos: é o que liga um contacto às linhas do CRM, escritas com ou sem +351 e espaços. */
export const phoneKey = (phone: string | null | undefined) => (phone ? normalizePhone(phone).slice(-9) : '');

/** "+351 912 345 678" para números portugueses; o resto fica com + à frente. */
export function formatPhone(phone: string) {
  const d = normalizePhone(phone);
  if (d.length === 12 && d.startsWith('351')) return `+351 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  return `+${d}`;
}

export interface ClientRow {
  id: string;
  phone: string;
  name: string | null;
  whatsapp_name: string | null;
  status: ClientStatus;
  services: string[];
  region: string | null;
  from_google_ads: boolean;
  reviewed_google: boolean;
  labels: string[];
  first_contact_at: string | null;
  last_contact_at: string | null;
  last_client_message_at: string | null;
  notes: string | null;
  source: string;
  /** Dia em que o dono quer voltar a falar com a pessoa (AAAA-MM-DD). */
  follow_up_at?: string | null;
  follow_up_reason?: string | null;
}

/** O que a ficha precisa de uma linha do CRM de vendas. */
export interface ClientService {
  id: string;
  request_date: string;
  description: string;
  billed_value: number;
  client_name: string | null;
  city: string | null;
  phone: string | null;
}

const NOT_A_NAME = new Set(['cliente', 'senhora', 'senhor', 'sr', 'sra', 'nao', 'pt', 'casa']);

export const displayName =(c: Pick<ClientRow, 'name' | 'whatsapp_name' | 'phone'>, services: ClientService[] = []) =>
  c.name?.trim() || services.find(s => s.client_name?.trim())?.client_name?.trim() || c.whatsapp_name?.trim() || formatPhone(c.phone);

/** Primeiro nome, para começar uma mensagem ("Olá Ana,"). Vazio se o nome for o próprio número. */
export function firstName(c: Pick<ClientRow, 'name' | 'whatsapp_name' | 'phone'>, services: ClientService[] = []) {
  const name = displayName(c, services);
  if (name.startsWith('+')) return '';
  const first = name.replace(/^[^\p{L}]+/u, '').match(/^\p{L}+/u)?.[0] ?? '';
  // Nomes guardados como nota ("Cliente tapete 8m2", "Senhora limpeza colchão") não dão um nome para a mensagem.
  if (!/^\p{L}{2,}$/u.test(first) || NOT_A_NAME.has(fold(first))) return '';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function servicesByPhone(services: ClientService[]) {
  const map = new Map<string, ClientService[]>();
  for (const s of services) {
    const key = phoneKey(s.phone);
    if (key.length < 9) continue;
    const list = map.get(key) ?? [];
    list.push(s);
    map.set(key, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.request_date.localeCompare(b.request_date));
  return map;
}

export interface ClientSummary {
  services: ClientService[];
  totalBilled: number;
  lastServiceDate: string | null;
  /** Dias desde o último serviço, a contar de `today` (AAAA-MM-DD). */
  daysSinceLastService: number | null;
}

export function summarizeClient(client: Pick<ClientRow, 'phone'>, byPhone: Map<string, ClientService[]>, today: string): ClientSummary {
  const services = byPhone.get(phoneKey(client.phone)) ?? [];
  const lastServiceDate = services.length ? services[services.length - 1].request_date : null;
  const daysSinceLastService = lastServiceDate
    ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastServiceDate}T00:00:00Z`)) / 86_400_000)
    : null;
  return {
    services,
    totalBilled: services.reduce((s, r) => s + Number(r.billed_value || 0), 0),
    lastServiceDate,
    daysSinceLastService,
  };
}

/** Um cliente com serviço no CRM conta como cliente, mesmo que a etiqueta tenha ficado para trás. */
export const effectiveStatus = (c: Pick<ClientRow, 'status'>, summary: Pick<ClientSummary, 'services'>): ClientStatus =>
  summary.services.length > 0 && c.status !== 'cliente' && c.status !== 'marcado' ? 'cliente' : c.status;

export interface ClientFilters {
  search: string;
  statuses: ClientStatus[];
  services: string[];
  regions: string[];
  googleAds: 'all' | 'yes' | 'no';
  review: 'all' | 'yes' | 'no';
}

export const emptyFilters = (): ClientFilters => ({ search: '', statuses: [], services: [], regions: [], googleAds: 'all', review: 'all' });

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function matchesFilters(c: ClientRow, summary: ClientSummary, f: ClientFilters) {
  if (f.statuses.length && !f.statuses.includes(effectiveStatus(c, summary))) return false;
  if (f.services.length && !f.services.some(s => c.services.includes(s))) return false;
  if (f.regions.length && !(c.region && f.regions.includes(c.region))) return false;
  if (f.googleAds !== 'all' && c.from_google_ads !== (f.googleAds === 'yes')) return false;
  if (f.review !== 'all' && c.reviewed_google !== (f.review === 'yes')) return false;
  const q = fold(f.search.trim());
  if (!q) return true;
  const digits = q.replace(/\D/g, '');
  const haystack = fold([displayName(c, summary.services), c.whatsapp_name ?? '', c.notes ?? '', ...summary.services.map(s => s.description)].join(' '));
  return haystack.includes(q) || (digits.length >= 3 && normalizePhone(c.phone).includes(digits));
}

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function clientsCsv(rows: { client: ClientRow; summary: ClientSummary }[]) {
  const header = ['Primeiro nome', 'Nome', 'Telefone', 'Estado', 'Artigos', 'Região', 'Anúncio Google', 'Deu avaliação', 'Serviços no CRM', 'Total faturado', 'Último serviço', 'Último contacto', 'Notas'];
  const lines = rows.map(({ client: c, summary: s }) => [
    firstName(c, s.services),
    displayName(c, s.services),
    `+${normalizePhone(c.phone)}`,
    STATUS_LABEL[effectiveStatus(c, s)],
    c.services.join(' + '),
    c.region ?? '',
    c.from_google_ads ? 'sim' : 'não',
    c.reviewed_google ? 'sim' : 'não',
    s.services.length,
    s.totalBilled,
    s.lastServiceDate ?? '',
    c.last_contact_at?.slice(0, 10) ?? '',
    c.notes ?? '',
  ].map(csvCell).join(','));
  return [header.join(','), ...lines].join('\n');
}

// ── Evolução (dono, 2026-10-06) ─────────────────────────────────────────────
// Quantos contactos novos chegaram, quantos fecharam e a taxa de fecho, por mês
// e nos últimos 30/60/90/120/360 dias. Um contacto conta no mês do primeiro
// contacto. "Fechou" = serviço feito ou marcado. A taxa "mensagem recebida vs
// fecho" só conta quem chegou a escrever (há conversas que começaram por nós).

export const STAT_PERIODS = [30, 60, 90, 120, 360] as const;
export type StatPeriod = (typeof STAT_PERIODS)[number];

export interface StatInput {
  client: Pick<ClientRow, 'status' | 'first_contact_at' | 'last_client_message_at' | 'from_google_ads'>;
  summary: Pick<ClientSummary, 'services'>;
}

export interface ContactStats {
  contacts: number;
  /** Contactos que mandaram pelo menos uma mensagem. */
  wrote: number;
  closed: number;
  closedWhoWrote: number;
  notInterested: number;
  googleAds: number;
  /** fechados ÷ contactos, 0..1; null sem contactos. */
  closeRate: number | null;
  /** fechados que escreveram ÷ contactos que escreveram. */
  messageCloseRate: number | null;
}

const isClosed = (s: ClientStatus) => s === 'cliente' || s === 'marcado';

export function contactStats(rows: StatInput[]): ContactStats {
  let wrote = 0, closed = 0, closedWhoWrote = 0, notInterested = 0, googleAds = 0;
  for (const { client, summary } of rows) {
    const status = effectiveStatus(client, summary);
    const w = !!client.last_client_message_at;
    if (w) wrote++;
    if (isClosed(status)) { closed++; if (w) closedWhoWrote++; }
    if (status === 'nao_interessado') notInterested++;
    if (client.from_google_ads) googleAds++;
  }
  return {
    contacts: rows.length, wrote, closed, closedWhoWrote, notInterested, googleAds,
    closeRate: rows.length ? closed / rows.length : null,
    messageCloseRate: wrote ? closedWhoWrote / wrote : null,
  };
}

const DAY_MS = 86_400_000;

/** Contactos cujo primeiro contacto caiu nos `days` dias até `now`, ou nos `days` dias anteriores a esses (offset 1). */
export function inWindow(rows: StatInput[], now: Date, days: number, offset = 0) {
  const end = now.getTime() - offset * days * DAY_MS;
  const start = end - days * DAY_MS;
  return rows.filter(r => {
    const t = r.client.first_contact_at ? Date.parse(r.client.first_contact_at) : NaN;
    return t > start && t <= end;
  });
}

/** Mês (AAAA-MM, hora de Lisboa) do primeiro contacto. */
export const contactMonth = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit' }).format(new Date(iso)).slice(0, 7);

/** Segunda-feira (AAAA-MM-DD, hora de Lisboa) da semana do primeiro contacto. */
export function contactWeek(iso: string) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

function groupedStats(rows: StatInput[], keyOf: (iso: string) => string) {
  const groups = new Map<string, StatInput[]>();
  for (const r of rows) {
    if (!r.client.first_contact_at) continue;
    const k = keyOf(r.client.first_contact_at);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  return [...groups.keys()].sort().map(key => ({ key, ...contactStats(groups.get(key)!) }));
}

/** Todos os meses com contactos, do mais antigo para o mais recente (não depende do período escolhido). */
export const monthlyStats = (rows: StatInput[]) => groupedStats(rows, contactMonth);

/** Todas as semanas (de segunda a domingo) com contactos, da mais antiga para a mais recente. */
export const weeklyStats = (rows: StatInput[]) => groupedStats(rows, contactWeek);

// ── Seguimentos (dono, 2026-10-06) ──────────────────────────────────────────
// O que fazer com cada contacto em aberto, a partir das datas da ficha:
// avisos com data marcada (ex.: "fica para o ano"), quem escreveu por último e
// está à espera de nós, quem tem seguimento a fazer e quem fica para uma
// mensagem de época (Natal, Black Friday).

export type FollowUpKind = 'lembrete' | 'a_espera' | 'seguimento' | 'epoca';

export interface FollowUpInput {
  client: Pick<ClientRow, 'status' | 'last_contact_at' | 'last_client_message_at'> & { follow_up_at?: string | null };
  summary: Pick<ClientSummary, 'services'>;
}

const daysBetween = (fromIso: string, today: string) =>
  Math.floor((Date.parse(`${today}T12:00:00Z`) - Date.parse(fromIso)) / 86_400_000);

/** Um aviso aparece 7 dias antes da data. */
export const REMINDER_LEAD_DAYS = 7;

export function followUpKind({ client, summary }: FollowUpInput, today: string): { kind: FollowUpKind; days: number } | null {
  if (client.follow_up_at) {
    const until = -daysBetween(`${client.follow_up_at}T12:00:00Z`, today);
    return until <= REMINDER_LEAD_DAYS ? { kind: 'lembrete', days: until } : null;
  }
  const status = effectiveStatus(client, summary);
  if (status === 'cliente' || status === 'marcado') return null;
  if (!client.last_contact_at) return null;
  const quiet = daysBetween(client.last_contact_at, today);
  if (status === 'nao_interessado' || quiet > 40) return { kind: 'epoca', days: quiet };
  const theyWroteLast = !!client.last_client_message_at && client.last_client_message_at >= client.last_contact_at;
  if (theyWroteLast) return { kind: 'a_espera', days: quiet };
  if (quiet >= 1) return { kind: 'seguimento', days: quiet };
  return null;
}

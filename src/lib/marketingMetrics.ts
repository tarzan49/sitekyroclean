/**
 * Contas do painel de marketing.
 *
 * Funções puras, sem React e sem Supabase: recebem as linhas e devolvem os
 * números. É o que torna testável a parte que se engana em silêncio — uma taxa
 * calculada sobre o denominador errado não dá erro em lado nenhum, só produz
 * uma decisão errada sobre onde pôr o dinheiro.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * A distinção que atravessa o ficheiro todo: OPERACIONAL vs OBSERVADO
 * ════════════════════════════════════════════════════════════════════════════
 *
 * **Operacional** é o que o negócio recebeu: linhas da tabela `leads`. Existe
 * independentemente de cookies. Quem recusa análise e pede um orçamento conta
 * aqui, com nome, telefone e serviço, como qualquer outro.
 *
 * **Observado** é o que a medição conseguiu ver: sessões e atribuição, em
 * `quiz_events` e `lead_attribution`. Só existe com consentimento de análise.
 *
 * Os dois nunca se misturam num denominador. Dividir *todos* os leads
 * operacionais pelas sessões *consentidas* dá uma taxa de conversão inflacionada
 * — o numerador inclui pessoas que o denominador nunca viu. Onde é preciso uma
 * taxa por sessão, o numerador é restringido aos leads observados, e o painel
 * diz que é uma taxa observada e não a taxa do site.
 */

/** Ordem do funil. Só serve para comparar "chegou pelo menos até". */
export const STATUS_RANK: Record<string, number> = {
  NEW: 0, VALID: 1, QUALIFIED: 2, QUOTED: 3, BOOKED: 4, COMPLETED: 5,
};

/** Estados terminais que não são progresso: o lead parou aqui. */
export const TERMINAL_STATUSES = ['INVALID', 'LOST', 'CANCELLED'] as const;

export interface LeadRow {
  id: string;
  created_at: string;
  lead_id: string | null;
  service: string | null;
  location: string | null;
  source: string | null;
  funnel_status: string | null;
  quoted_value: number | null;
  booked_value: number | null;
  final_revenue: number | null;
  amount_received: number | null;
  payment_received_at: string | null;
  completed_at: string | null;
}

export interface AttributionRow {
  lead_id: string;
  lead_row_id: string | null;
  channel: string | null;
  first_source: string | null;
  first_medium: string | null;
  first_campaign: string | null;
  first_landing_page: string | null;
  first_seen_at: string | null;
  last_source: string | null;
  last_medium: string | null;
  last_campaign: string | null;
  last_landing_page: string | null;
  last_seen_at: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  campaign_id: string | null;
  ad_group_id: string | null;
  keyword: string | null;
  match_type: string | null;
  creative_id: string | null;
  ads_device: string | null;
  network: string | null;
  referrer: string | null;
  referrer_source: string | null;
  landing_page: string | null;
  conversion_page: string | null;
  is_paid: boolean | null;
  ga_client_id: string | null;
}

export interface StatusHistoryRow {
  lead_row_id: string | null;
  lead_id: string | null;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_at: string;
  note: string | null;
}

export interface SessionEventRow {
  session_id: string;
  action: string;
  created_at: string;
  page_path: string | null;
  landing_page: string | null;
  is_paid: boolean | null;
  campaign_id: string | null;
}

export interface ContactLogRow {
  id: string;
  occurred_at: string;
  channel: 'whatsapp' | 'phone' | 'email' | 'other' | string;
  direction: string;
  lead_row_id: string | null;
  note: string | null;
  logged_by: string | null;
}

/**
 * Gasto publicitário, quando alguém o carregar.
 *
 * Hoje não há nenhuma ligação à API do Google Ads nem importação de relatório,
 * por isso isto chega sempre vazio e é por isso que os campos de custo do
 * painel são `null`.
 *
 * `dateBasis` existe porque custo e receita não vivem no mesmo calendário: o
 * custo acontece na data do **clique**, o lead na data do **pedido**, e a
 * receita na data do **serviço**. Comparar um gasto de setembro com receita de
 * outubro sem o dizer produz um ROAS que não quer dizer nada.
 */
export interface AdSpendRow {
  campaign_id: string | null;
  cost: number;
  currency: string;
  clicks?: number;
  impressions?: number;
  periodStart: string;
  periodEnd: string;
  dateBasis: 'click';
}

/** Até onde este lead chegou, contando o histórico e não só o estado atual. */
export function maxRankReached(lead: LeadRow, history: StatusHistoryRow[]): number {
  const ranks = history
    .filter(row => row.lead_row_id === lead.id || (lead.lead_id !== null && row.lead_id === lead.lead_id))
    .map(row => STATUS_RANK[row.new_status])
    .filter(rank => rank !== undefined);
  const current = lead.funnel_status ? STATUS_RANK[lead.funnel_status] : undefined;
  if (current !== undefined) ranks.push(current);
  // Um lead perdido esteve válido antes de se perder: sem o histórico, contar
  // só o estado atual fazia desaparecer dos "leads válidos" toda a gente que
  // acabou por não fechar — e a taxa de validação subia sempre que se perdia
  // um cliente.
  //
  // Contar o ponto mais alto **não** transforma cada mudança de estado num lead
  // novo: o `max` é por lead, e cada lead entra uma vez em cada contagem.
  return ranks.length ? Math.max(...ranks) : 0;
}

export interface FunnelCounts {
  /** Linhas distintas em `leads`. Um lead conta uma vez, tenha 1 ou 9 mudanças de estado. */
  leads: number;
  valid: number;
  qualified: number;
  quoted: number;
  bookings: number;
  customers: number;
  lost: number;
  /** Soma de `final_revenue`. Faturado, não recebido. */
  revenueBilled: number;
  /** Quantos serviços concluídos têm mesmo `final_revenue` preenchido. */
  billedKnownCount: number;
  /** Soma de `amount_received`. Dinheiro em conta. Nunca somado ao faturado. */
  revenueReceived: number;
  receivedKnownCount: number;
  /** Soma de `booked_value`. Valor combinado na marcação; não é receita. */
  bookedValueTotal: number;
}

/**
 * Contagens do funil.
 *
 * Fórmulas, para poderem ser reconciliadas à mão contra o SQL:
 *
 *   leads          = count(*) sobre as linhas recebidas
 *   valid          = count(*) where maxRank >= 1
 *   qualified      = count(*) where maxRank >= 2
 *   quoted         = count(*) where maxRank >= 3
 *   bookings       = count(*) where maxRank >= 4
 *   customers      = count(*) where maxRank >= 5
 *   lost           = count(*) where funnel_status in (INVALID, LOST, CANCELLED)
 *   revenueBilled  = sum(final_revenue)     where final_revenue > 0
 *   revenueReceived= sum(amount_received)   where amount_received > 0
 *   bookedValueTotal = sum(booked_value)    where booked_value > 0
 *
 * `quoted_value`, `booked_value`, `final_revenue` e `amount_received` são
 * quatro momentos do mesmo dinheiro, não quatro receitas. Somá-los conta o
 * mesmo serviço até quatro vezes. Aqui vão em campos separados e o painel nunca
 * os adiciona.
 */
export function countFunnel(leads: LeadRow[], history: StatusHistoryRow[]): FunnelCounts {
  const counts: FunnelCounts = {
    leads: leads.length, valid: 0, qualified: 0, quoted: 0, bookings: 0, customers: 0, lost: 0,
    revenueBilled: 0, billedKnownCount: 0, revenueReceived: 0, receivedKnownCount: 0, bookedValueTotal: 0,
  };
  for (const lead of leads) {
    const rank = maxRankReached(lead, history);
    if (rank >= STATUS_RANK.VALID) counts.valid++;
    if (rank >= STATUS_RANK.QUALIFIED) counts.qualified++;
    if (rank >= STATUS_RANK.QUOTED) counts.quoted++;
    if (rank >= STATUS_RANK.BOOKED) counts.bookings++;
    if (rank >= STATUS_RANK.COMPLETED) counts.customers++;
    if (lead.funnel_status && (TERMINAL_STATUSES as readonly string[]).includes(lead.funnel_status)) counts.lost++;

    if (typeof lead.final_revenue === 'number' && lead.final_revenue > 0) {
      counts.revenueBilled += lead.final_revenue;
      counts.billedKnownCount++;
    }
    if (typeof lead.amount_received === 'number' && lead.amount_received > 0) {
      counts.revenueReceived += lead.amount_received;
      counts.receivedKnownCount++;
    }
    if (typeof lead.booked_value === 'number' && lead.booked_value > 0) {
      counts.bookedValueTotal += lead.booked_value;
    }
  }
  return counts;
}

/** Divisão que devolve `null` em vez de `NaN` ou `Infinity` quando não há base. */
export function rate(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

export interface CostMetrics {
  cost: number | null;
  currency: string | null;
  cpl: number | null;
  cpa: number | null;
  cac: number | null;
  roas: number | null;
  /** Porque é que não há números, em português, para o painel escrever. */
  unavailableReason: string | null;
  /** Avisos de comparação que não se pode calar (moedas ou períodos diferentes). */
  warnings: string[];
}

const NO_COST: CostMetrics = {
  cost: null, currency: null, cpl: null, cpa: null, cac: null, roas: null,
  unavailableReason: 'Dados de custo não ligados.', warnings: [],
};

/**
 * Métricas de economia. Todas `null` sem gasto carregado — de propósito.
 *
 * CPA e CAC são a mesma divisão sobre denominadores diferentes: CPA é custo por
 * marcação (BOOKED), CAC é custo por cliente a quem o serviço chegou a ser
 * prestado (COMPLETED). Num negócio em que a marcação pode ser cancelada, os
 * dois números afastam-se, e o segundo é o que conta.
 *
 *   cost = sum(spend.cost)
 *   cpl  = cost / leads        (leads operacionais do período)
 *   cpa  = cost / bookings
 *   cac  = cost / customers
 *   roas = revenueBilled / cost
 *
 * ROAS usa **faturado**, não recebido: é a medida de desempenho da campanha, e
 * o atraso de um pagamento não é um problema do anúncio. O recebido aparece à
 * parte no painel, para não haver dúvida sobre qual é qual.
 */
export function costMetrics(
  spend: AdSpendRow[] | null,
  funnel: FunnelCounts,
  options?: { leadPeriodStart?: string; leadPeriodEnd?: string },
): CostMetrics {
  if (!spend || !spend.length) return NO_COST;

  const warnings: string[] = [];
  const currencies = new Set(spend.map(row => row.currency));
  if (currencies.size > 1) {
    return { ...NO_COST, unavailableReason: `Gasto em várias moedas (${[...currencies].join(', ')}). Converter antes de comparar.` };
  }
  const currency = [...currencies][0] ?? 'EUR';
  if (currency !== 'EUR') {
    return { ...NO_COST, unavailableReason: `Gasto em ${currency} e receita em EUR. Converter antes de comparar.` };
  }

  // O custo é sempre por data de clique; os leads e a receita não. É uma
  // aproximação, e uma aproximação anunciada é utilizável — uma escondida não.
  if (options?.leadPeriodStart && options?.leadPeriodEnd) {
    const spendStart = spend.map(row => row.periodStart).sort()[0];
    const spendEnd = spend.map(row => row.periodEnd).sort().reverse()[0];
    if (spendStart > options.leadPeriodStart || spendEnd < options.leadPeriodEnd) {
      warnings.push('O período do gasto não cobre todo o período dos leads: o CPL e o CAC saem otimistas.');
    }
  }
  warnings.push('Custo por data do clique; leads por data do pedido; receita por data do serviço.');

  const cost = spend.reduce((total, row) => total + row.cost, 0);
  if (cost <= 0) return { ...NO_COST, cost, currency, unavailableReason: 'Gasto importado é zero.' };

  return {
    cost,
    currency,
    cpl: funnel.leads > 0 ? cost / funnel.leads : null,
    cpa: funnel.bookings > 0 ? cost / funnel.bookings : null,
    cac: funnel.customers > 0 ? cost / funnel.customers : null,
    roas: funnel.revenueBilled > 0 ? funnel.revenueBilled / cost : null,
    unavailableReason: null,
    warnings,
  };
}

export interface JoinedLead {
  lead: LeadRow;
  attribution: AttributionRow | null;
  rank: number;
}

/** Liga cada lead à sua atribuição. Um lead sem atribuição continua a contar. */
export function joinLeads(leads: LeadRow[], attribution: AttributionRow[], history: StatusHistoryRow[]): JoinedLead[] {
  const byLeadId = new Map(attribution.map(row => [row.lead_id, row]));
  const byRowId = new Map(attribution.filter(row => row.lead_row_id).map(row => [row.lead_row_id!, row]));
  return leads.map(lead => ({
    lead,
    attribution: (lead.lead_id ? byLeadId.get(lead.lead_id) : undefined) ?? byRowId.get(lead.id) ?? null,
    rank: maxRankReached(lead, history),
  }));
}

/** Só os que vieram de publicidade. Sem atribuição, não se assume que vieram. */
export function paidOnly(joined: JoinedLead[]): JoinedLead[] {
  return joined.filter(item => item.attribution?.is_paid === true);
}

/** Os que a medição conseguiu observar. É este o numerador das taxas por sessão. */
export function observedOnly(joined: JoinedLead[]): JoinedLead[] {
  return joined.filter(item => item.attribution !== null);
}

export interface CoverageSummary {
  operationalLeads: number;
  observedLeads: number;
  unobservedLeads: number;
  /** Fração dos leads com atribuição. Mede a cobertura da medição, não o negócio. */
  observedShare: number | null;
}

/**
 * Quanto do negócio a medição está a ver.
 *
 * É o número que impede o resto do painel de ser lido como se fosse o total.
 * Se metade dos leads não tem atribuição — porque recusaram cookies, porque a
 * migração ainda não tinha sido aplicada, porque o armazenamento estava
 * bloqueado — qualquer taxa por campanha é sobre a outra metade.
 */
export function coverage(joined: JoinedLead[]): CoverageSummary {
  const observed = observedOnly(joined).length;
  return {
    operationalLeads: joined.length,
    observedLeads: observed,
    unobservedLeads: joined.length - observed,
    observedShare: rate(observed, joined.length),
  };
}

export interface GroupedRow {
  key: string;
  campaign: string;
  adGroup: string;
  keyword: string;
  matchType: string;
  device: string;
  landingPage: string;
  leads: number;
  valid: number;
  qualified: number;
  bookings: number;
  customers: number;
  revenueBilled: number;
}

/** Marcador único para "não veio nenhum valor", distinto de um valor vazio. */
export const UNKNOWN = 'Não disponível';

function orUnknown(value: string | null | undefined): string {
  return value && value.trim() ? value : UNKNOWN;
}

/**
 * Leads agrupados por campanha × grupo × palavra-chave.
 *
 * `keyword` é a palavra-chave da conta, servida pelo ValueTrack. O termo que a
 * pessoa escreveu na Google não existe aqui e não pode ser deduzido: vive só no
 * Search Terms Report do Google Ads.
 *
 * Atribuição **last touch**, que é a que o Google Ads credita por omissão e por
 * isso a única que se pode reconciliar com o relatório de lá. O first touch
 * existe no detalhe de cada lead e nunca é somado a este: são duas leituras do
 * mesmo lead, não dois leads nem duas receitas.
 */
export function groupByCampaign(joined: JoinedLead[]): GroupedRow[] {
  const groups = new Map<string, GroupedRow>();
  for (const item of joined) {
    const a = item.attribution;
    const row = {
      campaign: orUnknown(a?.last_campaign ?? a?.campaign_id),
      adGroup: orUnknown(a?.ad_group_id),
      keyword: orUnknown(a?.keyword),
      matchType: orUnknown(a?.match_type),
      device: orUnknown(a?.ads_device),
      landingPage: orUnknown(a?.landing_page),
    };
    // A chave é o JSON das dimensões: um separador de texto qualquer podia
    // aparecer dentro do nome de uma campanha e juntar duas linhas diferentes.
    const key = JSON.stringify([row.campaign, row.adGroup, row.keyword, row.matchType, row.device]);
    const existing = groups.get(key) ?? { key, ...row, leads: 0, valid: 0, qualified: 0, bookings: 0, customers: 0, revenueBilled: 0 };
    existing.leads++;
    if (item.rank >= STATUS_RANK.VALID) existing.valid++;
    if (item.rank >= STATUS_RANK.QUALIFIED) existing.qualified++;
    if (item.rank >= STATUS_RANK.BOOKED) existing.bookings++;
    if (item.rank >= STATUS_RANK.COMPLETED) existing.customers++;
    if (typeof item.lead.final_revenue === 'number' && item.lead.final_revenue > 0) {
      existing.revenueBilled += item.lead.final_revenue;
    }
    groups.set(key, existing);
  }
  return [...groups.values()].sort((a, b) => b.leads - a.leads || b.revenueBilled - a.revenueBilled);
}

export interface LandingPageRow {
  path: string;
  sessions: number;
  ctaClicks: number;
  /** Leads **observados** nesta landing. Nunca os leads operacionais totais. */
  observedLeads: number;
  /** observedLeads / sessions. As duas pontas vêm da mesma fonte consentida. */
  observedConversionRate: number | null;
  customers: number;
  revenueBilled: number;
}

/**
 * Desempenho por página de entrada.
 *
 * As sessões vêm de `quiz_events` e não do GA4: é a única fonte que podemos
 * cruzar com `lead_attribution` para dividir leads por sessões da **mesma**
 * página. O GA4 sabe as sessões e não sabe o que é um lead válido neste
 * negócio; isto sabe as duas coisas, à custa de só contar quem consentiu.
 *
 * Por isso o numerador são os leads **observados**, não todos. As duas pontas
 * da divisão vêm da mesma população consentida, e é isso que torna a taxa
 * interpretável. O painel chama-lhe "conversão observada" e não "conversão".
 *
 * A sessão é atribuída à página de entrada, não à página onde o pedido foi
 * feito: é a landing que o anúncio pagou.
 */
export function groupByLandingPage(joined: JoinedLead[], events: SessionEventRow[]): LandingPageRow[] {
  const rows = new Map<string, LandingPageRow>();
  const ensure = (path: string) => {
    const existing = rows.get(path) ?? { path, sessions: 0, ctaClicks: 0, observedLeads: 0, observedConversionRate: null, customers: 0, revenueBilled: 0 };
    rows.set(path, existing);
    return existing;
  };

  // Uma sessão conta uma vez pela página por onde entrou, mesmo que tenha
  // gerado dez eventos. Contar eventos em vez de sessões inflacionava o
  // denominador e fazia qualquer landing parecer pior do que é.
  const sessionLanding = new Map<string, string>();
  for (const event of events) {
    const landing = event.landing_page ?? event.page_path;
    if (!landing) continue;
    if (!sessionLanding.has(event.session_id)) sessionLanding.set(event.session_id, landing);
  }
  for (const landing of sessionLanding.values()) ensure(landing).sessions++;

  for (const event of events) {
    if (event.action !== 'whatsapp_click' && event.action !== 'call_click') continue;
    const landing = sessionLanding.get(event.session_id) ?? event.landing_page ?? event.page_path;
    if (landing) ensure(landing).ctaClicks++;
  }

  for (const item of observedOnly(joined)) {
    const landing = item.attribution?.landing_page ?? item.attribution?.last_landing_page;
    if (!landing) continue;
    const row = ensure(landing);
    row.observedLeads++;
    if (item.rank >= STATUS_RANK.COMPLETED) row.customers++;
    if (typeof item.lead.final_revenue === 'number' && item.lead.final_revenue > 0) {
      row.revenueBilled += item.lead.final_revenue;
    }
  }

  for (const row of rows.values()) row.observedConversionRate = rate(row.observedLeads, row.sessions);
  return [...rows.values()].sort((a, b) => b.observedLeads - a.observedLeads || b.sessions - a.sessions);
}

export interface ChannelRow {
  channel: 'form' | 'whatsapp' | 'phone';
  label: string;
  /** Cliques no site. Intenção, nunca conversa nem chamada atendida. */
  clicks: number | null;
  /** Contactos reais registados à mão no painel. */
  confirmedContacts: number;
  /** Leads cuja origem declarada é este canal. */
  leads: number;
  bookings: number;
  customers: number;
  /** O que este canal consegue e não consegue medir, para o painel escrever. */
  measurable: string;
}

/**
 * Conversões por canal.
 *
 * Três colunas que **nunca** se somam nem se transformam umas nas outras:
 *
 * - `clicks` é o que o site vê: alguém tocou no botão. O WhatsApp abriu, ou o
 *   marcador de chamadas abriu. Nada garante que a conversa ou a chamada
 *   aconteceram — isso passa-se fora do site, no telemóvel de quem atende.
 * - `confirmedContacts` é o que uma pessoa registou à mão no painel depois de
 *   a conversa ter mesmo existido.
 * - `leads` são pedidos que chegaram ao negócio e estão na tabela `leads`.
 *
 * O formulário não tem cliques porque não há um clique equivalente: o sinal
 * correspondente é `quote_form_start`, que é outra coisa e vive no GA4.
 */
export function groupByChannel(joined: JoinedLead[], events: SessionEventRow[], contacts: ContactLogRow[] = []): ChannelRow[] {
  const base: Record<ChannelRow['channel'], ChannelRow> = {
    form: {
      channel: 'form', label: 'Formulário', clicks: null, confirmedContacts: 0, leads: 0, bookings: 0, customers: 0,
      measurable: 'Medido de ponta a ponta: submissão confirmada pelo servidor.',
    },
    whatsapp: {
      channel: 'whatsapp', label: 'WhatsApp', clicks: 0, confirmedContacts: 0, leads: 0, bookings: 0, customers: 0,
      measurable: 'Só o clique no site. A conversa acontece fora e só conta se for registada à mão.',
    },
    phone: {
      channel: 'phone', label: 'Telefone', clicks: 0, confirmedContacts: 0, leads: 0, bookings: 0, customers: 0,
      measurable: 'Só o clique no site. Não sabemos se a chamada foi atendida.',
    },
  };
  for (const event of events) {
    if (event.action === 'whatsapp_click') base.whatsapp.clicks = (base.whatsapp.clicks ?? 0) + 1;
    if (event.action === 'call_click') base.phone.clicks = (base.phone.clicks ?? 0) + 1;
  }
  for (const contact of contacts) {
    const row = base[contact.channel as ChannelRow['channel']];
    if (row) row.confirmedContacts++;
  }
  for (const item of joined) {
    const channel = (item.attribution?.channel ?? 'form') as ChannelRow['channel'];
    const row = base[channel] ?? base.form;
    row.leads++;
    if (item.rank >= STATUS_RANK.BOOKED) row.bookings++;
    if (item.rank >= STATUS_RANK.COMPLETED) row.customers++;
  }
  return [base.form, base.whatsapp, base.phone];
}

/** Sessões distintas vindas de publicidade, no período carregado. */
export function countPaidSessions(events: SessionEventRow[]): number {
  return new Set(events.filter(event => event.is_paid === true).map(event => event.session_id)).size;
}

/** Sessões distintas observadas, pagas ou não. É o denominador consentido. */
export function countObservedSessions(events: SessionEventRow[]): number {
  return new Set(events.map(event => event.session_id)).size;
}

// ── Conversões offline ───────────────────────────────────────────────────────

export interface ConversionExportRow {
  id: string;
  lead_id: string;
  conversion_action: string;
  click_id: string | null;
  conversion_time: string;
  value: number | null;
  currency: string;
  status: 'queued' | 'exported' | 'submitted' | 'accepted' | 'rejected' | string;
  exported_at: string | null;
  submitted_at: string | null;
  resolved_at: string | null;
}

export interface OfflineCandidate {
  lead_id: string;
  lead_row_id: string;
  click_id: string;
  conversion_time: string;
  value: number | null;
}

/**
 * Quem é elegível para uma importação offline, e ainda não foi exportado.
 *
 * Elegível quer dizer duas coisas ao mesmo tempo: chegou ao estado pedido, e
 * tem identificador de clique. Sem `gclid`/`gbraid`/`wbraid` não há nada a que
 * ligar a conversão, e exportar a linha produzia um ficheiro que o Google Ads
 * aceita e não atribui a ninguém.
 */
export function offlineCandidates(
  joined: JoinedLead[],
  exports: ConversionExportRow[],
  options: { conversionAction: string; minRank: number },
): OfflineCandidate[] {
  const already = new Set(
    exports.filter(row => row.conversion_action === options.conversionAction).map(row => row.lead_id),
  );
  const out: OfflineCandidate[] = [];
  for (const item of joined) {
    const clickId = item.attribution?.gclid ?? item.attribution?.gbraid ?? item.attribution?.wbraid;
    if (!clickId || item.rank < options.minRank) continue;
    if (!item.lead.lead_id || already.has(item.lead.lead_id)) continue;
    out.push({
      lead_id: item.lead.lead_id,
      lead_row_id: item.lead.id,
      click_id: clickId,
      conversion_time: item.lead.completed_at ?? item.lead.created_at,
      value: item.lead.final_revenue,
    });
  }
  return out;
}

/**
 * Ficheiro de importação de conversões offline do Google Ads.
 *
 * Existe porque qualificar, marcar e concluir um serviço acontece dias ou
 * semanas depois, no painel, no browser do dono. Enviar dali um evento para a
 * Google atribuía a conversão à sessão do dono em `/admin/panel` — não à pessoa
 * que clicou no anúncio.
 *
 * **`conversionAction` é o NOME da ação de conversão**, escrito exatamente como
 * está no Google Ads. Não é uma etiqueta de `gtag`: uma importação offline não
 * usa `send_to` nem label nenhuma. Pôr aqui uma label produz um ficheiro que o
 * Google Ads rejeita, ou pior, aceita sem atribuir nada.
 *
 * O que este ficheiro **não** prova: que a conversão chegou. Exportar é um
 * estado; carregar no Google Ads é outro; ser aceite é um terceiro. Ver a
 * tabela `conversion_exports`.
 */
export function buildOfflineConversionsCsv(
  candidates: OfflineCandidate[],
  options: { conversionAction: string; timezone?: string },
): string {
  const lines: string[] = [];
  lines.push(`Parameters:TimeZone=${options.timezone ?? 'Europe/Lisbon'}`);
  lines.push('Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency');
  for (const candidate of candidates) {
    lines.push([
      candidate.click_id,
      options.conversionAction,
      // "yyyy-MM-dd HH:mm:ss", sem o "T" nem o "Z" do ISO — a Google rejeita o
      // ficheiro inteiro quando uma data não bate certo com o formato.
      new Date(candidate.conversion_time).toISOString().slice(0, 19).replace('T', ' '),
      String(candidate.value ?? 0),
      'EUR',
    ].join(','));
  }
  return lines.join('\n');
}

/**
 * Definições publicadas no painel, ao lado de cada número.
 *
 * Existe para responder à pergunta "de onde vem este número?" sem ninguém ter
 * de abrir o código. Se uma fórmula mudar aqui e não mudar na função, o teste
 * `marketingMetrics.test.ts` não o apanha — mas a revisão apanha, porque estão
 * no mesmo ficheiro e a poucas linhas uma da outra.
 */
export const METRIC_DEFINITIONS: Array<{ metric: string; formula: string; source: string; consentDependent: boolean }> = [
  { metric: 'Leads (operacional)', formula: 'count(leads)', source: 'tabela leads', consentDependent: false },
  { metric: 'Leads válidos', formula: 'count(leads) onde estado máximo >= VALID', source: 'leads + lead_status_history', consentDependent: false },
  { metric: 'Qualificados', formula: 'count(leads) onde estado máximo >= QUALIFIED', source: 'leads + lead_status_history', consentDependent: false },
  { metric: 'Marcações', formula: 'count(leads) onde estado máximo >= BOOKED', source: 'leads + lead_status_history', consentDependent: false },
  { metric: 'Serviços concluídos', formula: 'count(leads) onde estado máximo >= COMPLETED', source: 'leads + lead_status_history', consentDependent: false },
  { metric: 'Receita faturada', formula: 'sum(final_revenue)', source: 'leads.final_revenue, escrito à mão', consentDependent: false },
  { metric: 'Pagamentos recebidos', formula: 'sum(amount_received)', source: 'leads.amount_received, escrito à mão', consentDependent: false },
  { metric: 'Taxa lead → cliente', formula: 'concluídos / leads operacionais', source: 'tabela leads', consentDependent: false },
  { metric: 'Sessões observadas', formula: 'count(distinct session_id)', source: 'quiz_events', consentDependent: true },
  { metric: 'Sessões pagas', formula: 'count(distinct session_id) onde is_paid', source: 'quiz_events', consentDependent: true },
  { metric: 'Cobertura da medição', formula: 'leads com atribuição / leads operacionais', source: 'leads + lead_attribution', consentDependent: true },
  { metric: 'Conversão observada (landing)', formula: 'leads observados dessa landing / sessões dessa landing', source: 'quiz_events + lead_attribution', consentDependent: true },
  { metric: 'Cliques WhatsApp / telefone', formula: 'count(quiz_events) por ação', source: 'quiz_events', consentDependent: true },
  { metric: 'Contactos confirmados', formula: 'count(contact_log) por canal', source: 'contact_log, registado à mão', consentDependent: false },
  { metric: 'CPL / CPA / CAC / ROAS', formula: 'indisponível sem gasto importado', source: '—', consentDependent: false },
];

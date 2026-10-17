import { ADS_FROM, type Baseline, type ExtraWeek } from './adsVsOrganic';
import { addDays, lisbonDay } from './crmClosings';
import { lisbonMidnight } from './lisbonTime';
import { campaignLabel, mondayOf, type CampaignTrend, type LiveWeek, type WeekWithEstimate } from './growthLive';

// Dicas do separador Crescimento (dono, 2026-10-17: "que vá constantemente dando
// updates e dicas de melhoria e crescimento"). Regras fixas sobre os números do
// próprio separador: a semana em curso contra a anterior à mesma hora, o custo de
// cada pedido a mais, a taxa de fecho e o ticket das últimas 4 semanas contra
// agosto e setembro, e as alavancas (taxa, ticket, pedidos) em euros por semana.
// São sugestões, não regras do dono: o "o que fazer" aponta para o que já existe
// (seguimentos, Clientes › Hoje, Google Ads). Mudar um limite muda só este ficheiro.

export type InsightTone = 'alerta' | 'oportunidade' | 'bom';

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
  action?: string;
  /** Euros por semana em jogo, para ordenar dentro do mesmo tom. */
  impact: number;
}

/** Variação a partir da qual a semana em curso conta como diferente da anterior. */
export const PACE_REQUESTS_THRESHOLD = 0.15;
export const PACE_CLOSINGS_THRESHOLD = 0.2;
/** Pontos de taxa de fecho a partir dos quais se compara com agosto e setembro. */
export const CLOSE_RATE_POINTS = 0.03;
/** Ticket médio: diferença relativa a partir da qual vale uma dica. */
export const TICKET_THRESHOLD = 0.05;
/** Custo por pedido a mais: quanto mais caro do que nas semanas anteriores dispara o alerta. */
export const COST_PER_REQUEST_ALERT = 1.5;
/** Custo por clique de uma campanha: subida nos últimos 7 dias que dispara o alerta. */
export const CPC_ALERT = 1.3;

const eur = (n: number) => `${Math.round(n).toLocaleString('pt-PT')}€`;
const eur2 = (n: number) => `${n.toFixed(2).replace('.', ',')}€`;
const pct = (n: number) => `${Math.round(n * 100)}%`;
const signedPct = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(Math.round(n * 100))}%`;
const signedEur = (n: number) => `${n >= 0 ? '+' : '−'}${eur(Math.abs(n))}`;
const num = (n: number) => String(Math.round(n));
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

export interface RecentWindow {
  weeks: number;
  /** Médias por semana. */
  requests: number;
  closings: number;
  billed: number;
  share: number;
  /** Fechos ÷ pedidos de orçamento, somados nas semanas da janela. */
  rate: number | null;
  ticket: number | null;
  /** Parte do dono ÷ faturado. */
  shareRatio: number | null;
}

/** As últimas `n` semanas completas com pedidos contados (a taxa de fecho é a mesma conta, sobre 4 semanas). */
export function recentWindow(weeks: WeekWithEstimate[], n = 4): RecentWindow {
  const list = weeks.filter(w => w.daysElapsed >= 7 && w.newPeople !== null).slice(-n);
  const sum = (f: (w: WeekWithEstimate) => number) => list.reduce((s, w) => s + f(w), 0);
  const requests = sum(w => w.newPeople ?? 0);
  const closings = sum(w => w.closings);
  const billed = sum(w => w.billed);
  const share = sum(w => w.share);
  const k = list.length || 1;
  return {
    weeks: list.length,
    requests: requests / k,
    closings: closings / k,
    billed: billed / k,
    share: share / k,
    rate: requests ? closings / requests : null,
    ticket: closings ? billed / closings : null,
    shareRatio: billed ? share / billed : null,
  };
}

/** Euros de anúncios por cada pedido acima da média orgânica, nas semanas completas com anúncios. */
export function costPerExtraRequest(rows: ExtraWeek[]): number | null {
  const done = rows.filter(r => !r.partial && r.extraNewPeople !== null && r.extraNewPeople > 0);
  const extra = done.reduce((s, r) => s + r.extraNewPeople!, 0);
  const spend = done.reduce((s, r) => s + r.spend, 0);
  return extra > 0 && spend > 0 ? spend / extra : null;
}

export interface Lever { id: 'taxa' | 'ticket' | 'pedidos'; label: string; gain: number; cost: number; net: number }

/** Quanto vale por semana, para o dono, cada alavanca com uma mudança realista. */
export function growthLevers(win: RecentWindow, cpr: number | null): Lever[] {
  if (win.rate === null || win.ticket === null || win.shareRatio === null) return [];
  const { requests: R, rate: C, ticket: T, shareRatio: S } = win;
  const levers: Lever[] = [
    { id: 'taxa', label: '+5 pontos de taxa de fecho', gain: R * 0.05 * T * S, cost: 0, net: 0 },
    { id: 'ticket', label: '+10€ de ticket médio', gain: R * C * 10 * S, cost: 0, net: 0 },
    { id: 'pedidos', label: '+10 pedidos por semana', gain: 10 * C * T * S, cost: cpr === null ? 0 : 10 * cpr, net: 0 },
  ];
  return levers.map(l => ({ ...l, net: l.gain - l.cost })).sort((a, b) => b.net - a.net);
}

export interface GrowthInsightInput {
  weeks: WeekWithEstimate[];
  base: Baseline;
  extra: { rows: ExtraWeek[]; total: Omit<ExtraWeek, 'week' | 'partial'> };
  live: LiveWeek | null;
  campaigns: CampaignTrend[];
  now: Date;
}

const TONE_ORDER: Record<InsightTone, number> = { alerta: 0, oportunidade: 1, bom: 2 };

export function growthInsights({ weeks, base, extra, live, campaigns, now }: GrowthInsightInput): Insight[] {
  const out: Insight[] = [];
  const win = recentWindow(weeks);
  const baseRate = base.newPeople ? base.closings / base.newPeople : null;
  const baseTicket = base.closings ? base.billed / base.closings : null;
  const sharePerClosing = win.closings ? win.share / win.closings : 0;
  const cpr = costPerExtraRequest(extra.rows);
  const levers = growthLevers(win, cpr);

  // 1. A semana em curso contra a anterior à mesma hora (só depois de um dia inteiro).
  if (live && live.fraction >= 1 / 7) {
    const r = live.requests;
    if (r.change !== null && r.then >= 5) {
      const lost = (r.then - r.now) * (win.rate ?? 0) * sharePerClosing;
      if (r.change <= -PACE_REQUESTS_THRESHOLD) {
        out.push({
          id: 'pace-requests', tone: 'alerta',
          title: 'Menos pedidos do que na semana passada à mesma hora',
          detail: `${num(r.now)} pedidos de orçamento até ${live.moment}, contra ${num(r.then)} na semana passada (${signedPct(r.change)}).`,
          action: 'Confirma no Google Ads que as campanhas estão a gastar e sem anúncios reprovados, e que ninguém fica sem resposta no WhatsApp.',
          impact: Math.max(0, lost),
        });
      } else if (r.change >= PACE_REQUESTS_THRESHOLD) {
        out.push({
          id: 'pace-requests', tone: 'bom',
          title: 'Mais pedidos do que na semana passada à mesma hora',
          detail: `${num(r.now)} pedidos de orçamento até ${live.moment}, contra ${num(r.then)} na semana passada (${signedPct(r.change)}).`,
          action: 'Garante horas livres nas equipas para os conseguir marcar já.',
          impact: Math.max(0, -lost),
        });
      }
    }
    const c = live.closings;
    if (c.change !== null && c.then >= 4) {
      if (c.change <= -PACE_CLOSINGS_THRESHOLD) {
        out.push({
          id: 'pace-closings', tone: 'alerta',
          title: 'Menos fechos do que na semana passada à mesma hora',
          detail: `${c.now} fechos (${eur(live.billed.now)} faturados) contra ${c.then} (${eur(live.billed.then)}) na semana passada (${signedPct(c.change)}).`,
          action: 'Abre Clientes › Hoje e segue quem recebeu preço esta semana e ainda não marcou.',
          impact: Math.max(0, live.share.then - live.share.now),
        });
      } else if (c.change >= PACE_CLOSINGS_THRESHOLD) {
        out.push({
          id: 'pace-closings', tone: 'bom',
          title: 'Mais fechos do que na semana passada à mesma hora',
          detail: `${c.now} fechos (${eur(live.billed.now)} faturados) contra ${c.then} (${eur(live.billed.then)}) na semana passada (${signedPct(c.change)}).`,
          impact: Math.max(0, live.share.now - live.share.then),
        });
      }
    }

    // 2. Os anúncios desta semana: pedidos acima da média orgânica pelo gasto (a partir de dois dias).
    if (live.fraction >= 2 / 7 && live.spend.now > 50 && base.newPeople !== null) {
      const expected = base.newPeople * live.fraction;
      const extraNow = live.requests.now - expected;
      const row = extra.rows.find(x => x.partial);
      const profit = row ? ` Lucro dos anúncios até agora: ${signedEur(row.profit)}.` : '';
      if (extraNow <= 0) {
        out.push({
          id: 'ads-efficiency', tone: 'alerta',
          title: 'Os anúncios ainda não trouxeram pedidos a mais esta semana',
          detail: `Gastaste ${eur(live.spend.now)} e tens ${num(live.requests.now)} pedidos, o que agosto e setembro davam sem anúncios até esta hora (${num(expected)}).${profit}`,
          action: 'Vê no Google Ads se as campanhas estão a aparecer (impressões, posição) e se os anúncios levam para a página certa.',
          impact: live.spend.now,
        });
      } else if (cpr !== null && live.spend.now / extraNow > cpr * COST_PER_REQUEST_ALERT) {
        const now = live.spend.now / extraNow;
        out.push({
          id: 'ads-efficiency', tone: 'alerta',
          title: 'Cada pedido a mais está a sair mais caro',
          detail: `Esta semana cerca de ${eur(now)} de anúncios por cada pedido acima da média orgânica; nas semanas anteriores cerca de ${eur(cpr)}.${profit}`,
          action: 'Vê que campanha ficou com o clique mais caro (lista em baixo) e passa orçamento para as que trazem pedidos mais baratos.',
          impact: Math.max(0, live.spend.now - extraNow * cpr),
        });
      }
    }
  }

  // 3. Os anúncios desde o início.
  const t = extra.total;
  if (t.spend > 0) {
    const ratio = t.extraShare / t.spend;
    if (t.profit >= 0) {
      out.push({
        id: 'ads-roi', tone: 'bom',
        title: 'Os anúncios estão a pagar-se',
        detail: `Desde ${dm(ADS_FROM)} gastaste ${eur(t.spend)} e ficaste com ${eur(t.extraShare)} a mais do que em agosto e setembro: ${ratio.toFixed(2).replace('.', ',')}€ por cada 1€.`,
        impact: t.profit / Math.max(1, extra.rows.length),
      });
    } else {
      out.push({
        id: 'ads-roi', tone: 'alerta',
        title: 'Os anúncios estão a dar prejuízo',
        detail: `Desde ${dm(ADS_FROM)} gastaste ${eur(t.spend)} e ficaste só com ${eur(Math.max(0, t.extraShare))} a mais do que em agosto e setembro (${signedEur(t.profit)}).`,
        action: 'Baixa o orçamento das campanhas com o clique mais caro até perceberes o que mudou.',
        impact: -t.profit / Math.max(1, extra.rows.length),
      });
    }
  }

  // 4. Taxa de fecho e ticket das últimas 4 semanas contra agosto e setembro.
  if (win.rate !== null && baseRate !== null && win.ticket !== null && win.shareRatio !== null) {
    const diff = win.rate - baseRate;
    const valueOfGap = Math.abs(diff) * win.requests * win.ticket * win.shareRatio;
    if (diff <= -CLOSE_RATE_POINTS) {
      out.push({
        id: 'close-rate', tone: 'oportunidade',
        title: 'A taxa de fecho está abaixo de agosto e setembro',
        detail: `${pct(win.rate)} nas últimas ${win.weeks} semanas contra ${pct(baseRate)}. Voltar aos ${pct(baseRate)} vale cerca de ${eur(valueOfGap)} por semana para ti.`,
        action: 'Seguimento às 4 h e às 24 h a quem recebeu preço, e o preço sempre com o vídeo e duas horas livres.',
        impact: valueOfGap,
      });
    } else if (diff >= CLOSE_RATE_POINTS) {
      out.push({
        id: 'close-rate', tone: 'bom',
        title: 'Estás a fechar mais do que em agosto e setembro',
        detail: `${pct(win.rate)} de taxa de fecho nas últimas ${win.weeks} semanas contra ${pct(baseRate)}.`,
        impact: valueOfGap,
      });
    }
  }
  if (win.ticket !== null && baseTicket !== null && win.rate !== null && win.shareRatio !== null) {
    const rel = win.ticket / baseTicket - 1;
    const plus10 = win.requests * win.rate * 10 * win.shareRatio;
    if (rel <= -TICKET_THRESHOLD) {
      out.push({
        id: 'ticket', tone: 'oportunidade',
        title: 'O ticket médio desceu',
        detail: `${eur(win.ticket)} por serviço nas últimas ${win.weeks} semanas contra ${eur(baseTicket)}. Cada 10€ a mais por serviço vale cerca de ${eur(plus10)} por semana para ti.`,
        action: 'Mostra sempre a impermeabilização Premium primeiro e propõe um segundo artigo na mesma visita.',
        impact: plus10,
      });
    } else if (rel >= TICKET_THRESHOLD) {
      out.push({
        id: 'ticket', tone: 'bom',
        title: 'O ticket médio subiu',
        detail: `${eur(win.ticket)} por serviço nas últimas ${win.weeks} semanas contra ${eur(baseTicket)} em agosto e setembro (${signedPct(rel)}).`,
        impact: plus10,
      });
    }
  }

  // 5. A maior alavanca agora.
  const best = levers[0];
  if (best && best.net > 0 && win.rate !== null && win.ticket !== null) {
    const parts = levers.map(l => `${l.label}: ${signedEur(l.net)}`).join('; ');
    out.push({
      id: 'lever', tone: 'oportunidade',
      title: `A tua maior alavanca agora: ${best.label}`,
      detail: `Com as últimas ${win.weeks} semanas (${num(win.requests)} pedidos, ${pct(win.rate)} de fecho, ${eur(win.ticket)} por serviço), por semana para ti: ${parts}${cpr !== null ? ` (nos pedidos já está descontado o custo dos anúncios, cerca de ${eur(cpr)} por pedido a mais)` : ''}.`,
      action: 'Experimenta outros valores no simulador.',
      impact: best.net,
    });
  }

  // 6. Campanhas com o clique a ficar mais caro (no máximo duas).
  const cpcAlerts = campaigns
    .filter(c => c.clicks7 >= 15 && c.clicksPrev7 >= 15)
    .map(c => ({ c, now: c.cost7 / c.clicks7, before: c.costPrev7 / c.clicksPrev7 }))
    .filter(x => x.now >= x.before * CPC_ALERT)
    .sort((a, b) => (b.now - b.before) * b.c.clicks7 - (a.now - a.before) * a.c.clicks7)
    .slice(0, 2);
  for (const { c, now: cpcNow, before } of cpcAlerts) {
    out.push({
      id: `cpc-${c.name}`, tone: 'alerta',
      title: `${campaignLabel(c.name)}: o clique ficou ${pct(cpcNow / before - 1)} mais caro`,
      detail: `${eur2(before)} → ${eur2(cpcNow)} por clique nos últimos 7 dias, com ${eur(c.cost7)} gastos e ${c.clicks7} cliques.`,
      action: 'Vê se a campanha perdeu posição ou ganhou concorrência; se o clique não descer, passa orçamento para a campanha com o clique mais barato.',
      impact: (cpcNow - before) * c.clicks7,
    });
  }

  // 7. Dados por atualizar.
  const thisWeek = mondayOf(lisbonDay(now));
  const lastWeek = weeks.find(w => w.week === addDays(thisWeek, -7));
  if (lastWeek?.requestsEstimated && now.getTime() >= lisbonMidnight(thisWeek) + 10 * 3_600_000) {
    out.push({
      id: 'whatsapp-count', tone: 'alerta',
      title: 'Falta a contagem do WhatsApp da semana passada',
      detail: `Os pedidos da semana de ${dm(lastWeek.week)} são uma estimativa do servidor do bot. A contagem faz-se às segundas às 8h30, com a app do Claude aberta e o WhatsApp Web ligado no Chrome.`,
      impact: 0,
    });
  }
  if (live?.serverUpdatedAt) {
    const hours = (now.getTime() - Date.parse(live.serverUpdatedAt)) / 3_600_000;
    if (hours >= 3) {
      out.push({
        id: 'server-stale', tone: 'alerta',
        title: `O servidor do bot não manda conversas há ${Math.floor(hours)} h`,
        detail: 'Os pedidos desta semana podem estar a contar a menos. Ele envia de hora a hora, ao minuto 17.',
        impact: 0,
      });
    }
  }

  return out.sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone] || b.impact - a.impact);
}

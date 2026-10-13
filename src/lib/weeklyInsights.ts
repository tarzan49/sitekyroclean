// Leitura da semana para a revisão de segunda-feira (dono, 2026-10-13: "a cada
// segunda analiso as métricas e tu dás-me um feedback para melhorar em x
// partes, e trabalhamos naquilo que já está muito bom e naquilo que pode
// melhorar"). Compara a semana escolhida com a média das semanas antes dela e
// olha para a taxa de fecho por serviço dos 90 dias até ao fim dessa semana.
// Regras simples e escritas aqui, para a leitura ser a mesma em todo o lado.

import { RANKING_MIN_CONTACTS, type ServiceRankRow, type WeekRow } from "./weeklyReview";
import { QUIZ_CLOSE_RATE_GOAL, SERVICE_CLOSE_RATE_GOAL, type CloseRateCount } from "./crmServiceCloseRate";

export const CLOSE_RATE_GOAL = SERVICE_CLOSE_RATE_GOAL;
/** Semanas antes da escolhida usadas como termo de comparação. */
export const BASELINE_WEEKS = 8;
/** Variação a partir da qual um número conta como melhor ou pior que o normal. */
const THRESHOLD = 0.1;

export interface Insight {
  title: string;
  detail: string;
  /** O que fazer esta semana. Só nos pontos a melhorar. */
  action?: string;
}

export interface WeekInsights {
  good: Insight[];
  improve: Insight[];
  /** Semanas com fechos usadas na média; com menos de 3 a comparação é fraca. */
  baselineWeeks: number;
}

const euro = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;
const pct = (r: number) => `${Math.round(r * 100)}%`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Fechos que faltavam para a meta, com os mesmos contactos. */
export const missingForGoal = (r: ServiceRankRow) => Math.max(0, Math.ceil(CLOSE_RATE_GOAL * r.contacts - r.closed));

/** Dinheiro que fica por fechar até à meta: fechos em falta × ticket do serviço. */
export const atStake = (r: ServiceRankRow) => (r.ticket === null ? 0 : missingForGoal(r) * r.ticket);

// Pelos rótulos da aba Serviços ("Limpeza de sofá"), que é o que a aba Fechos
// mostra desde 2026-10-13, e pelas etiquetas antigas do WhatsApp.
const SOFA_ACTION = "Mandar logo o antes e depois de um sofá parecido e propor duas horas concretas no fim do orçamento.";
const WATERPROOF_ACTION = "Mostrar o vídeo da água a escorrer e apresentar o Premium primeiro, com o Essencial como alternativa.";
const SERVICE_ACTIONS: Record<string, string> = {
  "Limpeza de sofá": SOFA_ACTION,
  "Limpeza de colchão": "Falar dos ácaros e da noite de sono, não só da mancha, e propor juntar o colchão a outro artigo na mesma visita.",
  "Limpeza de tapete": "Pedir a fotografia e o material na primeira resposta, para o preço sair logo, sem ida e volta.",
  "Limpeza de cadeiras": "Mostrar o vídeo das cadeiras e propor duas horas concretas no fim do orçamento.",
  "Impermeabilização de sofá": WATERPROOF_ACTION,
  "Impermeabilização de cadeiras": WATERPROOF_ACTION,
  "Sofá": "Mandar logo o antes e depois de um sofá parecido e propor duas horas concretas no fim do orçamento.",
  "Colchão": "Falar dos ácaros e da noite de sono, não só da mancha, e propor juntar o colchão a outro artigo na mesma visita.",
  "Tapete": "Pedir a fotografia e o material na primeira resposta, para o preço sair logo, sem ida e volta.",
  "Cadeira": "Mostrar o vídeo das cadeiras e propor duas horas concretas no fim do orçamento.",
  "Impermeabilização": "Mostrar o vídeo da água a escorrer e apresentar o Premium primeiro, com o Essencial como alternativa.",
  "Recolha": "Confirmar logo o dia da recolha e o da entrega: a dúvida é quando o tapete volta.",
};

/** Abaixo disto a taxa do questionário em 90 dias ainda é ruído. */
const QUIZ_MIN_QUOTES = 10;

export function computeWeekInsights(weeks: WeekRow[], ranking90: ServiceRankRow[], quiz90?: CloseRateCount): WeekInsights {
  const good: Insight[] = [];
  const improve: Insight[] = [];
  const week = weeks[weeks.length - 1];
  const before = weeks.slice(0, -1).slice(-BASELINE_WEEKS).filter(w => w.closes > 0);
  if (!week) return { good, improve, baselineWeeks: 0 };

  const compare = (cur: number | null, base: number | null, lowerIsBetter = false) => {
    if (cur === null || base === null || base === 0) return 0;
    const change = (cur - base) / base;
    if (Math.abs(change) < THRESHOLD) return 0;
    return (lowerIsBetter ? -change : change) > 0 ? 1 : -1;
  };

  if (before.length) {
    const baseCloses = avg(before.map(w => w.closes))!;
    const c = compare(week.closes, baseCloses);
    if (c > 0) good.push({ title: "Mais fechos que o normal", detail: `${week.closes} fechos, contra uma média de ${Math.round(baseCloses)} nas semanas anteriores.` });
    if (c < 0) improve.push({
      title: "Menos fechos que o normal",
      detail: `${week.closes} fechos, contra uma média de ${Math.round(baseCloses)} nas semanas anteriores.`,
      action: "Abrir Clientes → Hoje e fazer todos os seguimentos de orçamento por responder antes de qualquer outra coisa.",
    });

    const baseTicket = avg(before.map(w => w.ticket).filter((t): t is number => t !== null));
    const t = compare(week.ticket, baseTicket);
    if (t > 0) good.push({ title: "Ticket médio acima do normal", detail: `${euro(week.ticket!)} por serviço, contra ${euro(baseTicket!)} de média.` });
    if (t < 0) improve.push({
      title: "Ticket médio abaixo do normal",
      detail: `${euro(week.ticket!)} por serviço, contra ${euro(baseTicket!)} de média.`,
      action: "Em cada orçamento, propor um segundo artigo na mesma visita e a impermeabilização Premium primeiro.",
    });

    const withCost = before.map(w => w.costPerGoogleClient).filter((x): x is number => x !== null);
    const baseCost = avg(withCost);
    if (week.spend > 0 && week.googleCloses === 0) improve.push({
      title: "Google Ads sem clientes",
      detail: `${euro(week.spend)} gastos e nenhum cliente marcado como vindo do anúncio.`,
      action: "Confirmar que os serviços do anúncio têm \"(anúncio)\" no calendário; se tiverem, ver no Google Ads as pesquisas que gastaram.",
    });
    else {
      const g = compare(week.costPerGoogleClient, baseCost, true);
      if (g > 0) good.push({ title: "Cliente do Google mais barato", detail: `${euro(week.costPerGoogleClient!)} por cliente, contra ${euro(baseCost!)} de média.` });
      if (g < 0) improve.push({
        title: "Cliente do Google mais caro",
        detail: `${euro(week.costPerGoogleClient!)} por cliente, contra ${euro(baseCost!)} de média.`,
        action: "Ver no Google Ads as pesquisas da semana e pôr como negativas as que gastaram sem dar contactos.",
      });
    }
  }

  if (quiz90 && quiz90.quotes >= QUIZ_MIN_QUOTES) {
    const rate = quiz90.closed / quiz90.quotes;
    const detail = `${quiz90.closed} de ${quiz90.quotes} pedidos do site fecharam em 90 dias (meta ${pct(QUIZ_CLOSE_RATE_GOAL)}).`;
    if (rate >= QUIZ_CLOSE_RATE_GOAL) good.push({ title: `Questionário acima da meta: ${pct(rate)}`, detail });
    else improve.push({
      title: `Questionário: ${pct(rate)} de fecho`,
      detail: `${detail} Faltavam mais ${Math.ceil(QUIZ_CLOSE_RATE_GOAL * quiz90.quotes - quiz90.closed)} fechos.`,
      action: "Responder a cada pedido do site nos primeiros minutos, com o preço e duas horas concretas, e fazer o seguimento das 4 h e das 24 h a quem não respondeu.",
    });
  }

  const ranked = ranking90.filter(r => r.contacts >= RANKING_MIN_CONTACTS);
  const atGoal = ranked.filter(r => r.rate >= CLOSE_RATE_GOAL).sort((a, b) => b.rate - a.rate);
  for (const r of atGoal.slice(0, 2)) {
    good.push({ title: `${r.service} acima da meta`, detail: `Fecha ${pct(r.rate)} das conversas (${r.closed} de ${r.contacts}). Manter a mesma forma de responder.` });
  }
  const below = ranked.filter(r => r.rate < CLOSE_RATE_GOAL && atStake(r) > 0).sort((a, b) => atStake(b) - atStake(a));
  for (const r of below.slice(0, 2)) {
    improve.push({
      title: `${r.service}: ${pct(r.rate)} de fecho`,
      detail: `Chegar a ${pct(CLOSE_RATE_GOAL)} eram mais ${missingForGoal(r)} fechos, cerca de ${euro(atStake(r))} em 90 dias.`,
      action: SERVICE_ACTIONS[r.service],
    });
  }

  return { good: good.slice(0, 4), improve: improve.slice(0, 4), baselineWeeks: before.length };
}

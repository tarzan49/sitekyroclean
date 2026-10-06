// Motor de seguimento de clientes (dono, 2026-10-06: "lógicas de seguimento a
// clientes, notificações passado x tempo", "com boas promoções, pedidos de
// recomendação, quando devo mandar mensagem ou não ao cliente", e "isto vai
// estar associado ao bot: ele vai saber exatamente quando contactar alguém e a
// melhor coisa a dizer").
//
// Para cada contacto diz o que fazer (e a partir de quando), o que não fazer (e
// porquê), e deixa a mensagem escrita nas regras do dono: plural ("temos"), sem
// emojis, a cumprimentar pelo nome, "condição especial" e nunca "desconto". As
// horas reais do calendário ficam como [dia] e [hora].
//
// Os tempos (dois seguimentos e parar, nada à noite, uma mensagem comercial de
// cada vez) vêm da análise das conversas reais e da secção 8 do ficheiro do
// bot, que estão fora do repositório. Quem usa isto: o painel (vista Hoje), o
// email diário (`follow-up-digest`) e o bot (`bot-api`, ações follow-ups,
// client-plan e log-touch). Os três leem as mesmas regras.
//
// Nada é enviado daqui. Cada envio fica em `client_touches`, e é esse registo
// que impede a mesma mensagem de voltar a ser sugerida e que mede o que
// resulta: as mensagens com versões A e B passam a sugerir primeiro a que fecha
// mais, quando as duas já têm envios suficientes.
//
// Sem imports com alias `@/`: as Edge Functions usam este ficheiro empacotado
// (npm run build:follow-up-engine).

import { firstName, phoneKey, servicesByPhone, type ClientRow, type ClientService, type ClientStatus } from './clientRecords';
import { itemsOf, typeOf } from './crmServiceMix';
import { addDays, lisbonDay, weekdayOf, WEEKDAY_LONG } from './crmClosings';
import { PACK_PERK_MIN_ORDER, perkMattressPrice, perkSofaPrice } from '../constants/packPerks';
import { formatEuro, mattressCleaningPrice, sofaCleaningPrice } from '../data/enginePrices';
import { GOOGLE_REVIEW_LINK_LISBOA, GOOGLE_REVIEW_LINK_PORTO } from '../constants/google';

// ── Regras ─────────────────────────────────────────────────────────────────

export const FOLLOW_UP_RULES = {
  /** Nunca escrever primeiro entre as 21h e as 9h30 (bot, 2.12 e 8). */
  quietFromMinutes: 21 * 60,
  quietUntilMinutes: 9 * 60 + 30,
  /** Seguimentos de um orçamento depois da última mensagem do cliente (bot, 8). */
  maxFollowUps: 2,
  /** O 1.º seguimento sai umas 4 horas depois da nossa última mensagem, no mesmo dia. */
  firstFollowUpHours: 4,
  /** O 2.º (e último), cerca de 24 horas depois do 1.º. */
  secondFollowUpHours: 20,
  /** Passados estes dias sem resposta, o orçamento parou: só data combinada ou campanha. */
  followUpWindowDays: 3,
  /** Responder a quem escreveu por último: um lead até 7 dias depois; um cliente até 3 (um "obrigado" não pede resposta). */
  answerLeadDays: 7,
  answerClientDays: 3,
  /** Pedido de avaliação: até 14 dias depois do serviço, e um só lembrete, 1 a 4 dias depois do pedido (bot, 7.4). */
  reviewWindowDays: 14,
  reviewReminderAfterDays: 1,
  reviewReminderUntilDays: 4,
  /** Tapete com recolha: a avaliação só depois da entrega (até 4 dias úteis). */
  rugPickupDelayDays: 6,
  /** Recomendação: a quem avaliou ou já repetiu, entre 7 e 21 dias depois do serviço (com a experiência fresca), uma vez por ano. */
  referralFromDays: 7,
  referralUntilDays: 21,
  referralEveryDays: 365,
  /** Mensagens comerciais (mesma visita, recomendação, manutenção, campanha): uma de cada vez, com este intervalo. */
  marketingEveryDays: 45,
  /** Antes de uma mensagem comercial, a nossa última mensagem sem resposta tem de ter pelo menos estes dias. */
  quietDaysAfterOurMessage: 7,
  /** Não interessado: nada comercial durante 90 dias depois do último contacto. */
  afterNoDays: 90,
  /** Orçamento parado: campanha só 30 dias depois do último contacto. */
  stalledCampaignDays: 30,
  /** Cliente: campanha só 60 dias depois do último serviço. */
  clientCampaignDays: 60,
  /** "Aproveitar a mesma visita": entre 5 e 2 dias antes do serviço. */
  sameVisitFromDays: 5,
  sameVisitUntilDays: 2,
  /** Manutenção: lembrar a partir da data e até 60 dias depois (a seguir fica para as campanhas). */
  maintenanceValidDays: 60,
  /** O que entra na lista "Próximos dias". */
  soonDays: 7,
  /** Envios de cada versão (A e B) antes de o motor escolher a que resulta mais. */
  minVariantSample: 8,
} as const;

const R = FOLLOW_UP_RULES;

/**
 * A condição especial para quem já é cliente e para as recomendações.
 * PROPOSTA de 06/10/2026, por confirmar pelo dono: o guião de vendas dele diz
 * que a deslocação gratuita pode ser a condição especial, e é a única que não
 * obriga a inventar um número. Mudar aqui muda todas as mensagens. Enquanto
 * OFFERS_CONFIRMED for false, o bot não envia sozinho nenhuma mensagem que a
 * prometa: pede o OK ao dono.
 */
export const CLIENT_CONDITION = 'a deslocação fica por nossa conta';
export const REFERRAL_CONDITION =
  'Por cada pessoa que vier da sua parte, a deslocação fica por nossa conta, para ela e para si na próxima limpeza.';
export const OFFERS_CONFIRMED = false;

/** Preço de pack real (packPerks.ts): o que se pode prometer a quem junta um segundo artigo na mesma visita. */
const MATTRESS_TABLE = mattressCleaningPrice('casal');
const PACK_LINE = `na mesma visita, cada artigo que juntar fica com preço de pack (um colchão de casal, por exemplo, por ${formatEuro(perkMattressPrice(MATTRESS_TABLE))} em vez de ${formatEuro(MATTRESS_TABLE)})`;

// ── Tipos ──────────────────────────────────────────────────────────────────

export const CONTACT_PREFERENCES = ['normal', 'sem_promocoes', 'nao_contactar'] as const;
export type ContactPreference = (typeof CONTACT_PREFERENCES)[number];

export const CONTACT_PREFERENCE_LABEL: Record<ContactPreference, string> = {
  normal: 'Normal',
  sem_promocoes: 'Sem promoções (só avisos do serviço)',
  nao_contactar: 'Não contactar (só responder se escrever)',
};

export const ACTION_KINDS = [
  'responder', 'seguimento', 'lembrete', 'vespera', 'mesma_visita',
  'avaliacao', 'avaliacao_lembrete', 'recomendacao', 'manutencao', 'campanha',
] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

export const ACTION_LABEL: Record<ActionKind, string> = {
  responder: 'Responder',
  seguimento: 'Seguimento do orçamento',
  lembrete: 'Lembrete combinado',
  vespera: 'Lembrar o serviço de amanhã',
  mesma_visita: 'Aproveitar a mesma visita',
  avaliacao: 'Pedir avaliação',
  avaliacao_lembrete: 'Lembrar a avaliação',
  recomendacao: 'Pedir recomendação',
  manutencao: 'Voltar a limpar',
  campanha: 'Campanha',
};

/** Comerciais: no máximo uma de cada vez, com intervalo, e nunca a quem não quer promoções. */
export const MARKETING_KINDS: readonly ActionKind[] = ['mesma_visita', 'recomendacao', 'manutencao', 'campanha'];

/** Uma mensagem enviada (ou que se decidiu não enviar), registada pelo painel ou pelo bot. */
export interface ClientTouch {
  id: string;
  client_id: string;
  kind: ActionKind | 'outro';
  /** Campanha e ano ("natal-2026"). */
  campaign: string | null;
  /** Versão da mensagem usada ("avaliacao-b"), para saber qual resulta mais. */
  template?: string | null;
  /** Decidiu-se não enviar: conta como tratado, não como enviado. */
  skipped: boolean;
  note: string | null;
  message?: string | null;
  /** painel ou bot. */
  channel?: string | null;
  created_at: string;
}

export interface DraftMessage {
  /** Identificador estável da versão ("avaliacao-a"), gravado em cada envio. */
  id: string;
  label: string;
  text: string;
}

/** auto: o bot pode enviar sozinho, dentro das horas. owner_ok: só com o OK do dono. */
export type SendMode = 'auto' | 'owner_ok';

export interface FollowUpAction {
  kind: ActionKind;
  /** Campanha e ano, nas ações de campanha. */
  campaignId?: string;
  /** Dia (AAAA-MM-DD, Lisboa) a partir do qual faz sentido. */
  due: string;
  /** Hora a partir da qual enviar nesse dia ("15h20", "9h30"). */
  notBefore?: string;
  /** Último dia em que ainda faz sentido. */
  until?: string;
  /** 0 é o mais urgente. */
  priority: number;
  title: string;
  why: string;
  /** Rascunhos; o primeiro é o sugerido. Vazio quando não há texto pronto (responder). */
  messages: DraftMessage[];
  /** Uma coisa a confirmar antes de enviar. */
  check?: string;
  send: SendMode;
}

export interface BlockedAction {
  kind: ActionKind;
  title: string;
  reason: string;
  campaignId?: string;
}

export const STAGES = [
  'conversa', 'orcamento_aberto', 'orcamento_parado', 'marcado', 'cliente_recente',
  'manutencao', 'cliente', 'perdido', 'em_pausa', 'nao_contactar',
] as const;
export type Stage = (typeof STAGES)[number];

/** Como se posicionar perante cada grupo (vista Estratégia e bot). */
export const STAGE_INFO: Record<Stage, { label: string; stance: string }> = {
  conversa: {
    label: 'Em conversa',
    stance: 'Escreveram por último. Responder primeiro e depressa: quem pede vários orçamentos fica com quem responde primeiro.',
  },
  orcamento_aberto: {
    label: 'Orçamento em aberto',
    stance: 'Até 3 dias depois da última mensagem do cliente. Dois seguimentos no máximo, com horas reais, e parar.',
  },
  orcamento_parado: {
    label: 'Orçamento parado',
    stance: 'Mais de 3 dias sem resposta. Não insistir: só na data que a pessoa deu, ou numa campanha com uma razão concreta.',
  },
  marcado: {
    label: 'Serviço marcado',
    stance: 'Lembrar na véspera e, 2 a 5 dias antes, oferecer um segundo artigo com preço de pack. Nada comercial além disso.',
  },
  cliente_recente: {
    label: 'Cliente recente',
    stance: 'Serviço nos últimos 60 dias. Pedir a avaliação (uma vez e um lembrete) e, a quem avaliou, uma recomendação.',
  },
  manutencao: {
    label: 'Manutenção a fazer',
    stance: 'Já passou o intervalo que o site recomenda. Uma mensagem pessoal, com a condição de cliente: é a venda mais barata.',
  },
  cliente: {
    label: 'Cliente',
    stance: 'Primeiros a saber das campanhas, sempre com a condição de cliente. Nunca mais do que uma mensagem comercial por mês e meio.',
  },
  perdido: {
    label: 'Não interessado',
    stance: 'Nada durante 90 dias. Depois, só campanhas com uma razão real (Black Friday, Natal). Nunca condições maiores para reconquistar.',
  },
  em_pausa: {
    label: 'Em pausa',
    stance: 'Queixa ou problema em aberto. Resolver primeiro; nada de avaliações, recomendações nem campanhas até lá.',
  },
  nao_contactar: {
    label: 'Não contactar',
    stance: 'Pediram para não receber mensagens. Só se responde quando escreverem.',
  },
};

export interface ClientPlan {
  stage: Stage;
  /** Dois ou mais serviços. */
  loyal: boolean;
  /** Deixou avaliação no Google. */
  promoter: boolean;
  /** A fazer hoje (ou atrasado), do mais urgente para o menos. */
  today: FollowUpAction[];
  /** Nos próximos dias. */
  soon: FollowUpAction[];
  /** O que faria sentido agora mas não se deve enviar, com o porquê. */
  blocked: BlockedAction[];
  /** Último serviço: do CRM, ou aproximado pelo último contacto quando o CRM não o tem. */
  lastServiceDate: string | null;
  approxServiceDate: boolean;
  /** Próximo serviço marcado. */
  nextServiceDate: string | null;
  /** Serviços feitos (CRM). */
  servicesDone: number;
}

export interface PlanInput {
  client: ClientRow;
  /** Todas as linhas do CRM com o telefone deste contacto, de qualquer data. */
  services: ClientService[];
  touches: ClientTouch[];
}

/** Resultado de cada versão de mensagem (id → envios e sucessos). */
export type VariantStats = Record<string, { sent: number; won: number }>;

export interface PlanContext {
  now: Date;
  /** Por omissão, o dia de `now` em Lisboa. Uma campanha futura pré-visualiza-se com outro dia. */
  today?: string;
  campaigns?: Campaign[];
  variantStats?: VariantStats;
}

// ── Datas e horas ──────────────────────────────────────────────────────────

const toNoon = (day: string) => Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12);

/** Dias de calendário de `from` até `to` (AAAA-MM-DD). */
export const dayDiff = (from: string, to: string) => Math.round((toNoon(to) - toNoon(from)) / 86_400_000);

const LISBON_CLOCK = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Minutos desde a meia-noite, hora de Lisboa. */
export function lisbonMinutes(d: Date): number {
  const [h, m] = LISBON_CLOCK.format(d).split(':').map(Number);
  return (h % 24) * 60 + m;
}

const clock = (minutes: number) => `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

/** Entre as 21h e as 9h30 não se escreve primeiro a ninguém. */
export function isQuietTime(now: Date) {
  const minutes = lisbonMinutes(now);
  return minutes >= R.quietFromMinutes || minutes < R.quietUntilMinutes;
}

/** "Bom dia" das 6h às 12h, "Boa tarde" das 12h às 20h, "Boa noite" depois (bot, 3b). */
export function greetingFor(minutes: number) {
  if (minutes >= 6 * 60 && minutes < 12 * 60) return 'Bom dia';
  if (minutes >= 12 * 60 && minutes < 20 * 60) return 'Boa tarde';
  return 'Boa noite';
}

/** "amanhã (quarta)", "quinta (dia 8)", como o dono escreve as datas. */
export function dayPhrase(day: string, today: string) {
  const diff = dayDiff(today, day);
  const weekday = WEEKDAY_LONG[weekdayOf(day)];
  if (diff === 0) return 'hoje';
  if (diff === 1) return `amanhã (${weekday})`;
  return `${weekday} (dia ${Number(day.slice(8, 10))})`;
}

/** "hoje às 14h05", "ontem às 9h10", "a 03/10 às 18h00". */
export function whenPhrase(iso: string, today: string) {
  const day = lisbonDay(iso);
  const diff = dayDiff(day, today);
  const ref = diff === 0 ? 'hoje' : diff === 1 ? 'ontem' : `a ${dm(day)}`;
  return `${ref} às ${clock(lisbonMinutes(new Date(iso)))}`;
}

/** Dia e hora a partir dos quais se pode enviar, empurrando a noite para as 9h30. */
function sendWindow(at: Date): { day: string; notBefore: string } {
  const day = lisbonDay(at);
  const minutes = lisbonMinutes(at);
  if (minutes >= R.quietFromMinutes) return { day: addDays(day, 1), notBefore: clock(R.quietUntilMinutes) };
  if (minutes < R.quietUntilMinutes) return { day, notBefore: clock(R.quietUntilMinutes) };
  return { day, notBefore: clock(minutes) };
}

const maxIso = (...values: (string | null | undefined)[]) =>
  values.filter((v): v is string => !!v).sort().at(-1) ?? null;

// ── Artigos e palavras ─────────────────────────────────────────────────────

type Item = 'Sofá' | 'Colchão' | 'Tapete' | 'Cadeiras' | 'Alcatifa' | 'Cabeceira';
const ITEM_ORDER: Item[] = ['Sofá', 'Colchão', 'Cadeiras', 'Tapete', 'Alcatifa', 'Cabeceira'];

const WORDS: Record<Item, { the: string; your: string; of: string; plural: boolean; data: string }> = {
  'Sofá': { the: 'o sofá', your: 'o seu sofá', of: 'do sofá', plural: false, data: 'quantos lugares tem' },
  'Colchão': { the: 'o colchão', your: 'o seu colchão', of: 'do colchão', plural: false, data: 'o tamanho do colchão' },
  'Cadeiras': { the: 'as cadeiras', your: 'as suas cadeiras', of: 'das cadeiras', plural: true, data: 'quantas cadeiras são' },
  'Tapete': { the: 'o tapete', your: 'o seu tapete', of: 'do tapete', plural: false, data: 'as medidas do tapete' },
  'Alcatifa': { the: 'a alcatifa', your: 'a sua alcatifa', of: 'da alcatifa', plural: false, data: 'a área da alcatifa' },
  'Cabeceira': { the: 'a cabeceira', your: 'a sua cabeceira', of: 'da cabeceira', plural: false, data: 'as medidas da cabeceira' },
};

/** Etiquetas do WhatsApp para artigos. Impermeabilização é quase sempre de sofá; recolha é de tapete. */
const LABEL_ITEM: Record<string, Item> = {
  'Sofá': 'Sofá', 'Colchão': 'Colchão', 'Tapete': 'Tapete', 'Cadeira': 'Cadeiras',
  'Impermeabilização': 'Sofá', 'Recolha': 'Tapete',
};

const joinPt = (parts: string[]) =>
  parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`;

function itemsOfService(s: ClientService): Item[] {
  return itemsOf(s.description).filter((i): i is Item => i !== 'Outro');
}

/** Artigos de um contacto: os do CRM, e as etiquetas quando o CRM não diz nada. */
function contactItems(c: ClientRow, services: ClientService[]): Item[] {
  const set = new Set<Item>(services.flatMap(itemsOfService));
  if (!set.size) for (const label of c.services) { const item = LABEL_ITEM[label]; if (item) set.add(item); }
  return ITEM_ORDER.filter(i => set.has(i));
}

interface Words { the: string; your: string; of: string; plural: boolean }

function wordsFor(items: Item[]): Words {
  if (!items.length) return { the: 'os seus estofos', your: 'os seus estofos', of: 'dos seus estofos', plural: true };
  if (items.length === 1) return WORDS[items[0]];
  return {
    the: joinPt(items.map(i => WORDS[i].the)),
    your: joinPt(items.map(i => WORDS[i].the)),
    of: joinPt(items.map(i => WORDS[i].of)),
    plural: true,
  };
}

/** "a limpeza do sofá e do colchão", "a impermeabilização do sofá". */
function jobOf(s: ClientService): string {
  const items = itemsOfService(s);
  const kind = typeOf(s.description) === 'Impermeabilização' ? 'a impermeabilização' : 'a limpeza';
  return items.length ? `${kind} ${wordsFor(items).of}` : kind;
}

const isRugPickup = (s: ClientService) => itemsOfService(s).includes('Tapete') && /recolh/i.test(s.description);

/** A ficha do Google onde a pessoa avalia: Lisboa para as equipas de Lisboa, Porto para todas as outras. */
export const reviewLinkFor = (region: string | null | undefined) =>
  region === 'Lisboa' ? GOOGLE_REVIEW_LINK_LISBOA : GOOGLE_REVIEW_LINK_PORTO;

/** Até 20€ do faturado podem ser deslocação, que não conta para o mínimo do preço de pack. */
const TRAVEL_ALLOWANCE = 20;

/** Um segundo artigo com preço de pack, com números do motor, ou nada se o pedido não chega ao mínimo. */
function sameVisitOffer(s: ClientService): string | null {
  const items = itemsOfService(s);
  const base = Number(s.billed_value || 0) - TRAVEL_ALLOWANCE;
  if (base <= 0) return null;
  if (!items.includes('Colchão') && base + MATTRESS_TABLE >= PACK_PERK_MIN_ORDER) {
    return `o colchão fica com preço de pack: o de casal, por exemplo, fica por ${formatEuro(perkMattressPrice(MATTRESS_TABLE))} em vez de ${formatEuro(MATTRESS_TABLE)}`;
  }
  const sofa = sofaCleaningPrice('3-lugares');
  if (!items.includes('Sofá') && base + sofa >= PACK_PERK_MIN_ORDER) {
    return `o sofá fica com preço de pack: o de 3 lugares, por exemplo, fica por ${formatEuro(perkSofaPrice('3-lugares', sofa))} em vez de ${formatEuro(sofa)}`;
  }
  return null;
}

// ── Manutenção ─────────────────────────────────────────────────────────────

type MaintenanceKey = Item | 'Essencial';

/** Intervalos e conselho tirados do que o site já diz (páginas-pilar, problemas, materiais). */
export const MAINTENANCE: Record<MaintenanceKey, { days: number; advice: string }> = {
  'Sofá': { days: 270, advice: 'Recomendamos uma limpeza profissional do sofá a cada 6 a 12 meses, conforme o uso.' },
  'Colchão': { days: 365, advice: 'Para uso doméstico, recomendamos uma limpeza profunda do colchão a cada 12 a 18 meses.' },
  'Tapete': { days: 365, advice: 'Para uso doméstico, recomendamos uma limpeza profunda do tapete a cada 12 meses.' },
  'Alcatifa': { days: 365, advice: 'Para uso doméstico, recomendamos uma limpeza profunda a cada 12 meses.' },
  'Cadeiras': { days: 365, advice: '' },
  'Cabeceira': { days: 365, advice: '' },
  'Essencial': { days: 540, advice: 'A proteção Essencial dura 1 a 2 anos, conforme o uso, por isso é uma boa altura para a reforçar.' },
};

function monthsPhrase(days: number) {
  const months = Math.round(days / 30.4);
  if (months >= 11 && months <= 13) return 'cerca de um ano';
  if (months > 13 && months < 18) return 'mais de um ano';
  if (months >= 18 && months <= 19) return 'cerca de um ano e meio';
  return `cerca de ${months} meses`;
}

/** O último serviço de cada artigo (a impermeabilização Essencial conta à parte). */
function maintenanceBases(past: ClientService[], approx: { day: string; items: Item[] } | null) {
  const bases = new Map<MaintenanceKey, string>();
  for (const s of past) {
    const essencial = typeOf(s.description) === 'Impermeabilização' && /essencial/i.test(s.description);
    for (const item of itemsOfService(s)) {
      const key: MaintenanceKey = essencial && item === 'Sofá' ? 'Essencial' : item;
      if ((bases.get(key) ?? '') < s.request_date) bases.set(key, s.request_date);
    }
  }
  if (!past.length && approx) for (const item of approx.items) bases.set(item, approx.day);
  return bases;
}

// ── Campanhas ──────────────────────────────────────────────────────────────

export type Audience = 'clientes' | 'parados' | 'nao_interessados';

export const AUDIENCE_LABEL: Record<Audience, string> = {
  clientes: 'Clientes (último serviço há mais de 60 dias)',
  parados: 'Orçamentos parados há mais de 30 dias',
  nao_interessados: 'Não interessados há mais de 90 dias',
};

export interface CampaignMessageInput {
  hello: string;
  the: string;
  of: string;
  isClient: boolean;
  /** Último dia da campanha, como o dono o escreve ("domingo (dia 30)"). */
  endPhrase: string;
}

export interface Campaign {
  id: string;
  name: string;
  /** MM-DD, todos os anos. */
  start: string;
  end: string;
  audiences: Audience[];
  /** Porque é que esta altura funciona. */
  idea: string;
  /** A condição, numa frase, para o dono confirmar. */
  offer: string;
  message: (m: CampaignMessageInput) => string;
}

const ASK_SLOTS = 'Quer que lhe enviemos as vagas da sua zona?';

/**
 * Calendário de campanhas (PROPOSTA de 06/10/2026, por confirmar pelo dono).
 * Só usa condições que já existem: a deslocação por nossa conta para clientes
 * (o guião de vendas dele) e o preço de pack do segundo artigo (packPerks.ts,
 * o mesmo do site). Nenhuma promete resultados de saúde (o site não o faz).
 */
export const CAMPAIGNS: Campaign[] = [
  {
    id: 'ano-novo',
    name: 'Depois das festas',
    start: '01-07',
    end: '01-31',
    audiences: ['clientes'],
    idea: 'Depois do Natal e da passagem de ano ficam as nódoas das visitas. Só para clientes: são os que já confiam em nós.',
    offer: `Clientes: ${CLIENT_CONDITION}.`,
    message: m =>
      `${m.hello}\n\nDepois das festas há sempre uma nódoa ou outra para tratar. Como já é nosso cliente, se quiser voltar a limpar ${m.the} em janeiro, ${CLIENT_CONDITION}.\n\n${ASK_SLOTS}`,
  },
  {
    id: 'primavera',
    name: 'Primavera',
    start: '03-15',
    end: '04-30',
    audiences: ['clientes', 'parados', 'nao_interessados'],
    idea: 'A altura das limpezas grandes da casa. Sem prometer nada sobre alergias: o site não o faz.',
    offer: `Clientes: ${CLIENT_CONDITION}. Os outros: preço de pack no segundo artigo da mesma visita (pedidos a partir de ${PACK_PERK_MIN_ORDER}€, como no site).`,
    message: m =>
      `${m.hello}\n\nCom a primavera, muitos dos nossos clientes aproveitam para tratar dos estofos e dos tapetes. ${
        m.isClient ? `Como já é nosso cliente, se quiser voltar a limpar ${m.the}, ${CLIENT_CONDITION}.` : `Se ainda quiser tratar ${m.of}, ${PACK_LINE}.`
      }\n\n${ASK_SLOTS}`,
  },
  {
    id: 'verao',
    name: 'Antes do verão',
    start: '06-01',
    end: '06-30',
    audiences: ['clientes', 'parados'],
    idea: 'Antes das férias e das visitas do verão; também quando os alojamentos locais preparam a época.',
    offer: `Clientes: ${CLIENT_CONDITION}. Orçamentos parados: preço de pack no segundo artigo da mesma visita.`,
    message: m =>
      `${m.hello}\n\nAntes das férias e das visitas do verão, muitos dos nossos clientes aproveitam para deixar a casa pronta. ${
        m.isClient ? `Como já é nosso cliente, se quiser voltar a limpar ${m.the}, ${CLIENT_CONDITION}.` : `Se ainda quiser tratar ${m.of}, ${PACK_LINE}.`
      }\n\n${ASK_SLOTS}`,
  },
  {
    id: 'regresso',
    name: 'Regresso à rotina',
    start: '09-01',
    end: '09-30',
    audiences: ['clientes', 'parados'],
    idea: 'Depois das férias, com as crianças e os animais de volta a casa o dia todo.',
    offer: `Clientes: ${CLIENT_CONDITION}. Orçamentos parados: preço de pack no segundo artigo da mesma visita.`,
    message: m =>
      `${m.hello}\n\nCom o regresso à rotina depois das férias, é uma boa altura para tratar ${m.of}. ${
        m.isClient ? `Como já é nosso cliente, ${CLIENT_CONDITION}.` : `E ${PACK_LINE}.`
      }\n\n${ASK_SLOTS}`,
  },
  {
    id: 'black-friday',
    name: 'Black Friday',
    start: '11-20',
    end: '11-30',
    audiences: ['clientes', 'parados', 'nao_interessados'],
    idea: 'A semana em que as pessoas esperam uma condição especial. Serve sobretudo a quem ficou por marcar por causa do preço.',
    offer: 'Deslocação por nossa conta para quem marcar nesta semana, mesmo que o serviço fique para dezembro.',
    message: m =>
      `${m.hello}\n\nNesta semana da Black Friday temos uma condição especial: quem marcar até ${m.endPhrase} tem a deslocação por nossa conta, mesmo que a limpeza fique para dezembro.\n\n${
        m.isClient ? `Se quiser voltar a tratar ${m.of} antes das festas` : `Se ainda quiser tratar ${m.of}`
      }, diga-nos e enviamos-lhe as vagas da sua zona.`,
  },
  {
    id: 'natal',
    name: 'Antes do Natal',
    start: '12-01',
    end: '12-18',
    audiences: ['clientes', 'parados', 'nao_interessados'],
    idea: 'Antes de receber a família: é quando mais gente quer a casa apresentável.',
    offer: `Clientes: ${CLIENT_CONDITION}. Os outros: preço de pack no segundo artigo da mesma visita (pedidos a partir de ${PACK_PERK_MIN_ORDER}€, como no site).`,
    message: m =>
      `${m.hello}\n\nCom o Natal a chegar, estamos a organizar as vagas para antes das festas. ${
        m.isClient ? `Como já é nosso cliente, se quiser voltar a limpar ${m.the}, ${CLIENT_CONDITION}.` : `Se ainda quiser tratar ${m.of} antes de receber a família, ${PACK_LINE}.`
      }\n\n${ASK_SLOTS}`,
  },
];

export interface CampaignRun {
  campaign: Campaign;
  /** Campanha e ano ("natal-2026"): é o que fica registado em cada envio. */
  id: string;
  start: string;
  end: string;
  active: boolean;
}

/** A edição em curso ou a próxima. */
export function campaignRun(campaign: Campaign, today: string): CampaignRun {
  const year = Number(today.slice(0, 4));
  let start = `${year}-${campaign.start}`;
  let end = `${year}-${campaign.end}`;
  if (today > end) {
    start = `${year + 1}-${campaign.start}`;
    end = `${year + 1}-${campaign.end}`;
  }
  return { campaign, id: `${campaign.id}-${start.slice(0, 4)}`, start, end, active: today >= start && today <= end };
}

/** As próximas edições, da mais próxima para a mais afastada. */
export function campaignCalendar(today: string, campaigns: Campaign[] = CAMPAIGNS): CampaignRun[] {
  return campaigns.map(c => campaignRun(c, today)).sort((a, b) => a.start.localeCompare(b.start));
}

// ── Versões A e B ──────────────────────────────────────────────────────────

/** Distribui as versões por contacto (sempre a mesma para a mesma pessoa) até haver dados. */
function bucket(seed: string, n: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % n;
}

/**
 * Ordena as versões de uma mensagem: com envios suficientes das duas, primeiro
 * a que resultou mais; sem isso, alterna por contacto para as duas ganharem
 * dados. A taxa conta só envios cujo resultado já se pode saber.
 */
function orderVariants(messages: DraftMessage[], seed: string, stats: VariantStats | undefined): DraftMessage[] {
  if (messages.length < 2) return messages;
  const s = (m: DraftMessage) => stats?.[m.id] ?? { sent: 0, won: 0 };
  if (messages.every(m => s(m).sent >= R.minVariantSample)) {
    return [...messages].sort((a, b) => s(b).won / s(b).sent - s(a).won / s(a).sent);
  }
  const first = bucket(seed, messages.length);
  return [...messages.slice(first), ...messages.slice(0, first)];
}

// ── O plano de cada contacto ───────────────────────────────────────────────

function planStatus(label: ClientStatus, past: ClientService[], future: ClientService[]): ClientStatus {
  if (future.length) return 'marcado';
  if (past.length) return 'cliente';
  return label;
}

function sendModeOf(a: Omit<FollowUpAction, 'send'>): SendMode {
  // Campanhas vão sempre em lote, e o dono quer ver a lista e o texto antes (05/10/2026).
  if (a.kind === 'campanha') return 'owner_ok';
  if (a.check) return 'owner_ok';
  if (!OFFERS_CONFIRMED && (a.kind === 'recomendacao' || a.kind === 'manutencao')) return 'owner_ok';
  return 'auto';
}

export function planClient(input: PlanInput, ctx: PlanContext): ClientPlan {
  const c = input.client;
  const today = ctx.today ?? lisbonDay(ctx.now);
  // Numa pré-visualização de outro dia, as mensagens saem como se fossem às 10h.
  const nowMinutes = ctx.today && ctx.today !== lisbonDay(ctx.now) ? 10 * 60 : lisbonMinutes(ctx.now);
  const greeting = greetingFor(Math.max(nowMinutes, R.quietUntilMinutes));

  const services = input.services
    .filter(s => !s.calendar_missing_since)
    .sort((a, b) => a.request_date.localeCompare(b.request_date));
  const past = services.filter(s => s.request_date <= today);
  const future = services.filter(s => s.request_date > today);
  const touches = [...input.touches].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const sent = touches.filter(t => !t.skipped);

  const status = planStatus(c.status, past, future);
  const pref: ContactPreference = c.contact_preference ?? 'normal';
  const hold = c.on_hold_reason?.trim() || null;
  const name = firstName(c, services);
  const hello = name ? `${greeting}, ${name}! Tudo bem?` : `${greeting}! Tudo bem?`;
  const hi = name ? `${greeting}, ${name}!` : `${greeting}!`;
  const items = contactItems(c, services);
  const words = wordsFor(items);

  // Quem escreveu por último. Um envio registado no painel ou pelo bot conta
  // como mensagem nossa, mesmo que o WhatsApp ainda não tenha sido lido de novo.
  const clientLast = c.last_client_message_at;
  const weWroteAt = c.last_contact_at && (!clientLast || c.last_contact_at > clientLast) ? c.last_contact_at : null;
  const ourLast = maxIso(weWroteAt, sent[0]?.created_at);
  const theyWroteLast = !!clientLast && (!ourLast || clientLast >= ourLast);

  const lastPast = past[past.length - 1] ?? null;
  const approx = !lastPast && status === 'cliente' && c.last_contact_at
    ? { day: lisbonDay(c.last_contact_at), items: items.length ? items : (['Sofá'] as Item[]) }
    : null;
  const lastServiceDate = lastPast?.request_date ?? approx?.day ?? null;
  const daysSinceService = lastServiceDate ? dayDiff(lastServiceDate, today) : null;
  const silentDays = c.last_contact_at ? dayDiff(lisbonDay(c.last_contact_at), today) : null;

  const cands: Omit<FollowUpAction, 'send'>[] = [];
  const blocked: BlockedAction[] = [];

  // 1. Responder a quem escreveu por último.
  if (theyWroteLast && clientLast) {
    const age = dayDiff(lisbonDay(clientLast), today);
    const limit = status === 'por_marcar' || status === 'sem_estado' ? R.answerLeadDays : R.answerClientDays;
    if (age <= limit) {
      cands.push({
        kind: 'responder', due: lisbonDay(clientLast), priority: 0, title: 'Responder',
        why: `Escreveu-nos ${whenPhrase(clientLast, today)} e a última mensagem é dele(a). Ler a conversa toda antes de responder.`,
        messages: [],
      });
    }
  }

  // 2. Lembrete com data, combinado com a pessoa.
  if (c.follow_up_at) {
    cands.push({
      kind: 'lembrete', due: c.follow_up_at, priority: 1, title: 'Lembrete combinado',
      why: `Combinado voltar a falar a ${dm(c.follow_up_at)}${c.follow_up_reason ? `: ${c.follow_up_reason}` : '.'}`,
      messages: [{
        id: 'lembrete-a',
        label: 'Voltar a falar',
        text: `${hello}\n\nCombinámos voltar a falar por esta altura sobre ${items.length ? `a limpeza ${words.of}` : 'a limpeza'}. Temos disponibilidade [dia 1] às [hora 1] ou [dia 2] às [hora 2]. Como gostaria de avançar?`,
      }],
    });
  }

  // 3. Véspera de um serviço marcado (bot, 7.3).
  const nextService = future[0] ?? null;
  if (nextService && dayDiff(today, nextService.request_date) <= 2) {
    const since = addDays(nextService.request_date, -3);
    const done = touches.some(t => t.kind === 'vespera' && lisbonDay(t.created_at) >= since);
    if (!done) {
      cands.push({
        kind: 'vespera', due: addDays(nextService.request_date, -1), until: addDays(nextService.request_date, -1), priority: 1,
        title: 'Lembrar o serviço de amanhã',
        why: `Serviço ${dayPhrase(nextService.request_date, today)}: ${nextService.description}`,
        messages: [{ id: 'vespera-a', label: 'Lembrete', text: `${hello}\n\nSó para lembrar: amanhã às [hora] estamos aí para ${jobOf(nextService)}. Até amanhã` }],
      });
    }
  }

  // 4. Aproveitar a mesma visita: um segundo artigo com preço de pack.
  if (nextService) {
    const daysTo = dayDiff(today, nextService.request_date);
    const offer = sameVisitOffer(nextService);
    const offered = touches.some(t => t.kind === 'mesma_visita' && dayDiff(lisbonDay(t.created_at), today) <= 30);
    if (offer && !offered && daysTo >= R.sameVisitUntilDays && daysTo <= R.sameVisitFromDays + R.soonDays) {
      cands.push({
        kind: 'mesma_visita', due: addDays(nextService.request_date, -R.sameVisitFromDays),
        until: addDays(nextService.request_date, -R.sameVisitUntilDays), priority: 4,
        title: 'Aproveitar a mesma visita',
        why: `Serviço ${dayPhrase(nextService.request_date, today)} (${nextService.description}). Um segundo artigo na mesma visita fica com preço de pack e não leva deslocação a mais. Se já ofereceram um extra na conversa e a pessoa disse que não, não enviar.`,
        messages: [{
          id: 'mesma-visita-a',
          label: 'Segundo artigo',
          text: `${hello}\n\nPara ${dayPhrase(nextService.request_date, today)} está tudo combinado para ${jobOf(nextService)}. Se quiser aproveitar a mesma visita, ${offer}.\n\nQuer que acrescentemos ao serviço?`,
        }],
      });
    }
  }

  // 5. Depois do serviço: avaliação, e um só lembrete (bot, 7.4).
  if (!c.reviewed_google && (lastPast || approx) && status === 'cliente') {
    const serviceDay = lastPast?.request_date ?? approx!.day;
    const pickup = lastPast ? isRugPickup(lastPast) : false;
    const start = pickup ? addDays(serviceDay, R.rugPickupDelayDays) : serviceDay;
    const until = addDays(start, R.reviewWindowDays);
    const asks = touches.filter(t => (t.kind === 'avaliacao' || t.kind === 'avaliacao_lembrete') && lisbonDay(t.created_at) >= serviceDay);
    const link = reviewLinkFor(lastPast?.locality ?? c.region);
    const done = wordsFor(lastPast ? itemsOfService(lastPast) : items);
    const job = lastPast ? jobOf(lastPast) : `a limpeza ${done.of}`;
    if (!asks.length) {
      if (today <= until) {
        cands.push({
          kind: 'avaliacao', due: start, until, priority: 2, title: 'Pedir avaliação',
          why: `Serviço a ${dm(serviceDay)}${lastPast ? ` (${lastPast.description})` : ' (data aproximada: sem serviço no CRM com este telefone)'}. Ainda não avaliou.`,
          check: pickup ? 'Tapete com recolha: confirmar primeiro no grupo da equipa que já foi entregue.' : undefined,
          messages: orderVariants([
            {
              id: 'avaliacao-a', label: 'Versão A (bot 7.4)',
              text: `${hello}\n\nEsperamos que ${done.the} ${done.plural ? 'tenham' : 'tenha'} ficado como queria. Se precisar de alguma coisa, estamos por aqui.\n\nSe gostou do resultado, uma avaliação no Google ajuda-nos muito: ${link}`,
            },
            {
              id: 'avaliacao-b', label: 'Versão B (05/10)',
              text: `${hello}\n\nEsperamos que tenha gostado do resultado ${job.replace(/^a /, 'da ')}. Se precisar de alguma coisa, estamos por aqui.\n\nSe ficou contente com o trabalho, uma avaliação no Google ajuda-nos muito e demora menos de um minuto:\n${link}\n\nMuito obrigado pela confiança!`,
            },
          ], `${c.id}:avaliacao`, ctx.variantStats),
        });
      }
    } else {
      const first = asks[asks.length - 1];
      const reminded = asks.some(t => t.kind === 'avaliacao_lembrete');
      const askedDay = lisbonDay(first.created_at);
      const remUntil = addDays(askedDay, R.reviewReminderUntilDays);
      if (!first.skipped && !reminded && today <= remUntil) {
        cands.push({
          kind: 'avaliacao_lembrete', due: addDays(askedDay, R.reviewReminderAfterDays), until: remUntil, priority: 3,
          title: 'Lembrar a avaliação (só uma vez)',
          why: `Pedimos a avaliação a ${dm(askedDay)} e ainda não a deixou. Se já disse que ia avaliar, não insistir.`,
          messages: [{ id: 'avaliacao-lembrete-a', label: 'Lembrete', text: `${hi} Desculpe voltar a incomodar. Se tiver um minuto, a sua avaliação ajuda-nos muito: ${link}\n\nMuito obrigado!` }],
        });
      }
    }
  }

  // 6. Recomendação: a quem avaliou ou já repetiu. É o cliente mais barato que existe.
  const loyal = past.length >= 2;
  if ((c.reviewed_google || loyal) && lastServiceDate && status === 'cliente' && daysSinceService !== null) {
    const asked = touches.some(t => t.kind === 'recomendacao' && dayDiff(lisbonDay(t.created_at), today) < R.referralEveryDays);
    if (!asked && daysSinceService >= R.referralFromDays && daysSinceService <= R.referralUntilDays) {
      const thanks = c.reviewed_google ? 'Muito obrigado pela sua avaliação, ajuda-nos imenso.' : 'Muito obrigado por continuar a confiar em nós.';
      const ask = 'Se conhecer alguém que precise de limpar um sofá, um colchão ou um tapete, pode passar-lhe o nosso contacto.';
      cands.push({
        kind: 'recomendacao', due: addDays(lastServiceDate, R.referralFromDays), until: addDays(lastServiceDate, R.referralUntilDays), priority: 4,
        title: 'Pedir recomendação',
        why: c.reviewed_google ? 'Deixou avaliação no Google: é quem mais facilmente recomenda.' : `Já fez ${past.length} serviços connosco.`,
        messages: orderVariants([
          { id: 'recomendacao-a', label: 'Versão A (com condição)', text: `${hello}\n\n${thanks} ${ask} ${REFERRAL_CONDITION}\n\nObrigado!` },
          { id: 'recomendacao-b', label: 'Versão B (sem condição)', text: `${hello}\n\n${thanks} ${ask} Vamos tratá-la com o mesmo cuidado com que o tratámos a si.\n\nObrigado!` },
        ], `${c.id}:recomendacao`, ctx.variantStats),
      });
    }
  }

  // 7. Manutenção: o intervalo que o site recomenda já passou.
  let maintenanceDue = false;
  if (status === 'cliente') {
    const bases = maintenanceBases(past, approx);
    let best: { key: MaintenanceKey; base: string; due: string } | null = null;
    for (const [key, base] of bases) {
      const due = addDays(base, MAINTENANCE[key].days);
      if (!best || due < best.due) best = { key, base, due };
    }
    if (best && today >= addDays(best.due, -R.soonDays) && today <= addDays(best.due, R.maintenanceValidDays)) {
      const base = best.base;
      const done = touches.some(t => t.kind === 'manutencao' && lisbonDay(t.created_at) > base);
      maintenanceDue = today >= best.due && !done;
      if (!done) {
        const key = best.key;
        const what = key === 'Essencial' ? 'protegemos o seu sofá' : `limpámos ${WORDS[key].your}`;
        const advice = MAINTENANCE[key].advice;
        const opening = `${hello}\n\nJá passaram ${monthsPhrase(dayDiff(base, today))} desde que ${what}.${advice ? ` ${advice}` : ''}`;
        cands.push({
          kind: 'manutencao', due: best.due, until: addDays(best.due, R.maintenanceValidDays), priority: 4,
          title: 'Voltar a limpar',
          why: `Último serviço de ${key === 'Essencial' ? 'impermeabilização Essencial' : key.toLowerCase()} a ${dm(base)}${approx ? ' (data aproximada pelo último contacto)' : ''}.`,
          messages: orderVariants([
            { id: 'manutencao-a', label: 'Versão A (com condição de cliente)', text: `${opening}\n\nComo já é nosso cliente, ${CLIENT_CONDITION}. ${ASK_SLOTS}` },
            { id: 'manutencao-b', label: 'Versão B (sem condição)', text: `${opening}\n\n${ASK_SLOTS}` },
          ], `${c.id}:manutencao`, ctx.variantStats),
        });
      }
    }
  }

  // 8. Seguimento de um orçamento sem resposta (bot, 8): dois no máximo, e parar.
  const isLead = status === 'por_marcar' || status === 'sem_estado';
  if (isLead && !theyWroteLast && ourLast && !c.follow_up_at) {
    const since = clientLast ?? c.first_contact_at ?? ourLast;
    const followUps = sent.filter(t => t.kind === 'seguimento' && t.created_at > since);
    const silent = dayDiff(lisbonDay(since), today);
    if (followUps.length >= R.maxFollowUps) {
      if (silent <= 14) blocked.push({ kind: 'seguimento', title: 'Seguimento', reason: `Já levou ${followUps.length} seguimentos sem resposta: parar.` });
    } else if (silent > R.followUpWindowDays) {
      if (silent <= 14) blocked.push({ kind: 'seguimento', title: 'Seguimento', reason: `Sem resposta há ${silent} dias: depois de 3 dias o seguimento já não resulta. Só numa data combinada ou numa campanha.` });
    } else {
      const n = followUps.length;
      const base = n === 0 ? ourLast : followUps[0].created_at;
      const hours = n === 0 ? R.firstFollowUpHours : R.secondFollowUpHours;
      const win = sendWindow(new Date(Date.parse(base) + hours * 3_600_000));
      const lead = name ? `${name}, ainda` : 'Ainda';
      const item = items[0] ? WORDS[items[0]] : null;
      cands.push({
        kind: 'seguimento', due: win.day, notBefore: win.notBefore, priority: n === 0 ? 1 : 2,
        title: n === 0 ? '1.º seguimento (mesmo dia)' : '2.º e último seguimento',
        why: n === 0
          ? `A última mensagem foi nossa, ${whenPhrase(ourLast, today)}, sem resposta. Antes de enviar, confirmar na conversa que ainda não levou seguimentos: com dois, parar.`
          : `1.º seguimento ${whenPhrase(followUps[0].created_at, today)}, sem resposta. Este é o último.`,
        messages: n === 0
          ? [
              { id: 'seguimento-preco', label: 'Já tem preço', text: `${lead} temos [dia 1] às [hora 1] ou [dia 2] às [hora 2] para ${words.your}. Como gostaria de avançar?` },
              {
                id: 'seguimento-foto', label: 'Falta a fotografia',
                text: `Só para dar seguimento${name ? `, ${name}` : ''}. Conseguiu tirar a fotografia ${words.of}? Se for mais fácil, diga-nos só ${item ? item.data : 'o que precisa de limpar'} e enviamos-lhe já o orçamento.`,
              },
            ]
          : [{ id: 'seguimento-ultimo', label: 'Último', text: `${hello} Só para não perder a vaga: podemos marcar para [dia] às [hora]? Se preferir outro dia, é só dizer.` }],
      });
    }
  }

  // 9. Campanha em curso (uma de cada vez).
  const audience: Audience | null =
    status === 'cliente' ? (daysSinceService !== null && daysSinceService >= R.clientCampaignDays ? 'clientes' : null)
    : isLead ? (silentDays !== null && silentDays >= R.stalledCampaignDays ? 'parados' : null)
    : status === 'nao_interessado' ? (silentDays !== null && silentDays >= R.afterNoDays ? 'nao_interessados' : null)
    : null;
  for (const run of campaignCalendar(today, ctx.campaigns ?? CAMPAIGNS)) {
    if (!run.active) continue;
    if (touches.some(t => t.kind === 'campanha' && t.campaign === run.id)) continue;
    if (!audience || !run.campaign.audiences.includes(audience)) {
      // Só se explica a exclusão de quem a campanha visa.
      if (status === 'nao_interessado' && run.campaign.audiences.includes('nao_interessados')) {
        blocked.push({ kind: 'campanha', campaignId: run.id, title: run.campaign.name, reason: `Disse que não há ${silentDays ?? '?'} dias: esperar ${R.afterNoDays}.` });
      } else if (status === 'cliente' && run.campaign.audiences.includes('clientes')) {
        blocked.push({ kind: 'campanha', campaignId: run.id, title: run.campaign.name, reason: `Serviço há ${daysSinceService ?? '?'} dias: as campanhas são para quem não faz serviço há mais de ${R.clientCampaignDays}.` });
      } else if (isLead && run.campaign.audiences.includes('parados')) {
        blocked.push({ kind: 'campanha', campaignId: run.id, title: run.campaign.name, reason: `Último contacto há ${silentDays ?? '?'} dias: a campanha é para orçamentos parados há mais de ${R.stalledCampaignDays}.` });
      }
      continue;
    }
    cands.push({
      kind: 'campanha', campaignId: run.id, due: run.start, until: run.end, priority: 5,
      title: run.campaign.name,
      why: `${AUDIENCE_LABEL[audience]}. ${run.campaign.idea}`,
      messages: [{
        id: `campanha-${run.campaign.id}`,
        label: run.campaign.name,
        text: run.campaign.message({ hello, the: words.the, of: words.of, isClient: audience === 'clientes', endPhrase: dayPhrase(run.end, today) }),
      }],
    });
    break;
  }

  // ── Quando NÃO escrever ──────────────────────────────────────────────────
  const hasAnswer = cands.some(a => a.kind === 'responder');
  const lastMarketing = sent.find(t => MARKETING_KINDS.includes(t.kind as ActionKind));
  const marketingGap = lastMarketing ? dayDiff(lisbonDay(lastMarketing.created_at), today) : null;
  const ourSilence = !theyWroteLast && ourLast ? dayDiff(lisbonDay(ourLast), today) : null;

  const reasonFor = (a: Omit<FollowUpAction, 'send'>): string | null => {
    const marketing = MARKETING_KINDS.includes(a.kind);
    if (pref === 'nao_contactar' && a.kind !== 'responder') {
      return `Pediu para não receber mensagens${c.contact_note ? ` (${c.contact_note})` : ''}. Só responder se escrever.`;
    }
    if (pref === 'sem_promocoes' && marketing) return 'Não quer promoções: só mensagens do próprio serviço.';
    if (hold && !['responder', 'vespera', 'lembrete'].includes(a.kind)) return `Em pausa: ${hold}`;
    if (hasAnswer && a.kind !== 'responder' && a.kind !== 'vespera') return 'Primeiro responder: escreveu-nos por último.';
    if (nextService && ['recomendacao', 'manutencao', 'campanha'].includes(a.kind)) {
      return `Já tem serviço marcado ${dayPhrase(nextService.request_date, today)}.`;
    }
    if (c.follow_up_at && c.follow_up_at > today && marketing) return `Combinado voltar a falar a ${dm(c.follow_up_at)}: esperar por essa data.`;
    if (status === 'nao_interessado' && marketing && silentDays !== null && silentDays < R.afterNoDays) {
      return `Disse que não há ${silentDays} dias: esperar ${R.afterNoDays}.`;
    }
    if (marketing && marketingGap !== null && marketingGap < R.marketingEveryDays) {
      return `Já recebeu uma mensagem comercial a ${dm(lisbonDay(lastMarketing!.created_at))}: uma de cada vez, com ${R.marketingEveryDays} dias de intervalo.`;
    }
    if (marketing && a.kind !== 'mesma_visita' && ourSilence !== null && ourSilence < R.quietDaysAfterOurMessage) {
      return `A última mensagem foi nossa há ${ourSilence} dia${ourSilence === 1 ? '' : 's'} e ficou sem resposta: esperar ${R.quietDaysAfterOurMessage} dias.`;
    }
    return null;
  };

  const allowed: FollowUpAction[] = [];
  for (const a of cands) {
    const reason = reasonFor(a);
    if (reason) {
      if (a.due <= today) blocked.push({ kind: a.kind, title: a.title, reason, campaignId: a.campaignId });
    } else {
      allowed.push({ ...a, send: sendModeOf(a) });
    }
  }
  allowed.sort((a, b) => a.priority - b.priority || a.due.localeCompare(b.due));

  // Uma mensagem comercial de cada vez: fica a mais importante das que já são para hoje.
  const final: FollowUpAction[] = [];
  let marketingTaken: FollowUpAction | null = null;
  for (const a of allowed) {
    if (MARKETING_KINDS.includes(a.kind) && a.due <= today) {
      if (marketingTaken) {
        blocked.push({ kind: a.kind, title: a.title, reason: `Uma mensagem comercial de cada vez: primeiro "${marketingTaken.title}".`, campaignId: a.campaignId });
        continue;
      }
      marketingTaken = a;
    }
    final.push(a);
  }

  const soonLimit = addDays(today, R.soonDays);
  const stage: Stage =
    pref === 'nao_contactar' ? 'nao_contactar'
    : hold ? 'em_pausa'
    : status === 'marcado' ? 'marcado'
    : hasAnswer && (isLead || status === 'nao_interessado') ? 'conversa'
    : status === 'cliente' ? (maintenanceDue ? 'manutencao' : daysSinceService !== null && daysSinceService <= 60 ? 'cliente_recente' : 'cliente')
    : status === 'nao_interessado' ? 'perdido'
    : silentDays !== null && silentDays <= R.followUpWindowDays ? 'orcamento_aberto'
    : 'orcamento_parado';

  return {
    stage,
    loyal,
    promoter: c.reviewed_google,
    today: final.filter(a => a.due <= today && (!a.until || a.until >= today)),
    soon: final.filter(a => a.due > today && a.due <= soonLimit),
    blocked,
    lastServiceDate,
    approxServiceDate: !lastPast && !!approx,
    nextServiceDate: nextService?.request_date ?? null,
    servicesDone: past.length,
  };
}

// ── Todos os contactos de uma vez ──────────────────────────────────────────

export interface FollowUpData {
  clients: ClientRow[];
  /** Linhas do CRM (todas; liga-se ao contacto pelos últimos 9 dígitos do telefone). */
  services: ClientService[];
  touches: ClientTouch[];
}

export interface PlannedClient {
  client: ClientRow;
  services: ClientService[];
  touches: ClientTouch[];
  plan: ClientPlan;
}

/** A última leitura do WhatsApp: a mensagem mais recente vista nas fichas. */
export function snapshotAt(clients: ClientRow[]): string | null {
  return maxIso(...clients.map(c => c.last_contact_at));
}

/** Para cada versão de mensagem, quantas foram enviadas e quantas resultaram (envios de mais de 3 dias). */
export function variantStats(rows: { client: ClientRow; services: ClientService[]; touches: ClientTouch[] }[], now: Date): VariantStats {
  const stats: VariantStats = {};
  const settled = new Date(now.getTime() - 3 * 86_400_000).toISOString();
  for (const { client, services, touches } of rows) {
    for (const t of touches) {
      if (t.skipped || !t.template || t.created_at > settled) continue;
      const s = (stats[t.template] ??= { sent: 0, won: 0 });
      s.sent++;
      if (touchWon(t, client, services)) s.won++;
    }
  }
  return stats;
}

/**
 * O que conta como resultado de cada mensagem: nas avaliações, a avaliação
 * feita; na recomendação, uma resposta; em tudo o resto, um serviço fechado
 * nos 30 dias seguintes.
 */
export function touchWon(t: ClientTouch, client: ClientRow, services: ClientService[]): boolean {
  if (t.kind === 'avaliacao' || t.kind === 'avaliacao_lembrete') return client.reviewed_google;
  if (t.kind === 'recomendacao') return !!client.last_client_message_at && client.last_client_message_at > t.created_at;
  return bookedAfter(t, services).length > 0;
}

function bookedAfter(t: ClientTouch, services: ClientService[]) {
  const limit = new Date(Date.parse(t.created_at) + 30 * 86_400_000).toISOString();
  return services.filter(s => {
    if (s.calendar_missing_since) return false;
    const closed = s.booked_at ?? `${s.request_date}T12:00:00Z`;
    return closed > t.created_at && closed <= limit;
  });
}

export function planAll(data: FollowUpData, ctx: PlanContext): PlannedClient[] {
  const byPhone = servicesByPhone(data.services);
  const byClient = new Map<string, ClientTouch[]>();
  for (const t of data.touches) byClient.set(t.client_id, [...(byClient.get(t.client_id) ?? []), t]);
  const rows = data.clients.map(client => ({
    client,
    services: byPhone.get(phoneKey(client.phone)) ?? [],
    touches: byClient.get(client.id) ?? [],
  }));
  const stats = ctx.variantStats ?? variantStats(rows, ctx.now);
  return rows.map(r => ({ ...r, plan: planClient(r, { ...ctx, variantStats: stats }) }));
}

// ── Resultados e oportunidades (vista Estratégia) ──────────────────────────

export interface KindResult {
  kind: ActionKind;
  sent: number;
  /** Envios cuja resposta já se pode saber (o WhatsApp foi lido depois do envio). */
  known: number;
  replied: number;
  /** Fecharam um serviço nos 30 dias a seguir ao envio. */
  booked: number;
  billed: number;
}

/**
 * O que está a resultar: por tipo de mensagem enviada desde `since`, quantas
 * tiveram resposta e quantas acabaram num serviço fechado nos 30 dias
 * seguintes (pelo dia de fecho do CRM). A resposta só se sabe quando o
 * WhatsApp foi lido depois do envio (`snapshot`).
 */
export function touchResults(rows: { client: ClientRow; services: ClientService[]; touches: ClientTouch[] }[], since: string, snapshot: string | null): KindResult[] {
  const results = new Map<ActionKind, KindResult>();
  for (const { client, services, touches } of rows) {
    for (const t of touches) {
      if (t.skipped || t.kind === 'outro' || lisbonDay(t.created_at) < since) continue;
      const r = results.get(t.kind) ?? { kind: t.kind, sent: 0, known: 0, replied: 0, booked: 0, billed: 0 };
      r.sent++;
      if (snapshot && snapshot > t.created_at) {
        r.known++;
        if (client.last_client_message_at && client.last_client_message_at > t.created_at) r.replied++;
      }
      const won = bookedAfter(t, services);
      if (won.length) {
        r.booked++;
        r.billed += won.reduce((sum, s) => sum + Number(s.billed_value || 0), 0);
      }
      results.set(t.kind, r);
    }
  }
  return ACTION_KINDS.map(k => results.get(k)).filter((r): r is KindResult => !!r);
}

export const CROSS_SELL_ITEMS = ['Sofá', 'Colchão', 'Cadeiras', 'Tapete', 'Impermeabilização'] as const;
export type CrossSellItem = (typeof CROSS_SELL_ITEMS)[number];

/** O que cada cliente já fez, pelo CRM e pelas etiquetas. */
export function boughtItems(c: ClientRow, services: ClientService[]): Set<CrossSellItem> {
  const set = new Set<CrossSellItem>();
  for (const s of services) {
    if (s.calendar_missing_since) continue;
    for (const i of itemsOfService(s)) if ((CROSS_SELL_ITEMS as readonly string[]).includes(i)) set.add(i as CrossSellItem);
    if (typeOf(s.description) === 'Impermeabilização') set.add('Impermeabilização');
  }
  for (const label of c.services) {
    const item = label === 'Cadeira' ? 'Cadeiras' : label === 'Recolha' ? 'Tapete' : label;
    if ((CROSS_SELL_ITEMS as readonly string[]).includes(item)) set.add(item as CrossSellItem);
  }
  return set;
}

/** Clientes que fizeram A e nunca fizeram B: `matrix[A][B]`. */
export function crossSellMatrix(rows: { client: ClientRow; services: ClientService[]; isClient: boolean }[]) {
  const matrix = Object.fromEntries(CROSS_SELL_ITEMS.map(a => [a, Object.fromEntries(CROSS_SELL_ITEMS.map(b => [b, 0]))])) as Record<CrossSellItem, Record<CrossSellItem, number>>;
  const totals = Object.fromEntries(CROSS_SELL_ITEMS.map(a => [a, 0])) as Record<CrossSellItem, number>;
  for (const { client, services, isClient } of rows) {
    if (!isClient) continue;
    const bought = boughtItems(client, services);
    for (const a of bought) {
      totals[a]++;
      for (const b of CROSS_SELL_ITEMS) if (b !== a && !bought.has(b)) matrix[a][b]++;
    }
  }
  return { matrix, totals };
}

// ── O que o bot precisa de saber de quem lhe escreve ───────────────────────

/**
 * Frases curtas para o bot ter em conta quando esta pessoa escreve: em que
 * fase está, o que fazer e o que não fazer. Complementa o ficheiro de
 * respostas do bot, não o substitui.
 */
export function botGuidance(p: PlannedClient, today: string): string[] {
  const { client: c, plan } = p;
  const g: string[] = [];
  switch (plan.stage) {
    case 'nao_contactar':
      g.push(`Pediu para não receber mensagens${c.contact_note ? ` (${c.contact_note})` : ''}. Responde só ao que perguntar, sem seguimentos nem promoções.`);
      break;
    case 'em_pausa':
      g.push(`Tem um problema em aberto (${c.on_hold_reason}). Passa a conversa ao responsável antes de qualquer outra coisa.`);
      break;
    case 'marcado':
      g.push(`Tem serviço marcado ${plan.nextServiceDate ? dayPhrase(plan.nextServiceDate, today) : ''}. Se quiser juntar um artigo, usa o preço de pack da mesma visita.`.replace(' .', '.'));
      break;
    case 'perdido':
      g.push('Disse que não noutra altura. Segue o funil normal e nunca menciones essa recusa.');
      break;
    case 'orcamento_parado':
      g.push('Já pediu orçamento antes e não marcou. Retoma onde ficou, sem repetir o que já foi enviado, e pergunta o que ficou por decidir.');
      break;
    case 'cliente':
    case 'cliente_recente':
    case 'manutencao':
      g.push(`Já é cliente${plan.servicesDone ? ` (${plan.servicesDone} serviço${plan.servicesDone === 1 ? '' : 's'})` : ''}. Trata-o como tal, sem explicar tudo do zero. Se pedir uma condição, a de cliente é: ${CLIENT_CONDITION}${OFFERS_CONFIRMED ? '' : ' (ainda é proposta: confirma com o responsável)'}.`);
      break;
    default:
      break;
  }
  if (plan.loyal) g.push('Cliente fiel: dá-lhe as primeiras vagas.');
  if (plan.promoter) g.push('Deixou avaliação no Google.');
  if (c.from_google_ads) g.push('Veio do anúncio Google.');
  if (c.referred_by) g.push(`Veio por recomendação de ${c.referred_by}.`);
  if (plan.stage === 'cliente' || plan.stage === 'cliente_recente' || plan.stage === 'manutencao') {
    const bought = boughtItems(c, p.services);
    const missing = CROSS_SELL_ITEMS.filter(i => !bought.has(i) && i !== 'Tapete');
    if (bought.size && missing.length) g.push(`Ainda não fez connosco: ${joinPt(missing.map(m => m.toLowerCase()))}. Se fizer sentido, oferece UM extra depois do preço.`);
  }
  return g;
}

/** wa.me com a mensagem já escrita (o WhatsApp abre-a na caixa de texto, por enviar). */
export function waLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, '').replace(/^00/, '');
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

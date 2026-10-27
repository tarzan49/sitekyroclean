// Procedimento de cada serviço (dono, 2026-10-14, todas as equipas): a equipa
// manda fotografia de antes, fotografia de depois e vídeo, e o cliente deixa
// avaliação Google de 4 ou 5 estrelas (REVIEW_MIN_STARS); quanto isso vale
// para a equipa está em procedurePay. O cliente tem REVIEW_DEADLINE_DAYS dias
// depois do serviço para avaliar; no fim do 7.º dia o procedimento fecha, e as
// contas da noite aplicam o resultado (procedurePay) e avisam a equipa. Enquanto
// o prazo corre não se soma nada. A regra de pagamento mudou duas vezes a
// 14/10 e outra vez a 20/10 (a de agora: tudo = 50% + 5€, falta qualquer
// coisa = 45%): por isso vive só em procedurePay, e as contas só a aplicam com
// PROCEDURE_PAY_ENABLED, que o dono ainda não mandou ligar.
//
// Quando um serviço acaba, o servidor do bot manda a cada pessoa da equipa a
// mensagem de `procedurePromptMessage`; a equipa responde a essa mensagem
// (resposta citada) com as fotografias e o vídeo, para dois serviços seguidos
// nunca se misturarem. Tabela service_procedure; a avaliação vem de
// google_reviews.service_request_id.
//
// Corre no painel (aba Avaliações), nas contas da noite e na bot-api: só
// imports puros, porque vai no pacote do bot.
import { REVIEW_DEADLINE_DAYS, REVIEW_MIN_STARS } from './crmReviews';
import { UPSELL_TIERS_FROM } from './crmUpsell';
import { INSTAGRAM_URL } from '../constants/business';

export const PROCEDURE_FULL_SHARE = 50;
export const PROCEDURE_REDUCED_SHARE = 45;

/**
 * A regra de pagamento, num só sítio. Em vigor: 'all_or_45' (dono, 20/10, nas
 * contas mandadas aos grupos: "Se faltar uma das duas coisas, ficam mais 5% do
 * valor do serviço para mim"; e as contas de 26/10 dão +5€ a cada serviço
 * completo): fotografias de antes e depois + vídeo + avaliação de 4 ou 5
 * estrelas = 50% + 5€; falta qualquer uma = 45%. A 27/10 o bot disse ao Aleixo
 * "sem avaliação… a equipa fica com 50%" com a regra antiga, e o dono: "a
 * equipa fica com 50%????". Ficam as regras anteriores, por comparação:
 * 'review_compensates' (14/10 às 11h20: a avaliação compensava fotografias ou
 * vídeo em falta e vice-versa, só sem as duas = 45%), 'review_in_50' (as
 * quatro = 50% sem bónus, a da manhã de 14/10) e 'review_bonus' (fotografias e
 * vídeo = 50%, avaliação +5€). Mudar a regra é mudar PROCEDURE_PAY_RULE.
 */
export type ProcedurePayRule = 'all_or_45' | 'review_compensates' | 'review_in_50' | 'review_bonus';
export const PROCEDURE_PAY_RULE: ProcedurePayRule = 'all_or_45';
export const PROCEDURE_REVIEW_BONUS = 5;
/**
 * As contas da noite só aplicam o resultado do procedimento com isto ligado.
 * Desligado até o dono confirmar a regra: o bot já recolhe as fotografias, o
 * vídeo e a avaliação de cada serviço, e o painel mostra-os.
 */
export const PROCEDURE_PAY_ENABLED = false;

export interface ProcedurePay {
  /** % do valor do serviço que fica para a equipa. */
  teamShare: number;
  /** Euros fixos que o dono deve à equipa por cima (a avaliação, na regra 'review_bonus'). */
  bonus: number;
}

export function procedurePay(got: { before: boolean; after: boolean; video: boolean; review: boolean }, rule: ProcedurePayRule = PROCEDURE_PAY_RULE): ProcedurePay {
  const media = got.before && got.after && got.video;
  if (rule === 'all_or_45') return media && got.review ? { teamShare: PROCEDURE_FULL_SHARE, bonus: PROCEDURE_REVIEW_BONUS } : { teamShare: PROCEDURE_REDUCED_SHARE, bonus: 0 };
  if (rule === 'review_compensates') {
    if (media && got.review) return { teamShare: PROCEDURE_FULL_SHARE, bonus: PROCEDURE_REVIEW_BONUS };
    return { teamShare: media || got.review ? PROCEDURE_FULL_SHARE : PROCEDURE_REDUCED_SHARE, bonus: 0 };
  }
  if (rule === 'review_bonus') return { teamShare: media ? PROCEDURE_FULL_SHARE : PROCEDURE_REDUCED_SHARE, bonus: media && got.review ? PROCEDURE_REVIEW_BONUS : 0 };
  return { teamShare: media && got.review ? PROCEDURE_FULL_SHARE : PROCEDURE_REDUCED_SHARE, bonus: 0 };
}

/**
 * Desde quando o procedimento conta em cada equipa (dia do serviço). Porto 1 e
 * Porto 2 a partir de 15/10 (o primeiro dia com as mensagens do bot; a regra do
 * Porto 2 foi explicada ao Aleixo a 14/10); as outras equipas a partir de
 * 19/10, o dia do guião. Só conta num serviço que recebeu a mensagem do bot
 * (`prompted_at`): sem ela a equipa não tinha a que responder.
 */
// Dono, 14/10: "liga o envio". As regras foram mandadas a 14/10 ao Porto, a
// Lisboa (com o Algarve no mesmo grupo) e a Coimbra: começam a 15/10. Braga
// (Clivia) ainda não as recebeu: fica na data do guião (UPSELL_TIERS_FROM).
const PROCEDURE_FROM_BY_TEAM: Record<string, string> = {
  'Porto 1': '2026-10-15', 'Porto 2': '2026-10-15', 'Lisboa 1': '2026-10-15', 'Lisboa 2': '2026-10-15', 'Algarve': '2026-10-15', 'Coimbra': '2026-10-15',
};
export const procedureFrom = (team: string) => PROCEDURE_FROM_BY_TEAM[team] ?? UPSELL_TIERS_FROM;

/** Fichas do Google: as equipas de Lisboa pedem na ficha de Lisboa, as outras na do Porto. */
export const REVIEW_LINKS = {
  lisboa: 'https://g.page/r/CRc7F7lX3xcEECE/review',
  porto: 'https://search.google.com/local/writereview?placeid=ChIJt71NLgBlJA0RIT9kggF_3Fk',
} as const;
export const reviewProfileOfTeam = (team: string): 'lisboa' | 'porto' => (/^lisboa/i.test(team) ? 'lisboa' : 'porto');

/** em_curso: prazo a correr; completo: as quatro coisas; fechado: o prazo acabou com alguma em falta. */
export type ProcedureStatus = 'em_curso' | 'completo' | 'fechado';
export type ProcedureItem = 'before' | 'after' | 'video' | 'review';

export interface ProcedureRecord {
  calendar_event_id: string;
  service_request_id: string | null;
  team: string;
  service_day: string;
  prompt_msg_ids: string[];
  prompted_at: string | null;
  before_msg_id: string | null;
  before_at: string | null;
  after_msg_id: string | null;
  after_at: string | null;
  video_msg_id: string | null;
  video_at: string | null;
  reminders_sent: number;
  last_reminder_at: string | null;
  status: ProcedureStatus;
  closed_at: string | null;
  penalty_paid: boolean;
}

export interface ProcedureReview { stars: number; reviewed_at: string; excluded?: string | null }

export interface ProcedureCheck {
  before: boolean;
  after: boolean;
  video: boolean;
  review: boolean;
  missing: ProcedureItem[];
  /** Último dia do prazo (dia do serviço + 7). */
  deadline: string;
  status: ProcedureStatus;
  /** O pagamento pela regra em vigor; null enquanto o prazo corre e falta alguma coisa. */
  pay: ProcedurePay | null;
}

export const ITEM_LABEL: Record<ProcedureItem, string> = {
  before: 'fotografia de antes',
  after: 'fotografia de depois',
  video: 'vídeo',
  review: 'avaliação do cliente',
};

const lisbon = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' });
export const lisbonDayOf = (iso: string | Date) => lisbon.format(typeof iso === 'string' ? new Date(iso) : iso);
export function addDays(day: string, n: number): string {
  const t = Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12) + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}
export const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
export const procedureDeadline = (serviceDay: string) => addDays(serviceDay, REVIEW_DEADLINE_DAYS);

/** "a, b e c". */
export function joinPt(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}
export const missingText = (missing: ProcedureItem[]) => joinPt(missing.map(i => ITEM_LABEL[i]));

/** O procedimento conta neste serviço: a equipa recebeu a mensagem do bot e o dia é a partir do início da regra. */
export function procedureApplies(rec: Pick<ProcedureRecord, 'team' | 'service_day' | 'prompted_at'> | null | undefined): boolean {
  return !!rec?.prompted_at && rec.service_day >= procedureFrom(rec.team);
}

/**
 * O estado do procedimento visto no fim de `endedDay` (o último dia já acabado:
 * nas contas da noite, o dia das contas; no painel, ontem). Fecha no fim do 7.º
 * dia. O que chega depois do prazo não conta; uma avaliação abaixo de 4
 * estrelas também não.
 */
export function checkProcedure(rec: ProcedureRecord, reviews: ProcedureReview[], endedDay: string): ProcedureCheck {
  const deadline = procedureDeadline(rec.service_day);
  const inTime = (at: string | null) => !!at && lisbonDayOf(at) <= deadline;
  const before = !!rec.before_msg_id && inTime(rec.before_at);
  const after = !!rec.after_msg_id && inTime(rec.after_at);
  const video = !!rec.video_msg_id && inTime(rec.video_at);
  const review = reviews.some(r => !r.excluded && r.stars >= REVIEW_MIN_STARS && lisbonDayOf(r.reviewed_at) <= deadline);
  const missing = (['before', 'after', 'video', 'review'] as const).filter(k => !{ before, after, video, review }[k]);
  const status: ProcedureStatus = missing.length === 0 ? 'completo' : endedDay >= deadline ? 'fechado' : 'em_curso';
  return {
    before, after, video, review, missing: [...missing], deadline, status,
    pay: status === 'em_curso' ? null : procedurePay({ before, after, video, review }),
  };
}

/** O que a equipa mandou em resposta: vídeo, ou fotografia (a legenda "antes"/"depois" decide; sem ela, a primeira é antes). */
export type MediaKind = 'image' | 'video';
export function slotForMedia(rec: Pick<ProcedureRecord, 'before_msg_id' | 'after_msg_id'>, kind: MediaKind, caption: string | null | undefined): 'before' | 'after' | 'video' {
  if (kind === 'video') return 'video';
  const c = (caption ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (/\bdepois\b|\bafter\b|\bdps\b/.test(c)) return 'after';
  if (/\bantes\b|\bbefore\b/.test(c)) return 'before';
  return rec.before_msg_id ? 'after' : 'before';
}

export interface PromptFacts {
  /** "Ana, Paranhos". */
  label: string;
  /** "Limpeza de sofá de 3 lugares"; pode faltar. */
  what?: string | null;
  team: string;
  serviceDay: string;
  /** "15h", a hora de início. */
  time?: string | null;
  /** O primeiro nome do cliente, para a mensagem que a equipa lhe reencaminha. */
  firstName?: string | null;
}

const serviceName = (f: Pick<PromptFacts, 'label' | 'what'>) => `${f.label}${f.what ? ` (${f.what})` : ''}`;

/**
 * A mensagem que cada pessoa da equipa recebe quando o serviço acaba. Logo a
 * seguir vai, sozinha, a de `procedureClientMessage`, para a equipa a
 * reencaminhar ao cliente (dono, 2026-10-14). Sem emojis nem travessões.
 */
export function procedurePromptMessage(f: PromptFacts): string {
  return [
    `Serviço terminado: ${serviceName(f)}, ${dm(f.serviceDay)}${f.time ? ` às ${f.time}` : ''}.`,
    '',
    'Responde a esta mensagem com a fotografia de antes, a fotografia de depois e o vídeo.',
    '',
    `A mensagem a seguir é para mandares ao cliente: reencaminha-a ou copia-a. O prazo para a avaliação é ${dm(procedureDeadline(f.serviceDay))}. Obrigado!`,
  ].join('\n');
}

/**
 * O pedido de avaliação que a equipa reencaminha ao cliente: o primeiro nome, o
 * serviço feito e o link da ficha certa (Lisboa para as equipas de Lisboa, Porto
 * para as outras). A frase dos 10% é do dono (14/10: "não é para tirar a
 * frase"), avisado de que o Google não permite ofertas em troca de avaliações.
 */
export function procedureClientMessage(f: Pick<PromptFacts, 'firstName' | 'what' | 'team'>): string {
  const name = (f.firstName ?? '').trim();
  const what = (f.what ?? '').trim();
  const service = what ? `do serviço (${what.charAt(0).toLowerCase()}${what.slice(1)})` : 'do serviço';
  return [
    `Olá${name ? ` ${name}` : ''}, obrigado por nos ter recebido hoje! Esperamos que tenha gostado do resultado ${service}. Se ficou contente com o trabalho, uma avaliação no Google ajuda-nos muito e ajuda outros clientes a escolher. Demora menos de um minuto:`,
    REVIEW_LINKS[reviewProfileOfTeam(f.team)],
    'Como agradecimento, fica com 10% de desconto no próximo serviço.',
    '',
    'E se quiser ver mais antes e depois dos nossos trabalhos, siga-nos no Instagram:',
    INSTAGRAM_URL,
    'Obrigado!',
  ].join('\n');
}

/** A resposta do bot depois de receber fotografias ou vídeo. */
export function procedureReceiptMessage(label: string, received: ProcedureItem[], check: Pick<ProcedureCheck, 'missing' | 'deadline'>): string {
  const got = received.length ? `Recebido para ${label}: ${missingText(received)}.` : `Para ${label}:`;
  const media = check.missing.filter(i => i !== 'review');
  if (media.length) return `${got} Falta: ${missingText(media)}.${check.missing.includes('review') ? ` E a avaliação do cliente até ${dm(check.deadline)}.` : ''}`;
  if (check.missing.includes('review')) return `${got} Fotografias e vídeo completos, obrigado. Falta só a avaliação do cliente até ${dm(check.deadline)}.`;
  return `${got} Procedimento completo, obrigado!`;
}

/** Lembretes: no dia a seguir ao serviço e no 5.º dia, às 10h de Lisboa, se faltar alguma coisa. */
export const REMINDER_DAYS = [1, 5] as const;
export const REMINDER_HOUR = 10;

/** Qual lembrete toca agora (índice em REMINDER_DAYS), ou null. */
export function reminderDue(rec: Pick<ProcedureRecord, 'service_day' | 'reminders_sent' | 'prompted_at'>, check: Pick<ProcedureCheck, 'missing' | 'status'>, now: Date): number | null {
  if (!rec.prompted_at || check.status !== 'em_curso' || check.missing.length === 0) return null;
  const today = lisbonDayOf(now);
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour: '2-digit', hourCycle: 'h23' }).format(now));
  if (hour < REMINDER_HOUR) return null;
  let due: number | null = null;
  REMINDER_DAYS.forEach((d, i) => { if (i >= rec.reminders_sent && today >= addDays(rec.service_day, d)) due = i; });
  return due;
}

export function procedureReminderMessage(label: string, check: Pick<ProcedureCheck, 'missing' | 'deadline'>, serviceDay: string): string {
  const media = check.missing.filter(i => i !== 'review');
  const lines = [`Lembrete do serviço ${label}, ${dm(serviceDay)}. Falta: ${missingText(check.missing)}.`];
  if (media.length) lines.push('Responde à mensagem desse serviço com o que falta.');
  if (check.missing.includes('review')) lines.push('Se o cliente ainda não avaliou, manda-lhe outra vez o link.');
  lines.push(`Prazo: ${dm(check.deadline)}.`);
  return lines.join(' ');
}

/** O prazo acabou com alguma coisa em falta; a percentagem vem de procedurePay (check.pay). */
export function procedureClosedMessage(label: string, serviceDay: string, missing: ProcedureItem[], pay?: ProcedurePay | null): string {
  const share = pay ? ` Neste serviço a equipa fica com ${pay.teamShare}%${pay.bonus ? ` + ${pay.bonus}€` : ''}.` : '';
  return `O prazo do serviço ${label}, ${dm(serviceDay)}, acabou sem ${missingText(missing)}. O procedimento deste serviço ficou incompleto.${share}`;
}

/** Quando a equipa manda uma fotografia sem responder à mensagem de um serviço. */
export const PROCEDURE_NOT_A_REPLY_MESSAGE =
  'Para não misturar serviços, manda as fotografias e o vídeo em resposta à mensagem do serviço: carrega nessa mensagem, escolhe Responder e envia.';

/**
 * O que uma linha de serviço da agenda diz para a mensagem: "Limpeza de sofá"
 * do título ("Serviço 45€ (89€) (anúncio) Limpeza de sofá - 9… - Ana Silva - Rua…")
 * e o primeiro nome. Usado quando o CRM ainda não tem a linha.
 */
export function factsFromTitle(summary: string): { what: string | null; firstName: string | null } {
  const parts = summary.split(/\s+-\s+/).map(s => s.trim());
  const what = (parts[0] ?? '')
    .replace(/^(a confirmar\s*·\s*)?(servi[cç]o|limpeza)\b/i, m => (/limpeza/i.test(m) ? 'Limpeza' : ''))
    .replace(/\d+(?:[.,]\d+)?\s*€/g, '')
    .replace(/\((?:\s*|an[uú]ncio[^)]*)\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const nameish = parts.slice(1).find(p => /^[\p{L} '.]+$/u.test(p) && p.split(/\s+/).length <= 4 && !/^(rua|av|avenida|travessa|largo|praça|estrada)\b/i.test(p));
  return { what: what || null, firstName: nameish ? nameish.split(/\s+/)[0] : null };
}

/**
 * O que o procedimento muda nas contas de um serviço, em euros: positivo = a
 * equipa deve isso a mais ao dono (os 5% de 50% → 45%), negativo = o dono deve
 * à equipa (o bónus da avaliação). 0 enquanto o prazo corre, sem a mensagem do
 * bot (`procedureApplies`) ou com PROCEDURE_PAY_ENABLED desligado. É a única
 * ligação entre o procedimento e as contas da noite (teamAccounts.ts).
 */
export function procedureAccountDelta(
  rec: ProcedureRecord | null | undefined, reviews: ProcedureReview[], date: string, billed: number,
  enabled = PROCEDURE_PAY_ENABLED,
): { delta: number; check: ProcedureCheck | null } {
  if (!enabled || !rec || !procedureApplies(rec)) return { delta: 0, check: null };
  const check = checkProcedure(rec, reviews, date);
  if (!check.pay) return { delta: 0, check };
  const lost = ((PROCEDURE_FULL_SHARE - check.pay.teamShare) / 100) * billed;
  return { delta: Math.round((lost - check.pay.bonus) * 100) / 100, check };
}

export interface ProcedureStatusChange { calendar_event_id: string; status: ProcedureStatus; closed_at: string | null }

/** Os procedimentos cujo estado guardado já não é o calculado no fim de `endedDay` (para a tabela e o painel). */
export function procedureStatusChanges(
  records: ProcedureRecord[], reviews: (ProcedureReview & { service_request_id: string | null })[], endedDay: string, nowIso: string,
): ProcedureStatusChange[] {
  const out: ProcedureStatusChange[] = [];
  for (const rec of records) {
    if (!rec.prompted_at) continue;
    const own = rec.service_request_id ? reviews.filter(r => r.service_request_id === rec.service_request_id) : [];
    const { status } = checkProcedure(rec, own, endedDay);
    if (status === rec.status) continue;
    out.push({ calendar_event_id: rec.calendar_event_id, status, closed_at: status === 'em_curso' ? null : rec.closed_at ?? nowIso });
  }
  return out;
}

export interface ProcedureWeekTeam {
  /** Segunda-feira da semana (dia do serviço). */
  week: string;
  team: string;
  services: number;
  /** Fotografia de antes, de depois e vídeo. */
  media: number;
  review: number;
  complete: number;
  /** Prazo ainda a correr e alguma coisa em falta. */
  open: number;
  /** Prazo acabado com alguma coisa em falta. */
  closedIncomplete: number;
}

const mondayOf = (day: string) => {
  const t = Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12);
  return addDays(day, -((new Date(t).getUTCDay() + 6) % 7));
};

/** Resumo por semana e por equipa dos serviços com a mensagem do bot (aba Avaliações do CRM). */
export function procedureWeeklySummary(
  records: ProcedureRecord[], reviewsOf: (rec: ProcedureRecord) => ProcedureReview[], endedDay: string,
): ProcedureWeekTeam[] {
  const map = new Map<string, ProcedureWeekTeam>();
  for (const rec of records) {
    if (!rec.prompted_at) continue;
    const c = checkProcedure(rec, reviewsOf(rec), endedDay);
    const week = mondayOf(rec.service_day);
    const key = `${week}|${rec.team}`;
    const row = map.get(key) ?? { week, team: rec.team, services: 0, media: 0, review: 0, complete: 0, open: 0, closedIncomplete: 0 };
    row.services++;
    if (c.before && c.after && c.video) row.media++;
    if (c.review) row.review++;
    if (c.status === 'completo') row.complete++;
    else if (c.status === 'em_curso') row.open++;
    else row.closedIncomplete++;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.week.localeCompare(a.week) || a.team.localeCompare(b.team));
}

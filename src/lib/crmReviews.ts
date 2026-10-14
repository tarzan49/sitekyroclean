// Aba "Avaliações" do CRM (dono, 2026-10-14): se cada serviço teve avaliação no
// Google e, mês a mês, se as avaliações estão a crescer. As avaliações vivem na
// tabela google_reviews (uma linha por avaliação das duas fichas, com a data
// exata do Google); um serviço teve avaliação quando uma linha aponta para ele.
//
// Regra das equipas (dono, mesma data): contam as avaliações de 4 e 5 estrelas;
// se começarem a aparecer muitas de 4, passa a contar só as de 5. Mudar isso é
// mudar REVIEW_MIN_STARS.
import { lisbonDay, shiftMonth } from './crmClosings';

export const REVIEW_MIN_STARS = 4;

/** Prazo da equipa para o cliente avaliar, a contar do dia do serviço (dono, 2026-10-14, todas as equipas). */
export const REVIEW_DEADLINE_DAYS = 7;

/**
 * Metas do mês por ficha (dono, 2026-10-14): o total que a ficha mostra no
 * Google no último dia do mês, contando todas as avaliações (é o número que o
 * Google mostra). Lisboa: 60 (50€ a cada um da equipa Lisboa); Porto: 170
 * (50€ a cada um do Porto 1). A ficha do Porto também recebe as do Algarve,
 * de Braga e de Coimbra.
 */
export const REVIEW_GOALS: { profile: ReviewProfile; month: string; total: number; reward: string }[] = [
  { profile: 'porto', month: '2026-10', total: 170, reward: '50€ a cada um do Porto 1' },
  { profile: 'lisboa', month: '2026-10', total: 60, reward: '50€ a cada um da equipa Lisboa' },
];

export interface GoalProgress { profile: ReviewProfile; month: string; total: number; reward: string; current: number; missing: number }

/** Quanto falta para cada meta do mês: todas as avaliações da ficha até agora (as excluídas também, o Google conta-as). */
export function goalProgress(reviews: GoogleReview[], month: string): GoalProgress[] {
  return REVIEW_GOALS.filter(g => g.month === month).map(g => {
    const current = reviews.filter(r => r.profile === g.profile && reviewMonth(r) <= month).length;
    return { ...g, current, missing: Math.max(0, g.total - current) };
  });
}

export type ReviewProfile = 'porto' | 'lisboa';

export interface GoogleReview {
  review_id: string;
  profile: ReviewProfile;
  author: string;
  stars: number;
  reviewed_at: string;
  service_request_id: string | null;
  /** Da equipa ou da família: não conta em nada. */
  excluded: string | null;
}

export interface ReviewService {
  id: string;
  request_date: string;
  client_name: string | null;
  city: string | null;
  locality: string | null;
  billed_value: number;
}

export interface MonthReviewStats {
  month: string;
  count: number;
  porto: number;
  lisboa: number;
  five: number;
  four: number;
  low: number;
  /** Média das estrelas; null sem avaliações. */
  average: number | null;
  /** Diferença para o mês anterior; null no primeiro mês. */
  change: number | null;
  /** Todas as avaliações até ao fim do mês. */
  cumulative: number;
}

export const reviewCounts = (r: Pick<GoogleReview, 'stars'>) => r.stars >= REVIEW_MIN_STARS;
const counted = (reviews: GoogleReview[]) => reviews.filter(r => !r.excluded);
export const reviewMonth = (r: Pick<GoogleReview, 'reviewed_at'>) => lisbonDay(r.reviewed_at).slice(0, 7);

/** Um mês por linha, do primeiro com avaliações até `untilMonth`, sem saltar meses vazios. */
export function monthlyReviewStats(reviews: GoogleReview[], untilMonth: string): MonthReviewStats[] {
  const rows = counted(reviews);
  if (rows.length === 0) return [];
  const byMonth = new Map<string, GoogleReview[]>();
  for (const r of rows) {
    const m = reviewMonth(r);
    byMonth.set(m, [...(byMonth.get(m) ?? []), r]);
  }
  const first = [...byMonth.keys()].sort()[0];
  const out: MonthReviewStats[] = [];
  let cumulative = 0;
  for (let m = first; m <= untilMonth; m = shiftMonth(m, 1)) {
    const list = byMonth.get(m) ?? [];
    cumulative += list.length;
    const prev = out[out.length - 1];
    out.push({
      month: m,
      count: list.length,
      porto: list.filter(r => r.profile === 'porto').length,
      lisboa: list.filter(r => r.profile === 'lisboa').length,
      five: list.filter(r => r.stars === 5).length,
      four: list.filter(r => r.stars === 4).length,
      low: list.filter(r => r.stars <= 3).length,
      average: list.length ? Math.round((list.reduce((s, r) => s + r.stars, 0) / list.length) * 100) / 100 : null,
      change: prev ? list.length - prev.count : null,
      cumulative,
    });
  }
  return out;
}

export interface ServiceReviewRow {
  service: ReviewService;
  review: GoogleReview | null;
}

export interface ServiceReviewSummary {
  rows: ServiceReviewRow[];
  services: number;
  /** Serviços com uma avaliação que conta (4 ou 5 estrelas). */
  withReview: number;
  /** Serviços com avaliação abaixo de 4 estrelas. */
  lowReview: number;
  /** % de serviços com avaliação que conta; null sem serviços. */
  rate: number | null;
}

/** Os serviços do mês (dia do serviço) e a avaliação de cada um. Revisitas a 0€ ficam de fora. */
export function serviceReviews(services: ReviewService[], reviews: GoogleReview[], month: string): ServiceReviewSummary {
  const byService = new Map<string, GoogleReview>();
  for (const r of counted(reviews)) {
    if (!r.service_request_id) continue;
    const prev = byService.get(r.service_request_id);
    if (!prev || r.stars > prev.stars) byService.set(r.service_request_id, r);
  }
  const rows = services
    .filter(s => s.request_date.startsWith(month) && (Number(s.billed_value) || 0) > 0)
    .sort((a, b) => a.request_date.localeCompare(b.request_date))
    .map(service => ({ service, review: byService.get(service.id) ?? null }));
  const withReview = rows.filter(r => r.review && reviewCounts(r.review)).length;
  const lowReview = rows.filter(r => r.review && !reviewCounts(r.review)).length;
  return {
    rows,
    services: rows.length,
    withReview,
    lowReview,
    rate: rows.length ? Math.round((withReview / rows.length) * 1000) / 10 : null,
  };
}

/** Avaliações do mês que ainda não estão ligadas a nenhum serviço. */
export function unlinkedReviews(reviews: GoogleReview[], month: string): GoogleReview[] {
  return counted(reviews)
    .filter(r => !r.service_request_id && reviewMonth(r) === month)
    .sort((a, b) => a.reviewed_at.localeCompare(b.reviewed_at));
}

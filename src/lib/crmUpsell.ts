// Upsell no CRM (dono, 2026-10-06): o que uma equipa vende a mais no próprio
// serviço. O dono escreve o valor; a divisão é 70% para a equipa e 30% para
// ele, e no Porto 60% / 40%. A equipa fica sempre com a parte maior.
//
// Desde 19/10/2026 (guião das equipas, dono, 13/10/2026), igual em todas as
// equipas, Porto incluído, por escalões: 70% dos primeiros 100€ de cada upsell
// para a equipa e 60% do que passar disso (150€ dão 100€ à equipa). Conta o dia
// do serviço; os upsells de antes ficam com a regra de antes.

/** As equipas do script dos calendários (`google-apps-script/calendario-equipas/`). */
export const UPSELL_TEAMS = ['Porto 1', 'Porto 2', 'Porto 3', 'Braga', 'Lisboa 1', 'Lisboa 2', 'Algarve', 'Coimbra'] as const;
export type UpsellTeam = (typeof UPSELL_TEAMS)[number];

/** Parte da equipa, de 0 a 1. */
export function teamShareOf(team: UpsellTeam): number {
  return team.startsWith('Porto') ? 0.6 : 0.7;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Primeiro dia (do serviço) com a divisão por escalões do guião das equipas. */
export const UPSELL_TIERS_FROM = '2026-10-19';
export const UPSELL_TIER_LIMIT = 100;
export const UPSELL_TIER_SHARES = { upTo: 0.7, above: 0.6 } as const;

export const tieredUpsell = (day: string | null | undefined) => !!day && day >= UPSELL_TIERS_FROM;

export function splitUpsell(value: number, team: UpsellTeam, day?: string | null): { team: number; owner: number } {
  const teamPart = tieredUpsell(day)
    ? round2(Math.min(value, UPSELL_TIER_LIMIT) * UPSELL_TIER_SHARES.upTo + Math.max(0, value - UPSELL_TIER_LIMIT) * UPSELL_TIER_SHARES.above)
    : round2(value * teamShareOf(team));
  return { team: teamPart, owner: round2(value - teamPart) };
}

/** A regra em palavras, para o ecrã. */
export const upsellRuleLabel = (team: UpsellTeam, day?: string | null) => {
  if (tieredUpsell(day)) return '70% até 100€, 60% acima';
  const t = Math.round(teamShareOf(team) * 100);
  return `${t}/${100 - t}`;
};

/** Equipa proposta quando a linha ainda não tem uma: a primeira da região. */
export function defaultTeamFor(locality: string | null | undefined): UpsellTeam {
  return UPSELL_TEAMS.find(t => locality && t.startsWith(locality)) ?? 'Porto 1';
}

export const isUpsellTeam = (s: string | null | undefined): s is UpsellTeam =>
  !!s && (UPSELL_TEAMS as readonly string[]).includes(s);

export interface UpsellRow {
  upsell_value: number | null;
  upsell_team: string | null;
  locality: string | null;
  /** Dia do serviço: decide a regra (escalões desde UPSELL_TIERS_FROM). */
  request_date?: string | null;
}

/** A parte do dono no upsell de uma linha; soma-se ao "Meu cut" (dono, 2026-10-06). */
export function ownerUpsellOf(r: UpsellRow): number {
  const value = Number(r.upsell_value) || 0;
  if (value <= 0) return 0;
  return splitUpsell(value, isUpsellTeam(r.upsell_team) ? r.upsell_team : defaultTeamFor(r.locality), r.request_date).owner;
}

/** Cor do upsell no painel, para não se confundir com o dourado do cut. */
export const UPSELL_TEXT = 'text-violet-600';

export interface TeamUpsellTotals { team: UpsellTeam; count: number; value: number; teamPart: number; ownerPart: number }

/** Totais por equipa; linhas sem upsell não entram. Sem equipa escrita, conta a da região. */
export function summarizeUpsells(rows: UpsellRow[]) {
  const byTeam = new Map<UpsellTeam, TeamUpsellTotals>(
    UPSELL_TEAMS.map(team => [team, { team, count: 0, value: 0, teamPart: 0, ownerPart: 0 }]),
  );
  for (const r of rows) {
    const value = Number(r.upsell_value) || 0;
    if (value <= 0) continue;
    const team = isUpsellTeam(r.upsell_team) ? r.upsell_team : defaultTeamFor(r.locality);
    const split = splitUpsell(value, team, r.request_date);
    const t = byTeam.get(team)!;
    t.count += 1;
    t.value = round2(t.value + value);
    t.teamPart = round2(t.teamPart + split.team);
    t.ownerPart = round2(t.ownerPart + split.owner);
  }
  const teams = [...byTeam.values()].filter(t => t.count > 0);
  const sum = (k: 'count' | 'value' | 'teamPart' | 'ownerPart') => round2(teams.reduce((s, t) => s + t[k], 0));
  return { teams, count: sum('count'), value: sum('value'), teamPart: sum('teamPart'), ownerPart: sum('ownerPart') };
}

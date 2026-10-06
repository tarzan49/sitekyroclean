// Upsell no CRM (dono, 2026-10-06): o que uma equipa vende a mais no próprio
// serviço. O dono escreve o valor; a divisão é 70% para a equipa e 30% para
// ele, e no Porto 60% / 40%. A equipa fica sempre com a parte maior.

/** As equipas do script dos calendários (`google-apps-script/calendario-equipas/`). */
export const UPSELL_TEAMS = ['Porto 1', 'Porto 2', 'Braga', 'Lisboa 1', 'Lisboa 2', 'Algarve'] as const;
export type UpsellTeam = (typeof UPSELL_TEAMS)[number];

/** Parte da equipa, de 0 a 1. */
export function teamShareOf(team: UpsellTeam): number {
  return team.startsWith('Porto') ? 0.6 : 0.7;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function splitUpsell(value: number, team: UpsellTeam): { team: number; owner: number } {
  const teamPart = round2(value * teamShareOf(team));
  return { team: teamPart, owner: round2(value - teamPart) };
}

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
}

/** A parte do dono no upsell de uma linha; soma-se ao "Meu cut" (dono, 2026-10-06). */
export function ownerUpsellOf(r: UpsellRow): number {
  const value = Number(r.upsell_value) || 0;
  if (value <= 0) return 0;
  return splitUpsell(value, isUpsellTeam(r.upsell_team) ? r.upsell_team : defaultTeamFor(r.locality)).owner;
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
    const split = splitUpsell(value, team);
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

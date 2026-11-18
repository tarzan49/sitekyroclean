// Upsert só do que mudou (Disk IO do Supabase, 18 Nov): reenviar linhas iguais
// regrava-as no disco (504 mil escritas num mês em 881 conversas). Compara com o
// que já está gravado e devolve só as linhas novas ou diferentes.
type Row = Record<string, unknown>;

const same = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  const ta = typeof a === "string" ? Date.parse(a) : NaN;
  const tb = typeof b === "string" ? Date.parse(b) : NaN;
  if (typeof a === "string" && typeof b === "string" && /^\d{4}-\d\d-\d\dT/.test(a) && !Number.isNaN(ta) && ta === tb) return true;
  if (typeof a === "number" || typeof b === "number") return Number(a) === Number(b);
  return JSON.stringify(a) === JSON.stringify(b);
};

export function changedRows(incoming: Row[], existing: Row[], keys: string[], ignore: string[] = ["updated_at"]): Row[] {
  const keyOf = (r: Row) => keys.map(k => String(r[k])).join("|");
  const byKey = new Map(existing.map(r => [keyOf(r), r]));
  return incoming.filter(r => {
    const old = byKey.get(keyOf(r));
    if (!old) return true;
    return Object.keys(r).some(c => !ignore.includes(c) && !same(r[c], old[c]));
  });
}

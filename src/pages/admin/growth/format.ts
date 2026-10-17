// Formatos do separador Crescimento.

export const euro = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;
export const euro2 = (n: number) => `${n.toFixed(2).replace(".", ",")}€`;
export const signedEuro = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString("pt-PT")}€`;
export const signedNum = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString("pt-PT")}`;
export const one = (n: number) => n.toLocaleString("pt-PT", { maximumFractionDigits: 1 });
export const pct = (n: number | null) => (n === null ? "–" : `${Math.round(n * 100)}%`);
export const signedPct = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n * 100))}%`;
export const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

/** Variação relativa; null sem termo de comparação. */
export const change = (now: number | null, then: number | null) => (now === null || then === null || then === 0 ? null : now / then - 1);

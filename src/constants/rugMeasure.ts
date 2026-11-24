/**
 * One side of a rug or carpet, as the client typed it, in metres.
 *
 * The quiz asks for metres, but people often type centimetres: "230" and "160"
 * for a 2,30 × 1,60 m rug (owner, 10 Oct 2026). Read as metres that was a
 * 368 m² rug, and the order of 7 Oct (133 × 190 "m", 25 270 m²) even got a pickup
 * fee. No rug, and no room, has a side above RUG_SIDE_MAX_METERS, so anything
 * larger is centimetres. Between RUG_SIDE_DOUBTFUL_METERS and that limit the
 * value is kept, but flagged for the bot and the owner to confirm.
 *
 * Shared by the quiz (area, receipt, CRM details), the bot's quote
 * (`botQuote.ts`) and the order summary the bot reads (`quizOrder.ts`), so the
 * three always agree on what a measure means. No `@/` imports: the bot engine
 * bundle reads it.
 */
export const RUG_SIDE_MAX_METERS = 20;
export const RUG_SIDE_DOUBTFUL_METERS = 8;

export interface RugSide {
  meters: number;
  /** The client typed centimetres ("230" → 2,3 m). */
  fromCm: boolean;
  /** Plausible as metres but unusual for a rug (8 to 20 m): confirm before quoting. */
  doubtful: boolean;
}

/** A wall-to-wall carpet side goes up to 50 m (the site's CarpetPricePicker goes that far): 25 is 25 m, never 25 cm. */
export const CARPET_SIDE_MAX_METERS = 50;

export function rugSide(raw: string | number | null | undefined, maxMeters = RUG_SIDE_MAX_METERS): RugSide | null {
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').trim().replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > maxMeters) {
    const meters = Math.round(n) / 100;
    return meters > maxMeters ? null : { meters, fromCm: true, doubtful: false };
  }
  return { meters: n, fromCm: false, doubtful: n >= RUG_SIDE_DOUBTFUL_METERS };
}

/** "2,3" / "1,75": metres with a comma, no trailing zeros. */
export const formatMeters = (m: number) => String(Number(m.toFixed(2))).replace('.', ',');

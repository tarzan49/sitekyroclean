// Freguesia name -> served municipality, shared by the quiz's location step
// (locationDetection.ts) and the bot's quote (botQuote.ts, bundled for the
// bot-api Edge Function, so relative imports only and no SEO copy).
import { locationPrices } from '../constants/travel';
import { municipiosComFreguesias } from '../data/freguesiaList';

export const normalizeCity = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// BigDataCloud's `city`/`locality` fields often resolve to the civil parish
// (freguesia) the coordinates fall in, not the municipality \u2014 e.g. someone
// standing in Ramalde gets `city: "Ramalde"` back, which never matches
// locationPrices (keyed by municipality). Built once at module load, not
// per call: freguesia name -> municipality name, only for freguesias whose
// municipality is an actually served/priced city.
// A name shared by parishes of two served municipalities (Santa Clara in
// Coimbra and Lisboa, Serzedo in Gaia and Guimarães) decides nothing on its
// own: the last one used to win, so someone in Santa Clara, Coimbra was sent
// to Lisboa. It is dropped, and the next field (usually the municipality)
// decides.
/**
 * Served parish names that are common all over the country and would decide
 * a place wrongly: "São Pedro" (São Pedro do Estoril is Cascais, and dozens of
 * unserved parishes share it), "Santana" (one in Sesimbra), "Vila Verde" (a
 * Braga municipality), "Bom Sucesso", "Ferreira" (Paços de Ferreira). They
 * came with Figueira da Foz (2026-09-28). The GPS match and the team
 * calendars (calendarServices.ts) skip them; the quiz search still lists them,
 * because there the person picks the municipality shown next to the name.
 */
export const TOO_COMMON_PARISH_NAMES: ReadonlySet<string> = new Set(['São Pedro', 'Santana', 'Vila Verde', 'Bom Sucesso', 'Ferreira'].map(normalizeCity));

export const freguesiaToMunicipio = new Map<string, string>();
const ambiguousParishNames = new Set<string>();
for (const m of municipiosComFreguesias) {
  if (!(m.name in locationPrices)) continue;
  for (const f of m.freguesias) {
    const key = normalizeCity(f.name);
    const previous = freguesiaToMunicipio.get(key);
    if (previous && previous !== m.name) ambiguousParishNames.add(key);
    freguesiaToMunicipio.set(key, m.name);
  }
}
for (const key of [...ambiguousParishNames, ...TOO_COMMON_PARISH_NAMES]) freguesiaToMunicipio.delete(key);

/**
 * For the bot only: each part of a union parish ("Cascais e Estoril",
 * "Carcavelos e Parede") on its own. On 22 Oct 2026 a client wrote
 * "Estoril", the quote came back without a locality and the bot passed a
 * fully priced order to the owner. A part shared by two served
 * municipalities, or one of the too-common names, decides nothing.
 * Kept apart from freguesiaToMunicipio, which the GPS match reads.
 */
export const parishPartToMunicipio = new Map<string, string>();
const ambiguousParts = new Set<string>();
for (const m of municipiosComFreguesias) {
  if (!(m.name in locationPrices)) continue;
  for (const f of m.freguesias) {
    const parts = f.name.replace(/^uni[aã]o das freguesias d[eo]s?\s+/i, '').split(/,\s*|\s+e\s+/);
    if (parts.length < 2) continue;
    for (const part of parts) {
      const key = normalizeCity(part);
      if (key.length < 4) continue;
      const previous = parishPartToMunicipio.get(key);
      if (previous && previous !== m.name) ambiguousParts.add(key);
      parishPartToMunicipio.set(key, m.name);
    }
  }
}
for (const key of [...ambiguousParts, ...TOO_COMMON_PARISH_NAMES]) parishPartToMunicipio.delete(key);

// A região de um serviço cujo texto não a diz (2026-09-28). Ex.: "Limpeza de
// sofá - 936 000 000 - Rua D. João IV 376, 1º, 105", sem cidade nem código
// postal. Duas pistas, por esta ordem:
//
// 1. O telefone: um cliente que já está no CRM com a região confirmada. Se o
//    mesmo número aparecer em regiões diferentes, não decide.
// 2. A rua no mapa (OpenStreetMap, sem chave nem custo). Se todas as respostas
//    derem a mesma região, fica decidido. Se derem regiões diferentes, fica a
//    primeira (a mais relevante para o mapa) e a linha pede confirmação, com a
//    alternativa escrita: "Rua D. João IV" é quase toda no Porto, mas há uma
//    em Famalicão.
//
// Corre no separador CRM, depois de `planCalendarSync`, que fica síncrono e
// testável sem rede.
import {
  localityFromPostalCode, parseServiceEvent, placeByName, streetForMap,
  type CalendarEvent, type CrmLocality,
} from './calendarServices';
import type { SyncPlan } from './calendarSync';

export const UNKNOWN_REGION = 'Região por identificar';

export interface MapHit { postcode: string | null; names: string[] }
export type MapSearch = (street: string) => Promise<MapHit[]>;

/** Nominatim: no máximo um pedido por segundo, e o browser identifica-se pelo Referer. */
export const searchOpenStreetMap: MapSearch = async (street) => {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=pt&addressdetails=1&limit=8&q='
    + encodeURIComponent(street);
  const res = await fetch(url, { headers: { 'Accept-Language': 'pt-PT' } });
  if (!res.ok) throw new Error(`OpenStreetMap ${res.status}`);
  const data = (await res.json()) as Array<{ address?: Record<string, string | undefined> }>;
  return data.map(({ address = {} }) => ({
    postcode: address.postcode ?? null,
    names: [address.city, address.town, address.village, address.municipality, address.suburb].filter((n): n is string => Boolean(n)),
  }));
};

interface Found { locality: CrmLocality; city: string | null; note: string | null }

/** O código postal decide, como no resto do CRM; sem ele, o nome do concelho ou da freguesia. */
export function regionFromHits(hits: MapHit[]): Found | null {
  const found = hits.flatMap(hit => {
    const byName = hit.names.map(placeByName).find(Boolean) ?? null;
    const locality = (hit.postcode ? localityFromPostalCode(hit.postcode) : null) ?? byName?.locality;
    return locality ? [{ locality, city: byName?.city ?? hit.names[0] ?? null }] : [];
  });
  if (!found.length) return null;
  const [first] = found;
  const others = [...new Set(found.map(f => f.locality))].filter(l => l !== first.locality);
  const note = others.length
    ? `Morada encontrada no mapa em ${first.city ?? first.locality} (${first.locality}), mas também existe em ${others.join(', ')}: confirmar`
    : null;
  return { locality: first.locality, city: first.city, note };
}

const digits = (phone: string | null) => (phone ?? '').replace(/\D/g, '').slice(-9);

interface Row {
  id: string;
  phone: string | null;
  city: string | null;
  locality: CrmLocality | null;
  needs_review: string | null;
  calendar_event_id: string | null;
}

/** A região de um cliente anterior com o mesmo telefone, se for uma só. */
export function regionFromPhone(rows: Row[], phone: string | null, excludeId?: string): Found | null {
  const key = digits(phone);
  if (key.length < 9) return null;
  const same = rows.filter(r => r.id !== excludeId && r.locality && !r.needs_review && digits(r.phone) === key);
  const localities = new Set(same.map(r => r.locality));
  if (localities.size !== 1) return null;
  return { locality: same[0].locality!, city: same.find(r => r.city)?.city ?? null, note: null };
}

function withoutUnknown(review: string | null, note: string | null): string | null {
  const parts = (review ?? '').split(' · ').filter(p => p && p !== UNKNOWN_REGION);
  if (note) parts.unshift(note);
  return parts.length ? parts.join(' · ') : null;
}

type Target = {
  phone: string | null;
  city: string | null;
  event: CalendarEvent | undefined;
  review: string | null;
  excludeId?: string;
  apply: (fields: { locality: CrmLocality; city: string | null; needs_review: string | null }) => void;
};

/**
 * Preenche a região das linhas novas do plano e das que já estão no CRM à
 * espera dela. Muda o plano no sítio e devolve quantas resolveu. Um mapa em
 * baixo não trava a sincronização: a linha fica como estava e tenta-se na
 * próxima.
 */
export async function resolveMissingRegions(
  rows: Row[],
  plan: SyncPlan,
  events: CalendarEvent[],
  { search = searchOpenStreetMap, pauseMs = 1100, maxLookups = 10 }: { search?: MapSearch; pauseMs?: number; maxLookups?: number } = {},
): Promise<number> {
  const byId = new Map(events.map(e => [e.id, e]));
  const targets: Target[] = [];

  for (const insert of plan.inserts) {
    if (insert.locality) continue;
    targets.push({
      phone: insert.phone, city: insert.city, event: byId.get(insert.calendar_event_id), review: insert.needs_review,
      apply: f => Object.assign(insert, f),
    });
  }
  const patched = new Map(plan.updates.map(u => [u.id, u]));
  for (const row of rows) {
    const update = patched.get(row.id);
    const locality = update && 'locality' in update.patch ? update.patch.locality : row.locality;
    if (locality || !row.calendar_event_id) continue;
    const review = update?.patch.needs_review !== undefined ? update.patch.needs_review : row.needs_review;
    if (!review?.includes(UNKNOWN_REGION)) continue; // o dono já tratou da linha
    const event = byId.get(row.calendar_event_id);
    // A cidade volta a sair do evento: uma versão antiga do leitor deixou
    // lixo nestas linhas ("Cave esquerda").
    const city = update && 'city' in update.patch ? update.patch.city ?? null : event ? parseServiceEvent(event)?.city ?? null : row.city;
    targets.push({
      phone: update?.patch.phone ?? row.phone, city,
      event, review, excludeId: row.id,
      apply: f => {
        if (update) Object.assign(update.patch, f);
        else plan.updates.push({ id: row.id, patch: { ...f } });
      },
    });
  }

  let resolved = 0;
  let lookups = 0;
  for (const target of targets) {
    let found = regionFromPhone(rows, target.phone, target.excludeId);
    const street = !found && target.event ? streetForMap(target.event) : null;
    if (street && lookups < maxLookups) {
      if (lookups > 0 && pauseMs) await new Promise(r => setTimeout(r, pauseMs));
      lookups++;
      try {
        found = regionFromHits(await search(street));
      } catch {
        found = null;
      }
    }
    if (!found) continue;
    target.apply({ locality: found.locality, city: target.city ?? found.city, needs_review: withoutUnknown(target.review, found.note) });
    resolved++;
  }
  return resolved;
}

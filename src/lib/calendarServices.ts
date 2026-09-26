// Lê um evento de serviço do Google Calendar e devolve a linha do CRM
// (`service_requests`) que o dono escreveria à mão (2026-09-26).
//
// O formato do dono, desde setembro de 2026:
//   "Serviço 70€ (140€) Limpeza de sofá - +351 933 621 863 - Cátia - Rua X 8, 2835-683 Charneca"
// O primeiro valor é a parte dele e o valor entre parênteses é o faturado, a
// mesma leitura da importação de 11/09. Sem parênteses, os dois são iguais.
// A ordem dos segmentos varia (telefone antes ou depois do nome, morada no
// meio), por isso cada segmento é classificado pelo conteúdo e não pela posição.
//
// A região sai do código postal e, sem ele, das cidades de `serviceCatalog.ts`
// (campo `area`) e das freguesias de `freguesiaSeoData.ts`. Não há aqui uma
// lista própria de cidades: uma cidade nova no catálogo passa a ser reconhecida.
import { cities } from '@/data/serviceCatalog';
import { municipiosComFreguesias } from '@/data/freguesiaSeoData';
import { normalizeCity } from '@/lib/locationDetection';

export const CRM_LOCALITIES = ['Porto', 'Lisboa', 'Algarve', 'Braga'] as const;
export type CrmLocality = (typeof CRM_LOCALITIES)[number];

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  startDate: string;
  created: string;
  updated: string;
  status: string;
}

export interface ParsedService {
  request_date: string;
  description: string;
  client_name: string | null;
  phone: string | null;
  city: string | null;
  locality: CrmLocality | null;
  billed_value: number;
  my_cut: number;
  needs_review: string | null;
}

const AREA_TO_LOCALITY: Record<string, CrmLocality> = {
  porto: 'Porto', lisboa: 'Lisboa', algarve: 'Algarve', braga: 'Braga',
};

/** Direção de texto, espaços invisíveis e hífenes tipográficos que o Google Contacts mete à volta dos telefones. */
function clean(text: string): string {
  return text
    .replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, '')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[\u2010-\u2015\u2212]/g, '-');
}

const NUM = String.raw`(?:\d{1,3}(?:\.\d{3})+|\d+)(?:[.,]\d{1,2})?`;
// "70€ (140€)", "70€(140€", "50€/100€", "22,5 (55€)" (sem € na parte do dono).
const AMOUNT = new RegExp(String.raw`(${NUM})\s*(?:€(?:\s*(?:\(\s*(${NUM})\s*€\s*\)?|\/\s*(${NUM})\s*€))?|\(\s*(${NUM})\s*€\s*\)?)`);

function toNumber(value: string): number {
  const plain = /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(value) ? value.replace(/\./g, '') : value;
  return Number(plain.replace(',', '.'));
}

/** Um evento é um serviço se começar por "Serviço" ou "Limpeza" e tiver um valor em euros. */
export function isServiceEvent(summary: string): boolean {
  const text = clean(summary).trim();
  return /^(servico|limpeza)\b/.test(normalizeCity(text.slice(0, 10))) && AMOUNT.test(text);
}

// ── Região ────────────────────────────────────────────────────────────────

/**
 * Pelos quatro primeiros dígitos do código postal, que é o que o dono escreve
 * quase sempre. O Centro (3xxx) é servido pela equipa do Porto e o Alentejo
 * (7xxx) pela de Lisboa, como em `travel.ts`. Braga é 4700–4779 e 4800–4999;
 * 4780–4799 é Santo Tirso e Trofa, do Porto. Leiria (24xx), Beira Interior
 * (6xxx) e ilhas ficam por identificar.
 */
export function localityFromPostalCode(code: string): CrmLocality | null {
  const n = Number(code.slice(0, 4));
  if (!Number.isInteger(n)) return null;
  if (n >= 2400 && n < 2500) return null;
  if (n >= 1000 && n < 3000) return 'Lisboa';
  if (n >= 7000 && n < 8000) return 'Lisboa';
  if (n >= 8000 && n < 9000) return 'Algarve';
  if ((n >= 4700 && n < 4780) || (n >= 4800 && n < 5000)) return 'Braga';
  if (n >= 3000 && n < 6000) return 'Porto';
  return null;
}

interface Place { key: string; name: string; locality: CrmLocality }

/** Um nome que aponte para duas regiões não serve para decidir nenhuma. */
function uniquePlaces(entries: Array<{ name: string; locality: CrmLocality | undefined }>): Place[] {
  const byKey = new Map<string, Place | null>();
  for (const { name, locality } of entries) {
    const key = normalizeCity(name);
    if (!locality || key.length < 4) continue;
    const prev = byKey.get(key);
    if (prev === undefined) byKey.set(key, { key, name: name.trim(), locality });
    else if (prev && prev.locality !== locality) byKey.set(key, null);
  }
  return [...byKey.values()].filter((p): p is Place => p !== null);
}

const municipalityPlaces = uniquePlaces([
  ...cities.map(c => ({ name: c.name, locality: AREA_TO_LOCALITY[c.area] })),
  { name: 'Algarve', locality: 'Algarve' },
]);

/**
 * Freguesias dos concelhos servidos. As uniões entram também pelas partes
 * ("Queluz e Belas" → "Queluz", "Belas"; "Algueirão-Mem Martins" → "Mem
 * Martins"), que é como as pessoas escrevem a morada. Nomes com menos de 4
 * letras ficam de fora ("Sé", "Luz"), por coincidirem com palavras comuns, e
 * um nome que também seja concelho vale como concelho (Felgueiras).
 */
const parishPlaces = (() => {
  const areaOf = new Map<string, CrmLocality | undefined>(cities.map(c => [c.name, AREA_TO_LOCALITY[c.area]]));
  const municipalityKeys = new Set(municipalityPlaces.map(p => p.key));
  const entries: Array<{ name: string; locality: CrmLocality | undefined }> = [];
  for (const m of municipiosComFreguesias) {
    const locality = areaOf.get(m.name);
    for (const f of m.freguesias) {
      entries.push({ name: f.name, locality });
      for (const part of f.name.split(/,\s*|\s+e\s+/)) {
        if (part !== f.name) entries.push({ name: part, locality });
        for (const piece of part.split('-')) if (piece !== part && piece.length >= 5) entries.push({ name: piece, locality });
      }
    }
  }
  return uniquePlaces(entries).filter(p => !municipalityKeys.has(p.key));
})();

export interface KnownPlace { city: string; locality: CrmLocality }

/**
 * O que o próprio dono já escreveu no CRM: "Antas → Porto", "Cacem →
 * Lisboa". Vale mais do que os dados do site, porque há bairros que o site não
 * conhece (Antas, Boavista) e freguesias com o mesmo nome noutra região (há
 * uma Antas em Braga). Uma correção feita no CRM passa a valer para os eventos
 * seguintes.
 */
export function knownPlacesFrom(rows: Array<{ city: string | null; locality: CrmLocality | null; needs_review?: string | null }>): KnownPlace[] {
  return uniquePlaces(rows
    .filter(r => r.city && r.locality && !r.needs_review)
    .map(r => ({ name: r.city!, locality: r.locality! })))
    .map(p => ({ city: p.name, locality: p.locality }));
}

// O nome da rua não é o sítio: "Avenida Zeferino de Oliveira", "Rua Doutor
// Nogueira dos Santos". Corta-se do tipo de via até ao número da porta, à
// vírgula ou ao fim da linha. "Quinta" e "Lugar" ficam de fora de propósito
// (Quinta do Anjo é uma freguesia).
const STREET_NAME = /(^|[\s,.])(rua|r|avenida|av|travessa|tv|largo|praceta|praca|estrada|alameda|urbanizacao|urb|bairro|beco|calcada)[\s.][^,\n\d]*/g;

/** O sítio que acaba mais tarde no texto (a cidade vem no fim da morada); em empate, o nome mais longo. */
function findPlace(text: string, list: Place[]): Place | null {
  const hay = ` ${normalizeCity(text).replace(STREET_NAME, '$1 ').replace(/[^a-z0-9]+/g, ' ')} `;
  let best: { place: Place; end: number } | null = null;
  for (const place of list) {
    const needle = ` ${place.key.replace(/[^a-z0-9]+/g, ' ')} `;
    const at = hay.lastIndexOf(needle);
    if (at < 0) continue;
    const end = at + needle.length;
    if (!best || end > best.end || (end === best.end && place.key.length > best.place.key.length)) best = { place, end };
  }
  return best?.place ?? null;
}

const isKnownPlace = (s: string) => Boolean(findPlace(s, municipalityPlaces) ?? findPlace(s, parishPlaces));

// ── Segmentos ─────────────────────────────────────────────────────────────

const PHONE = /(?:\+|00)351\s*[29](?:[\s-]?\d){8}(?!\d)|(?:\+|00)(?!351)\d{1,3}(?:[\s-]?\d){6,11}(?!\d)|(?<![\d-])[29]\d{2}\s?\d{3}\s?\d{3}(?![\d-])/;

/** Portugueses no formato que o dono usa no CRM ("+351 933 621 863"); estrangeiros como vêm. */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^00/, '');
  const national = digits.length === 9 ? digits : digits.startsWith('351') && digits.length === 12 ? digits.slice(3) : null;
  if (national) return `+351 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  return raw.trim().replace(/\s+/g, ' ').replace(/^00/, '+');
}

const SERVICE_WORDS = /\b(limpeza|impermeabiliza|recolha|entrega|higieniza|lavagem|anti|sofa|sofas|colch|tapete|cadeira|poltrona|alcatifa|carpete|puff|cabeceira|chaise|estofo)/;
const STREET_WORDS = /^(rua|r\.|avenida|av\.?|travessa|tv\.?|largo|praceta|praca|estrada|alameda|urbanizacao|urb\.?|bairro|beco|calcada|quinta|lugar|lote|cp\b|edificio|edf\.?)/;
const POSTAL = /\b(\d{4})-\d{3}\b/;

const isServiceLike = (s: string) => SERVICE_WORDS.test(normalizeCity(s));
const isNameLike = (s: string) => {
  const words = s.split(/\s+/).filter(Boolean);
  return words.length >= 1 && words.length <= 4 && !/\d/.test(s) && /^[\p{L}][\p{L}'.\s-]*$/u.test(s)
    && !isServiceLike(s) && !STREET_WORDS.test(normalizeCity(s)) && !isKnownPlace(s);
};

const tidy = (s: string) => s.replace(/\s+/g, ' ').replace(/^[\s,.;:-]+|[\s,;:-]+$/g, '').trim();
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function parseServiceEvent(event: CalendarEvent, known: KnownPlace[] = []): ParsedService | null {
  const summary = clean(event.summary).trim();
  if (!isServiceEvent(summary)) return null;
  const amount = AMOUNT.exec(summary)!;
  const myCut = toNumber(amount[1]);
  const billed = toNumber(amount[2] ?? amount[3] ?? amount[4] ?? amount[1]);

  const segments = summary.split(/\s+-\s*|\s*-\s+/).map(s => s.trim());
  const head = segments.shift() ?? '';
  // "Serviço" é sempre rótulo. "Limpeza" só é rótulo quando vem logo antes do
  // valor ("Limpeza 50€ (99€) Impermeabilização..."); em "Limpeza de sofá
  // 89€" é a própria descrição.
  let description = tidy(head
    .replace(/^servi[cç]o\b\s*/i, '')
    .replace(/^limpeza\s+(?=\d)/i, '')
    .replace(AMOUNT, ' '));

  let phone: string | null = null;
  let name: string | null = null;
  const address: string[] = [];
  let previousWasPhone = false;

  // Um nome depois de a morada começar só é aceite ao lado de um telefone
  // ("... 2º Esq - Quinta do Anjo - Cp 2950-565" é morada; "... - Beatriz -
  // +351 ..." é nome).
  segments.forEach((raw, i) => {
    let seg = raw;
    const phoneMatch = PHONE.exec(seg);
    if (phoneMatch) {
      phone ??= formatPhone(phoneMatch[0]);
      seg = tidy(seg.replace(phoneMatch[0], ' '));
    }
    const besidePhone = Boolean(phoneMatch) || previousWasPhone || PHONE.test(segments[i + 1] ?? '');
    previousWasPhone = Boolean(phoneMatch);
    if (!seg) return;
    if (!description && isServiceLike(seg)) description = tidy(seg);
    else if (!name && isNameLike(seg) && (address.length === 0 || besidePhone)) name = seg;
    else address.push(seg);
  });

  const addressText = [address.join(', '), clean(event.location)].filter(Boolean).join('\n');
  const fullText = [addressText, head, clean(event.description)].join('\n');

  let city: string | null = null;
  let locality: CrmLocality | null = null;
  const postal = POSTAL.exec(addressText) ?? POSTAL.exec(fullText);
  if (postal) {
    locality = localityFromPostalCode(postal[1]);
    const after = tidy(fullText.slice(fullText.indexOf(postal[0]) + postal[0].length).split(/[\n,]/)[0] ?? '');
    if (after && !/\d/.test(after)) city = after;
  }
  // Por esta ordem: o que o dono já escreveu, concelhos, freguesias. Dentro
  // de cada lista, a morada antes da descrição.
  const tiers: Array<[Place[], boolean]> = [
    [uniquePlaces(known.map(k => ({ name: k.city, locality: k.locality }))), false],
    [municipalityPlaces, false],
    [parishPlaces, true],
  ];
  let guessedFromParish = false;
  search: for (const [list, isParish] of tiers) {
    for (const text of [addressText, head, fullText]) {
      const place = findPlace(text, list);
      if (!place) continue;
      if (!locality) { locality = place.locality; guessedFromParish = isParish; }
      city ??= place.name;
      break search;
    }
  }
  if (!city && address.length > 0) {
    const last = tidy(address[address.length - 1].split(/[\n,]/).pop() ?? '');
    if (last && !/\d/.test(last) && !STREET_WORDS.test(normalizeCity(last))) city = last;
  }

  const review: string[] = [];
  if (!locality) review.push('Região por identificar');
  else if (guessedFromParish) review.push(`Região deduzida pela freguesia (${city}): confirmar`);
  if (myCut > billed) review.push('A tua parte é maior que o faturado');

  return {
    request_date: event.startDate,
    description: capitalize(description),
    client_name: name,
    phone,
    city: city ? capitalize(city) : null,
    locality,
    billed_value: billed,
    my_cut: myCut,
    needs_review: review.length ? review.join(' · ') : null,
  };
}

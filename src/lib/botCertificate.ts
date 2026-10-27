// Certificado de impermeabilização para o bot (dono, 2026-10-27: "quando uma pessoa pedir
// certificado em impermeabilização, começares a enviar esse certificado com um bom design").
// O bot pergunta à `bot-api` `certificate` pelo telefone da conversa; isto escolhe o serviço no
// CRM e diz o que vai no certificado. O PDF é feito no servidor do bot (kyro-bot
// src/bot/certificate.ts), com o desenho do certificado da Tânia (9/10).
//
// Só vale um serviço de impermeabilização já feito (dia do serviço até hoje, em Lisboa), com
// valor, sem "sem impermeabilização" e que não desapareceu do calendário. Premium = 10 anos,
// Essencial = 2. Sem o tratamento escrito no CRM ("Impermeabilização sofá 2 lugares", como nos
// serviços de setembro), o certificado é do dono: a garantia muda de 2 para 10 anos.
// Vai no pacote do bot (botEngine.ts): imports relativos só.

export type CertificateTier = 'premium' | 'essencial';

export interface CertificateServiceRow {
  id: string;
  request_date: string | null;
  description: string | null;
  client_name: string | null;
  city: string | null;
  locality: string | null;
  phone: string | null;
  billed_value: number | string | null;
  calendar_missing_since?: string | null;
}

export interface CertificateFacts {
  serviceRequestId: string;
  serviceDate: string;
  tier: CertificateTier;
  years: number;
  name: string;
  items: string;
  place: string | null;
  team: string | null;
}

export type CertificatePick =
  | { ok: true; certificate: CertificateFacts }
  | { ok: false; reason: 'none' }
  | { ok: false; reason: 'upcoming'; serviceDate: string; tier: CertificateTier | null }
  | { ok: false; reason: 'tier'; serviceDate: string };

export const CERTIFICATE_YEARS: Record<CertificateTier, number> = { premium: 10, essencial: 2 };

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const phoneKey9 = (p: string | null | undefined) => (p ?? '').replace(/\D/g, '').slice(-9);

const WATERPROOF = /impermeabiliz/;
const WITHOUT = /sem impermeabiliz/;

/** Premium, Essencial, or null when the CRM line does not say which. */
export function certificateTier(description: string | null | undefined): CertificateTier | null {
  const d = fold(description ?? '');
  if (!WATERPROOF.test(d) || WITHOUT.test(d)) return null;
  const premium = /\bpremium\b/.test(d), essencial = /\bessencial\b/.test(d);
  return premium === essencial ? null : premium ? 'premium' : 'essencial';
}

const isWaterproofing = (description: string | null | undefined) => {
  const d = fold(description ?? '');
  return WATERPROOF.test(d) && !WITHOUT.test(d);
};

/**
 * What was protected, from the CRM line: "Pré-limpeza e impermeabilização Premium: sofá, 2 puffs…"
 * → "sofá, 2 puffs…"; "Limpeza de 7 tapetes e sofá de 2 lugares, com impermeabilização Premium do
 * sofá" → "sofá"; "… + lavagem de tapete" → only the waterproofed part. Notes in brackets go (they
 * are the owner's: "(cunhada)", "(sofá-cama, +40€)").
 */
export function certificateItems(description: string | null | undefined): string {
  const raw = (description ?? '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const withPart = /,?\s*com impermeabiliza\S*\s*(?:premium|essencial)?\s*(?:d[oa]s?\s+)(.+)$/i.exec(raw);
  if (withPart) return tidy(withPart[1]);
  const parts = raw.split(/\s\+\s|;/).map(s => s.trim()).filter(Boolean);
  const first = parts.findIndex(p => /impermeabiliz/i.test(p));
  const kept = first < 0 ? parts : [parts[first], ...parts.slice(first + 1).filter(p => !/\b(limpeza|lavagem|tratamento)\b/i.test(p))];
  return tidy(kept.join(', '));
}

function tidy(s: string): string {
  const out = s
    .replace(/^(?:pr[ée]-?limpeza|limpeza)\s*(?:e|\+)?\s*/i, '')
    .replace(/\s*(?:\be\s+)?impermeabiliza\S*\s*/gi, ' ')
    .replace(/(?<![\p{L}])(?:premium|essencial)(?![\p{L}])/giu, ' ')
    .replace(/^\s*[:\-–]\s*/, '')
    .replace(/^\s*(?:de|do|da|dos|das)\s+/i, '')
    .replace(/\s+,/g, ',').replace(/\s+/g, ' ').replace(/[\s,.]+$/, '').trim();
  return out;
}

const REGION_TEAMS = new Set(['Porto', 'Lisboa', 'Braga', 'Algarve', 'Coimbra']);

/** The latest done waterproofing service of this phone, or why there is none yet. `today` = AAAA-MM-DD in Lisbon. */
export function pickCertificateService(rows: CertificateServiceRow[], phone: string, today: string): CertificatePick {
  const key = phoneKey9(phone);
  if (key.length < 9) return { ok: false, reason: 'none' };
  const mine = rows
    .filter(r => phoneKey9(r.phone) === key && r.request_date && isWaterproofing(r.description))
    .filter(r => Number(r.billed_value) > 0 && !r.calendar_missing_since)
    .sort((a, b) => String(b.request_date).localeCompare(String(a.request_date)));
  const done = mine.find(r => String(r.request_date) <= today);
  if (!done) {
    const next = [...mine].reverse().find(r => String(r.request_date) > today);
    return next ? { ok: false, reason: 'upcoming', serviceDate: String(next.request_date), tier: certificateTier(next.description) } : { ok: false, reason: 'none' };
  }
  const tier = certificateTier(done.description);
  if (!tier) return { ok: false, reason: 'tier', serviceDate: String(done.request_date) };
  const city = (done.city ?? '').replace(/[.\s]+$/, '').trim();
  return {
    ok: true,
    certificate: {
      serviceRequestId: done.id,
      serviceDate: String(done.request_date),
      tier,
      years: CERTIFICATE_YEARS[tier],
      name: (done.client_name ?? '').trim(),
      items: certificateItems(done.description) || 'Estofos',
      place: city || null,
      team: done.locality && REGION_TEAMS.has(done.locality) ? done.locality : null,
    },
  };
}

/**
 * The name on the certificate. The CRM usually has the first name only ("Marina"); the bot may
 * pass the full name the client wrote in the chat ("Marina da Mata"), taken only when it starts
 * with the CRM's first name, so the model can never put someone else's name on it.
 */
export function certificateName(crmName: string, chatName: unknown): string {
  const crm = crmName.trim();
  const chat = typeof chatName === 'string' ? chatName.replace(/\s+/g, ' ').trim() : '';
  if (!chat || chat.length > 60 || !/^[\p{L}][\p{L}' .-]*$/u.test(chat)) return crm;
  if (!crm) return chat;
  const first = fold(crm.split(' ')[0]);
  return fold(chat).split(' ')[0] === first && chat.length >= crm.length ? chat : crm;
}

/** Items the bot read in the chat (e.g. a piece added after the quote), kept short and plain. */
export function certificateItemsFromChat(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.replace(/\s+/g, ' ').replace(/[<>{}]/g, '').trim();
  return s.length >= 3 && s.length <= 160 ? s : null;
}

/** KYRO-IMP-AAAAMMDD-NN: the next free number of that service day (Tânia's was KYRO-IMP-20261009-01). */
export function certificateNumber(serviceDate: string, taken: string[]): string {
  const base = `KYRO-IMP-${serviceDate.replace(/-/g, '')}-`;
  const used = new Set(taken.filter(n => n.startsWith(base)).map(n => Number(n.slice(base.length))));
  let n = 1;
  while (used.has(n)) n++;
  return `${base}${String(n).padStart(2, '0')}`;
}

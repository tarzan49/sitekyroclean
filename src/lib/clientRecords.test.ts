import { describe, expect, it } from 'vitest';
import {
  clientsCsv,
  contactStats,
  inWindow,
  monthlyStats,
  weeklyStats,
  contactWeek,
  displayName,
  effectiveStatus,
  emptyFilters,
  followUpKind,
  factsFromLabels,
  firstName,
  formatPhone,
  matchesFilters,
  phoneKey,
  servicesByPhone,
  summarizeClient,
  type ClientRow,
  type ClientService,
} from './clientRecords';

// Dados inventados: o repositório é público.
const client = (over: Partial<ClientRow> = {}): ClientRow => ({
  id: 'c1',
  phone: '351900000001',
  name: null,
  whatsapp_name: 'maria teste',
  status: 'por_marcar',
  services: ['Sofá'],
  region: 'Lisboa',
  from_google_ads: true,
  reviewed_google: false,
  labels: [],
  first_contact_at: null,
  last_contact_at: '2026-10-01T10:00:00Z',
  last_client_message_at: null,
  notes: null,
  source: 'WhatsApp',
  ...over,
});

const service = (over: Partial<ClientService> = {}): ClientService => ({
  id: 's1',
  request_date: '2026-09-01',
  description: 'Limpeza sofá 3 lugares',
  billed_value: 79,
  client_name: null,
  city: null,
  phone: '+351 900 000 001',
  ...over,
});

describe('factsFromLabels', () => {
  it('takes the strongest status and ignores invisible marks', () => {
    const f = factsFromLabels(['Por marcar serviço', '‎Concluído', 'Sofá', 'Tapete', 'Porto', 'Google']);
    expect(f.status).toBe('cliente');
    expect(f.services).toEqual(['Sofá', 'Tapete']);
    expect(f.region).toBe('Porto');
    expect(f.fromGoogleAds).toBe(true);
  });

  it('marks a review as a client who reviewed', () => {
    const f = factsFromLabels(['Deu Avaliação Google']);
    expect(f.status).toBe('cliente');
    expect(f.reviewedGoogle).toBe(true);
  });

  it('keeps not-interested and falls back to no status', () => {
    expect(factsFromLabels(['Não está interessado', 'Colchão']).status).toBe('nao_interessado');
    expect(factsFromLabels(['Braga']).status).toBe('sem_estado');
  });
});

describe('phones', () => {
  it('links CRM phones written in any format by the last 9 digits', () => {
    expect(phoneKey('+351 900 000 001')).toBe(phoneKey('351900000001'));
    expect(phoneKey('00351900000001')).toBe('900000001');
    expect(formatPhone('351900000001')).toBe('+351 900 000 001');
    expect(formatPhone('41790000000')).toBe('+41790000000');
  });
});

describe('summary', () => {
  const byPhone = servicesByPhone([
    service({ id: 'a', request_date: '2026-09-10', billed_value: 100 }),
    service({ id: 'b', request_date: '2026-08-01', billed_value: 50, client_name: 'Maria Teste' }),
    service({ id: 'c', phone: null }),
  ]);

  it('adds up the CRM services of that phone, oldest first', () => {
    const s = summarizeClient(client(), byPhone, '2026-10-10');
    expect(s.services.map(r => r.id)).toEqual(['b', 'a']);
    expect(s.totalBilled).toBe(150);
    expect(s.lastServiceDate).toBe('2026-09-10');
    expect(s.daysSinceLastService).toBe(30);
  });

  it('treats someone with a CRM service as a client even if the label lagged', () => {
    const s = summarizeClient(client(), byPhone, '2026-10-10');
    expect(effectiveStatus(client({ status: 'nao_interessado' }), s)).toBe('cliente');
    expect(effectiveStatus(client({ status: 'marcado' }), s)).toBe('marcado');
    expect(effectiveStatus(client(), { services: [] })).toBe('por_marcar');
  });

  it('prefers the owner name, then the CRM name, then WhatsApp', () => {
    const s = summarizeClient(client(), byPhone, '2026-10-10');
    expect(displayName(client(), s.services)).toBe('Maria Teste');
    expect(displayName(client({ name: 'D. Maria' }), s.services)).toBe('D. Maria');
    expect(firstName(client(), [])).toBe('Maria');
    expect(firstName(client({ whatsapp_name: null }), [])).toBe('');
    expect(firstName(client({ whatsapp_name: 'Cliente tapete 8m2' }), [])).toBe('');
    expect(firstName(client({ whatsapp_name: 'Não atender' }), [])).toBe('');
    expect(firstName(client({ whatsapp_name: '.:: Catarina ::.' }), [])).toBe('Catarina');
    expect(firstName(client({ whatsapp_name: 'Tania🥰' }), [])).toBe('Tania');
  });
});

describe('filters and export', () => {
  const none = { services: [], totalBilled: 0, lastServiceDate: null, daysSinceLastService: null };

  it('combines status, item, region and ad origin', () => {
    const f = { ...emptyFilters(), statuses: ['por_marcar' as const], services: ['Sofá'], regions: ['Lisboa'], googleAds: 'yes' as const };
    expect(matchesFilters(client(), none, f)).toBe(true);
    expect(matchesFilters(client({ region: 'Porto' }), none, f)).toBe(false);
    expect(matchesFilters(client({ services: ['Tapete'] }), none, f)).toBe(false);
    expect(matchesFilters(client({ from_google_ads: false }), none, f)).toBe(false);
  });

  it('searches names without accents and phone digits', () => {
    expect(matchesFilters(client({ whatsapp_name: 'João' }), none, { ...emptyFilters(), search: 'joao' })).toBe(true);
    expect(matchesFilters(client(), none, { ...emptyFilters(), search: '000 001' })).toBe(true);
  });

  it('exports first name and quotes cells with commas', () => {
    const csv = clientsCsv([{ client: client({ notes: 'sofá cinza, 3 lugares' }), summary: none }]);
    const [, line] = csv.split('\n');
    expect(line.startsWith('Maria,maria teste,+351900000001,Por marcar,')).toBe(true);
    expect(line).toContain('"sofá cinza, 3 lugares"');
  });
});

describe('evolution', () => {
  const now = new Date('2026-10-06T12:00:00Z');
  const row = (first: string | null, status: ClientRow['status'], wrote = true, ads = false) => ({
    client: { status, first_contact_at: first, last_client_message_at: wrote ? first : null, from_google_ads: ads },
    summary: { services: [] },
  });
  const rows = [
    row('2026-10-01T10:00:00Z', 'cliente', true, true),
    row('2026-09-20T10:00:00Z', 'por_marcar'),
    row('2026-09-10T10:00:00Z', 'marcado', false),
    row('2026-08-15T10:00:00Z', 'nao_interessado'),
    row('2026-06-01T10:00:00Z', 'cliente'),
    row(null, 'cliente'),
  ];

  it('counts close rate over all contacts and over those who wrote', () => {
    const s = contactStats(inWindow(rows, now, 30));
    expect(s).toMatchObject({ contacts: 3, wrote: 2, closed: 2, closedWhoWrote: 1, googleAds: 1 });
    expect(s.closeRate).toBeCloseTo(2 / 3);
    expect(s.messageCloseRate).toBe(0.5);
  });

  it('compares with the previous window of the same length', () => {
    expect(inWindow(rows, now, 30, 1).length).toBe(1);
    expect(inWindow(rows, now, 360).length).toBe(5);
  });

  it('groups every month and every Monday-to-Sunday week of first contact, skipping unknown dates', () => {
    expect(monthlyStats(rows).map(m => [m.key, m.contacts])).toEqual([['2026-06', 1], ['2026-08', 1], ['2026-09', 2], ['2026-10', 1]]);
    expect(weeklyStats(rows).map(w => w.key)).toEqual(['2026-06-01', '2026-08-10', '2026-09-07', '2026-09-14', '2026-09-28']);
    expect(contactWeek('2026-10-04T22:30:00Z')).toBe('2026-09-28'); // domingo 23h30 em Lisboa
    expect(contactWeek('2026-10-04T23:30:00Z')).toBe('2026-10-05'); // já segunda em Lisboa
    expect(contactStats([]).closeRate).toBeNull();
  });
});

describe('follow-ups', () => {
  const today = '2026-10-06';
  const item = (over: Record<string, unknown>, services: ClientService[] = []) => ({
    client: { status: 'por_marcar' as const, last_contact_at: '2026-10-03T10:00:00Z', last_client_message_at: '2026-10-02T10:00:00Z', follow_up_at: null, ...over },
    summary: { services },
  });

  it('shows a dated reminder only from 7 days before', () => {
    expect(followUpKind(item({ follow_up_at: '2026-10-10' }), today)).toEqual({ kind: 'lembrete', days: 4 });
    expect(followUpKind(item({ follow_up_at: '2026-09-30' }), today)).toEqual({ kind: 'lembrete', days: -6 });
    expect(followUpKind(item({ follow_up_at: '2027-01-05' }), today)).toBeNull();
  });

  it('puts the client who wrote last first, then our follow-up, then the season list', () => {
    expect(followUpKind(item({ last_client_message_at: '2026-10-03T10:00:00Z' }), today)?.kind).toBe('a_espera');
    expect(followUpKind(item({}), today)).toEqual({ kind: 'seguimento', days: 3 });
    expect(followUpKind(item({ last_contact_at: '2026-08-01T10:00:00Z' }), today)?.kind).toBe('epoca');
    expect(followUpKind(item({ status: 'nao_interessado' }), today)?.kind).toBe('epoca');
  });

  it('leaves out clients and booked services, and today’s conversations', () => {
    expect(followUpKind(item({ status: 'marcado' }), today)).toBeNull();
    expect(followUpKind(item({}, [service()]), today)).toBeNull();
    expect(followUpKind(item({ last_contact_at: '2026-10-06T09:00:00Z' }), today)).toBeNull();
  });
});

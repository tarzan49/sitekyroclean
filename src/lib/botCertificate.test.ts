import { describe, expect, it } from 'vitest';
import { certificateItems, certificateItemsFromChat, certificateName, certificateNumber, certificateTier, pickCertificateService, type CertificateServiceRow } from './botCertificate';

const row = (o: Partial<CertificateServiceRow>): CertificateServiceRow => ({
  id: 'r1', request_date: '2026-10-19', description: 'Impermeabilização Premium de sofá 3 lugares', client_name: 'Ana',
  city: 'Ericeira', locality: 'Lisboa', phone: '+351 911 222 333', billed_value: 99, calendar_missing_since: null, ...o,
});

describe('certificateTier', () => {
  it('reads the tier the CRM line names', () => {
    expect(certificateTier('Pré-limpeza e impermeabilização Premium: sofá, 2 puffs')).toBe('premium');
    expect(certificateTier('Limpeza e impermeabilização de sofá de 3 lugares premium')).toBe('premium');
    expect(certificateTier('Impermeabilização essencial 1 sofá 3 lugares e 6 cadeiras')).toBe('essencial');
  });
  it('is null without a tier, without waterproofing or with "sem impermeabilização"', () => {
    expect(certificateTier('Impermeabilização sofá 2 lugares')).toBeNull();
    expect(certificateTier('Limpeza de sofá 3 lugares')).toBeNull();
    expect(certificateTier('Limpeza e tratamento enzimático (sem impermeabilização) Premium')).toBeNull();
  });
});

describe('certificateItems', () => {
  it.each([
    ['Pré-limpeza e impermeabilização Premium: sofá, 2 puffs, 2 poltronas e 4 cadeirões', 'sofá, 2 puffs, 2 poltronas e 4 cadeirões'],
    ['Impermeabilização Premium de sofá 3 lugares', 'sofá 3 lugares'],
    ['Impermeabilização Premium sofá 3 lugares (novo)', 'sofá 3 lugares'],
    ['Limpeza de 7 tapetes e sofá de 2 lugares, com impermeabilização Premium do sofá', 'sofá'],
    ['Limpeza e impermeabilização Premium de sofá 3 lugares com chaise + lavagem de tapete 2,20x1,80', 'sofá 3 lugares com chaise'],
    ['Limpeza de colchões, cabeceira e tapete + limpeza e impermeabilização Premium de sofá', 'sofá'],
    ['Limpeza + tratamento de urina + impermeabilização Essencial sofá 2 lugares', 'sofá 2 lugares'],
    ['Limpeza e impermeabilização de sofá de 3 lugares premium', 'sofá de 3 lugares'],
    ['Limpeza de 8 cadeiras e impermeabilização essencial + limpeza de colchão de casal', '8 cadeiras'],
    ['Impermeabilização Premium sofá + limpeza risco marcador no puff', 'sofá'],
    ['Limpeza e impermeabilização Essencial sofá 2 lugares (sofá-cama, +40€)', 'sofá 2 lugares'],
  ])('%s', (description, items) => {
    expect(certificateItems(description)).toBe(items);
  });
});

describe('pickCertificateService', () => {
  const today = '2026-10-27';
  it('takes the latest done waterproofing job of this phone, by its last 9 digits', () => {
    const rows = [
      row({ id: 'old', request_date: '2026-03-01' }),
      row({ id: 'new', request_date: '2026-10-19', description: 'Pré-limpeza e impermeabilização Premium: sofá, 2 puffs', city: 'Pedroso.' }),
      row({ id: 'other', phone: '+351 911 222 334', request_date: '2026-10-25' }),
      row({ id: 'clean', request_date: '2026-10-26', description: 'Limpeza de colchão de casal' }),
    ];
    const r = pickCertificateService(rows, '351911222333@s.whatsapp.net', today);
    expect(r).toEqual({ ok: true, certificate: {
      serviceRequestId: 'new', serviceDate: '2026-10-19', tier: 'premium', years: 10, name: 'Ana',
      items: 'sofá, 2 puffs', place: 'Pedroso', team: 'Lisboa',
    } });
  });
  it('a job still to come is "upcoming" (the certificate is issued on the day)', () => {
    expect(pickCertificateService([row({ request_date: '2026-11-03' })], '911222333', today))
      .toEqual({ ok: false, reason: 'upcoming', serviceDate: '2026-11-03', tier: 'premium' });
  });
  it('skips revisits at 0€, jobs gone from the calendar and "sem impermeabilização"', () => {
    const rows = [
      row({ billed_value: 0 }),
      row({ calendar_missing_since: '2026-10-20T10:00:00Z' }),
      row({ description: 'Limpeza e tratamento enzimático (sem impermeabilização)' }),
    ];
    expect(pickCertificateService(rows, '911222333', today)).toEqual({ ok: false, reason: 'none' });
  });
  it('without the tier in the CRM the owner decides (2 or 10 years)', () => {
    expect(pickCertificateService([row({ description: 'Impermeabilização sofá 2 lugares' })], '911222333', today))
      .toEqual({ ok: false, reason: 'tier', serviceDate: '2026-10-19' });
  });
  it('Essencial is 2 years; a team outside the five regions is left out', () => {
    const r = pickCertificateService([row({ description: 'Impermeabilização essencial sofá', locality: 'Outro' })], '911222333', today);
    expect(r.ok && r.certificate.years).toBe(2);
    expect(r.ok && r.certificate.team).toBeNull();
  });
});

describe('certificateName', () => {
  it('takes the full name from the chat only when it starts with the CRM first name', () => {
    expect(certificateName('Marina', 'Marina da Mata')).toBe('Marina da Mata');
    expect(certificateName('Marina', 'marina da mata')).toBe('marina da mata');
    expect(certificateName('Marina', 'Joana Silva')).toBe('Marina');
    expect(certificateName('Marina', 'Marina <b>')).toBe('Marina');
    expect(certificateName('Tânia Rocha', 'Tânia')).toBe('Tânia Rocha');
    expect(certificateName('', 'Rui Costa')).toBe('Rui Costa');
  });
});

describe('certificateItemsFromChat', () => {
  it('keeps a short plain description and drops markup', () => {
    expect(certificateItemsFromChat('sofá de canto, 2 poltronas e 4 cadeirões')).toBe('sofá de canto, 2 poltronas e 4 cadeirões');
    expect(certificateItemsFromChat('x'.repeat(200))).toBeNull();
    expect(certificateItemsFromChat(42)).toBeNull();
  });
});

describe('certificateNumber', () => {
  it('is the next free number of the service day', () => {
    expect(certificateNumber('2026-10-19', [])).toBe('KYRO-IMP-20261019-01');
    expect(certificateNumber('2026-10-19', ['KYRO-IMP-20261019-01', 'KYRO-IMP-20261009-02'])).toBe('KYRO-IMP-20261019-02');
    expect(certificateNumber('2026-10-19', ['KYRO-IMP-20261019-02'])).toBe('KYRO-IMP-20261019-01');
  });
});

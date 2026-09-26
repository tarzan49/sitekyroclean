import { describe, expect, it } from 'vitest';
import { cities } from '@/data/serviceCatalog';
import { isServiceEvent, knownPlacesFrom, localityFromPostalCode, parseServiceEvent, type CalendarEvent } from './calendarServices';

// Dados inventados: o repositório é público, nenhum cliente real entra aqui.
const event = (summary: string, extra: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'evt1', summary, description: '', location: '', startDate: '2026-10-02',
  created: '2026-09-27T10:00:00Z', updated: '2026-09-27T10:00:00Z', status: 'CONFIRMED', ...extra,
});
const parse = (summary: string, known = [] as Parameters<typeof parseServiceEvent>[1]) => parseServiceEvent(event(summary), known);

describe('isServiceEvent', () => {
  it('accepts the owner format and rejects reminders', () => {
    expect(isServiceEvent('Serviço 70€ (140€) Limpeza de sofá')).toBe(true);
    expect(isServiceEvent('servico 45€(89€) limpeza colchão')).toBe(true);
    expect(isServiceEvent('Limpeza 50€(99€) Impermeabilização poltrona')).toBe(true);
    expect(isServiceEvent('Ligar Ana 912 345 678 follow up 89€')).toBe(false);
    expect(isServiceEvent('Follow up cliente 655€ alcatifa')).toBe(false);
    expect(isServiceEvent('912345678 Ana \nLimpeza 176€ sofá')).toBe(false);
    expect(isServiceEvent('Serviço 11h tapetes')).toBe(false);
  });
});

describe('parseServiceEvent', () => {
  it('reads every field of the usual format', () => {
    expect(parse('Serviço 70€ (140€) Limpeza de sofá de 3 lugares - \u202a+351\u00a0912\u00a0345\u00a0678\u202c - Ana Teste - Rua das Flores 10, 1°Esq. 2835-683 Santo António da Charneca')).toEqual({
      request_date: '2026-10-02',
      description: 'Limpeza de sofá de 3 lugares',
      client_name: 'Ana Teste',
      phone: '+351 912 345 678',
      city: 'Santo António da Charneca',
      locality: 'Lisboa',
      billed_value: 140,
      my_cut: 70,
      needs_review: null,
    });
  });

  it('takes the first value as the owner share and the one in brackets as billed', () => {
    expect(parse('Serviço 32,5€ (65€) Limpeza de colchão - 4400-100 Porto')).toMatchObject({ my_cut: 32.5, billed_value: 65 });
    expect(parse('Serviço 50€/100€ recolha de tapetes - 4400-100 Porto')).toMatchObject({ my_cut: 50, billed_value: 100 });
    expect(parse('Serviço 90€(190€ tapete 20m2 - 4400-100 Porto')).toMatchObject({ my_cut: 90, billed_value: 190 });
    expect(parse('Serviço 22,5 (55€) Limpeza de tapete - 8125-100 Quarteira')).toMatchObject({ my_cut: 22.5, billed_value: 55, description: 'Limpeza de tapete' });
    expect(parse('Serviço 1.200€ (2.400€) Limpeza de alcatifa - 1000-001 Lisboa')).toMatchObject({ my_cut: 1200, billed_value: 2400 });
    expect(parse('Serviço 89€ Limpeza de sofá - 4400-100 Porto')).toMatchObject({ my_cut: 89, billed_value: 89 });
  });

  it('drops the "Serviço"/"Limpeza" label but keeps "Limpeza" when it is the description', () => {
    expect(parse('Limpeza 50€(99€) Impermeabilização poltrona - 8600-100 Lagos')?.description).toBe('Impermeabilização poltrona');
    expect(parse('Limpeza 415€ (590€) Limpeza de 10 cadeiras - 2625-100 Vialonga')?.description).toBe('Limpeza de 10 cadeiras');
    expect(parse('Serviço entrega de tapetes 100€ (199€) - 4400-100 Porto')?.description).toBe('Entrega de tapetes');
  });

  it('classifies segments by content, not by position', () => {
    const r = parse('Serviço 45€(89€) Limpeza sofá 3 lugares - Rua Inventada - 25 - 2º Esq - Quinta do Anjo - Cp 2950-565 - +351 912 345 678 Bruno');
    expect(r).toMatchObject({ client_name: 'Bruno', phone: '+351 912 345 678', locality: 'Lisboa', description: 'Limpeza sofá 3 lugares' });

    const nameBeforePhone = parse('Serviço 115€ (230€) Limpeza de colchões - Carla - 912345678 - Rua Central 6 -Setúbal');
    expect(nameBeforePhone).toMatchObject({ client_name: 'Carla', phone: '+351 912 345 678', city: 'Setúbal', locality: 'Lisboa' });

    const nameAfterAddress = parse('Serviço 40€ (80€) Limpeza tapete - Rua das Flores 25 - Dora - +351 912 345 678');
    expect(nameAfterAddress?.client_name).toBe('Dora');

    const descriptionLater = parse('Serviço 40€(80€) -Rua das Flores porta 25 \n2830-345 Barreiro - limpeza tapete 4m2 - 912 345 678');
    expect(descriptionLater).toMatchObject({ description: 'Limpeza tapete 4m2', city: 'Barreiro', locality: 'Lisboa' });
  });

  it('keeps foreign phone numbers as written', () => {
    expect(parse('Serviço 10€ (20€) Limpeza sofá - \u202a+55 21 91234\u20115678\u202c - Eva - 4400-100 Porto')?.phone).toBe('+55 21 91234-5678');
  });

  it('flags what it cannot decide instead of guessing', () => {
    expect(parse('Serviço 85€ (177€) Limpeza de sofá e 1 poltrona')).toMatchObject({ locality: null, needs_review: 'Região por identificar' });
    expect(parse('Serviço 85€ (25€) Limpeza de tapete - 8000-100 Faro')?.needs_review).toBe('A tua parte é maior que o faturado');
  });

  it('learns places from what the owner already wrote in the CRM', () => {
    const summary = 'Serviço 50€ (100€) Recolha de tapetes Antas';
    const fromSite = parse(summary);
    expect(fromSite?.locality).toBe('Braga'); // há uma freguesia Antas no Minho
    expect(fromSite?.needs_review).toContain('freguesia');
    const known = knownPlacesFrom([{ city: 'Antas', locality: 'Porto' }, { city: 'Gaia', locality: 'Porto' }]);
    expect(parse(summary, known)).toMatchObject({ locality: 'Porto', city: 'Antas', needs_review: null });
  });

  it('does not learn from rows still waiting for review, nor from contradictory ones', () => {
    expect(knownPlacesFrom([
      { city: 'Antas', locality: 'Braga', needs_review: 'Região deduzida pela freguesia (Antas): confirmar' },
      { city: 'Centro', locality: 'Porto' },
      { city: 'Centro', locality: 'Lisboa' },
    ])).toEqual([]);
  });

  it('does not read a street name as the town', () => {
    expect(parse('Serviço 40€ (80€) Limpeza sofá - Rua de Braga 12, Seixal')).toMatchObject({ locality: 'Lisboa', city: 'Seixal' });
  });

  it('recognises every city of the catalog as its own team', () => {
    const team = { porto: 'Porto', lisboa: 'Lisboa', algarve: 'Algarve', braga: 'Braga' } as const;
    for (const c of cities) {
      const r = parse(`Serviço 10€ (20€) Limpeza de sofá - ${c.name}`);
      expect({ city: c.name, locality: r?.locality }).toEqual({ city: c.name, locality: team[c.area as keyof typeof team] });
    }
  });
});

describe('localityFromPostalCode', () => {
  it('maps postal code ranges to the team that serves them', () => {
    expect(localityFromPostalCode('1100')).toBe('Lisboa');
    expect(localityFromPostalCode('2900')).toBe('Lisboa');
    expect(localityFromPostalCode('7520')).toBe('Lisboa'); // Sines
    expect(localityFromPostalCode('3800')).toBe('Porto'); // Aveiro
    expect(localityFromPostalCode('4400')).toBe('Porto');
    expect(localityFromPostalCode('4780')).toBe('Porto'); // Santo Tirso
    expect(localityFromPostalCode('4710')).toBe('Braga');
    expect(localityFromPostalCode('4800')).toBe('Braga'); // Guimarães
    expect(localityFromPostalCode('4900')).toBe('Braga'); // Viana do Castelo
    expect(localityFromPostalCode('8600')).toBe('Algarve');
    expect(localityFromPostalCode('2410')).toBeNull(); // Leiria
    expect(localityFromPostalCode('9000')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { matchServiceCity, searchServiceLocations } from './locationDetection';

describe('service locality matching', () => {
  it('uses the canonical priced locality with accent-insensitive matching', () => {
    expect(matchServiceCity({ countryCode: 'PT', city: 'Povoa de Varzim' })).toBe('Póvoa de Varzim');
  });
  it('does not assume a foreign city with the same name is in Portugal', () => {
    expect(matchServiceCity({ countryCode: 'ES', city: 'Gondomar' })).toBeUndefined();
  });
  it('does not substitute an unserved town with its district', () => {
    expect(matchServiceCity({ countryCode: 'PT', city: 'Baião' })).toBeUndefined();
  });
  it('resolves a civil parish (freguesia) to its served municipality', () => {
    expect(matchServiceCity({ countryCode: 'PT', city: 'Ramalde' })).toBe('Porto');
    expect(matchServiceCity({ countryCode: 'PT', city: 'Gloria' })).toBe('Aveiro');
  });
  it('resolves the new southern parishes to the municipality that carries the travel fee', () => {
    expect(matchServiceCity({ countryCode: 'PT', locality: 'Esmoriz' })).toBe('Ovar');
    expect(matchServiceCity({ countryCode: 'PT', locality: 'Comporta' })).toBe('Alcácer do Sal');
    expect(matchServiceCity({ countryCode: 'PT', locality: 'Porto Covo' })).toBe('Sines');
    // Alvalade existe em Lisboa e em Santiago do Cacém; fica sempre Lisboa.
    expect(matchServiceCity({ countryCode: 'PT', city: 'Alvalade' })).toBe('Lisboa');
  });
});

describe('quiz locality search', () => {
  const cities = (query: string) => searchServiceLocations(query).map(option => option.city);
  it('finds the towns the Google Ads campaigns target (2026-09-26)', () => {
    for (const town of ['Santa Maria da Feira', 'São João da Madeira', 'Ovar', 'Oliveira de Azeméis', 'Sines', 'Grândola', 'Santiago do Cacém', 'Alcácer do Sal']) {
      expect(cities(town), town).toContain(town);
    }
  });
  it('expands the abbreviations people type', () => {
    expect(cities('S. João da Madeira')).toEqual(['São João da Madeira']);
    expect(cities('S Joao da Madeira')).toEqual(['São João da Madeira']);
    expect(cities('Sta. Maria da Feira')).toEqual(['Santa Maria da Feira']);
    expect(cities('Feira')).toContain('Santa Maria da Feira');
    // "Sines" também está em São Bartolomeu de Messines (Silves), que vem depois.
    expect(cities('Sines')[0]).toBe('Sines');
  });
  it('offers a served parish or locality and selects its municipality', () => {
    expect(searchServiceLocations('Comporta')).toEqual([{ city: 'Alcácer do Sal', parish: 'Comporta' }]);
    expect(searchServiceLocations('troia')).toEqual([{ city: 'Grândola', parish: 'Tróia' }]);
    expect(searchServiceLocations('Santo André')).toContainEqual({ city: 'Santiago do Cacém', parish: 'Vila Nova de Santo André' });
  });
  it('lists municipalities first and never repeats the parishes of one already shown', () => {
    const porto = searchServiceLocations('porto');
    expect(porto[0]).toEqual({ city: 'Porto' });
    expect(porto.filter(option => option.city === 'Porto')).toHaveLength(1);
    expect(porto).toContainEqual({ city: 'Sines', parish: 'Porto Covo' });
    expect(searchServiceLocations('Lisboa')).toEqual([{ city: 'Lisboa' }]);
    expect(searchServiceLocations('   ')).toEqual([]);
  });
});

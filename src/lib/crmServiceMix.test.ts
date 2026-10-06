import { describe, expect, it } from 'vitest';
import { itemsOf, servicesOf, summarizeServiceMix, typeOf } from './crmServiceMix';

// Descrições inventadas no formato das do CRM (o repositório é público).
describe('itemsOf', () => {
  it('reconhece os artigos, com e sem acentos', () => {
    expect(itemsOf('Limpeza sofá 3 lugares + 2 tapetes 1,90x2,90')).toEqual(['Sofá', 'Tapete']);
    expect(itemsOf('Limpeza de colchao casal')).toEqual(['Colchão']);
    expect(itemsOf('Limpeza de carpete 6m2')).toEqual(['Tapete']);
    expect(itemsOf('Limpeza de alcatifa 75 m²')).toEqual(['Alcatifa']);
    expect(itemsOf('Limpeza sofá 3 lugares + tapete + cabeceira')).toEqual(['Sofá', 'Tapete', 'Cabeceira']);
  });

  it('cadeirão e poltrona são sofá; cadeira é cadeiras', () => {
    expect(itemsOf('Limpeza de cadeirão')).toEqual(['Sofá']);
    expect(itemsOf('Impermeabilização 2 poltronas')).toEqual(['Sofá']);
    expect(itemsOf('Limpeza de sofá de 2 lugares e de cadeira')).toEqual(['Sofá', 'Cadeiras']);
    expect(itemsOf('Impermeabilização premium 8 cadeiras')).toEqual(['Cadeiras']);
  });

  it('sem artigo reconhecido fica em Outro', () => {
    expect(itemsOf('Serviço especial')).toEqual(['Outro']);
    expect(servicesOf('Serviço especial')).toEqual(['Limpeza (outros)']);
  });
});

describe('typeOf / servicesOf', () => {
  it('impermeabilização ganha à limpeza e aplica-se a todos os artigos da linha', () => {
    expect(typeOf('Limpeza e impermeabilização de sofá')).toBe('Impermeabilização');
    expect(typeOf('Limpeza de colchão')).toBe('Limpeza');
    expect(servicesOf('Impermeabilização sofá + 9 cadeiras')).toEqual(['Impermeabilização de sofá', 'Impermeabilização de cadeiras']);
  });
});

describe('summarizeServiceMix', () => {
  const rows = [
    { description: 'Limpeza sofá 3 lugares', billed_value: 80, my_cut: 40 },
    { description: 'Limpeza sofá 2 lugares', billed_value: 80, my_cut: 40 },
    { description: 'Limpeza de tapete 4m2', billed_value: 40, my_cut: 20 },
    { description: 'Limpeza sofá 2 lugares + tapete', billed_value: 150, my_cut: 75 },
    { description: 'Impermeabilização sofá 2 lugares', billed_value: 200, my_cut: 100 },
  ];
  const mix = summarizeServiceMix(rows);
  const get = (label: string) => mix.services.find(s => s.label === label)!;

  it('ticket médio geral = faturado / linhas', () => {
    expect(mix.count).toBe(5);
    expect(mix.billed).toBe(550);
    expect(mix.average).toBe(110);
    expect(mix.combined).toBe(1);
  });

  it('uma linha com dois artigos conta como pedido nos dois', () => {
    expect(get('Limpeza de sofá').count).toBe(3);
    expect(get('Limpeza de sofá').alone).toBe(2);
    expect(get('Limpeza de tapete').count).toBe(2);
  });

  it('reparte a linha combinada pelo ticket médio sozinho (sofá 80, tapete 40)', () => {
    expect(get('Limpeza de sofá').billed).toBeCloseTo(160 + 100);
    expect(get('Limpeza de tapete').billed).toBeCloseTo(40 + 50);
    expect(mix.services.reduce((s, l) => s + l.billed, 0)).toBeCloseTo(550);
    expect(mix.services.reduce((s, l) => s + l.cut, 0)).toBeCloseTo(275);
  });

  it('o mais pedido não é forçosamente o de ticket mais alto', () => {
    expect(mix.services[0].label).toBe('Limpeza de sofá');
    expect(get('Limpeza de sofá').countRank).toBe(1);
    const imp = get('Impermeabilização de sofá');
    expect(imp.countRank).toBe(3);
    expect(imp.average).toBe(200);
    expect(imp.average).toBeGreaterThan(get('Limpeza de sofá').average);
  });
});

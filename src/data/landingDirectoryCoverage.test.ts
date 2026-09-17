import { describe, it, expect } from 'vitest';
import { coverageWindow, directorySlot, coverageCityLinks, zoneLinks } from './landingPageModel';
import { cities, services } from './locationSeoData';
import { municipiosComFreguesias } from './freguesiaSeoData';

/**
 * Os blocos de diretório eram `.slice(0, n)` sobre listas ordenadas: as n
 * primeiras entradas recebiam todas as ligações e as restantes nenhuma. O
 * efeito só aparecia ao contar o grafo de ligações do site construído, nunca
 * ao ler o código, e passou despercebido até 384 variantes de keyword e as
 * freguesias a partir da nona ficarem sem uma única ligação interna.
 *
 * Estes testes fixam a invariante que substituiu o corte: a união das janelas
 * de todas as páginas de um município cobre a lista inteira. A cobertura é
 * por construção, mas depende de quantos serviços e variantes existem — se
 * amanhã um serviço for removido, o número de janelas por município desce e a
 * cobertura pode deixar de fechar. É exatamente isso que estes testes apanham.
 */

// As variantes que geram páginas ao nível da cidade, mais a página sem variante.
const VARIANT_KEYS = [undefined, 'higienizacao', 'lavagem', 'impermeabilizacao'] as const;

describe('cobertura dos blocos de diretório', () => {
  it('cada par serviço × variante alcança todas as freguesias do município', () => {
    // A invariante tem de valer POR PAR, não somada: o bloco de
    // /lavagem-colchao-porto só emite URLs /lavagem-colchao-porto-*, por isso
    // é a única página que pode ligar a essas freguesias. Somar serviços e
    // variantes escondia precisamente as freguesias que ficaram órfãs.
    const falhas: string[] = [];
    for (const municipality of municipiosComFreguesias) {
      for (const service of services) {
        for (const variantKey of VARIANT_KEYS) {
          const vistos = new Set<string>();
          for (const freg of zoneLinks(municipality.freguesias, directorySlot(service.slug, variantKey), 8)) vistos.add(freg.slug);
          // A outra fonte de ligações, com o mesmo par serviço × variante.
          for (const freg of municipality.freguesias) for (const vizinha of freg.nearby ?? []) vistos.add(vizinha);
          const emFalta = municipality.freguesias.filter(freg => !vistos.has(freg.slug));
          if (emFalta.length) falhas.push(`${municipality.slug} / ${service.slug} / ${variantKey ?? 'sem variante'}: ${emFalta.map(f => f.slug).join(', ')}`);
        }
      }
    }
    expect(falhas).toEqual([]);
  });

  it('as janelas cobrem todas as cidades, seja qual for a cidade de partida', () => {
    const falhas: string[] = [];
    for (const service of services) {
      const vistos = new Set<string>();
      for (const city of cities) {
        for (const variantKey of VARIANT_KEYS) {
          // 6 é o tamanho usado nas páginas de localidade, o mais pequeno dos dois.
          for (const link of coverageCityLinks(service.slug, city.name, variantKey, 6)) vistos.add(link.name);
        }
      }
      const emFalta = cities.filter(city => !vistos.has(city.name));
      if (emFalta.length) falhas.push(`${service.slug}: ${emFalta.map(c => c.slug).join(', ')}`);
    }
    expect(falhas).toEqual([]);
  });

  it('a janela nunca mostra mais entradas do que o tamanho pedido, nem repete', () => {
    const janela = coverageWindow(municipiosComFreguesias[0].freguesias, 3, 8);
    expect(janela.length).toBeLessThanOrEqual(8);
    expect(new Set(janela.map(f => f.slug)).size).toBe(janela.length);
  });

  it('uma lista mais curta que a janela sai inteira', () => {
    expect(coverageWindow(['a', 'b'], 5, 8)).toEqual(['a', 'b']);
  });
});

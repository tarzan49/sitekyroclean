import { describe, expect, it } from 'vitest';
import { cities, cityPrep, cityPrepCap, cityPrepDe, headingWithCity } from './serviceCatalog';

// Os concelhos servidos que levam artigo. Até 2026-09-29 faltavam a Maia, a
// Trofa e as duas Póvoas, e o site dizia "Limpeza de Sofás em Maia".
const WITH_ARTICLE: Record<string, 'o' | 'a'> = {
  Porto: 'o', Barreiro: 'o', Seixal: 'o', Montijo: 'o',
  Amadora: 'a', Moita: 'a', 'Figueira da Foz': 'a',
  Maia: 'a', Trofa: 'a', 'Póvoa de Varzim': 'a', 'Póvoa de Lanhoso': 'a',
};

describe('preposição das cidades', () => {
  it('dá artigo exatamente aos concelhos que o levam', () => {
    const withArticle = cities.filter(city => cityPrep(city.name) !== 'em').map(city => city.name);
    // Um nome mal escrito na tabela (sem acento, por exemplo) caía em "em"
    // sem avisar: a lista tem de bater com o catálogo, nome a nome.
    expect(withArticle.sort()).toEqual(Object.keys(WITH_ARTICLE).sort());
  });

  it('usa "no/na" e "do/da" com o artigo certo, e "em/de" nas restantes', () => {
    for (const [city, article] of Object.entries(WITH_ARTICLE)) {
      expect(cityPrep(city), city).toBe(article === 'o' ? 'no' : 'na');
      expect(cityPrepDe(city), city).toBe(article === 'o' ? 'do' : 'da');
    }
    expect(cityPrep('Braga')).toBe('em');
    expect(cityPrepDe('Braga')).toBe('de');
    expect(cityPrepCap('Maia')).toBe('Na');
  });

  it('chega aos títulos com cidade', () => {
    expect(headingWithCity('Limpeza de Sofás', 'Maia')).toBe('Limpeza de Sofás na Maia');
    expect(headingWithCity('Quanto Custa a Lavagem Profissional de Tapetes?', 'Póvoa de Varzim'))
      .toBe('Quanto Custa a Lavagem Profissional de Tapetes na Póvoa de Varzim?');
  });
});

import { describe, expect, it } from 'vitest';
import { LOCAL_DATA_BY_MUNICIPIO } from './freguesiaLocalData';
import { municipiosComFreguesias } from './freguesiaSeoData';
import { cities } from './serviceCatalog';
import { getLocalData } from './freguesiaContentEngine';

// Regiões que têm de ter conteúdo local em todas as freguesias, como o Porto
// e Lisboa (dono, 2026-09-28: "tão bom como o do Porto e de Lisboa"), e o
// Norte Litoral (dono, mesmo dia).
const FULL_COVERAGE = [
  'Coimbra', 'Figueira da Foz', 'Braga', 'Guimarães', 'Barcelos', 'Vila Nova de Famalicão',
  // Norte Litoral (2026-09-28)
  'Viana do Castelo', 'Esposende', 'Póvoa de Varzim', 'Vila do Conde', 'Espinho', 'Ovar',
  ...cities.filter(city => city.area === 'algarve').map(city => city.name),
];

describe('freguesia local data', () => {
  it('only describes parishes that exist, under the right municipality', () => {
    for (const [municipio, entries] of Object.entries(LOCAL_DATA_BY_MUNICIPIO)) {
      const group = municipiosComFreguesias.find(m => m.name === municipio);
      expect(group, municipio).toBeDefined();
      for (const slug of Object.keys(entries)) {
        expect(group!.freguesias.some(f => f.slug === slug), `${municipio}/${slug}`).toBe(true);
      }
    }
  });

  it('never falls back to the generic text in the regions that must match Porto and Lisboa', () => {
    for (const municipio of FULL_COVERAGE) {
      const group = municipiosComFreguesias.find(m => m.name === municipio);
      if (!group) continue; // concelho sem freguesias próprias no site
      for (const f of group.freguesias) {
        const data = getLocalData(f.slug, f.name, municipio);
        expect(data.landmarks.join(), `${municipio}/${f.slug}`).not.toContain(`Centro de ${f.name}`);
      }
    }
  });

  it('keeps the same editorial rules as the rest of the site', () => {
    for (const entries of Object.values(LOCAL_DATA_BY_MUNICIPIO)) {
      for (const [slug, data] of Object.entries(entries)) {
        const text = `${data.landmarks.join(' ')} ${data.localTip}`;
        expect(data.landmarks.length, slug).toBeGreaterThan(0);
        expect(data.landmarks.length, slug).toBeLessThanOrEqual(3);
        expect(text, slug).not.toMatch(/—|\belimin|\bmata[mr]\b|garant|100 ?%|\d+ ?%|€/i);
      }
    }
  });

  it('does not let a parish inherit the landmarks of a namesake in another municipality', () => {
    expect(getLocalData('santa-clara', 'Santa Clara', 'Coimbra').landmarks.join()).not.toMatch(/Lisboa/);
    expect(getLocalData('serzedo', 'Serzedo', 'Guimarães')).not.toEqual(getLocalData('serzedo', 'Serzedo', 'Vila Nova de Gaia'));
  });
});

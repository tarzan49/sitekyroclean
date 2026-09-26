import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as quizTypes from '../components/quiz/QuizTypes';
import { mattressPrices } from '../components/quiz/QuizTypes';
import { SOFA_ANTI_ACAROS_PRICE, CHAIR_ANTI_ACAROS_UNIT_PRICE, CHAIR_ANTI_ACAROS_UNIT_LABEL, mattressAntiAcarosPrice } from './antiAcarosPricing';
import { PRICE_TABLE } from '../data/locationPriceTestimonialsData';
import { getAllPosts } from '../data/blogData';

const read = (path: string) => readFileSync(resolve(__dirname, '..', '..', path), 'utf8');

// "O site tem de ser consistente nos preços, senão o negócio parece pouco
// sério" (dono, 2026-09-26). Estes testes travam os três defeitos desse dia.
describe('anti-ácaros: um só preço em todo o lado', () => {
  it('keeps the approved prices', () => {
    expect(SOFA_ANTI_ACAROS_PRICE).toEqual({ '1-lugar': 20, '2-lugares': 40, '3-lugares': 50 });
    expect(CHAIR_ANTI_ACAROS_UNIT_PRICE).toBe(5);
    expect(CHAIR_ANTI_ACAROS_UNIT_LABEL).toBe('5€/un.');
    expect(mattressPrices.map(mattressAntiAcarosPrice)).toEqual([15, 20, 25]);
  });

  it('is read from the shared module by the quiz, the configurator and the receipt', () => {
    for (const path of [
      'src/components/quiz/quizHelpers.ts',
      'src/components/quiz/steps/QuizSofaAddonUpsell.tsx',
      'src/components/quiz/steps/QuizChairsAddonUpsell.tsx',
      'src/components/quiz/steps/QuizMattressAddonUpsell.tsx',
      'src/lib/customPack.ts',
      'src/components/PackConfigurator.tsx',
      'src/services/submissionService.ts',
    ]) {
      expect(read(path), `${path} deve importar constants/antiAcarosPricing`).toContain('constants/antiAcarosPricing');
    }
  });

  it('is not written by hand anywhere else', () => {
    for (const path of [
      'src/hooks/use-quiz-pricing.ts',
      'src/services/submissionService.ts',
      'src/lib/customPack.ts',
      'src/lib/priceWidgetCalc.ts',
      'src/components/quiz/steps/QuizChairsAddonUpsell.tsx',
      'src/components/PackConfigurator.tsx',
    ]) {
      const source = read(path);
      expect(source, `${path} escreve a tabela do sofá à mão`).not.toMatch(/'1-lugar':\s*20/);
      expect(source, `${path} multiplica cadeiras por 5 à mão`).not.toMatch(/\*\s*5\b/);
      expect(source, `${path} escreve "5€/un." à mão`).not.toContain("'+5€/un.'");
      expect(source, `${path} guarda a tabela antiga de 7,50€`).not.toMatch(/7[.,]5/);
    }
  });
});

describe('chaise longue: sem preço nem opção', () => {
  it('has no price constant or form field left', () => {
    expect('sofaChaisePrice' in quizTypes).toBe(false);
    expect('sofaHasChaise' in quizTypes.initialFormData).toBe(false);
  });

  it('is not priced in any price table or blog article', () => {
    for (const rows of Object.values(PRICE_TABLE)) {
      expect(rows.some(row => /chaise/i.test(row.item))).toBe(false);
    }
    for (const post of getAllPosts()) {
      const text = post.sections.map(section => section.body).join('\n');
      expect(text, post.slug).not.toMatch(/chaise[^.\n]*\d+\s*€/i);
    }
  });
});

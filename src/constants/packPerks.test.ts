import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { perkChairsPrice, perkMattressPrice, perkSofaPrice, PACK_PERK_SOFA_PRICE } from './packPerks';
import { calculateCustomPack, makePackItem } from '../lib/customPack';
import { mattressPrices, sofaPrices } from '../components/quiz/QuizTypes';
import { calcChairClean } from '../components/quiz/quizHelpers';

const read = (path: string) => readFileSync(resolve(__dirname, '..', '..', path), 'utf8');

// O ecrã de upsell do quiz e o configurador de packs mostram a mesma oferta a
// pessoas que podem passar pelos dois no mesmo dia. Estes testes existem para
// que os números não voltem a viver em dois sítios.
describe('as regalias de pack são as mesmas no quiz e no configurador', () => {
  it('o configurador cobra pelo colchão acrescentado o mesmo que o upsell do quiz mostra', () => {
    const casal = mattressPrices.find(option => option.id === 'casal')!;
    const items = [{ ...makePackItem('sofa', 's'), size: '3-lugares' }, { ...makePackItem('mattress', 'm'), size: 'casal' }];
    expect(calculateCustomPack(items, 'Braga').lines[1].amount).toBe(perkMattressPrice(Number(casal.cleaningPrice)));
  });

  it('o configurador cobra pelo sofá acrescentado o preço fixo que o upsell do quiz mostra', () => {
    for (const option of sofaPrices) {
      if (typeof option.cleaningPrice !== 'number') continue;
      const items = [{ ...makePackItem('mattress', 'm'), size: 'casal' }, { ...makePackItem('sofa', 's'), size: option.id }];
      expect(calculateCustomPack(items, 'Braga').lines[1].amount).toBe(perkSofaPrice(option.id, option.cleaningPrice));
    }
  });

  it('as cadeiras acrescentadas seguem a mesma oferta por conjunto', () => {
    const items = [{ ...makePackItem('sofa', 's'), size: '2-lugares' }, { ...makePackItem('chairs', 'c'), qty: 4 }];
    expect(calculateCustomPack(items, 'Braga').lines[1].amount).toBe(perkChairsPrice(calcChairClean(4)!, 4));
  });

  it('nem o quiz nem o configurador voltam a escrever estes preços à mão', () => {
    for (const path of ['src/components/quiz/steps/QuizComboUpsellScreen.tsx', 'src/components/PackConfigurator.tsx']) {
      const source = read(path);
      expect(source, `${path} deve importar as regalias de constants/packPerks`).toContain("constants/packPerks");
      expect(source, `${path} não deve redeclarar a tabela de preços do sofá`).not.toMatch(/'1-lugar':\s*35/);
    }
  });
});

// O defeito que estes testes travam já aconteceu: o desconto de 10% acima de
// 149€ foi retirado do código a 2026-09-10 e continuou anunciado no HTML
// estático das 244 páginas de pack até 2026-09-23, onde só os motores o liam.
describe('nenhuma página de pack promete um desconto que o código não aplica', () => {
  const packFacing = [
    'src/pages/PackComboPage.tsx',
    'src/components/PackConfigurator.tsx',
    'src/components/ServicePackBanner.tsx',
    'src/data/packComboData.ts',
  ];

  it('não fala em percentagem de desconto nem no limiar antigo', () => {
    for (const path of packFacing) {
      const source = read(path);
      expect(source, `${path} menciona um desconto em percentagem`).not.toMatch(/\d+\s*%/);
      expect(source, `${path} menciona o limiar de 149€`).not.toContain('149');
    }
  });

  it('o prerender dos packs diz o mesmo que a página mostra', () => {
    const source = read('scripts/prerender.ts');
    const block = source.slice(source.indexOf('// ── 8. Pack / Combo pages'), source.indexOf('// ── 9. Marca Sofá pages'));
    expect(block).toContain('PACK_PERK_RULE');
    expect(block).not.toMatch(/\d+\s*%/);
    expect(block).not.toContain('149');
  });

  it('nenhum preço de pack aparece escrito à mão nas regalias publicadas', () => {
    for (const path of ['src/pages/PackComboPage.tsx', 'src/data/packComboData.ts']) {
      const source = read(path);
      for (const price of Object.values(PACK_PERK_SOFA_PRICE)) {
        expect(source, `${path} escreve ${price}€ à mão em vez de importar`).not.toContain(`${price}€`);
      }
    }
  });
});

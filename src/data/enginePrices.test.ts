import { describe, it, expect } from 'vitest';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcPackPricing } from '@/components/quiz/quizHelpers';
import { SOFA_ANTI_ACAROS_PRICE, CHAIR_ANTI_ACAROS_UNIT_LABEL } from '@/constants/antiAcarosPricing';
import { services } from './serviceCatalog';
import {
  formatEuro,
  chairCleaningTiers,
  chairTierRows,
  chairTierSentence,
  CLEANING_FROM_BY_SERVICE,
  SOFA_CLEANING_FROM,
  MATTRESS_CLEANING_FROM,
  CHAIR_CLEANING_FROM,
  SOFA_CLEAN_AND_PROTECT_FROM,
  SOFA_PROTECT_WITH_CLEANING_FROM,
  SOFA_WATERPROOF_ESSENCIAL_FROM,
  CHAIR_PRICE_LABEL,
  CHAIR_PRICE_TITLE,
  CHAIR_WATERPROOF_ESSENCIAL_UNIT,
  CHAIR_WATERPROOF_PREMIUM_UNIT,
  startingPriceLabel,
} from './enginePrices';
import { getPricePageData } from './priceSeoData';
import { commercialHeroSubtitle, commercialHeroPriceLine } from './commercialHeroCopy';
import { getLandingPageModel } from './landingPageModel';
import { getPillarPage } from './pillarPages';
import { municipiosComFreguesias } from './freguesiaSeoData';
import { cities } from './serviceCatalog';
import { getProblemBySlug } from './problemSeoData';
import { getLandingTrustPoints } from '../constants/serviceTrustPool';

const sofa1 = sofaPrices.find(item => item.id === '1-lugar')!;

describe('preços de partida lidos do motor', () => {
  it('formata com vírgula decimal e sem casas quando o valor é inteiro', () => {
    expect(formatEuro(49)).toBe('49€');
    expect(formatEuro(12.5)).toBe('12,50€');
  });

  it('são os mesmos que o quiz cobra', () => {
    expect(SOFA_CLEANING_FROM).toBe(sofa1.cleaningPrice);
    expect(MATTRESS_CLEANING_FROM).toBe(Math.min(...mattressPrices.map(item => item.cleaningPrice).filter((v): v is number => typeof v === 'number')));
    expect(CHAIR_CLEANING_FROM).toBe(calcChairClean(1));
    const pack = calcPackPricing(sofa1, true, false);
    expect(SOFA_CLEAN_AND_PROTECT_FROM).toBe(pack.packPrice);
    expect(SOFA_PROTECT_WITH_CLEANING_FROM).toBe(pack.packDelta);
    // O pack é o que o quiz cobra, não o `bothPrice` de tabela (o erro dos 99€).
    expect(SOFA_CLEAN_AND_PROTECT_FROM).toBeLessThan(sofa1.bothPrice as number);
  });

  it('o preço de partida do catálogo (hero, schema, llms.txt) coincide com o motor', () => {
    for (const service of services) {
      const engine = CLEANING_FROM_BY_SERVICE[service.slug];
      if (engine === null) expect(service.priceFrom, service.slug).toMatch(/orçamento/i);
      else expect(service.priceFrom, service.slug).toBe(formatEuro(engine));
    }
  });

  it('lê os escalões das cadeiras do calcChairClean, com a 10.ª sob orçamento', () => {
    const { tiers, quoteFrom } = chairCleaningTiers();
    expect(quoteFrom).toBe(10);
    for (const tier of tiers) {
      for (let qty = tier.first; qty <= tier.last; qty++) {
        expect(calcChairClean(qty)! - (calcChairClean(qty - 1) ?? 0)).toBeCloseTo(tier.unit);
      }
    }
    expect(chairTierRows().map(row => row.price)).toEqual(['20€/un', '15€/un', '12,50€/un', 'Sob orçamento']);
    const sentence = chairTierSentence();
    expect(sentence).toContain('12,50€');
    expect(sentence).toContain('A partir de 10 cadeiras');
    expect(sentence).not.toMatch(/de 7 a 10|a partir de 11/);
  });
});

describe('texto que cita estes preços', () => {
  it('o hero da impermeabilização anuncia o pack ao preço que o quiz cobra', () => {
    const subtitle = commercialHeroSubtitle('impermeabilizacao');
    expect(subtitle).toContain(`${formatEuro(SOFA_CLEAN_AND_PROTECT_FROM)} com limpeza`);
    expect(subtitle).not.toContain(`${sofa1.bothPrice}€ com limpeza`);
  });

  it('a página de impermeabilização do sofá já não diz 99€ para o pack', () => {
    const faq = getProblemBySlug('impermeabilizar-sofa')?.faqs.find(item => /Quanto custa/.test(item.question));
    expect(faq?.answer).toContain(`começam em ${formatEuro(SOFA_CLEAN_AND_PROTECT_FROM)} para 1 lugar`);
  });

  it('a tabela de preço dos sofás mostra a impermeabilização acrescentada à limpeza, não o preço sozinha', () => {
    const rows = getPricePageData('limpeza-sofas', 'porto')!.priceTable;
    const row = rows.find(item => /Impermeabiliza/.test(item.item))!;
    expect(row.price).toBe(`+${formatEuro(SOFA_PROTECT_WITH_CLEANING_FROM)}`);
    expect(row.price).not.toBe(`Desde ${formatEuro(SOFA_WATERPROOF_ESSENCIAL_FROM)}`);
    const chairs = getPricePageData('limpeza-cadeiras', 'porto')!.priceTable;
    expect(chairs).toEqual(chairTierRows());
  });

  it('o anti-ácaros anunciado nos pontos de confiança é o preço do quiz e do configurador', () => {
    const texts = Array.from({ length: 40 }, (_, index) => getLandingTrustPoints('limpeza-sofas', 'localidade', 'Porto', `Porto-${index}`))
      .flat().map(point => point.titleGold).filter(title => /Anti Ácaros/.test(title));
    expect(texts.length).toBeGreaterThan(0);
    for (const title of new Set(texts)) expect(title).toContain(formatEuro(Math.min(...Object.values(SOFA_ANTI_ACAROS_PRICE))));
  });
  it('as cadeiras mostram o anti-ácaros só como taxa unitária', () => {
    const titles = Array.from({ length: 40 }, (_, index) => getLandingTrustPoints('limpeza-cadeiras', 'localidade', 'Porto', `Porto-${index}`))
      .flat().map(point => point.titleGold).filter(title => /Anti Ácaros/.test(title));
    expect(titles.length).toBeGreaterThan(0);
    for (const title of new Set(titles)) expect(title).toContain(CHAIR_ANTI_ACAROS_UNIT_LABEL);
  });
});

// Pedido do dono (26/09/2026): "não digas desde em cadeiras". A limpeza de
// cadeiras cobra-se por cadeira e "Desde 20€" lia-se como o total do serviço.
describe('cadeiras: o preço diz-se por cadeira, nunca "desde"', () => {
  it('o rótulo vem do motor, com o "Desde" só nos outros serviços', () => {
    expect(CHAIR_PRICE_LABEL).toBe(`${formatEuro(CHAIR_CLEANING_FROM)} por cadeira`);
    expect(CHAIR_PRICE_TITLE).toBe(`${formatEuro(CHAIR_CLEANING_FROM)} por Cadeira`);
    const chair = formatEuro(CHAIR_CLEANING_FROM);
    expect(startingPriceLabel('limpeza-cadeiras', chair)).toBe(CHAIR_PRICE_LABEL);
    expect(startingPriceLabel('limpeza-cadeiras', chair, 'mid')).toBe(`a ${CHAIR_PRICE_LABEL}`);
    expect(startingPriceLabel('limpeza-cadeiras', chair, 'title')).toBe(CHAIR_PRICE_TITLE);
    // Um preço que já chega por cadeira (impermeabilização) também não leva "desde".
    expect(startingPriceLabel('impermeabilizacao', `${formatEuro(CHAIR_WATERPROOF_ESSENCIAL_UNIT)} por cadeira`)).toBe(`${formatEuro(CHAIR_WATERPROOF_ESSENCIAL_UNIT)} por cadeira`);
    const sofa = formatEuro(SOFA_CLEANING_FROM);
    expect(startingPriceLabel('limpeza-sofas', sofa)).toBe(`Desde ${sofa}`);
    expect(startingPriceLabel('limpeza-sofas', sofa, 'mid')).toBe(`desde ${sofa}`);
    expect(startingPriceLabel('limpeza-sofas', sofa, 'title')).toBe(`Desde ${sofa}`);
  });

  it('o hero e o título-pilar das cadeiras dizem o preço por cadeira', () => {
    expect(commercialHeroPriceLine('limpeza-cadeiras', 'Porto')).toMatch(new RegExp(`^${CHAIR_PRICE_LABEL} \\+ deslocação`));
    expect(getPillarPage('/limpeza-cadeiras').title).toContain(`| ${CHAIR_PRICE_TITLE} |`);
    expect(commercialHeroPriceLine('limpeza-sofas', 'Porto')).toMatch(/^Desde /);
  });

  it('nenhuma página de cadeiras (localidade, freguesia, preço, variantes) diz "desde" um preço de cadeira', () => {
    const paths: string[] = [];
    for (const city of cities) {
      paths.push(`/limpeza-cadeiras-${city.slug}`, `/preco-limpeza-cadeiras-${city.slug}`, `/higienizacao-cadeiras-${city.slug}`, `/lavagem-cadeiras-${city.slug}`, `/impermeabilizacao-cadeiras-${city.slug}`);
    }
    for (const municipality of municipiosComFreguesias.slice(0, 6)) {
      for (const parish of municipality.freguesias) paths.push(`/limpeza-cadeiras-${municipality.slug}-${parish.slug}`, `/impermeabilizacao-cadeiras-${municipality.slug}-${parish.slug}`);
    }
    let checked = 0;
    for (const path of paths) {
      const model = getLandingPageModel(path);
      if (!model) continue;
      checked++;
      const hero = commercialHeroPriceLine(model.serviceSlug, model.municipalityName, model.priceFrom);
      const texts = [model.title, model.metaDescription, model.h1, model.intro, model.editorialIntro, hero];
      for (const text of texts) expect(text, path).not.toMatch(/desde\s*\d/i);
      expect(hero, path).toMatch(/^\d+(,\d+)?€ por cadeira \+ deslocação/);
    }
    expect(checked).toBeGreaterThan(cities.length * 4);
    // A impermeabilização de cadeiras mostrava os preços do sofá no subtítulo.
    const waterproof = getLandingPageModel('/impermeabilizacao-cadeiras-porto')!;
    expect(waterproof.intro).toContain(`${formatEuro(CHAIR_WATERPROOF_PREMIUM_UNIT)} por cadeira`);
    expect(waterproof.intro).toContain(`${formatEuro(CHAIR_WATERPROOF_ESSENCIAL_UNIT)} por cadeira`);
  });
});

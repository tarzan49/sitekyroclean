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
  CHAIR_UNIT_MIN,
  CHAIR_UNIT_MAX,
  chairPriceBreakdown,
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

// Pedidos do dono (26-27/09/2026): "não digas desde em cadeiras" e, depois,
// "não quero que digas cadeiras a 20€ se há mais barato". A limpeza de
// cadeiras cobra-se por cadeira e o preço desce com a quantidade: o rótulo
// mostra sempre o intervalo ou os escalões, nunca só o preço mais alto.
describe('cadeiras: o preço mostra que desce com a quantidade', () => {
  it('o intervalo e os escalões vêm do motor', () => {
    const { tiers } = chairCleaningTiers();
    expect(CHAIR_UNIT_MAX).toBe(CHAIR_CLEANING_FROM);
    expect(CHAIR_UNIT_MIN).toBe(tiers[tiers.length - 1].unit);
    expect(CHAIR_UNIT_MIN).toBeLessThan(CHAIR_UNIT_MAX);
    expect(CHAIR_PRICE_LABEL).toBe(`${formatEuro(CHAIR_UNIT_MIN)} a ${formatEuro(CHAIR_UNIT_MAX)} por cadeira`);
    expect(CHAIR_PRICE_TITLE).toBe(`${formatEuro(CHAIR_UNIT_MIN)} a ${formatEuro(CHAIR_UNIT_MAX)} por Cadeira`);
    const breakdown = chairPriceBreakdown();
    for (const tier of tiers) expect(breakdown).toContain(formatEuro(tier.unit));
    expect(breakdown.startsWith(`${formatEuro(CHAIR_UNIT_MAX)} por cadeira até ${tiers[0].last}`)).toBe(true);
  });

  it('o rótulo de partida: intervalo nas cadeiras, "Desde" nos outros serviços', () => {
    const chair = formatEuro(CHAIR_CLEANING_FROM);
    expect(startingPriceLabel('limpeza-cadeiras', chair)).toBe(`De ${CHAIR_PRICE_LABEL}`);
    expect(startingPriceLabel('limpeza-cadeiras', chair, 'mid')).toBe(`de ${CHAIR_PRICE_LABEL}`);
    expect(startingPriceLabel('limpeza-cadeiras', chair, 'title')).toBe(CHAIR_PRICE_TITLE);
    // A impermeabilização tem um preço fixo por cadeira: sem escalões nem "desde".
    const essencial = `${formatEuro(CHAIR_WATERPROOF_ESSENCIAL_UNIT)} por cadeira`;
    expect(startingPriceLabel('impermeabilizacao', essencial)).toBe(essencial);
    expect(startingPriceLabel('impermeabilizacao', essencial, 'mid')).toBe(`a ${essencial}`);
    const sofa = formatEuro(SOFA_CLEANING_FROM);
    expect(startingPriceLabel('limpeza-sofas', sofa)).toBe(`Desde ${sofa}`);
    expect(startingPriceLabel('limpeza-sofas', sofa, 'mid')).toBe(`desde ${sofa}`);
    expect(startingPriceLabel('limpeza-sofas', sofa, 'title')).toBe(`Desde ${sofa}`);
  });

  it('o hero das cadeiras diz os escalões e o título-pilar o intervalo', () => {
    expect(commercialHeroPriceLine('limpeza-cadeiras', 'Porto').startsWith(`${chairPriceBreakdown()} + deslocação`)).toBe(true);
    expect(getPillarPage('/limpeza-cadeiras').title).toContain(`| ${CHAIR_PRICE_TITLE} |`);
    expect(commercialHeroPriceLine('limpeza-sofas', 'Porto')).toMatch(/^Desde /);
  });

  it('nenhuma página de cadeiras diz "desde" nem só o preço mais alto', () => {
    const top = `${formatEuro(CHAIR_UNIT_MAX)} por cadeira`;
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
      for (const text of texts) {
        expect(text, path).not.toMatch(/desde\s*\d/i);
        // "20€ por cadeira" só pode aparecer a abrir os escalões ("… até 4, …").
        if (text?.includes(top)) expect(text, path).toContain(`${top} até`);
      }
      if (model.serviceSlug === 'impermeabilizacao') expect(hero, path).toMatch(/^\d+(,\d+)?€ por cadeira \+ deslocação/);
      else expect(hero.startsWith(`${chairPriceBreakdown()} + deslocação`), path).toBe(true);
    }
    expect(checked).toBeGreaterThan(cities.length * 4);
    // A impermeabilização de cadeiras mostrava os preços do sofá no subtítulo.
    const waterproof = getLandingPageModel('/impermeabilizacao-cadeiras-porto')!;
    expect(waterproof.intro).toContain(`${formatEuro(CHAIR_WATERPROOF_PREMIUM_UNIT)} por cadeira`);
    expect(waterproof.intro).toContain(`${formatEuro(CHAIR_WATERPROOF_ESSENCIAL_UNIT)} por cadeira`);
  });
});

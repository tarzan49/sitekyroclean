import { describe, it, expect } from 'vitest';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcPackPricing } from '@/components/quiz/quizHelpers';
import { SOFA_ANTI_ACAROS_PRICE, CHAIR_ANTI_ACAROS_UNIT_LABEL } from '@/constants/antiAcarosPricing';
import { RUG_PICKUP_FEE_RULE, TRAVEL_FEE_MIN, TRAVEL_FEE_MAX } from '@/constants/commercialPolicy';
import { PACK_PERK_MIN_ORDER, PACK_PERK_SUMMARY } from '@/constants/packPerks';
import { services } from './serviceCatalog';
import {
  formatEuro,
  chairCleaningTiers,
  chairTierRows,
  chairTierSentence,
  mattressSizeList,
  sofaCleaningPrice,
  mattressCleaningPrice,
  mattressCleanAndAntiMitePrice,
  CLEANING_FROM_BY_SERVICE,
  SOFA_CLEANING_FROM,
  MATTRESS_CLEANING_FROM,
  MATTRESS_CLEAN_AND_ANTI_MITE_FROM,
  MATTRESS_ANTI_MITE_WITH_CLEANING_FROM,
  CHAIR_CLEANING_FROM,
  SOFA_CLEAN_AND_PROTECT_FROM,
  SOFA_PROTECT_WITH_CLEANING_FROM,
  SOFA_WATERPROOF_ESSENCIAL_FROM,
  CHAIR_PRICE_LABEL,
  CHAIR_PRICE_TITLE,
  CHAIR_UNIT_MIN,
  CHAIR_UNIT_MAX,
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
import { getAllProblems, getProblemBySlug } from './problemSeoData';
import { getAllMaterials } from './materialSeoData';
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

  it('lê o preço de cada tamanho da tabela do quiz, e rebenta num tamanho sem preço', () => {
    for (const size of sofaPrices) {
      if (typeof size.cleaningPrice === 'number') expect(sofaCleaningPrice(size.id)).toBe(size.cleaningPrice);
      else expect(() => sofaCleaningPrice(size.id), size.id).toThrow();
    }
    for (const size of mattressPrices) {
      expect(mattressCleaningPrice(size.id)).toBe(size.cleaningPrice);
      expect(mattressCleanAndAntiMitePrice(size.id)).toBe(size.bothPrice);
      expect(mattressSizeList()).toContain(`${formatEuro(size.cleaningPrice as number)} (${size.label.toLowerCase()})`);
    }
    expect(mattressCleanAndAntiMitePrice('solteiro')).toBe(MATTRESS_CLEAN_AND_ANTI_MITE_FROM);
    expect(() => mattressCleaningPrice('beliche')).toThrow();
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
  it('o hero da impermeabilização não fala do preço com limpeza (dono, 28/09/2026)', () => {
    const subtitle = commercialHeroSubtitle('impermeabilizacao');
    expect(subtitle).not.toContain('com limpeza');
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

// Dono (27/09/2026): nas cadeiras diz-se só "desde" o preço mais baixo por
// cadeira ("Desde 12,50€"), como nos outros serviços.
describe('cadeiras: "Desde" o preço mais baixo por cadeira', () => {
  it('o rótulo vem do escalão mais barato do motor', () => {
    const { tiers } = chairCleaningTiers();
    expect(CHAIR_UNIT_MIN).toBe(tiers[tiers.length - 1].unit);
    expect(CHAIR_PRICE_LABEL).toBe(`Desde ${formatEuro(CHAIR_UNIT_MIN)}`);
    expect(startingPriceLabel('limpeza-cadeiras', formatEuro(CHAIR_CLEANING_FROM))).toBe(CHAIR_PRICE_LABEL);
    expect(startingPriceLabel('limpeza-cadeiras', formatEuro(CHAIR_CLEANING_FROM), 'mid')).toBe(`desde ${formatEuro(CHAIR_UNIT_MIN)}`);
    expect(startingPriceLabel('limpeza-sofas', formatEuro(SOFA_CLEANING_FROM))).toBe(`Desde ${formatEuro(SOFA_CLEANING_FROM)}`);
  });

  it('o hero e o título-pilar das cadeiras dizem "Desde 12,50€"', () => {
    expect(commercialHeroPriceLine('limpeza-cadeiras', 'Porto').startsWith(`${CHAIR_PRICE_LABEL} + deslocação`)).toBe(true);
    expect(getPillarPage('/limpeza-cadeiras').title).toContain(`| ${CHAIR_PRICE_TITLE} |`);
    const waterproof = getLandingPageModel('/impermeabilizacao-cadeiras-porto')!;
    expect(waterproof.intro).toContain(`desde ${formatEuro(CHAIR_WATERPROOF_PREMIUM_UNIT)}`);
    expect(waterproof.intro).toContain(`desde ${formatEuro(CHAIR_WATERPROOF_ESSENCIAL_UNIT)}`);
  });
});

// As três páginas de preço dos problemas: /problemas/preco-limpeza-{sofa,colchao,tapete}
// e as problema × cidade que herdam o texto. Tinham "Preços 2025" no título, o
// anti-ácaros do colchão dado como incluído, a recolha dos tapetes dada como
// incluída e os preços escritos à mão.
describe('páginas de preço dos problemas', () => {
  const PRICE_PROBLEMS = ['preco-limpeza-sofa', 'preco-limpeza-colchao', 'preco-limpeza-tapete'];
  const pageText = (slug: string) => {
    const page = getProblemBySlug(slug)!;
    return [page.title, page.metaDescription, page.h1, page.intro, page.problemDetail, page.solutionDetail, ...page.benefits, ...page.faqs.flatMap(faq => [faq.question, faq.answer])].join('\n');
  };
  const faqAnswer = (slug: string, question: RegExp) => getProblemBySlug(slug)!.faqs.find(faq => question.test(faq.question))!.answer;

  it('não escrevem um ano, que fica desatualizado', () => {
    for (const slug of PRICE_PROBLEMS) expect(pageText(slug), slug).not.toMatch(/\b20\d{2}\b/);
  });

  // Em todas as páginas de problema e de material, não só nestas três: um
  // número escrito à mão que o motor deixe de cobrar rebenta aqui.
  it('cada preço em euros de uma página de problema ou de material é um que o quiz cobra', () => {
    const engine = [
      ...sofaPrices.flatMap(size => [size.cleaningPrice, size.waterproofingPrice, size.waterproofingPremiumPrice]),
      ...mattressPrices.flatMap(size => [mattressCleaningPrice(size.id), mattressCleanAndAntiMitePrice(size.id)]),
      ...chairCleaningTiers().tiers.map(tier => tier.unit),
      SOFA_CLEAN_AND_PROTECT_FROM, SOFA_PROTECT_WITH_CLEANING_FROM, MATTRESS_ANTI_MITE_WITH_CLEANING_FROM,
      TRAVEL_FEE_MIN, TRAVEL_FEE_MAX, PACK_PERK_MIN_ORDER,
    ].filter((value): value is number => typeof value === 'number').map(formatEuro);
    const strings = (value: unknown): string[] => typeof value === 'string' ? [value]
      : Array.isArray(value) ? value.flatMap(strings)
      : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
    for (const page of [...getAllProblems(), ...getAllMaterials()]) {
      for (const text of strings(page)) {
        for (const [amount] of text.matchAll(/\d+(?:,\d{2})?€/g)) expect(engine, `${page.slug}: ${amount}`).toContain(amount);
      }
    }
  });

  it('o pack do sofá segue a regra do quiz, com subtotal mínimo', () => {
    expect(faqAnswer('preco-limpeza-sofa', /packs/)).toContain(PACK_PERK_SUMMARY);
    expect(pageText('preco-limpeza-sofa')).not.toMatch(/sem desconto condicional/);
  });

  it('o colchão não dá o anti-ácaros como incluído nem cobra suplemento por manchas (dono, 2026-09-30)', () => {
    const text = pageText('preco-limpeza-colchao');
    expect(text).not.toMatch(/remoção de ácaros|incluindo anti-ácaros/i);
    expect(text).not.toMatch(/suplemento de|podem? ter (um )?suplemento/i);
    expect(faqAnswer('preco-limpeza-colchao', /casal/)).toContain(formatEuro(mattressCleanAndAntiMitePrice('casal')));
  });

  // Desde 2026-10-05 o único valor em euros da página é o custo da recolha
  // (RUG_PICKUP_FEE_RULE, dono): a lavagem continua sem preço.
  it('o tapete não tem preço, é lavado em casa por defeito e a recolha tem o custo do dono', () => {
    const text = pageText('preco-limpeza-tapete');
    expect(text.split(RUG_PICKUP_FEE_RULE).join('')).not.toMatch(/\d\s*€/);
    expect(text).not.toMatch(/recolha e entrega (ao domicílio )?(estão )?incluídas|incluídas no preço/i);
    expect(text).toContain('prazo máximo de 3 dias');
    expect(faqAnswer('preco-limpeza-tapete', /recolha/)).toContain(RUG_PICKUP_FEE_RULE);
  });
});

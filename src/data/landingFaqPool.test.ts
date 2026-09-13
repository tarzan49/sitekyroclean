import { describe, expect, it } from 'vitest';
import { getLandingFaqs, getLandingFaqPool, LANDING_FAQ_COUNT, selectLandingFaqEntries, type LandingFaqContext, type LandingService } from './landingFaqPool';
import { getLandingFaqRoutes } from '../../scripts/landing-faq-routes';
import { locationPrices } from '../constants/travel';
import { services } from './serviceCatalog';
import { getAllKeywordVariantRoutes as browserRoutes } from './keywordVariantRouteData';
import { getAllKeywordVariantRoutes as generatedRoutes } from './keywordVariantData';

const context: LandingFaqContext = { serviceSlug: 'limpeza-sofas', family: 'localidade', municipality: 'Lisboa', pageKey: '/limpeza-sofas-lisboa' };

describe('landing FAQ library', () => {
  it('has distinct questions and IDs with service-specific coverage in all four topics', () => {
    const distinctQuestions = new Set<string>();
    for (const service of services) {
      const pool = getLandingFaqPool(service.slug as LandingService);
      expect(pool.length).toBe(40);
      expect(new Set(pool.map(faq => faq.id)).size).toBe(pool.length);
      expect(new Set(pool.map(faq => faq.question)).size).toBe(pool.length);
      expect(new Set(pool.map(faq => faq.topic)).size).toBe(4);
      for (const faq of pool) {
        distinctQuestions.add(faq.question);
        const answer = typeof faq.answer === 'function' ? faq.answer(context) : faq.answer;
        expect(answer.trim().length).toBeGreaterThan(40);
        expect(answer).not.toMatch(/—|\{city\}|\{travelFee\}|99\s*%|esteriliza[çc][aã]o garantida/);
      }
    }
    expect(distinctQuestions.size).toBe(180);
  });

  it('uses the canonical municipality fee, never a fee guessed from a parish name', () => {
    const entry = getLandingFaqPool('limpeza-sofas').find(faq => faq.id === 'deslocacao')!;
    if (typeof entry.answer !== 'function') throw new Error('Travel answer must use context');
    for (const municipality of ['Lisboa', 'Coimbra', 'Barcelos', 'Aljezur']) {
      expect(entry.answer({ ...context, municipality })).toContain(`${locationPrices[municipality]}€`);
    }
    expect(entry.answer({ ...context, municipality: 'localidade desconhecida' })).not.toMatch(/\d+€/);
  });

  it('uses the expanded library across real pages and respects waterproofing article scope', () => {
    const used = new Set<string>();
    for (const record of getLandingFaqRoutes()) {
      for (const entry of selectLandingFaqEntries(record.context)) {
        used.add(entry.id);
        const article = record.path.match(/^\/impermeabilizacao-(sofa|cadeiras)-/)?.[1];
        if (article && entry.article) expect(entry.article, record.path).toBe(article);
      }
    }
    const available = new Set(services.flatMap(service => getLandingFaqPool(service.slug as LandingService).map(entry => entry.id)));
    expect([...available].filter(id => !used.has(id))).toEqual([]);
    expect(used.size).toBe(180);
  });

  it('does not silently substitute sofas for an unsupported service', () => {
    expect(() => getLandingFaqs({ ...context, serviceSlug: 'unsupported' as LandingService })).toThrow();
  });

  it('covers every current route with exactly four complete, stable and relevant FAQs', () => {
    const records = getLandingFaqRoutes();
    expect(records.length).toBe(12912);
    expect(new Set(records.map(record => record.path)).size).toBe(records.length);
    const problems: string[] = [];
    for (const record of records) {
      const entries = selectLandingFaqEntries(record.context);
      const commonIds = new Set(getLandingFaqPool('limpeza-sofas').slice(0, 12).map(entry => entry.id));
      if (record.faqs.length !== LANDING_FAQ_COUNT
        || new Set(record.faqs.map(faq => faq.question)).size !== 4
        || new Set(entries.map(entry => entry.topic)).size !== 4
        || entries.filter(entry => !commonIds.has(entry.id)).length < 2
        || JSON.stringify(record.faqs) !== JSON.stringify(getLandingFaqs(record.context))
        || record.faqs.some(faq => !faq.answer.trim() || /\{city\}|\{travelFee\}/.test(faq.answer))) problems.push(record.path);
    }
    expect(problems).toEqual([]);
    expect(browserRoutes().map(route => route.path).sort()).toEqual(generatedRoutes().map(route => route.path).sort());
  });

  it('varies actual question selections, not just location names or ordering', () => {
    const sets = new Set(Array.from({ length: 100 }, (_, index) => getLandingFaqs({ ...context, pageKey: `/limpeza-sofas-zona-${index}` }).map(faq => faq.question).sort().join('|')));
    expect(sets.size).toBeGreaterThan(60);
    expect(getLandingFaqs(context)).toEqual(getLandingFaqs(context));
    expect(getLandingFaqs({ ...context, pageKey: '/lavagem-sofa-lisboa', family: 'variante' })).not.toEqual(getLandingFaqs(context));
  });
});

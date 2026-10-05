import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RUG_PICKUP_FEE_RULE, RUG_PICKUP_RULE, rugPickupFee } from '../constants/commercialPolicy';
import { getAllPosts } from './blogData';
import { commercialHeroPriceLine } from './commercialHeroCopy';
import { getLandingFaqs } from './landingFaqPool';
import { getLandingFaqPool } from './landingFaqPool';
import { getPillarPage } from './pillarPages';
import { getProblemBySlug } from './problemSeoData';

/**
 * Tapetes: lavados em casa por defeito; recolha só quando o material ou o
 * estado do tapete o exigem, com entrega em até 4 dias úteis e com custo,
 * indicado no orçamento (dono, 2026-09-29/30).
 *
 * Até 2026-09-30 havia texto a dar a recolha como incluída ou como o modo
 * normal em cinco páginas de problema, nas páginas de tapetes por cidade, nas
 * variantes de keyword e no glossário. Parte desse texto já não chegava a
 * página nenhuma, mas voltava a aparecer no dia em que o campo fosse reativado,
 * por isso o teste lê as fontes e não só as páginas.
 *
 * Abaixo de 3 m² somados não há recolha (dono, 2026-09-30): as respostas que
 * explicam a recolha dizem-no, a partir de `RUG_PICKUP_RULE`.
 *
 * Desde 2026-10-05 o custo da recolha está escrito (dono), com a deslocação incluída: 10€ até 6 m²,
 * 15€ acima disso e 20€ a partir de 10 m², a partir de `RUG_PICKUP_FEE_RULE`.
 */
const ROOTS = ['src/data', 'src/constants', 'src/pages', 'src/components', 'scripts'];
const PICKUP_AS_DEFAULT = /recolha e entrega (ao domic[íi]lio|inclu[íi]das)|recolha e entrega\.|recolha ao domic[íi]lio|recolhemos e entregamos tapetes em toda|sem necessidade de recolha|n[ãa]o s[ãa]o anunciadas como servi[çc]o geral/i;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\./.test(entry)) out.push(path);
  }
  return out;
}

describe('recolha dos tapetes', () => {
  it('nenhum texto dá a recolha como incluída ou como o modo normal', () => {
    const offenders = ROOTS.flatMap(root => walk(root)).flatMap(file =>
      readFileSync(file, 'utf8').split('\n')
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => PICKUP_AS_DEFAULT.test(line))
        .map(({ line, index }) => `${file}:${index + 1}: ${line.trim().slice(0, 120)}`));
    expect(offenders).toEqual([]);
  });

  it('as respostas sobre recolha dizem que abaixo de 3 m² é sempre em casa', () => {
    const answers = [
      getPillarPage('/limpeza-tapetes').faqs.find(f => /retirada de casa/.test(f.question))?.answer,
      getLandingFaqPool('limpeza-tapetes').find(f => f.id === 'tapete-local')?.answer,
      getProblemBySlug('preco-limpeza-tapete')?.faqs.find(f => /recolha/i.test(f.question))?.answer,
      getAllPosts().flatMap(p => p.faq).find(f => /^Recolhem e entregam/.test(f.q))?.a,
    ];
    for (const answer of answers) {
      expect(answer).toContain(RUG_PICKUP_RULE);
      expect(answer).toContain(RUG_PICKUP_FEE_RULE);
    }
  });

  it('o custo da recolha segue os escalões do dono, pela área somada', () => {
    expect(rugPickupFee(2.99)).toBeNull();
    expect(rugPickupFee(3)).toBe(10);
    expect(rugPickupFee(6)).toBe(10);
    expect(rugPickupFee(6.01)).toBe(15);
    expect(rugPickupFee(9.99)).toBe(15);
    expect(rugPickupFee(10)).toBe(20);
    expect(rugPickupFee(40)).toBe(20);
    expect(rugPickupFee(Number.NaN)).toBeNull();
  });

  it('o texto do custo diz os mesmos valores que a função', () => {
    expect(RUG_PICKUP_FEE_RULE).toContain(`${rugPickupFee(6)}€ até 6 m²`);
    expect(RUG_PICKUP_FEE_RULE).toContain(`${rugPickupFee(7)}€ acima de 6 m²`);
    expect(RUG_PICKUP_FEE_RULE).toContain(`${rugPickupFee(10)}€ a partir de 10 m²`);
  });

  it('em tapetes e alcatifas a deslocação é sob orçamento, sem valor de tabela (dono, 2026-10-05)', () => {
    for (const slug of ['limpeza-tapetes', 'limpeza-alcatifas'] as const) {
      expect(commercialHeroPriceLine(slug, 'Porto')).not.toMatch(/\d\s*€/);
      const travelFaq = getLandingFaqs({ serviceSlug: slug, pageKey: 'teste', municipality: 'Porto', family: 'localidade' })
        .concat(getLandingFaqs({ serviceSlug: slug, pageKey: 'outra', municipality: 'Porto', family: 'preco' }))
        .find(f => /deslocação está incluída/.test(f.question));
      if (travelFaq) expect(travelFaq.answer).not.toMatch(/taxa da tabela/);
    }
    expect(commercialHeroPriceLine('limpeza-sofas', 'Porto')).toMatch(/deslocação 10€/);
  });
});

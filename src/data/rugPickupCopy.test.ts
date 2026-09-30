import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RUG_PICKUP_RULE } from '../constants/commercialPolicy';
import { getAllPosts } from './blogData';
import { getLandingFaqPool } from './landingFaqPool';
import { getPillarPage } from './pillarPages';
import { getProblemBySlug } from './problemSeoData';

/**
 * Tapetes: lavados em casa por defeito; recolha só quando o material ou o
 * estado do tapete o exigem, com entrega em 3 dias no máximo e com custo,
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
    for (const answer of answers) expect(answer).toContain(RUG_PICKUP_RULE);
  });
});

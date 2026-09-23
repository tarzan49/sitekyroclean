import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Um clique de contacto é medido **uma vez**, pelo delegado global em
 * `initContactTracking` (`src/lib/quizTracking.ts`). Os componentes declaram
 * só a origem em `data-tracking-source`; nunca chamam um medidor a partir de
 * `onClick`.
 *
 * Porque este teste existe: a regra já estava escrita no CLAUDE.md desde
 * 2026-09-18 e mesmo assim cinco âncoras `tel:` (rodapé PT e EN, hero mobile,
 * CTA final, página 404) continuaram com `onClick={() => trackCallClick(…)}`
 * até 2026-09-23. Como o helper não passava o evento original, a guarda de
 * deduplicação não o via e cada clique saía a dobrar para o GA4, para o Pixel
 * da Meta e para `quiz_events`, com duas origens diferentes. Uma regra escrita
 * não impede a regressão; um teste impede.
 */
const ROOTS = ['src/components', 'src/pages', 'src/hooks', 'src/services'];
const TRACKERS = /\b(trackCallClick|trackCallClickEvent|trackWhatsAppClick|trackContactClick)\s*\(/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path)) out.push(path);
  }
  return out;
}

describe('CTA de contacto', () => {
  it('nenhum componente chama um medidor de cliques de contacto a partir de onClick', () => {
    const offenders = ROOTS.flatMap(root => walk(root)).filter(file => TRACKERS.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

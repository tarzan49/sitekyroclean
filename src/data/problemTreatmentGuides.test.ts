import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { getAllProblems } from './problemSeoData';
import { getProblemLayout } from './problemLayout';
import { PROBLEM_TREATMENTS } from './problemTreatmentGuides';

describe('problem-specific treatments', () => {
  it('covers every problem with stable authored steps and existing local images', () => {
    const problems = getAllProblems();
    expect(Object.keys(PROBLEM_TREATMENTS).sort()).toEqual(problems.map(p => p.slug).sort());
    const sequences = new Set();
    for (const problem of problems) {
      const layout = getProblemLayout(problem);
      expect(layout.process).toHaveLength(problem.relatedServices[0] === 'impermeabilizacao' || problem.slug.startsWith('mofo-') ? 4 : 5);
      if (layout.process.length === 5) {
        expect(layout.process[1].label).toBe('Tratar');
        expect(['Escovar', 'Cuidar']).toContain(layout.process[2].label);
      }
      if (problem.relatedServices[0] === 'limpeza-tapetes' && !problem.slug.startsWith('mofo-')) expect(layout.process[2].description).toMatch(/juta, sisal, seda/);
      expect(layout.faqs).toHaveLength(4);
      expect(layout).toEqual(getProblemLayout(problem));
      sequences.add(layout.process.map(s => s.description).join('\n'));
      for (const step of layout.process) {
        expect(existsSync(`public${step.image}`)).toBe(true);
        expect(step.description).not.toMatch(/99%|certificad|alta temperatura|como novo|—/);
        expect(step.cell === undefined || (step.cell >= 0 && step.cell < 6)).toBe(true);
      }
    }
    expect(sequences.size).toBe(problems.length);
  });
});

import { describe, expect, it } from 'vitest';
import { getAllProblems } from '@/data/problemSeoData';
import { PROBLEM_WA_REQUESTS, buildProblemWaMessage, buildMaterialWaMessage, buildMarcaWaMessage } from './whatsappMessages';

const SHAPE = /^Olá! Gostaria de saber o preço e a disponibilidade para [^\n]+\.\n\n[^\n]+ $/;

describe('problem, material and brand WhatsApp messages', () => {
  it('has a written request for every problem page, and none for pages that no longer exist', () => {
    const slugs = getAllProblems().map(p => p.slug).sort();
    expect(Object.keys(PROBLEM_WA_REQUESTS).sort()).toEqual(slugs);
  });
  it.each(getAllProblems().map(p => p.slug))('%s: one sentence to finish, with and without a city', slug => {
    expect(buildProblemWaMessage(slug, 'Porto')).toMatch(SHAPE);
    expect(buildProblemWaMessage(slug, 'Porto')).toContain(' no Porto.');
    expect(buildProblemWaMessage(slug)).toMatch(/\n\nLocalidade[^\n]*: $/);
  });
  it.each(['sofa-pele', 'sofa-veludo', 'tapete-persa', 'tapete-la', 'tapete-sisal', 'tapete-sintetico', 'sofa-tecido'])('material %s', slug => {
    expect(buildMaterialWaMessage(slug, 'Braga')).toMatch(SHAPE);
    expect(buildMaterialWaMessage(slug, null)).toMatch(/\n\nLocalidade[^\n]*: $/);
  });
  it('brand pages name the brand and ask only the size', () => {
    expect(buildMarcaWaMessage('sofa', 'IKEA', 'Lisboa')).toBe('Olá! Gostaria de saber o preço e a disponibilidade para limpar o meu sofá IKEA em Lisboa.\n\nÉ um sofá de ');
    expect(buildMarcaWaMessage('cadeiras', 'IKEA', 'Lisboa')).toMatch(/Nº de cadeiras: $/);
  });
  it('promises nothing the client has to do later', () => {
    for (const slug of Object.keys(PROBLEM_WA_REQUESTS)) expect(buildProblemWaMessage(slug, 'Porto')).not.toMatch(/Posso enviar|Envio a seguir/);
  });
});

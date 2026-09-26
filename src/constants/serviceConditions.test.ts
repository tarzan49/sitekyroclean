import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SERVICE_CONDITIONS, SERVICE_CONDITIONS_LINKS, TRAVEL_FEE_MIN, TRAVEL_FEE_MAX, TRAVEL_PROMISE } from './commercialPolicy';
import { locationPrices } from './travel';
import { SERVICE_CONDITIONS_HTML } from '../../scripts/landing-page-html';

const read = (relative: string) => fs.readFileSync(path.resolve(__dirname, relative), 'utf-8');

// "Condições do serviço e garantia" aparece no fundo de todas as páginas. O
// rodapé React e o HTML estático tinham duas listas diferentes; passou a ser
// uma, e este teste rebenta se algum dos lados voltar a escrever a sua.
describe('condições do serviço', () => {
  it('as deslocações vêm da tabela de cada cidade', () => {
    const fees = Object.values(locationPrices);
    expect(TRAVEL_FEE_MIN).toBe(Math.min(...fees));
    expect(TRAVEL_FEE_MAX).toBe(Math.max(...fees));
    expect(TRAVEL_PROMISE).toContain(`entre ${TRAVEL_FEE_MIN}€ e ${TRAVEL_FEE_MAX}€`);
    expect(SERVICE_CONDITIONS).toContain(TRAVEL_PROMISE);
  });

  it('o HTML estático escreve a mesma lista, pela mesma ordem', () => {
    const paragraphs = [...SERVICE_CONDITIONS_HTML.matchAll(/<p>([^<]*)<\/p>/g)].map(match => match[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    expect(paragraphs).toEqual([...SERVICE_CONDITIONS]);
    for (const link of SERVICE_CONDITIONS_LINKS) expect(SERVICE_CONDITIONS_HTML).toContain(`href="${link.href}"`);
  });

  it('o rodapé React e as duas páginas do prerender usam essa lista e nenhuma frase à mão', () => {
    const component = read('../components/BusinessConditions.tsx');
    expect(component).toContain('SERVICE_CONDITIONS.map');
    expect(component).not.toMatch(/\d+€/);
    const prerender = read('../../scripts/prerender.ts');
    expect(prerender).toContain('SERVICE_CONDITIONS_HTML + ENTITY_FOOTER_HTML');
    expect(prerender).not.toContain('Deslocação a partir de 10€');
    expect(read('../../scripts/landing-page-html.ts')).toContain('${SERVICE_CONDITIONS_HTML}${ENTITY_FOOTER_HTML}');
  });

  it('sem travessão', () => {
    for (const text of SERVICE_CONDITIONS) expect(text).not.toContain('—');
  });
});

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Regra dos CTAs (dono, 25 Nov 2026): só existem dois, os da página inicial, e só pelo components/Cta.tsx. Este teste
// falha se alguém voltar a desenhar um botão de contacto ou de preço à mão, ou lhe der outro texto.
const files = (dir: string): string[] => readdirSync(dir).flatMap(n => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : /\.tsx$/.test(n) && !/\.test\.tsx$/.test(n) ? [p] : []; });
const all = [...files('src/components'), ...files('src/pages')].filter(p => !/[\\/](admin|ui)[\\/]|Admin|QuoteVisualPreview|Cta\.tsx$/.test(p));

describe('regra dos CTAs', () => {
  it('nenhum texto antigo de CTA', () => {
    const old = /Pedir orçamento por WhatsApp|Agendar limpeza|Pedir este orçamento|Pedir preço no WhatsApp|Falar diretamente connosco|Confirmar o meu orçamento|Confirmar pelo WhatsApp/;
    const bad = all.filter(p => old.test(readFileSync(p, 'utf8').split('\n').filter(l => !/^\s*(\/\/|\*|\{?\/\*)/.test(l)).join('\n')));
    expect(bad).toEqual([]);
  });
  it('nenhum botão verde de WhatsApp desenhado à mão (ícones redondos do cabeçalho à parte)', () => {
    const bad: string[] = [];
    for (const p of all) for (const m of readFileSync(p, 'utf8').matchAll(/<a\b[^]*?<\/a>/g)) {
      const t = m[0];
      if (/WHATSAPP_BASE|wa\.me|waHref|whatsappHref|waUrl/.test(t) && /bg-\[#(25D366|16833e|1DA851)\]|from-\[#1DA851\]/.test(t) && !/rounded-full/.test(t)) bad.push(`${p}: ${t.slice(0, 80)}`);
    }
    expect(bad).toEqual([]);
  });
});

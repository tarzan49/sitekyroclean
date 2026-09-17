// Renderizador do corpo dos artigos do blog.
//
// Existia em duas versões que divergiam. O React convertia `**negrito**` em
// <strong> e partia os parágrafos (BlogPost.tsx); o `scripts/prerender.ts`
// escapava o texto cru, por isso o HTML que os crawlers leem mostrava os
// asteriscos literais e as listas (`- item`, `1. passo`) apareciam como
// parágrafos corridos. Como o HTML estático é o único que os motores
// generativos leem, era exatamente a versão pior a ficar visível para eles.
//
// Passou a existir uma só função, usada pelos dois lados: as pessoas e os
// crawlers recebem a mesma estrutura, que é o que a regra anti-cloaking do
// CLAUDE.md exige (mesmos factos, renderização coerente).

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char => ESCAPES[char]);

// O escape corre primeiro: o `<strong>` é o único HTML que o texto do autor
// consegue produzir, nada do que esteja escrito em blogData.ts pode injetar
// marcação.
const inline = (text: string) =>
  escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

const BULLET = /^[-*]\s+/;
const ORDERED = /^\d+\.\s+/;

type Run = { kind: "ul" | "ol" | "p"; lines: string[] };

/**
 * Agrupa linhas consecutivas do mesmo tipo. Um bloco pode misturar uma linha
 * de introdução com uma lista a seguir ("**Residencial:**" seguido de itens),
 * por isso a decisão é por corrida de linhas e não por bloco inteiro.
 */
function groupLines(lines: string[]): Run[] {
  const runs: Run[] = [];
  for (const line of lines) {
    const kind: Run["kind"] = BULLET.test(line) ? "ul" : ORDERED.test(line) ? "ol" : "p";
    const last = runs[runs.length - 1];
    if (last && last.kind === kind) last.lines.push(line);
    else runs.push({ kind, lines: [line] });
  }
  return runs;
}

export function renderBlogBody(body: string): string {
  return body
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .flatMap(block => {
      const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
      return groupLines(lines).map(run => {
        if (run.kind === "p") return `<p>${run.lines.map(inline).join("<br/>")}</p>`;
        const items = run.lines
          .map(line => `<li>${inline(line.replace(run.kind === "ul" ? BULLET : ORDERED, ""))}</li>`)
          .join("");
        return `<${run.kind}>${items}</${run.kind}>`;
      });
    })
    .join("\n");
}

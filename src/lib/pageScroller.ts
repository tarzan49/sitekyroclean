/** Quem desliza na página: na página inicial, no telemóvel, é a caixa [data-home-scroller] (index.css); no resto é a
 *  janela. Quem precisa da posição do scroll pergunta aqui, e ouve 'scroll' na janela com `capture: true`. */
export function pageScroller(): HTMLElement {
  const box = document.querySelector<HTMLElement>('[data-home-scroller]');
  return box && getComputedStyle(box).overflowY !== 'visible' ? box : document.documentElement;
}
export const pageScrollTop = () => { const s = pageScroller(); return s === document.documentElement ? window.scrollY : s.scrollTop; };

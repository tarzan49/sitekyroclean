/** Quem desliza na página: nas páginas com secções de ecrã inteiro, no telemóvel, é a caixa #root (index.css); no resto é
 *  a janela. Quem precisa da posição do scroll pergunta aqui, e ouve 'scroll' na janela com `capture: true`. */
export function pageScroller(): HTMLElement {
  const box = document.getElementById('root');
  return box && /auto|scroll/.test(getComputedStyle(box).overflowY) ? box : document.documentElement;
}
export const pageScrollTop = () => { const s = pageScroller(); return s === document.documentElement ? window.scrollY : s.scrollTop; };

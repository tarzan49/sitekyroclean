/** Altura real do ecrã (dono, 24 Nov 2026, capturas do iPhone): `svh` é a altura do Safari com TODAS as barras abertas
 *  (em privado desconta ainda o aviso "Reduzir proteções"), por isso as secções a 100svh acabavam ~140 px antes do
 *  fim do ecrã e via-se a seguinte cortada. Aqui mede-se o ecrã a sério:
 *  --app-h   = altura visível no cimo da página (topo: os botões têm de caber com as barras abertas);
 *  --app-max = maior altura visível desta orientação (secções: barras recolhidas depois de deslizar).
 *  Só se mede na largura atual, para rodar o telemóvel recomeçar a conta. */
export function trackViewportHeight() {
  const root = document.documentElement;
  let width = 0; let max = 0; let top = 0;
  const measure = () => {
    const w = window.innerWidth; const h = window.innerHeight;
    if (!h) return;
    const touch = w < 768 && window.matchMedia('(pointer: coarse)').matches;
    if (w !== width || !touch) { width = w; max = 0; top = 0; }
    if (h > max) { max = h; root.style.setProperty('--app-max', `${h}px`); }
    if ((!top || window.scrollY < 4) && h !== top) { top = h; root.style.setProperty('--app-h', `${h}px`); }
  };
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('orientationchange', measure);
}

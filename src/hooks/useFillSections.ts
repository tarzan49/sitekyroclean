import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Telemóvel, páginas com secções de ecrã inteiro (dono, 24 Nov 2026: "não está a preencher aquilo que deveria"):
 *  o espaço que sobra numa secção vai para o conteúdo dela (fotografias, vídeos, cartões e linhas), em vez de ficar
 *  vazio por cima e por baixo. A altura da secção não muda: quem a dá é o min-height (index.css), por isso a página
 *  não salta. Uma fotografia nunca estica além da proporção que a cortaria. */
// O topo das páginas comerciais enche-se em CSS (styles/hero-mobile.css).
const SECTIONS = 'main > section:not(#orcamento):not([data-en-hero]):not([data-mobile-hero]), main [data-landing-section] > section, main [data-landing-section] > div > section, main #testemunhos > section, main #mesma-visita > section';
/** Altura / largura máxima de uma fotografia: perto da proporção dela, para encher sem a cortar dos lados. */
function maxRatio(box: HTMLElement) {
  const m = (box.matches('img, video') ? box : box.querySelector('img, video')) as HTMLImageElement | HTMLVideoElement | null;
  const w = m instanceof HTMLVideoElement ? m.videoWidth : m?.naturalWidth ?? 0;
  const h = m instanceof HTMLVideoElement ? m.videoHeight : m?.naturalHeight ?? 0;
  const small = box.offsetWidth < window.innerWidth * 0.6; // grelha de 2 colunas: fotografias em pé
  if (!w || !h) return small ? 1.25 : 1.05;
  return Math.min(1.4, Math.max(small ? 1.25 : 0.95, (h / w) * 1.3));
}
const TILE_MAX = 108;
const ROW_MAX = 78;

type Saved = { el: HTMLElement; css: string };

function boxOf(m: HTMLElement): HTMLElement {
  // A altura é dada pela imagem, ou pela moldura quando a imagem está em absoluto / a 100%.
  let el = m;
  while (el.parentElement && el.parentElement.tagName !== 'SECTION') {
    const cs = getComputedStyle(el);
    if (cs.position === 'absolute' || /\bh-full\b/.test(el.className)) { el = el.parentElement; continue; }
    break;
  }
  return el;
}

function rowsOf(els: HTMLElement[]) {
  const rows: HTMLElement[][] = [];
  for (const el of els) {
    const t = el.getBoundingClientRect().top;
    const row = rows.find(r => Math.abs(r[0].getBoundingClientRect().top - t) < 6);
    if (row) row.push(el); else rows.push([el]);
  }
  return rows;
}

function fill(section: HTMLElement, saved: Saved[]) {
  for (let i = saved.length - 1; i >= 0; i--) { saved[i].el.style.cssText = saved[i].css; }
  saved.length = 0;
  const keep = (el: HTMLElement) => { if (!saved.some(s => s.el === el)) saved.push({ el, css: el.style.cssText }); };
  const root = getComputedStyle(document.documentElement);
  const px = (v: string) => parseFloat(root.getPropertyValue(v)) || 0;
  const hero = section.hasAttribute('data-commercial-hero');
  const home = document.documentElement.classList.contains('snap-home');
  const target = hero ? px('--app-h') : px('--app-max') - (home ? 0 : root.getPropertyValue('--header-h').trim() ? px('--header-h') : 64);
  if (!target) return;
  const spareNow = () => {
    const old = section.style.cssText;
    section.style.setProperty('min-height', '0', 'important');
    section.style.setProperty('flex', '0 0 auto', 'important');
    const natural = section.getBoundingClientRect().height;
    section.style.cssText = old;
    return Math.floor(target - natural);
  };
  const isShown = (e: HTMLElement) => e.offsetParent !== null && e.getClientRects().length > 0;
  let spare = spareNow() - 4;
  if (spare < 16 && spare > -5) return;

  const media = [...section.querySelectorAll<HTMLElement>('img, video')].filter(isShown).map(boxOf)
    .filter((e, i, a) => a.indexOf(e) === i && e.offsetWidth > 110 && e.offsetHeight > 60 && !e.closest('button[aria-pressed], [data-no-fill]'));
  // Várias fotografias por cima umas das outras na mesma caixa contam uma vez.
  const boxes = media.filter(e => !media.some(o => o !== e && o.contains(e)));
  if (boxes.length) {
    const rows = rowsOf(boxes);
    const add = spare / rows.length;
    const plan = rows.flat().map(el => ({ el, h: el.offsetHeight, w: el.offsetWidth }));
    for (const { el, h, w } of plan) {
      // Moldura em pé no topo (cadeiras, impermeabilização): cresce inteira, na mesma proporção.
      const upright = hero && h > w * 1.1 && rows.every(r => r.length === 1);
      const max = upright ? (window.innerWidth - 40) * h / w : Math.max(h, w * (hero ? 0.88 : maxRatio(el)));
      // Se a secção não cabe, a fotografia encolhe (nunca abaixo de metade) em vez de empurrar o resto para fora do ecrã.
      const next = Math.floor(add < 0 ? Math.max(h * 0.5, h + add) : Math.min(max, h + add));
      keep(el);
      el.style.height = `${next}px`;
      if (upright) el.style.width = `${Math.floor(w * next / h)}px`;
      el.style.maxHeight = 'none'; el.style.aspectRatio = 'auto';
    }
    spare = spareNow() - 4;
  }
  if (spare < 16) return;

  // Cartões de escolha, linhas de listas e de perguntas, testemunhos.
  const grow = (els: HTMLElement[], cap: number) => {
    const list = els.filter(e => isShown(e) && e.offsetWidth > 80);
    if (!list.length) return;
    const rows = rowsOf(list); const add = spare / rows.length;
    const plan = rows.flat().map(el => ({ el, h: el.offsetHeight }));
    for (const { el, h } of plan) {
      const next = Math.floor(Math.min(Math.max(h, cap), h + add));
      if (next > h) { keep(el); el.style.minHeight = `${next}px`; if (/\bh-\d|h-\[/.test(el.className)) el.style.height = `${next}px`; }
    }
    spare = spareNow() - 4;
  };
  const q = (s: string) => [...section.querySelectorAll<HTMLElement>(s)];
  grow(q('[aria-roledescription="testemunho"] > figure, [aria-roledescription="testemunho"] > *').filter((e, i, a) => a.indexOf(e) === i), 420);
  if (spare < 16) return;
  const tiles = q('[data-fill-tile]');
  grow(tiles, rowsOf(tiles).length <= 2 ? TILE_MAX * 1.5 : TILE_MAX);
  if (spare < 16) return;
  grow(q('[data-fill-row], button[aria-expanded], details > summary, a.group').filter(e => !e.closest('[data-no-fill]') && e.offsetWidth > section.offsetWidth * 0.6), ROW_MAX + 30);
  if (spare < 40 || hero || section.querySelector('[data-price-picker]') || section.id === 'montar') return;
  // O resto (cartões de texto, listas): mais espaço dentro de cada um, repartido por igual.
  const cells = q('.grid > *, ul > li, ol > li, dl > div').filter(e => isShown(e) && e.offsetWidth > 100 && e.offsetHeight > 24 && !e.parentElement?.parentElement?.querySelector(':scope > [aria-expanded]') && !e.closest('[data-no-fill], [role="dialog"], [aria-roledescription], details') && !e.querySelector('.grid, ul, ol, img, video, button, select, input, h2'));
  if (cells.length < 2) return;
  const rows = rowsOf(cells);
  const pad = Math.floor(Math.min(spare / rows.length, 56) / 2);
  for (const el of cells) {
    const cs = getComputedStyle(el); const t = parseFloat(cs.paddingTop); const b = parseFloat(cs.paddingBottom);
    keep(el); el.style.paddingTop = `${t + pad}px`; el.style.paddingBottom = `${b + pad}px`;
  }
}

export function useFillSections() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.innerWidth >= 768) return;
    const state = new Map<HTMLElement, Saved[]>();
    let frame = 0;
    const dirty = new Set<HTMLElement>();
    let mo: MutationObserver;
    const run = () => {
      frame = 0;
      if (!document.documentElement.classList.contains('snap-sections') || window.innerWidth >= 768) return;
      // Os observadores ficam desligados enquanto se mede, para não reagirem às nossas próprias alturas.
      mo.disconnect();
      document.documentElement.classList.add('kyro-measuring');
      const list = dirty.size ? [...dirty] : [...document.querySelectorAll<HTMLElement>(SECTIONS)];
      dirty.clear();
      for (const s of list) {
        if (!s.isConnected || s.querySelector('[aria-expanded="true"]')) continue;
        if (!state.has(s)) state.set(s, []);
        fill(s, state.get(s)!);
      }
      document.documentElement.classList.remove('kyro-measuring');
      mo.takeRecords();
      mo.observe(document.body, { childList: true, subtree: true });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(run); };
    mo = new MutationObserver(records => {
      let any = false;
      for (const r of records) {
        const el = r.target instanceof HTMLElement ? r.target : null;
        const s = el?.closest<HTMLElement>(SECTIONS);
        if (s) { dirty.add(s); any = true; }
        else if (el?.closest('main') || el?.id === 'root') {
          for (const n of r.addedNodes) if (n instanceof HTMLElement) {
            for (const x of [n, ...n.querySelectorAll<HTMLElement>(SECTIONS)]) if (x.matches(SECTIONS)) { dirty.add(x); any = true; }
          }
        }
      }
      if (any) schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    const all = () => { dirty.clear(); schedule(); };
    schedule();
    const late = [300, 1200, 3000].map(ms => window.setTimeout(all, ms));
    document.fonts?.ready.then(all);
    window.addEventListener('resize', all);
    const onMedia = (e: Event) => { const s = (e.target as HTMLElement)?.closest?.<HTMLElement>(SECTIONS); if (s) { dirty.add(s); schedule(); } };
    document.addEventListener('load', onMedia, true); document.addEventListener('loadedmetadata', onMedia, true);
    return () => {
      document.removeEventListener('load', onMedia, true); document.removeEventListener('loadedmetadata', onMedia, true);
      mo.disconnect(); late.forEach(t => window.clearTimeout(t)); window.removeEventListener('resize', all);
      if (frame) cancelAnimationFrame(frame);
      for (const saved of state.values()) for (const x of saved) x.el.style.cssText = x.css;
    };
  }, [pathname]);
}

// O jsdom não tem IntersectionObserver nem ResizeObserver; os browsers têm. Sem isto, os testes das
// páginas do modelo novo (vídeos que só tocam à vista, cartões de avaliações) rebentavam antes de
// verificarem o que interessa (24 Nov).
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
const g = globalThis as Record<string, unknown>;
if (!g.IntersectionObserver) g.IntersectionObserver = NoopObserver;
if (!g.ResizeObserver) g.ResizeObserver = NoopObserver;
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList;
  }
  const doc = document as unknown as { fonts?: { ready: Promise<unknown> } };
  if (!doc.fonts) Object.defineProperty(document, 'fonts', { value: { ready: Promise.resolve() }, configurable: true });
}

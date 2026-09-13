import './fontPreview.css';

export function initFontPreview(mode: string) {
  if (mode === 'nova') {
    document.documentElement.dataset.fontPreview = 'nova';
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700&display=swap';
    document.head.append(font);
  }
  const toolbar = document.createElement('aside');
  toolbar.className = 'font-preview-toolbar';
  toolbar.setAttribute('aria-label', 'Comparação de tipografia');
  const label = document.createElement('strong');
  label.textContent = mode === 'nova' ? 'Proposta · Libre Franklin' : 'Fonte atual';
  toolbar.append(label);
  for (const [text, path, fontMode] of [
    ['Homepage', '/', mode],
    ['Paranhos', '/limpeza-sofas-porto-paranhos', mode],
    [mode === 'nova' ? 'Ver original' : 'Ver proposta', window.location.pathname, mode === 'nova' ? 'atual' : 'nova'],
  ]) {
    const link = document.createElement('a');
    link.textContent = text;
    link.href = `${path}?fonte=${fontMode}`;
    toolbar.append(link);
  }
  document.body.append(toolbar);
}

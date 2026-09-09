import { Link } from 'react-router-dom';

export function isAdsVisit(search: string) {
  const params = new URLSearchParams(search);
  return params.get('ads') === '1' || ['gclid', 'gbraid', 'wbraid'].some(key => params.has(key)) || ['cpc', 'ppc', 'paidsearch'].includes(params.get('utm_medium')?.toLowerCase() ?? '');
}
export function AdsLandingHeader() {
  return <header className="bg-white px-5 py-3 border-b border-black/10">
    <p className="font-playfair text-center text-lg">Kyro Clean Solutions</p>
    <nav aria-label="Nesta página" className="flex justify-center gap-4 text-xs mt-1">
      {[['resultados', 'Resultados'], ['precos', 'Preços'], ['avaliacoes', 'Avaliações'], ['duvidas', 'Dúvidas']].map(([id, label]) => <a key={id} href={`#${id}`} className="min-h-11 flex items-center underline underline-offset-4">{label}</a>)}
    </nav>
  </header>;
}
export function AdsLandingFooter() {
  return <footer className="bg-[#071a12] text-white/80 p-6 text-center text-xs">
    <p className="mb-3">Kyro Clean Solutions</p>
    <div className="flex flex-wrap justify-center gap-4"><Link to="/politica-de-privacidade">Política de Privacidade</Link><Link to="/termos-e-condicoes">Termos e Condições</Link></div>
  </footer>;
}

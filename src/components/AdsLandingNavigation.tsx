import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export function isAdsVisit(search: string) {
  const params = new URLSearchParams(search);
  return params.get('ads') === '1' || ['gclid', 'gbraid', 'wbraid'].some(key => params.has(key)) || ['cpc', 'ppc', 'paidsearch'].includes(params.get('utm_medium')?.toLowerCase() ?? '');
}
/** `whatsappHref` é o do botão principal da página, com o serviço e a cidade. */
export function AdsLandingHeader({ whatsappHref }: { whatsappHref: string }) {
  return <header className="bg-white px-5 py-3 border-b border-black/10">
    <div className="relative flex items-center justify-center min-h-11">
      <p className="font-playfair text-center text-lg">Kyro Clean Solutions</p>
      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-tracking-source="header_ads" aria-label="Pedir orçamento por WhatsApp" className="absolute right-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#16833e] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2F2A]"><MessageCircle className="h-5 w-5" /></a>
    </div>
    <nav aria-label="Nesta página" className="flex justify-center gap-4 text-sm mt-1">
      {[['resultados', 'Resultados'], ['precos', 'Preços'], ['avaliacoes', 'Avaliações'], ['duvidas', 'Dúvidas']].map(([id, label]) => <a key={id} href={`#${id}`} className="min-h-11 flex items-center underline underline-offset-4">{label}</a>)}
    </nav>
  </header>;
}
export function AdsLandingFooter() {
  return <footer className="bg-[#071a12] text-white/80 p-6 text-center text-sm">
    <p className="mb-3">Kyro Clean Solutions</p>
    <div className="flex flex-wrap justify-center gap-4"><Link to="/politica-de-privacidade">Política de Privacidade</Link><Link to="/termos-e-condicoes">Termos e Condições</Link></div>
  </footer>;
}

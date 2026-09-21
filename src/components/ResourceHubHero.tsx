import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getResourceWhatsapp } from '@/data/resourceContent';
import { RESPONSE_PROMISE } from '@/constants/commercialPolicy';

export default function ResourceHubHero({ title, description }: { title: string; description: string }) {
  const words = title.split(' '); const gold = words.pop();
  return <section data-mobile-hero="text" className="bg-kyro-green text-white pt-24 pb-10 sm:pb-14">
    <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm flex items-center gap-2 mb-5"><Link to="/">Início</Link><span>/</span><Link to="/blog">Recursos</Link></nav>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-7 lg:gap-14 items-center">
        <div><h1 className="type-page-title text-white mb-4">{words.join(' ')} <span className="text-[#D4AF37]">{gold}</span></h1><p className="type-lead text-white/85 max-w-2xl">{description}</p></div>
        <div><a href={getResourceWhatsapp()} target="_blank" rel="noopener noreferrer" data-tracking-source="resource-hub" className="flex min-h-[54px] items-center justify-center gap-2 bg-[#16833e] hover:bg-[#116b32] rounded-sm px-4 py-3 font-semibold text-base"><MessageCircle className="w-5 h-5 shrink-0" />Pedir orçamento por WhatsApp</a><Link to="/#servicos" className="flex justify-center items-center min-h-11 text-base underline underline-offset-4">Ver serviços e preços</Link><p className="text-sm text-center">{RESPONSE_PROMISE}</p></div>
      </div>
    </div>
  </section>;
}

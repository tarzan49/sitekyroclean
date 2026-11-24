import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getResourceWhatsapp } from '@/data/resourceContent';
import { RESPONSE_PROMISE } from '@/constants/commercialPolicy';
import { REVIEW_RATING, REVIEW_COUNT } from '@/constants/business';

// Topo dos recursos (perguntas, glossário, blog) no estilo novo (dono, 24 Nov): verde, título em Playfair com a
// última palavra a dourado, prova social e um só botão, o WhatsApp com a cor do topo das páginas de serviço.
export default function ResourceHubHero({ title, description }: { title: string; description: string }) {
  const words = title.split(' '); const gold = words.pop();
  return <section data-mobile-hero="text" className="bg-kyro-green text-white pt-24 pb-10 sm:pb-14">
    <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-white/70"><Link to="/">Início</Link><span>/</span><Link to="/blog">Recursos</Link></nav>
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div>
          <h1 className="font-playfair mb-3 text-[28px] font-semibold leading-tight text-white md:text-5xl">{words.join(' ')} <em className="not-italic text-[#D4AF37]">{gold}</em></h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-white/80 md:text-lg">{description}</p>
          <p className="mt-3 text-sm text-white/80"><span className="font-bold text-[#D4AF37]">{REVIEW_RATING}★</span> no Google · +{REVIEW_COUNT} avaliações</p>
        </div>
        <div>
          <a href={getResourceWhatsapp()} target="_blank" rel="noopener noreferrer" data-tracking-source="resource-hub" className="flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[#16833e] px-4 py-3 text-base font-semibold hover:bg-[#116b32]"><MessageCircle className="h-5 w-5 shrink-0" />Pedir orçamento por WhatsApp</a>
          <p className="mt-2 text-center text-sm text-white/70">{RESPONSE_PROMISE}</p>
        </div>
      </div>
    </div>
  </section>;
}

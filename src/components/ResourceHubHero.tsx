import { WhatsAppCta } from '@/components/Cta';
import type { ReactNode } from 'react';
import HeroPhoto from '@/components/HeroPhoto';
import { Link, NavLink } from 'react-router-dom';

import { getResourceWhatsapp } from '@/data/resourceContent';
import { RESPONSE_PROMISE } from '@/constants/commercialPolicy';
import { REVIEW_RATING, REVIEW_COUNT } from '@/constants/business';

const TABS = [['/blog', 'Guias'], ['/perguntas-frequentes-limpeza-estofos', 'Perguntas'], ['/glossario-limpeza-estofos', 'Glossário']];

// Topo dos recursos (guias, perguntas, glossário). No telemóvel ocupa o ecrã todo, com um vídeo real da equipa em cima
// e, em baixo, o título, a avaliação, o WhatsApp, os separadores e o que a página precisar (pesquisa) (dono, 25 Nov:
// "esta secção não levou com as devidas alterações"). No computador fica como estava.
export default function ResourceHubHero({ title, description, image, video, poster, children }: { title: string; description: string; image?: string; video?: string; poster?: string; children?: ReactNode }) {
  const words = title.split(' '); const gold = words.pop();
  return <section data-mobile-hero="text" data-resource-hero className="relative isolate overflow-hidden bg-kyro-green text-white pt-24 pb-10 sm:pb-14">
    {image && !video && <div className="hidden md:block"><HeroPhoto src={image} /></div>}
    {video && <div aria-hidden="true" data-resource-media className="absolute inset-0 -z-10 md:inset-auto md:!w-auto md:right-[9%] md:top-1/2 md:z-0 md:aspect-[9/16] md:h-[64%] md:-translate-y-[46%] md:overflow-hidden md:rounded-2xl md:shadow-2xl">
      <video src={video} poster={poster} autoPlay muted loop playsInline preload="metadata" className="h-[62%] w-full object-cover md:h-full" />
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,26,18,.12)_0%,rgba(7,26,18,.25)_26%,#0B2F2A_60%,#071a12_100%)] md:hidden" />
    </div>}
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-sm text-white/85 md:mb-4 md:text-white/70"><Link to="/">Início</Link><span>/</span><Link to="/blog">Recursos</Link></nav>
      <div className="grid items-center gap-4 md:max-w-[520px]">
        <div>
          <h1 className="font-playfair mb-2 text-[30px] font-semibold leading-[1.13] text-white md:mb-3 md:text-5xl">{words.join(' ')} <em className="not-italic text-[#D4AF37]">{gold}</em></h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/85 md:text-lg md:text-white/80">{description}</p>
          <p className="mt-3 text-[15px] text-white/85 md:text-sm md:text-white/80"><span className="font-bold text-[#D4AF37]">{REVIEW_RATING}★</span> no Google · +{REVIEW_COUNT} avaliações</p>
        </div>
        <div>
          <WhatsAppCta href={getResourceWhatsapp()} source="resource-hub" />
          <p className="mt-2 text-center text-sm text-white/75">{RESPONSE_PROMISE}</p>
        </div>
      </div>
      <nav aria-label="Recursos" className="mt-4 grid grid-cols-3 gap-2 md:hidden">
        {TABS.map(([to, label]) => <NavLink key={to} to={to} end className={({ isActive }) => `flex min-h-12 items-center justify-center rounded-xl border-2 text-[15px] font-semibold ${isActive ? 'is-on border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#E8C964]' : 'border-white/20 bg-white/[0.06] text-white'}`}>{label}</NavLink>)}
      </nav>
      {children && <div className="mt-3 md:hidden">{children}</div>}
    </div>
  </section>;
}

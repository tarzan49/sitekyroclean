import { WhatsAppCta } from '@/components/Cta';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { GoogleG } from '@/components/icons/GoogleG';
import { REVIEW_COUNT, REVIEW_RATING } from '@/constants/business';

interface Props { title: string; subtitle: string; category: string; byline: ReactNode; image: string; imageAlt: string; priceLine: string; whatsappHref: string; source: string }

/** Topo dos artigos: título, fotografia real e um só botão, num ecrã (dono, 25 Nov: artigo continua artigo). */
export default function ArticleHero({ title, subtitle, category, byline, image, imageAlt, priceLine, whatsappHref, source }: Props) {
  const words = title.trim().split(' ');
  const gold = words.pop();
  return <section data-mobile-hero className="bg-kyro-green pb-6 pt-[calc(var(--header-h,57px)+8px)] text-white lg:pb-12 lg:pt-[calc(var(--header-h,61px)+36px)]">
    <div className="mx-auto grid max-w-6xl items-center gap-x-12 gap-y-4 px-5 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:px-8">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-1 flex flex-wrap items-center gap-2 text-sm text-white/70 lg:mb-4"><Link to="/">Início</Link><span>/</span><Link to="/blog">Blog</Link><span>/</span><span>{category}</span></nav>
        <h1 className="font-playfair text-[26px] font-semibold leading-[1.15] text-white [text-wrap:balance] md:text-4xl lg:text-5xl">{words.join(' ')} <em className="not-italic text-[#D4AF37]">{gold}</em></h1>
        <p className="mt-2 text-[13px] text-white/75 lg:mt-4 lg:text-sm">{byline}</p>
      </div>
      <img src={image} alt={imageAlt} width={800} height={600} fetchPriority="high" className="h-[20svh] w-full rounded-xl object-cover lg:row-span-2 lg:h-auto lg:max-h-[440px] lg:aspect-[4/3]" />
      <div className="min-w-0">
        <p className="text-[15px] leading-relaxed text-white/85 md:text-lg">{subtitle}</p>
        <div className="my-4 grid grid-cols-2 divide-x divide-white/15 rounded-lg border border-white/15 py-2.5 text-center">
          <a href="#precos" className="flex items-center justify-center px-2 font-playfair text-lg font-semibold leading-tight text-[#D4AF37]">{priceLine.replace(/\.$/, '')}</a>
          <p className="flex flex-col items-center px-2 leading-tight"><span className="flex items-center gap-1.5 text-lg font-semibold text-white"><GoogleG className="h-4 w-4" />{REVIEW_RATING}★</span><span className="text-xs text-white/75">+{REVIEW_COUNT} avaliações Google</span></p>
        </div>
        <WhatsAppCta href={whatsappHref} source={source} />
      </div>
    </div>
  </section>;
}

import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, MessageCircle, Star } from 'lucide-react';
import type { ProblemPage } from '@/data/problemSeoData';
import { getProblemHero } from '@/data/problemHero';
import { categoryForServiceSlug } from '@/data/beforeAfterPool';
import { REVIEW_RATING, REVIEW_COUNT } from '@/constants/business';
import { GOOGLE_REVIEWS_VIEW_URL } from '@/constants/google';
import { GoogleG } from '@/components/icons/GoogleG';
import HeroBeforeAfterPool from '@/components/HeroBeforeAfterPool';
import { trackWhatsAppClick } from '@/lib/quizTracking';

export default function ProblemHero({ problem, city }: { problem: ProblemPage; city?: string }) {
  const hero = getProblemHero(problem, city);
  const category = categoryForServiceSlug(hero.service.slug);
  const words = hero.title.split(' ');
  const lastWord = words.pop();
  return (
    <section className="relative overflow-hidden bg-[#071a12] pt-20 pb-10 sm:pt-24 sm:pb-14 lg:pt-28 lg:pb-20" aria-label="Apresentação do serviço">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 95% 0%, #214a35 0%, transparent 65%)' }} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-x-2 text-xs text-white/65">
          <Link to="/" className="inline-flex min-h-11 items-center hover:text-white">Início</Link>
          <span aria-hidden="true">/</span>
          <Link to={hero.service.baseRoute} className="inline-flex min-h-11 items-center hover:text-white">{hero.service.name}</Link>
          {city && <><span aria-hidden="true">/</span><span>{city}</span></>}
        </nav>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <p className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
              <span className="h-px w-7 bg-[#D4AF37]" aria-hidden="true" />{hero.eyebrow}
            </p>
            <h1 className="font-playfair text-[2rem] font-semibold leading-[1.12] tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">
              {words.join(' ')} <span className="text-[#D4AF37]">{lastWord}</span>
              {hero.location && <span className="mt-2 block text-[1.35rem] leading-tight tracking-normal text-white/85 sm:text-2xl">{" "}{hero.location}</span>}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">{hero.intro}</p>
            <a href={GOOGLE_REVIEWS_VIEW_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 flex-wrap items-center gap-2 text-sm text-white/85 hover:text-white" aria-label={`${REVIEW_RATING} de 5, ${REVIEW_COUNT}+ avaliações no Google`}>
              <GoogleG className="h-4 w-4" />
              <strong className="font-semibold text-white">{REVIEW_RATING}</strong><Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" aria-hidden="true" />
              <span className="text-white/70">· {REVIEW_COUNT}+ avaliações Google</span>
            </a>
            <div className="mt-4 max-w-xl">
              <a href={hero.waHref} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick(`problem_hero_${problem.slug}${city ? `_${city}` : ''}`)}
                className="flex min-h-14 items-center justify-center gap-3 rounded-sm bg-[#16833e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#116b32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]">
                <MessageCircle className="h-5 w-5 shrink-0" />Pedir orçamento por WhatsApp<ArrowRight className="ml-auto h-4 w-4 shrink-0" />
              </a>
              <p className="mt-2 text-center text-xs leading-relaxed text-white/75">{hero.response} · Sem compromisso</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/15 pt-3">
                <div className="py-1">
                  <p className="text-sm font-semibold text-white">{hero.priceLabel}</p>
                  <p className="mt-1 text-xs text-white/70">+ {hero.travelLabel.toLowerCase()}</p>
                </div>
                <a href="#precos" className="inline-flex min-h-11 items-center gap-2 text-sm text-[#D4AF37] underline underline-offset-4">{hero.priceLinkLabel}<ArrowDown className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
          {category && <div className="min-w-0 border-t border-[#D4AF37]/45 pt-4 lg:border-t-0 lg:pt-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{category === 'impermeabilizacao' ? 'Veja o efeito da proteção' : 'Veja a diferença no estofo'}</p>
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/60">{category === 'impermeabilizacao' ? 'Comparação' : 'Antes / depois'}</span>
            </div>
            <HeroBeforeAfterPool category={category} className="overflow-hidden rounded-sm" />
          </div>}
        </div>
      </div>
    </section>
  );
}

import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageCircle, Timer } from 'lucide-react';
import { GoogleG } from './icons/GoogleG';
import HeroBeforeAfterPool from './HeroBeforeAfterPool';
import ServiceSnapshotStats from './ServiceSnapshotStats';
import type { BreadcrumbItem } from './PageBreadcrumb';
import { categoryForServiceSlug } from '@/data/beforeAfterPool';
import { pickServiceHero } from '@/constants/serviceContent';
import { REVIEW_COUNT, REVIEW_RATING } from '@/constants/business';
import { locationPrices } from '@/constants/travel';
import { services } from '@/data/locationSeoData';
import { trackWhatsAppClick } from '@/lib/quizTracking';
import { commercialHeroSubtitle } from '@/data/commercialHeroCopy';

interface Props {
  title: string;
  subtitle?: string;
  serviceSlug: string;
  city?: string;
  municipality?: string;
  price?: string;
  image?: string | { m: string; d: string };
  breadcrumbs?: BreadcrumbItem[];
  whatsappHref: string;
  source: string;
  pricesHref?: string;
  preserveMobileHero?: boolean;
}

/** Mandatory commercial hero order, shared by every service page family. */
export default function CommercialHero({ title, subtitle, serviceSlug, city, municipality = city, price, image, breadcrumbs, whatsappHref, source, pricesHref = '#precos', preserveMobileHero = false }: Props) {
  const service = services.find(item => item.slug === serviceSlug);
  const background = image ?? pickServiceHero(serviceSlug, city ?? title);
  const imgs = typeof background === 'string' ? { m: background, d: background } : background;
  const category = categoryForServiceSlug(serviceSlug);
  const items = breadcrumbs ?? [{ label: 'Início', to: '/' }, { label: service?.name ?? title, to: service?.baseRoute }, ...(city ? [{ label: city }] : [])];
  const fee = municipality ? locationPrices[municipality] : undefined;
  const value = price ?? service?.priceFrom ?? 'Sob orçamento';
  const priceText = /orçamento/i.test(value) ? 'Sob orçamento' : `Desde ${value}`;
  const words = title.trim().split(' ');
  const gold = words.pop();
  const stats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    { value: '<10 min', label: 'Resposta', icon: Clock },
    serviceSlug === 'impermeabilizacao'
      ? { value: 'Até 24 h', label: 'Ativação da proteção', icon: Timer }
      : { value: '3 a 6 h', label: 'Secagem média', icon: Timer },
  ];
  return <section data-commercial-hero data-mobile-hero={preserveMobileHero ? undefined : true} className="relative isolate overflow-hidden pt-[68px] sm:pt-24 text-white">
    <picture className="absolute inset-0 -z-20" aria-hidden="true">
      <source media="(max-width: 767px)" srcSet={preserveMobileHero ? imgs.m : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} />
      <img src={imgs.d} alt="" className="h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
    </picture>
    <div className="absolute inset-0 -z-10" aria-hidden="true" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.48) 0%, rgba(0,0,0,.54) 55%, rgba(0,0,0,.68) 100%)' }} />
    <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 pb-4 sm:pb-8">
      <div className="grid items-center gap-4 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <nav data-hero-part="breadcrumb" aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-x-2 text-[11px] leading-relaxed text-white/85" style={{ fontFamily: 'var(--font-kyro)' }}>
            {items.map((item, index) => <Fragment key={`${item.label}-${index}`}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.to ? <Link to={item.to} className="inline-flex min-h-9 items-center hover:text-white">{item.label}</Link> : <span className="py-2">{item.label}</span>}
            </Fragment>)}
          </nav>
          <h1 data-hero-part="title" className="font-playfair text-[1.75rem] sm:text-4xl lg:text-5xl font-semibold leading-[1.12] text-white" style={{ textShadow: '0 2px 12px rgba(0,0,0,.5)' }}>{words.join(' ')} <span className="text-[#D4AF37]">{gold}</span></h1>
          <p data-hero-part="subtitle" className="mt-3 mb-4 max-w-lg text-sm sm:text-base leading-relaxed text-white/90" style={{ textShadow: '0 1px 6px rgba(0,0,0,.65)' }}>{subtitle ?? commercialHeroSubtitle(serviceSlug, municipality)}</p>
          <a data-hero-part="whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick(source)} className="flex min-h-[52px] items-center justify-center gap-2 bg-[#16833e] px-3 py-3 text-sm font-semibold text-white hover:bg-[#116b32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"><MessageCircle className="h-5 w-5 shrink-0" />Pedir orçamento por WhatsApp</a>
          <a data-hero-part="prices" href={pricesHref} className="flex min-h-11 items-center justify-center text-sm text-white underline underline-offset-4">Ver preços</a>
          <p className="text-[11px] leading-relaxed text-white/85">{priceText} + deslocação {fee === undefined ? 'a partir de 10€' : `${fee}€`}.</p>
        </div>
        <div data-hero-part="comparison" id="resultados" className="min-w-0 scroll-mt-20">
          {category && <HeroBeforeAfterPool category={category} className="border-t-2 border-[#D4AF37]" />}
        </div>
      </div>
    </div>
    <div data-hero-part="stats"><ServiceSnapshotStats stats={stats} /></div>
  </section>;
}

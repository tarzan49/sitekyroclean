import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Layers, MapPin, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommercialHero from '@/components/CommercialHero';
import SectionHeader from '@/components/SectionHeader';
import PackConfigurator from '@/components/PackConfigurator';
import CustomerReviews from '@/components/CustomerReviews';
import ServiceProcessGuide from '@/components/ServiceProcessGuide';
import SofaProcessGuide from '@/components/SofaProcessGuide';
import ServiceFAQ from '@/components/ServiceFAQ';
import ServiceLocationSchema from '@/components/ServiceLocationSchema';
import NotFound from '@/pages/NotFound';
import { getAllPackComboRoutes, getPackByCityAndId, packFaqs, packPriceFrom, otherPacksInCity, PACK_KINDS, PACK_INITIAL_EXTRA } from '@/data/packComboData';
import { services, cityPrep } from '@/data/serviceCatalog';
import { pickReviewSubset } from '@/data/reviewsPool';
import { locationPrices } from '@/constants/travel';
import { PACK_PERK_MIN_ORDER, PACK_PERK_MATTRESS_OFF, PACK_PERK_SOFA_PRICE, PACK_PERK_CHAIRS_SET } from '@/constants/packPerks';
import { PRICE_PROMISE, AVAILABILITY_PROMISE, SATISFACTION_PROMISE } from '@/constants/commercialPolicy';
import { SITE_URL, WHATSAPP_BASE } from '@/constants/business';
import { buildPackWaMessage } from '@/lib/whatsappMessages';
import type { ProcessServiceSlug } from '@/data/serviceProcessGuides';

const container = 'max-w-7xl mx-auto px-5 sm:px-6 lg:px-8';

/**
 * Páginas pack × cidade (4 packs × 61 cidades). Landing a sério: prova
 * primeiro, configurador a seguir. `/packs` (o configurador sem cidade) foi
 * removido — estas páginas são os únicos packs do site. O configurador é
 * PackConfigurator (partilhado, ver o próprio ficheiro) e as regalias são as
 * mesmas do upsell do quiz.
 */
export default function PackComboPage() {
  const { pathname } = useLocation();
  const route = getAllPackComboRoutes().find(r => r.path === pathname);
  const data = route && getPackByCityAndId(route.packId, route.citySlug);

  const heading = data ? `${data.pack.name} ${cityPrep(data.city.name)} ${data.city.name}` : '';
  const title = data ? `${heading} | Kyro Clean Solutions` : '';
  const description = data ? `${data.pack.description} Serviço ao domicílio ${cityPrep(data.city.name)} ${data.city.name}.` : '';

  useEffect(() => {
    if (!data) return;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', SITE_URL + pathname);
    for (const key of ['og:title', 'twitter:title']) document.querySelector(`meta[property="${key}"],meta[name="${key}"]`)?.setAttribute('content', title);
    for (const key of ['og:description', 'twitter:description']) document.querySelector(`meta[property="${key}"],meta[name="${key}"]`)?.setAttribute('content', description);
  }, [pathname, data, title, description]);

  const [activeProcessSlug, setActiveProcessSlug] = useState(data?.pack.service1Slug ?? '');
  useEffect(() => { if (data) setActiveProcessSlug(data.pack.service1Slug); }, [data?.pack.service1Slug]);
  const [openNext, setOpenNext] = useState<string | null>(null);
  useEffect(() => setOpenNext(null), [pathname]);

  if (!data) return <NotFound />;

  const { pack, city } = data;
  const priceFrom = packPriceFrom(pack);
  const travelFee = locationPrices[city.name];
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildPackWaMessage(pack.name, city.name))}`;
  const packServices = [pack.service1Slug, pack.service2Slug].map(slug => services.find(s => s.slug === slug)).filter(Boolean);
  const reviews = pickReviewSubset(pack.service1Slug, `${pathname}`, 6);
  const faqs = packFaqs(pack, city.name);

  const perks = [
    {
      title: 'Preço de pack no que acrescentar',
      text: `Sofá a partir de ${PACK_PERK_SOFA_PRICE['1-lugar']}€, menos ${PACK_PERK_MATTRESS_OFF}€ em cada colchão e uma cadeira oferecida por cada ${PACK_PERK_CHAIRS_SET}.`,
      image: '/images/pack-perks/pack-artigos-800.webp',
      alt: 'Colchão, sofá, cadeira e tapete: os artigos que pode juntar no mesmo pack',
    },
    {
      title: 'Uma só deslocação',
      text: `A equipa vem uma vez com o equipamento todo e paga ${travelFee != null ? `${travelFee}€ de deslocação` : 'a deslocação'} uma única vez.`,
      image: '/images/pack-perks/pack-uma-deslocacao-800.webp',
      alt: 'Equipa Kyro Clean com o equipamento de limpeza numa sala',
    },
    {
      title: 'Valor fechado antes de marcar',
      text: 'Recebe o valor final por WhatsApp e só marca a visita depois de concordar.',
      image: '/images/pack-perks/pack-valor-confirmado-800.webp',
      alt: 'Cliente satisfeita no sofá depois da limpeza',
    },
  ];

  return <>
    <ServiceLocationSchema
      serviceName={pack.name}
      serviceBaseUrl={services.find(s => s.slug === pack.service1Slug)?.baseRoute ?? '/guia-de-packs'}
      placeName={city.name}
      description={description}
      pageUrl={pathname}
      priceFrom={priceFrom}
    />
    <Header />
    <main>
      <CommercialHero
        title={heading}
        subtitle={`${pack.tagline}. ${pack.description}`}
        serviceSlug={pack.service1Slug}
        secondaryServiceSlug={pack.service2Slug}
        city={city.name}
        price={priceFrom}
        breadcrumbs={[{ label: 'Início', to: '/' }, { label: 'Packs', to: '/guia-de-packs' }, { label: heading }]}
        whatsappHref={waHref}
        source={`pack_hero_${pack.id}_${city.slug}`}
        pricesHref="#montar"
      />

      {/* 1. O que está incluído, e já com o configurador. */}
      <section id="montar" className="scroll-mt-20 py-14 md:py-20 lg:py-10 bg-[#FDFDF9]">
        <div className={container}>
          <SectionHeader
            overline={pack.name}
            heading="Monte o seu pack"
            goldWord={`${cityPrep(city.name)} ${city.name}`}
            subtitle={`Preço de pack a partir de ${PACK_PERK_MIN_ORDER}€.`}
            className="lg:!mb-5"
          />
          <div className="bg-white border border-[#E5E0D3] rounded-2xl p-3 sm:p-5 md:p-6 lg:p-4">
            <PackConfigurator
              initialKinds={PACK_KINDS[pack.id]}
              initialExtra={PACK_INITIAL_EXTRA[pack.id]}
              initialCity={city.name}
              source={`pack_configurator_${pack.id}_${city.slug}`}
            />
          </div>
        </div>
      </section>

      {/* 2. Prova: quem já recebeu a equipa. Verde: alterna com o branco da secção 3. */}
      <section id="avaliacoes" className="scroll-mt-20 py-14 md:py-20 bg-kyro-green text-white">
        <div className={container}>
          <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" light={false} subtitle="Nas palavras de quem já nos recebeu em casa." />
          <CustomerReviews reviews={reviews} />
        </div>
      </section>

      {/* 3. Porquê um pack: as regalias, ditas depois de já ter montado o pedido. Branco: alterna com o verde da secção 2. */}
      <section id="regalias" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
        <div className={container}>
          <SectionHeader
            overline="Vantagens do pack"
            heading="Porquê juntar tudo"
            goldWord="numa visita"
            subtitle={`A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o primeiro artigo fica ao preço de tabela e os que acrescentar entram com preço de pack.`}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map(perk => <article key={perk.title} className="overflow-hidden rounded-2xl bg-white border border-[#E5E0D3]">
              <img
                src={perk.image}
                alt={perk.alt}
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-5">
                <h3 className="font-semibold text-lg text-[#1A1A1A] leading-snug mb-1.5">{perk.title}</h3>
                <p className="text-[#555] leading-relaxed">{perk.text}</p>
              </div>
            </article>)}
          </div>
        </div>
      </section>

      {/* 4. Como decorre a visita. Um pack junta 2 serviços: a pessoa escolhe qual processo ver. Verde: alterna com o branco da secção 3 (regalias). */}
      {(() => {
        const processSlug = packServices.some(service => service!.slug === activeProcessSlug) ? activeProcessSlug : pack.service1Slug;
        const switcher = packServices.length > 1 ? <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Escolher processo">
          {packServices.map(service => <button key={service!.slug} type="button" role="tab" aria-selected={processSlug === service!.slug}
            onClick={() => setActiveProcessSlug(service!.slug)}
            className={`min-h-11 px-4 rounded-full border text-sm font-semibold transition-colors ${processSlug === service!.slug ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white' : 'border-white/25 text-white/70 hover:border-[#D4AF37]/50 hover:text-white'}`}>
            {service!.name}
          </button>)}
        </div> : undefined;
        return processSlug === 'limpeza-sofas'
          ? <SofaProcessGuide city={city.name} cityPrep={cityPrep(city.name)} dark switcher={switcher} />
          : <ServiceProcessGuide serviceSlug={processSlug as ProcessServiceSlug} city={city.name} cityPrep={cityPrep(city.name)} dark switcher={switcher} />;
      })()}

      {/* 5. Dúvidas do pack, com schema. Branco: alterna com o verde da secção 4. */}
      <ServiceFAQ faqs={faqs} heading={`Perguntas sobre o ${pack.name.toLowerCase()} ${cityPrep(city.name)} ${city.name}`} variant="light" />

      {/* 6. Onde ir a seguir, sem deixar a página sem saída. Mesma estrutura e paleta da secção "Áreas de serviço" (ServiceCityLinks): cabeçalho editorial e linhas em acordeão (pedido do dono, 2026-09-24). */}
      {(() => {
        const where = `${cityPrep(city.name)} ${city.name}`;
        const linkClass = 'flex min-h-11 items-center rounded-sm py-2 pr-2 text-base text-[#444] transition-colors hover:text-[#D4AF37] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]';
        const otherPacks = otherPacksInCity(pack.id, city.slug);
        const promises = [PRICE_PROMISE, AVAILABILITY_PROMISE, SATISFACTION_PROMISE];
        const rows = [
          { key: 'servicos', Icon: MapPin, label: `Serviços deste pack ${where}`, hint: 'Peça cada serviço em separado', count: `${packServices.length}`, unit: packServices.length === 1 ? 'serviço' : 'serviços',
            body: <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">{packServices.map(service => <Link key={service!.slug} className={linkClass} to={`${service!.baseRoute}-${city.slug}`}>{service!.name} {where}</Link>)}</div> },
          { key: 'packs', Icon: Layers, label: `Outros packs ${where}`, hint: 'Outras combinações com preço de pack', count: `${otherPacks.length}`, unit: otherPacks.length === 1 ? 'pack' : 'packs',
            body: <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">{otherPacks.map(link => <Link key={link.href} className={linkClass} to={link.href}>{link.label}</Link>)}</div> },
          { key: 'antes', Icon: ShieldCheck, label: 'Antes de marcar', hint: 'Preço, disponibilidade e garantia', count: `${promises.length}`, unit: 'garantias',
            body: <div className="max-w-2xl space-y-3 text-base leading-relaxed text-[#505650]">{promises.map(text => <p key={text}>{text}</p>)}</div> },
        ];
        return <section className="py-14 md:py-20" style={{ backgroundColor: '#FDFDF9' }}>
          <div className={container}>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
                <p className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>Continuar</p>
              </div>
              <h2 className="type-section-title font-playfair text-[#111111]">
                Outras formas de pedir <em className="not-italic" style={{ color: '#D4AF37' }}>{where}</em>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#505650] max-w-xl">Peça só um dos serviços, troque de pack ou confirme o que acontece antes da marcação.</p>
            </div>
            <div className="max-w-3xl divide-y divide-[#E8E4DE] border-y border-[#E8E4DE]">
              {rows.map(({ key, Icon, label, hint, count, unit, body }) => {
                const open = openNext === key;
                const panelId = `pack-next-${key}`;
                return <div key={key}>
                  <button type="button" id={`${panelId}-trigger`} aria-expanded={open} aria-controls={panelId} onClick={() => setOpenNext(open ? null : key)}
                    className="flex w-full items-center gap-3 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] sm:gap-4">
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#D4AF37]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-[#111111] sm:text-lg">{label}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-[#666] sm:text-base">{hint}</span>
                    </span>
                    <span className="text-sm tabular-nums text-[#666]">{count}<span className="hidden sm:inline"> {unit}</span></span>
                    <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#857443] transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <div id={panelId} role="region" aria-labelledby={`${panelId}-trigger`} hidden={!open}>
                    <div className="pb-5 pl-8 sm:pl-9">{body}</div>
                  </div>
                </div>;
              })}
            </div>
          </div>
        </section>;
      })()}
    </main>
    <Footer />
  </>;
}

import { AdsLandingFooter, AdsLandingHeader, isAdsVisit } from "@/components/AdsLandingNavigation";
import LandingServiceSections from '@/components/LandingServiceSections';
import SofaLeadActions from "@/components/SofaLeadActions";
import { clearPrerenderedFaqSchema } from '@/lib/seoSchema';
// Handles all keyword variant pages:
// /higienizacao-[service]-[city-or-parish]
// /lavagem-[service]-[city-or-parish]
// Each page is self-canonical and independently indexable.

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { GoogleG } from "@/components/icons/GoogleG";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import { REVIEW_COUNT, REVIEW_RATING, SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import { SERVICE_DURATION } from "@/constants/problemCardHelpers";
import { SERVICEKEY_TO_QUIZ } from "@/constants/serviceToQuiz";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
import {
  getKeywordVariantData,
  type ServiceKey,
  type VariantKey,
} from "@/data/keywordVariantData";
import { cityPrep } from "@/data/locationSeoData";
import { buildVariantWaMessage } from "@/lib/whatsappMessages";
import { Clock, Timer } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";


// Problem card backgrounds

// Pool de heroes por serviço — rotação determinística por slug de localidade
const HERO_POOL: Record<string, string[]> = {
  sofa: [
    '/images/variant-heroes/sofas/sofa-v1.jpeg',
    '/images/variant-heroes/sofas/sofa-v2.jpeg',
    '/images/variant-heroes/sofas/sofa-v3.jpeg',
    '/images/variant-heroes/sofas/sofa-v4.jpeg',
    '/images/variant-heroes/sofas/sofa-v5.jpeg',
    '/images/variant-heroes/sofas/sofa-v6.jpeg',
    '/images/variant-heroes/sofas/sofa-v7.jpeg',
  ],
  colchao: [
    '/images/variant-heroes/colchoes/colchao-v1.webp',
    '/images/variant-heroes/colchoes/colchao-v2.webp',
    '/images/variant-heroes/colchoes/colchao-v3.webp',
    '/images/variant-heroes/colchoes/colchao-v4.webp',
    '/images/variant-heroes/colchoes/colchao-v5.webp',
    '/images/variant-heroes/colchoes/colchao-v6.webp',
  ],
  tapetes: [
    '/images/variant-heroes/tapetes/tapetes-v1.webp',
    '/images/variant-heroes/tapetes/tapetes-v2.webp',
  ],
  cadeiras: [
    '/images/variant-heroes/cadeiras/cadeiras-v1.webp',
    '/images/variant-heroes/cadeiras/cadeiras-v2.webp',
  ],
  alcatifas: [
    '/images/variant-heroes/alcatifas/alcatifas-v1.jpeg',
    '/images/variant-heroes/alcatifas/alcatifas-v2.jpg',
    '/images/variant-heroes/alcatifas/alcatifas-v3.webp',
    '/images/variant-heroes/alcatifas/alcatifas-v4.webp',
  ],
  impermeabilizacao: [
    '/images/variant-heroes/impermeabilizacao/impermeabilizacao-v1.webp',
    '/images/variant-heroes/impermeabilizacao/impermeabilizacao-v2.webp',
    '/images/variant-heroes/impermeabilizacao/impermeabilizacao-v3.webp',
    '/images/variant-heroes/impermeabilizacao/impermeabilizacao-v4.jpg',
    '/images/variant-heroes/impermeabilizacao/impermeabilizacao-v5.webp',
  ],
};

function pickHero(serviceKey: string, variantKey: string, locationPart: string): string {
  const poolKey = variantKey === 'impermeabilizacao' ? 'impermeabilizacao' : serviceKey;
  const pool = HERO_POOL[poolKey] ?? HERO_POOL['sofa'];
  const hash = locationPart.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

const VARIANTS: VariantKey[]  = ['higienizacao', 'lavagem', 'impermeabilizacao'];
const SERVICES: ServiceKey[]  = ['sofa', 'colchao', 'tapetes', 'cadeiras', 'alcatifas'];

const SERVICEKEY_TO_SLUG: Record<ServiceKey, string> = {
  sofa:      'limpeza-sofas',
  colchao:   'limpeza-colchoes',
  tapetes:   'limpeza-tapetes',
  cadeiras:  'limpeza-cadeiras',
  alcatifas: 'limpeza-alcatifas',
};

function parseRoute(pathname: string): { variantKey: VariantKey; serviceKey: ServiceKey; locationPart: string } | null {
  const path = pathname.replace(/^\//, '');
  for (const v of VARIANTS) {
    for (const s of SERVICES) {
      const prefix = `${v}-${s}-`;
      if (path.startsWith(prefix)) {
        return { variantKey: v, serviceKey: s, locationPart: path.slice(prefix.length) };
      }
    }
  }
  return null;
}

const VARIANT_LABEL: Record<VariantKey, string> = {
  higienizacao:      'Higienização',
  lavagem:           'Lavagem',
  impermeabilizacao: 'Impermeabilização',
};

const SERVICE_LABEL: Record<ServiceKey, string> = {
  sofa:      'Sofá',
  colchao:   'Colchão',
  tapetes:   'Tapetes',
  cadeiras:  'Cadeiras',
  alcatifas: 'Alcatifas',
};

const SofaVariantPage = () => {
  const location = useLocation();
  const parsed = useMemo(() => parseRoute(location.pathname), [location.pathname]);
  const data = useMemo(() => {
    if (!parsed) return null;
    return getKeywordVariantData(parsed.variantKey, parsed.serviceKey, parsed.locationPart);
  }, [parsed]);

  useEffect(() => {
    if (!data) return;
    clearPrerenderedFaqSchema();
    document.title = data.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', data.metaDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', data.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', data.metaDescription);
    document.querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `${SITE_URL}${location.pathname}`);
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow');
    return () => { robotsMeta?.setAttribute('content', 'index, follow'); };
  }, [data, location.pathname]);

  if (!data || !parsed) {
    return (
      <>
        <Header />
        <main className="pt-28 pb-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-playfair text-3xl font-bold text-[#111111] mb-4">Página não encontrada</h1>
            <Link to="/" style={{ color: "#D4AF37" }} className="hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  const isSofaCleaning = data.serviceKey === "sofa" && data.variantKey !== "impermeabilizacao";
  const isPaidLanding = isSofaCleaning && isAdsVisit(location.search);

  const quizService = SERVICEKEY_TO_QUIZ[data.serviceKey];

  const variantLabel = VARIANT_LABEL[data.variantKey];
  const prep = cityPrep(data.locationName);
  const heroImg = pickHero(data.serviceKey, data.variantKey, parsed.locationPart);
  // Mesma condição usada mais abaixo para o serviceSlug do ServicePriceSection
  // — "impermeabilizacao" pode ser o variantKey mesmo quando serviceKey é
  // sofa/colchão/etc (a variante em si é sobre impermeabilizar, não limpar).
  const beforeAfterCategory = categoryForServiceSlug(
    parsed?.variantKey === 'impermeabilizacao' ? 'impermeabilizacao' : SERVICEKEY_TO_SLUG[data.serviceKey]
  );

  // "impermeabilizacao" pode ser o variantKey mesmo quando serviceKey é
  // sofa/colchão/etc (mesma condição já usada acima para beforeAfterCategory)
  // — a duração real é a da impermeabilização nesse caso, não a da limpeza.
  const durationSlug = parsed?.variantKey === 'impermeabilizacao' ? 'impermeabilizacao' : SERVICEKEY_TO_SLUG[data.serviceKey];
  const serviceDuration = SERVICE_DURATION[durationSlug] ?? { value: "3 a 6h", label: "Pronto a usar" };
  // Resposta alinhada com o orçamento: menos de 10 minutos no horário de atendimento.
  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    { value: "<10min", label: "Resposta durante o horário de atendimento", icon: Clock },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
  ];

  return (
    <QuizLocationProvider value={data.locationName}>
    <QuizServiceProvider value={quizService}>
    <>
      {isPaidLanding ? <AdsLandingHeader /> : <Header />}
      <main>

        {/* ═══ HERO + LOCAL SNAPSHOT (fundo fotográfico contínuo) ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt={data.h1} className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.90) 78%, rgba(7,26,18,0.97) 100%)" }} />

        <section className="relative pt-6 md:pt-16 lg:pt-20 pb-8 md:pb-16">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-4 lg:gap-12 items-center">
              <div>
                {!isPaidLanding && <>
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                  <span>/</span>
                  <Link to={data.canonical} className="hover:text-white/80 transition-colors">{data.locationName}</Link>
                  <span>/</span>
                  <span className="text-white/70">{variantLabel}</span>
                </nav>
                </>}

                <div className="inline-flex items-start mb-3 lg:mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span
                      className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase"
                      style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                    >
                      {variantLabel} · {data.locationName}
                    </span>
                  </div>
                </div>

                <h1
                  className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 lg:mb-4 leading-[1.12]"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
                >
                  {data.h1}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-4 lg:mb-6 max-w-lg">
                  {data.intro}
                </p>
                <SofaLeadActions city={data.locationName} price={data.priceFrom} href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildVariantWaMessage(data.variantKey === 'impermeabilizacao', SERVICE_LABEL[data.serviceKey], VARIANT_LABEL[data.variantKey], data.locationName))}`} source={`variant_hero_${parsed.variantKey}_${parsed.serviceKey}`} />
              </div>

              <div id="resultados" className="mt-2 lg:mt-0 scroll-mt-6">
                <div className="relative">
                  <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  {beforeAfterCategory ? (
                    <div className="relative shadow-2xl" style={{ borderTop: "2px solid #D4AF37" }}>
                      <HeroBeforeAfterPool category={beforeAfterCategory} className="w-full" />
                    </div>
                  ) : (
                    <img
                      src={heroImg}
                      alt={`${variantLabel} profissional ${prep} ${data.locationName}`}
                      className="relative w-full max-h-[440px] object-cover shadow-2xl"
                      style={{ borderTop: "2px solid #D4AF37" }}
                      loading="eager"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServiceSnapshotStats stats={snapshotStats} />
        </div>

        <LandingServiceSections />
      </main>
      {isPaidLanding ? <AdsLandingFooter /> : <Footer />}
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default SofaVariantPage;

// Handles all keyword variant pages:
// /higienizacao-[service]-[city-or-parish]
// /lavagem-[service]-[city-or-parish]
// Each page is self-canonical and independently indexable.

import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { CheckCircle, Star, MapPin, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import ServicePackBanner from "@/components/ServicePackBanner";
import { SERVICEKEY_TO_QUIZ } from "@/constants/serviceToQuiz";
import {
  getKeywordVariantData,
  type VariantKey,
  type ServiceKey,
} from "@/data/keywordVariantData";
import { cities } from "@/data/locationSeoData";
import { GENERIC_PROCESS_STEPS, IMPERMEABILIZACAO_STEPS } from "@/constants/serviceProcesses";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import { buildVariantWaMessage } from "@/lib/whatsappMessages";

import heroSofaD      from "@/assets/hero-sofa-cleaning-new.webp";
import heroSofaM      from "@/assets/hero-sofa-cleaning-new-mobile.webp";
import heroMattressD  from "@/assets/hero-mattress-cleaning-new.webp";
import heroMattressM  from "@/assets/hero-mattress-cleaning-new-mobile.webp";
import heroCarpetD    from "@/assets/hero-carpet-cleaning-new.webp";
import heroCarpetM    from "@/assets/hero-carpet-cleaning-new-mobile.webp";
import heroChairD     from "@/assets/hero-chair-cleaning-new.webp";
import heroChairM     from "@/assets/hero-chair-cleaning-new-mobile.webp";
import heroRugD       from "@/assets/hero-rug-cleaning-new.webp";
import heroRugM       from "@/assets/hero-rug-cleaning-new-mobile.webp";
import resultSofa        from "@/assets/galeria-sofa-depois.webp";
import resultColchao     from "@/assets/galeria-colchao-depois.webp";
import resultTapetes     from "@/assets/galeria-tapete-depois.webp";
import resultCadeiras    from "@/assets/galeria-cadeira-depois.webp";
import resultAlcatifas   from "@/assets/galeria-alcatifa-resultado.webp";

const HERO_IMAGES: Record<ServiceKey, { d: string; m: string }> = {
  sofa:      { d: heroSofaD,     m: heroSofaM },
  colchao:   { d: heroMattressD, m: heroMattressM },
  tapetes:   { d: heroCarpetD,   m: heroCarpetM },
  cadeiras:  { d: heroChairD,    m: heroChairM },
  alcatifas: { d: heroRugD,      m: heroRugM },
};

const RESULT_IMAGES: Record<ServiceKey, string> = {
  sofa:      resultSofa,
  colchao:   resultColchao,
  tapetes:   resultTapetes,
  cadeiras:  resultCadeiras,
  alcatifas: resultAlcatifas,
};


const SERVICE_PACK_SLUGS: Record<ServiceKey, string[]> = {
  sofa:      ["pack-sofa-e-colchao", "pack-sofa-impermeabilizacao"],
  colchao:   ["pack-sofa-e-colchao", "pack-quarto-completo"],
  cadeiras:  ["pack-sala-completa"],
  tapetes:   ["pack-sala-completa"],
  alcatifas: ["pack-sala-completa"],
};

const VARIANTS: VariantKey[]  = ['higienizacao', 'lavagem', 'impermeabilizacao'];
const SERVICES: ServiceKey[]  = ['sofa', 'colchao', 'tapetes', 'cadeiras', 'alcatifas'];

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

const QUIZ_CTA: Record<VariantKey, string> = {
  higienizacao:      'Ver o meu preço, grátis',
  lavagem:           'Ver o meu preço, grátis',
  impermeabilizacao: 'Proteger agora, ver preço',
};

const WA_BTN_LABEL: Record<VariantKey, string> = {
  higienizacao:      'Higienizar agora',
  lavagem:           'Lavar agora',
  impermeabilizacao: 'Proteger agora',
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
  }, [data]);

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

  const quizService = SERVICEKEY_TO_QUIZ[data.serviceKey];

  const variantLabel = VARIANT_LABEL[data.variantKey];
  const heroImgs = HERO_IMAGES[data.serviceKey];
  const resultImg = RESULT_IMAGES[data.serviceKey];

  return (
    <QuizLocationProvider value={data.locationName}>
    <QuizServiceProvider value={quizService}>
    <>
      <ServiceFAQSchema faqs={data.faqs} />
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <picture className="w-full h-full">
              <source media="(max-width: 767px)" srcSet={heroImgs.m} type="image/webp" />
              <source media="(min-width: 768px)" srcSet={heroImgs.d} type="image/webp" />
              <img src={heroImgs.d} alt={data.h1} className="w-full h-full object-cover" loading="eager" />
            </picture>
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                  <span>/</span>
                  <Link to={data.canonical} className="hover:text-white/80 transition-colors">{data.locationName}</Link>
                  <span>/</span>
                  <span className="text-white/70">{variantLabel}</span>
                </nav>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>{data.locationName}</span>
                </div>

                <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.15]">
                  {data.h1}
                </h1>

                <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {data.intro.split('.')[0]}.
                </p>

                <TrustRatingBadge variant="hero" />

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                    <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel={QUIZ_CTA[data.variantKey]} initialLocation={data.locationName} initialService={quizService} />
                  </div>
                  <a
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildVariantWaMessage(data.variantKey === 'impermeabilizacao', SERVICE_LABEL[data.serviceKey], VARIANT_LABEL[data.variantKey], data.locationName))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`variant_hero_${parsed.variantKey}_${parsed.serviceKey}`)}
                    className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                  >
                    <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                    {WA_BTN_LABEL[data.variantKey]}
                  </a>
                </div>

                <p className="text-white/40 text-xs mt-4">Desde {data.priceFrom} · Orçamento gratuito</p>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  <picture>
                    <source media="(max-width: 767px)" srcSet={heroImgs.m} type="image/webp" />
                    <source media="(min-width: 768px)" srcSet={heroImgs.d} type="image/webp" />
                    <img
                      src={heroImgs.d}
                      alt={`${variantLabel} profissional em ${data.locationName}`}
                      className="relative rounded-2xl w-full max-h-[400px] object-cover shadow-2xl"
                      loading="eager"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ O QUE RESOLVEMOS ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>O que resolvemos</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111]">
                  Vantagens da {variantLabel} em {data.locationName}
                </h2>
              </div>
              <div className={`grid gap-3 md:gap-4 ${data.benefits.length <= 3 ? 'sm:grid-cols-3 justify-items-center max-w-2xl mx-auto w-full' : 'grid-cols-2 md:grid-cols-4'}`}>
                {data.benefits.slice(0, 4).map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 text-center shadow-sm border border-[#E8E4DE] hover:shadow-md hover:border-[#D4AF37]/30 transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "rgba(212,175,55,0.1)" }}
                    >
                      <Star className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    </div>
                    <p className="text-sm font-semibold text-[#111111] leading-snug">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROCESSO ═══ */}
        <section className="py-12 md:py-16 relative overflow-hidden bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Processo</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white">Como funciona</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {(data.variantKey === 'impermeabilizacao' ? IMPERMEABILIZACAO_STEPS : GENERIC_PROCESS_STEPS).map((step, idx) => (
                  <div key={idx} className="text-center">
                    <div className="relative inline-block mb-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-gold/20"
                        style={{ background: "rgba(212,175,55,0.1)" }}
                      >
                        <span className="font-playfair font-bold text-lg" style={{ color: "#D4AF37" }}>{step.step}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white/80 mb-1">{step.label}</p>
                    <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ RESULTADO ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={resultImg}
                  alt={`Resultado após ${variantLabel.toLowerCase()} em ${data.locationName}`}
                  className="w-full h-[280px] md:h-[400px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a12]/85 via-[#0B2F2A]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-2">
                    Resultado após {variantLabel.toLowerCase()} profissional
                  </h2>
                  <p className="text-white/70 text-sm md:text-base max-w-lg">
                    Resultados visíveis no momento. Tratamento profissional ao domicílio em {data.locationName}.
                  </p>
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" style={{ color: "#D4AF37" }} />
                      <span className="text-white/80 text-sm">Produtos certificados</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" style={{ color: "#D4AF37" }} />
                      <span className="text-white/80 text-sm">Garantia de resultado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-12 md:py-16 relative overflow-hidden bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Perguntas</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white">
                  Perguntas Frequentes
                </h2>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                {data.faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="bg-white/[0.04] rounded-[18px] border border-white/10 px-6 transition-all duration-300 data-[state=open]:border-[#D4AF37]/30"
                  >
                    <AccordionTrigger className="text-left text-sm font-semibold text-white py-5 hover:no-underline [&[data-state=open]>svg]:text-[#D4AF37]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-white/55 pb-5 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ═══ ÁREA DE SERVIÇO ═══ */}
        <section className="py-12 md:py-14 bg-white">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Cobertura</p>
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-6">
                Servimos {data.locationName} e arredores
              </h2>

              <p className="text-xs text-[#111111]/50 mb-3">Também disponível em:</p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {cities.filter(c => c.slug !== parsed.locationPart).slice(0, 6).map(city => (
                  <Link
                    key={city.slug}
                    to={`/${parsed.variantKey}-${parsed.serviceKey}-${city.slug}`}
                    className="text-xs text-[#111111]/60 hover:text-[#D4AF37] transition-colors font-medium"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>

              <div className="mt-2 pt-6 border-t border-[#E8E4DE]">
                <p className="text-xs text-[#111111]/50 mb-3">Outros serviços em {data.locationName}:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {(SERVICES.filter(s => s !== parsed.serviceKey) as ServiceKey[]).map(svcKey => (
                    <Link
                      key={svcKey}
                      to={`/${parsed.variantKey}-${svcKey}-${parsed.locationPart}`}
                      className="text-xs font-semibold text-[#111111]/60 hover:text-[#D4AF37] transition-colors"
                    >
                      {variantLabel} de {SERVICE_LABEL[svcKey]}
                    </Link>
                  ))}
                  <Link
                    to={data.canonical}
                    className="text-xs font-semibold text-[#D4AF37] hover:text-[#b8962e] transition-colors"
                  >
                    Ver limpeza profissional em {data.locationName}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PACKS ═══ */}
        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.serviceKey] ?? ["pack-sala-completa"]}
          city={parsed.locationPart}
        />

      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default SofaVariantPage;

import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Phone, Star, CheckCircle, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import ServicePackBanner from "@/components/ServicePackBanner";
import { getLocationServiceData, services, cities, getCityLinksForService } from "@/data/locationSeoData";
import { municipiosComFreguesias } from "@/data/freguesiaSeoData";
import { GENERIC_PROCESS_STEPS, IMPERMEABILIZACAO_STEPS } from "@/constants/serviceProcesses";
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";

import heroSofaD              from "@/assets/hero-sofa-cleaning-new.webp";
import heroSofaM              from "@/assets/hero-sofa-cleaning-new-mobile.webp";
import heroMattressD          from "@/assets/hero-mattress-cleaning-new.webp";
import heroMattressM          from "@/assets/hero-mattress-cleaning-new-mobile.webp";
import heroCarpetD            from "@/assets/hero-carpet-cleaning-new.webp";
import heroCarpetM            from "@/assets/hero-carpet-cleaning-new-mobile.webp";
import heroChairD             from "@/assets/hero-chair-cleaning-new.webp";
import heroChairM             from "@/assets/hero-chair-cleaning-new-mobile.webp";
import heroRugD               from "@/assets/hero-rug-cleaning-new.webp";
import heroRugM               from "@/assets/hero-rug-cleaning-new-mobile.webp";
import heroWaterproofD        from "@/assets/hero-waterproofing.webp";
import heroWaterproofM        from "@/assets/hero-waterproofing-mobile.webp";
import resultSofa              from "@/assets/galeria-sofa-depois.webp";
import resultColchao           from "@/assets/galeria-colchao-depois.webp";
import resultTapetes           from "@/assets/galeria-tapete-depois.webp";
import resultCadeiras          from "@/assets/galeria-cadeira-depois.webp";
import resultAlcatifas         from "@/assets/galeria-alcatifa-resultado.webp";
import resultImpermeabilizacao from "@/assets/galeria-impermeabilizacao-depois.webp";

const heroImages: Record<string, { d: string; m: string }> = {
  "limpeza-sofas":     { d: heroSofaD,       m: heroSofaM },
  "limpeza-colchoes":  { d: heroMattressD,   m: heroMattressM },
  "limpeza-tapetes":   { d: heroCarpetD,     m: heroCarpetM },
  "limpeza-cadeiras":  { d: heroChairD,      m: heroChairM },
  "limpeza-alcatifas": { d: heroRugD,        m: heroRugM },
  "impermeabilizacao": { d: heroWaterproofD, m: heroWaterproofM },
};

const resultImages: Record<string, string> = {
  "limpeza-sofas":    resultSofa,
  "limpeza-colchoes": resultColchao,
  "limpeza-tapetes":  resultTapetes,
  "limpeza-cadeiras": resultCadeiras,
  "limpeza-alcatifas": resultAlcatifas,
  "impermeabilizacao": resultImpermeabilizacao,
};


function parseLocationRoute(pathname: string): { serviceSlug: string; citySlug: string } | null {
  const path = pathname.replace(/^\//, '');
  for (const service of services) {
    for (const city of cities) {
      if (path === `${service.slug}-${city.slug}`) {
        return { serviceSlug: service.slug, citySlug: city.slug };
      }
    }
  }
  return null;
}

const LocationServicePage = () => {
  const location = useLocation();
  const parsed = useMemo(() => parseLocationRoute(location.pathname), [location.pathname]);
  const data = useMemo(() => (parsed ? getLocationServiceData(parsed.serviceSlug, parsed.citySlug) : null), [parsed]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", data.metaDescription);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", data.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", data.metaDescription);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `https://www.cleansolutions.com.pt${location.pathname}`);
    }
  }, [location.pathname, data]);

  if (!data) {
    return (
      <>
        <Header />
        <main className="pt-28 pb-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-playfair text-3xl font-bold text-[#1A1A2E] mb-4">Página não encontrada</h1>
            <Link to="/" style={{ color: "#D4AF37" }} className="hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const heroImgs = heroImages[data.serviceSlug] ?? { d: heroSofaD, m: heroSofaM };
  const resultImg = resultImages[data.serviceSlug] || resultColchao;
  const resultLabel = data.serviceSlug === 'impermeabilizacao' ? 'impermeabilização' : 'limpeza';
  const otherServices = data.relatedServices
    .map(slug => {
      const svc = services.find(s => s.slug === slug);
      return svc ? { ...svc, locationPath: `/${slug}-${data.citySlug}` } : null;
    })
    .filter(Boolean) as (typeof services[number] & { locationPath: string })[];

  const cityFreguesias = municipiosComFreguesias.find(m => m.slug === data.citySlug);

  return (
    <>
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
                  <Link to={services.find(s => s.slug === data.serviceSlug)?.baseRoute || "/"} className="hover:text-white/80 transition-colors">{data.service}</Link>
                  <span>/</span>
                  <span className="text-white/70">{data.city}</span>
                </nav>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>{data.city}</span>
                </div>

                <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.15]">
                  {data.h1}
                </h1>

                <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {data.intro.split('.')[0]}.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                      ))}
                    </div>
                    <span className="text-white font-bold text-sm">5.0</span>
                    <span className="text-white/50 text-xs">Google</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-white/60 text-xs font-medium">50+ avaliações</span>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-white/60 text-xs font-medium">+1000 clientes</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <QuizButton />
                  <a
                    href="https://wa.me/351925530647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 rounded-full text-white/75 font-medium text-sm hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200"
                  >
                    <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />
                    WhatsApp
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
                      alt={`${data.service} profissional em ${data.city}`}
                      className="relative rounded-2xl w-full max-h-[400px] object-cover shadow-2xl"
                      loading="eager"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROBLEMAS COMUNS ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>O que resolvemos</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E]">
                  Problemas comuns em {data.city}
                </h2>
              </div>
              <div className={`grid gap-3 md:gap-4 ${data.problems.length === 3 ? 'sm:grid-cols-3 justify-items-center max-w-2xl mx-auto w-full' : 'grid-cols-2 md:grid-cols-4'}`}>
                {data.problems.slice(0, 4).map((problem, idx) => (
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
                    <p className="text-sm font-semibold text-[#1A1A2E] leading-snug">{problem.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ COMO FUNCIONA ═══ */}
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
                {data.howItWorks && (
                  <p className="mt-4 text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">{data.howItWorks}</p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {(data.serviceSlug === 'impermeabilizacao' ? IMPERMEABILIZACAO_STEPS : GENERIC_PROCESS_STEPS).map((step, idx) => (
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
                  alt={`Resultado após ${data.service.toLowerCase()} em ${data.city}`}
                  className="w-full h-[280px] md:h-[400px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a12]/85 via-[#0B2F2A]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-2">
                    Resultado após {resultLabel} profissional
                  </h2>
                  <p className="text-white/70 text-sm md:text-base max-w-lg">
                    {data.serviceSlug === 'impermeabilizacao' ? 'Proteção invisível aplicada por especialistas. Barreira duradoura contra líquidos e manchas.' : 'Extração profunda com equipamento profissional. Resultados visíveis no momento.'}
                  </p>
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" style={{ color: "#D4AF37" }} />
                      <span className="text-white/80 text-sm">Sem resíduos químicos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" style={{ color: "#D4AF37" }} />
                      <span className="text-white/80 text-sm">Seco em 4 a 6h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        {data.faqs && data.faqs.length > 0 && (
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
                <Accordion type="single" collapsible className="space-y-3">
                  {data.faqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`faq-${idx}`}
                      className="bg-white/[0.04] rounded-2xl border border-white/10 px-5 transition-all duration-300 data-[state=open]:ring-1 data-[state=open]:ring-gold/25"
                    >
                      <AccordionTrigger className="text-left text-sm font-semibold text-white py-5 hover:no-underline [&[data-state=open]>svg]:text-gold">
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
        )}

        {/* ═══ ÁREA DE SERVIÇO ═══ */}
        <section className="py-12 md:py-14 bg-white">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Cobertura</p>
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-6">
                Servimos {data.city} e arredores
              </h2>

              {cityFreguesias && cityFreguesias.freguesias.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {cityFreguesias.freguesias.slice(0, 8).map(f => (
                    <Link
                      key={f.slug}
                      to={`/${data.serviceSlug}-${data.citySlug}-${f.slug}`}
                      className="inline-flex items-center gap-1.5 bg-[#FDFDF9] px-3.5 py-2 rounded-full text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                    >
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {f.name}
                    </Link>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#1A1A2E]/50 mb-3">Também disponível em:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {getCityLinksForService(data.serviceSlug).filter(c => c.name !== data.city).slice(0, 6).map(city => (
                  <Link
                    key={city.name}
                    to={city.path}
                    className="text-xs text-[#1A1A2E]/60 hover:text-[#D4AF37] transition-colors font-medium"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>

              {otherServices.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#E8E4DE]">
                  <p className="text-xs text-[#1A1A2E]/50 mb-3">Outros serviços em {data.city}:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {otherServices.map(svc => (
                      <Link
                        key={svc.slug}
                        to={svc.locationPath}
                        className="text-xs font-semibold text-[#1A1A2E]/60 hover:text-[#D4AF37] transition-colors"
                      >
                        {svc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══ PACKS ═══ */}
        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.serviceSlug] ?? ["pack-sala-completa"]}
          city={data.citySlug}
        />

        {/* ═══ SCHEMAS ═══ */}
        <ServiceFAQSchema faqs={data.faqs} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.cleansolutions.com.pt/" },
                { "@type": "ListItem", "position": 2, "name": data.service, "item": `https://www.cleansolutions.com.pt${services.find(s => s.slug === data.serviceSlug)?.baseRoute || '/'}` },
                { "@type": "ListItem", "position": 3, "name": data.city, "item": `https://www.cleansolutions.com.pt${location.pathname}` },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": `${data.service} em ${data.city}`,
              "description": data.metaDescription,
              "provider": {
                "@type": "LocalBusiness",
                "name": "Kyro Clean Solutions",
                "telephone": "+351925530647",
                "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "50" },
              },
              "areaServed": { "@type": "City", "name": data.city },
              "serviceType": data.service,
            }),
          }}
        />
      </main>
      <Footer />
    </>
  );
};

export default LocationServicePage;

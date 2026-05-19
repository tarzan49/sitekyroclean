import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, MapPin, ArrowRight, Phone, Star, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import ServicePackBanner from "@/components/ServicePackBanner";
import { services } from "@/data/locationSeoData";
import {
  municipiosComFreguesias,
  getFreguesia,
  getNearbyFreguesias,
  generateFreguesiaContent,
} from "@/data/freguesiaSeoData";
import { getAllProblems } from "@/data/problemSeoData";
import { GENERIC_PROCESS_STEPS, IMPERMEABILIZACAO_STEPS } from "@/constants/serviceProcesses";

const RESULT_CONTENT: Record<string, (place: string) => { desc: string; checks: string[] }> = {
  'limpeza-sofas':     p => ({ desc: `Sofás de ${p} tratados com extração a quente: manchas, ácaros e odores eliminados. Tecido revitalizado e pronto a usar em 4 a 6 horas.`, checks: ['Remoção de 99% dos ácaros', 'Manchas antigas eliminadas', 'Pronto em 4–6h'] }),
  'limpeza-colchoes':  p => ({ desc: `Colchões higienizados ao domicílio em ${p}: eliminação de ácaros, manchas de suor e odores. Seco no mesmo dia.`, checks: ['99% ácaros eliminados', 'Sem resíduos químicos', 'Seco no mesmo dia'] }),
  'limpeza-tapetes':   p => ({ desc: `Tapetes de ${p} lavados em profundidade: fibras revitalizadas, cores recuperadas e alergénios eliminados.`, checks: ['Fibras e cores revitalizadas', 'Alergénios eliminados', 'Recolha e entrega'] }),
  'limpeza-cadeiras':  p => ({ desc: `Cadeiras estofadas em ${p} limpas com equipamento profissional. Resultado imediato, ideal para escritórios e restaurantes.`, checks: ['Resultado imediato', 'Ideal para restaurantes', 'Sem resíduos'] }),
  'limpeza-alcatifas': p => ({ desc: `Alcatifas de ${p} tratadas com extração profunda: poeira, ácaros e manchas removidos das fibras.`, checks: ['Extração profunda', 'Ideal para espaços comerciais', 'Seco rapidamente'] }),
  'impermeabilizacao': p => ({ desc: `Proteção invisível aplicada em ${p}: barreira duradoura contra líquidos e manchas. Totalmente ativa em 24 horas.`, checks: ['Barreira invisível e duradoura', 'Ativa em 24 horas', 'Proteção contra manchas'] }),
};
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

const SERVICE_HERO_IMAGES: Record<string, { d: string; m: string }> = {
  "limpeza-sofas":     { d: heroSofaD,       m: heroSofaM },
  "limpeza-colchoes":  { d: heroMattressD,   m: heroMattressM },
  "limpeza-tapetes":   { d: heroCarpetD,     m: heroCarpetM },
  "limpeza-cadeiras":  { d: heroChairD,      m: heroChairM },
  "limpeza-alcatifas": { d: heroRugD,        m: heroRugM },
  "impermeabilizacao": { d: heroWaterproofD, m: heroWaterproofM },
};

const SERVICE_RESULT_IMAGES: Record<string, string> = {
  "limpeza-sofas":    resultSofa,
  "limpeza-colchoes": resultColchao,
  "limpeza-tapetes":  resultTapetes,
  "limpeza-cadeiras": resultCadeiras,
  "limpeza-alcatifas": resultAlcatifas,
  "impermeabilizacao": resultImpermeabilizacao,
};


const METRO_CITIES = new Set(["porto", "matosinhos", "maia", "vila-nova-de-gaia", "gondomar", "braga", "lisboa"]);

function parseFreguesiaRoute(pathname: string): { serviceSlug: string; citySlug: string; freguesiaSlug: string } | null {
  const path = pathname.replace(/^\//, '');
  for (const svc of services) {
    for (const m of municipiosComFreguesias) {
      for (const f of m.freguesias) {
        if (path === `${svc.slug}-${m.slug}-${f.slug}`) {
          return { serviceSlug: svc.slug, citySlug: m.slug, freguesiaSlug: f.slug };
        }
      }
    }
  }
  return null;
}

const FreguesiaServicePage = () => {
  const location = useLocation();
  const parsed = useMemo(() => parseFreguesiaRoute(location.pathname), [location.pathname]);

  const data = useMemo(() => {
    if (!parsed) return null;
    const freguesia = getFreguesia(parsed.citySlug, parsed.freguesiaSlug);
    if (!freguesia) return null;
    const svc = services.find(s => s.slug === parsed.serviceSlug);
    if (!svc) return null;
    const content = generateFreguesiaContent(svc.name, svc.slug, svc.priceFrom, freguesia.name, freguesia.slug, freguesia.municipio);
    return { ...content, ...freguesia, service: svc.name, serviceSlug: svc.slug, priceFrom: svc.priceFrom };
  }, [parsed]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", data.metaDescription);
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

  const nearbyFreguesias = getNearbyFreguesias(data.municipioSlug, data.nearby);
  const otherServices = services.filter(s => s.slug !== data.serviceSlug);

  const municipioProblems = useMemo(() => {
    if (!data) return [];
    return getAllProblems()
      .filter(p =>
        p.visible &&
        p.relatedServices.includes(data.serviceSlug) &&
        (METRO_CITIES.has(data.municipioSlug) || p.relatedCities.includes(data.municipioSlug))
      )
      .slice(0, 5)
      .map(p => ({ slug: p.slug, keyword: p.keyword }));
  }, [data]);
  const heroImgs = SERVICE_HERO_IMAGES[data.serviceSlug] ?? { d: heroSofaD, m: heroSofaM };
  const resultImg = SERVICE_RESULT_IMAGES[data.serviceSlug] ?? resultSofa;
  const resultLabel = data.serviceSlug === 'impermeabilizacao' ? 'impermeabilização' : 'limpeza';
  const resultDesc = RESULT_CONTENT[data.serviceSlug]?.(data.name)?.desc ?? data.metaDescription;
  const serviceBaseUrl = services.find(s => s.slug === data.serviceSlug)?.baseRoute ?? `/${data.serviceSlug}`;

  return (
    <>
      <ServiceLocationSchema
        serviceName={data.service}
        serviceBaseUrl={serviceBaseUrl}
        placeName={data.name}
        parentPlace={data.municipio}
        description={resultDesc}
        pageUrl={location.pathname}
        priceFrom={data.priceFrom}
      />
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-14 md:pb-20 overflow-hidden">
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
                  <Link to={`/${data.serviceSlug}-${data.municipioSlug}`} className="hover:text-white/80 transition-colors">{data.municipio}</Link>
                  <span>/</span>
                  <span className="text-white/70">{data.name}</span>
                </nav>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>
                    {data.name}, {data.municipio}
                  </span>
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

                <div className="flex flex-wrap items-center gap-3">
                  <QuizButton initialLocation={data.municipio} />
                  <a
                    href="https://wa.me/351925530647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 rounded-full text-white/75 font-medium text-sm hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200"
                  >
                    <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />
                    WhatsApp
                  </a>
                  <a
                    href="tel:925530647"
                    className="inline-flex items-center gap-1.5 text-white/75 hover:text-gold font-medium text-sm transition-colors duration-150"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold animate-phone-shake flex-shrink-0" strokeWidth={2.5} />
                    <span className="font-bold tracking-wide">Ligar</span>
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
                    alt={`${data.service} em ${data.name}`}
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
                  Problemas comuns em {data.name}
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
                  alt={`Resultado após ${data.service.toLowerCase()} em ${data.name}`}
                  className="w-full h-[280px] md:h-[400px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a12]/85 via-[#0B2F2A]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-2">
                    Resultado após {resultLabel} profissional
                  </h2>
                  <p className="text-white/70 text-sm md:text-base max-w-lg">
                    {(RESULT_CONTENT[data.serviceSlug] ?? RESULT_CONTENT['limpeza-sofas'])(data.name).desc}
                  </p>
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    {(RESULT_CONTENT[data.serviceSlug] ?? RESULT_CONTENT['limpeza-sofas'])(data.name).checks.map((check, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" style={{ color: "#D4AF37" }} />
                        <span className="text-white/80 text-sm">{check}</span>
                      </div>
                    ))}
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
              <ServiceFAQSchema faqs={data.faqs} />
              <Accordion type="single" collapsible className="space-y-4">
                {data.faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
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

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-10">

              {nearbyFreguesias.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    Freguesias próximas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {nearbyFreguesias.map(f => (
                      <Link
                        key={f.slug}
                        to={`/${data.serviceSlug}-${data.municipioSlug}-${f.slug}`}
                        className="inline-flex items-center gap-1.5 bg-[#FDFDF9] px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all"
                      >
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {f.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg md:text-xl font-playfair font-bold text-[#1A1A2E] mb-4">Outros serviços em {data.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {otherServices.map(svc => (
                    <Link
                      key={svc.slug}
                      to={`/${svc.slug}-${data.municipioSlug}-${data.slug}`}
                      className="group flex items-center gap-3 bg-[#FDFDF9] rounded-xl p-4 shadow-sm hover:shadow-md border border-[#E8E4DE] hover:border-[#D4AF37]/30 transition-all"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#D4AF37] transition-colors">{svc.name}</span>
                        <span className="block text-xs text-[#1A1A2E]/50">Desde {svc.priceFrom}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#1A1A2E]/30 group-hover:text-[#D4AF37] transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Link
                  to={`/${data.serviceSlug}-${data.municipioSlug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-colors"
                  style={{ color: "#D4AF37" }}
                >
                  <ArrowRight className="w-4 h-4" />
                  Ver todos os serviços em {data.municipio}
                </Link>
              </div>

              {municipioProblems.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-[#1A1A2E] mb-4">
                    Problemas que resolvemos em {data.municipio}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {municipioProblems.map(p => (
                      <Link
                        key={p.slug}
                        to={`/${p.slug}-${data.municipioSlug}`}
                        className="inline-flex items-center gap-1.5 bg-[#FDFDF9] px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all"
                      >
                        {p.keyword}
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
          city={data.municipioSlug}
        />

        {/* ═══ BENEFÍCIOS ═══ */}
        {data.benefits && data.benefits.length > 0 && (
          <section className="py-12 md:py-16 bg-white">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Vantagens</p>
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E]">
                    Porquê escolher a Kyro em {data.name}
                  </h2>
                  {data.localSection && (
                    <p className="mt-3 text-sm text-[#1A1A2E]/50 max-w-2xl mx-auto leading-relaxed">{data.localSection}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {data.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#FDFDF9] rounded-2xl p-4 border border-[#E8E4DE]">
                      <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#D4AF37" }} />
                      <span className="text-sm text-[#1A1A2E]/70 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
};

export default FreguesiaServicePage;

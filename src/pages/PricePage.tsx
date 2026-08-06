import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { MapPin, Star, MessageCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { getPricePageData, getAllPriceRoutes } from "@/data/priceSeoData";
import { SERVICE_TESTIMONIALS } from "@/data/locationPriceTestimonialsData";
import { services, cities, cityPrep } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { pickServiceHero } from "@/constants/serviceContent";
import { SERVICE_GALLERY } from "@/constants/serviceGallery";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
} from "@/lib/seoSchema";

const PricePage = () => {
  const { pathname } = useLocation();

  const data = useMemo(() => {
    const allRoutes = getAllPriceRoutes();
    const route = allRoutes.find(r => r.path === pathname);
    if (!route) return null;
    return getPricePageData(route.serviceSlug, route.citySlug);
  }, [pathname]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", data.metaDescription);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${SITE_URL}${pathname}`);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", data.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", data.metaDescription);
    }
  }, [pathname, data]);

  if (!data) {
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

  const prep = cityPrep(data.cityName);
  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];
  const heroImgs = pickServiceHero(data.serviceSlug, data.cityName);
  const service = services.find(s => s.slug === data.serviceSlug);
  const servicePrice = service?.priceFrom ?? "49€";
  const relatedServices = services.filter(s => s.slug !== data.serviceSlug).slice(0, 4);
  const nearbyCities = cities.filter(c => c.slug !== data.citySlug).slice(0, 8);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.cityName))}`;
  const testimonials = SERVICE_TESTIMONIALS[data.serviceSlug];
  const gallery = SERVICE_GALLERY[data.serviceSlug];

  return (
    <QuizLocationProvider value={data.cityName}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <picture className="w-full h-full">
              <source media="(max-width: 767px)" srcSet={heroImgs.m} />
              <source media="(min-width: 768px)" srcSet={heroImgs.d} />
              <img src={heroImgs.d} alt="" className="w-full h-full object-cover" loading="eager" />
            </picture>
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                  <span>/</span>
                  <Link to={`/${data.serviceSlug}`} className="hover:text-white/80 transition-colors">{data.serviceName}</Link>
                  <span>/</span>
                  <span className="text-white/70">Preços · {data.cityName}</span>
                </nav>

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      Tabela de Preços · {data.cityName}
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  Preço de {data.serviceName} {prep} <span style={{ color: "#D4AF37" }}>{data.cityName}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {data.intro.split('.')[0]}.
                </p>

                <div className="mb-6">
                  <TrustRatingBadge variant="hero" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <QuizButton
                    className="flex-1"
                    initialLocation={data.cityName}
                    initialService={quizService}
                    buttonClassName="h-[58px] md:h-[52px] !py-0 w-full"
                  />
                  <div className="relative group flex-1">
                    <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(`price_hero_${data.serviceSlug}_${data.citySlug}`)}
                      className="relative flex items-center justify-center gap-2 w-full h-[58px] md:h-[52px] px-6 font-bold text-white touch-manipulation bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-150"
                    >
                      <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
                    </a>
                  </div>
                </div>

                <p className="text-white/40 text-xs mt-4">Desde {servicePrice} · Orçamento gratuito · Sem compromisso</p>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  <picture>
                    <source media="(max-width: 767px)" srcSet={heroImgs.m} type="image/webp" />
                    <source media="(min-width: 768px)" srcSet={heroImgs.d} type="image/webp" />
                    <img
                      src={heroImgs.d}
                      alt={`${data.serviceName} ${prep} ${data.cityName}`}
                      className="relative w-full max-h-[440px] object-cover shadow-2xl"
                      style={{ borderTop: "2px solid #D4AF37" }}
                      loading="eager"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TABELA DE PREÇOS ═══ */}
        <ServicePriceSection serviceSlug={data.serviceSlug} initialLocation={data.cityName} />

        {/* ═══ O QUE INFLUENCIA O PREÇO ═══ */}
        {data.factors.length > 0 && (
          <section className="py-14 md:py-20 bg-kyro-green">
            <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader overline="Fatores de Preço" heading="O que influencia o" goldWord="valor final" light={false} />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                {data.factors.slice(0, 6).map((factor, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden flex flex-col gap-3 p-7 md:p-8 transition-colors duration-300 hover:bg-[#102a20]"
                    style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}
                  >
                    <span
                      className="absolute -right-2 -top-3 font-playfair font-bold leading-none select-none transition-opacity duration-300 group-hover:opacity-100"
                      style={{ fontSize: "4.5rem", color: "rgba(212,175,55,0.08)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="relative font-playfair font-bold leading-none"
                      style={{ fontSize: "1.5rem", color: "#D4AF37" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative text-sm text-white/70 leading-relaxed">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ GALERIA — ANTES E DEPOIS ═══ */}
        {gallery && (
          <ServiceAutoCarousel
            overline="Resultados Reais"
            heading={`Antes e depois: ${data.serviceName}`}
            subtitle={`Transformação real ${prep} ${data.cityName}, resultado visível no próprio dia.`}
            beforeImage={gallery.before}
            afterImage={gallery.after}
            slides={gallery.slides}
            rotateBeforeAfter={gallery.rotateBeforeAfter}
            variant="light"
          />
        )}

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <ServiceFAQ faqs={data.faqs} heading={`Dúvidas sobre preços ${prep} ${data.cityName}`} variant="dark" />
        )}

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        {testimonials && testimonials.length > 0 && (
          <section className="py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" light={true} />
              <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
                {testimonials.map((t, i) => (
                  <div key={i} className="relative overflow-hidden p-6 md:p-8 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                    </div>
                    <p className="text-sm text-[#111111]/65 leading-relaxed italic mb-4">"{t.text}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#D4AF37" }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111111]">{t.name}</p>
                        <p className="text-[10px] text-[#111111]/40">{t.city}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Cobertura" heading="Explore" goldWord="mais" light={true} />
            <div className="grid md:grid-cols-3 gap-x-12 gap-y-10">
              <div>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Ver página completa</p>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/${data.serviceSlug}-${data.citySlug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                    <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                    {data.serviceName} {prep} {data.cityName}
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Outros serviços {prep} {data.cityName}</p>
                <div className="flex flex-wrap gap-2">
                  {relatedServices.map(svc => (
                    <Link key={svc.slug} to={`/preco-${svc.slug}-${data.citySlug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                      <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {svc.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Preços noutras cidades</p>
                <div className="flex flex-wrap gap-2">
                  {nearbyCities.map(city => (
                    <Link key={city.slug} to={`/preco-${data.serviceSlug}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                buildWebPageNode({ url: `${SITE_URL}${pathname}`, name: data.title, description: data.metaDescription }),
                buildBreadcrumbNode(`${SITE_URL}${pathname}#breadcrumb`, [
                  { name: "Início", item: SITE_URL },
                  { name: data.serviceName, item: `${SITE_URL}/${data.serviceSlug}` },
                  { name: `Preços ${prep} ${data.cityName}`, item: `${SITE_URL}${pathname}` },
                ]),
                buildServiceNode({
                  url: `${SITE_URL}${pathname}`,
                  name: `${data.serviceName} ${prep} ${data.cityName}`,
                  description: data.metaDescription,
                  areaServed: { "@type": "City", name: data.cityName },
                  offers: buildOfferNode(servicePrice.replace(/[^0-9]/g, "")),
                }),
              ],
            }),
          }}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default PricePage;

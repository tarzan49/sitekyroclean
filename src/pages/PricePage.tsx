import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { Star, ArrowRight, CheckCircle, MapPin, MessageCircle, Clock, Truck, ThumbsUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import { getPricePageData, getAllPriceRoutes } from "@/data/priceSeoData";
import { services, cities } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { buildServiceWaMessage } from "@/lib/buildServiceWaMessage";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING } from "@/constants/business";

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
    }
  }, [pathname, data]);

  if (!data) {
    return (
      <>
        <Header />
        <main className="pt-28 pb-16 min-h-screen bg-[#FAFAF7]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-[#111111] mb-4">Página não encontrada</h1>
            <Link to="/" className="text-[#D4AF37] hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];
  const relatedServices = services.filter(s => s.slug !== data.serviceSlug).slice(0, 4);
  const nearbyCities = cities.filter(c => c.slug !== data.citySlug).slice(0, 6);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.cityName))}`;

  return (
    <QuizLocationProvider value={data.cityName}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ── Hero ── */}
        <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 bg-[#071a12] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#D4AF37]/[0.04] blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <nav className="flex items-center justify-center gap-1.5 text-xs text-white/30 mb-6" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-white/60 transition-colors">Início</Link>
                <span>/</span>
                <Link to={`/${data.serviceSlug}`} className="hover:text-white/60 transition-colors">{data.serviceName}</Link>
                <span>/</span>
                <span className="text-white/50">Preços em {data.cityName}</span>
              </nav>

              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-full px-4 py-1.5 mb-6">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <span className="text-[#D4AF37] text-xs font-semibold tracking-wider uppercase">
                  Tabela de Preços {new Date().getFullYear()}
                </span>
              </div>

              <h1 className="font-playfair text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
                {data.h1}
              </h1>
              <p className="text-white/50 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Preços transparentes, sem surpresas. Deslocação e equipamento profissional incluídos.
              </p>

              <div className="flex gap-3 justify-center max-w-sm mx-auto">
                <div className="relative flex-1">
                  <div className="absolute -inset-1.5 rounded-full bg-[#D4AF37]/40 opacity-30 blur-lg pointer-events-none" />
                  <QuizButton
                    className="relative w-full"
                    buttonClassName="h-[52px] !py-0 w-full"
                    ctaLabel="Ver preço grátis"
                    initialLocation={data.cityName}
                    initialService={quizService}
                  />
                </div>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(`price_hero_${data.serviceSlug}_${data.citySlug}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                >
                  <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                  Falar agora
                </a>
              </div>

              <div className="flex items-center justify-center gap-5 mt-8 flex-wrap">
                <span className="flex items-center gap-1.5 text-white/35 text-xs">
                  <Clock className="w-3.5 h-3.5" />Resposta em 2h
                </span>
                <span className="w-px h-3 bg-white/10" />
                <span className="flex items-center gap-1.5 text-white/35 text-xs">
                  <Truck className="w-3.5 h-3.5" />Deslocação incluída
                </span>
                <span className="w-px h-3 bg-white/10" />
                <span className="flex items-center gap-1.5 text-white/35 text-xs">
                  <ThumbsUp className="w-3.5 h-3.5" />Sem compromisso
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Price Cards ── */}
        <section className="py-14 md:py-20 bg-[#FAFAF7]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] mb-2">
                  Preços Kyro Clean Solutions
                </p>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111]">
                  Tabela de preços: {data.serviceName} em {data.cityName}
                </h2>
                <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mt-4" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {data.priceTable.map((row, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 border border-[#111111]/6 shadow-sm hover:shadow-md hover:border-[#D4AF37]/25 transition-all duration-200 group"
                  >
                    <div className="w-8 h-0.5 bg-[#D4AF37] mb-4 group-hover:w-12 transition-all duration-300" />
                    <p className="text-sm text-[#111111]/55 font-medium leading-snug mb-1">
                      {row.item}
                    </p>
                    {row.note && (
                      <span className="inline-block text-[10px] uppercase tracking-widest text-[#D4AF37]/70 font-semibold mb-3">
                        {row.note}
                      </span>
                    )}
                    <p className="font-playfair text-2xl font-bold text-[#111111] mt-2">
                      {row.price}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-[#111111]/35">
                Preços indicativos. O orçamento definitivo é confirmado antes de iniciar qualquer trabalho, sem surpresas.
              </p>
            </div>
          </div>
        </section>

        {/* ── Trust Strip ── */}
        <section className="py-12 bg-[#071a12]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="flex justify-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-white font-bold text-xl font-playfair">{REVIEW_RATING}</p>
                <p className="text-white/35 text-xs mt-1">Google Reviews</p>
              </div>
              <div>
                <p className="text-[#D4AF37] font-bold text-2xl font-playfair">+1000</p>
                <p className="text-white/35 text-xs mt-1">Clientes satisfeitos</p>
              </div>
              <div>
                <p className="text-white font-bold text-2xl font-playfair">1h</p>
                <p className="text-white/35 text-xs mt-1">Duração média do serviço</p>
              </div>
              <div>
                <p className="text-white font-bold text-2xl font-playfair">0€</p>
                <p className="text-white/35 text-xs mt-1">Custos de deslocação</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Price Factors ── */}
        {data.factors.length > 0 && (
          <section className="py-14 bg-[#FAFAF7]">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111]">
                    O que influencia o preço?
                  </h2>
                  <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mt-4" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {data.factors.map((factor, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#111111]/6 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#111111]/75 font-medium">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {data.faqs.length > 0 && (
          <section className="py-14 bg-white border-t border-[#111111]/5">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] mb-2">
                    Perguntas frequentes
                  </p>
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111]">
                    Dúvidas sobre preços
                  </h2>
                </div>
                <ServiceFAQSchema faqs={data.faqs} />
                <div className="space-y-3">
                  {data.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-[#FAFAF7] rounded-xl border border-[#111111]/6 px-6"
                    >
                      <summary className="py-5 font-semibold text-[#111111] cursor-pointer list-none flex items-center justify-between text-[15px]">
                        {faq.question}
                        <ArrowRight className="w-4 h-4 text-[#D4AF37] group-open:rotate-90 transition-transform flex-shrink-0 ml-3" />
                      </summary>
                      <p className="pb-5 text-[#111111]/55 leading-relaxed text-sm">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Internal Links ── */}
        <section className="py-10 bg-[#FAFAF7] border-t border-[#111111]/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[#111111]/40 uppercase tracking-widest mb-3">
                  Ver página completa do serviço
                </h3>
                <Link
                  to={`/${data.serviceSlug}-${data.citySlug}`}
                  className="inline-flex items-center gap-2 bg-white border border-[#D4AF37]/30 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1A4E30] hover:bg-[#D4AF37]/5 transition-all"
                >
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  {data.serviceName} em {data.cityName}
                </Link>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#111111]/40 uppercase tracking-widest mb-3">
                  Preços noutras cidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {nearbyCities.map(city => (
                    <Link
                      key={city.slug}
                      to={`/preco-${data.serviceSlug}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#111111]/65 border border-[#111111]/8 hover:border-[#D4AF37]/30 hover:text-[#111111] transition-all"
                    >
                      <MapPin className="w-3 h-3 text-[#D4AF37]" />
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#111111]/40 uppercase tracking-widest mb-3">
                  Outros serviços em {data.cityName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedServices.map(svc => (
                    <Link
                      key={svc.slug}
                      to={`/preco-${svc.slug}-${data.citySlug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#111111]/65 border border-[#111111]/8 hover:border-[#D4AF37]/30 hover:text-[#111111] transition-all"
                    >
                      <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                      {svc.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 md:py-20 bg-[#071a12] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#D4AF37]/[0.05] blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] mb-3">
              Orçamento Grátis
            </p>
            <h2 className="font-playfair text-2xl md:text-4xl font-bold text-white mb-3">
              Peça o seu orçamento em {data.cityName}
            </h2>
            <p className="text-white/45 mb-8 text-sm md:text-base max-w-md mx-auto">
              Resposta em menos de 2 horas. Sem compromisso, sem surpresas.
            </p>
            <div className="flex gap-3 justify-center mx-auto max-w-xs sm:max-w-sm">
              <div className="relative flex-1">
                <div className="absolute -inset-1.5 rounded-full bg-[#D4AF37]/40 opacity-30 blur-lg pointer-events-none" />
                <QuizButton
                  className="relative w-full"
                  buttonClassName="h-[52px] !py-0 w-full"
                  ctaLabel="Ver preço grátis"
                  initialLocation={data.cityName}
                  initialService={quizService}
                />
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`price_cta_${data.serviceSlug}_${data.citySlug}`)}
                className="flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                Falar agora
              </a>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": `${SITE_URL}${pathname}#webpage`,
                  "url": `${SITE_URL}${pathname}`,
                  "name": data.title,
                  "description": data.metaDescription,
                  "inLanguage": "pt-PT",
                  "isPartOf": { "@id": `${SITE_URL}/#website` },
                  "publisher": { "@id": `${SITE_URL}/#business` },
                  "breadcrumb": { "@id": `${SITE_URL}${pathname}#breadcrumb` },
                },
                {
                  "@type": "BreadcrumbList",
                  "@id": `${SITE_URL}${pathname}#breadcrumb`,
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": data.serviceName, "item": `${SITE_URL}/${data.serviceSlug}` },
                    { "@type": "ListItem", "position": 3, "name": `Preços em ${data.cityName}`, "item": `${SITE_URL}${pathname}` },
                  ],
                },
                {
                  "@type": "Service",
                  "@id": `${SITE_URL}${pathname}#service`,
                  "name": `${data.serviceName} em ${data.cityName}`,
                  "description": data.metaDescription,
                  "url": `${SITE_URL}${pathname}`,
                  "provider": { "@id": `${SITE_URL}/#business` },
                  "areaServed": { "@type": "City", "name": data.cityName },
                  "offers": {
                    "@type": "Offer",
                    "availability": "https://schema.org/InStock",
                    "areaServed": { "@type": "City", "name": data.cityName },
                    "priceSpecification": {
                      "@type": "PriceSpecification",
                      "minPrice": data.priceTable[0]?.price.replace(/[^0-9]/g, "") ?? "15",
                      "maxPrice": data.priceTable[data.priceTable.length - 1]?.price.replace(/[^0-9]/g, "") ?? "99",
                      "priceCurrency": "EUR",
                      "description": `Preço de ${data.serviceName} em ${data.cityName}`,
                    },
                  },
                },
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

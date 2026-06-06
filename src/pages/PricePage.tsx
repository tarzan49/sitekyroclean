import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { Star, ArrowRight, CheckCircle, MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import { getPricePageData, getAllPriceRoutes } from "@/data/priceSeoData";
import { services, cities } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { buildServiceWaMessage } from "@/lib/buildServiceWaMessage";


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
      // Canonical points to the main LocationServicePage to consolidate link equity
      const canonicalUrl = `https://cleansolutions.com.pt/${data.serviceSlug}-${data.citySlug}`;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", canonicalUrl);
    }
  }, [pathname, data]);

  if (!data) {
    return (
      <>
        <Header />
        <main className="pt-28 pb-16 min-h-screen bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-[#1A1A2E] mb-4">Página não encontrada</h1>
            <Link to="/" className="text-gold hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];

  const relatedServices = services.filter(s => s.slug !== data.serviceSlug).slice(0, 4);
  const nearbyCities = cities.filter(c => c.slug !== data.citySlug).slice(0, 6);

  return (
    <QuizLocationProvider value={data.cityName}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-24 md:pt-28 pb-10 md:pb-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <nav className="flex items-center gap-1.5 text-xs md:text-sm text-[#1A1A2E]/55 mb-6" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-[#1A1A2E] transition-colors">Início</Link>
                <span>/</span>
                <Link to={`/${data.serviceSlug}`} className="hover:text-[#1A1A2E] transition-colors">{data.serviceName}</Link>
                <span>/</span>
                <span className="text-[#1A1A2E] font-medium">Preços em {data.cityName}</span>
              </nav>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A2E] mb-5 leading-tight">
                {data.h1}
              </h1>
              <div className="w-16 h-1 bg-gold rounded-full mb-5" />
              <p className="text-base md:text-lg text-[#1A1A2E]/55 leading-relaxed mb-6 max-w-3xl">
                {data.intro}
              </p>
              <div className="flex gap-3 max-w-xs sm:max-w-sm">
                <div className="relative flex-1">
                  <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                  <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" initialLocation={data.cityName} initialService={quizService} />
                </div>
                <a
                  href={`https://wa.me/351925530647?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.cityName))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(`price_hero_${data.serviceSlug}_${data.citySlug}`)}
                  className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                >
                  <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                  Falar agora
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Price Table */}
        <section className="py-12 md:py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-6 text-center">
                Tabela de Preços
              </h2>
              <div className="bg-card rounded-2xl shadow-lg border border-border/30 overflow-x-auto">
                <table className="w-full min-w-[320px]">
                  <thead>
                    <tr className="bg-navy text-primary-foreground">
                      <th className="text-left px-3 md:px-6 py-4 font-semibold text-sm">Serviço</th>
                      <th className="text-right px-3 md:px-6 py-4 font-semibold text-sm">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.priceTable.map((row, i) => (
                      <tr key={i} className="border-t border-border/20 hover:bg-gold/5 transition-colors">
                        <td className="px-3 md:px-6 py-4 text-sm text-foreground font-medium">
                          {row.item}
                          {row.note && <span className="ml-2 text-xs text-[#1A1A2E]/55">({row.note})</span>}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right text-sm font-bold text-[#1A1A2E]">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-4 bg-gold/5 border-t border-gold/20 text-center">
                  <p className="text-sm text-[#1A1A2E]/55">
                    Preços indicativos. Peça orçamento personalizado para preço exato.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Price Factors */}
        {data.factors.length > 0 && (
          <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-6">O que influencia o preço?</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {data.factors.map((factor, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border/20">
                      <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground font-medium">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trust */}
        <section className="py-10 md:py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border/30 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-bold text-[#1A1A2E]">5.0</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#1A1A2E]/55">50+ avaliações no Google</p>
                  </div>
                </div>
                <div className="h-px sm:h-12 sm:w-px w-full bg-border" />
                <div className="text-center sm:text-left">
                  <p className="text-3xl font-bold text-turquoise">+1000</p>
                  <p className="text-sm text-[#1A1A2E]/55">clientes satisfeitos</p>
                </div>
                <div className="sm:ml-auto">
                  <QuizButton initialLocation={data.cityName} initialService={quizService} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {data.faqs.length > 0 && (
          <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-6 text-center">Perguntas sobre Preços</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mb-8" />
                <ServiceFAQSchema faqs={data.faqs} />
                <div className="space-y-4">
                  {data.faqs.map((faq, i) => (
                    <details key={i} className="bg-card rounded-2xl shadow-sm border border-border/30 px-6 group">
                      <summary className="py-5 font-semibold text-[#1A1A2E] cursor-pointer list-none flex items-center justify-between text-base">
                        {faq.question}
                        <ArrowRight className="w-4 h-4 text-[#1A1A2E]/55 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="pb-5 text-[#1A1A2E]/55 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Internal Links */}
        <section className="py-12 md:py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">Ver serviço completo</h3>
                <Link
                  to={`/${data.serviceSlug}-${data.citySlug}`}
                  className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1A1A2E] hover:bg-[#D4AF37]/20 transition-all"
                >
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  {data.serviceName} em {data.cityName}, página completa
                </Link>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Preços noutras cidades</h3>
                <div className="flex flex-wrap gap-2">
                  {nearbyCities.map(city => (
                    <Link
                      key={city.slug}
                      to={`/preco-${data.serviceSlug}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 bg-card px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A2E] border border-border/30 hover:border-gold/30 hover:bg-gold/5 transition-all"
                    >
                      <MapPin className="w-3 h-3 text-gold" />
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Preços de outros serviços</h3>
                <div className="flex flex-wrap gap-2">
                  {relatedServices.map(svc => (
                    <Link
                      key={svc.slug}
                      to={`/preco-${svc.slug}-${data.citySlug}`}
                      className="inline-flex items-center gap-1.5 bg-card px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A2E] border border-border/30 hover:border-gold/30 hover:bg-gold/5 transition-all"
                    >
                      <ArrowRight className="w-3 h-3 text-gold" />
                      {svc.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 md:py-14 bg-kyro-green">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-3">
              Peça orçamento gratuito em {data.cityName}
            </h2>
            <p className="text-white/60 mb-6 text-base">
              Resposta em menos de 2 horas: sem compromisso.
            </p>
            <div className="flex gap-3 justify-center mx-auto max-w-xs sm:max-w-sm">
              <div className="relative flex-1">
                <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" initialLocation={data.cityName} initialService={quizService} />
              </div>
              <a
                href={`https://wa.me/351925530647?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.cityName))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`price_cta_${data.serviceSlug}_${data.citySlug}`)}
                className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
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
                  "@id": `https://cleansolutions.com.pt${pathname}#webpage`,
                  "url": `https://cleansolutions.com.pt${pathname}`,
                  "name": data.title,
                  "description": data.metaDescription,
                  "inLanguage": "pt-PT",
                  "isPartOf": { "@id": "https://cleansolutions.com.pt/#website" },
                  "publisher": { "@id": "https://cleansolutions.com.pt/#business" },
                  "breadcrumb": { "@id": `https://cleansolutions.com.pt${pathname}#breadcrumb` },
                },
                {
                  "@type": "BreadcrumbList",
                  "@id": `https://cleansolutions.com.pt${pathname}#breadcrumb`,
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://cleansolutions.com.pt" },
                    { "@type": "ListItem", "position": 2, "name": data.serviceName, "item": `https://cleansolutions.com.pt/${data.serviceSlug}` },
                    { "@type": "ListItem", "position": 3, "name": `Preços em ${data.cityName}`, "item": `https://cleansolutions.com.pt${pathname}` },
                  ],
                },
                {
                  "@type": "Service",
                  "@id": `https://cleansolutions.com.pt${pathname}#service`,
                  "name": `${data.serviceName} em ${data.cityName}`,
                  "description": data.metaDescription,
                  "url": `https://cleansolutions.com.pt${pathname}`,
                  "provider": { "@id": "https://cleansolutions.com.pt/#business" },
                  "areaServed": { "@type": "City", "name": data.cityName },
                  "offers": {
                    "@type": "Offer",
                    "availability": "https://schema.org/InStock",
                    "areaServed": { "@type": "City", "name": data.cityName },
                    "priceSpecification": {
                      "@type": "PriceSpecification",
                      "minPrice": data.priceTable[0]?.price.replace(/[^0-9]/g, "") ?? "15",
                      "maxPrice": data.priceTable[data.priceTable.length - 1]?.price.replace(/[^0-9]/g, "") ?? "80",
                      "priceCurrency": "EUR",
                      "description": `Preço de ${data.serviceName} em ${data.cityName}, IVA incluído`,
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

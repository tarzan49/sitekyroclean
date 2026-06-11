import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, MapPin, CheckCircle, Search, Droplets, Sparkles, Wind, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import {
  getMaterialBySlug,
  getAllMaterialCityRoutes,
  getMaterialCityData,
  getRelatedMaterialLinks,
} from "@/data/materialSeoData";
import { cities, services } from "@/data/locationSeoData";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import { buildMaterialWaMessage } from "@/lib/whatsappMessages";
import { MATERIAL_HERO, MATERIAL_HERO_FALLBACK } from "@/data/materialHeroImages";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
  DEFAULT_AREA_SERVED,
} from "@/lib/seoSchema";

const STEP_ICONS = [Search, Droplets, Sparkles, Wind];

const MaterialPage = () => {
  const { pathname } = useLocation();

  const { data, isCityVariant, citySlug } = useMemo(() => {
    const allCityRoutes = getAllMaterialCityRoutes();
    const cityRoute = allCityRoutes.find(r => r.path === pathname);
    if (cityRoute) {
      const d = getMaterialCityData(cityRoute.materialSlug, cityRoute.citySlug);
      return { data: d, isCityVariant: true, citySlug: cityRoute.citySlug };
    }
    const mat = getMaterialBySlug(pathname.replace(/^\//, ""));
    return { data: mat, isCityVariant: false, citySlug: "" };
  }, [pathname]);

  const cityName = useMemo(() => {
    if (!isCityVariant || !citySlug) return null;
    return cities.find(c => c.slug === citySlug)?.name ?? null;
  }, [isCityVariant, citySlug]);

  const quizService = data ? SERVICE_TO_QUIZ[data.serviceSlug] : undefined;

  const servicePrice = useMemo(() => {
    if (!data) return "39€";
    return services.find(s => s.slug === data.serviceSlug)?.priceFrom ?? "39€";
  }, [data]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", data.metaDescription);
      const canonicalUrl = isCityVariant
        ? `${SITE_URL}/${data.serviceSlug}-${citySlug}`
        : `${SITE_URL}${pathname}`;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", canonicalUrl);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", data.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", data.metaDescription);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", `${SITE_URL}${pathname}`);
    }
  }, [pathname, data, isCityVariant, citySlug]);

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

  const relatedLinks = getRelatedMaterialLinks(data.relatedMaterials);
  const topCities = cities.slice(0, 8);

  // "Sofá em Veludo" → "sofá de veludo"
  const materialLabel = data.name.toLowerCase().replace(" em ", " de ");

  return (
    <QuizLocationProvider value={cityName ?? undefined}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-14 md:pb-20 overflow-hidden bg-checker-dark">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img
              src={MATERIAL_HERO[data.slug] ?? MATERIAL_HERO_FALLBACK}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                <span>/</span>
                <Link to={`/${data.serviceSlug}`} className="hover:text-white/80 transition-colors">{data.serviceName}</Link>
                <span>/</span>
                <span className="text-white/70">{data.name}{cityName ? `, ${cityName}` : ""}</span>
              </nav>

              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                {data.serviceName}
              </p>

              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                {data.h1}{cityName ? ` em ${cityName}` : ""}
              </h1>

              <div className="w-10 h-px mb-5 opacity-50" style={{ backgroundColor: "#D4AF37" }} />

              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-2xl">
                {data.intro}
              </p>

              {/* Price + Stars */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="text-sm font-bold" style={{ color: "#D4AF37" }}>Desde {servicePrice}</span>
                <TrustRatingBadge variant="compact" />
              </div>

              <div className="flex gap-3 max-w-xs sm:max-w-sm">
                <div className="relative flex-1">
                  <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                  <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" initialLocation={cityName ?? undefined} initialService={quizService} />
                </div>
                <a
                  href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildMaterialWaMessage(data.slug, cityName))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(`material_hero_${data.slug}`)}
                  className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                >
                  <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                  Falar agora
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MATERIAL + DICAS ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Material</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-8">
                O que saber sobre {materialLabel}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Características */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E4DE]">
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#D4AF37" }}>Características</p>
                  <h3 className="font-playfair text-lg font-bold text-[#111111] mb-4">Como é este material</h3>
                  <ul className="space-y-3">
                    {data.characteristics.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                        <span className="text-sm text-[#111111]/60">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dicas de manutenção */}
                <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ background: "#071a12", borderColor: "rgba(212,175,55,0.2)" }}>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#D4AF37" }}>Manutenção</p>
                  <h3 className="font-playfair text-lg font-bold text-white mb-4">Dicas de cuidado</h3>
                  <ul className="space-y-3">
                    {data.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                        <span className="text-sm text-white/70">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROCESSO ═══ */}
        <section className="py-12 md:py-16 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Como trabalhamos</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-8">
                Processo de limpeza para {materialLabel}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.cleaningProcess.map((step, i) => {
                  const Icon = STEP_ICONS[i] ?? Sparkles;
                  const label = String(i + 1).padStart(2, "0");
                  return (
                    <div key={i} className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
                          <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em]" style={{ color: "#D4AF37" }}>{label}</span>
                      </div>
                      <p className="text-sm text-white/75 leading-relaxed">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <section className="py-12 md:py-16 bg-[#FDFDF9]">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Perguntas</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-8 text-center">Perguntas Frequentes</h2>
                <ServiceFAQSchema faqs={data.faqs} />
                <Accordion type="single" collapsible className="space-y-4">
                  {data.faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="bg-white rounded-[18px] shadow-sm hover:shadow-md border border-[#E8E4DE] px-6 transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-[#D4AF37]/30"
                    >
                      <AccordionTrigger className="text-left text-base font-semibold text-[#111111] py-5 hover:no-underline [&[data-state=open]>svg]:text-[#D4AF37]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-[#111111]/60 pb-6 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* ═══ CTA ═══ */}
        <section className="py-10 md:py-14 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>Kyro Clean Solutions</p>
            <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-3">
              Peça o seu orçamento gratuito
            </h2>
            <p className="text-white/60 mb-6 text-base">
              Desde {servicePrice} · Resposta em menos de 2 horas · Sem compromisso.
            </p>
            <div className="flex gap-3 justify-center mx-auto max-w-xs sm:max-w-sm">
              <div className="relative flex-1">
                <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" />
              </div>
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildMaterialWaMessage(data.slug, cityName))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`material_cta_${data.slug}`)}
                className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                Falar agora
              </a>
            </div>
          </div>
        </section>

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {relatedLinks.length > 0 && (
                <div>
                  <h3 className="font-playfair text-lg font-bold text-[#111111] mb-4">Outros materiais</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedLinks.map(link => (
                      <Link key={link.path} to={link.path}
                        className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!isCityVariant && (
                <div>
                  <h3 className="font-playfair text-lg font-bold text-[#111111] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    Disponível nestas cidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {topCities.map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all">
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {isCityVariant && (
                <div>
                  <h3 className="font-playfair text-lg font-bold text-[#111111] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    Também disponível em
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.filter(c => c.slug !== citySlug).slice(0, 8).map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all">
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            buildWebPageNode({
              url: `${SITE_URL}${pathname}`,
              name: data.title,
              description: data.metaDescription,
            }),
            buildBreadcrumbNode(`${SITE_URL}${pathname}#breadcrumb`, [
              { name: "Início", item: SITE_URL },
              { name: data.serviceName, item: `${SITE_URL}/${data.serviceSlug}` },
              { name: data.name, item: `${SITE_URL}/${data.slug}` },
              ...(isCityVariant && cityName ? [{ name: cityName, item: `${SITE_URL}${pathname}` }] : []),
            ]),
            buildServiceNode({
              url: `${SITE_URL}${pathname}`,
              name: data.title,
              description: data.metaDescription,
              areaServed: isCityVariant && cityName ? { "@type": "City", name: cityName } : DEFAULT_AREA_SERVED,
              offers: buildOfferNode(servicePrice.replace(/[^0-9]/g, "")),
            }),
          ],
        }) }} />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default MaterialPage;

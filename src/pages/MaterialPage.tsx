import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { MapPin, Star, MessageCircle, ArrowRight, Search, Droplets, Sparkles, Wind } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServicePackBanner from "@/components/ServicePackBanner";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";
import {
  getMaterialBySlug,
  getAllMaterialCityRoutes,
  getMaterialCityData,
  getRelatedMaterialLinks,
} from "@/data/materialSeoData";
import { SERVICE_TESTIMONIALS } from "@/data/locationPriceTestimonialsData";
import { cities, services, DEFAULT_PRICE_FROM, cityPrep } from "@/data/locationSeoData";
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
    if (!data) return DEFAULT_PRICE_FROM;
    return services.find(s => s.slug === data.serviceSlug)?.priceFrom ?? DEFAULT_PRICE_FROM;
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
  const heroImg = MATERIAL_HERO[data.slug] ?? MATERIAL_HERO_FALLBACK;
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildMaterialWaMessage(data.slug, cityName))}`;

  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  const testimonials = SERVICE_TESTIMONIALS[data.serviceSlug];

  return (
    <QuizLocationProvider value={cityName ?? undefined}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" />
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
                  <span className="text-white/70">{data.name}{cityName ? ` · ${cityName}` : ""}</span>
                </nav>

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      {data.serviceName}{cityName ? ` · ${cityName}` : ""}
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  {h1Rest}{" "}<span style={{ color: "#D4AF37" }}>{h1Gold}</span>
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
                    initialLocation={cityName ?? undefined}
                    initialService={quizService}
                    buttonClassName="h-[58px] md:h-[52px] !py-0 w-full"
                  />
                  <div className="relative group flex-1">
                    <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(`material_hero_${data.slug}`)}
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
                  <img
                    src={heroImg}
                    alt={`${data.name} profissional`}
                    className="relative w-full max-h-[440px] object-cover shadow-2xl"
                    style={{ borderTop: "2px solid #D4AF37" }}
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TABELA DE PREÇOS ═══ */}
        <ServicePriceSection serviceSlug={data.serviceSlug} initialLocation={cityName ?? undefined} />

        {/* ═══ CARACTERÍSTICAS DO MATERIAL ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Material"
              heading="Características de"
              goldWord={data.name}
              light={false}
            />
            <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {data.characteristics.slice(0, 4).map((c, i) => (
                <div key={i} className="relative overflow-hidden flex items-start gap-3 p-6 md:p-7" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <span className="font-playfair font-bold flex-shrink-0 leading-none" style={{ fontSize: "1.75rem", color: "rgba(212,175,55,0.4)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-white/65 leading-relaxed pt-1">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ GALERIA — O MATERIAL EM DETALHE ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Em Detalhe" heading="A intervenção em" goldWord={data.name} light={true} />
            <div className="relative overflow-hidden max-w-4xl" style={{ borderTop: "2px solid #D4AF37" }}>
              <img
                src={heroImg}
                alt={`${data.serviceName} em ${data.name.toLowerCase()}`}
                className="w-full max-h-[480px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ═══ PROCESSO DE LIMPEZA ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Processo"
              heading="Como limpamos o seu"
              goldWord={data.name}
              light={false}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {[0, 1].map((colIdx) => {
                const splitAt = Math.ceil(data.cleaningProcess.length / 2);
                const colSteps = colIdx === 0 ? data.cleaningProcess.slice(0, splitAt) : data.cleaningProcess.slice(splitAt);
                const offset = colIdx === 0 ? 0 : splitAt;
                return (
                  <div key={colIdx} className="grid gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    {colSteps.map((step, idx) => {
                      const num = offset + idx;
                      const Icon = STEP_ICONS[num] ?? Sparkles;
                      return (
                        <div key={num} className="relative overflow-hidden flex items-start gap-4 p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)" }}>
                            <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold tracking-[0.24em] uppercase mb-1" style={{ color: "#D4AF37" }}>{String(num + 1).padStart(2, "0")}</p>
                            <p className="text-sm text-white/70 leading-relaxed">{step}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.name.toLowerCase()}`} variant="dark" />
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

        {/* ═══ PACKS ═══ */}
        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.serviceSlug] ?? ["pack-sala-completa"]}
          city={citySlug || undefined}
          variant="dark"
        />

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20" style={{ backgroundColor: "#FDFDF9" }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Cobertura" heading="Explore" goldWord="mais" />
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {relatedLinks.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Outros materiais</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedLinks.map(link => (
                      <Link key={link.path} to={link.path}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!isCityVariant && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Disponível em</p>
                  <div className="flex flex-wrap gap-2">
                    {topCities.map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all">
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {isCityVariant && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Também disponível em</p>
                  <div className="flex flex-wrap gap-2">
                    {cities.filter(c => c.slug !== citySlug).slice(0, 8).map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all">
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
            buildWebPageNode({ url: `${SITE_URL}${pathname}`, name: data.title, description: data.metaDescription }),
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

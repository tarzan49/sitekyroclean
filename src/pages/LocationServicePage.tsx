import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { MapPin, Star, CheckCircle, MessageCircle, ArrowRight, Minus, Plus, Euro, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import QuizFormLazy from "@/components/QuizFormLazy";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServicePackBanner from "@/components/ServicePackBanner";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import { getLocationServiceData, services, cities, getCityLinksForService } from "@/data/locationSeoData";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { municipiosComFreguesias } from "@/data/freguesiaSeoData";
import { getAllProblems } from "@/data/problemSeoData";
import { getMaterialsByService } from "@/data/materialSeoData";
import { GENERIC_PROCESS_STEPS, IMPERMEABILIZACAO_STEPS } from "@/constants/serviceProcesses";
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITIES } from "@/constants/metroCities";
import { SERVICE_RESULT_CONTENT, pickServiceHero } from "@/constants/serviceContent";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import SectionHeader from "@/components/SectionHeader";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, SERVICE_TESTIMONIALS, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { calcWidgetTotal, calcChairBracket, calcCarpetWidget, buildWidgetQuizConfig, WIDGET_DISCOUNT_THRESHOLD } from "@/lib/priceWidgetCalc";
import { locationPrices } from "@/components/quiz/QuizTypes";
import { PROBLEM_IMAGES, PROBLEM_CTA, PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";
import { ServiceTrustDesktop, ServiceTrustMobile } from "@/components/ServiceTrustBlock";


// Default quantity shown by a price-table row's stepper before the user adjusts it.
function getRowDefaultQty(config: PriceRowQuizConfig): number {
  if (config.chairQty) return parseInt(config.chairQty, 10) || 1;
  return 1;
}

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
  const { isQuizOpen: isPriceQuizOpen, openQuiz: openPriceQuiz, closeQuiz: closePriceQuiz } = useQuizLauncher();
  const { isQuizOpen: isProblemQuizOpen, openQuiz: openProblemQuiz, closeQuiz: closeProblemQuiz } = useQuizLauncher();
  const [priceQuizConfig, setPriceQuizConfig] = useState<PriceRowQuizConfig | null>(null);
  const [rowQuantities, setRowQuantities] = useState<Record<number, number>>({});
  const [chaiseLongueAddon, setChaiseLongueAddon] = useState(0);

  useEffect(() => {
    setRowQuantities({});
    setChaiseLongueAddon(0);
  }, [data?.serviceSlug]);

  const adjustRowQty = (i: number, delta: number, min = 0, max = 99) => {
    setRowQuantities(prev => {
      const current = prev[i] ?? 0;
      return { ...prev, [i]: Math.min(max, Math.max(min, current + delta)) };
    });
  };

  const handleSelectRow = (i: number, config: PriceRowQuizConfig) => {
    const qty = rowQuantities[i] ?? getRowDefaultQty(config);
    const resolved: PriceRowQuizConfig = { ...config };
    if (config.sofaSizeId) resolved.sofaQty = qty;
    if (config.mattressSizeId) resolved.mattressQty = qty;
    if (config.chairQty) resolved.chairQty = String(qty);
    setPriceQuizConfig(resolved);
    openPriceQuiz();
  };

  const handlePriceTableContinue = () => {
    if (!data) return;
    const config = buildWidgetQuizConfig(data.serviceSlug, rowQuantities, chaiseLongueAddon);
    if (!config) return;
    setPriceQuizConfig(config);
    openPriceQuiz();
  };

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
      if (canonical) canonical.setAttribute("href", `${SITE_URL}${location.pathname}`);
    }
  }, [location.pathname, data]);

  const relatedProblems = useMemo(() => {
    if (!data) return [];
    return getAllProblems()
      .filter(p =>
        p.visible &&
        p.relatedServices.includes(data.serviceSlug) &&
        (METRO_CITIES.has(data.citySlug) || p.relatedCities.includes(data.citySlug))
      )
      .slice(0, 5)
      .map(p => ({ slug: p.slug, keyword: p.keyword }));
  }, [data]);

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

  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];

  const heroImgs = pickServiceHero(data.serviceSlug, data.city);
  const otherServices = data.relatedServices
    .map(slug => {
      const svc = services.find(s => s.slug === slug);
      return svc ? { ...svc, locationPath: `/${slug}-${data.citySlug}` } : null;
    })
    .filter(Boolean) as (typeof services[number] & { locationPath: string })[];

  const cityFreguesias = municipiosComFreguesias.find(m => m.slug === data.citySlug);

  const materialLinks = getMaterialsByService(data.serviceSlug);

  const MARCA_SLUGS = ['ikea', 'natuzzi', 'kave-home', 'leroy-merlin', 'moviflor', 'conforama', 'el-corte-ingles', 'roche-bobois'];

  const resultContent = (SERVICE_RESULT_CONTENT[data.serviceSlug] ?? SERVICE_RESULT_CONTENT['limpeza-sofas'])(data.city);
  const serviceBaseUrl = services.find(s => s.slug === data.serviceSlug)?.baseRoute ?? `/${data.serviceSlug}`;

  // "Limpeza de Sofás" → "sofás" (categoria no plural para headings tipo "Problemas de sofás...")
  const serviceCategory = data.service.startsWith("Limpeza de ")
    ? data.service.replace("Limpeza de ", "").toLowerCase()
    : data.service.toLowerCase();

  // H1: last word (the city name) rendered in gold
  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  const waUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.city))}`;

  // "Porto" takes the definite article ("no Porto"); every other city in our list reads naturally with "em"
  const cityPrep = data.citySlug === 'porto' ? 'no' : 'em';

  const freguesiaCount = cityFreguesias?.freguesias.length ?? 0;
  const snapshotStats = [
    { value: "5.0 ★", label: "Avaliação Google", icon: Star },
    { value: data.priceFrom, label: `Desde, ${cityPrep} ${data.city}`, icon: Euro },
    freguesiaCount > 0
      ? { value: `${freguesiaCount}+`, label: "Zonas cobertas", icon: MapPin }
      : { value: "100%", label: `Cobertura ${cityPrep} ${data.city}`, icon: MapPin },
    { value: "30min", label: "Tempo de resposta", icon: Clock },
  ];

  const processSteps = data.serviceSlug === 'impermeabilizacao' ? IMPERMEABILIZACAO_STEPS : GENERIC_PROCESS_STEPS;

  const problemImages = PROBLEM_IMAGES[data.serviceSlug] ?? [];
  const problemCards = data.problems.map((problem, idx) => ({
    title: problem.title,
    description: problem.description,
    alt: problem.description,
    image: problemImages[idx],
    cta: PROBLEM_CTA[problem.title] ?? "Pedir Orçamento",
  })).filter(card => card.image);
  const problemGridCols = problemCards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <QuizLocationProvider value={data.city}>
    <QuizServiceProvider value={quizService}>
      <ServiceLocationSchema
        serviceName={data.service}
        serviceBaseUrl={serviceBaseUrl}
        placeName={data.city}
        description={resultContent.desc}
        pageUrl={location.pathname}
        priceFrom={data.priceFrom}
      />
      <Header />
      <main>

        {/* ═══ HERO + LOCAL SNAPSHOT (fundo fotográfico contínuo) ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <picture className="w-full h-full">
              <source media="(max-width: 767px)" srcSet={heroImgs.m} />
              <source media="(min-width: 768px)" srcSet={heroImgs.d} />
              <img src={heroImgs.d} alt={data.h1} className="w-full h-full object-cover" loading="eager" />
            </picture>
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.90) 78%, rgba(7,26,18,0.97) 100%)" }} />

        <section className="relative pt-24 md:pt-28 pb-16 md:pb-24">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                  <span>/</span>
                  <Link to={serviceBaseUrl} className="hover:text-white/80 transition-colors">{data.service}</Link>
                  <span>/</span>
                  <span className="text-white/70">{data.city}</span>
                </nav>

                {/* Overline */}
                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span
                      className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase"
                      style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                    >
                      {data.service} · {data.city}
                    </span>
                  </div>
                </div>

                <h1
                  className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
                >
                  {h1Rest}{" "}<span style={{ color: "#D4AF37" }}>{h1Gold}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {data.intro.split('.')[0]}.
                </p>

                <div className="mb-6">
                  <TrustRatingBadge variant="mapsLinkClients" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <QuizButton
                    className="flex-1"
                    initialLocation={data.city}
                    initialService={quizService}
                    initialServiceType={data.serviceSlug === 'impermeabilizacao' ? 'waterproofing' : 'cleaning'}
                    skipToUpsell
                    buttonClassName="h-[58px] md:h-[52px] !py-0 w-full"
                  />
                  <div className="relative group flex-1">
                    <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(`location_hero_${data.serviceSlug}_${data.citySlug}`)}
                      className="relative flex items-center justify-center gap-2 w-full h-[58px] md:h-[52px] px-6 font-bold text-white touch-manipulation bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-150"
                    >
                      <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
                    </a>
                  </div>
                </div>

                <p className="text-white/40 text-xs mt-4">Desde {data.priceFrom} · Orçamento gratuito · Sem compromisso</p>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  <picture>
                    <source media="(max-width: 767px)" srcSet={heroImgs.m} type="image/webp" />
                    <source media="(min-width: 768px)" srcSet={heroImgs.d} type="image/webp" />
                    <img
                      src={heroImgs.d}
                      alt={`${data.service} profissional ${cityPrep} ${data.city}`}
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

        <ServiceSnapshotStats stats={snapshotStats} />
        </div>

        {/* ═══ TABELA DE PREÇOS ═══ */}
        {PRICE_TABLE[data.serviceSlug] && (
          <section className="py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
                <div>
                  <SectionHeader
                    overline="Tabela de Preços"
                    heading={`Quanto custa ${PRICE_HEADING_VERB[data.serviceSlug] ?? data.service.toLowerCase()} ${cityPrep}`}
                    goldWord={data.city}
                    subtitle={`Preços fixos e transparentes, sem surpresas. ${(locationPrices[data.city] ?? 0) === 0 ? `Deslocação incluída em toda a área de ${data.city}.` : `Deslocação +${locationPrices[data.city]}€ a ${data.city}.`} Orçamento gratuito antes de qualquer compromisso.`}
                  />
                  {/* Trust facts — desktop only (variante 1) */}
                  <div className="hidden md:block">
                    <ServiceTrustDesktop serviceSlug={data.serviceSlug} variant={1} />
                  </div>
                </div>
                <div className="overflow-hidden" style={{ boxShadow: "0 12px 50px rgba(7,26,18,0.16), 0 2px 8px rgba(7,26,18,0.08)" }}>
                  {/* ── Header escuro ── */}
                  <div className="px-6 py-6" style={{ background: "#071a12" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: "#25D366" }} />
                        <p className="text-[9px] font-bold tracking-[0.28em] uppercase" style={{ color: "rgba(255,255,255,0.40)" }}>Orçamento Gratuito</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5" style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>Sem compromisso</span>
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-white leading-snug mb-1">
                      Calcule o seu preço agora
                    </h3>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                      Resposta em menos de 30 min · Deslocação ao domicílio
                    </p>
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      {(() => {
                        const fee = locationPrices[data.city] ?? 0;
                        return (
                          <p className="text-[10px]" style={{ color: fee === 0 ? "rgba(37,211,102,0.60)" : "rgba(255,255,255,0.26)" }}>
                            {fee === 0 ? `Deslocação incluída em ${data.city}` : `+${fee}€ deslocação a ${data.city}`}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* ── Linhas de preço com steppers ── */}
                  <div className="bg-white">
                    {PRICE_TABLE[data.serviceSlug].map((row, i) => {
                        const quizConfig = PRICE_TABLE_QUIZ_CONFIG[data.serviceSlug]?.[i] ?? null;

                        // Chaise longue add-on row (null config) — stepper próprio
                        if (!quizConfig) {
                          const active = chaiseLongueAddon > 0;
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-4 px-5 py-4 border-b transition-all duration-200"
                              style={{
                                borderBottomColor: "rgba(17,17,17,0.06)",
                                borderLeft: active ? "3px solid #D4AF37" : "3px solid transparent",
                                background: active ? "rgba(212,175,55,0.03)" : "transparent",
                              }}
                            >
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setChaiseLongueAddon(v => Math.max(0, v - 1))}
                                  className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                                  style={{ background: "#071a12", color: "white", opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
                                  aria-label="Remover chaise longue"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span
                                  className="w-8 text-center font-playfair text-xl font-bold tabular-nums"
                                  style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.20)" }}
                                >{chaiseLongueAddon}</span>
                                <button
                                  type="button"
                                  onClick={() => setChaiseLongueAddon(v => v + 1)}
                                  className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                                  style={{ background: "#071a12", color: "white" }}
                                  aria-label="Adicionar chaise longue"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="flex-1 text-sm font-medium" style={{ color: active ? "#111111" : "rgba(17,17,17,0.55)" }}>{row.item}</span>
                              <span className="font-playfair text-xl font-bold tabular-nums flex-shrink-0" style={{ color: active ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>{row.price}</span>
                            </div>
                          );
                        }

                        const qty = rowQuantities[i] ?? 0;
                        const isCarpet = quizConfig.service === 'carpet';
                        const isChair  = quizConfig.service === 'chairs';
                        const isAlcatifa = data.serviceSlug === 'limpeza-alcatifas';
                        const isWaterproof = data.serviceSlug === 'impermeabilizacao';
                        const chairP  = isChair  && qty > 0 ? calcChairBracket(qty, isWaterproof) : undefined;
                        const carpetP = isCarpet && qty > 0 ? calcCarpetWidget(qty, isAlcatifa)   : undefined;
                        const dynamicPrice: string | null = isChair
                          ? (qty <= 0 ? null : chairP === null ? 'Sob orçamento' : `${chairP}€`)
                          : isCarpet
                          ? (qty <= 0 ? (isAlcatifa ? '3€/m²' : '12€/m²') : carpetP == null ? 'Sob orçamento' : `${Math.round(carpetP * 10) / 10}€`)
                          : row.price;

                        if (isCarpet) {
                          return (
                            <div
                              key={i}
                              className="px-5 py-4 border-b transition-all duration-200"
                              style={{
                                borderBottomColor: "rgba(17,17,17,0.06)",
                                borderLeft: qty > 0 ? "3px solid #D4AF37" : "3px solid transparent",
                                background: qty > 0 ? "rgba(212,175,55,0.03)" : "transparent",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="number" min={0} max={isAlcatifa ? 50 : 20}
                                  value={qty || ''} placeholder="0"
                                  onChange={e => {
                                    const v = parseFloat(e.target.value) || 0;
                                    setRowQuantities(prev => ({ ...prev, [i]: Math.max(0, v) }));
                                  }}
                                  className="w-20 text-center font-playfair text-xl font-bold outline-none transition-colors"
                                  style={{
                                    borderBottom: `2px solid ${qty > 0 ? "#D4AF37" : "rgba(17,17,17,0.20)"}`,
                                    color: qty > 0 ? "#D4AF37" : "#111111",
                                    background: "transparent",
                                  }}
                                />
                                <span className="text-sm font-medium" style={{ color: "rgba(17,17,17,0.50)" }}>m²</span>
                                <span className="flex-1" />
                                {dynamicPrice !== null && (
                                  <span className="font-playfair text-xl font-bold tabular-nums" style={{ color: qty > 0 ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>{dynamicPrice}</span>
                                )}
                              </div>
                              <p className="text-[11px] mt-1.5" style={{ color: "rgba(17,17,17,0.35)" }}>
                                {isAlcatifa ? 'até 50m²: 3€/m² · +50m²: sob orçamento' : '≤5m²: 12€/m² · ≤10m²: 10€/m² · ≤15m²: 9€/m² · +15m²: sob orçamento'}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={i}
                            className="flex items-center gap-4 px-5 py-4 border-b transition-all duration-200"
                            style={{
                              borderBottomColor: "rgba(17,17,17,0.06)",
                              borderLeft: qty > 0 ? "3px solid #D4AF37" : "3px solid transparent",
                              background: qty > 0 ? "rgba(212,175,55,0.03)" : "transparent",
                            }}
                          >
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => adjustRowQty(i, -1)}
                                disabled={qty === 0}
                                aria-label="Diminuir"
                                className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                                style={{ background: "#071a12", color: "white", opacity: qty > 0 ? 1 : 0, pointerEvents: qty > 0 ? 'auto' : 'none' }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span
                                className="w-8 text-center font-playfair text-xl font-bold tabular-nums"
                                style={{ color: qty > 0 ? "#D4AF37" : "rgba(17,17,17,0.20)" }}
                              >{qty}</span>
                              <button
                                type="button"
                                onClick={() => adjustRowQty(i, 1)}
                                aria-label="Aumentar"
                                className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                                style={{ background: "#071a12", color: "white" }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="flex-1 text-sm font-medium transition-colors" style={{ color: qty > 0 ? "#111111" : "rgba(17,17,17,0.55)" }}>{row.item}</span>
                            {dynamicPrice !== null && (
                              <span className="font-playfair text-xl font-bold tabular-nums flex-shrink-0" style={{ color: qty > 0 ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>{dynamicPrice}</span>
                            )}
                          </div>
                        );
                      })}

                    {/* Discount bar */}
                    {(() => {
                      const total = calcWidgetTotal(data.serviceSlug, rowQuantities, chaiseLongueAddon);
                      const reached = total >= WIDGET_DISCOUNT_THRESHOLD;
                      const pct = Math.min(100, (total / WIDGET_DISCOUNT_THRESHOLD) * 100);
                      const remaining = Math.ceil(WIDGET_DISCOUNT_THRESHOLD - total);
                      return (
                        <div className="px-5 py-3 border-t" style={{ borderColor: "rgba(17,17,17,0.07)" }}>
                          {reached ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold" style={{ color: "#D4AF37" }}>10% de desconto ativo</span>
                              <span className="text-[10px] px-2 py-0.5 font-bold" style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>-10%</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px]" style={{ color: "rgba(17,17,17,0.45)" }}>
                                  {total > 0 ? <><span className="font-semibold" style={{ color: "#111111" }}>Faltam {remaining}€</span> para 10% de desconto</> : 'Adicione 149€+ e poupe 10% em tudo'}
                                </span>
                                {total > 0 && <span className="text-[11px] font-semibold" style={{ color: "rgba(17,17,17,0.40)" }}>{total}€ / {WIDGET_DISCOUNT_THRESHOLD}€</span>}
                              </div>
                              <div className="h-1.5 overflow-hidden" style={{ background: "rgba(17,17,17,0.07)" }}>
                                <div
                                  className="h-full transition-all duration-500"
                                  style={{ width: `${Math.max(pct, total > 0 ? 4 : 0)}%`, background: "linear-gradient(90deg,#B8912A,#EDD96A)" }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {/* Total + CTA */}
                    {(() => {
                      const total = calcWidgetTotal(data.serviceSlug, rowQuantities, chaiseLongueAddon);
                      const discountActive = total >= WIDGET_DISCOUNT_THRESHOLD;
                      const discountedTotal = Math.round(total * 0.9);
                      const fee = locationPrices[data.city] ?? 0;
                      const hasAnySelection = total > 0 || Object.values(rowQuantities).some(q => q > 0) || chaiseLongueAddon > 0;
                      return (
                        <div className="bg-white px-5 pt-3 pb-5 space-y-3">
                          {/* Deslocação */}
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" style={{ color: fee === 0 ? "#25D366" : "rgba(17,17,17,0.25)" }} />
                            <span className="text-xs" style={{ color: "rgba(17,17,17,0.45)" }}>
                              {fee === 0 ? `Deslocação incluída em ${data.city}` : `+${fee}€ deslocação a ${data.city}`}
                            </span>
                          </div>

                          {/* Total block */}
                          {total > 0 && (
                            <div
                              className="flex items-center justify-between px-5 py-4"
                              style={{ background: "#071a12" }}
                            >
                              <div>
                                <p
                                  className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5"
                                  style={{ color: "rgba(255,255,255,0.40)" }}
                                >
                                  {discountActive ? "Total com desconto" : "Total estimado"}
                                </p>
                                {discountActive && (
                                  <p className="text-xs line-through" style={{ color: "rgba(255,255,255,0.30)" }}>{total}€</p>
                                )}
                              </div>
                              <span
                                className="font-playfair font-bold tabular-nums"
                                style={{ fontSize: "2rem", lineHeight: 1, color: "#D4AF37" }}
                              >
                                {discountActive ? discountedTotal : total}€
                              </span>
                            </div>
                          )}

                          {/* CTA */}
                          <button
                            type="button"
                            onClick={handlePriceTableContinue}
                            className="w-full h-14 flex items-center justify-center gap-3 font-bold text-[13px] tracking-[0.18em] uppercase transition-all active:scale-[0.98]"
                            style={{
                              background: "linear-gradient(135deg, #B8912A 0%, #EDD96A 50%, #B8912A 100%)",
                              color: "#071a12",
                              boxShadow: hasAnySelection ? "0 6px 28px rgba(212,175,55,0.45)" : "none",
                              opacity: hasAnySelection ? 1 : 0.6,
                            }}
                          >
                            Continuar para o orçamento
                            <ArrowRight className="w-4 h-4 flex-shrink-0" />
                          </button>

                          <p className="text-center text-[10px]" style={{ color: "rgba(17,17,17,0.35)" }}>
                            Sem cartão · Sem compromisso · 100% gratuito
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              {/* Trust mobile colapsável — abaixo do widget */}
              <div className="lg:hidden">
                <ServiceTrustMobile serviceSlug={data.serviceSlug} variant={1} />
              </div>
            </div>
          </section>
        )}

        {priceQuizConfig && (
          <QuizFormLazy
            isOpen={isPriceQuizOpen}
            onClose={closePriceQuiz}
            initialLocation={data.city}
            initialService={priceQuizConfig.service}
            initialServiceType={priceQuizConfig.serviceType}
            initialSofaItems={priceQuizConfig.sofaItems}
            initialSofaSizeId={priceQuizConfig.sofaSizeId}
            initialSofaQty={priceQuizConfig.sofaQty}
            initialMattressItems={priceQuizConfig.mattressItems}
            initialMattressSizeId={priceQuizConfig.mattressSizeId}
            initialMattressQty={priceQuizConfig.mattressQty}
            initialChairQty={priceQuizConfig.chairQty}
            initialCarpetArea={priceQuizConfig.carpetArea}
            initialUpsellItems={priceQuizConfig.initialUpsellItems}
            skipToUpsell
          />
        )}

        <QuizFormLazy
          isOpen={isProblemQuizOpen}
          onClose={closeProblemQuiz}
          initialLocation={data.city}
          initialService={quizService}
        />

        {/* ═══ PROBLEMAS COMUNS ═══ */}
        {problemCards.length > 0 && (
          <section className="py-14 md:py-20 bg-kyro-green">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader
                overline="O Que Resolvemos"
                heading={`Problemas de ${serviceCategory} que resolvemos ${cityPrep}`}
                goldWord={data.city}
                light={false}
              />
              <div className={`flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 md:overflow-visible md:grid md:grid-cols-2 ${problemGridCols} md:gap-4 md:pb-0`}>
                {problemCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="snap-start flex-none w-[78vw] sm:w-[54vw] md:w-auto relative overflow-hidden rounded-2xl group h-[400px] md:h-[440px]"
                  >
                    <img
                      src={card.image}
                      alt={card.alt}
                      className="absolute inset-0 w-full h-full object-cover saturate-[0.55] group-hover:saturate-[0.85] group-hover:scale-[1.05] transition-all duration-700 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-0 left-0 right-0 z-10 p-5 md:p-6 pb-12 bg-gradient-to-b from-[#071a12]/90 via-[#071a12]/35 to-transparent">
                      <div
                        className="mb-2 rounded-full opacity-45 group-hover:opacity-90 transition-all duration-400"
                        style={{ width: "20px", height: "1.5px", backgroundColor: "#D4AF37" }}
                      />
                      <h3 className="font-playfair font-bold text-white text-[1.05rem] md:text-[1.15rem] leading-[1.25]">{card.title}</h3>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-6 pt-14 bg-gradient-to-t from-[#071a12] via-[#071a12]/75 to-transparent">
                      <p className="text-white/65 text-xs leading-relaxed line-clamp-2 mb-4">{card.description}</p>
                      <button
                        type="button"
                        onClick={openProblemQuiz}
                        className="inline-flex items-center justify-center gap-1.5 min-w-[150px] rounded-full px-4 py-2.5 text-xs font-bold text-[#111111] transition-transform duration-300 group-hover:scale-[1.03]"
                        style={{
                          background: "linear-gradient(to right, #C9A84C, #EDD96A, #C9A84C)",
                          boxShadow: "0 3px 10px rgba(201,168,76,0.35)",
                        }}
                      >
                        {card.cta}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/[0.06] group-hover:ring-gold/20 transition-all duration-400 pointer-events-none" />
                  </div>
                ))}
              </div>
              <p className="text-center text-[9px] text-white/18 tracking-[0.22em] uppercase mt-4 md:hidden">
                deslize para ver mais →
              </p>
            </div>
          </section>
        )}

        {/* ═══ COMO FUNCIONA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Processo"
              heading={`Como funciona ${cityPrep}`}
              goldWord={data.city}
              subtitle={data.howItWorks}
              light={true}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {[0, 1].map((colIdx) => {
                const splitAt = Math.ceil(processSteps.length / 2);
                const colSteps = colIdx === 0 ? processSteps.slice(0, splitAt) : processSteps.slice(splitAt);
                const offset = colIdx === 0 ? 0 : splitAt;
                return (
                  <div key={colIdx} className="grid gap-px" style={{ backgroundColor: "#E8E4DE" }}>
                    {colSteps.map((step, idx) => {
                      const num = offset + idx;
                      return (
                        <div key={num} className="relative overflow-hidden flex items-start gap-4 p-5 md:p-6 bg-white" style={{ borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                          <span className="font-playfair font-bold flex-shrink-0 leading-none" style={{ fontSize: "1.75rem", color: "rgba(212,175,55,0.35)" }}>
                            {String(num + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#111111] mb-1">{step.label}</p>
                            <p className="text-xs text-[#111111]/55 leading-relaxed">{step.desc}</p>
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
        {data.faqs && data.faqs.length > 0 && (
          <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.service.toLowerCase()} ${cityPrep} ${data.city}`} variant="dark" />
        )}

        {/* ═══ BENEFÍCIOS + TESTEMUNHOS ═══ */}
        {data.benefits && data.benefits.length > 0 && (
          <section className="py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader
                overline="Vantagens"
                heading={`Porquê escolher a Kyro ${cityPrep}`}
                goldWord={data.city}
                light={true}
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px mb-10" style={{ backgroundColor: "#E8E4DE" }}>
                {data.benefits.map((benefit, idx) => (
                  <div key={idx} className="relative overflow-hidden flex items-start gap-3 p-6 md:p-7 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                    <span
                      className="absolute bottom-2 right-3 font-playfair font-bold leading-none select-none pointer-events-none"
                      style={{ fontSize: "5rem", color: "rgba(212,175,55,0.1)" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <CheckCircle className="relative w-5 h-5 mt-0.5 shrink-0" style={{ color: "#D4AF37" }} />
                    <span className="relative text-sm text-[#111111]/65 leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>

              {SERVICE_TESTIMONIALS[data.serviceSlug] && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>Avaliações Reais</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
                    {SERVICE_TESTIMONIALS[data.serviceSlug].map((t, i) => (
                      <div key={i} className="relative overflow-hidden p-6 md:p-8 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                        <div className="relative flex gap-0.5 mb-4">
                          {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                        </div>
                        <p className="relative text-sm text-[#111111]/65 leading-relaxed italic mb-4">"{t.text}"</p>
                        <div className="relative flex items-center gap-2">
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
                </>
              )}
            </div>
          </section>
        )}

        {/* ═══ PACKS ═══ */}
        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.serviceSlug] ?? ["pack-sala-completa"]}
          city={data.citySlug}
          variant="dark"
        />

        {/* ═══ ÁREA DE SERVIÇO (DIRETÓRIO) ═══ */}
        <section className="py-14 md:py-20" style={{ backgroundColor: "#FDFDF9" }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Cobertura"
              heading={`Área de serviço ${cityPrep}`}
              goldWord={data.city}
              subtitle={data.localSection}
            />

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {cityFreguesias && cityFreguesias.freguesias.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Zonas {cityPrep} {data.city}</p>
                  <div className="flex flex-wrap gap-2">
                    {cityFreguesias.freguesias.slice(0, 8).map(f => (
                      <Link
                        key={f.slug}
                        to={`/${data.serviceSlug}-${data.citySlug}-${f.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                      >
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {f.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Também disponível em</p>
                <div className="flex flex-wrap gap-2">
                  {getCityLinksForService(data.serviceSlug).filter(c => c.name !== data.city).slice(0, 6).map(city => (
                    <Link
                      key={city.name}
                      to={city.path}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>

              {otherServices.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Outros serviços {cityPrep} {data.city}</p>
                  <div className="flex flex-wrap gap-2">
                    {otherServices.map(svc => (
                      <Link
                        key={svc.slug}
                        to={svc.locationPath}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                      >
                        {svc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedProblems.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Problemas que resolvemos {cityPrep} {data.city}</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedProblems.map(p => (
                      <Link
                        key={p.slug}
                        to={`/${p.slug}-${data.citySlug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                      >
                        {p.keyword}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {materialLinks.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Por tipo de material {cityPrep} {data.city}</p>
                  <div className="flex flex-wrap gap-2">
                    {materialLinks.map(m => (
                      <Link
                        key={m.slug}
                        to={`/${m.slug}-${data.citySlug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                      >
                        {m.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {data.serviceSlug === 'limpeza-sofas' && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Marcas de sofá {cityPrep} {data.city}</p>
                  <div className="flex flex-wrap gap-2">
                    {MARCA_SLUGS.map(slug => (
                      <Link
                        key={slug}
                        to={`/limpeza-sofa-${slug}-${data.citySlug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all capitalize"
                      >
                        {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default LocationServicePage;

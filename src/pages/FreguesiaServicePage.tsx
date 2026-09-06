import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { MapPin, Star, CheckCircle, MessageCircle, ArrowRight, Minus, Plus, Euro, Clock, Check, Shield, Bug } from "lucide-react";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import QuizFormLazy from "@/components/QuizFormLazy";
import SectionHeader from "@/components/SectionHeader";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServicePackBanner from "@/components/ServicePackBanner";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import { services } from "@/data/locationSeoData";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import {
  municipiosComFreguesias,
  getFreguesia,
  getNearbyFreguesias,
  generateFreguesiaContent,
} from "@/data/freguesiaSeoData";
import { getAllProblems } from "@/data/problemSeoData";
import { GENERIC_PROCESS_STEPS, IMPERMEABILIZACAO_STEPS } from "@/constants/serviceProcesses";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITIES } from "@/constants/metroCities";
import { pickServiceHero } from "@/constants/serviceContent";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { calcWidgetTotal, calcChairBracket, calcCarpetWidget, buildWidgetQuizConfig, calcRowAddonDelta, calcSofaAntiAcarosDelta, calcChairAddonWaterproofTotal, calcChairAntiAcarosTotal, calcWidgetPricing, calcWidgetArticles, PACK_DISCOUNT_MIN_SERVICE, PACK_DISCOUNT_MIN_UPSELL_ITEM, type WidgetTier } from "@/lib/priceWidgetCalc";
import { locationPrices, type CarpetItem } from "@/components/quiz/QuizTypes";
import { PROBLEM_IMAGES, PROBLEM_POOL_CTA, PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";
import { ServiceTrustDesktop, ServiceTrustMobile } from "@/components/ServiceTrustBlock";
import { CarpetTierLegend } from "@/components/CarpetTierLegend";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";

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

  const { isQuizOpen: isPriceQuizOpen, openQuiz: openPriceQuiz, closeQuiz: closePriceQuiz } = useQuizLauncher();
  const { isQuizOpen: isProblemQuizOpen, openQuiz: openProblemQuiz, closeQuiz: closeProblemQuiz } = useQuizLauncher();
  const [priceQuizConfig, setPriceQuizConfig] = useState<PriceRowQuizConfig | null>(null);
  const [rowQuantities, setRowQuantities] = useState<Record<number, number>>({});
  const [chaiseLongueAddon, setChaiseLongueAddon] = useState(0);
  const [addonRows, setAddonRows] = useState<Set<number>>(new Set());
  const [addonTier, setAddonTier] = useState<WidgetTier>('premium');
  const [antiAcarosRows, setAntiAcarosRows] = useState<Set<number>>(new Set());
  // Simulador de tapetes (2026-09-06): várias peças medidas por linha, mesma
  // lógica do quiz — nunca uma área única. Alcatifa continua com rowQuantities.
  const [carpetItemsByRow, setCarpetItemsByRow] = useState<Record<number, CarpetItem[]>>({});

  useEffect(() => {
    setRowQuantities({});
    setChaiseLongueAddon(0);
    setAddonRows(new Set());
    setAntiAcarosRows(new Set());
    setCarpetItemsByRow({});
  }, [data?.serviceSlug]);

  const getCarpetItems = (i: number): CarpetItem[] => carpetItemsByRow[i] ?? [{ id: `tapete-${i}-1`, largura: '', comprimento: '' }];
  const carpetItemArea = (item: CarpetItem): number => {
    const l = parseFloat((item.largura + '').replace(',', '.'));
    const c = parseFloat((item.comprimento + '').replace(',', '.'));
    return !isNaN(l) && !isNaN(c) && l > 0 && c > 0 ? l * c : 0;
  };
  const setCarpetRow = (i: number, items: CarpetItem[]) => {
    setCarpetItemsByRow(prev => ({ ...prev, [i]: items }));
    const validCount = items.filter(it => carpetItemArea(it) > 0).length;
    setRowQuantities(prev => ({ ...prev, [i]: validCount }));
  };
  const updateCarpetItem = (i: number, id: string, field: 'largura' | 'comprimento', value: string) => {
    setCarpetRow(i, getCarpetItems(i).map(it => (it.id === id ? { ...it, [field]: value } : it)));
  };
  const addCarpetItem = (i: number) => {
    setCarpetRow(i, [...getCarpetItems(i), { id: `tapete-${i}-${Date.now()}`, largura: '', comprimento: '' }]);
  };
  const removeCarpetItem = (i: number, id: string) => {
    setCarpetRow(i, getCarpetItems(i).filter(it => it.id !== id));
  };

  const adjustRowQty = (i: number, delta: number, min = 0, max = 99) => {
    setRowQuantities(prev => {
      const current = prev[i] ?? 0;
      const next = Math.min(max, Math.max(min, current + delta));
      if (next === 0) {
        setAddonRows(a => { if (!a.has(i)) return a; const n = new Set(a); n.delete(i); return n; });
        setAntiAcarosRows(a => { if (!a.has(i)) return a; const n = new Set(a); n.delete(i); return n; });
      }
      return { ...prev, [i]: next };
    });
  };

  const toggleAddonRow = (i: number) => {
    setAddonRows(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleAntiAcarosRow = (i: number) => {
    setAntiAcarosRows(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const handlePriceTableContinue = () => {
    if (!data) return;
    const config = buildWidgetQuizConfig(data.serviceSlug, rowQuantities, chaiseLongueAddon, addonRows, addonTier, antiAcarosRows, carpetItemsByRow);
    if (!config) return;
    setPriceQuizConfig(config);
    openPriceQuiz();
  };

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", data.metaDescription);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${SITE_URL}${location.pathname}`);
    }
  }, [location.pathname, data]);

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

  // 'impermeabilizacao' nao tem entrada em SERVICE_TO_QUIZ (nao e um movel,
  // e um tipo de servico que se aplica a varios) - quizService fica undefined
  // nessas paginas. Bug real encontrado 2026-09-06: o CTA do hero abaixo usava
  // skipToUpsell incondicional, o que saltava reto para o contacto com
  // service='' e nunca deixava o cliente escolher sofa/colchao/cadeiras -
  // formData.service ficava vazio no lead todo (preco, "Servico:" e
  // "Detalhes:" em branco no Formspree, valor total so a deslocacao).
  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];
  const heroImgs = pickServiceHero(data.serviceSlug, data.name);
  const nearbyFreguesias = getNearbyFreguesias(data.municipioSlug, data.nearby);
  const otherServices = services.filter(s => s.slug !== data.serviceSlug);
  const serviceBaseUrl = services.find(s => s.slug === data.serviceSlug)?.baseRoute ?? `/${data.serviceSlug}`;
  const processSteps = data.serviceSlug === 'impermeabilizacao' ? IMPERMEABILIZACAO_STEPS : GENERIC_PROCESS_STEPS;

  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  const waUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.name))}`;

  const serviceCategory = data.service.startsWith("Limpeza de ")
    ? data.service.replace("Limpeza de ", "").toLowerCase()
    : data.service.toLowerCase();

  const snapshotStats = [
    { value: "5.0 ★", label: "Avaliação Google", icon: Star },
    data.serviceSlug === 'limpeza-tapetes'
      ? { value: "Á Medida", label: `Orçamento, em ${data.name}`, icon: Euro }
      : { value: data.priceFrom, label: `Desde, em ${data.name}`, icon: Euro },
    { value: nearbyFreguesias.length > 0 ? `${nearbyFreguesias.length}+` : "100%", label: nearbyFreguesias.length > 0 ? "Zonas próximas" : "Cobertura local", icon: MapPin },
    { value: "30min", label: "Tempo de resposta", icon: Clock },
  ];

  const problemImages = PROBLEM_IMAGES[data.serviceSlug] ?? [];
  const problemCards = data.problems.map((problem, idx) => ({
    title: problem.title,
    description: problem.description,
    alt: problem.description,
    image: problemImages.length > 0 ? problemImages[idx % problemImages.length] : undefined,
    cta: PROBLEM_POOL_CTA[problem.title] ?? "Pedir Orçamento",
  })).filter(card => card.image);
  const problemGridCols = problemCards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <QuizLocationProvider value={data.municipio}>
    <QuizServiceProvider value={quizService}>
      <ServiceLocationSchema
        serviceName={data.service}
        serviceBaseUrl={serviceBaseUrl}
        placeName={data.name}
        parentPlace={data.municipio}
        description={data.metaDescription}
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
                <PageBreadcrumb items={[
                  { label: "Início", to: "/" },
                  { label: data.service, to: serviceBaseUrl },
                  { label: data.municipio, to: `/${data.serviceSlug}-${data.municipioSlug}` },
                  { label: data.name },
                ]} />

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span
                      className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase"
                      style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                    >
                      {data.service} · {data.name}, {data.municipio}
                    </span>
                  </div>
                </div>

                <h1
                  className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
                >
                  {h1Rest}{" "}<span style={{ color: "#D4AF37" }}>{h1Gold}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg line-clamp-2">
                  {/* Mesma lógica do LocationServicePage.tsx — corta na 1ª
                      frase (ponto OU interrogação), robusto mesmo que um
                      template de intro futuro comece por uma pergunta. */}
                  {data.intro.match(/^[^.?]*[.?]/)?.[0] ?? data.intro}
                </p>

                <div className="mb-6">
                  <TrustRatingBadge variant="mapsLinkClients" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <QuizButton
                    className="flex-1"
                    initialLocation={data.municipio}
                    initialService={quizService}
                    initialServiceType={data.serviceSlug === 'impermeabilizacao' ? 'waterproofing' : 'cleaning'}
                    skipToUpsell={!!quizService}
                    buttonClassName="h-[58px] md:h-[52px] !py-0 w-full"
                  />
                  <div className="relative group flex-1">
                    <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(`freguesia_hero_${data.serviceSlug}_${data.municipioSlug}`)}
                      className="relative flex items-center justify-center gap-2 w-full h-[58px] md:h-[52px] px-6 font-bold text-white touch-manipulation bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-150"
                    >
                      <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
                    </a>
                  </div>
                </div>

                <p className="text-white/40 text-xs mt-4">{/^\d/.test(data.priceFrom) ? `Desde ${data.priceFrom} · ` : ''}Orçamento gratuito · Sem compromisso</p>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  <picture>
                    <source media="(max-width: 767px)" srcSet={heroImgs.m} type="image/webp" />
                    <source media="(min-width: 768px)" srcSet={heroImgs.d} type="image/webp" />
                    <img
                      src={heroImgs.d}
                      alt={`${data.service} profissional em ${data.name}`}
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
              <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                <div>
                  <SectionHeader
                    overline="Tabela de Preços"
                    heading={`Quanto custa ${PRICE_HEADING_VERB[data.serviceSlug] ?? data.service.toLowerCase()} em`}
                    goldWord={data.name}
                    subtitle={data.serviceSlug === 'limpeza-tapetes'
                      ? `Orçamento à medida de cada tapete. Deslocação +${locationPrices[data.municipio] ?? 10}€ a ${data.municipio}. Sem surpresas, sem custos escondidos.`
                      : `Preços fixos e transparentes, sem surpresas. Deslocação +${locationPrices[data.municipio] ?? 10}€ a ${data.municipio}. Orçamento gratuito antes de qualquer compromisso.`}
                  />
                  <div className="hidden md:block">
                    <ServiceTrustDesktop serviceSlug={data.serviceSlug} variant={2} seedKey={`${data.municipio}-${data.name}`} />
                  </div>
                </div>
                <div className="overflow-hidden" style={{ boxShadow: "0 12px 50px rgba(7,26,18,0.16), 0 2px 8px rgba(7,26,18,0.08)" }}>
                  {/* ── Header verde ── */}
                  <div className="px-6 py-5" style={{ background: "#071a12" }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#25D366" }} />
                      <p className="text-[9px] font-bold tracking-[0.26em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>Orçamento Gratuito</p>
                    </div>
                    <p className="text-white font-semibold text-sm leading-snug">Escolha as quantidades e continue para o orçamento</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>Sem compromisso · Resposta em menos de 30 min</p>
                  </div>
                  {/* ── Linhas de preço com steppers ── */}
                  <div className="bg-white px-5 pt-1">
                    <div className="divide-y" style={{ borderColor: "rgba(17,17,17,0.06)" }}>
                      {PRICE_TABLE[data.serviceSlug].map((row, i) => {
                        const quizConfig = PRICE_TABLE_QUIZ_CONFIG[data.serviceSlug]?.[i] ?? null;
                        if (!quizConfig) {
                          return (
                            <div key={i} className="flex items-center gap-3 py-3.5">
                              <div className="flex items-center gap-0.5 rounded-full border px-1 py-1 flex-shrink-0" style={{ borderColor: "rgba(7,26,18,0.15)" }}>
                                <button type="button" onClick={() => setChaiseLongueAddon(v => Math.max(0, v - 1))} className="w-9 h-9 flex items-center justify-center rounded-full text-[#111111]/40 hover:bg-[rgba(7,26,18,0.08)] transition-colors" aria-label="Remover"><Minus className="w-4 h-4" /></button>
                                <span className="w-7 text-center font-playfair text-lg font-bold tabular-nums text-[#111111]">{chaiseLongueAddon}</span>
                                <button type="button" onClick={() => setChaiseLongueAddon(v => v + 1)} className="w-9 h-9 flex items-center justify-center rounded-full text-[#111111]/40 hover:bg-[rgba(7,26,18,0.08)] transition-colors" aria-label="Adicionar"><Plus className="w-4 h-4" /></button>
                              </div>
                              <span className="text-[#111111]/70" style={{ fontSize: "14px" }}>{row.item}</span>
                              <span className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: "rgba(17,17,17,0.12)" }} />
                              <span className="font-playfair font-bold text-xl tabular-nums" style={{ color: "#D4AF37" }}>{row.price}</span>
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
                        const dynamicPrice = chairP !== undefined
                          ? (chairP === null ? 'Sob orçamento' : `${chairP}€`)
                          : carpetP !== undefined
                          ? (carpetP === null ? 'Sob orçamento' : `${Math.round(carpetP * 10) / 10}€`)
                          : row.price;

                        if (isCarpet && isAlcatifa) {
                          return (
                            <div key={i} className="py-3.5 space-y-1.5">
                              <div className="flex items-center gap-3">
                                <input
                                  type="number" min={0} max={50}
                                  value={qty || ''} placeholder="0"
                                  onChange={e => {
                                    const v = parseFloat(e.target.value) || 0;
                                    setRowQuantities(prev => ({ ...prev, [i]: Math.max(0, v) }));
                                  }}
                                  className="w-20 text-center font-playfair text-lg font-bold rounded-xl border px-2 py-1.5 outline-none focus:border-gold transition-colors"
                                  style={{ borderColor: qty > 0 ? "rgba(212,175,55,0.5)" : "rgba(7,26,18,0.15)", color: qty > 0 ? "#D4AF37" : "#111111" }}
                                />
                                <span className="text-[#111111]/55 text-sm">m²</span>
                                <span className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: "rgba(17,17,17,0.12)" }} />
                                <span className="font-playfair font-bold text-xl tabular-nums" style={{ color: "#D4AF37" }}>{dynamicPrice}</span>
                              </div>
                              <CarpetTierLegend isAlcatifa={isAlcatifa} qty={qty} />
                            </div>
                          );
                        }

                        if (isCarpet) {
                          const items = getCarpetItems(i);
                          return (
                            <div key={i} className="py-3.5">
                              <div className="flex flex-col gap-2">
                                {items.map((item, idx) => {
                                  const area = carpetItemArea(item);
                                  return (
                                    <div key={item.id} className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "rgba(7,26,18,0.15)" }}>
                                      <span className="text-[10px] font-bold uppercase tracking-wide flex-shrink-0" style={{ color: "rgba(17,17,17,0.35)" }}>Tapete {idx + 1}</span>
                                      <input
                                        type="number" min={0} step={0.1} placeholder="Largura" value={item.largura}
                                        onChange={e => updateCarpetItem(i, item.id, 'largura', e.target.value)}
                                        className="w-24 text-center text-base font-semibold outline-none rounded-lg border px-2 py-2.5"
                                        style={{ borderColor: "rgba(7,26,18,0.18)", color: "#111111" }}
                                      />
                                      <span className="text-sm flex-shrink-0" style={{ color: "rgba(17,17,17,0.3)" }}>×</span>
                                      <input
                                        type="number" min={0} step={0.1} placeholder="Compr." value={item.comprimento}
                                        onChange={e => updateCarpetItem(i, item.id, 'comprimento', e.target.value)}
                                        className="w-24 text-center text-base font-semibold outline-none rounded-lg border px-2 py-2.5"
                                        style={{ borderColor: "rgba(7,26,18,0.18)", color: "#111111" }}
                                      />
                                      <span className="flex-1 text-right text-xs font-bold tabular-nums" style={{ color: area > 0 ? "#D4AF37" : "rgba(17,17,17,0.25)" }}>{area > 0 ? `${Math.round(area * 100) / 100} m²` : ''}</span>
                                      {items.length > 1 && (
                                        <button type="button" onClick={() => removeCarpetItem(i, item.id)} aria-label="Remover tapete" className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ color: "rgba(17,17,17,0.3)" }}>×</button>
                                      )}
                                    </div>
                                  );
                                })}
                                <button
                                  type="button"
                                  onClick={() => addCarpetItem(i)}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed text-xs font-bold"
                                  style={{ borderColor: "rgba(212,175,55,0.4)", color: "#B8912A" }}
                                >
                                  <Plus className="w-3 h-3" /> Adicionar outro tapete
                                </button>
                                <p className="text-[11px] text-center mt-1" style={{ color: "rgba(17,17,17,0.4)" }}>Cada tapete é sempre <span style={{ color: "#D4AF37", fontWeight: 700 }}>sob orçamento</span></p>
                              </div>
                            </div>
                          );
                        }

                        // Nunca mostrar o addon "Impermeabilizar"/"Anti Ácaros" na própria
                        // página de impermeabilização — aí já é o serviço primário.
                        const canAddon = !isWaterproof && (quizConfig.service === 'sofa' || quizConfig.service === 'mattress' || isChair);
                        const isSofaAddon = quizConfig.service === 'sofa';
                        const addonOn = addonRows.has(i);
                        const addonDelta = !canAddon || qty <= 0 ? null
                          : isChair ? calcChairAddonWaterproofTotal(qty, addonTier)
                          : calcRowAddonDelta(quizConfig, addonTier);
                        const canAntiAcaros = !isWaterproof && (isSofaAddon || isChair);
                        const antiAcarosOn = antiAcarosRows.has(i);
                        const antiAcarosDelta = !canAntiAcaros || qty <= 0 ? null
                          : isChair ? calcChairAntiAcarosTotal(qty)
                          : calcSofaAntiAcarosDelta(quizConfig);

                        return (
                          <div key={i} className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-0.5 rounded-full border px-1 py-1 flex-shrink-0" style={{ borderColor: qty > 0 ? "rgba(212,175,55,0.5)" : "rgba(7,26,18,0.15)" }}>
                                <button type="button" onClick={() => adjustRowQty(i, -1)} className="w-9 h-9 flex items-center justify-center rounded-full text-[#111111]/40 hover:bg-[rgba(7,26,18,0.08)] transition-colors" aria-label="Diminuir"><Minus className="w-4 h-4" /></button>
                                <span className="w-7 text-center font-playfair text-lg font-bold tabular-nums" style={{ color: qty > 0 ? "#D4AF37" : "#111111" }}>{qty}</span>
                                <button type="button" onClick={() => adjustRowQty(i, 1)} className="w-9 h-9 flex items-center justify-center rounded-full text-[#111111]/40 hover:bg-[rgba(7,26,18,0.08)] transition-colors" aria-label="Aumentar"><Plus className="w-4 h-4" /></button>
                              </div>
                              <span className="transition-colors" style={{ fontSize: "14px", color: qty > 0 ? "#111111" : "rgba(17,17,17,0.55)" }}>{row.item}</span>
                              <span className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: "rgba(17,17,17,0.12)" }} />
                              <span className="font-playfair font-bold text-xl tabular-nums" style={{ color: "#D4AF37" }}>{dynamicPrice}</span>
                            </div>

                            {canAddon && qty > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleAddonRow(i)}
                                className="flex items-center gap-2 w-full pl-[52px] pt-2 text-left touch-manipulation"
                              >
                                <span
                                  className="w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all"
                                  style={{ borderColor: addonOn ? "#D4AF37" : "rgba(17,17,17,0.25)", background: addonOn ? "#D4AF37" : "transparent" }}
                                >
                                  {addonOn && <Check className="w-3 h-3" style={{ color: "#071a12" }} strokeWidth={3} />}
                                </span>
                                <Shield className="w-3 h-3 flex-shrink-0" style={{ color: addonOn ? "#D4AF37" : "rgba(17,17,17,0.30)" }} />
                                <span className="text-[11px] font-semibold flex-1" style={{ color: addonOn ? "#111111" : "rgba(17,17,17,0.45)" }}>
                                  {isSofaAddon || isChair ? 'Impermeabilizar' : 'Anti Ácaros'}
                                </span>
                                {addonDelta !== null && (
                                  <span className="text-[11px] font-bold tabular-nums" style={{ color: addonOn ? "#D4AF37" : "rgba(17,17,17,0.35)" }}>
                                    +{addonDelta}€{isChair ? '' : '/un.'}
                                  </span>
                                )}
                              </button>
                            )}

                            {canAntiAcaros && qty > 0 && antiAcarosDelta !== null && (
                              <button
                                type="button"
                                onClick={() => toggleAntiAcarosRow(i)}
                                className="flex items-center gap-2 w-full pl-[52px] pt-2 text-left touch-manipulation"
                              >
                                <span
                                  className="w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all"
                                  style={{ borderColor: antiAcarosOn ? "#D4AF37" : "rgba(17,17,17,0.25)", background: antiAcarosOn ? "#D4AF37" : "transparent" }}
                                >
                                  {antiAcarosOn && <Check className="w-3 h-3" style={{ color: "#071a12" }} strokeWidth={3} />}
                                </span>
                                <Bug className="w-3 h-3 flex-shrink-0" style={{ color: antiAcarosOn ? "#D4AF37" : "rgba(17,17,17,0.30)" }} />
                                <span className="text-[11px] font-semibold flex-1" style={{ color: antiAcarosOn ? "#111111" : "rgba(17,17,17,0.45)" }}>
                                  Anti Ácaros
                                </span>
                                <span className="text-[11px] font-bold tabular-nums" style={{ color: antiAcarosOn ? "#D4AF37" : "rgba(17,17,17,0.35)" }}>
                                  +{antiAcarosDelta}€{isChair ? '' : '/un.'}
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {(() => {
                      const firstTierAddonRow = Array.from(addonRows).find(i => {
                        const svc = PRICE_TABLE_QUIZ_CONFIG[data.serviceSlug]?.[i]?.service;
                        return svc === 'sofa' || svc === 'chairs';
                      });
                      if (firstTierAddonRow === undefined) return null;
                      const cfg = PRICE_TABLE_QUIZ_CONFIG[data.serviceSlug]![firstTierAddonRow]!;
                      const qtyForRow = rowQuantities[firstTierAddonRow] ?? 0;
                      const essDelta = cfg.service === 'chairs' ? calcChairAddonWaterproofTotal(qtyForRow, 'essencial') : calcRowAddonDelta(cfg, 'essencial');
                      const premDelta = cfg.service === 'chairs' ? calcChairAddonWaterproofTotal(qtyForRow, 'premium') : calcRowAddonDelta(cfg, 'premium');
                      const extraDelta = essDelta !== null && premDelta !== null ? Math.round((premDelta - essDelta) * 100) / 100 : null;
                      return (
                      <div className="mt-1 mb-1 p-3 rounded-xl" style={{ background: "rgba(212,175,55,0.06)" }}>
                        <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-2" style={{ color: "rgba(17,17,17,0.40)" }}>
                          Nível de impermeabilização
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAddonTier('premium')}
                            className="relative text-left px-3 py-2 rounded-lg border-2 transition-all"
                            style={{
                              borderColor: addonTier === 'premium' ? "#D4AF37" : "rgba(212,175,55,0.35)",
                              background: addonTier === 'premium' ? "white" : "rgba(255,255,255,0.5)",
                            }}
                          >
                            <span
                              className="absolute -top-2 -right-2 z-10 flex w-9 h-9 flex-col items-center justify-center"
                              style={{ background: "#D4AF37", border: "2px solid #111111" }}
                            >
                              <Star className="w-3 h-3" style={{ color: "#111111", fill: "#111111" }} />
                              <span className="text-[6px] font-black uppercase leading-none tracking-tight" style={{ color: "#111111" }}>Top</span>
                            </span>
                            <div className="flex items-center gap-1 mb-0.5">
                              {addonTier === 'premium' && <Check className="w-3 h-3" style={{ color: "#D4AF37" }} strokeWidth={3} />}
                              <p className="text-xs font-bold" style={{ color: "#111111" }}>Premium</p>
                              {extraDelta !== null && cfg.service !== 'chairs' && (
                                <span className="text-[9px] font-black leading-none px-1.5 py-[3px] rounded-full whitespace-nowrap" style={{ background: addonTier === 'premium' ? "#D4AF37" : "rgba(212,175,55,0.15)", color: addonTier === 'premium' ? "white" : "#B8912A" }}>
                                  por apenas +{extraDelta}€
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] leading-snug font-semibold" style={{ color: "#B8912A" }}>até 10 anos · até 5 lavagens</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddonTier('essencial')}
                            className="text-left px-3 py-2 rounded-lg border-2 transition-all"
                            style={{
                              borderColor: addonTier === 'essencial' ? "#D4AF37" : "rgba(17,17,17,0.12)",
                              background: addonTier === 'essencial' ? "white" : "rgba(255,255,255,0.5)",
                            }}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              {addonTier === 'essencial' && <Check className="w-3 h-3" style={{ color: "#D4AF37" }} strokeWidth={3} />}
                              <p className="text-xs font-bold" style={{ color: "#111111" }}>Essencial</p>
                            </div>
                            <p className="text-[10px] leading-snug" style={{ color: "rgba(17,17,17,0.40)" }}>1-2 anos de proteção</p>
                          </button>
                        </div>
                      </div>
                      );
                    })()}

                    <div className="pt-3 pb-5 border-t space-y-3" style={{ borderColor: "rgba(17,17,17,0.07)" }}>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(17,17,17,0.25)" }} />
                        <span className="text-xs" style={{ color: "rgba(17,17,17,0.45)" }}>
                          +{locationPrices[data.municipio] ?? 10}€ deslocação a {data.municipio}
                        </span>
                      </div>
                      {(() => {
                        const total = calcWidgetTotal(data.serviceSlug, rowQuantities, chaiseLongueAddon, addonRows, addonTier, antiAcarosRows);
                        const fee = locationPrices[data.municipio] ?? 10;
                        const articles = calcWidgetArticles(data.serviceSlug, rowQuantities, addonRows, addonTier, antiAcarosRows);
                        const pricing = calcWidgetPricing(total, fee, articles);
                        return (
                          <div className="space-y-2">
                            {pricing.discountActive ? (
                              <div
                                className="flex items-center gap-3 rounded-xl px-4 py-3"
                                style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.02))", border: "1px solid rgba(212,175,55,0.35)" }}
                              >
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: "linear-gradient(135deg, #C9A84C, #F0DC8A)", boxShadow: "0 2px 10px rgba(212,175,55,0.45)" }}
                                >
                                  <Check className="w-4 h-4" style={{ color: "#071a12" }} strokeWidth={3.5} />
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-bold leading-none" style={{ color: "#111111" }}>10% de desconto ativo</p>
                                  <p className="text-[10px] mt-1 leading-none" style={{ color: "rgba(17,17,17,0.40)" }}>Aplica-se a todo o pedido</p>
                                </div>
                                <span className="text-[11px] font-black px-2 py-1 rounded-full flex-shrink-0" style={{ background: "#D4AF37", color: "white" }}>-10%</span>
                              </div>
                            ) : (
                              <p className="text-xs leading-snug" style={{ color: "rgba(17,17,17,0.40)" }}>
                                Peça um colchão, um sofá ou algumas cadeiras a mais (desde <span className="font-semibold" style={{ color: "#111111" }}>{PACK_DISCOUNT_MIN_UPSELL_ITEM}€</span>) num pedido de <span className="font-semibold" style={{ color: "#111111" }}>{PACK_DISCOUNT_MIN_SERVICE}€+</span> e ganhe <span className="font-semibold" style={{ color: "#D4AF37" }}>10% de desconto em tudo</span>.
                              </p>
                            )}
                            {total > 0 && (
                              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: pricing.discountActive ? "rgba(212,175,55,0.09)" : "rgba(17,17,17,0.03)" }}>
                                <span className="text-sm font-medium" style={{ color: "#111111" }}>{pricing.discountActive ? "Total com desconto" : "Total estimado"}</span>
                                <div className="flex items-baseline gap-2">
                                  {pricing.discountActive && <span className="text-xs line-through" style={{ color: "rgba(17,17,17,0.35)" }}>{pricing.grandTotal}€</span>}
                                  <span className="font-playfair font-bold text-xl" style={{ color: "#D4AF37" }}>{pricing.discountActive ? pricing.discountedTotal : pricing.grandTotal}€</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <button type="button" onClick={handlePriceTableContinue} className="w-full py-3.5 font-semibold text-[13px] tracking-[0.16em] uppercase transition-all active:scale-[0.98]" style={{ background: "linear-gradient(135deg, #C9A84C 0%, #EDD96A 50%, #C9A84C 100%)", color: "#071a12", boxShadow: "0 4px 20px rgba(212,175,55,0.35)" }}>
                        Continuar para o orçamento →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:hidden">
                <ServiceTrustMobile serviceSlug={data.serviceSlug} variant={2} seedKey={`${data.municipio}-${data.name}`} />
              </div>
            </div>
          </section>
        )}

        {priceQuizConfig && (
          <QuizFormLazy
            isOpen={isPriceQuizOpen}
            onClose={closePriceQuiz}
            initialLocation={data.municipio}
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
            initialCarpetItems={priceQuizConfig.carpetItems}
            initialUpsellItems={priceQuizConfig.initialUpsellItems}
            initialWaterproofingTier={priceQuizConfig.waterproofingTier}
            initialChairWaterproofing={priceQuizConfig.chairWaterproofing}
            skipToUpsell
          />
        )}

        <QuizFormLazy
          isOpen={isProblemQuizOpen}
          onClose={closeProblemQuiz}
          initialLocation={data.municipio}
          initialService={quizService}
        />

        {/* ═══ PROBLEMAS QUE RESOLVEMOS ═══ */}
        {problemCards.length > 0 && (
          <section className="py-14 md:py-20 bg-kyro-green">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader
                overline="O Que Resolvemos"
                heading={`Problemas de ${serviceCategory} que resolvemos em`}
                goldWord={data.name}
                light={false}
              />
              <div className={`flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 md:overflow-visible md:grid md:grid-cols-2 ${problemGridCols} md:gap-4 md:pb-0`}>
                {problemCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="snap-start flex-none w-[78vw] sm:w-[54vw] md:w-auto relative overflow-hidden rounded-2xl group h-[400px] md:h-[440px]"
                  >
                    <img
                      src={card.image as string}
                      alt={card.alt}
                      className="absolute inset-0 w-full h-full object-cover saturate-[0.55] group-hover:saturate-[0.85] group-hover:scale-[1.05] transition-all duration-700 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-0 left-0 right-0 z-10 p-5 md:p-6 pb-12 bg-gradient-to-b from-[#071a12]/90 via-[#071a12]/35 to-transparent">
                      <div className="mb-2 rounded-full opacity-45 group-hover:opacity-90 transition-all duration-400" style={{ width: "20px", height: "1.5px", backgroundColor: "#D4AF37" }} />
                      <h3 className="font-playfair font-bold text-white text-[1.05rem] md:text-[1.15rem] leading-[1.25]">{card.title}</h3>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-6 pt-14 bg-gradient-to-t from-[#071a12] via-[#071a12]/75 to-transparent">
                      <p className="text-white/65 text-xs leading-relaxed line-clamp-2 mb-4">{card.description}</p>
                      <button
                        type="button"
                        onClick={openProblemQuiz}
                        className="inline-flex items-center justify-center gap-1.5 min-w-[150px] rounded-full px-4 py-2.5 text-xs font-bold text-[#111111] transition-transform duration-300 group-hover:scale-[1.03]"
                        style={{ background: "linear-gradient(to right, #C9A84C, #EDD96A, #C9A84C)", boxShadow: "0 3px 10px rgba(201,168,76,0.35)" }}
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
              heading="Como funciona em"
              goldWord={data.name}
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
                        <div key={num} className="relative overflow-hidden flex items-start gap-4 p-5 md:p-6 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
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
          <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.service.toLowerCase()} em ${data.name}`} variant="dark" />
        )}

        {/* ═══ TESTEMUNHOS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" light={true} />
            <ServiceReviewsGrid serviceSlug={data.serviceSlug} seed={`${data.municipio}-${data.name}`} heading="" />
          </div>
        </section>

        {/* ═══ PACKS ═══ */}
        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.serviceSlug] ?? ["pack-sala-completa"]}
          city={data.municipioSlug}
          variant="dark"
        />

        {/* ═══ COBERTURA / REDE INTERNA ═══ */}
        <section className="py-14 md:py-20" style={{ backgroundColor: "#FDFDF9" }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Cobertura"
              heading={`Área de serviço em`}
              goldWord={data.name}
              subtitle={data.localSection}
            />

            <div className="grid md:grid-cols-2 gap-4">
              {nearbyFreguesias.length > 0 && (
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Freguesias próximas</p>
                  <div className="flex flex-wrap gap-2">
                    {nearbyFreguesias.map(f => (
                      <Link
                        key={f.slug}
                        to={`/${data.serviceSlug}-${data.municipioSlug}-${f.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                      >
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {f.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Outros serviços em {data.name}</p>
                <div className="flex flex-wrap gap-2">
                  {otherServices.map(svc => (
                    <Link
                      key={svc.slug}
                      to={`/${svc.slug}-${data.municipioSlug}-${data.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                    >
                      {svc.name}
                    </Link>
                  ))}
                </div>
              </div>

              {municipioProblems.length > 0 && (
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Problemas que resolvemos em {data.municipio}</p>
                  <div className="flex flex-wrap gap-2">
                    {municipioProblems.map(p => (
                      <Link
                        key={p.slug}
                        to={`/${p.slug}-${data.municipioSlug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                      >
                        {p.keyword}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Link
                  to={`/${data.serviceSlug}-${data.municipioSlug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-colors"
                  style={{ color: "#D4AF37" }}
                >
                  <ArrowRight className="w-4 h-4" />
                  Ver todos os serviços em {data.municipio}
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default FreguesiaServicePage;

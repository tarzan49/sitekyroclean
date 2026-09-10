import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { MapPin, Star, MessageCircle, ArrowRight, Euro, Clock, Timer } from "lucide-react";
import { GoogleG } from "@/components/icons/GoogleG";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import PriceWidget from "@/components/PriceWidget";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
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
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { calcWidgetTotal, calcChairBracket, buildWidgetQuizConfig, calcRowAddonDelta, calcSofaAntiAcarosDelta, calcChairAddonWaterproofTotal, calcChairAntiAcarosTotal, calcWidgetPricing, calcWidgetArticles, PACK_DISCOUNT_MIN_SERVICE, PACK_DISCOUNT_MIN_UPSELL_ITEM, type WidgetTier } from "@/lib/priceWidgetCalc";
import { locationPrices, type CarpetItem } from "@/components/quiz/QuizTypes";
import { PROBLEM_IMAGES, PROBLEM_POOL_CTA, PRICE_HEADING_VERB, SERVICE_DURATION } from "@/constants/problemCardHelpers";
import { ServiceTrustDesktop, ServiceTrustMobile } from "@/components/ServiceTrustBlock";
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

  const { isQuizOpen: isProblemQuizOpen, openQuiz: openProblemQuiz, closeQuiz: closeProblemQuiz } = useQuizLauncher();

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
  const beforeAfterCategory = categoryForServiceSlug(data.serviceSlug);
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

  const serviceDuration = SERVICE_DURATION[data.serviceSlug] ?? { value: "3 a 6h", label: "Pronto a usar" };
  // Conteúdo revisto 2026-09-09 (pedido explícito): 1º bloco passou a mostrar
  // a nota real do Google (antes tinha "5.0 ★" fixo, agora usa REVIEW_RATING/
  // REVIEW_COUNT, a fonte única) em vez de duplicar os pills que já apareciam
  // no hero — esses pills (TrustRatingBadge "mapsLinkClients") ficaram
  // escondidos em mobile/tablet por serem redundantes com isto. "Zonas
  // próximas" saiu (ainda existe mais abaixo na página) e deu lugar a algo
  // mais útil para quem decide: quanto tempo demora o serviço. O último
  // bloco ("<10min") é uma exceção isolada e deliberada: em todo o resto do
  // site o compromisso continua a ser 30min, não alterar noutro sítio sem
  // pedido explícito.
  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    (data.serviceSlug === 'limpeza-tapetes' || data.serviceSlug === 'limpeza-alcatifas')
      ? { value: "Á Medida", label: `Orçamento, em ${data.name}`, icon: Euro }
      : { value: data.priceFrom, label: `Desde, em ${data.name}`, icon: Euro },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
    { value: "<10min", label: "Respondemos em menos de 10 minutos", icon: Clock },
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

        <section className="relative pt-16 md:pt-24 lg:pt-28 pb-16 md:pb-24">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <PageBreadcrumb items={[
                  { label: "Início", to: "/" },
                  { label: data.service, to: serviceBaseUrl },
                  { label: data.municipio, to: `/${data.serviceSlug}-${data.municipioSlug}` },
                  { label: data.name },
                ]} />

                <div className="inline-flex items-start mb-3 lg:mb-5">
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
                  className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 lg:mb-4 leading-[1.12]"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
                >
                  {h1Rest}{" "}<span style={{ color: "#D4AF37" }}>{h1Gold}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-4 lg:mb-6 max-w-lg line-clamp-2">
                  {/* Mesma lógica do LocationServicePage.tsx — corta na 1ª
                      frase (ponto OU interrogação), robusto mesmo que um
                      template de intro futuro comece por uma pergunta. */}
                  {data.intro.match(/^[^.?]*[.?]/)?.[0] ?? data.intro}
                </p>

                <div className="lg:mb-6">
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

              <div className="mt-8 lg:mt-0">
                <div className="relative">
                  <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  {beforeAfterCategory ? (
                    <div className="relative shadow-2xl" style={{ borderTop: "2px solid #D4AF37" }}>
                      <HeroBeforeAfterPool category={beforeAfterCategory} className="w-full" />
                    </div>
                  ) : (
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
                  )}
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
                      : data.serviceSlug === 'limpeza-alcatifas'
                      ? `Orçamento à medida de cada espaço. Deslocação +${locationPrices[data.municipio] ?? 10}€ a ${data.municipio}. Sem preço fixo por m², sem surpresas.`
                      : `Estimativa confirmada antes da marcação. Deslocação +${locationPrices[data.municipio] ?? 10}€ a ${data.municipio}. Orçamento gratuito antes de qualquer compromisso.`}
                  />
                  <div className="hidden md:block">
                    <ServiceTrustDesktop serviceSlug={data.serviceSlug} variant={2} seedKey={`${data.municipio}-${data.name}`} />
                  </div>
                </div>
                <PriceWidget serviceSlug={data.serviceSlug} initialLocation={data.municipio} />
              </div>
              <div className="lg:hidden">
                <ServiceTrustMobile serviceSlug={data.serviceSlug} variant={2} seedKey={`${data.municipio}-${data.name}`} />
              </div>
            </div>
          </section>
        )}

        <QuizFormLazy
          isOpen={isProblemQuizOpen}
          onClose={closeProblemQuiz}
          initialLocation={data.municipio}
          initialService={quizService}
        />

        {/* ═══ TESTEMUNHOS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" light={false} />
            <ServiceReviewsGrid serviceSlug={data.serviceSlug} seed={`${data.municipio}-${data.name}`} heading="" />
          </div>
        </section>

        {/* ═══ PROBLEMAS QUE RESOLVEMOS ═══ */}
        {problemCards.length > 0 && (
          <section className="py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader
                overline="O Que Resolvemos"
                heading={`Problemas de ${serviceCategory} que resolvemos em`}
                goldWord={data.name}
                light={true}
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
              <p className="text-center text-[9px] text-[#111111]/20 tracking-[0.22em] uppercase mt-4 md:hidden">
                deslize para ver mais →
              </p>
            </div>
          </section>
        )}

        {/* ═══ FAQ ═══ */}
        {data.faqs && data.faqs.length > 0 && (
          <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.service.toLowerCase()} em ${data.name}`} variant="dark" />
        )}

        {/* ═══ COMO FUNCIONA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Processo"
              heading={data.serviceSlug === 'impermeabilizacao' ? 'Os passos da nossa impermeabilização em' : 'Os passos da nossa limpeza profunda em'}
              goldWord={data.name}
              subtitle={data.howItWorks}
              light={true}
            />
            {/* Timeline vertical em mobile, horizontal a partir de md — substitui
                a antiga grelha plana de 2 colunas (pedido do dono: "pouco
                interessante o visual dos passos", 2026-09-06). */}
            <div className="flex flex-col md:hidden mt-2">
              {processSteps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-playfair font-bold text-base flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #C9A84C, #EDD96A, #C9A84C)", color: "#111111", boxShadow: "0 4px 14px rgba(212,175,55,0.35)" }}
                    >
                      {idx + 1}
                    </div>
                    {idx < processSteps.length - 1 && (
                      <div className="flex-1 w-px my-1" style={{ background: "linear-gradient(to bottom, rgba(212,175,55,0.5), rgba(212,175,55,0.15))" }} />
                    )}
                  </div>
                  <div className={idx < processSteps.length - 1 ? "pb-7 pt-2.5" : "pt-2.5"}>
                    <p className="text-sm font-bold text-[#111111] mb-1">{step.label}</p>
                    <p className="text-xs text-[#111111]/55 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block relative mt-4">
              <div
                className="absolute h-px"
                style={{ left: "10%", right: "10%", top: "22px", background: "linear-gradient(to right, rgba(212,175,55,0.15), rgba(212,175,55,0.6), rgba(212,175,55,0.6), rgba(212,175,55,0.15))" }}
              />
              <div className="grid relative" style={{ gridTemplateColumns: `repeat(${processSteps.length}, 1fr)` }}>
                {processSteps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center px-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-playfair font-bold text-base mb-4 relative z-10"
                      style={{ background: "linear-gradient(135deg, #C9A84C, #EDD96A, #C9A84C)", color: "#111111", boxShadow: "0 4px 14px rgba(212,175,55,0.35)" }}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-sm font-bold text-[#111111] mb-1.5">{step.label}</p>
                    <p className="text-xs text-[#111111]/55 leading-relaxed max-w-[170px]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
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

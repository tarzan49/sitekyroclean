import ServiceProcessGuide from '@/components/ServiceProcessGuide';
import { type ProcessServiceSlug } from '@/data/serviceProcessGuides';
import SofaProcessGuide from '@/components/SofaProcessGuide';
import ProblemCarousel from '@/components/ProblemCarousel';
import DirectoryGroup from "@/components/DirectoryGroup";
import SofaLeadActions from "@/components/SofaLeadActions";
import { lazy, Suspense, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { MapPin, Star, ArrowRight, Euro, Clock, Timer } from "lucide-react";
import { GoogleG } from "@/components/icons/GoogleG";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import PriceWidget from "@/components/PriceWidget";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
import Footer from "@/components/Footer";
import QuizFormLazy from "@/components/QuizFormLazy";
import SectionHeader from "@/components/SectionHeader";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServicePackBanner from "@/components/ServicePackBanner";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
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
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITIES } from "@/constants/metroCities";
import { pickServiceHero } from "@/constants/serviceContent";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG, type PriceRowQuizConfig } from "@/data/locationPriceTestimonialsData";
import { calcWidgetTotal, calcChairBracket, buildWidgetQuizConfig, calcRowAddonDelta, calcSofaAntiAcarosDelta, calcChairAddonWaterproofTotal, calcChairAntiAcarosTotal, type WidgetTier } from "@/lib/priceWidgetCalc";
import { locationPrices, type CarpetItem } from "@/components/quiz/QuizTypes";
import { PROBLEM_IMAGES, PRICE_HEADING_VERB, SERVICE_DURATION } from "@/constants/problemCardHelpers";
import { ServiceTrustDesktop, ServiceTrustMobile } from "@/components/ServiceTrustBlock";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";

const FontComparisonPanel = import.meta.env.DEV
  ? lazy(() => import("@/components/FontComparisonPanel"))
  : null;

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
  const isSofaCleaning = data.serviceSlug === "limpeza-sofas";
  const isFontComparison = import.meta.env.DEV
    && data.serviceSlug === "limpeza-colchoes"
    && data.municipioSlug === "porto"
    && data.slug === "paranhos"
    && new URLSearchParams(location.search).get("teste") === "fontes";

  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  const waUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.name))}`;

  const serviceCategory = data.service.startsWith("Limpeza de ")
    ? data.service.replace("Limpeza de ", "").toLowerCase()
    : data.service.toLowerCase();

  const serviceDuration = SERVICE_DURATION[data.serviceSlug] ?? { value: "3 a 6h", label: "Pronto a usar" };
  // Resposta em menos de 10 minutos: compromisso comum a todo o site.

  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    (data.serviceSlug === 'limpeza-tapetes' || data.serviceSlug === 'limpeza-alcatifas')
      ? { value: "Á Medida", label: `Orçamento, em ${data.name}`, icon: Euro }
      : { value: data.priceFrom, label: `Desde, em ${data.name}`, icon: Euro },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
    { value: "<10min", label: "Respondemos em menos de 10 minutos", icon: Clock },
  ];

  const problemImages = PROBLEM_IMAGES[data.serviceSlug] ?? [];
  const sofaProblemDescriptions: Record<string, string> = {
    'Manchas difíceis no sofá': 'Café, vinho ou gordura? Avaliamos o tecido e a mancha para escolher o tratamento adequado.',
    'Ácaros e bactérias invisíveis': 'A sujidade também se acumula no interior das fibras. Conheça as opções de higienização para o seu sofá.',
    'Odores desagradáveis': 'Animais, humidade ou uso diário? Identificamos a origem do odor para recomendar o tratamento.',
    'Desgaste prematuro do tecido': 'Proteja o tecido do uso diário. Descubra se a impermeabilização é adequada ao seu sofá.',
  };
  const problemCards = data.problems.map((problem, idx) => ({
    title: problem.title,
    description: isSofaCleaning ? (sofaProblemDescriptions[problem.title] ?? problem.description) : problem.description,
    alt: problem.description,
    image: problemImages.length > 0 ? problemImages[idx % problemImages.length] : undefined,
  })).filter(card => card.image);

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
      {isFontComparison && FontComparisonPanel && (
        <Suspense fallback={null}><FontComparisonPanel /></Suspense>
      )}
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

        <section className="relative pt-6 md:pt-16 lg:pt-20 pb-8 md:pb-16">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-4 lg:gap-12 items-center">
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

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-4 lg:mb-6 max-w-lg">
                  {/* Mesma lógica do LocationServicePage.tsx — corta na 1ª
                      frase (ponto OU interrogação), robusto mesmo que um
                      template de intro futuro comece por uma pergunta. */}
                  {isSofaCleaning ? "Limpeza ao domicílio por extração profunda. Consulte os preços por tamanho e envie uma foto para avaliarmos as manchas." : (data.intro.match(/^[^.?]*[.?]/)?.[0] ?? data.intro)}
                </p>


                <SofaLeadActions city={data.name} price={data.priceFrom} href={waUrl} source={`freguesia_hero_${data.serviceSlug}_${data.municipioSlug}`} />
              </div>

              <div id="resultados" className="mt-2 lg:mt-0 scroll-mt-6">
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
          <section id="precos" className="scroll-mt-6 py-14 md:py-20 bg-[#FDFDF9]">
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
        <section id="avaliacoes" className="scroll-mt-6 py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug={data.serviceSlug} seed={`${data.municipio}-${data.name}`} heading="" />
          </div>
        </section>

        {/* ═══ PROBLEMAS COMUNS ═══ */}
        {problemCards.length > 0 && (
          <section id="problemas" className="scroll-mt-6 py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader
                overline="O Que Resolvemos"
                heading={`Problemas de ${serviceCategory} que resolvemos em`}
                goldWord={data.name}
                light={true}
              />
              <p className="-mt-5 mb-7 max-w-xl text-sm sm:text-base leading-relaxed text-[#536259]">
                Reconhece algum destes sinais? Peça uma avaliação e descubra o tratamento adequado ao seu caso.
              </p>
              <ProblemCarousel>
                {problemCards.map((card, idx) => (
                  <article key={card.title} className="snap-start flex-none w-[84vw] max-w-[380px] md:max-w-none md:w-auto overflow-hidden rounded-sm border border-[#183b2c]/15 bg-[#0c241a] group flex flex-col shadow-[0_8px_24px_rgba(7,26,18,0.10)]">
                    <div className="relative h-[185px] sm:h-[220px] overflow-hidden">
                      <img src={card.image as string} alt={card.title} className="w-full h-full object-cover saturate-[0.85] motion-safe:group-hover:scale-[1.03] transition-transform duration-700" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c241a]/35 to-transparent" />
                      <span className="absolute top-4 left-4 px-2.5 py-1.5 bg-[#071a12]/85 border border-white/20 text-[#e1c477] text-[10px] font-semibold tracking-[0.16em]">{String(idx + 1).padStart(2, '0')} / {String(problemCards.length).padStart(2, '0')}</span>
                    </div>
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <div className="w-7 h-px bg-gold mb-4" />
                      <h3 className="font-playfair font-semibold text-white text-[23px] leading-tight mb-3">{card.title}</h3>
                      <p className="text-white/75 text-sm leading-relaxed mb-6">{card.description}</p>
                      <div className="mt-auto">
                        <button type="button" onClick={openProblemQuiz} aria-label={`Pedir avaliação: ${card.title}`} className="w-full min-h-12 flex items-center justify-between gap-3 rounded-sm px-4 py-3 text-sm font-bold text-[#071a12] bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold active:scale-[0.98] transition-all touch-manipulation">
                          Pedir avaliação <ArrowRight className="w-5 h-5 shrink-0" />
                        </button>
                        <p className="text-white/60 text-[11px] text-center mt-2.5">Orçamento gratuito · Sem compromisso</p>
                      </div>
                    </div>
                  </article>
                ))}
              </ProblemCarousel>
            </div>
          </section>
        )}

        {/* ═══ FAQ ═══ */}
        {data.faqs && data.faqs.length > 0 && (
          <div id="duvidas" className="scroll-mt-6"><ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.service.toLowerCase()} em ${data.name}`} variant="dark" /></div>
        )}

        {/* ═══ COMO FUNCIONA ═══ */}
        {isSofaCleaning ? <SofaProcessGuide city={data.name} cityPrep="em" /> : <ServiceProcessGuide key={data.serviceSlug} serviceSlug={data.serviceSlug as ProcessServiceSlug} city={data.name} cityPrep={"em"} />}

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
              overline="Explore por categoria"
              heading="Serviços e zonas de atendimento em"
              goldWord={data.name}
              subtitle="Encontre freguesias próximas, outros serviços e soluções para problemas de estofos. Abra uma categoria para ver mais."
            />

            <div className="max-w-4xl border-t border-[#D4AF37]/25">
              {nearbyFreguesias.length > 0 && (
                <DirectoryGroup title={<>Freguesias próximas</>}>
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
                  </DirectoryGroup>
              )}

              <DirectoryGroup title={<>Outros serviços em {data.name}</>}>
                  {otherServices.map(svc => (
                    <Link
                      key={svc.slug}
                      to={`/${svc.slug}-${data.municipioSlug}-${data.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                    >
                      {svc.name}
                    </Link>
                  ))}
                </DirectoryGroup>

              {municipioProblems.length > 0 && (
                <DirectoryGroup title={<>Problemas que resolvemos em {data.municipio}</>}>
                    {municipioProblems.map(p => (
                      <Link
                        key={p.slug}
                        to={`/${p.slug}-${data.municipioSlug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                      >
                        {p.keyword}
                      </Link>
                    ))}
                  </DirectoryGroup>
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

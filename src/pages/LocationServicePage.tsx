import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { MapPin, Star, MessageCircle, ArrowRight, Euro, Clock } from "lucide-react";
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
import PageBreadcrumb from "@/components/PageBreadcrumb";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
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
import { PRICE_TABLE } from "@/data/locationPriceTestimonialsData";
import { locationPrices } from "@/components/quiz/QuizTypes";
import { MARCA_CITY_SLUGS } from "@/data/marcaCities";
import { PROBLEM_IMAGES, PROBLEM_CTA, PRICE_HEADING_VERB } from "@/constants/problemCardHelpers";
import { ServiceTrustDesktop, ServiceTrustMobile } from "@/components/ServiceTrustBlock";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";
import PriceWidget from "@/components/PriceWidget";


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
  const { isQuizOpen: isProblemQuizOpen, openQuiz: openProblemQuiz, closeQuiz: closeProblemQuiz } = useQuizLauncher();

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

  // 'impermeabilizacao' nao tem entrada em SERVICE_TO_QUIZ (nao e um movel,
  // e um tipo de servico que se aplica a varios) - quizService fica undefined
  // nessas paginas. Bug real encontrado 2026-09-06: o CTA do hero abaixo usava
  // skipToUpsell incondicional, o que saltava reto para o contacto com
  // service='' e nunca deixava o cliente escolher sofa/colchao/cadeiras -
  // formData.service ficava vazio no lead todo (preco, "Servico:" e
  // "Detalhes:" em branco no Formspree, valor total so a deslocacao).
  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];

  const heroImgs = pickServiceHero(data.serviceSlug, data.city);
  const beforeAfterCategory = categoryForServiceSlug(data.serviceSlug);
  const otherServices = data.relatedServices
    .map(slug => {
      const svc = services.find(s => s.slug === slug);
      return svc ? { ...svc, locationPath: `/${slug}-${data.citySlug}` } : null;
    })
    .filter(Boolean) as (typeof services[number] & { locationPath: string })[];

  const cityFreguesias = municipiosComFreguesias.find(m => m.slug === data.citySlug);

  const materialLinks = getMaterialsByService(data.serviceSlug);

  const MARCA_SLUGS = ['ikea', 'natuzzi', 'kave-home', 'leroy-merlin', 'moviflor', 'conforama', 'el-corte-ingles', 'roche-bobois'];
  const MARCA_COLCHAO_SLUGS = ['ikea', 'conforama', 'molaflex', 'pikolin', 'colmol', 'mindol'];
  const MARCA_CADEIRAS_SLUGS = ['ikea', 'conforama', 'leroy-merlin', 'herman-miller', 'moviflor', 'el-corte-ingles'];
  // Páginas de marca (sofá, colchão, cadeiras) cobrem as mesmas 34 cidades mais povoadas do site
  const hasMarcaCity = (MARCA_CITY_SLUGS as readonly string[]).includes(data.citySlug);
  const hasMarcaSofaCity = hasMarcaCity;
  const hasMarcaColchaoCity = hasMarcaCity;
  const hasMarcaCadeirasCity = hasMarcaCity;

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
    data.serviceSlug === 'limpeza-tapetes'
      ? { value: "Á Medida", label: `Orçamento, ${cityPrep} ${data.city}`, icon: Euro }
      : { value: data.priceFrom, label: `Desde, ${cityPrep} ${data.city}`, icon: Euro },
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
                <PageBreadcrumb items={[
                  { label: "Início", to: "/" },
                  { label: data.service, to: serviceBaseUrl },
                  { label: data.city },
                ]} />

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

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg line-clamp-2">
                  {/* Corta na 1ª frase (ponto OU interrogação) — os templates
                      de intro começam sempre por uma pergunta ("Precisa de
                      limpeza de sofás em X?"), .split('.') sozinho ignorava
                      o "?" e arrastava o parágrafo inteiro para o hero,
                      empurrando a barra de estatísticas para fora do ecrã. */}
                  {data.intro.match(/^[^.?]*[.?]/)?.[0] ?? data.intro}
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
                    skipToUpsell={!!quizService}
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
                        alt={`${data.service} profissional ${cityPrep} ${data.city}`}
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
                    heading={`Quanto custa ${PRICE_HEADING_VERB[data.serviceSlug] ?? data.service.toLowerCase()} ${cityPrep}`}
                    goldWord={data.city}
                    subtitle={data.serviceSlug === 'limpeza-tapetes'
                      ? `Orçamento à medida de cada tapete. Deslocação +${locationPrices[data.city] ?? 10}€ a ${data.city}. Sem surpresas, sem custos escondidos.`
                      : `Preços fixos e transparentes, sem surpresas. Deslocação +${locationPrices[data.city] ?? 10}€ a ${data.city}. Orçamento gratuito antes de qualquer compromisso.`}
                  />
                  {/* Trust facts — desktop only (variante 1) */}
                  <div className="hidden md:block">
                    <ServiceTrustDesktop serviceSlug={data.serviceSlug} variant={1} seedKey={data.city} />
                  </div>
                </div>
                <PriceWidget serviceSlug={data.serviceSlug} initialLocation={data.city} />
              </div>
              {/* Trust mobile colapsável — abaixo do widget */}
              <div className="lg:hidden">
                <ServiceTrustMobile serviceSlug={data.serviceSlug} variant={1} seedKey={data.city} />
              </div>
            </div>
          </section>
        )}

        <QuizFormLazy
          isOpen={isProblemQuizOpen}
          onClose={closeProblemQuiz}
          initialLocation={data.city}
          initialService={quizService}
        />

        {/* ═══ TESTEMUNHOS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" light={false} />
            <ServiceReviewsGrid serviceSlug={data.serviceSlug} seed={data.city} heading="" />
          </div>
        </section>

        {/* ═══ PROBLEMAS COMUNS ═══ */}
        {problemCards.length > 0 && (
          <section className="py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader
                overline="O Que Resolvemos"
                heading={`Problemas de ${serviceCategory} que resolvemos ${cityPrep}`}
                goldWord={data.city}
                light={true}
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
              <p className="text-center text-[9px] text-[#111111]/20 tracking-[0.22em] uppercase mt-4 md:hidden">
                deslize para ver mais →
              </p>
            </div>
          </section>
        )}

        {/* ═══ FAQ ═══ */}
        {data.faqs && data.faqs.length > 0 && (
          <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.service.toLowerCase()} ${cityPrep} ${data.city}`} variant="dark" />
        )}

        {/* ═══ COMO FUNCIONA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Processo"
              heading={`Os passos da nossa ${data.serviceSlug === 'impermeabilizacao' ? 'impermeabilização' : 'limpeza profunda'} ${cityPrep}`}
              goldWord={data.city}
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

            <div className="grid md:grid-cols-2 gap-4">
              {cityFreguesias && cityFreguesias.freguesias.length > 0 && (
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
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

              <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
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
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
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
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
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
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
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

              {hasMarcaSofaCity && data.serviceSlug === 'limpeza-sofas' && (
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
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

              {hasMarcaColchaoCity && data.serviceSlug === 'limpeza-colchoes' && (
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Marcas de colchão {cityPrep} {data.city}</p>
                  <div className="flex flex-wrap gap-2">
                    {MARCA_COLCHAO_SLUGS.map(slug => (
                      <Link
                        key={slug}
                        to={`/limpeza-colchao-${slug}-${data.citySlug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all capitalize"
                      >
                        {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {hasMarcaCadeirasCity && data.serviceSlug === 'limpeza-cadeiras' && (
                <div className="p-5 rounded-xl bg-white" style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.04)" }}>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Marcas de cadeiras {cityPrep} {data.city}</p>
                  <div className="flex flex-wrap gap-2">
                    {MARCA_CADEIRAS_SLUGS.map(slug => (
                      <Link
                        key={slug}
                        to={`/limpeza-cadeiras-${slug}-${data.citySlug}`}
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

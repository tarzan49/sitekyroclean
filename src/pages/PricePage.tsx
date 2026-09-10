import PriceFactors from "@/components/PriceFactors";
import DirectoryGroup from "@/components/DirectoryGroup";
import ProblemCarousel from "@/components/ProblemCarousel";
import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { MapPin, Star, MessageCircle, ArrowRight, Clock, Euro, Timer } from "lucide-react";
import { GoogleG } from "@/components/icons/GoogleG";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import QuizFormLazy from "@/components/QuizFormLazy";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { getPricePageData, getAllPriceRoutes } from "@/data/priceSeoData";
import { getAllProblems } from "@/data/problemSeoData";
import { services, cities, cityPrep } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITIES } from "@/constants/metroCities";
import { pickServiceHero } from "@/constants/serviceContent";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { SERVICE_DURATION, PROBLEM_IMAGES } from "@/constants/problemCardHelpers";
import impermeabilizacaoAfter from "@/assets/galeria-impermeabilizacao-depois.webp";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";
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

  const { isQuizOpen: isProblemQuizOpen, openQuiz: openProblemQuiz, closeQuiz: closeProblemQuiz } = useQuizLauncher();

  const relatedProblems = useMemo(() => {
    if (!data) return [];
    return getAllProblems().filter(p =>
      p.visible &&
      p.relatedServices.includes(data.serviceSlug) &&
      (METRO_CITIES.has(data.citySlug) || p.relatedCities.includes(data.citySlug))
    ).slice(0, 5);
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

  const prep = cityPrep(data.cityName);
  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];
  const heroImgs = pickServiceHero(data.serviceSlug, data.cityName);
  const beforeAfterCategory = categoryForServiceSlug(data.serviceSlug);
  const service = services.find(s => s.slug === data.serviceSlug);
  const servicePrice = service?.priceFrom ?? "49€";
  const relatedServices = services.filter(s => s.slug !== data.serviceSlug).slice(0, 4);
  const nearbyCities = cities.filter(c => c.slug !== data.citySlug).slice(0, 8);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.cityName))}`;

  const serviceCategory = data.serviceName.startsWith("Limpeza de ")
    ? data.serviceName.replace("Limpeza de ", "").toLowerCase()
    : data.serviceName.toLowerCase();
  const problemImages = PROBLEM_IMAGES[data.serviceSlug] ?? [];
  // Impermeabilização não é um serviço de limpeza — os "problemas" do catálogo
  // global (manchas, odores) são sobre limpar, não sobre o que a proteção em
  // si vende. Cartões próprios, sobre o que a impermeabilização faz.
  const problemCards = data.serviceSlug === 'impermeabilizacao'
    ? [
        { title: "Líquidos que penetram no tecido", description: "Sem proteção, um copo entornado absorve em segundos. A impermeabilização faz o líquido escorregar à superfície, com tempo para limpar antes de manchar.", image: problemImages[2] },
        { title: "Manchas de gordura difíceis", description: "Gordura e molho penetram fundo em tecido desprotegido e resistem à limpeza caseira. Com a proteção aplicada, ficam à superfície e saem com mais facilidade.", image: problemImages[1] },
        { title: "Tecido sem proteção nenhuma", description: "Sofás e cadeiras novos ou recém-limpos ficam vulneráveis ao primeiro acidente. A impermeabilização cria uma barreira que dura anos, não semanas.", image: problemImages[0] },
        { title: "Um sofá que continua como novo", description: "Menos manchas absorvidas significa menos desgaste do tecido ao longo do tempo. A impermeabilização ajuda a manter o aspeto e a durabilidade do estofo.", image: impermeabilizacaoAfter },
      ]
    : relatedProblems.map((problem, idx) => ({
        title: problem.keyword.charAt(0).toUpperCase() + problem.keyword.slice(1),
        description: problem.intro.match(/^[^.?]*[.?]/)?.[0] ?? problem.intro,
        image: problemImages[idx],
      })).filter(card => card.image);

  const serviceDuration = SERVICE_DURATION[data.serviceSlug] ?? { value: "3 a 6h", label: "Pronto a usar" };
  // Resposta em menos de 10 minutos: compromisso comum a todo o site.

  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    (data.serviceSlug === 'limpeza-tapetes' || data.serviceSlug === 'limpeza-alcatifas')
      ? { value: "Á Medida", label: `Orçamento, em ${data.cityName}`, icon: Euro }
      : { value: servicePrice, label: `Desde, em ${data.cityName}`, icon: Euro },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
    { value: "<10min", label: "Respondemos em menos de 10 minutos", icon: Clock },
  ];

  return (
    <QuizLocationProvider value={data.cityName}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ═══ HERO + LOCAL SNAPSHOT (fundo fotográfico contínuo) ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <picture className="w-full h-full">
              <source media="(max-width: 767px)" srcSet={heroImgs.m} />
              <source media="(min-width: 768px)" srcSet={heroImgs.d} />
              <img src={heroImgs.d} alt="" className="w-full h-full object-cover" loading="eager" />
            </picture>
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.90) 78%, rgba(7,26,18,0.97) 100%)" }} />

        <section className="relative pt-6 md:pt-16 lg:pt-20 pb-8 md:pb-16">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-4 lg:gap-12 items-center">
              <div>
                <PageBreadcrumb items={[
                  { label: "Início", to: "/" },
                  { label: data.serviceName, to: `/${data.serviceSlug}` },
                  { label: `Preços · ${data.cityName}` },
                ]} />

                <div className="inline-flex items-start mb-3 lg:mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      Tabela de Preços · {data.cityName}
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 lg:mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  Preço de {data.serviceName} {prep} <span style={{ color: "#D4AF37" }}>{data.cityName}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-4 lg:mb-6 max-w-lg">
                  {data.intro.match(/^[^.?]*[.?]/)?.[0] ?? data.intro}
                </p>


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

                <p className="text-white/40 text-xs mt-4">{/^\d/.test(servicePrice) ? `Desde ${servicePrice} · ` : ''}Orçamento gratuito · Sem compromisso</p>
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
                        alt={`${data.serviceName} ${prep} ${data.cityName}`}
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
        <div id="precos" className="scroll-mt-6"><ServicePriceSection serviceSlug={data.serviceSlug} initialLocation={data.cityName} /></div>

        <QuizFormLazy
          isOpen={isProblemQuizOpen}
          onClose={closeProblemQuiz}
          initialLocation={data.cityName}
          initialService={quizService}
        />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section id="avaliacoes" className="scroll-mt-6 py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug={data.serviceSlug} seed={data.citySlug} heading="" />
          </div>
        </section>

        {/* ═══ PROBLEMAS QUE RESOLVEMOS (o antes/depois já está no hero) ═══ */}
        {problemCards.length > 0 && (
          <section className="py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader
                overline="O Que Resolvemos"
                heading={`Problemas de ${serviceCategory} que resolvemos ${prep}`}
                goldWord={data.cityName}
                light={true}
              />
              <p className="-mt-5 mb-7 max-w-xl text-sm sm:text-base leading-relaxed text-[#536259]">
                Reconhece algum destes sinais? Peça uma avaliação e descubra o tratamento adequado ao seu caso.
              </p>
              <ProblemCarousel>
                {problemCards.map((card, idx) => (
                  <article key={card.title} className="snap-start flex-none w-[84vw] max-w-[380px] md:max-w-none md:w-auto overflow-hidden rounded-sm border border-[#183b2c]/15 bg-[#0c241a] group flex flex-col shadow-[0_8px_24px_rgba(7,26,18,0.10)]">
                    <div className="relative h-[185px] sm:h-[220px] overflow-hidden">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover saturate-[0.85] motion-safe:group-hover:scale-[1.03] transition-transform duration-700" loading="lazy" decoding="async" />
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
        {data.faqs.length > 0 && (
          <div id="duvidas" className="scroll-mt-6"><ServiceFAQ faqs={data.faqs} heading={`Dúvidas sobre preços ${prep} ${data.cityName}`} variant="dark" /></div>
        )}

        {/* ═══ O QUE INFLUENCIA O PREÇO ═══ */}
        <PriceFactors serviceSlug={data.serviceSlug} />

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Explore por categoria" heading="Serviços e preços por" goldWord="localidade" light={true} />
            <div className="max-w-4xl border-t border-[#D4AF37]/25">
              <DirectoryGroup title={<>Ver página completa</>}>
                  <Link to={`/${data.serviceSlug}-${data.citySlug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                    <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                    {data.serviceName} {prep} {data.cityName}
                  </Link>
                </DirectoryGroup>

              <DirectoryGroup title={<>Outros serviços {prep} {data.cityName}</>}>
                  {relatedServices.map(svc => (
                    <Link key={svc.slug} to={`/preco-${svc.slug}-${data.citySlug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                      <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {svc.name}
                    </Link>
                  ))}
                </DirectoryGroup>

              <DirectoryGroup title={<>Preços noutras cidades</>}>
                  {nearbyCities.map(city => (
                    <Link key={city.slug} to={`/preco-${data.serviceSlug}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {city.name}
                    </Link>
                  ))}
                </DirectoryGroup>
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
                  ...(servicePrice.replace(/[^0-9]/g, "") && { offers: buildOfferNode(servicePrice.replace(/[^0-9]/g, "")) }),
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

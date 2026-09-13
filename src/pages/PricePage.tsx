import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { GoogleG } from "@/components/icons/GoogleG";
import LandingServiceSections from '@/components/LandingServiceSections';
import PageBreadcrumb from "@/components/PageBreadcrumb";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import SofaLeadActions from "@/components/SofaLeadActions";
import { REVIEW_COUNT, REVIEW_RATING, SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import { SERVICE_DURATION } from "@/constants/problemCardHelpers";
import { pickServiceHero } from "@/constants/serviceContent";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
import { cityPrep, services } from "@/data/locationSeoData";
import { getAllPriceRoutes, getPricePageData } from "@/data/priceSeoData";
import {
  buildBreadcrumbNode,
  buildOfferNode,
  buildServiceNode,
  buildWebPageNode,
  clearPrerenderedFaqSchema,
} from "@/lib/seoSchema";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { Clock, Timer } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

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
      clearPrerenderedFaqSchema();
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
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.cityName))}`;

  const serviceDuration = SERVICE_DURATION[data.serviceSlug] ?? { value: "3 a 6h", label: "Pronto a usar" };
  // Resposta em menos de 10 minutos: compromisso comum a todo o site.

  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    { value: "<10min", label: "Respondemos em menos de 10 minutos", icon: Clock },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
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
                  {data.intro}
                </p>


                <SofaLeadActions city={data.cityName} price={servicePrice} href={waHref} source={`price_hero_${data.serviceSlug}_${data.citySlug}`} />
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

        <LandingServiceSections />

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

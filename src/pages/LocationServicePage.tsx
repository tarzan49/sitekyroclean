import CommercialHero from "@/components/CommercialHero";
import { AdsLandingFooter, AdsLandingHeader, isAdsVisit } from "@/components/AdsLandingNavigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { GoogleG } from "@/components/icons/GoogleG";
import LandingServiceSections from '@/components/LazyLandingServiceSections';
import PageBreadcrumb from "@/components/PageBreadcrumb";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import SofaLeadActions from "@/components/SofaLeadActions";
import { REVIEW_COUNT, REVIEW_RATING, SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import { SERVICE_DURATION } from "@/constants/problemCardHelpers";
import { pickServiceHero } from "@/constants/serviceContent";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
import { cities, getLocationServiceData, services } from "@/data/locationSeoData";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { Clock, Timer } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";


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
  const isSofaCleaning = data.serviceSlug === "limpeza-sofas";
  const isPaidLanding = isSofaCleaning && isAdsVisit(location.search);
  const serviceBaseUrl = services.find(s => s.slug === data.serviceSlug)?.baseRoute ?? `/${data.serviceSlug}`;

  // H1: last word (the city name) rendered in gold
  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  const waUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.city))}`;

  // "Porto" takes the definite article ("no Porto"); every other city in our list reads naturally with "em"
  const cityPrep = data.citySlug === 'porto' ? 'no' : 'em';

  const serviceDuration = SERVICE_DURATION[data.serviceSlug] ?? { value: "3 a 6h", label: "Pronto a usar" };
  // Resposta alinhada com o orçamento: menos de 10 minutos no horário de atendimento.
  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    { value: "<10min", label: "Resposta durante o horário de atendimento", icon: Clock },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
  ];


  return (
    <QuizLocationProvider value={data.city}>
    <QuizServiceProvider value={quizService}>
      <ServiceLocationSchema
        serviceName={data.service}
        serviceBaseUrl={serviceBaseUrl}
        placeName={data.city}
        description={data.metaDescription}
        pageUrl={location.pathname}
        priceFrom={data.priceFrom}
      />
      {isPaidLanding ? <AdsLandingHeader /> : <Header />}
      <main>

        <CommercialHero title={data.h1} serviceSlug={data.serviceSlug} city={data.city} price={data.priceFrom} image={heroImgs} whatsappHref={waUrl} source={`location_hero_${data.serviceSlug}_${data.citySlug}`} />

        <LandingServiceSections />
      </main>
      {isPaidLanding ? <AdsLandingFooter /> : <Footer />}
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default LocationServicePage;

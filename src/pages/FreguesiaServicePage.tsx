import CommercialHero from "@/components/CommercialHero";
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
import { useLandingModel } from "@/hooks/use-landing-model";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { Clock, Timer } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

const FontComparisonPanel = import.meta.env.DEV
  ? lazy(() => import("@/components/FontComparisonPanel"))
  : null;


const FreguesiaServicePage = () => {
  const location = useLocation();
  // O modelo ja traz tudo o que o hero desta pagina usa.
  const resolved = useLandingModel(location.pathname);
  const model = resolved.status === 'ready' ? resolved.model : null;
  const data = useMemo(() => (model && model.family === 'freguesia' ? {
    title: model.title, metaDescription: model.metaDescription, h1: model.h1,
    name: model.locationName, slug: model.parishSlug ?? '',
    municipio: model.municipalityName, municipioSlug: model.municipalitySlug,
    service: model.serviceName, serviceSlug: model.serviceSlug, priceFrom: model.priceFrom,
    serviceBaseRoute: model.serviceBaseRoute,
  } : null), [model]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", data.metaDescription);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${SITE_URL}${location.pathname}`);
    }
  }, [location.pathname, data]);

  if (!data) {
    if (resolved.status === 'loading') return <div className="min-h-screen bg-background" aria-busy="true" />;
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
  // "Detalhes:" em branco no email, valor total so a deslocacao).
  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];
  const heroImgs = pickServiceHero(data.serviceSlug, data.name);
  const beforeAfterCategory = categoryForServiceSlug(data.serviceSlug);
  const serviceBaseUrl = data.serviceBaseRoute ?? `/${data.serviceSlug}`;
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

  const serviceDuration = SERVICE_DURATION[data.serviceSlug] ?? { value: "3 a 6h", label: "Pronto a usar" };
  // Resposta em menos de 10 minutos: compromisso comum a todo o site.

  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    { value: "<10min", label: "Respondemos em menos de 10 minutos", icon: Clock },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
  ];

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

        <CommercialHero title={data.h1} serviceSlug={data.serviceSlug} city={data.municipio} price={data.priceFrom} image={heroImgs} breadcrumbs={[{ label: "Início", to: "/" }, { label: data.service, to: serviceBaseUrl }, { label: data.name }]} whatsappHref={waUrl} source={`freguesia_hero_${data.serviceSlug}_${data.municipioSlug}`} />

        <LandingServiceSections />

      </main>
      <Footer />
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default FreguesiaServicePage;

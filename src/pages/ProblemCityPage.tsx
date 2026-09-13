import ProblemExamplesGallery from "@/components/ProblemExamplesGallery";
import ProblemTreatmentGuide from "@/components/ProblemTreatmentGuide";
import { getProblemLayout } from "@/data/problemLayout";
import DirectoryGroup from "@/components/DirectoryGroup";
import ProblemHero from "@/components/ProblemHero";
import { getProblemHero } from "@/data/problemHero";
import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import {
  MapPin, ArrowRight, AlertTriangle,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { CATEGORY_TIPS, splitTipsHeading } from "@/data/problemTipsData";
import { getServiceGallery, getIllustrativePhotos } from "@/constants/serviceGallery";
import { cities, services, DEFAULT_PRICE_FROM, cityPrep } from "@/data/serviceCatalog";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITY_SLUGS } from "@/constants/metroCities";
import { getAllProblemCityRoutes } from "@/data/problemCitySeoData";
import { SITE_URL } from "@/constants/business";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";

const ProblemCityPage = () => {
  const { pathname } = useLocation();

  const routeData = useMemo(() => {
    const allRoutes = getAllProblemCityRoutes();
    return allRoutes.find(r => r.path === pathname) || null;
  }, [pathname]);

  const problem = useMemo(() => routeData ? getProblemBySlug(routeData.problemSlug) : null, [routeData]);
  const city = useMemo(() => routeData ? cities.find(c => c.slug === routeData.citySlug) : null, [routeData]);

  useEffect(() => {
    if (problem && city) {
      const prep = cityPrep(city.name);
      const title = `${problem.h1} ${prep} ${city.name} | Kyro Clean Solutions`;
      document.title = title;
      const metaDesc = `${problem.h1} ${prep} ${city.name}: serviço profissional ao domicílio. ${problem.metaDescription.split('.')[0]}. Orçamento grátis em menos de 10 minutos.`;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", metaDesc);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", metaDesc);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${SITE_URL}${pathname}`);
    }
  }, [pathname, problem, city]);

  if (!problem || !city) {
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

  const prep = cityPrep(city.name);
  const hero = getProblemHero(problem, city.name);
  const quizService = SERVICE_TO_QUIZ[problem.relatedServices[0]] ?? 'sofa';

  const relatedProblemLinks = getRelatedProblemLinks(problem.relatedProblems);
  const relatedServiceData = problem.relatedServices
    .map(slug => services.find(s => s.slug === slug))
    .filter(Boolean) as typeof services[number][];
  const servicePrice = relatedServiceData[0]?.priceFrom ?? DEFAULT_PRICE_FROM;
  const categoryTips = CATEGORY_TIPS[problem.category];
  const gallery = getServiceGallery(problem.relatedServices[0], `${problem.slug}-${city.slug}`);
  const validCitySlugs = new Set([...METRO_CITY_SLUGS, ...problem.relatedCities]);
  const nearbyCities = cities
    .filter(c => c.slug !== city.slug && validCitySlugs.has(c.slug))
    .slice(0, 8);

  const localFaqs = problem.faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer.includes(city.name)
      ? faq.answer
      : `${faq.answer} Prestamos este serviço ao domicílio ${prep} ${city.name} e arredores.`,
  }));

  return (
    <QuizLocationProvider value={city.name}>
    <QuizServiceProvider value={quizService}>
    <>
      <ServiceLocationSchema
        serviceName={problem.h1}
        serviceBaseUrl={`/problemas/${problem.slug}`}
        placeName={city.name}
        description={hero.intro}
        pageUrl={pathname}
        priceFrom={servicePrice}
      />
      <Header />
      <main>

        <ProblemHero problem={problem} city={city.name} />
        <ServicePriceSection serviceSlug={problem.relatedServices[0]} initialLocation={city.name} />

        {/* ═══ AVALIAÇÕES REAIS — logo abaixo do widget ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={true} />
            <ServiceReviewsGrid serviceSlug={problem.relatedServices[0]} seed={`${problem.slug}-${city.slug}`} heading="" />
          </div>
        </section>

        <ProblemExamplesGallery key={`examples-${problem.slug}`} problem={problem} />

        <ProblemTreatmentGuide key={problem.slug} guide={getProblemLayout(problem).processGuide} slug={problem.slug} />

        {/* ═══ BENEFÍCIOS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Vantagens" heading="Benefícios do nosso serviço" goldWord={`${prep} ${city.name}`} light={true} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {problem.benefits.map((benefit, idx) => (
                <div key={idx} className="relative overflow-hidden flex items-start gap-3 p-6 md:p-7 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                  <span
                    className="absolute bottom-2 right-3 font-playfair font-bold leading-none select-none pointer-events-none"
                    style={{ fontSize: "5rem", color: "rgba(212,175,55,0.1)" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="relative text-sm text-[#111111]/65 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DICA DE ESPECIALISTA ═══ */}
        {categoryTips && (
          <section className="py-14 md:py-20 bg-kyro-green">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader overline="Dica de Especialista" heading={splitTipsHeading(categoryTips.title).heading} goldWord={splitTipsHeading(categoryTips.title).goldWord} light={false} />
              <div className="max-w-2xl">
                <ol className="space-y-4 mb-8">
                  {categoryTips.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="font-black text-xs w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(212,175,55,0.18)", color: "#D4AF37" }}>
                        {i + 1}
                      </span>
                      <p className="text-sm text-white/70 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="flex items-start gap-3 p-4" style={{ backgroundColor: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                  <p className="text-xs text-white/50 leading-relaxed">{categoryTips.warning}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══ GALERIA ILUSTRATIVA (o antes/depois já está no hero) ═══ */}
        {gallery && (
          <ServiceAutoCarousel
            comparison={false}
            overline="Resultados Reais"
            heading="Antes e depois da intervenção"
            subtitle={`Transformações visíveis no próprio dia, ${prep} ${city.name}. Sem químicos agressivos, sem esperas.`}
            slides={getIllustrativePhotos(problem.relatedServices[0], `${problem.slug}-${city.slug}`)}
            variant="light"
          />
        )}

        {/* ═══ FAQ ═══ */}
        {localFaqs.length > 0 && (
          <ServiceFAQ faqs={localFaqs} heading="Perguntas Frequentes" variant="dark" />
        )}

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Explore por categoria" heading="Serviços, soluções e" goldWord="localidades" light={false} />
            <div className="max-w-4xl border-t border-[#D4AF37]/25">
              {relatedServiceData.length > 0 && (
                <DirectoryGroup title={<>Serviços {prep} {city.name}</>} dark>
                    {relatedServiceData.map(svc => (
                      <Link key={svc.slug} to={`/${svc.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white border border-white/15 hover:border-[#D4AF37]/40 hover:bg-white/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {svc.name}
                      </Link>
                    ))}
                  </DirectoryGroup>
              )}

              {relatedProblemLinks.length > 0 && (
                <DirectoryGroup title={<>Problemas relacionados</>} dark>
                    {relatedProblemLinks.map(link => (
                      <Link key={link.path} to={link.path}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white border border-white/15 hover:border-[#D4AF37]/40 hover:bg-white/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </DirectoryGroup>
              )}

              <DirectoryGroup title={<>Este problema noutras cidades</>} dark>
                  {nearbyCities.map(c => (
                    <Link key={c.slug} to={`/${problem.slug}-${c.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white border border-white/15 hover:border-[#D4AF37]/40 hover:bg-white/5 transition-all">
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {c.name}
                    </Link>
                  ))}
                </DirectoryGroup>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default ProblemCityPage;

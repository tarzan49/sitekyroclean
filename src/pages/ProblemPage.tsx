import DirectoryGroup from "@/components/DirectoryGroup";
import ProblemHero from "@/components/ProblemHero";
import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import {
  MapPin, ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ProblemExamplesGallery from "@/components/ProblemExamplesGallery";
import ProblemTreatmentGuide from "@/components/ProblemTreatmentGuide";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServicePackBanner from "@/components/ServicePackBanner";
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";
import { getProblemLayout } from "@/data/problemLayout";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { services, cities } from "@/data/serviceCatalog";
import { getProblemCities } from "@/data/problemCitySeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { SITE_URL } from "@/constants/business";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";
import {
  buildLocalBusinessNode,
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
  clearPrerenderedSchema,
  DEFAULT_AREA_SERVED,
} from "@/lib/seoSchema";

const ProblemPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = useMemo(() => (slug ? getProblemBySlug(slug) : null), [slug]);
  const relatedService = useMemo(
    () => (data ? services.find(s => s.slug === data.relatedServices[0]) : undefined),
    [data]
  );

  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

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
      if (canonical) canonical.setAttribute("href", `${SITE_URL}/problemas/${slug}`);
    }
  }, [slug, data]);

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

  const relatedServiceData = data.relatedServices
    .map(s => services.find(svc => svc.slug === s))
    .filter(Boolean) as typeof services[number][];

  const quizService = SERVICE_TO_QUIZ[data.relatedServices[0]] ?? 'sofa';
  const relatedProblemLinks = getRelatedProblemLinks(data.relatedProblems);
  // Todas as cidades onde esta página existe, não só as `relatedCities`: a
  // lista vinha de um campo editorial e deixava de fora a maioria das páginas
  // geradas, que ninguém mais ligava. Ver getProblemCities.
  const relatedCityData = getProblemCities(data.slug);
  const layout = getProblemLayout(data);
  return (
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        <ProblemHero problem={data} />
        <ServicePriceSection serviceSlug={data.relatedServices[0]} />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug={data.relatedServices[0]} seed={data.slug} heading="" />
          </div>
        </section>

        <ProblemExamplesGallery key={`examples-${slug}`} problem={data} />

        <ProblemTreatmentGuide key={`process-${slug}`} guide={layout.processGuide} slug={data.slug} />

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <ServiceFAQ faqs={layout.faqs} heading={`Perguntas sobre ${data.h1.toLowerCase()}`} variant="light" />
        )}

        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.relatedServices[0]] ?? ["pack-sala-completa"]}
          variant="dark"
        />

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Explore por categoria" heading="Serviços, soluções e" goldWord="localidades" light={true} />
            <div className="max-w-4xl border-t border-[#D4AF37]/25">
              {relatedServiceData.length > 0 && (
                <DirectoryGroup title={<>Serviços relacionados</>}>
                    {relatedServiceData.map(svc => (
                      <Link key={svc.slug} to={svc.baseRoute}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {svc.name}
                      </Link>
                    ))}
                  </DirectoryGroup>
              )}

              {relatedProblemLinks.length > 0 && (
                <DirectoryGroup title={<>Problemas relacionados</>}>
                    {relatedProblemLinks.map(link => (
                      <Link key={link.path} to={link.path}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </DirectoryGroup>
              )}

              {relatedCityData.length > 0 && (
                <DirectoryGroup title={<>Disponível em</>}>
                    {relatedCityData.map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {city.name}
                      </Link>
                    ))}
                  </DirectoryGroup>
              )}
            </div>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            buildLocalBusinessNode(),
            buildWebPageNode({ url: `${SITE_URL}/problemas/${slug}`, name: data.title, description: data.metaDescription }),
            // O passo do meio é o serviço, não um "/problemas" que nunca
            // existiu: não há rota em App.tsx nem ficheiro no dist, e em
            // produção devolve 404. A migalha visível desta página já mostrava
            // Início › serviço, por isso o que a página mostrava e o que
            // declarava discordavam, e o que declarava apontava para uma
            // página inexistente. Passam a ser a mesma coisa.
            buildBreadcrumbNode(`${SITE_URL}/problemas/${slug}#breadcrumb`, [
              { name: "Início", item: `${SITE_URL}/` },
              ...(relatedService ? [{ name: relatedService.name, item: `${SITE_URL}/${relatedService.slug}` }] : []),
              { name: data.h1, item: `${SITE_URL}/problemas/${slug}` },
            ]),
            ...(relatedService ? [buildServiceNode({
              url: `${SITE_URL}/problemas/${slug}`,
              name: data.h1,
              description: data.metaDescription,
              serviceType: relatedService.name,
              areaServed: DEFAULT_AREA_SERVED,
              ...(relatedService.priceFrom.replace(',', '.').replace(/[^0-9.]/g, '') && {
                offers: buildOfferNode(relatedService.priceFrom.replace(',', '.').replace(/[^0-9.]/g, ''), {
                  validFrom: "2025-01-01",
                  priceValidUntil: "2026-12-31",
                }),
              }),
            })] : []),
          ],
        }) }} />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default ProblemPage;

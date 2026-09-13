import DirectoryGroup from "@/components/DirectoryGroup";
import SofaLeadActions from "@/components/SofaLeadActions";
import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import {
  MapPin, ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServicePackBanner from "@/components/ServicePackBanner";
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";
import { getProblemLayout } from "@/data/problemLayout";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { getServiceGallery, getIllustrativePhotos } from "@/constants/serviceGallery";
import { services, cities } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { getProblemHeroImage } from "@/lib/problemHeroImages";
import { buildProblemWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
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
  const relatedCityData = data.relatedCities
    .map(s => cities.find(c => c.slug === s))
    .filter(Boolean) as typeof cities[number][];
  const servicePrice = relatedService?.priceFrom ?? "49€";
  const layout = getProblemLayout(data);
  const gallery = getServiceGallery(data.relatedServices[0], slug ?? "");
  const heroImg = getProblemHeroImage(slug ?? "");
  const beforeAfterCategory = categoryForServiceSlug(data.relatedServices[0]);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildProblemWaMessage(slug ?? ""))}`;

  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  return (
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* Hero com a mesma composição das páginas de materiais. */}
        <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <PageBreadcrumb items={[
                  { label: "Início", to: "/" },
                  { label: data.h1 },
                ]} />

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      Como Resolver
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  {h1Rest}{" "}<span style={{ color: "#D4AF37" }}>{h1Gold}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg line-clamp-2">
                  {data.intro.match(/^[^.?]*[.?]/)?.[0] ?? data.intro}
                </p>

                <div className="mb-6">
                  <TrustRatingBadge variant="mapsLinkClients" />
                </div>

                <SofaLeadActions city="a sua zona" price={servicePrice} href={waHref} source={`problem_hero_${slug}`} />
              </div>

              <div className="mt-8 lg:mt-0">
                <div className="relative">
                  <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  {beforeAfterCategory ? (
                    <div className="relative shadow-2xl" style={{ borderTop: "2px solid #D4AF37" }}>
                      <HeroBeforeAfterPool category={beforeAfterCategory} className="w-full" />
                    </div>
                  ) : (
                    <img
                      src={heroImg}
                      alt={data.h1}
                      className="relative w-full max-h-[440px] object-cover shadow-2xl"
                      style={{ borderTop: "2px solid #D4AF37" }}
                      loading="eager"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServicePriceSection serviceSlug={data.relatedServices[0]} />

        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliação" heading="O que temos em" goldWord="conta" light={false} />
            <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {layout.characteristics.map((item, i) => (
                <div key={item} className="relative overflow-hidden flex items-start gap-3 p-6 md:p-7" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <span className="font-playfair font-bold flex-shrink-0 leading-none" style={{ fontSize: "1.75rem", color: "rgba(212,175,55,0.4)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-white/65 leading-relaxed pt-1">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ GALERIA ILUSTRATIVA (o antes/depois já está no hero) ═══ */}
        {gallery && (
          <ServiceAutoCarousel
            comparison={false}
            overline="O serviço"
            heading="Cuidados com os seus estofos"
            subtitle="Conheça o serviço. A intervenção é adaptada ao artigo e ao seu estado."
            slides={getIllustrativePhotos(data.relatedServices[0], slug ?? "")}
            variant="light"
          />
        )}

        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Processo" heading="Como tratamos este" goldWord="problema" light={false} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {[0, 1].map(col => (
                <div key={col} className="grid gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  {layout.process.slice(col * 2, col * 2 + 2).map((step, idx) => (
                    <div key={step.title} className="relative overflow-hidden flex items-start gap-4 p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                      <span className="font-playfair font-bold flex-shrink-0 leading-none" style={{ fontSize: "1.5rem", color: "#D4AF37" }}>
                        {String(col * 2 + idx + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm text-white/70 leading-relaxed pt-1"><strong className="font-semibold">{step.title}.</strong> {step.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <ServiceFAQ faqs={layout.faqs} heading={`Perguntas sobre ${data.h1.toLowerCase()}`} variant="dark" />
        )}

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug={data.relatedServices[0]} seed={data.slug} heading="" />
          </div>
        </section>

        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.relatedServices[0]] ?? ["pack-sala-completa"]}
          variant="light"
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
            buildBreadcrumbNode(`${SITE_URL}/problemas/${slug}#breadcrumb`, [
              { name: "Início", item: `${SITE_URL}/` },
              { name: "Problemas", item: `${SITE_URL}/problemas` },
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

import CommercialHero from "@/components/CommercialHero";
import MaterialExamplesGallery from "@/components/MaterialExamplesGallery";
import DirectoryGroup from "@/components/DirectoryGroup";
import SofaLeadActions from "@/components/SofaLeadActions";
import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { MapPin, Star, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
import Footer from "@/components/Footer";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServicePackBanner from "@/components/ServicePackBanner";
import IllustratedProcessGuide from "@/components/IllustratedProcessGuide";
import { MATERIAL_PROCESS_GUIDES } from "@/data/materialProcessGuides";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";
import {
  getMaterialBySlug,
  getAllMaterialCityRoutes,
  getMaterialCityData,
  getRelatedMaterialLinks,
} from "@/data/materialSeoData";
import { cities, services, DEFAULT_PRICE_FROM, cityPrep } from "@/data/locationSeoData";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";
import { buildMaterialWaMessage } from "@/lib/whatsappMessages";
import { MATERIAL_HERO, MATERIAL_HERO_FALLBACK } from "@/data/materialHeroImages";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
  DEFAULT_AREA_SERVED,
} from "@/lib/seoSchema";


const MaterialPage = () => {
  const { pathname } = useLocation();

  const { data, isCityVariant, citySlug } = useMemo(() => {
    const allCityRoutes = getAllMaterialCityRoutes();
    const cityRoute = allCityRoutes.find(r => r.path === pathname);
    if (cityRoute) {
      const d = getMaterialCityData(cityRoute.materialSlug, cityRoute.citySlug);
      return { data: d, isCityVariant: true, citySlug: cityRoute.citySlug };
    }
    const mat = getMaterialBySlug(pathname.replace(/^\//, ""));
    return { data: mat, isCityVariant: false, citySlug: "" };
  }, [pathname]);

  const cityName = useMemo(() => {
    if (!isCityVariant || !citySlug) return null;
    return cities.find(c => c.slug === citySlug)?.name ?? null;
  }, [isCityVariant, citySlug]);

  const quizService = data ? SERVICE_TO_QUIZ[data.serviceSlug] : undefined;

  const servicePrice = useMemo(() => {
    if (!data) return DEFAULT_PRICE_FROM;
    return services.find(s => s.slug === data.serviceSlug)?.priceFrom ?? DEFAULT_PRICE_FROM;
  }, [data]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", data.metaDescription);
      const canonicalUrl = isCityVariant
        ? `${SITE_URL}/${data.serviceSlug}-${citySlug}`
        : `${SITE_URL}${pathname}`;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", canonicalUrl);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", data.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", data.metaDescription);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", `${SITE_URL}${pathname}`);
    }
  }, [pathname, data, isCityVariant, citySlug]);

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

  const relatedLinks = getRelatedMaterialLinks(data.relatedMaterials);
  const topCities = cities.slice(0, 8);
  const heroImg = MATERIAL_HERO[data.slug] ?? MATERIAL_HERO_FALLBACK;
  const beforeAfterCategory = categoryForServiceSlug(data.serviceSlug);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildMaterialWaMessage(data.slug, cityName))}`;

  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  const processGuide = MATERIAL_PROCESS_GUIDES[data.slug];

  return (
    <QuizLocationProvider value={cityName ?? undefined}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        <CommercialHero title={data.h1} subtitle={`Cuidados profissionais para ${data.name.toLowerCase()}.`} serviceSlug={data.serviceSlug} city={cityName ?? undefined} price={servicePrice} image={heroImg} breadcrumbs={[{ label: "Início", to: "/" }, { label: data.serviceName, to: `/${data.serviceSlug}` }, { label: `${data.name}${cityName ? ` · ${cityName}` : ""}` }]} whatsappHref={waHref} source={`material_hero_${data.slug}`} />

        <ServicePriceSection serviceSlug={data.serviceSlug} initialLocation={cityName ?? undefined} />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug={data.serviceSlug} seed={`${data.slug}-${citySlug}`} heading="" />
          </div>
        </section>

        {/* Exemplos específicos, partilhados com as variantes por cidade. */}
        <MaterialExamplesGallery key={data.slug} materialSlug={data.slug} />

        {/* ═══ PROCESSO DE LIMPEZA ═══ */}
        {processGuide ? (
          <IllustratedProcessGuide dark key={data.slug} guide={processGuide} heading="Como limpamos o seu" goldWord={data.name.toLowerCase()} downloadName={data.slug} />
        ) : (
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Processo"
              heading="Como limpamos o seu"
              goldWord={data.name}
              light={false}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {[0, 1].map((colIdx) => {
                const splitAt = Math.ceil(data.cleaningProcess.length / 2);
                const colSteps = colIdx === 0 ? data.cleaningProcess.slice(0, splitAt) : data.cleaningProcess.slice(splitAt);
                const offset = colIdx === 0 ? 0 : splitAt;
                return (
                  <div key={colIdx} className="grid gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    {colSteps.map((step, idx) => {
                      const num = offset + idx;
                      return (
                        <div key={num} className="relative overflow-hidden flex items-start gap-4 p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                          <span className="font-playfair font-bold flex-shrink-0 leading-none" style={{ fontSize: "1.5rem", color: "#D4AF37" }}>
                            {String(num + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm text-white/70 leading-relaxed pt-1">{step}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        )}

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.name.toLowerCase()}`} variant="light" />
        )}

        {/* ═══ PACKS ═══ */}
        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.serviceSlug] ?? ["pack-sala-completa"]}
          city={citySlug || undefined}
          variant="dark"
        />

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20" style={{ backgroundColor: "#FDFDF9" }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Explore por categoria" heading="Materiais e" goldWord="localidades" />
            <div className="max-w-4xl border-t border-[#D4AF37]/25">
              {relatedLinks.length > 0 && (
                <DirectoryGroup title={<>Outros materiais</>}>
                    {relatedLinks.map(link => (
                      <Link key={link.path} to={link.path}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </DirectoryGroup>
              )}

              {!isCityVariant && (
                <DirectoryGroup title={<>Disponível em</>}>
                    {topCities.map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all">
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {city.name}
                      </Link>
                    ))}
                  </DirectoryGroup>
              )}

              {isCityVariant && (
                <DirectoryGroup title={<>Também disponível em</>}>
                    {cities.filter(c => c.slug !== citySlug).slice(0, 8).map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all">
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
            buildWebPageNode({ url: `${SITE_URL}${pathname}`, name: data.title, description: data.metaDescription }),
            buildBreadcrumbNode(`${SITE_URL}${pathname}#breadcrumb`, [
              { name: "Início", item: SITE_URL },
              { name: data.serviceName, item: `${SITE_URL}/${data.serviceSlug}` },
              { name: data.name, item: `${SITE_URL}/${data.slug}` },
              ...(isCityVariant && cityName ? [{ name: cityName, item: `${SITE_URL}${pathname}` }] : []),
            ]),
            buildServiceNode({
              url: `${SITE_URL}${pathname}`,
              name: data.title,
              description: data.metaDescription,
              areaServed: isCityVariant && cityName ? { "@type": "City", name: cityName } : DEFAULT_AREA_SERVED,
              ...(servicePrice.replace(/[^0-9]/g, "") && { offers: buildOfferNode(servicePrice.replace(/[^0-9]/g, "")) }),
            }),
          ],
        }) }} />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default MaterialPage;

import LeatherProcessSection from '@/components/LeatherProcessSection';
import CommercialHero from "@/components/CommercialHero";
import MaterialExamplesGallery from "@/components/MaterialExamplesGallery";
import DirectoryGroup from "@/components/DirectoryGroup";
import SofaLeadActions from "@/components/SofaLeadActions";
import { useEffect, useMemo, useState } from "react";
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
import SofaPricePicker from "@/components/SofaPricePicker";
import LeatherSofaPicker from "@/components/LeatherSofaPicker";
import RugPricePicker from "@/components/RugPricePicker";
import ServiceProcessStory from "@/components/ServiceProcessStory";
import SofaProcessGuide from "@/components/SofaProcessGuide";
import CustomerReviews from "@/components/CustomerReviews";
import CompactFAQ from "@/components/CompactFAQ";
import { pickReviewSubset } from "@/data/reviewsPool";
import { useSnapSections } from "@/hooks/useSnapSections";
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
import { cities, services, cityPrep } from "@/data/serviceCatalog";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";
import { buildMaterialWaMessage } from "@/lib/whatsappMessages";
import { MATERIAL_HERO, MATERIAL_HERO_FALLBACK } from "@/data/materialHeroImages";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  offerForPriceLabel,
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
    // Sem serviço, sem preço: nunca um valor por omissão inventado.
    if (!data) return "Sob orçamento";
    return services.find(s => s.slug === data.serviceSlug)?.priceFrom ?? "Sob orçamento";
  }, [data]);
  // Sofás de tecido por cidade: modelo novo (dono, 24 Nov). Pele fica com o guia próprio (os vídeos são de tecido).
  // Modelo novo também nas páginas nacionais de material (sem cidade): a pessoa escolhe a localidade por cima
  // do preço (verificação das 22 mil páginas, 25 Nov: eram as únicas 11 de material ainda no molde antigo).
  const [pickCity, setPickCity] = useState('');
  const priceCity = cityName ?? pickCity;
  const rugNew = data?.serviceSlug === 'limpeza-tapetes'; // tapetes (dono, 24 Nov)
  const sofaNew = data?.serviceSlug === 'limpeza-sofas' || rugNew;
  const fabric = sofaNew && !rugNew && data?.slug !== 'limpeza-sofa-pele';
  useSnapSections(sofaNew); // tecido, pele (widget e passo a passo próprios) e tapetes (dono, 25 Nov)

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

        {sofaNew ? <section id="precos" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 data-long-title={`${cityPrep(priceCity)} ${priceCity}`.length >= 23 ? '' : undefined} className="mb-5 md:mb-10 type-section-title font-playfair text-[#111111]">O seu {priceCity ? 'preço ' : ''}<em className="not-italic" style={{ color: "#D4AF37" }}>{priceCity ? `${cityPrep(priceCity)} ${priceCity}` : 'preço'}</em></h2>
            {!cityName && pickCity && <select value={pickCity} onChange={e => setPickCity(e.target.value)} aria-label="Localidade" className="mb-3 h-11 w-full max-w-xs rounded-xl border-2 border-[#D4AF37] bg-white px-3 text-sm font-semibold text-[#1A1A1A]"><option value="" disabled>Localidade</option>{cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}</select>}
            <div className="md:rounded-2xl md:border md:border-[#E5E0D3] md:bg-white md:p-6">{rugNew ? <RugPricePicker city={priceCity} onCity={setPickCity} source={`material_picker_${data.slug}`} /> : fabric ? <SofaPricePicker material="tecido" city={priceCity} onCity={setPickCity} source={`material_picker_${data.slug}`} /> : <LeatherSofaPicker onCity={setPickCity} city={priceCity} source={`material_picker_${data.slug}`} />}</div>
          </div>
        </section> : <ServicePriceSection serviceSlug={data.serviceSlug} initialLocation={cityName ?? undefined} />}

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        {sofaNew ? <section id="avaliacoes" className="scroll-mt-20 py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="O que dizem os nossos" goldWord="clientes" light={false} />
            <CustomerReviews reviews={pickReviewSubset(rugNew ? 'limpeza-tapetes' : 'limpeza-sofas', `${data.slug}-${citySlug}`, 6)} />
          </div>
        </section> : <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug={data.serviceSlug} seed={`${data.slug}-${citySlug}`} heading="" />
          </div>
        </section>}

        {/* Exemplos específicos, partilhados com as variantes por cidade. */}
        <MaterialExamplesGallery key={data.slug} materialSlug={data.slug} />

        {/* ═══ PROCESSO DE LIMPEZA ═══ */}
        {rugNew ? (
          <ServiceProcessStory key={data.slug} service="limpeza-tapetes" steps={processGuide?.steps.map(st => ({ label: st.label, description: st.description }))} heading={{ text: 'Como lavamos o seu', gold: data.name.toLowerCase() }} />
        ) : sofaNew && data.slug === 'limpeza-sofa-pele' ? (
          <LeatherProcessSection />
        ) : fabric && processGuide ? (
          <SofaProcessGuide key={data.slug} real steps={processGuide.steps.map(st => ({ label: st.label, description: st.description }))} heading={{ text: 'Como limpamos o seu', gold: data.name.toLowerCase() }} />
        ) : processGuide ? (
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
          sofaNew ? <CompactFAQ id="duvidas" faqs={data.faqs} heading={`Perguntas sobre ${data.name.toLowerCase()}`} /> : <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.name.toLowerCase()}`} variant="light" />
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
              offers: offerForPriceLabel(servicePrice),
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

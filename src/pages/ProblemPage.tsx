import DirectoryGroup from "@/components/DirectoryGroup";
import SofaLeadActions from "@/components/SofaLeadActions";
import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import {
  MapPin, Star, ArrowRight, AlertTriangle,
} from "lucide-react";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import { categoryForServiceSlug } from "@/data/beforeAfterPool";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { CATEGORY_TIPS, CATEGORY_STATS, splitTipsHeading } from "@/data/problemTipsData";
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

const WHEN_TO_CALL = [
  "A situação tem mais de 24 horas e produtos caseiros não surtiram efeito",
  "O odor persiste mesmo após arejar e usar neutralizadores domésticos",
  "O material é delicado (veludo, pele, linho) e não quer arriscar danos",
  "Envolve urina, sangue, mofo ou qualquer líquido orgânico",
  "Tentou limpar e a área aumentou ou a situação piorou",
  "Quer proteger o estofo com impermeabilização após a limpeza",
];

const PROCESS_STEPS = [
  { title: "Identificação do tecido", body: "Avaliamos o tipo de material e a extensão do problema antes de aplicar qualquer produto ou equipamento." },
  { title: "Pulverização",            body: "Aplicação de solução específica, adequada ao tecido identificado e ao problema a tratar." },
  { title: "Escovação",               body: "Escovagem para distribuir o produto e soltar a sujidade nas fibras, preparando para a extração." },
  { title: "Extração",                body: "Extração profissional a alta temperatura remove resíduos e sujidade das camadas mais profundas das fibras." },
];

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
            <h1 className="type-page-title font-playfair   text-[#111111] mb-4">Página não encontrada</h1>
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
  const categoryTips = CATEGORY_TIPS[data.category];
  const gallery = getServiceGallery(data.relatedServices[0], slug ?? "");
  const heroImg = getProblemHeroImage(slug ?? "");
  const beforeAfterCategory = categoryForServiceSlug(data.relatedServices[0]);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildProblemWaMessage(slug ?? ""))}`;
  const snapshotStats = CATEGORY_STATS[data.category] ?? CATEGORY_STATS.manchas;

  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  return (
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ═══ HERO + SNAPSHOT (fundo fotográfico contínuo) ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

        <section className="relative pt-16 md:pt-24 lg:pt-28 pb-16 md:pb-24">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <PageBreadcrumb items={[
                  { label: "Início", to: "/" },
                  { label: data.h1 },
                ]} />

                <div className="inline-flex items-start mb-3 lg:mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-sm font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      Como Resolver
                    </span>
                  </div>
                </div>

                <h1 className="type-page-title font-playfair      text-white mb-3 lg:mb-4 " style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  {h1Rest}{" "}<span style={{ color: "#D4AF37" }}>{h1Gold}</span>
                </h1>

                <p className="text-base sm:text-base md:text-lg text-white/70 leading-relaxed mb-4 lg:mb-6 max-w-lg line-clamp-2">
                  {data.intro.match(/^[^.?]*[.?]/)?.[0] ?? data.intro}
                </p>


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

        <ServiceSnapshotStats stats={snapshotStats} />
        </div>

        {/* ═══ QUANDO CHAMAR + PROCESSO — fundidas, fundo verde único ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Quando Agir" heading="Quando chamar um" goldWord="profissional" light={false} />
            <div className="grid sm:grid-cols-2 gap-px mb-16 md:mb-20" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {WHEN_TO_CALL.map((sign, idx) => (
                <div key={idx} className="relative overflow-hidden flex items-start gap-3.5 p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)" }}>
                    <AlertTriangle className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  </div>
                  <span className="text-base text-white/75 leading-relaxed pt-1.5">{sign}</span>
                </div>
              ))}
            </div>

            <SectionHeader overline="Processo" heading="Como tratamos este" goldWord="problema" light={false} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} className="relative overflow-hidden p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <span
                    className="absolute bottom-2 right-3 font-playfair font-bold leading-none select-none pointer-events-none"
                    style={{ fontSize: "5rem", color: "rgba(212,175,55,0.08)" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="relative text-base font-semibold text-white mb-1.5">{step.title}</p>
                  <p className="relative text-base text-white/80 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BENEFÍCIOS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Vantagens" heading="O que muda depois da nossa" goldWord="intervenção" light={true} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {data.benefits.map((benefit, idx) => (
                <div key={idx} className="relative overflow-hidden flex items-start gap-3 p-6 md:p-7 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                  <span
                    className="absolute bottom-2 right-3 font-playfair font-bold leading-none select-none pointer-events-none"
                    style={{ fontSize: "5rem", color: "rgba(212,175,55,0.1)" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="relative text-base text-[#505650] leading-relaxed">{benefit}</span>
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
                      <span className="font-black text-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(212,175,55,0.18)", color: "#D4AF37" }}>
                        {i + 1}
                      </span>
                      <p className="text-base text-white/70 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="flex items-start gap-3 p-4" style={{ backgroundColor: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                  <p className="text-sm text-white/80 leading-relaxed">{categoryTips.warning}</p>
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
            subtitle="Transformações visíveis no próprio dia. Sem químicos agressivos, sem esperas."
            slides={getIllustrativePhotos(data.relatedServices[0], slug ?? "")}
            variant="light"
          />
        )}

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.h1.toLowerCase()}`} variant="dark" />
        )}

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={true} />
            <ServiceReviewsGrid serviceSlug={data.relatedServices[0]} seed={data.slug} heading="" />
          </div>
        </section>

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Explore por categoria" heading="Serviços, soluções e" goldWord="localidades" light={true} />
            <div className="max-w-4xl border-t border-[#D4AF37]/25">
              {relatedServiceData.length > 0 && (
                <DirectoryGroup title={<>Serviços relacionados</>}>
                    {relatedServiceData.map(svc => (
                      <Link key={svc.slug} to={svc.baseRoute}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-base font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-base font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-base font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
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

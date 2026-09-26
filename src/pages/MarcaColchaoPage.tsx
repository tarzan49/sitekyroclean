import { buildQuoteWaMessage } from "@/lib/whatsappMessages";
import CommercialHero from "@/components/CommercialHero";
import DirectoryGroup from "@/components/DirectoryGroup";
import SofaLeadActions from "@/components/SofaLeadActions";
import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { XCircle, CheckCircle2, ArrowRight, Search, Droplets, Wind, ShieldCheck, Star, Clock, Timer } from "lucide-react";
import { GoogleG } from "@/components/icons/GoogleG";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import HeroBeforeAfterPool from "@/components/HeroBeforeAfterPool";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceFAQ from "@/components/ServiceFAQ";
import { getAllMarcaColchaoRoutes, getMarcaColchaoByCityAndSlug, marcasColchao } from "@/data/marcaColchaoData";
import { marcaPageCopy, otherMarcaLinks, MARCA_PROCESS_STEPS } from "@/data/marcaCities";
import { cityPrep } from "@/data/serviceCatalog";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { SERVICE_DURATION } from "@/constants/problemCardHelpers";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  offerForPriceLabel,
} from "@/lib/seoSchema";
import imgStd        from "@/assets/hero-p-limpeza-colchao-std.webp";
import imgAcaros     from "@/assets/hero-p-acaros-colchao.webp";
import imgAlergias   from "@/assets/hero-p-alergias-colchao.webp";
import imgHotel      from "@/assets/hero-p-limpeza-colchao-hotel.webp";
import heroColchao   from "@/assets/hero-colchao-v2.webp";
import galProcesso   from "@/assets/galeria-colchao-processo.webp";
import galResultado  from "@/assets/galeria-colchao-resultado.webp";

const MARCA_HERO: Record<string, string> = {
  "ikea":       imgStd,      // tecido quilted, núcleo espuma ou molas
  "conforama":  imgHotel,    // grande armazém, várias gamas
  "molaflex":   imgAcaros,   // tratamento anti-ácaros de fábrica
  "pikolin":    imgAlergias, // núcleo ortopédico, respirável
  "colmol":     heroColchao, // fibras naturais e recicladas
  "mindol":     heroColchao, // espuma e fibras naturais
};

// Texto dos passos em marcaCities.ts, o mesmo que o HTML estático escreve.
const PROCESS_ICONS = [Search, Droplets, ShieldCheck, Wind];
const PROCESS_STEPS = MARCA_PROCESS_STEPS.colchao.map((step, index) => ({ ...step, icon: PROCESS_ICONS[index] ?? Search, label: String(index + 1).padStart(2, "0") }));

const MarcaColchaoPage = () => {
  const { pathname } = useLocation();

  const data = useMemo(() => {
    const route = getAllMarcaColchaoRoutes().find(r => r.path === pathname);
    if (!route) return null;
    return getMarcaColchaoByCityAndSlug(route.marcaSlug, route.citySlug);
  }, [pathname]);

  const pageUrl = `${SITE_URL}${pathname}`;
  // Título, descrição, <h1>, migalha e preço: os mesmos que o scripts/prerender.ts
  // escreve no HTML estático (marcaPageCopy em marcaCities.ts).
  const copy = data ? marcaPageCopy('colchao', data.marca, data.city) : null;
  const pageTitle = copy?.title ?? '';
  const pageDesc = copy?.description ?? '';

  useEffect(() => {
    if (!data) return;
    document.title = pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", pageDesc);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", pageDesc);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", pageUrl);
  }, [pageTitle, pageDesc, pageUrl, data]);

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

  const { marca, city } = data;
  const pageCopy = copy!;
  const prep = cityPrep(city.name);
  const heroImg = MARCA_HERO[marca.slug] ?? heroColchao;

  // Resposta em menos de 10 minutos: compromisso comum a todo o site.

  const serviceDuration = SERVICE_DURATION['limpeza-colchoes'];
  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    { value: "<10min", label: "Respondemos em menos de 10 minutos", icon: Clock },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageNode({ url: pageUrl, name: pageTitle, description: pageDesc }),
      buildBreadcrumbNode(`${pageUrl}#breadcrumb`, [
        { name: "Início", item: `${SITE_URL}/` },
        { name: pageCopy.serviceName, item: `${SITE_URL}${pageCopy.serviceBaseRoute}` },
        { name: pageCopy.breadcrumbName, item: pageUrl },
      ]),
      buildServiceNode({
        url: pageUrl,
        name: pageCopy.h1,
        description: pageDesc,
        areaServed: { "@type": "City", name: city.name },
        // O preço de partida do serviço no motor, sem máximo inventado por marca.
        offers: offerForPriceLabel(pageCopy.priceFrom, { areaServed: { "@type": "City", name: city.name } }),
      }),
    ],
  };

  return (
    <QuizLocationProvider value={city.name}>
    <QuizServiceProvider value="mattress">
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header />
      <main>

        <CommercialHero title={pageCopy.h1} serviceSlug="limpeza-colchoes" city={city.name} price={pageCopy.priceFrom} breadcrumbs={[{ label: "Início", to: "/" }, { label: pageCopy.serviceName, to: pageCopy.serviceBaseRoute }, { label: pageCopy.breadcrumbName }]} image={heroImg} whatsappHref={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildQuoteWaMessage(`Olá! Gostaria de pedir um orçamento para limpeza de colchão ${marca.name} ${prep} ${city.name}.`))}`} source={`marca_hero_${marca.slug}`} />

        {/* ═══ ORÇAMENTO (primeira secção a seguir ao hero) ═══ */}
        <ServicePriceSection serviceSlug="limpeza-colchoes" initialLocation={city.name} />

        {/* ═══ MATERIAL: NÃO FAZER / FAZER ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Material"
              heading="O que saber sobre o colchão"
              goldWord={marca.name}
              subtitle={marca.materialDescription}
              light={false}
            />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-5" style={{ color: "#D4AF37" }}>
              {marca.material}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {marca.doNots.map((doNot, i) => (
                <div key={`no-${i}`} className="flex items-start gap-3 p-6 md:p-7 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(239,68,68,0.35)" }}>
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                  <span className="text-sm text-white/70 leading-relaxed">{doNot}</span>
                </div>
              ))}
              {marca.doThis.map((doThis, i) => (
                <div key={`yes-${i}`} className="relative flex items-start gap-3 p-6 md:p-7 rounded-xl" style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1.5px solid #D4AF37", boxShadow: "0 0 24px rgba(212,175,55,0.15)" }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                  <span className="text-sm text-white/90 leading-relaxed font-medium">{doThis}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PROCESSO ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Como Trabalhamos"
              heading="O nosso processo de limpeza para o"
              goldWord={marca.name}
              subtitle={marca.cleaningProcess}
            />
            <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {PROCESS_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="relative overflow-hidden flex items-start gap-4 p-6 md:p-7 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)" }}>
                      <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111] mb-1">{step.title}</p>
                      <p className="text-xs text-[#111111]/55 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ GALERIA ILUSTRATIVA (o antes/depois já está no hero) ═══ */}
        <ServiceAutoCarousel
          comparison={false}
          overline="Resultados Reais"
          heading={`Antes e depois: colchão ${marca.name}`}
          subtitle={`Transformação real em limpeza de colchões ${prep} ${city.name}, resultado visível no próprio dia.`}
          slides={[
            { src: galProcesso, label: "Processo" },
            { src: galResultado, label: "Resultado" },
          ]}
          variant="dark"
        />

        {/* ═══ FAQ ═══ */}
        <ServiceFAQ
          faqs={marca.faqs}
          heading={`Perguntas sobre colchões ${marca.name}`}
          variant="dark"
        />

        {/* ═══ OUTRAS MARCAS / COBERTURA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Mais Opções"
              heading={`Outras marcas que limpamos ${prep}`}
              goldWord={city.name}
              subtitle={`Veja também a tabela completa de tamanhos e preços de limpeza de colchões ${prep} ${city.name}.`}
            />
            <Link
              to={pageCopy.cityServiceHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 hover:underline"
              style={{ color: "#D4AF37" }}
            >
              {pageCopy.cityServiceLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <DirectoryGroup title="Outras marcas de colchões">
              {otherMarcaLinks('colchao', marcasColchao, marca.slug, city.slug).map(link => (
                  <Link key={link.href} to={link.href}
                    className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all">
                    <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                    {link.label}
                  </Link>
                ))}
            </DirectoryGroup>
          </div>
        </section>

      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default MarcaColchaoPage;

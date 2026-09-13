import DirectoryGroup from "@/components/DirectoryGroup";
import SofaLeadActions from "@/components/SofaLeadActions";
import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { XCircle, CheckCircle2, ArrowRight, Search, Droplets, Wind, ShieldCheck, Star, Euro, Clock, Timer } from "lucide-react";
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
import { getAllMarcaColchaoRoutes, getMarcaColchaoByCityAndSlug } from "@/data/marcaColchaoData";
import { cityPrep } from "@/data/locationSeoData";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { SERVICE_DURATION } from "@/constants/problemCardHelpers";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
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

const PROCESS_STEPS = [
  { icon: Search,      label: "01", title: "Inspeção do colchão", desc: "Avaliação do tipo de núcleo (espuma ou molas), tecido exterior e manchas antes de qualquer intervenção." },
  { icon: Droplets,    label: "02", title: "Pré-tratamento", desc: "Aplicação de produto específico para dissolver manchas e sujidade incrustada no tecido acolchoado." },
  { icon: ShieldCheck, label: "03", title: "Extração profissional", desc: "Vapor de baixa humidade calibrado ao núcleo interior, com tratamento anti-ácaros certificado." },
  { icon: Wind,        label: "04", title: "Secagem e verificação", desc: "Ventilação assistida e inspeção final antes de o colchão voltar a estar pronto a usar." },
];

const MarcaColchaoPage = () => {
  const { pathname } = useLocation();

  const data = useMemo(() => {
    const route = getAllMarcaColchaoRoutes().find(r => r.path === pathname);
    if (!route) return null;
    return getMarcaColchaoByCityAndSlug(route.marcaSlug, route.citySlug);
  }, [pathname]);

  const pageUrl = `${SITE_URL}${pathname}`;
  const pageTitle = data ? `Limpeza Colchão ${data.marca.name} ${cityPrep(data.city.name)} ${data.city.name}, Especialistas | Kyro Clean` : '';
  const pageDesc = data ? `Especialistas em limpeza de colchões ${data.marca.name} ${cityPrep(data.city.name)} ${data.city.name}. ${data.marca.material}. ${data.marca.estimatedPriceRange}. Serviço ao domicílio.` : '';

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
            <h1 className="type-page-title font-playfair   text-[#111111] mb-4">Página não encontrada</h1>
            <Link to="/" style={{ color: "#D4AF37" }} className="hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { marca, city } = data;
  const prep = cityPrep(city.name);
  const heroImg = MARCA_HERO[marca.slug] ?? heroColchao;

  // Resposta em menos de 10 minutos: compromisso comum a todo o site.

  const serviceDuration = SERVICE_DURATION['limpeza-colchoes'];
  const snapshotStats = [
    { value: `${REVIEW_RATING}★`, label: `+${REVIEW_COUNT} avaliações Google`, icon: GoogleG },
    { value: `${marca.minPrice}€`, label: `Desde, ${prep} ${city.name}`, icon: Euro },
    { value: serviceDuration.value, label: serviceDuration.label, icon: Timer },
    { value: "<10min", label: "Respondemos em menos de 10 minutos", icon: Clock },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageNode({ url: pageUrl, name: pageTitle, description: pageDesc }),
      buildBreadcrumbNode(`${pageUrl}#breadcrumb`, [
        { name: "Início", item: `${SITE_URL}/` },
        { name: "Limpeza de Colchões", item: `${SITE_URL}/limpeza-colchoes` },
        { name: `Colchão ${marca.name} ${prep} ${city.name}`, item: pageUrl },
      ]),
      buildServiceNode({
        url: pageUrl,
        name: `Limpeza de Colchão ${marca.name} ${prep} ${city.name}`,
        description: pageDesc,
        areaServed: { "@type": "City", name: city.name },
        offers: {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "areaServed": { "@type": "City", "name": city.name },
          "priceSpecification": {
            "@type": "PriceSpecification",
            "minPrice": String(marca.minPrice),
            "maxPrice": String(marca.maxPrice),
            "priceCurrency": "EUR",
          },
        },
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

        {/* ═══ HERO + SNAPSHOT (fundo fotográfico contínuo) ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt={pageTitle} className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.90) 78%, rgba(7,26,18,0.97) 100%)" }} />

          <section className="relative pt-16 md:pt-24 lg:pt-28 pb-16 md:pb-24">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <PageBreadcrumb items={[
                    { label: "Início", to: "/" },
                    { label: "Limpeza de Colchões", to: "/limpeza-colchoes" },
                    { label: `${marca.name}, ${city.name}` },
                  ]} />

                  <div className="inline-flex items-start mb-3 lg:mb-5">
                    <div className="flex flex-col gap-1">
                      <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                      <span
                        className="text-sm font-bold text-gold/90 tracking-[0.30em] uppercase"
                        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                      >
                        Especialistas em {marca.name}
                      </span>
                    </div>
                  </div>

                  <h1
                    className="type-page-title font-playfair      text-white mb-3 lg:mb-4 "
                    style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
                  >
                    Limpeza de Colchão {marca.name} {prep} {city.name}
                  </h1>

                  <p className="text-base sm:text-base md:text-lg text-white/70 leading-relaxed mb-4 lg:mb-6 max-w-lg">
                    {marca.materialDescription.split('.')[0]}.
                  </p>


                  <SofaLeadActions
                    city={city.name}
                    price={`${marca.minPrice}€`}
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(`Olá! Gostaria de pedir um orçamento para limpeza do meu colchão ${marca.name} ${prep} ${city.name}.`)}`}
                    source={`marca_colchao_hero_${marca.slug}`}
                  />
                </div>

                <div className="mt-8 lg:mt-0">
                  <div className="relative">
                    <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                    <div className="relative shadow-2xl" style={{ borderTop: "2px solid #D4AF37" }}>
                      <HeroBeforeAfterPool category="colchao" className="w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ServiceSnapshotStats stats={snapshotStats} />
        </div>

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
            <p className="text-sm font-bold tracking-[0.08em] uppercase mb-5" style={{ color: "#D4AF37" }}>
              {marca.material}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {marca.doNots.map((doNot, i) => (
                <div key={`no-${i}`} className="flex items-start gap-3 p-6 md:p-7 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(239,68,68,0.35)" }}>
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                  <span className="text-base text-white/70 leading-relaxed">{doNot}</span>
                </div>
              ))}
              {marca.doThis.map((doThis, i) => (
                <div key={`yes-${i}`} className="relative flex items-start gap-3 p-6 md:p-7 rounded-xl" style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1.5px solid #D4AF37", boxShadow: "0 0 24px rgba(212,175,55,0.15)" }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                  <span className="text-base text-white/90 leading-relaxed font-medium">{doThis}</span>
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
                      <p className="text-base font-semibold text-[#111111] mb-1">{step.title}</p>
                      <p className="text-sm text-[#505650] leading-relaxed">{step.desc}</p>
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
              heading="Outras marcas que limpamos em"
              goldWord={city.name}
              subtitle={`Veja também a tabela completa de tamanhos e preços de limpeza de colchões ${prep} ${city.name}.`}
            />
            <Link
              to={`/limpeza-colchoes-${city.slug}`}
              className="inline-flex items-center gap-1.5 text-base font-semibold mb-8 hover:underline"
              style={{ color: "#D4AF37" }}
            >
              Ver todos os tamanhos e preços em {city.name}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <DirectoryGroup title="Outras marcas de colchões">
              {["ikea", "conforama", "molaflex", "pikolin", "colmol", "mindol"]
                .filter(slug => slug !== marca.slug)
                .map(slug => (
                  <Link key={slug} to={`/limpeza-colchao-${slug}-${city.slug}`}
                    className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-base font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all capitalize">
                    <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                    {slug.replace(/-/g, " ")}
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

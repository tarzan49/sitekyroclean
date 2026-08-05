import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { XCircle, CheckCircle2, ArrowRight, Search, ShieldCheck, Droplets, Wind, MessageCircle, Phone, Star, Euro, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import SectionHeader from "@/components/SectionHeader";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceFAQ from "@/components/ServiceFAQ";
import { getAllMarcaSofaRoutes, getMarcaByCityAndSlug } from "@/data/marcaSofaData";
import { cityPrep } from "@/data/locationSeoData";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { trackCallClick } from "@/lib/analytics";
import { SITE_URL, WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
} from "@/lib/seoSchema";
import imgPele        from "@/assets/hero-p-limpeza-sofa-pele.webp";
import imgVeludo      from "@/assets/hero-p-limpeza-sofa-veludo.webp";
import imgTecido      from "@/assets/hero-p-limpeza-sofa-tecido.webp";
import imgMicrofibra  from "@/assets/hero-p-sofa-microfibras.webp";
import imgHotel       from "@/assets/hero-p-limpeza-sofa-hotel.webp";
import imgChenille    from "@/assets/hero-p-sofa-chenille.webp";
import imgStd         from "@/assets/hero-p-limpeza-sofa-std.webp";
import heroSofa       from "@/assets/hero-sofa-cleaning-new.webp";
import galAntes      from "@/assets/galeria-sofa-antes.webp";
import galDepois     from "@/assets/galeria-sofa-depois.webp";
import galProcesso   from "@/assets/galeria-sofa-processo.webp";
import galResultado  from "@/assets/galeria-sofa-resultado.webp";

const MARCA_HERO: Record<string, string> = {
  "natuzzi":         imgPele,       // couro genuíno italiano
  "roche-bobois":    imgHotel,      // design premium / ultra-luxo
  "el-corte-ingles": imgHotel,      // grande armazém premium
  "kave-home":       imgVeludo,     // veludo, boucle e linho
  "ikea":            imgMicrofibra, // microfibra e algodão
  "leroy-merlin":    imgTecido,     // tecido e couro sintético
  "conforama":       imgChenille,   // tecido de alta qualidade
  "moviflor":        imgStd,        // poliéster e tecido resistente
};

const PROCESS_STEPS = [
  { icon: Search,      label: "01", title: "Inspeção do tecido", desc: "Avaliação do material, estado das fibras e manchas antes de qualquer intervenção." },
  { icon: Droplets,    label: "02", title: "Pré-tratamento", desc: "Aplicação de produto específico para dissolver manchas e sujidade incrustada." },
  { icon: ShieldCheck, label: "03", title: "Extração profissional", desc: "Limpeza em profundidade com equipamento de vapor e água quente calibrado ao tecido." },
  { icon: Wind,        label: "04", title: "Verificação final", desc: "Inspecção do resultado, escovagem e recolocação das almofadas." },
];

const MarcaSofaPage = () => {
  const { pathname } = useLocation();

  const data = useMemo(() => {
    const route = getAllMarcaSofaRoutes().find(r => r.path === pathname);
    if (!route) return null;
    return getMarcaByCityAndSlug(route.marcaSlug, route.citySlug);
  }, [pathname]);

  const pageUrl = `${SITE_URL}${pathname}`;
  const pageTitle = data ? `Limpeza Sofá ${data.marca.name} ${cityPrep(data.city.name)} ${data.city.name}, Especialistas | Kyro Clean` : '';
  const pageDesc = data ? `Especialistas em limpeza de sofás ${data.marca.name} ${cityPrep(data.city.name)} ${data.city.name}. ${data.marca.material}. ${data.marca.estimatedPriceRange}. Serviço ao domicílio.` : '';

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
  const prep = cityPrep(city.name);
  const heroImg = MARCA_HERO[marca.slug] ?? heroSofa;

  const snapshotStats = [
    { value: "5.0 ★", label: "Avaliação Google", icon: Star },
    { value: `${marca.minPrice}€`, label: `Desde, ${prep} ${city.name}`, icon: Euro },
    { value: "2-4h", label: "Tempo de secagem", icon: Clock },
    { value: "30min", label: "Tempo de resposta", icon: Clock },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageNode({ url: pageUrl, name: pageTitle, description: pageDesc }),
      buildBreadcrumbNode(`${pageUrl}#breadcrumb`, [
        { name: "Início", item: `${SITE_URL}/` },
        { name: "Limpeza de Sofás", item: `${SITE_URL}/limpeza-sofas` },
        { name: `Sofá ${marca.name} ${prep} ${city.name}`, item: pageUrl },
      ]),
      buildServiceNode({
        url: pageUrl,
        name: `Limpeza de Sofá ${marca.name} ${prep} ${city.name}`,
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
    <QuizServiceProvider value="sofa">
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

          <section className="relative pt-24 md:pt-28 pb-16 md:pb-24">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                    <span>/</span>
                    <Link to="/limpeza-sofas" className="hover:text-white/80 transition-colors">Limpeza de Sofás</Link>
                    <span>/</span>
                    <span className="text-white/70">{marca.name}, {city.name}</span>
                  </nav>

                  <div className="inline-flex items-start mb-5">
                    <div className="flex flex-col gap-1">
                      <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                      <span
                        className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase"
                        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                      >
                        Especialistas em {marca.name}
                      </span>
                    </div>
                  </div>

                  <h1
                    className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]"
                    style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
                  >
                    Limpeza de Sofá {marca.name} {prep} {city.name}
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                    {marca.materialDescription.split('.')[0]}.
                  </p>

                  <div className="mb-6">
                    <TrustRatingBadge variant="mapsLinkClients" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                    <QuizButton
                      className="flex-1"
                      buttonClassName="h-[58px] md:h-[52px] !py-0 w-full"
                      ctaLabel="Calcular o meu preço"
                      initialLocation={city.name}
                      initialService="sofa"
                    />
                    <div className="relative group flex-1">
                      <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                      <a
                        href={`${WHATSAPP_BASE}?text=${encodeURIComponent(`Olá! Gostaria de pedir um orçamento para limpeza do meu sofá ${marca.name} ${prep} ${city.name}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackWhatsAppClick(`marca_hero_${marca.slug}`)}
                        className="relative flex items-center justify-center gap-2 w-full h-[58px] md:h-[52px] px-6 font-bold text-white touch-manipulation bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-150"
                      >
                        <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                        <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  <a
                    href={`tel:${PHONE_TEL}`}
                    onClick={() => trackCallClick('marca_sofa_hero_mobile')}
                    className="md:hidden flex items-center gap-1.5 text-white/45 text-xs mt-4 hover:text-white/70 transition-colors"
                  >
                    <Phone className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                    Prefere ligar? {PHONE_DISPLAY}
                  </a>

                  <p className="text-white/40 text-xs mt-4">Desde {marca.minPrice}€ · Orçamento gratuito · Sem compromisso</p>
                </div>

                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                    <img
                      src={heroImg}
                      alt={`Limpeza de sofá ${marca.name} ${prep} ${city.name}`}
                      className="relative w-full max-h-[440px] object-cover shadow-2xl"
                      style={{ borderTop: "2px solid #D4AF37" }}
                      loading="eager"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ServiceSnapshotStats stats={snapshotStats} />
        </div>

        {/* ═══ ORÇAMENTO (primeira secção a seguir ao hero) ═══ */}
        <ServicePriceSection serviceSlug="limpeza-sofas" initialLocation={city.name} />

        {/* ═══ MATERIAL: NÃO FAZER / FAZER ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Material"
              heading="O que saber sobre o tecido"
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

        {/* ═══ GALERIA — ANTES E DEPOIS ═══ */}
        <ServiceAutoCarousel
          overline="Resultados Reais"
          heading={`Antes e depois: sofá ${marca.name}`}
          subtitle={`Transformação real em limpeza de sofás ${prep} ${city.name}, resultado visível no próprio dia.`}
          beforeImage={galAntes}
          afterImage={galDepois}
          slides={[
            { src: galProcesso, label: "Processo" },
            { src: galResultado, label: "Resultado" },
          ]}
          variant="dark"
        />

        {/* ═══ FAQ ═══ */}
        <ServiceFAQ
          faqs={marca.faqs}
          heading={`Perguntas sobre sofás ${marca.name}`}
          variant="light"
        />

        {/* ═══ OUTRAS MARCAS / COBERTURA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Mais Opções"
              heading="Outras marcas que limpamos em"
              goldWord={city.name}
              subtitle={`Veja também a tabela completa de materiais e preços de limpeza de sofás ${prep} ${city.name}.`}
            />
            <Link
              to={`/limpeza-sofas-${city.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 hover:underline"
              style={{ color: "#D4AF37" }}
            >
              Ver todos os materiais e preços em {city.name}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex flex-wrap gap-2">
              {["ikea", "natuzzi", "kave-home", "leroy-merlin", "moviflor", "conforama", "el-corte-ingles", "roche-bobois"]
                .filter(slug => slug !== marca.slug)
                .map(slug => (
                  <Link key={slug} to={`/limpeza-sofa-${slug}-${city.slug}`}
                    className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all capitalize">
                      <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {slug.replace(/-/g, " ")}
                    </Link>
                  ))}
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

export default MarcaSofaPage;

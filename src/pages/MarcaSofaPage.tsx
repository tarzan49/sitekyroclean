import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { XCircle, ArrowRight, Search, Sparkles, Droplets, Wind, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import { getAllMarcaSofaRoutes, getMarcaByCityAndSlug } from "@/data/marcaSofaData";
import { cityPrep } from "@/data/locationSeoData";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
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
  { icon: Search,    label: "01", title: "Inspeção do tecido", desc: "Avaliação do material, estado das fibras e manchas antes de qualquer intervenção." },
  { icon: Droplets,  label: "02", title: "Pré-tratamento", desc: "Aplicação de produto específico para dissolver manchas e sujidade incrustada." },
  { icon: Sparkles,  label: "03", title: "Extração profissional", desc: "Limpeza em profundidade com equipamento de vapor e água quente calibrado ao tecido." },
  { icon: Wind,      label: "04", title: "Verificação final", desc: "Inspecção do resultado, escovagem e recolocação das almofadas." },
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

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-14 md:pb-20 overflow-hidden bg-checker-dark">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={MARCA_HERO[marca.slug] ?? heroSofa} alt={pageTitle} className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-white/80">Início</Link>
                <span>/</span>
                <Link to="/limpeza-sofas" className="hover:text-white/80">Limpeza de Sofás</Link>
                <span>/</span>
                <span className="text-white/70">Sofá {marca.name}, {city.name}</span>
              </nav>

              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-5" style={{ color: "#D4AF37" }}>Especialistas em {marca.name}</p>

              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Limpeza de Sofá {marca.name} {prep} {city.name}
              </h1>

              <div className="w-10 h-px mb-5 opacity-50" style={{ backgroundColor: "#D4AF37" }} />

              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-2xl">
                {marca.materialDescription}
              </p>

              {/* Price + Stars inline */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="text-sm font-bold" style={{ color: "#D4AF37" }}>{marca.estimatedPriceRange}</span>
                <TrustRatingBadge variant="compact" />
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative group flex-1 sm:flex-none">
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                  <QuizButton className="w-full" buttonClassName="h-[52px] !py-0 w-full" initialLocation={city.name} initialService="sofa" />
                </div>
                <div className="relative group flex-1 sm:flex-none">
                  <div className="absolute -inset-1.5 rounded-full bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                  <a
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(`Olá! Gostaria de pedir um orçamento para limpeza do meu sofá ${marca.name} ${prep} ${city.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`marca_hero_${marca.slug}`)}
                    className={[
                      'relative flex items-center justify-center gap-2 w-full rounded-full font-bold text-white touch-manipulation',
                      'bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851]',
                      'shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                      'hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)]',
                      'hover:scale-[1.025] active:scale-[0.95]',
                      'active:shadow-[0_2px_8px_rgba(37,211,102,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                      'transition-all duration-150',
                      'px-8 py-3 text-sm',
                    ].join(' ')}
                  >
                    <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                    <span className="tracking-wide">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MATERIAL + DO NOTS ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Material</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-8">
                O que saber sobre o tecido {marca.name}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Material badge + description */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E4DE]">
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>{marca.material}</p>
                  <p className="text-sm md:text-base text-[#111111]/60 leading-relaxed">
                    {marca.materialDescription}
                  </p>
                </div>

                {/* Do Nots */}
                <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ background: "#071a12", borderColor: "rgba(212,175,55,0.2)" }}>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#D4AF37" }}>Atenção</p>
                  <h3 className="font-playfair text-lg font-bold text-white mb-4">O que NÃO fazer</h3>
                  <ul className="space-y-3">
                    {marca.doNots.map((doNot, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                        <span className="text-sm text-white/70">{doNot}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROCESSO STANDARD ═══ */}
        <section className="py-12 md:py-16 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Como trabalhamos</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-8">
                O nosso processo de limpeza
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {PROCESS_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
                          <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em]" style={{ color: "#D4AF37" }}>{step.label}</span>
                      </div>
                      <h3 className="font-semibold text-white text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-white/55 leading-relaxed">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Perguntas</p>
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-8 text-center">
                Perguntas sobre Sofás {marca.name}
              </h2>
              <ServiceFAQSchema faqs={marca.faqs} />
              <Accordion type="single" collapsible className="space-y-4">
                {marca.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}
                    className="bg-white rounded-[18px] shadow-sm hover:shadow-md border border-[#E8E4DE] px-6 transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-[#D4AF37]/30">
                    <AccordionTrigger className="text-left text-base font-semibold text-[#111111] py-5 hover:no-underline [&[data-state=open]>svg]:text-[#D4AF37]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[#111111]/60 pb-5 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-10 md:py-14 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>Kyro Clean Solutions</p>
            <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-3">
              Peça orçamento para o seu sofá {marca.name} {prep} {city.name}
            </h2>
            <p className="text-white/60 mb-6">
              {marca.estimatedPriceRange} · Resposta em menos de 30 minutos
            </p>
            <div className="flex gap-3 justify-center w-full max-w-sm mx-auto">
              <div className="relative group flex-1">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                <QuizButton className="w-full" initialLocation={city.name} initialService="sofa" />
              </div>
              <div className="relative group flex-1">
                <div className="absolute -inset-1.5 rounded-full bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                <a
                  href={`${WHATSAPP_BASE}?text=${encodeURIComponent(`Olá! Gostaria de pedir um orçamento para limpeza do meu sofá ${marca.name} em ${city.name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(`marca_cta_${marca.slug}`)}
                  className={[
                    'relative flex items-center justify-center gap-2 w-full rounded-full font-bold text-white touch-manipulation',
                    'bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851]',
                    'shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                    'hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)]',
                    'hover:scale-[1.025] active:scale-[0.95]',
                    'active:shadow-[0_2px_8px_rgba(37,211,102,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                    'transition-all duration-150',
                    'px-8 py-3 text-sm',
                  ].join(' ')}
                >
                  <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                  <span className="tracking-wide">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ OUTRAS MARCAS ═══ */}
        <section className="py-10 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 pb-5 border-b border-[#E8E4DE]">
                <p className="text-xs text-[#111111]/50 mb-2">Serviço completo de limpeza de sofás:</p>
                <Link
                  to={`/limpeza-sofas-${city.slug}`}
                  className="text-sm font-semibold text-[#D4AF37] hover:underline"
                >
                  Limpeza de Sofás em {city.name}: Ver todos os materiais e preços
                </Link>
              </div>
              <h3 className="font-playfair text-lg font-bold text-[#111111] mb-4">Outras marcas que limpamos em {city.name}</h3>
              <div className="flex flex-wrap gap-2">
                {["ikea", "natuzzi", "kave-home", "leroy-merlin", "moviflor", "conforama", "el-corte-ingles", "roche-bobois"]
                  .filter(slug => slug !== marca.slug)
                  .map(slug => (
                    <Link key={slug} to={`/limpeza-sofa-${slug}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all capitalize">
                      <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {slug.replace(/-/g, " ")}
                    </Link>
                  ))}
              </div>
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

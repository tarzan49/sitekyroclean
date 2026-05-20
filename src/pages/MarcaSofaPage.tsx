import { useMemo, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle, XCircle, Star, ArrowRight, Search, Sparkles, Droplets, Wind, Phone, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { getAllMarcaSofaRoutes, getMarcaByCityAndSlug } from "@/data/marcaSofaData";
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

  if (!data) {
    return (
      <>
        <Header />
        <main className="pt-28 pb-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-playfair text-3xl font-bold text-[#1A1A2E] mb-4">Página não encontrada</h1>
            <Link to="/" style={{ color: "#D4AF37" }} className="hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { marca, city } = data;
  const pageUrl = `https://cleansolutions.com.pt${pathname}`;
  const pageTitle = `Limpeza Sofá ${marca.name} em ${city.name}, Especialistas | Kyro Clean`;
  const pageDesc = `Especialistas em limpeza de sofás ${marca.name} em ${city.name}. ${marca.material}. ${marca.estimatedPriceRange}. Serviço ao domicílio.`;

  useEffect(() => {
    document.title = pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", pageDesc);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", pageDesc);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", pageUrl);
  }, [pageTitle, pageDesc, pageUrl]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": pageTitle,
        "description": pageDesc,
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": "https://cleansolutions.com.pt/#website" },
        "publisher": { "@id": "https://cleansolutions.com.pt/#business" },
        "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://cleansolutions.com.pt/" },
          { "@type": "ListItem", "position": 2, "name": "Limpeza de Sofás", "item": "https://cleansolutions.com.pt/limpeza-sofas" },
          { "@type": "ListItem", "position": 3, "name": `Sofá ${marca.name} em ${city.name}`, "item": pageUrl },
        ],
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        "name": `Limpeza de Sofá ${marca.name} em ${city.name}`,
        "description": pageDesc,
        "url": pageUrl,
        "provider": { "@id": "https://cleansolutions.com.pt/#business" },
        "areaServed": { "@type": "City", "name": city.name },
        "offers": {
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
      },
      {
        "@type": "FAQPage",
        "mainEntity": marca.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
        })),
      },
    ],
  };

  return (
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
                Limpeza de Sofá {marca.name} em {city.name}
              </h1>

              <div className="w-10 h-px mb-5 opacity-50" style={{ backgroundColor: "#D4AF37" }} />

              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-2xl">
                {marca.materialDescription}
              </p>

              {/* Price + Stars inline */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="text-sm font-bold" style={{ color: "#D4AF37" }}>{marca.estimatedPriceRange}</span>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                  <span className="text-sm text-white/60 ml-1">5.0 · 50+ avaliações</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <QuizButton />
                <a href="https://wa.me/351925530647" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 rounded-full text-white/75 font-medium text-sm hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200">
                  <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />
                  WhatsApp
                </a>
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
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-8">
                O que saber sobre o tecido {marca.name}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Material badge + description */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E4DE]">
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>{marca.material}</p>
                  <p className="text-sm md:text-base text-[#1A1A2E]/60 leading-relaxed">
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
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-8 text-center">
                Perguntas sobre Sofás {marca.name}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {marca.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}
                    className="bg-white rounded-[18px] shadow-sm hover:shadow-md border border-[#E8E4DE] px-6 transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-[#D4AF37]/30">
                    <AccordionTrigger className="text-left text-base font-semibold text-[#1A1A2E] py-5 hover:no-underline [&[data-state=open]>svg]:text-[#D4AF37]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[#1A1A2E]/60 pb-5 leading-relaxed">
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
              Peça orçamento para o seu sofá {marca.name} em {city.name}
            </h2>
            <p className="text-white/60 mb-6">
              {marca.estimatedPriceRange} · Resposta em menos de 2 horas
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <QuizButton />
              <a href="https://wa.me/351925530647" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 rounded-full text-white/75 font-medium text-sm hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200">
                <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />
                WhatsApp
              </a>
              <a href="tel:+351925530647"
                className="inline-flex items-center gap-1.5 text-white/75 hover:text-gold font-medium text-sm transition-colors duration-150">
                <Phone className="w-3.5 h-3.5 text-gold animate-phone-shake flex-shrink-0" strokeWidth={2.5} />
                <span className="font-bold tracking-wide">Ligar agora</span>
              </a>
            </div>
          </div>
        </section>

        {/* ═══ OUTRAS MARCAS ═══ */}
        <section className="py-10 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="font-playfair text-lg font-bold text-[#1A1A2E] mb-4">Outras marcas que limpamos em {city.name}</h3>
              <div className="flex flex-wrap gap-2">
                {["ikea", "natuzzi", "kave-home", "leroy-merlin", "moviflor", "conforama", "el-corte-ingles", "roche-bobois"]
                  .filter(slug => slug !== marca.slug)
                  .map(slug => (
                    <Link key={slug} to={`/limpeza-sofa-${slug}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all capitalize">
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
  );
};

export default MarcaSofaPage;

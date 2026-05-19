import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, MapPin, CheckCircle, Search, Droplets, Sparkles, Wind, Phone, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import {
  getMaterialBySlug,
  getAllMaterialCityRoutes,
  getMaterialCityData,
  getRelatedMaterialLinks,
} from "@/data/materialSeoData";
import { cities, services } from "@/data/locationSeoData";
import heroSofa          from "@/assets/hero-sofa-cleaning-new.webp";
import heroRug           from "@/assets/hero-rug-cleaning-new.webp";
import heroCarpet        from "@/assets/hero-carpet-cleaning-new.webp";
import sofaProcesso      from "@/assets/galeria-sofa-processo.webp";
import sofaResultado     from "@/assets/galeria-sofa-resultado.webp";
import sofaAntes         from "@/assets/galeria-sofa-antes.webp";

const MATERIAL_HERO: Record<string, string> = {
  "limpeza-sofa-tecido":      sofaProcesso,
  "limpeza-sofa-veludo":      sofaAntes,
  "limpeza-sofa-pele":        sofaResultado,
  "limpeza-sofa-microfibra":  heroSofa,
  "limpeza-sofa-linho":       heroSofa,
  "limpeza-sofa-camurca":     sofaAntes,
  "limpeza-sofa-sintetico":   heroSofa,
  "limpeza-tapete-la":        heroRug,
  "limpeza-tapete-persa":     heroRug,
  "limpeza-tapete-sintetico": heroCarpet,
  "limpeza-tapete-sisal":     heroCarpet,
};

const STEP_ICONS = [Search, Droplets, Sparkles, Wind];

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

  const servicePrice = useMemo(() => {
    if (!data) return "39€";
    return services.find(s => s.slug === data.serviceSlug)?.priceFrom ?? "39€";
  }, [data]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", data.metaDescription);
      const canonicalUrl = isCityVariant
        ? `https://www.cleansolutions.com.pt/${data.serviceSlug}-${citySlug}`
        : `https://www.cleansolutions.com.pt${pathname}`;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", canonicalUrl);
    }
  }, [pathname, data, isCityVariant, citySlug]);

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

  const relatedLinks = getRelatedMaterialLinks(data.relatedMaterials);
  const topCities = cities.slice(0, 8);

  // "Sofá em Veludo" → "sofá de veludo"
  const materialLabel = data.name.toLowerCase().replace(" em ", " de ");

  return (
    <>
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-14 md:pb-20 overflow-hidden bg-checker-dark">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img
              src={MATERIAL_HERO[data.slug] ?? heroSofa}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                <span>/</span>
                <Link to={`/${data.serviceSlug}`} className="hover:text-white/80 transition-colors">{data.serviceName}</Link>
                <span>/</span>
                <span className="text-white/70">{data.name}{cityName ? ` — ${cityName}` : ""}</span>
              </nav>

              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                {data.serviceName}
              </p>

              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                {data.h1}{cityName ? ` em ${cityName}` : ""}
              </h1>

              <div className="w-10 h-px mb-5 opacity-50" style={{ backgroundColor: "#D4AF37" }} />

              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-2xl">
                {data.intro}
              </p>

              {/* Price + Stars */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="text-sm font-bold" style={{ color: "#D4AF37" }}>Desde {servicePrice}</span>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="#D4AF37" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                  <span className="text-sm text-white/60 ml-1">5.0 · 50+ avaliações</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <QuizButton />
                <a
                  href="https://wa.me/351925530647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 rounded-full text-white/75 font-medium text-sm hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200"
                >
                  <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MATERIAL + DICAS ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Material</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-8">
                O que saber sobre {materialLabel}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Características */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E4DE]">
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#D4AF37" }}>Características</p>
                  <h3 className="font-playfair text-lg font-bold text-[#1A1A2E] mb-4">Como é este material</h3>
                  <ul className="space-y-3">
                    {data.characteristics.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                        <span className="text-sm text-[#1A1A2E]/60">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dicas de manutenção */}
                <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ background: "#071a12", borderColor: "rgba(212,175,55,0.2)" }}>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#D4AF37" }}>Manutenção</p>
                  <h3 className="font-playfair text-lg font-bold text-white mb-4">Dicas de cuidado</h3>
                  <ul className="space-y-3">
                    {data.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                        <span className="text-sm text-white/70">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROCESSO ═══ */}
        <section className="py-12 md:py-16 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Como trabalhamos</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-8">
                Processo de limpeza para {materialLabel}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.cleaningProcess.map((step, i) => {
                  const Icon = STEP_ICONS[i] ?? Sparkles;
                  const label = String(i + 1).padStart(2, "0");
                  return (
                    <div key={i} className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
                          <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.2em]" style={{ color: "#D4AF37" }}>{label}</span>
                      </div>
                      <p className="text-sm text-white/75 leading-relaxed">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <section className="py-12 md:py-16 bg-[#FDFDF9]">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Perguntas</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-8 text-center">Perguntas Frequentes</h2>
                <ServiceFAQSchema faqs={data.faqs} />
                <Accordion type="single" collapsible className="space-y-4">
                  {data.faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="bg-white rounded-[18px] shadow-sm hover:shadow-md border border-[#E8E4DE] px-6 transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-[#D4AF37]/30"
                    >
                      <AccordionTrigger className="text-left text-base font-semibold text-[#1A1A2E] py-5 hover:no-underline [&[data-state=open]>svg]:text-[#D4AF37]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-[#1A1A2E]/60 pb-6 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* ═══ CTA ═══ */}
        <section className="py-10 md:py-14 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>Kyro Clean Solutions</p>
            <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-3">
              Peça o seu orçamento gratuito
            </h2>
            <p className="text-white/60 mb-6 text-base">
              Desde {servicePrice} · Resposta em menos de 2 horas · Sem compromisso.
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

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {relatedLinks.length > 0 && (
                <div>
                  <h3 className="font-playfair text-lg font-bold text-[#1A1A2E] mb-4">Outros materiais</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedLinks.map(link => (
                      <Link key={link.path} to={link.path}
                        className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!isCityVariant && (
                <div>
                  <h3 className="font-playfair text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    Disponível nestas cidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {topCities.map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all">
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": data.title,
          "description": data.metaDescription,
          "url": `https://www.cleansolutions.com.pt${pathname}`,
          "publisher": { "@id": "https://www.cleansolutions.com.pt/#business" },
        }) }} />
      </main>
      <Footer />
    </>
  );
};

export default MaterialPage;

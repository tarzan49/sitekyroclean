import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Utensils, BedDouble, Briefcase, MessageCircle, Phone, CheckCircle2, Quote } from "lucide-react";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import { getCommercialPageData, SegmentKey } from "@/data/commercialSeoData";
import { cityPrep } from "@/data/locationSeoData";
import { getProblemHeroImage } from "@/lib/problemHeroImages";
import { buildCommercialWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { buildLocalBusinessNode, buildBreadcrumbNode, buildServiceNode, clearPrerenderedSchema } from "@/lib/seoSchema";

const SEGMENT_ICONS: Record<SegmentKey, typeof Utensils> = {
  restaurantes: Utensils,
  hoteis: BedDouble,
  escritorios: Briefcase,
};

const CommercialPage = () => {
  const { pathname } = useLocation();
  const citySlug = pathname.replace(/^\/limpeza-comercial-/, "");
  const data = getCommercialPageData(citySlug);
  const heroImg = getProblemHeroImage("limpeza-sofa-hotel");

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
      if (canonical) canonical.setAttribute("href", `${SITE_URL}/limpeza-comercial-${citySlug}`);
    }
  }, [data, citySlug]);

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

  const pageUrl = `${SITE_URL}/limpeza-comercial-${citySlug}`;
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildCommercialWaMessage(data.city.name))}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusinessNode({ "@type": "City", name: data.city.name }),
      buildBreadcrumbNode(`${pageUrl}#breadcrumb`, [
        { name: "Início", item: SITE_URL },
        { name: data.h1, item: pageUrl },
      ]),
      buildServiceNode({
        url: pageUrl,
        name: data.h1,
        description: data.metaDescription,
        areaServed: { "@type": "City", name: data.city.name },
        serviceType: "Limpeza comercial de estofos",
      }),
    ],
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        {/* ═══ HERO ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <section className="relative pt-24 md:pt-28 pb-16 md:pb-24">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-2xl">
                <PageBreadcrumb items={[
                  { label: "Início", to: "/" },
                  { label: data.h1 },
                ]} />

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      Restaurantes · Hotéis · Escritórios
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  {data.h1}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {data.intro}
                </p>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-white font-bold text-sm">{REVIEW_RATING}★</span>
                  <span className="text-white/50 text-xs">Google · {REVIEW_COUNT}+ avaliações</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <div className="relative group flex-1">
                    <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex items-center justify-center gap-2 w-full h-[58px] md:h-[52px] px-6 font-bold text-white touch-manipulation bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-150"
                    >
                      <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Pedir Proposta</span>
                    </a>
                  </div>
                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="flex-1 flex items-center justify-center gap-2 h-[58px] md:h-[52px] px-6 font-bold border border-white/25 text-white hover:bg-white/10 transition-colors"
                  >
                    <Phone className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={2} />
                    <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">{PHONE_DISPLAY}</span>
                  </a>
                </div>
                <p className="text-white/40 text-xs mt-4">Orçamento personalizado · Visita de avaliação gratuita · Sem compromisso</p>
              </div>
            </div>
          </section>
        </div>

        {/* ═══ SEGMENTOS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Para o seu negócio" heading="Feito para o seu tipo de" goldWord="espaço" light={true} />
            <div className="grid md:grid-cols-3 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {data.segments.map(seg => {
                const Icon = SEGMENT_ICONS[seg.key];
                return (
                  <div key={seg.key} className="relative overflow-hidden flex flex-col p-6 md:p-7 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-4" style={{ backgroundColor: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.25)" }}>
                      <Icon className="w-5 h-5" style={{ color: "#B8912A" }} />
                    </div>
                    <p className="font-playfair text-lg font-bold mb-3 text-[#111111]">{seg.label}</p>
                    <ul className="space-y-2 mb-4">
                      {seg.painPoints.map((p, i) => (
                        <li key={i} className="text-sm text-[#111111]/55 leading-relaxed flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#D4AF37] flex-shrink-0 mt-2" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-[#111111]/70 leading-relaxed pt-4" style={{ borderTop: "1px solid #E8E4DE" }}>{seg.solution}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ BENEFÍCIOS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Como Funciona" heading="O que muda com um" goldWord="contrato" light={false} />
            <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {data.benefits.map((benefit, idx) => (
                <div key={idx} className="relative overflow-hidden flex items-start gap-3.5 p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)" }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  </div>
                  <span className="text-sm text-white/75 leading-relaxed pt-1.5">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTEMUNHO REAL ═══ */}
        <section className="py-14 md:py-16 bg-[#FDFDF9]">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="relative p-8 md:p-10" style={{ background: "linear-gradient(160deg, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.02) 100%)", border: "1px solid rgba(212,175,55,0.18)", borderTop: "2px solid #D4AF37" }}>
              <Quote className="w-10 h-10 mb-4" style={{ color: "rgba(212,175,55,0.35)" }} />
              <p className="font-playfair text-lg md:text-xl text-[#111111]/85 leading-relaxed mb-5">
                "Somos um restaurante que prima pela qualidade e gostamos de contratar empresas de excelência com o mesmo reflexo! São eles que tornam o nosso ambiente mais limpo e charmoso! Recomendo 5⭐️"
              </p>
              <p className="text-sm font-bold text-[#111111]">Lumiere Restaurante</p>
              <p className="text-xs text-[#111111]/50">Avaliação Google verificada</p>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <ServiceFAQ faqs={data.faqs} heading="Dúvidas sobre contratos comerciais" variant="dark" />

        {/* ═══ CTA FINAL ═══ */}
        <section className="py-14 md:py-16 bg-[#FDFDF9] border-t border-[#111111]/8">
          <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-3">
              Peça uma proposta <span style={{ color: "#D4AF37" }}>sem compromisso</span>
            </h2>
            <p className="text-[#111111]/60 text-sm mb-8 max-w-lg mx-auto">
              Fazemos uma visita de avaliação gratuita ao seu espaço {cityPrep(data.city.name)} {data.city.name} e enviamos uma proposta ajustada ao seu volume e frequência.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-[56px] px-6 font-bold text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)]"
              >
                <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">WhatsApp</span>
              </a>
              <a
                href={`tel:${PHONE_TEL}`}
                className="flex-1 flex items-center justify-center gap-2 h-[56px] px-6 font-bold border border-[#111111]/20 text-[#111111] hover:bg-[#111111]/5 transition-colors"
              >
                <Phone className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={2} />
                <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">{PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CommercialPage;

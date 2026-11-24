import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Utensils, BedDouble, Briefcase, MessageCircle, Phone, CheckCircle2, Quote } from "lucide-react";
import Header from "@/components/Header";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import CompactFAQ from "@/components/CompactFAQ";
import heroVideo from "@/assets/comercial/poltronas.mp4";
import heroPoster from "@/assets/comercial/poltronas-poster.jpg";
import { useSnapSections } from "@/hooks/useSnapSections";
import { getCommercialPageData, COMMERCIAL_CITIES, SegmentKey } from "@/data/commercialSeoData";
import { cityPrep } from "@/data/serviceCatalog";
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
  useSnapSections(Boolean(data));
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
            <h1 className="type-page-title font-playfair   text-[#111111] mb-4">Página não encontrada</h1>
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

        {/* Modelo novo (dono, 24 Nov: "as páginas comerciais são das piores coisas que temos"): secções de ecrã
            inteiro, vídeo real de um trabalho em espaço comercial, pouco texto e um só pedido: a proposta. */}
        <section data-commercial-hero className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#071a12] text-white">
          <video src={heroVideo} poster={heroPoster} autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.35) 0%, rgba(7,26,18,0.55) 45%, rgba(7,26,18,0.95) 85%)" }} />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-20 sm:px-6 md:pb-16 md:pt-28 lg:px-8">
            <div className="hidden md:block"><PageBreadcrumb items={[{ label: "Início", to: "/" }, { label: data.h1 }]} /></div>
            <h1 className="font-playfair mb-3 max-w-2xl text-[28px] font-semibold leading-tight text-white md:text-5xl" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>{data.h1}</h1>
            <p className="mb-5 max-w-lg text-[15px] leading-relaxed text-white/80 line-clamp-2">{data.intro}</p>
            <p className="mb-5 flex items-center gap-2 text-sm text-white/85"><span className="font-bold text-[#D4AF37]">{REVIEW_RATING}★</span> Google · {REVIEW_COUNT}+ avaliações · contratos com restaurantes, hotéis e escritórios</p>
            <div className="flex max-w-md flex-col gap-2.5 sm:flex-row">
              <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source={`commercial_hero_${citySlug}`} className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#16833e] px-4 text-base font-semibold text-white hover:bg-[#116b32]"><MessageCircle className="h-5 w-5" />Pedir proposta no WhatsApp</a>
              <a href={`tel:${PHONE_TEL}`} data-tracking-source={`commercial_hero_${citySlug}`} className="flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-white/30 px-4 text-base font-semibold text-white hover:bg-white/10"><Phone className="h-4 w-4" />{PHONE_DISPLAY}</a>
            </div>
          </div>
        </section>

        <section id="espacos" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Feito para o seu" goldWord="espaço" />
            <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {data.segments.map(seg => {
                const Icon = SEGMENT_ICONS[seg.key];
                return (
                  <article key={seg.key} className="w-[90%] shrink-0 snap-start rounded-2xl border border-[#E5E0D3] bg-white p-4 md:w-auto md:p-5" style={{ borderTop: "3px solid #D4AF37" }}>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D4AF37]/10"><Icon className="h-5 w-5 text-[#D4AF37]" /></span>
                      <h3 className="font-playfair text-xl font-bold text-[#111111]">{seg.label}</h3>
                    </div>
                    <ul className="mb-2.5 space-y-1">{seg.painPoints.map((pt, i) => <li key={i} className="flex gap-2 text-[13px] leading-snug text-[#505650]"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#D4AF37]" />{pt}</li>)}</ul>
                    <p className="border-t border-[#E8E4DE] pt-2.5 text-[13px] font-medium leading-snug text-[#111111]">{seg.solution}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contrato" className="scroll-mt-20 bg-kyro-green py-14 text-white md:py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="O que muda com um" goldWord="contrato" light={false} />
            <ul className="space-y-2">{data.benefits.map((benefit, idx) => <li key={idx} className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[14px] leading-snug text-white/90"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />{benefit}</li>)}</ul>
          </div>
        </section>

        <section id="testemunho" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Quem já trabalha" goldWord="connosco" />
            <figure className="rounded-2xl border border-[#D4AF37]/30 bg-white p-6 md:p-10">
              <Quote className="mb-3 h-9 w-9 text-[#D4AF37]/50" />
              <blockquote className="font-playfair text-lg leading-relaxed text-[#111111]/85 md:text-xl">"Somos um restaurante que prima pela qualidade e gostamos de contratar empresas de excelência com o mesmo reflexo! São eles que tornam o nosso ambiente mais limpo e charmoso! Recomendo 5⭐️"</blockquote>
              <figcaption className="mt-4 text-sm"><span className="font-bold text-[#111111]">Lumiere Restaurante</span> · <span className="text-[#505650]">avaliação Google verificada</span></figcaption>
            </figure>
          </div>
        </section>

        <CompactFAQ id="duvidas" dark faqs={data.faqs} heading="Dúvidas sobre contratos comerciais" />

        <section id="proposta" className="scroll-mt-20 bg-[#FDFDF9] py-14 md:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Peça uma proposta" goldWord="sem compromisso" />
            <p className="mb-5 text-base leading-relaxed text-[#505650]">Diga-nos o tipo de espaço, o número de peças e a frequência. Respondemos em menos de 1 minuto no WhatsApp com uma proposta à medida.</p>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source={`commercial_cta_${citySlug}`} className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#16833e] px-4 text-base font-semibold text-white hover:bg-[#116b32]"><MessageCircle className="h-5 w-5" />Pedir proposta no WhatsApp</a>
              <a href={`tel:${PHONE_TEL}`} data-tracking-source={`commercial_cta_${citySlug}`} className="flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-[#111111]/20 px-4 text-base font-semibold text-[#111111]"><Phone className="h-4 w-4" />Ligar {PHONE_DISPLAY}</a>
            </div>
            <details className="mt-6"><summary className="cursor-pointer text-base font-semibold text-[#111111]">Limpeza comercial noutras cidades</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {COMMERCIAL_CITIES.filter(c => c.slug !== citySlug).map(c => <Link key={c.slug} to={`/limpeza-comercial-${c.slug}`} className="rounded-full border border-[#E5E0D3] bg-white px-3 py-1.5 text-sm text-[#1A1A1A] hover:border-[#D4AF37]">{c.name}</Link>)}
            </div></details>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CommercialPage;

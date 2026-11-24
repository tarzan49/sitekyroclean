import DirectoryGroup from "@/components/DirectoryGroup";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Phone, CheckCircle2, Camera, Clock, Euro } from "lucide-react";
import EnHeader from "@/components/EnHeader";
import EnFooter from "@/components/EnFooter";
import SectionHeader from "@/components/SectionHeader";
import CompactFAQ from "@/components/CompactFAQ";
import { SITE_URL, WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY, REVIEW_RATING, REVIEW_COUNT, CLIENTS_SERVED_LABEL } from "@/constants/business";
import { buildLocalBusinessNode, buildBreadcrumbNode, clearPrerenderedSchema } from "@/lib/seoSchema";
import { EN_GUIDE_DESCRIPTION, EN_GUIDE_SECTIONS, EN_GUIDE_FAQS, EN_GUIDE_TAKEAWAYS } from "@/data/enGuideContent";
import heroImg from "@/assets/hero-p-limpeza-sofa-hotel.webp";

const PAGE_URL = `${SITE_URL}/en/airbnb-portugal-cleaning-guide`;
const TITLE = "Airbnb & Short-Term Rental Cleaning in Portugal | Host Guide | Kyro Clean";
const RELATED_HOST_PAGES = [
  { to: "/en/airbnb-turnover-cleaning-algarve", label: "Algarve host cleaning" },
  { to: "/en/airbnb-turnover-cleaning-lisbon", label: "Lisbon host cleaning" },
  { to: "/en/airbnb-turnover-cleaning-porto", label: "Porto host cleaning" },
];

const EnGuidePage = () => {
  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

  useEffect(() => {
    document.title = TITLE;
    document.documentElement.setAttribute("lang", "en");
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", EN_GUIDE_DESCRIPTION);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", TITLE);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", EN_GUIDE_DESCRIPTION);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", PAGE_URL);
    return () => {
      document.documentElement.setAttribute("lang", "pt");
    };
  }, []);

  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I manage a short-term rental in Portugal and would like to know the price and availability for a cleaning.")}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusinessNode(),
      buildBreadcrumbNode(`${PAGE_URL}#breadcrumb`, [
        { name: "Home", item: SITE_URL },
        { name: "Airbnb & Short-Term Rental Cleaning Guide", item: PAGE_URL },
      ]),
      {
        "@type": "Article",
        "headline": "Airbnb & Short-Term Rental Cleaning in Portugal: A Host Guide",
        "description": EN_GUIDE_DESCRIPTION,
        // Por `@id`, como o resto do grafo: um nó `Organization` solto com o
        // mesmo nome não se liga à empresa que o site descreve.
        "author": { "@id": `${SITE_URL}/#business` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "url": PAGE_URL,
        "inLanguage": "en",
      },
    ],
  };

  return (
    <>
      <EnHeader />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        {/* Topo de ecrã inteiro (modelo novo): fotografia, título, prova e um pedido. */}
        <section data-en-hero className="relative flex flex-col justify-end overflow-hidden bg-[#071a12] text-white">
          <img src={heroImg} alt="Professional upholstery cleaning" className="absolute inset-0 h-full w-full object-cover" loading="eager" width={1280} height={720} />
          <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.45) 0%, rgba(7,26,18,0.72) 45%, rgba(7,26,18,0.97) 85%)" }} />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-5 pt-20 sm:px-6 lg:px-8">
            <nav className="mb-4 hidden gap-1.5 text-sm text-white/80 md:flex" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>Host Guide</span></nav>
            <h1 className="font-playfair mb-2 max-w-3xl text-[26px] font-semibold leading-tight text-white md:text-4xl">Airbnb & short-term rental cleaning in <em className="not-italic text-[#D4AF37]">Portugal</em></h1>
            <p className="mb-3 max-w-2xl text-[14px] leading-snug text-white/85 md:text-base">A practical guide for hosts: turnover timelines, what to document when a guest causes damage, and realistic costs, based on what we see cleaning rental properties across Porto, Lisbon and the Algarve.</p>
            <p className="mb-3 flex flex-wrap gap-x-3 text-[13px] text-white/85"><span><span className="font-bold text-[#D4AF37]">{REVIEW_RATING}★</span> Google</span><span>{REVIEW_COUNT}+ reviews</span><span>{CLIENTS_SERVED_LABEL} clients</span></p>
            <div className="flex max-w-xl flex-col gap-2 sm:flex-row">
              <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source="en_hero" className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#16833e] px-4 text-base font-semibold text-white hover:bg-[#116b32]"><MessageCircle className="h-5 w-5 shrink-0" />Message on WhatsApp</a>
              <a href={`tel:${PHONE_TEL}`} data-tracking-source="en_hero" className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/30 px-4 text-base font-semibold text-white hover:bg-white/10"><Phone className="h-4 w-4 shrink-0" />{PHONE_DISPLAY}</a>
            </div>
          </div>
        </section>

        {/* ═══ TABLE OF CONTENTS ═══ */}
        <section className="py-10 md:py-12 bg-[#FDFDF9] border-b border-[#111111]/8">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <p className="text-sm font-bold tracking-[0.08em] uppercase mb-4" style={{ color: "#D4AF37", opacity: 0.85 }}>On this page</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {EN_GUIDE_SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} className="text-base text-[#505650] hover:text-[#111111] transition-colors underline underline-offset-4 decoration-[#D4AF37]/40">
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ARTICLE SECTIONS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 space-y-14">
            {EN_GUIDE_SECTIONS.map(s => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="type-article-title font-playfair    text-[#111111] mb-4">{s.title}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="text-base text-[#505650] leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ═══ KEY TAKEAWAYS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="If you remember one thing from" goldWord="each section" light={false} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {EN_GUIDE_TAKEAWAYS.map((text, i) => ({ icon: [Camera, Clock, Euro, CheckCircle2][i], text })).map((item, idx) => (
                <div key={idx} className="relative overflow-hidden p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <item.icon className="w-5 h-5 mb-3" style={{ color: "#D4AF37" }} strokeWidth={1.75} />
                  <p className="text-base text-white/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <CompactFAQ id="duvidas" faqs={EN_GUIDE_FAQS} heading="Frequently asked questions" />

        {/* ═══ RELATED HOST PAGES ═══ */}
        <section className="py-14 md:py-16 bg-[#FDFDF9] border-t border-[#111111]/8">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="type-section-title font-playfair text-[#111111] mb-6">
              Cleaning help by <span style={{ color: "#D4AF37" }}>region</span>
            </h2>
            <DirectoryGroup title="Cleaning by region" language="en">
              {RELATED_HOST_PAGES.map(p => (
                <Link
                  key={p.to}
                  to={p.to}
                  className="px-5 py-3 border border-[#111111]/15 text-base font-medium text-[#111111]/70 hover:border-[#D4AF37] hover:text-[#111111] transition-colors"
                >
                  {p.label}
                </Link>
              ))}
            </DirectoryGroup>
          </div>
        </section>
      </main>
      <EnFooter />
    </>
  );
};

export default EnGuidePage;

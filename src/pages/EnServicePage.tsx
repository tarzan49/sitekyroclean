import CompactFAQ from "@/components/CompactFAQ";
import { useSnapSections } from "@/hooks/useSnapSections";
import { EN_RESPONSE_PROMISE, EN_AVAILABILITY_PROMISE, EN_DRYING_PROMISE } from '@/constants/commercialPolicy';
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MessageCircle, Phone, Clock, Languages, Camera, Users, CheckCircle2 } from "lucide-react";
import EnHeader from "@/components/EnHeader";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import EnFooter from "@/components/EnFooter";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSnapshotStats, { SnapshotStat } from "@/components/ServiceSnapshotStats";
import { getEnPageBySlug, EnPageData } from "@/data/enTouristSeoData";
import { getProblemHeroImage } from "@/lib/problemHeroImages";
import {
  SITE_URL, WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY,
  REVIEW_RATING, REVIEW_COUNT, CLIENTS_SERVED_LABEL,
} from "@/constants/business";
import { buildLocalBusinessNode, buildServiceNode, buildBreadcrumbNode, clearPrerenderedSchema } from "@/lib/seoSchema";

function buildEnWaMessage(page: EnPageData): string {
  if (page.audience === "host") {
    return `Hi! I manage a short-term rental in ${page.region} and need cleaning help. Can you tell me your availability and price?`;
  }
  return `Hi! I'm staying in ${page.region} and need help with a stain/cleaning issue. Can you tell me your availability and price?`;
}

function getGuestStats(page: EnPageData): SnapshotStat[] {
  return [
    { value: `${REVIEW_RATING}★`, label: "Google Rating", icon: Star },
    { value: "<1 min", label: "Response Time", icon: Clock },
    { value: "English", label: "Speaking Team", icon: Languages },
    { value: CLIENTS_SERVED_LABEL, label: "Clients Served", icon: Users },
  ];
}

function getHostStats(): SnapshotStat[] {
  return [
    { value: `${REVIEW_RATING}★`, label: "Google Rating", icon: Star },
    { value: "<1 min", label: "Response Time", icon: Clock },
    { value: "Photo", label: "Documentation", icon: Camera },
    { value: "English", label: "Speaking Team", icon: Languages },
  ];
}

const EnServicePage = () => {
  useSnapSections(true); // modelo novo (dono, 24 Nov)
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getEnPageBySlug(slug) : null;

  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

  useEffect(() => {
    if (page) {
      document.title = page.title;
      document.documentElement.setAttribute("lang", "en");
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", page.metaDescription);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", page.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", page.metaDescription);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${SITE_URL}/en/${page.slug}`);
    }
    return () => {
      document.documentElement.setAttribute("lang", "pt");
    };
  }, [page]);

  if (!page) {
    return (
      <>
        <EnHeader />
        <main className="pt-28 pb-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="type-page-title font-playfair   text-[#111111] mb-4">Page not found</h1>
            <Link to="/" style={{ color: "#D4AF37" }} className="hover:underline">Back to homepage</Link>
          </div>
        </main>
        <EnFooter />
      </>
    );
  }

  const heroImg = getProblemHeroImage(page.audience === "host" ? "limpeza-sofa-hotel" : "manchas-vinho-sofa");
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildEnWaMessage(page))}`;
  const stats = page.audience === "host" ? getHostStats() : getGuestStats(page);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusinessNode({ "@type": "City", name: page.region }),
      buildBreadcrumbNode(`${SITE_URL}/en/${page.slug}#breadcrumb`, [
        { name: "Home", item: SITE_URL },
        { name: page.h1, item: `${SITE_URL}/en/${page.slug}` },
      ]),
      buildServiceNode({
        url: `${SITE_URL}/en/${page.slug}`,
        name: page.h1,
        description: page.metaDescription,
        areaServed: { "@type": "City", name: page.region },
        imageUrl: `${SITE_URL}${heroImg}`,
      }),
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
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-3 pt-16 sm:px-6 lg:px-8">
            <div className="hidden md:block"><PageBreadcrumb items={[{ label: "Home", to: "/" }, { label: page.h1 }]} /></div>
            <h1 className="font-playfair mb-2 max-w-3xl text-[26px] font-semibold leading-tight text-white md:text-4xl">{page.h1}{" "}<em className="not-italic text-[#D4AF37]">{page.h1Gold}</em></h1>
            <p className="mb-3 max-w-2xl text-[13px] leading-snug text-white/85 md:text-[15px]">{page.intro}</p>
            <p className="mb-3 flex flex-wrap gap-x-3 text-[13px] text-white/85"><span><span className="font-bold text-[#D4AF37]">{REVIEW_RATING}★</span> Google</span><span>{REVIEW_COUNT}+ reviews</span><span>{CLIENTS_SERVED_LABEL} clients</span></p>
            <div className="flex max-w-xl gap-2">
              <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source="en_hero" className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#16833e] px-4 text-base font-semibold text-white hover:bg-[#116b32]"><MessageCircle className="h-5 w-5 shrink-0" />Message on WhatsApp</a>
              <a href={`tel:${PHONE_TEL}`} data-tracking-source="en_hero" aria-label={`Call ${PHONE_DISPLAY}`} className="flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-lg border border-white/30 px-3 text-base font-semibold text-white hover:bg-white/10"><Phone className="h-4 w-4 shrink-0" /><span className="hidden sm:inline">{PHONE_DISPLAY}</span></a>
            </div>
            <p className="mt-2 text-[12px] leading-snug text-white/75">{EN_AVAILABILITY_PROMISE} {EN_DRYING_PROMISE} Free quote · No obligation · {EN_RESPONSE_PROMISE}</p>
          </div>
          <div className="relative"><ServiceSnapshotStats stats={stats} /></div>
        </section>

        {/* ═══ SCENARIOS ═══ */}
        <section id="handle" className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="What we" goldWord="handle" light={true} />
            <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
              {page.scenarios.map((s, idx) => (
                <div key={idx} className="relative flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#E5E0D3] bg-white p-5 sm:w-auto md:p-7" style={{ borderTop: "3px solid #D4AF37" }}>
                  <p className="font-playfair text-lg font-bold mb-2 leading-tight text-[#111111]">{s.title}</p>
                  <p className="text-base text-[#505650] leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY US ═══ */}
        <section id="why" className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="Why choose" goldWord="Kyro" light={false} />
            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-px">
              {page.whyUs.map((reason, idx) => (
                <div key={idx} className="relative flex items-start gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 md:p-6">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#D4AF37" }} />
                  <span className="text-[14px] leading-snug text-white/85 md:text-base">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <CompactFAQ id="duvidas" faqs={page.faqs.slice(0, 4)} heading="Frequently Asked Questions" />

        {page.audience === "host" && (
          <section className="py-8 bg-[#FDFDF9] border-t border-[#111111]/8 text-center px-5">
            <p className="text-base text-[#505650]">
              Want more detail on documentation and pricing?{" "}
              <Link to="/en/airbnb-portugal-cleaning-guide" className="font-semibold underline underline-offset-4" style={{ color: "#D4AF37" }}>
                Read the full host guide
              </Link>
            </p>
          </section>
        )}

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-14 md:py-16 bg-kyro-green border-t border-white/10">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="type-section-title font-playfair    text-white mb-3">
              Need help <span style={{ color: "#D4AF37" }}>right now?</span>
            </h2>
            <p className="text-white/80 text-base mb-8 max-w-lg mx-auto">
              Message us on WhatsApp with a photo of the problem, or call us directly. {EN_RESPONSE_PROMISE}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-[56px] px-6 font-bold text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)]"
              >
                <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                <span className="text-base font-semibold tracking-[0.18em] uppercase">WhatsApp</span>
              </a>
              <a
                href={`tel:${PHONE_TEL}`}
                className="flex-1 flex items-center justify-center gap-2 h-[56px] px-6 font-bold border border-white/25 text-white hover:bg-white/10 transition-colors"
              >
                <Phone className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={2} />
                <span className="text-base font-semibold tracking-[0.18em] uppercase">{PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <EnFooter />
    </>
  );
};

export default EnServicePage;

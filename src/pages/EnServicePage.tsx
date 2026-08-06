import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MessageCircle, Phone, Clock, Languages, Camera, Users, CheckCircle2 } from "lucide-react";
import EnHeader from "@/components/EnHeader";
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
import { buildLocalBusinessNode, buildServiceNode, buildBreadcrumbNode } from "@/lib/seoSchema";

function buildEnWaMessage(page: EnPageData): string {
  if (page.audience === "host") {
    return `Hi! I manage a short-term rental in ${page.region} and need cleaning help. Can you tell me your availability and price?`;
  }
  return `Hi! I'm staying in ${page.region} and need help with a stain/cleaning issue. Can you tell me your availability and price?`;
}

function getGuestStats(page: EnPageData): SnapshotStat[] {
  return [
    { value: `${REVIEW_RATING}★`, label: "Google Rating", icon: Star },
    { value: "Same-day", label: "Response Time", icon: Clock },
    { value: "English", label: "Speaking Team", icon: Languages },
    { value: CLIENTS_SERVED_LABEL, label: "Clients Served", icon: Users },
  ];
}

function getHostStats(): SnapshotStat[] {
  return [
    { value: `${REVIEW_RATING}★`, label: "Google Rating", icon: Star },
    { value: "Same-day", label: "Turnover Cleaning", icon: Clock },
    { value: "Photo", label: "Documentation", icon: Camera },
    { value: "English", label: "Speaking Team", icon: Languages },
  ];
}

const EnServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getEnPageBySlug(slug) : null;

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
            <h1 className="font-playfair text-3xl font-bold text-[#111111] mb-4">Page not found</h1>
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

        {/* ═══ HERO + SNAPSHOT ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <section className="relative pt-24 md:pt-28 pb-16 md:pb-24">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-3xl">
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
                  <span>/</span>
                  <span className="text-white/70">{page.h1}</span>
                </nav>

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      {page.audience === "host" ? "For Hosts & Property Managers" : "Same-Day Service"}
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  {page.h1}{" "}<span style={{ color: "#D4AF37" }}>{page.h1Gold}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {page.intro}
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                      ))}
                    </div>
                    <span className="text-white font-bold text-sm">{REVIEW_RATING}</span>
                    <span className="text-white/50 text-xs">Google</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-white/60 text-xs font-medium">{REVIEW_COUNT}+ reviews</span>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-white/60 text-xs font-medium">{CLIENTS_SERVED_LABEL} clients</span>
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
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Message on WhatsApp</span>
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

                <p className="text-white/40 text-xs mt-4">Free quote · No obligation · Same-day availability</p>
              </div>
            </div>
          </section>

          <ServiceSnapshotStats stats={stats} />
        </div>

        {/* ═══ SCENARIOS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Common Situations" heading="What we" goldWord="handle" light={true} />
            <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {page.scenarios.map((s, idx) => (
                <div key={idx} className="relative overflow-hidden flex flex-col p-6 md:p-7 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                  <p className="font-playfair text-lg font-bold mb-2 leading-tight text-[#111111]">{s.title}</p>
                  <p className="text-sm text-[#111111]/60 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY US ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Why Kyro Clean" heading="Why guests and hosts" goldWord="choose us" light={false} />
            <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {page.whyUs.map((reason, idx) => (
                <div key={idx} className="relative overflow-hidden flex items-start gap-3.5 p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)" }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  </div>
                  <span className="text-sm text-white/75 leading-relaxed pt-1.5">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <ServiceFAQ faqs={page.faqs} heading="Frequently Asked Questions" overline="FAQ" variant="light" />

        {page.audience === "host" && (
          <section className="py-8 bg-[#FDFDF9] border-t border-[#111111]/8 text-center px-5">
            <p className="text-sm text-[#111111]/60">
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
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-3">
              Need help <span style={{ color: "#D4AF37" }}>right now?</span>
            </h2>
            <p className="text-white/60 text-sm mb-8 max-w-lg mx-auto">
              Message us on WhatsApp with a photo of the problem, or call us directly. We usually respond within minutes.
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
                className="flex-1 flex items-center justify-center gap-2 h-[56px] px-6 font-bold border border-white/25 text-white hover:bg-white/10 transition-colors"
              >
                <Phone className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={2} />
                <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">{PHONE_DISPLAY}</span>
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

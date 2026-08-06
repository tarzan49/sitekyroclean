import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Phone, CheckCircle2, Camera, Clock, Euro } from "lucide-react";
import EnHeader from "@/components/EnHeader";
import EnFooter from "@/components/EnFooter";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import { SITE_URL, WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";
import { buildLocalBusinessNode, buildBreadcrumbNode } from "@/lib/seoSchema";
import heroImg from "@/assets/hero-p-limpeza-sofa-hotel.webp";

const PAGE_URL = `${SITE_URL}/en/airbnb-portugal-cleaning-guide`;
const TITLE = "Airbnb & Short-Term Rental Cleaning in Portugal | Host Guide | Kyro Clean";
const DESCRIPTION = "A practical guide for Airbnb and short-term rental hosts in Portugal: turnover cleaning timelines, what to photograph for damage claims, and realistic costs for sofa, mattress and rug cleaning.";

const SECTIONS = [
  {
    id: "why-this-guide",
    title: "Why this guide exists",
    body: [
      "Portugal's short-term rental market runs on a different rhythm to a normal home: guests change every few days, cleaning windows are short, and when something does go wrong, there's rarely more than a few hours between spotting the damage and the next check-in.",
      "This guide is written for hosts and property managers running Airbnb, Booking.com or independent short-term rentals in Porto, Lisbon and the Algarve, based on what we see doing turnover and emergency cleaning for rental properties across all three regions.",
    ],
  },
  {
    id: "cleaning-standards",
    title: "The cleaning standard guests expect",
    body: [
      "Guest expectations in short-term rentals are higher than in a typical household clean, because the guest is comparing your listing photos to what they're standing in. A sofa with a visible watermark, a mattress with a faint stain under the sheet, or a rug that smells of the last guest's pet are the kind of details that show up in reviews.",
      "Regular vacuuming and surface wiping between stays is not the same as periodic deep cleaning. Upholstery, mattresses and rugs accumulate dust mites, body oils and odour over weeks of guest turnover even when the property looks clean on the surface — a professional extraction clean every few months (more often for high-turnover listings) keeps that baseline from building up between the emergency visits.",
    ],
  },
  {
    id: "documentation",
    title: "What to document when a guest causes damage",
    body: [
      "Most short-term rental platforms' damage and deposit claims processes ask hosts to provide clear, dated evidence — typically a before photo (or your standard listing photos, if the item wasn't damaged when the guest checked in), a photo of the damage itself, and a photo or receipt showing it was professionally addressed. Vague descriptions without photos are the most common reason claims get delayed or rejected.",
      "Practically, that means: photograph the item as soon as you notice the damage, before any cleaning is attempted. Keep the guest's check-in and check-out dates on hand. If you call in a professional cleaner, ask for before-and-after photos as part of the job (we provide these on every visit as standard, not as a special request) and keep the receipt — it's your proof the damage was real and that you took reasonable steps to resolve it.",
    ],
  },
  {
    id: "turnover-timelines",
    title: "Realistic turnover cleaning timelines",
    body: [
      "A same-day emergency clean is possible in most cases if you contact us in the morning for an afternoon check-in, but it depends on our schedule that day and where the property is — the earlier in the day you reach out, the more likely we can fit it in before your next guest arrives.",
      "For planned deep cleans (not emergencies), we recommend booking a few days ahead where possible, especially during the Algarve's peak summer season when demand is highest across the region.",
    ],
  },
  {
    id: "costs",
    title: "Realistic costs",
    body: [
      "Sofa cleaning starts from €49, mattress cleaning from €59, and rug cleaning from €12/m² — exact pricing depends on the size and condition of the item and is always confirmed before we start, so there are no surprises on the invoice you show your guest or platform.",
      "If a single listing needs regular attention, ask about a standing arrangement — several hosts we work with have us on a recurring schedule rather than calling for each individual incident.",
    ],
  },
];

const FAQS = [
  { question: "Do you provide before-and-after photos automatically?", answer: "Yes, on every job — it's part of our standard process, not something you need to request." },
  { question: "Can you invoice for accounting or tax purposes?", answer: "Yes, we provide a receipt for every job, itemised on request." },
  { question: "Do you work with property management companies, not just individual hosts?", answer: "Yes, several of our regular clients manage multiple listings across the Algarve, Lisbon and Porto." },
  { question: "What if the guest has already checked out and I'm not at the property?", answer: "We're used to coordinating directly with hosts remotely — send us photos and address, and we can liaise with a cleaner, keyholder or the next guest's check-in time directly." },
  { question: "Do you cover areas outside Porto, Lisbon and the Algarve?", answer: "Our English-language service is focused on these three regions, where the vast majority of short-term rental demand in Portugal is concentrated, but message us and we'll let you know if we can help." },
];

const RELATED_HOST_PAGES = [
  { to: "/en/airbnb-turnover-cleaning-algarve", label: "Algarve host cleaning" },
  { to: "/en/airbnb-turnover-cleaning-lisbon", label: "Lisbon host cleaning" },
  { to: "/en/airbnb-turnover-cleaning-porto", label: "Porto host cleaning" },
];

const EnGuidePage = () => {
  useEffect(() => {
    document.title = TITLE;
    document.documentElement.setAttribute("lang", "en");
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", DESCRIPTION);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", TITLE);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", DESCRIPTION);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", PAGE_URL);
    return () => {
      document.documentElement.setAttribute("lang", "pt");
    };
  }, []);

  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I manage a short-term rental in Portugal and have a question about cleaning/documentation.")}`;

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
        "description": DESCRIPTION,
        "author": { "@type": "Organization", "name": "Kyro Clean Solutions" },
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
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
                  <span>/</span>
                  <span className="text-white/70">Host Guide</span>
                </nav>

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      For Hosts & Property Managers
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl font-semibold text-white mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  Airbnb & short-term rental cleaning in <span style={{ color: "#D4AF37" }}>Portugal</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  A practical guide for hosts: turnover timelines, what to document when a guest causes damage, and realistic costs — based on what we see cleaning rental properties across Porto, Lisbon and the Algarve.
                </p>

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
              </div>
            </div>
          </section>
        </div>

        {/* ═══ TABLE OF CONTENTS ═══ */}
        <section className="py-10 md:py-12 bg-[#FDFDF9] border-b border-[#111111]/8">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37", opacity: 0.85 }}>On this page</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} className="text-sm text-[#111111]/60 hover:text-[#111111] transition-colors underline underline-offset-4 decoration-[#D4AF37]/40">
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ARTICLE SECTIONS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 space-y-14">
            {SECTIONS.map(s => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-4">{s.title}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="text-[15px] text-[#111111]/65 leading-relaxed mb-4">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ═══ KEY TAKEAWAYS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Key Takeaways" heading="If you remember one thing from" goldWord="each section" light={false} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {[
                { icon: Camera, text: "Photograph damage before cleaning it — timestamped before/after is the standard most platforms ask for." },
                { icon: Clock, text: "Same-day is often possible, but the earlier in the day you reach out, the better your odds." },
                { icon: Euro, text: "Prices start from €49 (sofa) / €59 (mattress) / €12/m² (rug), always confirmed before we start." },
                { icon: CheckCircle2, text: "Before/after photo documentation is standard on every job, no need to request it separately." },
              ].map((item, idx) => (
                <div key={idx} className="relative overflow-hidden p-5 md:p-6" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <item.icon className="w-5 h-5 mb-3" style={{ color: "#D4AF37" }} strokeWidth={1.75} />
                  <p className="text-sm text-white/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <ServiceFAQ faqs={FAQS} heading="Frequently Asked Questions" overline="FAQ" variant="light" />

        {/* ═══ RELATED HOST PAGES ═══ */}
        <section className="py-14 md:py-16 bg-[#FDFDF9] border-t border-[#111111]/8">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#111111] mb-6">
              Cleaning help by <span style={{ color: "#D4AF37" }}>region</span>
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {RELATED_HOST_PAGES.map(p => (
                <Link
                  key={p.to}
                  to={p.to}
                  className="px-5 py-3 border border-[#111111]/15 text-sm font-medium text-[#111111]/70 hover:border-[#D4AF37] hover:text-[#111111] transition-colors"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <EnFooter />
    </>
  );
};

export default EnGuidePage;

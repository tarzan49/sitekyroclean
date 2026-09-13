import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import ServiceResultsGallery from "@/components/ServiceResultsGallery";
import type { BeforeAfterCategory } from "@/data/beforeAfterPool";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import { SITE_URL, WHATSAPP_BASE, PHONE_E164 } from "@/constants/business";

const categories: { category: BeforeAfterCategory; label: string; href: string }[] = [
  { category: "sofa", label: "Sofás", href: "/limpeza-sofas" },
  { category: "colchao", label: "Colchões", href: "/limpeza-colchoes" },
  { category: "cadeiras", label: "Cadeiras", href: "/limpeza-cadeiras" },
  { category: "tapete", label: "Tapetes", href: "/limpeza-tapetes" },
  { category: "tapete", label: "Alcatifas", href: "/limpeza-alcatifas" },
  { category: "impermeabilizacao", label: "Impermeabilização", href: "/impermeabilizacao" },
];

const BeforeAfterPage = () => {
  const [selected, setSelected] = useState(0);
  const service = categories[selected];
  useEffect(() => {
    document.title = "Antes e Depois | Resultados de Limpeza Profissional | Kyro Clean Solutions";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Veja os resultados reais da limpeza profissional de sofás, colchões, tapetes e cadeiras. Antes e depois de cada serviço. Resultados visíveis no momento.");
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `${SITE_URL}/antes-depois-limpeza`);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${SITE_URL}/antes-depois-limpeza#webpage`,
            "url": `${SITE_URL}/antes-depois-limpeza`,
            "name": "Antes e Depois | Resultados de Limpeza Profissional | Kyro Clean Solutions",
            "description": "Veja os resultados reais da limpeza profissional de sofás, colchões, tapetes e cadeiras. Antes e depois de cada serviço. Resultados visíveis no momento.",
            "inLanguage": "pt-PT",
            "isPartOf": { "@id": `${SITE_URL}/#website` },
            "publisher": { "@id": `${SITE_URL}/#business` },
            "breadcrumb": { "@id": `${SITE_URL}/antes-depois-limpeza#breadcrumb` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${SITE_URL}/antes-depois-limpeza#breadcrumb`,
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
              { "@type": "ListItem", "position": 2, "name": "Antes e Depois", "item": `${SITE_URL}/antes-depois-limpeza` },
            ],
          },
        ],
      }) }} />
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-24 md:pt-28 pb-10 md:pb-14 bg-[#FDFDF9]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <nav className="flex items-center justify-center gap-1.5 text-sm md:text-base text-[#1A4E30]/60 mb-6" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-[#1A4E30] transition-colors">Início</Link>
                <span>/</span>
                <span className="text-[#1A4E30] font-medium">Antes e Depois</span>
              </nav>
              <p className="text-sm font-bold tracking-[0.08em] uppercase text-[#D4AF37] mb-3">Resultados reais</p>
              <h1 className="type-page-title font-playfair     text-[#111111] mb-4 ">
                Antes e Depois da Limpeza Profissional
              </h1>
              <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-5 opacity-60" />
              <p className="text-base md:text-lg text-[#555] leading-relaxed max-w-2xl mx-auto">
                Explore os resultados por serviço. As demonstrações de impermeabilização estão identificadas quando são ilustrativas.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 bg-[#F5F9F6]">
          <div className="max-w-[688px] mx-auto px-5 sm:px-6">
            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Escolher serviço">
              {categories.map((entry, i) => (
                <button key={entry.label} type="button" onClick={() => setSelected(i)} aria-pressed={selected === i}
                  className={`min-h-11 px-4 rounded-full text-base border transition-colors focus-visible:outline-gold ${selected === i ? "bg-kyro-green text-white border-kyro-green" : "border-black/15 text-[#111111] hover:border-gold"}`}>
                  {entry.label}
                </button>
              ))}
            </div>
            <h2 className="type-section-title font-playfair  text-[#111111] mb-4">{service.label}: antes e depois</h2>
            <ServiceResultsGallery key={service.label} category={service.category} light />
            <Link to={service.href} className="inline-flex items-center gap-2 text-base text-[#1A4E30] mt-5 min-h-11">
              Conhecer o serviço <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Trust */}
        <section className="py-10 md:py-12 bg-[#FDFDF9]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#1A4E30]/10 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-3">
                  <TrustRatingBadge variant="card" />
                </div>
                <div className="h-px sm:h-12 sm:w-px w-full bg-[#1A4E30]/10" />
                <div className="text-center sm:text-left">
                  <p className="text-3xl font-bold text-[#1A4E30]">+1100</p>
                  <p className="text-base text-[#777]">clientes satisfeitos</p>
                </div>
                <div className="sm:ml-auto">
                  <QuizButton />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Links */}
        <section className="py-12 md:py-16 bg-[#F5F9F6]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="type-section-title font-playfair    text-[#111111] mb-6 text-center">
                Os nossos serviços
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { name: "Limpeza de Sofás",    link: "/limpeza-sofas",    price: "Desde 49€" },
                  { name: "Limpeza de Colchões", link: "/limpeza-colchoes", price: "Desde 59€" },
                  { name: "Limpeza de Tapetes",  link: "/limpeza-tapetes",  price: "Sob orçamento" },
                  { name: "Limpeza de Cadeiras", link: "/limpeza-cadeiras", price: "Desde 20€" },
                  { name: "Limpeza de Alcatifas",link: "/limpeza-alcatifas",price: "Sob orçamento" },
                  { name: "Impermeabilização",   link: "/impermeabilizacao",price: "Desde 59€" },
                ].map(svc => (
                  <Link
                    key={svc.link}
                    to={svc.link}
                    className="group flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-[#1A4E30]/10 hover:border-[#D4AF37]/40 transition-all"
                  >
                    <div className="flex-1">
                      <span className="text-base font-semibold text-[#111111] group-hover:text-[#1A4E30] transition-colors">{svc.name}</span>
                      <span className="block text-sm text-[#777]">{svc.price}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#999] group-hover:text-[#D4AF37] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 md:py-14 bg-kyro-green">
          <div className="container mx-auto px-4 text-center">
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest mb-3">Kyro Clean Solutions</p>
            <h2 className="type-section-title font-playfair    text-white mb-3">
              Quer resultados como estes?
            </h2>
            <p className="text-white/80 mb-6 text-base">
              Peça um orçamento gratuito em menos de 30 segundos.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <QuizButton />
              <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 rounded-full text-white/75 font-medium text-base hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200">
                <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />WhatsApp</a>
              <a href={`tel:${PHONE_E164}`} className="inline-flex items-center gap-1.5 text-white/75 hover:text-gold font-medium text-base transition-colors duration-150">
                <Phone className="w-3.5 h-3.5 text-gold animate-phone-shake flex-shrink-0" strokeWidth={2.5} />
                <span className="font-bold tracking-wide">Ligar agora</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BeforeAfterPage;

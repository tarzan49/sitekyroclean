import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { SITE_URL } from "@/constants/business";
import { glossaryTerms, type GlossaryTerm } from "@/data/glossaryTerms";

const PAGE_URL = `${SITE_URL}/glossario-limpeza-estofos`;

const terms = glossaryTerms;

const combinedSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      "url": PAGE_URL,
      "name": "Glossário de Limpeza de Estofos: 16 Termos Técnicos | Kyro Clean Solutions",
      "inLanguage": "pt-PT",
      "isPartOf": { "@id": `${SITE_URL}/#website` },
      "publisher": { "@id": `${SITE_URL}/#business` },
      "breadcrumb": { "@id": `${PAGE_URL}#breadcrumb` },
    },
    {
      "@type": "DefinedTermSet",
      "@id": `${PAGE_URL}#glossary`,
      "name": "Glossário de Limpeza de Estofos | Kyro Clean Solutions",
      "description": "16 termos técnicos sobre limpeza profissional de sofás, colchões, tapetes, alcatifas e estofos em Portugal, explicados pela Kyro Clean Solutions.",
      "url": PAGE_URL,
      "inLanguage": "pt-PT",
      "definedTerm": terms.map((t) => ({
        "@type": "DefinedTerm",
        "name": t.term,
        "description": t.definition,
        "inDefinedTermSet": PAGE_URL,
        "url": `${PAGE_URL}#${t.id}`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "Recursos", "item": `${SITE_URL}/blog` },
        { "@type": "ListItem", "position": 3, "name": "Glossário", "item": PAGE_URL },
      ],
    },
  ],
};

const GlossarioEstofos = () => {
  useEffect(() => {
    document.title = "Glossário de Limpeza de Estofos: 16 Termos Técnicos | Kyro Clean Solutions";
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      "16 termos técnicos de limpeza de estofos explicados com rigor: higienização, extração a vapor, impermeabilização, tapete vs alcatifa, veludo, alcântara e mais. Kyro Clean Solutions.");
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", PAGE_URL);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content",
      "Glossário de Limpeza de Estofos: 16 Termos Técnicos | Kyro Clean Solutions");
    document.querySelector('meta[property="og:description"]')?.setAttribute("content",
      "16 termos técnicos de limpeza de estofos explicados com rigor. Higienização, extração a vapor, impermeabilização, tapete vs alcatifa, veludo, alcântara e mais.");
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <div className="min-h-screen bg-[#f4f5f7]">
        <Header />

        {/* ── Hero dark band ── */}
        <div data-mobile-hero="text" className="pt-24 pb-10 bg-checker-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-sm text-white/80 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-gold transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="hover:text-gold transition-colors">Recursos</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/80">Glossário</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-gold" />
              </div>
              <p className="text-gold text-sm font-bold tracking-[0.08em] uppercase">KYRO CLEAN SOLUTIONS</p>
            </div>

            <h1 className="type-page-title font-playfair    text-white  mb-4">
              Glossário de Limpeza de Estofos
            </h1>
            <p className="text-white/80 text-base leading-relaxed max-w-2xl mb-6">
              {terms.length} termos técnicos explicados com rigor e acessibilidade: definições citáveis, com exemplo prático e link para o serviço relevante.
            </p>

            {/* Quick index pills */}
            <div className="flex flex-wrap gap-1.5">
              {terms.map((term, i) => (
                <a
                  key={term.id}
                  href={`#${term.id}`}
                  className="flex-shrink-0 text-sm font-medium text-white/80 hover:text-gold border border-white/10 hover:border-gold/30 px-2.5 py-1 rounded-full transition-all"
                >
                  {String(i + 1).padStart(2, "0")} {term.term.split(" ")[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Terms list ── */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {terms.map((term, idx) => (
            <article
              key={term.id}
              id={term.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24 hover:border-gold/20 hover:shadow-md transition-all"
            >
              {/* Gold top line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

              <div className="p-6 md:p-7">
                {/* Header row */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-sm font-bold text-gold mt-0.5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a href={`#${term.id}`} title="Link direto">
                      <h2 className="type-section-title font-playfair    text-[#111111]  hover:text-gold transition-colors">
                        {term.term}
                      </h2>
                    </a>
                  </div>
                </div>

                {/* Definition */}
                <p className="text-base text-[#111111]/70 leading-relaxed mb-4 pl-10">
                  {term.definition}
                </p>

                {/* Example */}
                <div className="pl-10 mb-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <p className="text-sm font-bold text-[#505650] uppercase tracking-widest mb-1.5">
                      Exemplo prático
                    </p>
                    <p className="text-base text-[#505650] leading-relaxed italic">{term.example}</p>
                  </div>
                </div>

                {/* Service link */}
                {term.serviceLink && (
                  <div className="pl-10">
                    <Link
                      to={term.serviceLink.to}
                      className="inline-flex items-center gap-1.5 text-base font-semibold text-gold hover:text-[#B8912A] transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      {term.serviceLink.label}
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ))}

          {/* ── Final CTA ── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#071a12" }}>
            <div className="px-6 py-8 flex flex-col items-center text-center">
              <p className="text-sm font-bold tracking-[0.08em] uppercase text-gold/70 mb-2">PRONTO PARA AGENDAR?</p>
              <h2 className="type-section-title font-playfair   text-white mb-2">Orçamento gratuito em 30 segundos</h2>
              <p className="text-white/80 text-base mb-6">Técnico contacta em menos de 10 minutos · Sem compromisso</p>
              <QuizButton ctaLabel="Calcular preço grátis" />
            </div>
          </div>

          {/* ── Related links ── */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm font-bold text-[#505650] uppercase tracking-widest mb-3">Recursos relacionados</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { to: "/perguntas-frequentes-limpeza-estofos", label: "FAQ Estofos" },
                { to: "/limpeza-sofas", label: "Limpeza de Sofás" },
                { to: "/impermeabilizacao", label: "Impermeabilização" },
                { to: "/limpeza-colchoes", label: "Limpeza de Colchões" },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="flex items-center gap-2 text-base text-[#111111]/70 hover:text-gold transition-colors px-3 py-2 rounded-xl border border-gray-200 hover:border-gold/20 bg-white">
                  <ChevronRight className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default GlossarioEstofos;

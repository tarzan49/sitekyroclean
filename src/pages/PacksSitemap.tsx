import { Link } from "react-router-dom";
import { ArrowRight, Map } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { packs, packCities, getFromPrice } from "@/data/packComboData";
import { SITE_URL } from "@/constants/business";

const PACK_COLORS: Record<string, string> = {
  'sofa-colchao':          'bg-blue-50 border-blue-200 text-blue-700',
  'sofa-impermeabilizacao':'bg-amber-50 border-amber-200 text-amber-700',
  'sala-completa':         'bg-green-50 border-green-200 text-green-700',
  'quarto-completo':       'bg-purple-50 border-purple-200 text-purple-700',
};

const PacksSitemap = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/guia-de-packs#webpage`,
        "url": `${SITE_URL}/guia-de-packs`,
        "name": "Guia de Packs de Limpeza | Kyro Clean Solutions",
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "breadcrumb": { "@id": `${SITE_URL}/guia-de-packs#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/guia-de-packs#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Packs", "item": `${SITE_URL}/packs` },
          { "@type": "ListItem", "position": 3, "name": "Guia de Packs", "item": `${SITE_URL}/guia-de-packs` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />
      <main>

        {/* Hero */}
        <section className="pt-24 md:pt-28 pb-10 bg-checker-dark">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-6">
              <Link to="/" className="hover:text-white/70">Início</Link>
              <span>/</span>
              <Link to="/packs" className="hover:text-white/70">Packs</Link>
              <span>/</span>
              <span className="text-white/60">Guia de Packs</span>
            </nav>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border" style={{ background: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)" }}>
                <Map className="w-6 h-6" style={{ color: "#D4AF37" }} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-2" style={{ color: "#D4AF37" }}>
                  {packs.length} packs · {packCities.length} cidades · {packs.length * packCities.length} páginas
                </p>
                <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-3">
                  Guia Completo de Packs
                </h1>
                <p className="text-white/60 text-base max-w-xl">
                  Todos os packs Kyro Clean disponíveis por cidade. Clique no pack que pretende para configurar e reservar via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Packs by type */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 space-y-12">
            {packs.map(pack => {
              const fromPrice = getFromPrice(pack);
              const badgeClass = PACK_COLORS[pack.id] ?? 'bg-gray-50 border-gray-200 text-gray-600';
              const savingsLabel = pack.id === 'sofa-impermeabilizacao' ? 'Preço VIP' : 'Poupe 10%';

              return (
                <div key={pack.id}>
                  {/* Pack header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {savingsLabel}
                        </span>
                        <span className="text-xs text-[#111111]/40">
                          {pack.selectors.length === 1 ? '1 opção configurável' : `${pack.selectors.length} opções configuráveis`}
                        </span>
                      </div>
                      <h2 className="font-playfair text-xl font-bold text-[#111111]">{pack.name}</h2>
                      <p className="text-sm text-[#111111]/50 mt-0.5">{pack.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#111111]/35 mb-0.5">a partir de</p>
                      <p className="font-playfair text-2xl font-bold" style={{ color: "#D4AF37" }}>{fromPrice}€</p>
                    </div>
                  </div>

                  {/* Cities grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {packCities.map(city => (
                      <Link
                        key={city.slug}
                        to={`/${pack.slug}-${city.slug}`}
                        className="group flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:shadow-sm transition-all"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#111111] group-hover:text-[#0d3c47]">{city.name}</p>
                          <p className="text-[10px] text-[#111111]/35">desde {fromPrice}€</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#111111]/25 group-hover:text-gold group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="mt-8 h-px bg-[#E8E4DE]" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick reference table */}
        <section className="py-10 bg-[#FDFDF9]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-xl font-bold text-[#111111] mb-6">Comparação rápida dos packs</h2>
            <div className="overflow-x-auto rounded-2xl border border-[#E8E4DE]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E4DE] bg-[#FDFDF9]">
                    <th className="text-left px-5 py-3 font-bold text-[#111111]/60 text-xs uppercase tracking-wide">Pack</th>
                    <th className="text-left px-5 py-3 font-bold text-[#111111]/60 text-xs uppercase tracking-wide">Serviços</th>
                    <th className="text-left px-5 py-3 font-bold text-[#111111]/60 text-xs uppercase tracking-wide">Desconto</th>
                    <th className="text-left px-5 py-3 font-bold text-[#111111]/60 text-xs uppercase tracking-wide">Desde</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {packs.map((pack, i) => {
                    const fromPrice = getFromPrice(pack);
                    return (
                      <tr key={pack.id} className={i < packs.length - 1 ? "border-b border-[#E8E4DE]" : ""}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#111111]">{pack.name}</p>
                          <p className="text-[11px] text-[#111111]/40 mt-0.5 max-w-[200px]">{pack.tagline.split(':')[0]}</p>
                        </td>
                        <td className="px-5 py-4 text-[#111111]/60">
                          {pack.selectors.map(s => s.label).join(' + ')}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            {pack.id === 'sofa-impermeabilizacao' ? 'VIP' : '10%'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold tabular-nums" style={{ color: "#D4AF37" }}>
                          {fromPrice}€
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            to={`/${pack.slug}-${packCities[0].slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                          >
                            Ver pack <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Back to packs */}
        <section className="py-8 bg-[#FDFDF9] border-t border-[#E8E4DE]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-[#111111]/50">
              {packs.length * packCities.length} combinações disponíveis · Reserva via WhatsApp · Resposta em menos de 30 min
            </p>
            <Link
              to="/packs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] hover:text-gold transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Ver página de packs
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default PacksSitemap;

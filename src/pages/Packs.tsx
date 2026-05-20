import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Tag, Map } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { packs, packCities, getFromPrice } from "@/data/packComboData";

const Packs = () => {
  const defaultCity = packCities[0];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://cleansolutions.com.pt/packs#webpage",
        "url": "https://cleansolutions.com.pt/packs",
        "name": "Packs de Limpeza com Desconto | Kyro Clean Solutions",
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": "https://cleansolutions.com.pt/#website" },
        "publisher": { "@id": "https://cleansolutions.com.pt/#business" },
        "breadcrumb": { "@id": "https://cleansolutions.com.pt/packs#breadcrumb" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://cleansolutions.com.pt/packs#breadcrumb",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://cleansolutions.com.pt/" },
          { "@type": "ListItem", "position": 2, "name": "Packs", "item": "https://cleansolutions.com.pt/packs" },
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
        <section className="pt-24 md:pt-28 pb-10 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full mb-4">
              <Tag className="w-3 h-3" /> Poupe combinando serviços
            </span>
            <h1 className="font-playfair text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Packs com Desconto
            </h1>
            <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-5" />
            <p className="text-white/70 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              Ao agendar vários serviços na mesma visita, paga menos e aproveita ao máximo a deslocação da equipa.
              Todos os packs têm 20% de desconto sobre os preços individuais.
            </p>
          </div>
        </section>

        {/* Packs grid */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {packs.map(pack => {
                const fromPrice = getFromPrice(pack);
                const savingsLabel = pack.id === 'sofa-impermeabilizacao' ? 'Preço VIP' : 'Poupe 20%';

                return (
                  <Link
                    key={pack.id}
                    to={`/${pack.slug}-${defaultCity.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gold/30 transition-all flex flex-col overflow-hidden"
                  >
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          {savingsLabel}
                        </span>
                        <span className="text-xs font-semibold text-[#1A1A2E]/30">
                          {pack.selectors.length} {pack.selectors.length === 1 ? 'opção' : 'opções'}
                        </span>
                      </div>
                      <h2 className="font-playfair font-bold text-[#0d3c47] text-lg leading-snug mb-1">
                        {pack.name}
                      </h2>
                      <p className="text-xs text-[#1A1A2E]/40 mb-4 leading-relaxed">{pack.tagline}</p>
                      <ul className="space-y-1.5 mb-5">
                        {pack.features.slice(0, 3).map(f => (
                          <li key={f} className="flex items-start gap-2 text-sm text-[#1A1A2E]/60">
                            <CheckCircle className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="font-bold text-[#0d3c47]">
                          Desde <span className="text-gold text-lg">{fromPrice}€</span>
                        </p>
                        <span className="flex items-center gap-1 text-xs font-semibold text-gold group-hover:gap-2 transition-all">
                          Configurar <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* City selector note */}
            <p className="text-center text-sm text-[#1A1A2E]/40 mt-6">
              Preços para {defaultCity.name} · Disponível também em{" "}
              {packCities.slice(1).map(c => c.name).join(", ")}
            </p>

            {/* Sitemap link */}
            <div className="flex justify-center mt-4">
              <Link
                to="/guia-de-packs"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#1A1A2E]/50 hover:text-gold transition-colors border border-[#E8E4DE] bg-white px-4 py-2 rounded-full"
              >
                <Map className="w-3.5 h-3.5" />
                Ver todos os packs por cidade
              </Link>
            </div>
          </div>
        </section>

        {/* Why pack logic */}
        <section className="py-10 bg-white border-t border-[#E8E4DE]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-2xl font-bold text-[#1A1A2E] text-center mb-8">
              Porquê escolher um pack?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  title: "Uma visita, dois serviços",
                  desc: "A equipa trata de tudo na mesma deslocação. Poupa tempo e não precisa de remarcar.",
                },
                {
                  title: "20% de desconto real",
                  desc: "Todos os packs têm 20% de desconto calculado sobre os preços individuais de cada serviço.",
                },
                {
                  title: "Preço confirmado no WhatsApp",
                  desc: "Configure o pack, veja o preço exacto e reserve directamente via WhatsApp. Sem surpresas.",
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-black text-[#071a12]" style={{ background: "#D4AF37" }}>
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-[#1A1A2E] text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#1A1A2E]/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 md:py-12 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-3">
              Não sabe qual pack escolher?
            </h2>
            <p className="text-white/70 mb-6">Responda a 3 perguntas e receba o orçamento certo para a sua casa.</p>
            <QuizButton />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Packs;

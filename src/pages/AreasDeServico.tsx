import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Phone, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { cities, services } from "@/data/locationSeoData";
import { municipiosComFreguesias, getFreguesiaStats } from "@/data/freguesiaSeoData";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";

const ampCities = cities.filter((_, i) => i < 19); // AMP + Braga/Guimarães
const lisboaCities = cities.filter((_, i) => i >= 19);

const AreasDeServico = () => {
  const [openMunicipio, setOpenMunicipio] = useState<string | null>(null);
  const stats = getFreguesiaStats();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-24 md:pt-28 pb-10 md:pb-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gold" />
                <span className="text-gold font-semibold text-sm uppercase tracking-wide">Cobertura Nacional</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111] mb-4">
                Áreas de Serviço
              </h1>
              <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-5" />
              <p className="text-base md:text-lg text-[#111111]/55 leading-relaxed max-w-2xl mx-auto mb-4">
                A Kyro Clean Solutions presta serviços de limpeza profissional de estofos ao domicílio em {stats.municipios} municípios e {stats.freguesias} freguesias.
              </p>
              <p className="text-sm text-[#111111]/55 mb-6">
                {stats.totalPages}+ páginas de serviço local
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <QuizButton />
                <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 bg-secondary text-[#111111] font-semibold text-sm px-5 py-2.5 rounded-full border border-border/30 hover:bg-secondary/80 transition-colors">
                  <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Porto Metropolitan Area */}
        <section className="py-12 md:py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[#111111] mb-8">
                <MapPin className="w-6 h-6 text-gold inline mr-2" />
                Área Metropolitana do Porto
              </h2>
              <div className="space-y-3">
                {municipiosComFreguesias.map(m => {
                  const isOpen = openMunicipio === m.slug;
                  const cityExists = ampCities.some(c => c.slug === m.slug);
                  return (
                    <div key={m.slug} className="bg-card rounded-xl border border-border/30 overflow-hidden">
                      <button
                        onClick={() => setOpenMunicipio(isOpen ? null : m.slug)}
                        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-secondary/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-turquoise flex-shrink-0" />
                          <div>
                            <span className="text-base md:text-lg font-bold text-[#111111]">{m.name}</span>
                            <span className="block text-xs text-[#111111]/55">{m.freguesias.length} freguesias</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-[#111111]/55 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="px-4 md:px-5 pb-5 border-t border-border/20">
                          {/* Municipality service links */}
                          {cityExists && (
                            <div className="mb-4 pt-4">
                              <p className="text-xs font-semibold text-[#111111]/55 uppercase tracking-wide mb-2">Serviços em {m.name}</p>
                              <div className="flex flex-wrap gap-2">
                                {services.map(svc => (
                                  <Link
                                    key={svc.slug}
                                    to={`/${svc.slug}-${m.slug}`}
                                    className="inline-flex items-center gap-1.5 bg-gold/5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#111111] border border-gold/20 hover:bg-gold/10 transition-colors"
                                  >
                                    <ArrowRight className="w-3 h-3 text-gold" />
                                    {svc.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Freguesias */}
                          <p className="text-xs font-semibold text-[#111111]/55 uppercase tracking-wide mb-2">Freguesias</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {m.freguesias.map(f => (
                              <Link
                                key={f.slug}
                                to={`/limpeza-sofas-${m.slug}-${f.slug}`}
                                className="group flex items-center gap-1.5 bg-secondary/30 px-3 py-2 rounded-lg text-sm text-[#111111] hover:bg-gold/5 hover:border-gold/30 border border-transparent transition-all"
                              >
                                <MapPin className="w-3 h-3 text-gold flex-shrink-0" />
                                <span className="group-hover:text-turquoise transition-colors truncate">{f.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Lisboa Region */}
        {lisboaCities.length > 0 && (
          <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111111] mb-8">
                  <MapPin className="w-6 h-6 text-gold inline mr-2" />
                  Lisboa e Região
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lisboaCities.map(city => (
                    <div key={city.slug} className="bg-card rounded-xl p-5 shadow-sm border border-border/30 hover:shadow-md hover:border-gold/20 transition-all">
                      <h3 className="text-lg font-bold text-[#111111] mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-turquoise" />
                        {city.name}
                      </h3>
                      <p className="text-xs text-[#111111]/55 mb-3 capitalize">{city.description}</p>
                      <div className="space-y-1.5">
                        {services.map(svc => (
                          <Link
                            key={svc.slug}
                            to={`/${svc.slug}-${city.slug}`}
                            className="group flex items-center gap-2 text-sm text-[#111111] hover:text-turquoise transition-colors"
                          >
                            <ArrowRight className="w-3 h-3 text-gold group-hover:translate-x-0.5 transition-transform" />
                            {svc.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-10 md:py-14 bg-kyro-green">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-3">
              Precisa de limpeza profissional na sua cidade?
            </h2>
            <p className="text-white/60 mb-6 text-base">
              Peça o seu orçamento gratuito: resposta em menos de 30 minutos.
            </p>
            <QuizButton />
          </div>
        </section>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": `${SITE_URL}/areas-de-servico#webpage`,
                  "url": `${SITE_URL}/areas-de-servico`,
                  "name": "Áreas de Serviço | Kyro Clean Solutions",
                  "description": `Serviços de limpeza profissional em ${stats.municipios} municípios e ${stats.freguesias} freguesias da Área Metropolitana do Porto e Lisboa.`,
                  "inLanguage": "pt-PT",
                  "isPartOf": { "@id": `${SITE_URL}/#website` },
                  "publisher": { "@id": `${SITE_URL}/#business` },
                  "breadcrumb": { "@id": `${SITE_URL}/areas-de-servico#breadcrumb` },
                },
                {
                  "@type": "BreadcrumbList",
                  "@id": `${SITE_URL}/areas-de-servico#breadcrumb`,
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": `${SITE_URL}/` },
                    { "@type": "ListItem", "position": 2, "name": "Áreas de Serviço", "item": `${SITE_URL}/areas-de-servico` },
                  ],
                },
              ],
            }),
          }}
        />
      </main>
      <Footer />
    </>
  );
};

export default AreasDeServico;

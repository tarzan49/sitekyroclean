import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Phone, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import SectionHeader from "@/components/SectionHeader";
import { cities, services } from "@/data/locationSeoData";
import { municipiosComFreguesias, getFreguesiaStats, type MunicipioGroup } from "@/data/freguesiaSeoData";
import { SITE_URL, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";

type Area = "porto" | "lisboa" | "algarve";

const REGIONS: { area: Area; heading: string; goldWord: string }[] = [
  { area: "porto", heading: "Área Metropolitana do", goldWord: "Porto e Norte" },
  { area: "lisboa", heading: "Lisboa e Área", goldWord: "Metropolitana" },
  { area: "algarve", heading: "Cobertura no", goldWord: "Algarve" },
];

function citiesForArea(area: Area) {
  return cities.filter(c => c.area === area);
}

function municipiosForArea(area: Area) {
  const slugs = new Set(citiesForArea(area).map(c => c.slug));
  return municipiosComFreguesias.filter(m => slugs.has(m.slug));
}

const RegionSection = ({
  heading,
  goldWord,
  area,
  openMunicipio,
  setOpenMunicipio,
}: {
  heading: string;
  goldWord: string;
  area: Area;
  openMunicipio: string | null;
  setOpenMunicipio: (slug: string | null) => void;
}) => {
  const municipios = municipiosForArea(area);
  const areaCities = citiesForArea(area);

  return (
    <section className="py-12 md:py-16 odd:bg-secondary/20 even:bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            overline="Cobertura"
            heading={heading}
            goldWord={goldWord}
            light={true}
          />
          <div className="space-y-3">
            {municipios.map((m: MunicipioGroup) => {
              const isOpen = openMunicipio === m.slug;
              const cityExists = areaCities.some(c => c.slug === m.slug);
              return (
                <div key={m.slug} className="bg-card rounded-xl border border-border/30 overflow-hidden">
                  <button
                    onClick={() => setOpenMunicipio(isOpen ? null : m.slug)}
                    className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
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
                      {m.freguesias.length > 0 && (
                        <>
                          <p className="text-xs font-semibold text-[#111111]/55 uppercase tracking-wide mb-2">Freguesias</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {m.freguesias.map(f => (
                              <Link
                                key={f.slug}
                                to={`/limpeza-sofas-${m.slug}-${f.slug}`}
                                className="group flex items-center gap-1.5 bg-secondary/30 px-3 py-2 rounded-lg text-sm text-[#111111] hover:bg-gold/5 hover:border-gold/30 border border-transparent transition-all"
                              >
                                <MapPin className="w-3 h-3 text-gold flex-shrink-0" />
                                <span className="group-hover:text-gold transition-colors truncate">{f.name}</span>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const AreasDeServico = () => {
  const [openMunicipio, setOpenMunicipio] = useState<string | null>(null);
  const stats = getFreguesiaStats();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-24 md:pt-28 pb-10 md:pb-14 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>
                Cobertura Nacional
              </p>
            </div>
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] text-[#111111]">
              Áreas de{" "}
              <em className="not-italic" style={{ color: "#D4AF37" }}>Serviço</em>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#111111]/55 leading-relaxed max-w-2xl">
              A Kyro Clean Solutions presta serviços de limpeza profissional de estofos ao domicílio em {stats.municipios} municípios e {stats.freguesias} freguesias, do Porto ao Algarve.
            </p>
            <p className="text-sm text-[#111111]/55 mt-2 mb-6">
              {stats.totalPages}+ páginas de serviço local
            </p>
            <div className="flex flex-wrap gap-3">
              <QuizButton />
              <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 bg-secondary text-[#111111] font-semibold text-sm px-5 py-2.5 rounded-full border border-border/30 hover:bg-secondary/80 transition-colors">
                <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        {REGIONS.map(r => (
          <RegionSection
            key={r.area}
            heading={r.heading}
            goldWord={r.goldWord}
            area={r.area}
            openMunicipio={openMunicipio}
            setOpenMunicipio={setOpenMunicipio}
          />
        ))}

        {/* CTA */}
        <section className="py-10 md:py-14 bg-kyro-green">
          <div className="container mx-auto px-4 max-w-4xl">
            <SectionHeader
              overline="Comece já"
              heading="Precisa de limpeza profissional na sua"
              goldWord="cidade?"
              subtitle="Peça o seu orçamento gratuito: resposta em menos de 30 minutos."
              light={false}
            />
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
                  "description": `Serviços de limpeza profissional em ${stats.municipios} municípios e ${stats.freguesias} freguesias do Porto, Lisboa e Algarve.`,
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

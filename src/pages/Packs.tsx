import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Map, Percent, Clock, Layers, Sofa, Droplets, Home, BedDouble } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import SectionHeader from "@/components/SectionHeader";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import { packs, packCities, getFromPrice } from "@/data/packComboData";
import { SITE_URL } from "@/constants/business";
import { SERVICE_HERO_IMAGES } from "@/constants/serviceContent";

const PACK_ICON: Record<string, typeof Sofa> = {
  'sofa-colchao': Sofa,
  'sofa-impermeabilizacao': Droplets,
  'sala-completa': Home,
  'quarto-completo': BedDouble,
};

const snapshotStats = [
  { icon: Layers, value: String(packs.length), label: "Packs disponíveis" },
  { icon: Percent, value: "10%", label: "Poupança garantida" },
  { icon: Map, value: String(packCities.length), label: "Cidades cobertas" },
  { icon: Clock, value: "30min", label: "Confirmação WhatsApp" },
];

const Packs = () => {
  const defaultCity = packCities[0];
  const heroImg = SERVICE_HERO_IMAGES['limpeza-sofas'];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/packs#webpage`,
        "url": `${SITE_URL}/packs`,
        "name": "Packs de Limpeza com Desconto | Kyro Clean Solutions",
        "inLanguage": "pt-PT",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "publisher": { "@id": `${SITE_URL}/#business` },
        "breadcrumb": { "@id": `${SITE_URL}/packs#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/packs#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Início", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Packs", "item": `${SITE_URL}/packs` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />
      <main>

        {/* ═══ HERO + SNAPSHOT (fundo fotográfico contínuo) ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <picture className="w-full h-full">
              <source media="(max-width: 767px)" srcSet={heroImg.m} />
              <source media="(min-width: 768px)" srcSet={heroImg.d} />
              <img src={heroImg.d} alt="Packs de limpeza de estofos com desconto" className="w-full h-full object-cover" loading="eager" />
            </picture>
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.55) 0%, rgba(7,26,18,0.75) 40%, rgba(7,26,18,0.94) 78%, rgba(7,26,18,0.98) 100%)" }} />

          <section className="relative pt-24 md:pt-28 pb-14 md:pb-20">
            <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
              <div className="inline-flex items-center gap-3 mb-5">
                <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.9 }}>
                  Poupe combinando serviços
                </p>
                <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
              </div>

              <h1
                className="font-playfair text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
                style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
              >
                Packs com <em className="not-italic" style={{ color: "#D4AF37" }}>Desconto</em>
              </h1>

              <p className="text-white/70 max-w-xl mx-auto text-base md:text-lg leading-relaxed mb-7">
                Ao agendar vários serviços na mesma visita, paga menos e aproveita ao máximo a deslocação da equipa.
                Todos os packs têm 10% de desconto sobre os preços individuais.
              </p>

              <div className="flex justify-center">
                <TrustRatingBadge variant="mapsLinkClients" />
              </div>
            </div>
          </section>

          <ServiceSnapshotStats stats={snapshotStats} />
        </div>

        {/* ═══ PACKS GRID ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Escolha o seu pack"
              heading="4 combinações,"
              goldWord="1 visita"
              subtitle="Selecione o pack que melhor se adequa à sua casa. Configure as opções e veja o preço exacto antes de reservar."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {packs.map(pack => {
                const fromPrice = getFromPrice(pack);
                const isVip = pack.id === 'sofa-impermeabilizacao';
                const isPopular = pack.id === 'sala-completa';
                const Icon = PACK_ICON[pack.id] ?? Sofa;

                return (
                  <Link
                    key={pack.id}
                    to={`/${pack.slug}-${defaultCity.slug}`}
                    className="group relative bg-white rounded-sm border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:shadow-lg transition-all flex flex-col overflow-hidden"
                    style={{ borderTop: "3px solid rgba(212,175,55,0.55)" }}
                  >
                    {isPopular && (
                      <span
                        className="absolute top-0 right-0 text-[9px] font-bold uppercase tracking-[0.14em] text-[#071a12] px-3 py-1"
                        style={{ background: "#D4AF37", borderBottomLeftRadius: "2px" }}
                      >
                        Mais popular
                      </span>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4 flex-shrink-0" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}>
                        <Icon className="w-5 h-5" style={{ color: "#D4AF37" }} strokeWidth={1.75} />
                      </div>

                      <span
                        className="self-start text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3"
                        style={{ color: "#D4AF37", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.22)" }}
                      >
                        {isVip ? 'Preço VIP · 1 visita' : 'Poupe 10%'}
                      </span>

                      <h2 className="font-playfair font-bold text-[#111111] text-lg leading-snug mb-1">
                        {pack.name}
                      </h2>
                      <p className="text-xs text-[#111111]/45 mb-4 leading-relaxed">{pack.tagline}</p>

                      <ul className="space-y-1.5 mb-5">
                        {pack.features.slice(0, 3).map(f => (
                          <li key={f} className="flex items-start gap-2 text-sm text-[#111111]/60">
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-4" style={{ borderTop: "1px solid #E8E4DE" }}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-[#111111]/40">
                            {pack.selectors.length} {pack.selectors.length === 1 ? 'opção' : 'opções'}
                          </p>
                          <p className="font-bold text-[#111111]">
                            Desde <span className="font-playfair text-lg" style={{ color: "#D4AF37" }}>{fromPrice}€</span>
                          </p>
                        </div>
                        <span
                          className="flex items-center justify-center gap-1.5 w-full h-10 rounded-full text-xs font-bold uppercase tracking-wide transition-all"
                          style={{ color: "#071a12", background: "#D4AF37" }}
                        >
                          Configurar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* City selector note */}
            <p className="text-center text-sm text-[#111111]/40 mt-8">
              Preços para {defaultCity.name} · Disponível também em{" "}
              {packCities.slice(1).map(c => c.name).join(", ")}
            </p>

            {/* Sitemap link */}
            <div className="flex justify-center mt-4">
              <Link
                to="/guia-de-packs"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#111111]/50 hover:text-[#D4AF37] transition-colors border border-[#E8E4DE] bg-white px-4 py-2 rounded-full"
              >
                <Map className="w-3.5 h-3.5" />
                Ver todos os packs por cidade
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ WHY PACK LOGIC ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Porquê escolher um pack"
              heading="Mais serviço,"
              goldWord="menos custo"
              light={false}
              subtitle="Combinar serviços na mesma visita não é só mais prático, é a forma mais inteligente de cuidar da sua casa."
            />

            <div className="grid sm:grid-cols-3 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {[
                {
                  title: "Uma visita, dois serviços",
                  desc: "A equipa trata de tudo na mesma deslocação. Poupa tempo e não precisa de remarcar.",
                },
                {
                  title: "10% de desconto real",
                  desc: "Todos os packs têm 10% de desconto calculado sobre os preços individuais de cada serviço.",
                },
                {
                  title: "Preço confirmado no WhatsApp",
                  desc: "Configure o pack, veja o preço exacto e reserve directamente via WhatsApp. Sem surpresas.",
                },
              ].map((item, i) => (
                <div key={i} className="p-6 md:p-8 text-center bg-kyro-green" style={{ borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <p className="font-playfair text-3xl font-bold mb-3" style={{ color: "#D4AF37", opacity: 0.3 }}>
                    0{i + 1}
                  </p>
                  <h3 className="font-semibold text-white text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <div
              className="rounded-sm p-8 md:p-12 text-center"
              style={{ background: "#071a12", border: "1px solid rgba(212,175,55,0.22)" }}
            >
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                Kyro Clean Solutions
              </p>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-3">
                Não sabe qual pack escolher?
              </h2>
              <p className="text-white/60 mb-7 max-w-md mx-auto">
                Responda a 3 perguntas e receba o orçamento certo para a sua casa.
              </p>
              <div className="flex justify-center">
                <QuizButton />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default Packs;

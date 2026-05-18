import { useMemo, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Star, ArrowRight, Shield, Zap, MessageCircle, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getAllPackComboRoutes,
  getPackByCityAndId,
  calcPackPrices,
  getDefaultSelections,
  buildWhatsAppUrl,
} from "@/data/packComboData";

const PackComboPage = () => {
  const { pathname } = useLocation();

  const data = useMemo(() => {
    const route = getAllPackComboRoutes().find(r => r.path === pathname);
    if (!route) return null;
    return getPackByCityAndId(route.packId, route.citySlug);
  }, [pathname]);

  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setSelections(getDefaultSelections(data.pack));
  }, [data]);

  if (!data) {
    return (
      <>
        <Header />
        <main className="pt-28 pb-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-playfair text-3xl font-bold text-[#1A1A2E] mb-4">Página não encontrada</h1>
            <Link to="/" style={{ color: "#D4AF37" }} className="hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { pack, city } = data;

  const prices = useMemo(
    () => calcPackPrices(pack, selections),
    [pack, selections]
  );

  const waUrl = useMemo(
    () => prices ? buildWhatsAppUrl(pack, city, selections, prices) : `https://wa.me/351925530647`,
    [pack, city, selections, prices]
  );

  const pageUrl = `https://www.cleansolutions.com.pt${pathname}`;
  const fromPriceText = prices ? `${prices.packTotal}€` : `a calcular`;
  const pageTitle = `${pack.name} em ${city.name} — Desde ${fromPriceText} | Kyro Clean`;
  const pageDesc = `${pack.description} Poupe até 20% em relação ao preço individual. Serviço ao domicílio em ${city.name}.`;

  useEffect(() => {
    document.title = pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", pageDesc);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", pageDesc);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", pageUrl);
  }, [pageTitle, pageDesc, pageUrl]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${pack.name} em ${city.name}`,
    "description": pack.description,
    "url": pageUrl,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Kyro Clean Solutions",
      "url": "https://www.cleansolutions.com.pt",
      "telephone": "+351925530647",
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "50" },
    },
    "areaServed": { "@type": "City", "name": city.name },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "areaServed": { "@type": "City", "name": city.name },
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "EUR",
        "description": `Pack ${pack.name} — preço com desconto, IVA incluído`,
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.cleansolutions.com.pt/" },
      { "@type": "ListItem", "position": 2, "name": "Packs", "item": "https://www.cleansolutions.com.pt/packs" },
      { "@type": "ListItem", "position": 3, "name": `${pack.name} em ${city.name}`, "item": pageUrl },
    ],
  };

  const allSelected = pack.selectors.every(s => !!selections[s.key]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-10 overflow-hidden bg-checker-dark">
          <div className="absolute inset-0 opacity-5" style={{ background: "radial-gradient(circle at 30% 50%, #D4AF37, transparent 55%)" }} />
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-white/80">Início</Link>
                <span>/</span>
                <Link to="/packs" className="hover:text-white/80">Packs</Link>
                <span>/</span>
                <span className="text-white/70">{pack.name} — {city.name}</span>
              </nav>

              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                {pack.id === 'sofa-impermeabilizacao' ? 'Preço VIP · 1 visita' : `Poupe ${prices ? prices.savingsPct : 20}%`}
              </p>

              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {pack.name} em {city.name}
              </h1>

              <div className="w-10 h-px mb-5 opacity-50" style={{ backgroundColor: "#D4AF37" }} />

              <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
                {pack.tagline}
              </p>
            </div>
          </div>
        </section>

        {/* ═══ CONFIGURADOR ═══ */}
        <section className="py-10 md:py-14 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">

              <div className="text-center mb-8">
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-2" style={{ color: "#D4AF37" }}>
                  Passo 1 de 2
                </p>
                <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1A2E]">
                  Configure o seu pack
                </h2>
                <p className="text-sm text-[#1A1A2E]/50 mt-1">Selecione as opções abaixo para ver o preço exacto</p>
              </div>

              {/* Selectors */}
              <div className="space-y-5 mb-8">
                {pack.selectors.map(sel => (
                  <div key={sel.key}>
                    <p className="text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-widest mb-2">{sel.label}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {sel.options.map(opt => {
                        const isSelected = selections[sel.key] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelections(prev => ({ ...prev, [sel.key]: opt.id }))}
                            className={[
                              "relative flex flex-col items-start text-left px-3 py-3 rounded-xl border-2 transition-all",
                              isSelected
                                ? "border-[#D4AF37] bg-[#D4AF37]/[0.06]"
                                : "border-[#E8E4DE] bg-white hover:border-[#D4AF37]/40",
                            ].join(" ")}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#D4AF37" }}>
                                <CheckCircle className="w-3 h-3 text-white" />
                              </span>
                            )}
                            <span className="text-sm font-bold text-[#1A1A2E]">{opt.label}</span>
                            {opt.sublabel && (
                              <span className="text-[10px] text-[#1A1A2E]/40 mt-0.5 leading-snug">{opt.sublabel}</span>
                            )}
                            <span className="text-xs font-semibold mt-2" style={{ color: "#D4AF37" }}>{opt.price}€</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live price card */}
              <div
                className="rounded-2xl overflow-hidden border mb-6"
                style={{ borderColor: "rgba(212,175,55,0.25)", background: "#071a12" }}
              >
                {/* Price comparison header */}
                <div className="grid grid-cols-2 divide-x" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="px-5 py-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Individual</p>
                    <p className="text-xl font-bold text-white/35 line-through tabular-nums">
                      {prices ? `${prices.individualTotal}€` : '—'}
                    </p>
                  </div>
                  <div className="px-5 py-4" style={{ background: "rgba(212,175,55,0.06)" }}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#D4AF37" }}>Preço Pack</p>
                    <p className="font-playfair text-2xl font-bold tabular-nums" style={{ color: "#D4AF37" }}>
                      {prices ? `${prices.packTotal}€` : '—'}
                    </p>
                  </div>
                </div>

                {/* Savings banner */}
                {prices && prices.savings > 0 && (
                  <div className="px-5 py-2.5 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    <span className="text-xs text-white/40">Poupança real</span>
                    <span className="text-xs font-black text-green-400">
                      {prices.savings}€ ({prices.savingsPct}% desconto)
                    </span>
                  </div>
                )}

                {/* Selection breakdown */}
                {prices && (
                  <div className="px-5 py-3 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {prices.lines.map((line, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-white/45">{line.label}</span>
                        <span className="text-white/50 tabular-nums">{line.individual}€</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 pb-3 pt-1">
                  <p className="text-[9px] text-white/20">IVA incluído · Sujeito a confirmação · Preço fixo após confirmar</p>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="flex flex-col gap-3">
                <a
                  href={allSelected ? waUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => { if (!allSelected) e.preventDefault(); }}
                  className={[
                    "w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-bold text-base transition-all active:scale-[0.98] touch-manipulation",
                    allSelected
                      ? "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_4px_24px_rgba(37,211,102,0.30)]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  {allSelected
                    ? `Reservar via WhatsApp — ${prices?.packTotal ?? ''}€`
                    : 'Selecione as opções acima'}
                </a>

                <p className="text-center text-[10px] text-[#1A1A2E]/35">
                  A mensagem pré-preenchida inclui o pack, as opções selecionadas e o preço.
                  O responsável confirma em menos de 15 min.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ═══ COMO FUNCIONA ═══ */}
        <section className="py-10 bg-white border-t border-[#E8E4DE]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4 text-center" style={{ color: "#D4AF37" }}>
                Passo 2 de 2
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { n: '1', title: 'Envie o pack', desc: 'Clique no botão WhatsApp — a mensagem já vem preenchida com os detalhes.' },
                  { n: '2', title: 'Confirmamos', desc: 'Respondemos em menos de 15 min a confirmar data e horário.' },
                  { n: '3', title: 'Tratamos de tudo', desc: 'A equipa desloca-se e executa ambos os serviços na mesma visita.' },
                ].map(step => (
                  <div key={step.n} className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-[#071a12]" style={{ background: "#D4AF37" }}>
                      {step.n}
                    </div>
                    <p className="text-xs font-bold text-[#1A1A2E]">{step.title}</p>
                    <p className="text-[11px] text-[#1A1A2E]/45 leading-snug">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ O QUE ESTÁ INCLUÍDO ═══ */}
        <section className="py-12 md:py-16 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Incluído</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-6">O que está incluído</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {pack.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.04]">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                    <span className="text-sm md:text-base text-white/80 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TESTEMUNHO + GARANTIAS ═══ */}
        <section className="py-10 md:py-12 bg-white">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
              <div className="bg-[#FDFDF9] rounded-2xl p-6 shadow-sm border border-[#E8E4DE]">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                </div>
                <p className="text-[#1A1A2E]/60 text-sm leading-relaxed italic mb-3">
                  "{pack.testimonial.text}"
                </p>
                <p className="text-xs font-bold text-[#1A1A2E]">{pack.testimonial.author}</p>
              </div>

              <div className="rounded-2xl p-6 shadow-sm border space-y-3" style={{ background: "#071a12", borderColor: "rgba(212,175,55,0.2)" }}>
                <h3 className="font-semibold text-white text-sm mb-1">Garantias incluídas</h3>
                {[
                  { icon: Shield, text: "Garantia de satisfação 100%" },
                  { icon: Zap, text: `Serviço ao domicílio em ${city.name}` },
                  { icon: CheckCircle, text: "Produtos certificados e seguros" },
                  { icon: Star, text: "5.0 · 50+ avaliações Google verificadas" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                    <span className="text-sm text-white/70">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="py-10 md:py-14 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>Kyro Clean Solutions</p>
            <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-2">
              Pronto para reservar?
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Configure acima e envie via WhatsApp. Confirmamos em menos de 15 min.
            </p>
            <a
              href="#configurador"
              onClick={e => {
                e.preventDefault();
                document.querySelector('section:nth-of-type(2)')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[#071a12] transition-all hover:opacity-90"
              style={{ background: "#D4AF37" }}
            >
              Configurar o pack
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* ═══ SERVIÇOS INDIVIDUAIS ═══ */}
        <section className="py-10 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-base font-playfair font-bold text-[#1A1A2E] mb-4">Serviços individuais</h3>
              <div className="flex flex-wrap gap-2">
                <Link to={`/${pack.service1Slug}`} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 transition-all">
                  <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />{pack.service1}
                </Link>
                <Link to={`/${pack.service2Slug}`} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 transition-all">
                  <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />{pack.service2}
                </Link>
                <Link to={`/${pack.service1Slug}-${city.slug}`} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 transition-all">
                  <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />{pack.service1} em {city.name}
                </Link>
                <Link to="/guia-de-packs" className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 transition-all">
                  <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />Todos os packs disponíveis
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default PackComboPage;

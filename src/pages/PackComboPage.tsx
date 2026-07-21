import { useMemo, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Star, ArrowRight, Shield, Zap, MessageCircle, Sofa, BedDouble, Armchair, LayoutGrid, Quote } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import {
  getAllPackComboRoutes,
  getPackByCityAndId,
  calcPackPrices,
  getDefaultSelections,
  getFromPrice,
  buildWhatsAppUrl,
} from "@/data/packComboData";
import { cityPrep } from "@/data/locationSeoData";
import { pickServiceHero, SERVICE_RESULT_IMAGES } from "@/constants/serviceContent";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
} from "@/lib/seoSchema";

const SELECTOR_ICON: Record<string, typeof Sofa> = {
  sofa: Sofa,
  colchao: BedDouble,
  tapete: LayoutGrid,
  cadeiras: Armchair,
};

const SELECTOR_SLUG: Record<string, string> = {
  sofa: 'limpeza-sofas',
  colchao: 'limpeza-colchoes',
  tapete: 'limpeza-tapetes',
  cadeiras: 'limpeza-cadeiras',
};

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

  const prices = useMemo(
    () => data ? calcPackPrices(data.pack, selections) : null,
    [data, selections]
  );

  const waUrl = useMemo(
    () => prices && data ? buildWhatsAppUrl(data.pack, data.city, selections, prices) : WHATSAPP_BASE,
    [data, selections, prices]
  );

  const pageUrl = `${SITE_URL}${pathname}`;
  const fromPriceText = prices ? `${prices.packTotal}€` : `a calcular`;
  const pageTitle = data ? `${data.pack.name} ${cityPrep(data.city.name)} ${data.city.name}, Desde ${fromPriceText} | Kyro Clean` : '';
  const pageDesc = data ? `${data.pack.description} Poupe até 10% em relação ao preço individual. Serviço ao domicílio ${cityPrep(data.city.name)} ${data.city.name}.` : '';

  useEffect(() => {
    if (!data) return;
    document.title = pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", pageDesc);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", pageTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", pageDesc);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", pageUrl);
  }, [pageTitle, pageDesc, pageUrl, data]);

  if (!data) {
    return (
      <>
        <Header />
        <main className="pt-28 pb-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-playfair text-3xl font-bold text-[#111111] mb-4">Página não encontrada</h1>
            <Link to="/" style={{ color: "#D4AF37" }} className="hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { pack, city } = data;
  const prep = cityPrep(city.name);
  const heroImgs = pickServiceHero(pack.service1Slug, city.name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageNode({ url: pageUrl, name: pageTitle, description: pageDesc }),
      buildBreadcrumbNode(`${pageUrl}#breadcrumb`, [
        { name: "Início", item: `${SITE_URL}/` },
        { name: "Packs", item: `${SITE_URL}/packs` },
        { name: `${pack.name} ${prep} ${city.name}`, item: pageUrl },
      ]),
      buildServiceNode({
        url: pageUrl,
        name: `${pack.name} ${prep} ${city.name}`,
        description: pack.description,
        areaServed: { "@type": "City", name: city.name },
        offers: buildOfferNode(String(getFromPrice(pack)), {
          validFrom: "2025-01-01",
          priceValidUntil: "2026-12-31",
          areaServed: { "@type": "City", name: city.name },
        }),
      }),
    ],
  };

  const allSelected = pack.selectors.every(s => !!selections[s.key]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header />
      <main>

        {/* ═══ HERO (fundo fotográfico) ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <picture className="w-full h-full">
              <source media="(max-width: 767px)" srcSet={heroImgs.m} />
              <source media="(min-width: 768px)" srcSet={heroImgs.d} />
              <img src={heroImgs.d} alt={`${pack.name} ${prep} ${city.name}`} className="w-full h-full object-cover" loading="eager" />
            </picture>
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.55) 0%, rgba(7,26,18,0.78) 45%, rgba(7,26,18,0.95) 80%, rgba(7,26,18,0.98) 100%)" }} />

          <section className="relative pt-24 md:pt-28 pb-12 md:pb-16">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-3xl">
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80">Início</Link>
                  <span>/</span>
                  <Link to="/packs" className="hover:text-white/80">Packs</Link>
                  <span>/</span>
                  <span className="text-white/70">{pack.name}, {city.name}</span>
                </nav>

                <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                  {pack.id === 'sofa-impermeabilizacao' ? 'Preço VIP · 1 visita' : `Poupe ${prices ? prices.savingsPct : 10}%`}
                </p>

                <h1
                  className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
                >
                  {pack.name} {prep} {city.name}
                </h1>

                <div className="w-10 h-px mb-5 opacity-50" style={{ backgroundColor: "#D4AF37" }} />

                <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-2xl mb-6">
                  {pack.tagline}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-2 text-sm font-semibold text-white bg-white/10 border border-white/15 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                    {pack.service1}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-white bg-white/10 border border-white/15 px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                    {pack.service2}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-white/60 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                    1 única visita · {city.name}
                  </span>
                </div>

                <TrustRatingBadge variant="mapsLinkClients" />
              </div>
            </div>
          </section>
        </div>

        {/* ═══ CONFIGURADOR ═══ */}
        <section id="configurador" className="py-10 md:py-14 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.9 }}>
                    Passo 1 de 2
                  </p>
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] leading-tight">
                  Configure o seu <em className="not-italic" style={{ color: "#D4AF37" }}>pack</em>
                </h2>
                <p className="text-sm text-[#111111]/50 mt-2 mb-4">Selecione as opções abaixo para ver o preço exacto</p>
                <div className="inline-flex items-center gap-3 rounded-sm px-5 py-3 text-sm text-[#111111]/70" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.22)" }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                  <span>Este pack inclui: <strong className="text-[#111111]">{pack.service1}</strong> + <strong className="text-[#111111]">{pack.service2}</strong></span>
                </div>
              </div>

              <div className="max-w-2xl">
              {/* Selectors */}
              <div className="space-y-6 mb-8">
                {pack.selectors.map(sel => {
                  const SelIcon = SELECTOR_ICON[sel.key] ?? Sofa;
                  return (
                    <div key={sel.key}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}>
                          <SelIcon className="w-4 h-4" style={{ color: "#D4AF37" }} strokeWidth={1.75} />
                        </div>
                        <p className="text-xs font-bold text-[#111111]/50 uppercase tracking-widest">{sel.label}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {sel.options.map(opt => {
                          const isSelected = selections[sel.key] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setSelections(prev => ({ ...prev, [sel.key]: opt.id }))}
                              className={[
                                "relative flex flex-col items-start text-left px-4 py-3.5 rounded-sm border-2 transition-all",
                                isSelected
                                  ? "border-[#D4AF37] bg-[#D4AF37]/[0.06] shadow-[0_2px_14px_rgba(212,175,55,0.16)]"
                                  : "border-[#E8E4DE] bg-white hover:border-[#D4AF37]/40",
                              ].join(" ")}
                            >
                              {isSelected && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#D4AF37" }}>
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </span>
                              )}
                              <span className="font-playfair text-base font-bold text-[#111111]">{opt.label}</span>
                              {opt.sublabel && (
                                <span className="text-[10px] text-[#111111]/40 mt-0.5 leading-snug">{opt.sublabel}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live price card */}
              <div
                className="rounded-sm overflow-hidden border mb-6"
                style={{ borderColor: "rgba(212,175,55,0.30)", background: "#0a1f15" }}
              >
                <div className="grid grid-cols-2 divide-x" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="px-5 py-6">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/35 mb-2">Preço separado</p>
                    <p className="text-3xl font-bold text-white/40 line-through tabular-nums leading-none">
                      {prices ? `${prices.individualTotal}€` : '-'}
                    </p>
                    <p className="text-[10px] text-white/25 mt-2">2 visitas separadas</p>
                  </div>
                  <div className="px-5 py-6" style={{ background: "rgba(212,175,55,0.07)" }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "#D4AF37" }}>Preço deste pack</p>
                    <p className="font-playfair text-4xl font-black tabular-nums leading-none" style={{ color: "#D4AF37" }}>
                      {prices ? `${prices.packTotal}€` : '-'}
                    </p>
                    {prices && prices.savingsPct > 0 && (
                      <p className="text-[10px] font-bold mt-2" style={{ color: "#D4AF37", opacity: 0.85 }}>Poupa {prices.savingsPct}%</p>
                    )}
                  </div>
                </div>

                {prices && prices.savings > 0 && (
                  <div className="mx-5 mt-5 mb-5 px-4 py-3 rounded-sm flex items-center justify-center text-sm font-bold text-center" style={{ background: "rgba(74,222,128,0.10)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}>
                    Poupa {prices.savings}€ nesta configuração. Compensa reservar o pack.
                  </div>
                )}

                {/* Selection breakdown */}
                {prices && (
                  <div className="px-5 py-3 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    {prices.lines.map((line, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-white/45">{line.label}</span>
                        <span className="text-white/50 tabular-nums">{line.individual}€</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 pb-4 pt-1">
                  <p className="text-[9px] text-white/25 text-center">Sujeito a confirmação · Preço fixo após confirmar</p>
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
                    "w-full h-16 flex items-center justify-center gap-3 rounded-sm transition-all active:scale-[0.98] touch-manipulation",
                    allSelected
                      ? "bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed",
                  ].join(" ")}
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0 text-white" />
                  {allSelected
                    ? <span className="text-white text-[13px] font-semibold tracking-[0.14em] uppercase">Reservar via WhatsApp <strong className="font-black text-base tracking-normal normal-case">{prices?.packTotal ?? ''}€</strong></span>
                    : <span className="text-sm font-bold">Selecione as opções acima</span>}
                </a>

                <p className="text-center text-[10px] text-[#111111]/35">
                  A mensagem pré-preenchida inclui o pack, as opções selecionadas e o preço.
                  O responsável confirma em menos de 30 min.
                </p>
              </div>

              </div>
            </div>
          </div>
        </section>

        {/* ═══ COMO FUNCIONA ═══ */}
        <section className="py-12 md:py-16 bg-kyro-green">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.9 }}>
                  Passo 2 de 2
                </p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white">
                Como <em className="not-italic" style={{ color: "#D4AF37" }}>funciona</em>
              </h2>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="relative grid grid-cols-3 gap-4 text-center">
                <div className="hidden sm:block absolute top-5 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, #D4AF37 12%, #D4AF37 88%, transparent)" }} aria-hidden="true" />
                {[
                  { n: '1', icon: MessageCircle, title: 'Envie o pack', desc: 'Clique no botão WhatsApp, a mensagem já vem preenchida com os detalhes.' },
                  { n: '2', icon: CheckCircle, title: 'Confirmamos', desc: 'Respondemos em menos de 30 min a confirmar data e horário.' },
                  { n: '3', icon: Zap, title: 'Tratamos de tudo', desc: 'A equipa desloca-se e executa ambos os serviços na mesma visita.' },
                ].map(step => (
                  <div key={step.n} className="relative flex flex-col items-center gap-2.5">
                    <div
                      className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "#0c2318", border: "1.5px solid #D4AF37", boxShadow: "0 0 18px rgba(212,175,55,0.25)" }}
                    >
                      <step.icon className="w-4 h-4" style={{ color: "#D4AF37" }} strokeWidth={2} />
                    </div>
                    <p className="text-xs font-bold text-white">{step.n}. {step.title}</p>
                    <p className="text-[11px] text-white/50 leading-snug">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ O QUE ESTÁ INCLUÍDO ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-60" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Incluído</p>
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-6">O que está incluído</h2>
                <div className="space-y-0">
                  {pack.features.slice(0, 6).map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3.5 py-3"
                      style={i < Math.min(pack.features.length, 6) - 1 ? { borderBottom: "1px solid #E8E4DE" } : undefined}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#D4AF37" }} />
                      <span className="text-sm md:text-base text-[#111111]/75 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`order-1 md:order-2 grid gap-3 ${pack.selectors.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {pack.selectors.map(sel => {
                  const slug = SELECTOR_SLUG[sel.key];
                  return (
                    <div key={sel.key} className="relative rounded-sm overflow-hidden aspect-[3/4]" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                      <img
                        src={SERVICE_RESULT_IMAGES[slug] ?? SERVICE_RESULT_IMAGES['limpeza-sofas']}
                        alt={`Resultado de ${sel.label}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white uppercase tracking-wide px-2 py-1.5 rounded-sm text-center" style={{ background: "rgba(7,26,18,0.65)", backdropFilter: "blur(2px)" }}>
                        {sel.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TESTEMUNHO + GARANTIAS ═══ */}
        <section className="py-12 md:py-16 bg-kyro-green">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.9 }}>Confiança</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-8">
                O que dizem os <em className="not-italic" style={{ color: "#D4AF37" }}>nossos clientes</em>
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-sm p-6 md:p-7" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,175,55,0.20)" }}>
                  <Quote className="w-7 h-7 mb-3" style={{ color: "#D4AF37", opacity: 0.45 }} strokeWidth={1.5} />
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed italic mb-4">
                    "{pack.testimonial.text}"
                  </p>
                  <p className="text-xs font-bold text-white/90">{pack.testimonial.author}</p>
                </div>

                <div className="rounded-sm p-6 md:p-7" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,175,55,0.20)" }}>
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="h-px w-6 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
                    <h3 className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: "#D4AF37", opacity: 0.9 }}>Garantias incluídas</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    {[
                      { icon: Shield, text: "Garantia de satisfação 100%" },
                      { icon: Zap, text: `Serviço ao domicílio ${prep} ${city.name}` },
                      { icon: CheckCircle, text: "Produtos certificados e seguros" },
                      { icon: Star, text: `${REVIEW_RATING} · ${REVIEW_COUNT}+ avaliações Google verificadas` },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-start gap-2">
                        <item.icon className="w-5 h-5" style={{ color: "#D4AF37" }} strokeWidth={1.5} />
                        <span className="text-xs text-white/75 leading-snug">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SERVIÇOS INDIVIDUAIS + CTA FINAL ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.9 }}>Explorar mais</p>
              </div>
              <h3 className="text-xl font-playfair font-bold text-[#111111] mb-4">Serviços individuais</h3>
              <div className="flex flex-wrap gap-2 mb-10">
                <Link to={`/${pack.service1Slug}`} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 transition-all">
                  <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />{pack.service1}
                </Link>
                <Link to={`/${pack.service2Slug}`} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 transition-all">
                  <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />{pack.service2}
                </Link>
                <Link to={`/${pack.service1Slug}-${city.slug}`} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 transition-all">
                  <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />{pack.service1} em {city.name}
                </Link>
                <Link to="/guia-de-packs" className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 transition-all">
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

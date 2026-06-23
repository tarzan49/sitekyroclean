// Handles all keyword variant pages:
// /higienizacao-[service]-[city-or-parish]
// /lavagem-[service]-[city-or-parish]
// Each page is self-canonical and independently indexable.

import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { CheckCircle, Star, MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import ServiceFAQ from "@/components/ServiceFAQ";
import SectionHeader from "@/components/SectionHeader";
import ServicePackBanner from "@/components/ServicePackBanner";
import ServicePriceSection from "@/components/ServicePriceSection";
import { SERVICEKEY_TO_QUIZ } from "@/constants/serviceToQuiz";
import {
  getKeywordVariantData,
  type VariantKey,
  type ServiceKey,
} from "@/data/keywordVariantData";
import { cities, cityPrep } from "@/data/locationSeoData";
import { municipiosComFreguesias } from "@/data/freguesiaSeoData";
import { GENERIC_PROCESS_STEPS, IMPERMEABILIZACAO_STEPS } from "@/constants/serviceProcesses";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import { buildVariantWaMessage } from "@/lib/whatsappMessages";

import heroSofaD      from "@/assets/hero-sofa-cleaning-new.webp";
import heroSofaM      from "@/assets/hero-sofa-cleaning-new-mobile.webp";
import heroMattressD  from "@/assets/hero-mattress-cleaning-new.webp";
import heroMattressM  from "@/assets/hero-mattress-cleaning-new-mobile.webp";
import heroCarpetD    from "@/assets/hero-carpet-cleaning-new.webp";
import heroCarpetM    from "@/assets/hero-carpet-cleaning-new-mobile.webp";
import heroChairD     from "@/assets/hero-chair-cleaning-new.webp";
import heroChairM     from "@/assets/hero-chair-cleaning-new-mobile.webp";
import heroRugD       from "@/assets/hero-rug-cleaning-new.webp";
import heroRugM       from "@/assets/hero-rug-cleaning-new-mobile.webp";

// Problem card backgrounds
import imgAlergiasSofa     from "@/assets/hero-p-alergias-sofa.webp";
import imgMauCheiro        from "@/assets/hero-p-mau-cheiro-sofa.webp";
import imgFamiliaSofa      from "@/assets/hero-family-sofa.webp";
import imgAlergiaColchao   from "@/assets/hero-p-alergias-colchao.webp";
import imgMauCheiroColchao from "@/assets/hero-p-mau-cheiro-colchao.webp";
import imgAcarosColchao    from "@/assets/hero-p-acaros-colchao.webp";
import imgAcarosTapete     from "@/assets/hero-p-acaros-tapete.webp";
import imgPelosTapete      from "@/assets/hero-p-pelos-tapete.webp";
import imgManchaTapete     from "@/assets/hero-p-manchas-tapete.webp";
import imgTapetePersa      from "@/assets/hero-p-tapete-persa.webp";
import imgMofAlcatifa      from "@/assets/hero-p-mofo-alcatifa.webp";
import imgLimpAlcatifas    from "@/assets/hero-p-limpeza-alcatifas.webp";
import imgManchasCafe      from "@/assets/hero-p-manchas-cafe-sofa.webp";
import imgSofaDesgastado   from "@/assets/hero-p-sofa-desgastado.webp";
import imgManchasColchao   from "@/assets/hero-p-manchas-colchao.webp";
import imgSangueColchao    from "@/assets/hero-p-sangue-colchao.webp";
import imgWaterproofing    from "@/assets/hero-waterproofing.webp";
import imgSofaVeludo       from "@/assets/hero-p-limpeza-sofa-veludo.webp";
import imgLimpCadeiras     from "@/assets/hero-p-limpeza-cadeiras.webp";
import imgLimpTapetes      from "@/assets/hero-p-limpeza-tapetes.webp";
import imgCadeiraAntes     from "@/assets/galeria-cadeira-antes.webp";
import imgCadeiraProcesso  from "@/assets/galeria-cadeira-processo.webp";
import imgAlcatifaProcesso from "@/assets/galeria-alcatifa-processo.webp";
import imgColchaoAntes     from "@/assets/galeria-colchao-antes.webp";

const SERVICE_PLURAL: Record<ServiceKey, string> = {
  sofa: 'sofás', colchao: 'colchões', tapetes: 'tapetes', cadeiras: 'cadeiras', alcatifas: 'alcatifas',
};

const VARIANT_PROBLEM_LABELS: Record<VariantKey, [string, string, string]> = {
  higienizacao:      ['Saúde',    'Higiene',  'Família'],
  lavagem:           ['Manchas',  'Aspeto',   'Odores'],
  impermeabilizacao: ['Proteção', 'Família',  'Material'],
};

const PROBLEM_IMAGES: Record<string, [string, string, string]> = {
  'higienizacao-sofa':           [imgAlergiasSofa,    imgMauCheiro,        imgFamiliaSofa],
  'higienizacao-colchao':        [imgAlergiaColchao,  imgMauCheiroColchao, imgAcarosColchao],
  'higienizacao-tapetes':        [imgAcarosTapete,    imgPelosTapete,      imgMauCheiro],
  'higienizacao-cadeiras':       [imgLimpCadeiras,    imgCadeiraProcesso,  imgCadeiraAntes],
  'higienizacao-alcatifas':      [imgMofAlcatifa,     imgLimpAlcatifas,    imgAlcatifaProcesso],
  'lavagem-sofa':                [imgManchasCafe,     imgSofaDesgastado,   imgMauCheiro],
  'lavagem-colchao':             [imgManchasColchao,  imgSangueColchao,    imgMauCheiroColchao],
  'lavagem-tapetes':             [imgManchaTapete,    imgLimpTapetes,      imgTapetePersa],
  'lavagem-cadeiras':            [imgCadeiraAntes,    imgLimpCadeiras,     imgCadeiraProcesso],
  'lavagem-alcatifas':           [imgMofAlcatifa,     imgAlcatifaProcesso, imgManchasCafe],
  'impermeabilizacao-sofa':      [imgWaterproofing,   imgFamiliaSofa,      imgSofaVeludo],
  'impermeabilizacao-colchao':   [imgManchasColchao,  imgColchaoAntes,     imgMauCheiroColchao],
  'impermeabilizacao-cadeiras':  [imgCadeiraAntes,    imgLimpCadeiras,     imgCadeiraProcesso],
};

const HERO_IMAGES: Record<ServiceKey, { d: string; m: string }> = {
  sofa:      { d: heroSofaD,     m: heroSofaM },
  colchao:   { d: heroMattressD, m: heroMattressM },
  tapetes:   { d: heroCarpetD,   m: heroCarpetM },
  cadeiras:  { d: heroChairD,    m: heroChairM },
  alcatifas: { d: heroRugD,      m: heroRugM },
};



const SERVICE_PACK_SLUGS: Record<ServiceKey, string[]> = {
  sofa:      ["pack-sofa-e-colchao", "pack-sofa-impermeabilizacao"],
  colchao:   ["pack-sofa-e-colchao", "pack-quarto-completo"],
  cadeiras:  ["pack-sala-completa"],
  tapetes:   ["pack-sala-completa"],
  alcatifas: ["pack-sala-completa"],
};

const VARIANTS: VariantKey[]  = ['higienizacao', 'lavagem', 'impermeabilizacao'];
const SERVICES: ServiceKey[]  = ['sofa', 'colchao', 'tapetes', 'cadeiras', 'alcatifas'];

const SERVICEKEY_TO_SLUG: Record<ServiceKey, string> = {
  sofa:      'limpeza-sofas',
  colchao:   'limpeza-colchoes',
  tapetes:   'limpeza-tapetes',
  cadeiras:  'limpeza-cadeiras',
  alcatifas: 'limpeza-alcatifas',
};

function parseRoute(pathname: string): { variantKey: VariantKey; serviceKey: ServiceKey; locationPart: string } | null {
  const path = pathname.replace(/^\//, '');
  for (const v of VARIANTS) {
    for (const s of SERVICES) {
      const prefix = `${v}-${s}-`;
      if (path.startsWith(prefix)) {
        return { variantKey: v, serviceKey: s, locationPart: path.slice(prefix.length) };
      }
    }
  }
  return null;
}

const VARIANT_LABEL: Record<VariantKey, string> = {
  higienizacao:      'Higienização',
  lavagem:           'Lavagem',
  impermeabilizacao: 'Impermeabilização',
};

const SERVICE_LABEL: Record<ServiceKey, string> = {
  sofa:      'Sofá',
  colchao:   'Colchão',
  tapetes:   'Tapetes',
  cadeiras:  'Cadeiras',
  alcatifas: 'Alcatifas',
};

const QUIZ_CTA: Record<VariantKey, string> = {
  higienizacao:      'Ver o meu preço, grátis',
  lavagem:           'Ver o meu preço, grátis',
  impermeabilizacao: 'Proteger agora, ver preço',
};

const WA_BTN_LABEL: Record<VariantKey, string> = {
  higienizacao:      'Higienizar agora',
  lavagem:           'Lavar agora',
  impermeabilizacao: 'Proteger agora',
};

const SofaVariantPage = () => {
  const location = useLocation();
  const parsed = useMemo(() => parseRoute(location.pathname), [location.pathname]);
  const data = useMemo(() => {
    if (!parsed) return null;
    return getKeywordVariantData(parsed.variantKey, parsed.serviceKey, parsed.locationPart);
  }, [parsed]);

  useEffect(() => {
    if (!data) return;
    document.title = data.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', data.metaDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', data.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', data.metaDescription);
    document.querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `${SITE_URL}${location.pathname}`);
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow');
    return () => { robotsMeta?.setAttribute('content', 'index, follow'); };
  }, [data]);

  if (!data || !parsed) {
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

  const quizService = SERVICEKEY_TO_QUIZ[data.serviceKey];

  const variantLabel = VARIANT_LABEL[data.variantKey];
  const prep = cityPrep(data.locationName);
  const heroImgs = HERO_IMAGES[data.serviceKey];
  const problemImgs = PROBLEM_IMAGES[`${data.variantKey}-${data.serviceKey}`];
  const problemLabels = VARIANT_PROBLEM_LABELS[data.variantKey];

  return (
    <QuizLocationProvider value={data.locationName}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <picture className="w-full h-full">
              <source media="(max-width: 767px)" srcSet={heroImgs.m} type="image/webp" />
              <source media="(min-width: 768px)" srcSet={heroImgs.d} type="image/webp" />
              <img src={heroImgs.d} alt={data.h1} className="w-full h-full object-cover" loading="eager" />
            </picture>
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                  <span>/</span>
                  <Link to={data.canonical} className="hover:text-white/80 transition-colors">{data.locationName}</Link>
                  <span>/</span>
                  <span className="text-white/70">{variantLabel}</span>
                </nav>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>{data.locationName}</span>
                </div>

                <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.15]">
                  {data.h1}
                </h1>

                <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {data.intro.split('.')[0]}.
                </p>

                <TrustRatingBadge variant="hero" />

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                    <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel={QUIZ_CTA[data.variantKey]} initialLocation={data.locationName} initialService={quizService} />
                  </div>
                  <a
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildVariantWaMessage(data.variantKey === 'impermeabilizacao', SERVICE_LABEL[data.serviceKey], VARIANT_LABEL[data.variantKey], data.locationName))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`variant_hero_${parsed.variantKey}_${parsed.serviceKey}`)}
                    className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                  >
                    <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                    {WA_BTN_LABEL[data.variantKey]}
                  </a>
                </div>

                <p className="text-white/40 text-xs mt-4">Desde {data.priceFrom} · Orçamento gratuito</p>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  <picture>
                    <source media="(max-width: 767px)" srcSet={heroImgs.m} type="image/webp" />
                    <source media="(min-width: 768px)" srcSet={heroImgs.d} type="image/webp" />
                    <img
                      src={heroImgs.d}
                      alt={`${variantLabel} profissional ${prep} ${data.locationName}`}
                      className="relative rounded-2xl w-full max-h-[400px] object-cover shadow-2xl"
                      loading="eager"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TABELA DE PREÇOS ═══ */}
        <ServicePriceSection
          serviceSlug={parsed.variantKey === 'impermeabilizacao' ? 'impermeabilizacao' : SERVICEKEY_TO_SLUG[parsed.serviceKey]}
        />

        {/* ═══ PROBLEMAS ═══ */}
        <section className="py-12 md:py-16 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader
                overline="O Que Resolvemos"
                heading={`Problemas que resolvemos ${prep}`}
                goldWord={data.locationName}
                subtitle="Se reconhece algum destes cenários, temos a solução no próprio dia."
                light={false}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                {data.problems.map((problem, idx) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden flex flex-col justify-end min-h-[280px] sm:min-h-[400px]"
                    style={{ borderTop: "2px solid rgba(212,175,55,0.70)" }}
                  >
                    {/* Background image */}
                    {problemImgs?.[idx] && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${problemImgs[idx]})` }}
                      />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,26,18,0.98) 0%, rgba(7,26,18,0.72) 50%, rgba(7,26,18,0.18) 100%)" }} />
                    {/* Content */}
                    <div className="relative z-10 p-7 md:p-8 flex flex-col gap-4">
                      <p className="text-[10px] font-bold tracking-[0.26em] uppercase" style={{ color: "#D4AF37" }}>
                        {problemLabels[idx]}
                      </p>
                      <h3 className="font-playfair font-bold leading-snug text-white" style={{ fontSize: "1.25rem" }}>
                        {problem.title}
                      </h3>
                      <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.8) 0%, rgba(212,175,55,0.15) 100%)" }} />
                      <p className="leading-relaxed text-white/70" style={{ fontSize: "14px" }}>
                        {problem.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </section>

        {/* ═══ VANTAGENS ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Vantagens"
              heading={`${variantLabel} profissional ${prep}`}
              goldWord={data.locationName}
              subtitle={data.whatIs}
              light={true}
            />
            <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {data.benefits.map((benefit, idx) => (
                <div key={idx} className="bg-white p-5 sm:p-7 md:p-8" style={{ borderTop: "2px solid #D4AF37" }}>
                  <p className="font-playfair font-bold mb-2 leading-none text-3xl sm:text-[2.25rem]" style={{ color: "rgba(212,175,55,0.30)" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </p>
                  <p className="text-[13px] sm:text-[15px] font-semibold text-[#111111] leading-snug">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PORQUE A KYRO CLEAN + AVALIAÇÕES ═══ */}
        <section className="py-12 md:py-16 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Porque a Kyro Clean"
              heading="A escolha certa para os seus"
              goldWord="estofos"
              subtitle="Rapidez no orçamento, garantia total no resultado e mais de 60 clientes satisfeitos confirmam-no."
              light={false}
            />

            {/* 3 stats */}
            <div className="grid grid-cols-3 gap-px mb-10" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              {[
                { stat: "< 30 min", label: "Resposta ao orçamento" },
                { stat: "5.0 ★",   label: "+60 avaliações Google" },
                { stat: "100%",     label: "Garantia de resultado" },
              ].map((item, i) => (
                <div key={i} className="p-5 sm:p-6 md:p-7" style={{ background: "rgba(255,255,255,0.04)", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <p className="font-playfair font-bold text-xl sm:text-2xl mb-1" style={{ color: "#D4AF37" }}>{item.stat}</p>
                  <p className="text-[11px] sm:text-sm text-white/55 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Avaliações */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-0.5 w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37" }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Avaliações reais</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              {data.testimonials.map((t, i) => (
                <div
                  key={i}
                  className="flex flex-col p-6 md:p-8"
                  style={{ background: "rgba(255,255,255,0.04)", borderTop: "2px solid rgba(212,175,55,0.45)" }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed italic flex-1 mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-2.5 mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "#D4AF37" }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[10px] text-white/40">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PROCESSO ═══ */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Processo"
              heading="Como funciona a"
              goldWord={variantLabel}
              light={true}
            />
            {(() => {
              const steps = data.variantKey === 'impermeabilizacao' ? IMPERMEABILIZACAO_STEPS : GENERIC_PROCESS_STEPS;
              const splitAt = Math.ceil(steps.length / 2);
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
                  {[0, 1].map((colIdx) => {
                    const colSteps = colIdx === 0 ? steps.slice(0, splitAt) : steps.slice(splitAt);
                    const offset = colIdx === 0 ? 0 : splitAt;
                    return (
                      <div key={colIdx} className="grid gap-px" style={{ backgroundColor: "#E8E4DE" }}>
                        {colSteps.map((step, idx) => {
                          const num = offset + idx;
                          return (
                            <div
                              key={num}
                              className="relative overflow-hidden flex items-start gap-4 p-5 md:p-6 bg-white"
                              style={{ borderTop: "2px solid rgba(212,175,55,0.55)" }}
                            >
                              <span
                                className="font-playfair font-bold flex-shrink-0 leading-none"
                                style={{ fontSize: "1.75rem", color: "rgba(212,175,55,0.45)" }}
                              >
                                {String(num + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-[#111111] mb-1">{step.label}</p>
                                <p className="text-xs text-[#111111]/50 leading-relaxed">{step.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <ServiceFAQ
          faqs={data.faqs}
          heading={`Perguntas sobre ${variantLabel.toLowerCase()} de ${SERVICE_PLURAL[data.serviceKey]} ${prep} ${data.locationName}`}
          variant="dark"
        />

        {/* ═══ PACKS ═══ */}
        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.serviceKey] ?? ["pack-sala-completa"]}
          city={parsed.locationPart}
        />

        {/* ═══ COBERTURA ═══ */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Cobertura"
              heading={`Área de serviço ${prep}`}
              goldWord={data.locationName}
              light={true}
            />
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">

              {/* Zonas / Freguesias da cidade */}
              {(() => {
                const mun = municipiosComFreguesias.find(m => m.slug === parsed.locationPart);
                if (!mun || !mun.freguesias.length) return null;
                return (
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>
                      Zonas {prep} {data.locationName}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {mun.freguesias.slice(0, 8).map(f => (
                        <Link
                          key={f.slug}
                          to={`/${parsed.variantKey}-${parsed.serviceKey}-${parsed.locationPart}-${f.slug}`}
                          className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                        >
                          <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "#D4AF37" }} />
                          {f.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Outras cidades */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>
                  Também disponível em
                </p>
                <div className="flex flex-wrap gap-2">
                  {cities.filter(c => c.slug !== parsed.locationPart).slice(0, 8).map(city => (
                    <Link
                      key={city.slug}
                      to={`/${parsed.variantKey}-${parsed.serviceKey}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Outros serviços na mesma cidade */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>
                  Outros serviços {prep} {data.locationName}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(SERVICES.filter(s => s !== parsed.serviceKey) as ServiceKey[]).map(svcKey => (
                    <Link
                      key={svcKey}
                      to={`/${SERVICEKEY_TO_SLUG[svcKey]}-${parsed.locationPart}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                    >
                      {SERVICE_LABEL[svcKey]}
                    </Link>
                  ))}
                  <Link
                    to={data.canonical}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border hover:shadow-sm transition-all"
                    style={{ color: "#D4AF37", borderColor: "rgba(212,175,55,0.45)", background: "rgba(212,175,55,0.04)" }}
                  >
                    Página principal
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default SofaVariantPage;

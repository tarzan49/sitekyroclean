import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import {
  MapPin, Star, MessageCircle, ArrowRight, AlertTriangle, Lightbulb,
  Search, Droplets, Sparkles, Wind,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { CATEGORY_TIPS } from "@/data/problemTipsData";
import { SERVICE_TESTIMONIALS } from "@/data/locationPriceTestimonialsData";
import { SERVICE_GALLERY } from "@/constants/serviceGallery";
import { services, cities } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { getProblemHeroImage } from "@/lib/problemHeroImages";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { buildProblemWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";
import {
  buildLocalBusinessNode,
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
  DEFAULT_AREA_SERVED,
} from "@/lib/seoSchema";

const WHEN_TO_CALL = [
  "A situação tem mais de 24 horas e produtos caseiros não surtiram efeito",
  "O odor persiste mesmo após arejar e usar neutralizadores domésticos",
  "O material é delicado (veludo, pele, linho) e não quer arriscar danos",
  "Envolve urina, sangue, mofo ou qualquer líquido orgânico",
  "Tentou limpar e a área aumentou ou a situação piorou",
  "Quer proteger o estofo com impermeabilização após a limpeza",
];

const PROCESS_STEPS = [
  { icon: Search,   title: "Identificação do tecido", body: "Avaliamos o tipo de material e a extensão do problema antes de aplicar qualquer produto ou equipamento." },
  { icon: Droplets, title: "Pulverização",            body: "Aplicação de solução específica, adequada ao tecido identificado e ao problema a tratar." },
  { icon: Wind,     title: "Escovação",               body: "Escovagem para distribuir o produto e soltar a sujidade nas fibras, preparando para a extração." },
  { icon: Sparkles, title: "Extração",                body: "Extração profissional a alta temperatura remove resíduos e sujidade das camadas mais profundas das fibras." },
];

function getProblemWaBtnLabel(slug: string): string {
  const s = slug ?? '';
  if (s.includes('urgente')) return 'Contactar agora';
  if (s.includes('impermeabiliz')) return 'Impermeabilizar agora';
  if (s.includes('preco') || s.includes('custa')) return 'Pedir orçamento';
  return 'Falar agora';
}

const ProblemPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = useMemo(() => (slug ? getProblemBySlug(slug) : null), [slug]);
  const relatedService = useMemo(
    () => (data ? services.find(s => s.slug === data.relatedServices[0]) : undefined),
    [data]
  );

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", data.metaDescription);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", data.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", data.metaDescription);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${SITE_URL}/problemas/${slug}`);
    }
  }, [slug, data]);

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

  const relatedServiceData = data.relatedServices
    .map(s => services.find(svc => svc.slug === s))
    .filter(Boolean) as typeof services[number][];

  const quizService = SERVICE_TO_QUIZ[data.relatedServices[0]] ?? 'sofa';
  const relatedProblemLinks = getRelatedProblemLinks(data.relatedProblems);
  const relatedCityData = data.relatedCities
    .map(s => cities.find(c => c.slug === s))
    .filter(Boolean) as typeof cities[number][];
  const servicePrice = relatedService?.priceFrom ?? "49€";
  const categoryTips = CATEGORY_TIPS[data.category];
  const testimonials = SERVICE_TESTIMONIALS[data.relatedServices[0]];
  const gallery = SERVICE_GALLERY[data.relatedServices[0]];
  const heroImg = getProblemHeroImage(slug ?? "");
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildProblemWaMessage(slug ?? ""))}`;

  const h1Words = data.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  return (
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                  <span>/</span>
                  <span className="text-white/70">{data.h1}</span>
                </nav>

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      Como Resolver
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  {h1Rest}{" "}<span style={{ color: "#D4AF37" }}>{h1Gold}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {data.intro.split('.')[0]}.
                </p>

                <div className="mb-6">
                  <TrustRatingBadge variant="hero" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <QuizButton
                    className="flex-1"
                    problema={slug}
                    initialService={quizService}
                    buttonClassName="h-[58px] md:h-[52px] !py-0 w-full"
                  />
                  <div className="relative group flex-1">
                    <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(`problem_hero_${slug}`)}
                      className="relative flex items-center justify-center gap-2 w-full h-[58px] md:h-[52px] px-6 font-bold text-white touch-manipulation bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-150"
                    >
                      <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">{getProblemWaBtnLabel(slug ?? "")}</span>
                    </a>
                  </div>
                </div>

                <p className="text-white/40 text-xs mt-4">Desde {servicePrice} · Orçamento gratuito · Sem compromisso</p>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, #D4AF37, transparent)" }} />
                  <img
                    src={heroImg}
                    alt={data.h1}
                    className="relative w-full max-h-[440px] object-cover shadow-2xl"
                    style={{ borderTop: "2px solid #D4AF37" }}
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROBLEMA + SOLUÇÃO — visual, 2 cartões fotográficos ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Diagnóstico" heading="Do problema à" goldWord="solução" light={true} />
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {/* Problema */}
              <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-sm">
                <img src={heroImg} alt={`${data.h1} — o problema`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,26,18,0.94) 0%, rgba(7,26,18,0.45) 42%, rgba(7,26,18,0.05) 68%, transparent 100%)" }} />
                <span
                  className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-[0.22em] uppercase text-white"
                  style={{ backgroundColor: "rgba(160,55,40,0.92)" }}
                >
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" /> O Problema
                </span>
                <p className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-sm md:text-[15px] text-white/90 leading-relaxed">
                  {data.problemDetail}
                </p>
              </div>
              {/* Solução */}
              <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-sm">
                <img src={gallery?.after ?? heroImg} alt={`${data.h1} — a solução`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,26,18,0.94) 0%, rgba(7,26,18,0.45) 42%, rgba(7,26,18,0.05) 68%, transparent 100%)" }} />
                <span
                  className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-[0.22em] uppercase"
                  style={{ backgroundColor: "rgba(212,175,55,0.94)", color: "#071a12" }}
                >
                  <Lightbulb className="w-3 h-3 flex-shrink-0" /> A Solução
                </span>
                <p className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-sm md:text-[15px] text-white/90 leading-relaxed">
                  {data.solutionDetail}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ QUANDO CHAMAR — checklist, não grid numerada (para não repetir Benefícios) ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Quando Agir" heading="Quando chamar um" goldWord="profissional" light={false} />
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
              {WHEN_TO_CALL.map((sign, idx) => (
                <div key={idx} className="flex items-start gap-3 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                  <span className="text-sm text-white/70 leading-relaxed">{sign}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PROCESSO — timeline horizontal ligada por linha, não grid ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Processo" heading="Como tratamos este" goldWord="problema" light={true} />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              <div
                className="hidden lg:block absolute top-6 left-0 right-0 h-px"
                style={{ background: "linear-gradient(to right, transparent, #D4AF37 8%, #D4AF37 92%, transparent)" }}
                aria-hidden="true"
              />
              {PROCESS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative flex flex-col items-start">
                    <div
                      className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mb-4 bg-white"
                      style={{ border: "2px solid #D4AF37" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.24em] uppercase mb-1.5" style={{ color: "#D4AF37" }}>{String(idx + 1).padStart(2, "0")}</p>
                    <p className="text-sm font-semibold text-[#111111] mb-1.5">{step.title}</p>
                    <p className="text-sm text-[#111111]/55 leading-relaxed">{step.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ BENEFÍCIOS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Vantagens" heading="O que muda depois da nossa" goldWord="intervenção" light={false} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              {data.benefits.map((benefit, idx) => (
                <div key={idx} className="relative overflow-hidden flex items-start gap-3 p-6 md:p-7" style={{ backgroundColor: "#0d241b", borderTop: "2px solid rgba(212,175,55,0.55)" }}>
                  <span
                    className="absolute bottom-2 right-3 font-playfair font-bold leading-none select-none pointer-events-none"
                    style={{ fontSize: "5rem", color: "rgba(212,175,55,0.08)" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="relative text-sm text-white/65 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DICA DE ESPECIALISTA ═══ */}
        {categoryTips && (
          <section className="py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader overline="Dica de Especialista" heading={categoryTips.title.split(" ").slice(0, -1).join(" ") || "O que fazer"} goldWord={categoryTips.title.split(" ").slice(-1)[0] ?? "agora"} light={true} />
              <div className="max-w-2xl">
                <ol className="space-y-4 mb-8">
                  {categoryTips.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="font-black text-xs w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(212,175,55,0.12)", color: "#B8912A" }}>
                        {i + 1}
                      </span>
                      <p className="text-sm text-[#111111]/65 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="flex items-start gap-3 p-4" style={{ backgroundColor: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.25)" }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B8912A" }} />
                  <p className="text-xs text-[#111111]/55 leading-relaxed">{categoryTips.warning}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══ GALERIA — ANTES E DEPOIS ═══ */}
        {gallery && (
          <ServiceAutoCarousel
            overline="Resultados Reais"
            heading="Antes e depois da intervenção"
            subtitle="Transformações visíveis no próprio dia. Sem químicos agressivos, sem esperas."
            beforeImage={gallery.before}
            afterImage={gallery.after}
            slides={gallery.slides}
            rotateBeforeAfter={gallery.rotateBeforeAfter}
            variant="dark"
          />
        )}

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <ServiceFAQ faqs={data.faqs} heading={`Perguntas sobre ${data.h1.toLowerCase()}`} variant="light" />
        )}

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        {testimonials && testimonials.length > 0 && (
          <section className="py-14 md:py-20 bg-kyro-green">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" light={false} />
              <div className="grid sm:grid-cols-2 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
                {testimonials.map((t, i) => (
                  <div key={i} className="relative overflow-hidden p-6 md:p-8 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                    </div>
                    <p className="text-sm text-[#111111]/65 leading-relaxed italic mb-4">"{t.text}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#D4AF37" }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111111]">{t.name}</p>
                        <p className="text-[10px] text-[#111111]/40">{t.city}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Explore" heading="Continue a" goldWord="explorar" light={true} />
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {relatedServiceData.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Serviços relacionados</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedServiceData.map(svc => (
                      <Link key={svc.slug} to={svc.baseRoute}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {svc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedProblemLinks.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Problemas relacionados</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedProblemLinks.map(link => (
                      <Link key={link.path} to={link.path}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedCityData.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Disponível em</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedCityData.map(city => (
                      <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-[#111111] bg-white border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all">
                        <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            buildLocalBusinessNode(),
            buildWebPageNode({ url: `${SITE_URL}/problemas/${slug}`, name: data.title, description: data.metaDescription }),
            buildBreadcrumbNode(`${SITE_URL}/problemas/${slug}#breadcrumb`, [
              { name: "Início", item: `${SITE_URL}/` },
              { name: "Problemas", item: `${SITE_URL}/problemas` },
              { name: data.h1, item: `${SITE_URL}/problemas/${slug}` },
            ]),
            ...(relatedService ? [buildServiceNode({
              url: `${SITE_URL}/problemas/${slug}`,
              name: data.h1,
              description: data.metaDescription,
              serviceType: relatedService.name,
              areaServed: DEFAULT_AREA_SERVED,
              offers: buildOfferNode(relatedService.priceFrom.replace(',', '.').replace(/[^0-9.]/g, ''), {
                validFrom: "2025-01-01",
                priceValidUntil: "2026-12-31",
              }),
            })] : []),
          ],
        }) }} />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default ProblemPage;

import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import {
  MapPin, Star, MessageCircle, ArrowRight, AlertTriangle, XCircle, CheckCircle2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import TrustRatingBadge from "@/components/TrustRatingBadge";
import SectionHeader from "@/components/SectionHeader";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceSnapshotStats from "@/components/ServiceSnapshotStats";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { CATEGORY_TIPS, CATEGORY_STATS, splitTipsHeading } from "@/data/problemTipsData";
import { SERVICE_TESTIMONIALS } from "@/data/locationPriceTestimonialsData";
import { SERVICE_GALLERY } from "@/constants/serviceGallery";
import { cities, services, DEFAULT_PRICE_FROM, cityPrep, cityPrepCap } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITY_SLUGS } from "@/constants/metroCities";
import { getAllProblemCityRoutes } from "@/data/problemCitySeoData";
import { getProblemHeroImage } from "@/lib/problemHeroImages";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { SITE_URL, WHATSAPP_BASE } from "@/constants/business";

const PROCESS_STEPS = [
  { title: "Identificação do tecido", body: "Avaliamos o tipo de material e a extensão do problema antes de aplicar qualquer produto ou equipamento." },
  { title: "Pulverização",            body: "Aplicação de solução específica, adequada ao tecido identificado e ao problema a tratar." },
  { title: "Escovação",               body: "Escovagem para distribuir o produto e soltar a sujidade nas fibras, preparando para a extração." },
  { title: "Extração",                body: "Extração profissional a alta temperatura remove resíduos e sujidade das camadas mais profundas das fibras." },
];

function getCityContext(problemSlug: string, cityName: string, cityDesc: string): string {
  const base = `${cityPrepCap(cityName)} ${cityName}, ${cityDesc}`;
  if (problemSlug.includes("mancha"))
    return `${base}, as manchas nos estofos agravam-se com a humidade atlântica e o ritmo de vida agitado. A penetração nas fibras ocorre em horas, tratamento profissional é mais eficaz quanto mais rápido for aplicado.`;
  if (problemSlug.includes("acar"))
    return `${base}, o clima húmido favorece a multiplicação de ácaros em sofás, colchões e tapetes. Uma higienização profissional elimina 99% dos ácaros na primeira sessão, sem produtos tóxicos.`;
  if (problemSlug.includes("odor") || problemSlug.includes("cheiro"))
    return `${base}, os odores persistem mais tempo nas fibras devido à humidade do ar. Ventilação doméstica não chega, a extração profunda é o único método que elimina o cheiro na raiz.`;
  if (problemSlug.includes("pelo"))
    return `${base}, os pelos de animais acumulam-se rapidamente em estofos e alcatifas. A extração profissional remove pelos, dander e alérgenos associados que os aspiradores domésticos não alcançam.`;
  if (problemSlug.includes("urina"))
    return `${base}, os acidentes de animais e crianças requerem tratamento imediato para evitar danos permanentes nas fibras e odores persistentes. O nosso serviço de urgência está disponível ao domicílio.`;
  if (problemSlug.includes("mofo") || problemSlug.includes("bolor"))
    return `${base}, a humidade elevada favorece o aparecimento de mofo em estofos e tapetes. O tratamento profissional elimina o fungo na raiz e aplica proteção preventiva contra recorrência.`;
  if (problemSlug.includes("alerg"))
    return `${base}, as alergias são amplificadas pela acumulação de alérgenos nos estofos. A higienização reduz drasticamente os níveis de ácaros e partículas alergénicas no ambiente doméstico.`;
  if (problemSlug.includes("impermeabil"))
    return `${base}, a impermeabilização cria uma barreira invisível contra líquidos e manchas, essencial num clima com chuva frequente. A proteção ativa em 24 horas e dura meses.`;
  return `${base}, a higienização regular dos estofos é fundamental para manter um ambiente saudável. O serviço ao domicílio da Kyro elimina o problema na raiz, com resultados visíveis no mesmo dia.`;
}

function getProblemWaBtnLabel(slug: string): string {
  const s = slug ?? '';
  if (s.includes('urgente')) return 'Contactar agora';
  if (s.includes('impermeabiliz')) return 'Impermeabilizar agora';
  if (s.includes('preco') || s.includes('custa')) return 'Pedir orçamento';
  return 'Falar agora';
}

const ProblemCityPage = () => {
  const { pathname } = useLocation();

  const routeData = useMemo(() => {
    const allRoutes = getAllProblemCityRoutes();
    return allRoutes.find(r => r.path === pathname) || null;
  }, [pathname]);

  const problem = useMemo(() => routeData ? getProblemBySlug(routeData.problemSlug) : null, [routeData]);
  const city = useMemo(() => routeData ? cities.find(c => c.slug === routeData.citySlug) : null, [routeData]);

  useEffect(() => {
    if (problem && city) {
      const prep = cityPrep(city.name);
      const title = `${problem.h1} ${prep} ${city.name} | Kyro Clean Solutions`;
      document.title = title;
      const metaDesc = `${problem.h1} ${prep} ${city.name}: serviço profissional ao domicílio. ${problem.metaDescription.split('.')[0]}. Orçamento grátis em menos de 30 minutos.`;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", metaDesc);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", metaDesc);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${SITE_URL}${pathname}`);
    }
  }, [pathname, problem, city]);

  if (!problem || !city) {
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

  const prep = cityPrep(city.name);
  const quizService = SERVICE_TO_QUIZ[problem.relatedServices[0]] ?? 'sofa';

  const relatedProblemLinks = getRelatedProblemLinks(problem.relatedProblems);
  const relatedServiceData = problem.relatedServices
    .map(slug => services.find(s => s.slug === slug))
    .filter(Boolean) as typeof services[number][];
  const servicePrice = relatedServiceData[0]?.priceFrom ?? DEFAULT_PRICE_FROM;
  const cityContext = getCityContext(problem.slug, city.name, city.description);
  const categoryTips = CATEGORY_TIPS[problem.category];
  const testimonialPool = SERVICE_TESTIMONIALS[problem.relatedServices[0]] ?? SERVICE_TESTIMONIALS['limpeza-sofas'];
  const testimonialHash = city.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const testimonial = testimonialPool[testimonialHash % testimonialPool.length];
  const gallery = SERVICE_GALLERY[problem.relatedServices[0]];
  const heroImg = getProblemHeroImage(problem.slug);
  const waHref = WHATSAPP_BASE;
  const snapshotStats = CATEGORY_STATS[problem.category] ?? CATEGORY_STATS.manchas;

  const validCitySlugs = new Set([...METRO_CITY_SLUGS, ...problem.relatedCities]);
  const nearbyCities = cities
    .filter(c => c.slug !== city.slug && validCitySlugs.has(c.slug))
    .slice(0, 8);

  const localFaqs = problem.faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer.includes(city.name)
      ? faq.answer
      : `${faq.answer} Prestamos este serviço ao domicílio ${prep} ${city.name} e arredores.`,
  }));

  const h1Words = problem.h1.trim().split(" ");
  const h1Gold = h1Words.pop() ?? "";
  const h1Rest = h1Words.join(" ");

  return (
    <QuizLocationProvider value={city.name}>
    <QuizServiceProvider value={quizService}>
    <>
      <ServiceLocationSchema
        serviceName={problem.h1}
        serviceBaseUrl={`/problemas/${problem.slug}`}
        placeName={city.name}
        description={`${problem.intro.split('.')[0]} ${prep} ${city.name}. Serviço profissional ao domicílio.`}
        pageUrl={pathname}
        priceFrom={servicePrice}
      />
      <Header />
      <main>

        {/* ═══ HERO + SNAPSHOT (fundo fotográfico contínuo) ═══ */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "#071a12" }} />
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

        <section className="relative pt-24 md:pt-28 pb-16 md:pb-24">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                  <span>/</span>
                  <Link to={`/problemas/${problem.slug}`} className="hover:text-white/80 transition-colors">{problem.h1}</Link>
                  <span>/</span>
                  <span className="text-white/70">{city.name}</span>
                </nav>

                <div className="inline-flex items-start mb-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                    <span className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      Como resolver {prep} {city.name}
                    </span>
                  </div>
                </div>

                <h1 className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-[1.12]" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}>
                  {h1Rest} {h1Gold} {prep} <span style={{ color: "#D4AF37" }}>{city.name}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {problem.intro.replace(/no Porto|ao domicílio/g, `${prep} ${city.name}`).split('.')[0]}.
                </p>

                <div className="mb-6">
                  <TrustRatingBadge variant="hero" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <QuizButton
                    className="flex-1"
                    initialLocation={city.name}
                    initialService={quizService}
                    buttonClassName="h-[58px] md:h-[52px] !py-0 w-full"
                  />
                  <div className="relative group flex-1">
                    <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(`problem_city_hero_${problem.slug}_${city.slug}`)}
                      className="relative flex items-center justify-center gap-2 w-full h-[58px] md:h-[52px] px-6 font-bold text-white touch-manipulation bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-150"
                    >
                      <MessageCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                      <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">{getProblemWaBtnLabel(problem.slug)}</span>
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
                    alt={`${problem.h1} ${prep} ${city.name}`}
                    className="relative w-full max-h-[440px] object-cover shadow-2xl"
                    style={{ borderTop: "2px solid #D4AF37" }}
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServiceSnapshotStats stats={snapshotStats} />
        </div>

        {/* ═══ PROBLEMA + SOLUÇÃO — visual, 2 cartões fotográficos ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Diagnóstico" heading="O problema," goldWord="a solução" light={true} />
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-6">
              {/* Problema — imagem dessaturada + acento vermelho */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm" style={{ border: "3px solid #ef4444", boxShadow: "0 0 0 1px rgba(239,68,68,0.3)" }}>
                <img
                  src={heroImg}
                  alt={`${problem.h1}, o problema`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "grayscale(85%) brightness(0.78) contrast(1.05)" }}
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,26,18,0.90) 0%, rgba(7,26,18,0.6) 45%, rgba(7,26,18,0.15) 72%, transparent 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 h-[172px] md:h-[196px] flex flex-col justify-start overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-2">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ef4444" }} />
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: "#ef4444" }}>O Problema {prep} {city.name}</span>
                  </div>
                  <p className="font-playfair text-lg font-bold mb-2 leading-tight" style={{ color: "#ef4444" }}>Porque acontece</p>
                  <p className="text-sm text-white/80 leading-relaxed">{problem.problemDetail}</p>
                </div>
              </div>
              {/* Solução — cor cheia + acento verde: sensação de esperança */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm" style={{ border: "3px solid #22c55e", boxShadow: "0 0 0 1px rgba(34,197,94,0.3)" }}>
                <img src={gallery?.after ?? heroImg} alt={`${problem.h1}, a solução`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,26,18,0.90) 0%, rgba(7,26,18,0.6) 45%, rgba(7,26,18,0.15) 72%, transparent 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 h-[172px] md:h-[196px] flex flex-col justify-start overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#22c55e" }} />
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: "#22c55e" }}>A Solução</span>
                  </div>
                  <p className="font-playfair text-lg font-bold mb-2 leading-tight" style={{ color: "#22c55e" }}>Como resolvemos</p>
                  <p className="text-sm text-white/85 leading-relaxed">{problem.solutionDetail}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#111111]/50 leading-relaxed italic max-w-2xl">{cityContext}</p>
          </div>
        </section>

        {/* ═══ PROCESSO — timeline horizontal ligada por linha ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Processo" heading="Como tratamos este problema" goldWord={city.name} light={false} />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              <div
                className="hidden lg:block absolute top-6 left-0 right-0 h-px"
                style={{ background: "linear-gradient(to right, transparent, #D4AF37 8%, #D4AF37 92%, transparent)" }}
                aria-hidden="true"
              />
              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-start">
                  <div
                    className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mb-4"
                    style={{ backgroundColor: "#0d241b", border: "2px solid #D4AF37" }}
                  >
                    <span className="font-playfair font-bold text-lg leading-none" style={{ color: "#D4AF37" }}>{idx + 1}</span>
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.24em] uppercase mb-1.5" style={{ color: "#D4AF37" }}>{String(idx + 1).padStart(2, "0")}</p>
                  <p className="text-sm font-semibold text-white mb-1.5">{step.title}</p>
                  <p className="text-sm text-white/55 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BENEFÍCIOS ═══ */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Vantagens" heading="Benefícios do nosso serviço" goldWord={`${prep} ${city.name}`} light={true} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {problem.benefits.map((benefit, idx) => (
                <div key={idx} className="relative overflow-hidden flex items-start gap-3 p-6 md:p-7 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                  <span
                    className="absolute bottom-2 right-3 font-playfair font-bold leading-none select-none pointer-events-none"
                    style={{ fontSize: "5rem", color: "rgba(212,175,55,0.1)" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="relative text-sm text-[#111111]/65 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DICA DE ESPECIALISTA ═══ */}
        {categoryTips && (
          <section className="py-14 md:py-20 bg-kyro-green">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader overline="Dica de Especialista" heading={splitTipsHeading(categoryTips.title).heading} goldWord={splitTipsHeading(categoryTips.title).goldWord} light={false} />
              <div className="max-w-2xl">
                <ol className="space-y-4 mb-8">
                  {categoryTips.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="font-black text-xs w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(212,175,55,0.18)", color: "#D4AF37" }}>
                        {i + 1}
                      </span>
                      <p className="text-sm text-white/70 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="flex items-start gap-3 p-4" style={{ backgroundColor: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                  <p className="text-xs text-white/50 leading-relaxed">{categoryTips.warning}</p>
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
            subtitle={`Transformações visíveis no próprio dia, ${prep} ${city.name}. Sem químicos agressivos, sem esperas.`}
            beforeImage={gallery.before}
            afterImage={gallery.after}
            slides={gallery.slides}
            rotateBeforeAfter={gallery.rotateBeforeAfter}
            variant="light"
          />
        )}

        {/* ═══ FAQ ═══ */}
        {localFaqs.length > 0 && (
          <ServiceFAQ faqs={localFaqs} heading="Perguntas Frequentes" variant="dark" />
        )}

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        {testimonial && (
          <section className="py-14 md:py-20 bg-[#FDFDF9]">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" light={true} />
              <div className="max-w-md">
                <div className="relative overflow-hidden p-6 md:p-8 bg-white" style={{ borderTop: "2px solid #D4AF37" }}>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                  </div>
                  <p className="text-sm text-[#111111]/65 leading-relaxed italic mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#D4AF37" }}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111111]">{testimonial.name}</p>
                      <p className="text-[10px] text-[#111111]/40">{testimonial.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Explore" heading="Continue a" goldWord="explorar" light={false} />
            <div className="grid md:grid-cols-3 gap-x-12 gap-y-10">
              {relatedServiceData.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Serviços {prep} {city.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedServiceData.map(svc => (
                      <Link key={svc.slug} to={`/${svc.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white border border-white/15 hover:border-[#D4AF37]/40 hover:bg-white/5 transition-all">
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white border border-white/15 hover:border-[#D4AF37]/40 hover:bg-white/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#D4AF37" }}>Este problema noutras cidades</p>
                <div className="flex flex-wrap gap-2">
                  {nearbyCities.map(c => (
                    <Link key={c.slug} to={`/${problem.slug}-${c.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white border border-white/15 hover:border-[#D4AF37]/40 hover:bg-white/5 transition-all">
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {c.name}
                    </Link>
                  ))}
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

export default ProblemCityPage;

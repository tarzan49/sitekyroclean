import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  CheckCircle, ArrowRight, AlertTriangle, Lightbulb, MapPin, MessageCircle,
  Truck, Clock, ThumbsUp, Star, Search, Droplets, Sparkles, Wind,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { CATEGORY_TIPS } from "@/data/problemTipsData";
import { services, cities } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITY_SLUGS } from "@/constants/metroCities";
import { getProblemHeroImage } from "@/lib/problemHeroImages";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { buildProblemWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import {
  buildLocalBusinessNode,
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
  DEFAULT_AREA_SERVED,
} from "@/lib/seoSchema";

const STEP_ICONS = [Search, Droplets, Sparkles, Wind];

const WHEN_TO_CALL = [
  "A situação tem mais de 24 horas e produtos caseiros não surtiram efeito",
  "O odor persiste mesmo após arejar e usar neutralizadores domésticos",
  "O material é delicado (veludo, pele, linho) e não quer arriscar danos",
  "Envolve urina, sangue, mofo ou qualquer líquido orgânico",
  "Tentou limpar e a área aumentou ou a situação piorou",
  "Quer proteger o estofo com impermeabilização após a limpeza",
];

const FEATURED_TESTIMONIAL = {
  name: "Carlos M.",
  city: "Porto",
  text: "Tinha um problema sério no sofá depois de um acidente com o meu filho. Pensava que estava perdido. Em menos de duas horas ficou perfeito, sem cheiro, sem mancha. Profissionalismo total.",
  stars: 5,
};

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
  const problemCitySlugs = Array.from(new Set([...METRO_CITY_SLUGS, ...data.relatedCities]));
  const relatedCityData = problemCitySlugs
    .map(s => cities.find(c => c.slug === s))
    .filter(Boolean) as typeof cities[number][];
  const servicePrice = relatedService?.priceFrom ?? "39€";
  const categoryTips = CATEGORY_TIPS[data.category];

  return (
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ══════════════════════════════════════════════════
            HERO — full-bleed, editorial
        ══════════════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src={getProblemHeroImage(slug ?? "")}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(7,26,18,0.15) 0%, rgba(7,26,18,0.55) 45%, rgba(7,26,18,0.97) 100%)" }} />
          </div>

          <div className="relative z-10 px-5 sm:px-8 lg:px-16 pb-12 md:pb-20 pt-28">
            <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-8" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white/70 transition-colors">Início</Link>
              <span>/</span>
              <span className="text-white/40">Problemas</span>
              <span>/</span>
              <span className="text-white/60">{data.h1}</span>
            </nav>

            <div className="max-w-5xl">
              <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-5" style={{ color: "#D4AF37" }}>
                Como resolver
              </p>

              <h1 className="font-playfair font-bold text-white leading-[0.95] mb-8" style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)" }}>
                {data.h1}
              </h1>

              <div className="w-16 h-px mb-7" style={{ backgroundColor: "#D4AF37" }} />

              <p className="text-white/65 leading-relaxed mb-8 max-w-xl" style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}>
                {data.intro}
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
                  <div className="relative flex-1">
                    <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                    <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" problema={slug} ctaLabel="Ver preço grátis" initialService={quizService} />
                  </div>
                  <a
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildProblemWaMessage(slug ?? ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`problem_hero_${slug}`)}
                    className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                  >
                    <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                    {getProblemWaBtnLabel(slug ?? "")}
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                    <span className="text-white font-bold text-xs ml-1.5">{REVIEW_RATING}</span>
                    <span className="text-white/40 text-xs ml-0.5">Google</span>
                  </div>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/50 text-xs">{REVIEW_COUNT}+ avaliações</span>
                  <span className="text-white/30 text-xs">·</span>
                  <span style={{ color: "#D4AF37" }} className="text-xs font-semibold">Desde {servicePrice}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Garantias strip */}
        <div className="bg-white border-b border-[#E8E4DE] py-4 px-5 sm:px-8 lg:px-16">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              { icon: Truck,    t: "Deslocação incluída", s: "Porto e Grande Porto" },
              { icon: ThumbsUp, t: "Resultado garantido", s: "Ou repetimos grátis"  },
              { icon: Clock,    t: "Resposta em 30 min",  s: "Sem compromisso"      },
            ].map(g => (
              <div key={g.t} className="flex items-center gap-2">
                <g.icon className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                <span className="text-xs font-bold text-[#111111]">{g.t}</span>
                <span className="text-xs text-[#111111]/45 hidden sm:inline">· {g.s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            PROBLEMA + SOLUÇÃO — split-screen
        ══════════════════════════════════════════════════ */}
        <section className="grid md:grid-cols-2">
          {/* Esquerda — O Problema */}
          <div className="px-8 py-16 md:px-14 md:py-24 bg-[#FDFDF9] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.18)" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: "#D4AF37" }} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>O Problema</p>
                <h2 className="font-playfair text-xl font-bold text-[#111111] leading-tight">O que realmente acontece</h2>
              </div>
            </div>
            <p className="text-[#111111]/60 leading-relaxed flex-1" style={{ fontSize: "clamp(0.85rem, 1.8vw, 1rem)" }}>
              {data.problemDetail}
            </p>
          </div>

          {/* Direita — A Solução */}
          <div className="px-8 py-16 md:px-14 md:py-24 flex flex-col" style={{ backgroundColor: "#071a12" }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)" }}>
                <Lightbulb className="w-5 h-5" style={{ color: "#D4AF37" }} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>A Solução</p>
                <h2 className="font-playfair text-xl font-bold text-white leading-tight">Como resolvemos</h2>
              </div>
            </div>
            <p className="text-white/60 leading-relaxed flex-1" style={{ fontSize: "clamp(0.85rem, 1.8vw, 1rem)" }}>
              {data.solutionDetail}
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            QUANDO CHAMAR — lista editorial
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24 bg-[#FDFDF9] border-t border-[#E8E4DE]">
          <div className="max-w-5xl">
            <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-4" style={{ color: "#D4AF37" }}>
              Quando agir
            </p>
            <h2 className="font-playfair font-bold text-[#111111] leading-tight mb-12" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
              Quando chamar um profissional
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-0 divide-y divide-[#E8E4DE] sm:divide-y-0 sm:gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {WHEN_TO_CALL.map((sign, idx) => (
                <div key={idx} className="bg-[#FDFDF9] px-6 py-7 flex gap-4">
                  <span className="font-playfair font-bold text-sm flex-shrink-0 mt-0.5" style={{ color: "rgba(212,175,55,0.5)" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-[#111111]/60 leading-relaxed">{sign}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PROCESSO — lista vertical editorial
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24" style={{ backgroundColor: "#071a12" }}>
          <div className="max-w-3xl">
            <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-4" style={{ color: "#D4AF37" }}>
              A nossa abordagem
            </p>
            <h2 className="font-playfair font-bold text-white leading-tight mb-14" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
              Como tratamos este problema
            </h2>

            <div className="space-y-0">
              {[
                { icon: Search,   title: "Diagnóstico",          body: "Avaliamos o tipo de problema, o tecido e a extensão real antes de aplicar qualquer produto ou equipamento." },
                { icon: Droplets, title: "Pré-tratamento",       body: "Aplicamos a solução específica para este problema e este material, garantindo eficácia sem danos ao tecido." },
                { icon: Sparkles, title: "Extração profissional", body: "Equipamento de extração a alta temperatura remove agentes, resíduos e sujidade das camadas mais profundas das fibras." },
                { icon: Wind,     title: "Secagem controlada",   body: "Circulação de ar direcionada para secagem rápida. O estofo fica pronto a usar no próprio dia da intervenção." },
              ].map((step, i, arr) => {
                const Icon = step.icon;
                const isLast = i === arr.length - 1;
                return (
                  <div key={i} className="relative flex gap-6 md:gap-10">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center z-10 relative" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)" }}>
                        <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                      </div>
                      {!isLast && <div className="w-px flex-1 mt-2" style={{ backgroundColor: "rgba(212,175,55,0.15)", minHeight: "3rem" }} />}
                    </div>
                    <div className={`${isLast ? "pb-0" : "pb-10 md:pb-14"}`}>
                      <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-1" style={{ color: "#D4AF37" }}>
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="font-playfair text-base font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-white/55 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            BENEFÍCIOS — grid editorial numerado
        ══════════════════════════════════════════════════ */}
        <section className="bg-[#FDFDF9]">
          <div className="px-8 py-14 md:px-14 md:py-20 border-b border-[#E8E4DE]">
            <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-4" style={{ color: "#D4AF37" }}>
              Vantagens
            </p>
            <h2 className="font-playfair font-bold text-[#111111] leading-tight max-w-2xl" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
              O que muda depois da nossa intervenção
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-0 divide-y divide-[#E8E4DE] sm:divide-y-0 sm:gap-px" style={{ backgroundColor: "#E8E4DE" }}>
            {data.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-[#FDFDF9] px-8 py-10 md:px-10 md:py-12 flex flex-col">
                <p className="font-playfair font-bold leading-none mb-4" style={{ fontSize: "clamp(3rem, 5vw, 5rem)", color: "rgba(212,175,55,0.18)" }}>
                  {String(idx + 1).padStart(2, "0")}
                </p>
                <div className="w-6 h-px mb-4" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-sm text-[#111111]/60 leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            DICA ESPECIALISTA
        ══════════════════════════════════════════════════ */}
        {categoryTips && (
          <section className="px-8 py-16 md:px-14 md:py-24" style={{ backgroundColor: "#071a12" }}>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
                  <Lightbulb className="w-4 h-4" style={{ color: "#D4AF37" }} />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.22em] uppercase" style={{ color: "#D4AF37" }}>Dica de especialista</p>
                  <h2 className="font-playfair text-lg md:text-xl font-bold text-white">{categoryTips.title}</h2>
                </div>
              </div>

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

              <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: "rgba(212,175,55,0.05)", borderColor: "rgba(212,175,55,0.2)" }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                <p className="text-xs text-white/50 leading-relaxed">{categoryTips.warning}</p>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            PREÇO EDITORIAL
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24 bg-[#FDFDF9] border-t border-[#E8E4DE]">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10 max-w-5xl">
            <div>
              <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-5" style={{ color: "#D4AF37" }}>
                Investimento
              </p>
              <p className="font-playfair font-bold text-[#111111] leading-none mb-3" style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)" }}>
                {servicePrice}
              </p>
              <p className="text-[#111111]/45 text-sm leading-relaxed max-w-sm">
                Preço fixo, confirmado antes de qualquer intervenção. Sem surpresas. Deslocação incluída no Porto e Grande Porto.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[280px]">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" problema={slug} ctaLabel="Ver preço grátis" initialService={quizService} />
              </div>
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildProblemWaMessage(slug ?? ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`problem_price_${slug}`)}
                className="w-full inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                {getProblemWaBtnLabel(slug ?? "")}
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TESTEMUNHO — pull quote
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24" style={{ backgroundColor: "#071a12" }}>
          <div className="max-w-3xl">
            <p className="font-playfair font-bold leading-none mb-4 select-none" style={{ fontSize: "7rem", color: "rgba(212,175,55,0.15)", lineHeight: 1 }} aria-hidden="true">"</p>
            <p className="font-playfair text-white leading-relaxed mb-8" style={{ fontSize: "clamp(1.15rem, 2.8vw, 1.65rem)" }}>
              {FEATURED_TESTIMONIAL.text}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex gap-0.5">
                {[...Array(FEATURED_TESTIMONIAL.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                ))}
              </div>
              <div className="h-3.5 w-px" style={{ backgroundColor: "rgba(212,175,55,0.3)" }} />
              <div>
                <span className="text-sm font-bold text-white">{FEATURED_TESTIMONIAL.name}</span>
                <span className="text-white/40 text-xs ml-2">· {FEATURED_TESTIMONIAL.city} · Google</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════ */}
        {data.faqs.length > 0 && (
          <section className="px-8 py-16 md:px-14 md:py-24 bg-[#FDFDF9]">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                Perguntas
              </p>
              <h2 className="font-playfair font-bold text-[#111111] leading-tight mb-12" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
                Perguntas Frequentes
              </h2>
              <ServiceFAQSchema faqs={data.faqs} />
              <Accordion type="single" collapsible className="space-y-0 divide-y divide-[#E8E4DE] border-t border-[#E8E4DE]">
                {data.faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border-0 py-1">
                    <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-[#111111] py-5 hover:no-underline [&[data-state=open]]:text-[#D4AF37] [&[data-state=open]>svg]:text-[#D4AF37]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[#111111]/55 pb-6 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24 border-t border-[#E8E4DE]" style={{ backgroundColor: "#071a12" }}>
          <div className="max-w-2xl">
            <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-5" style={{ color: "#D4AF37" }}>
              Kyro Clean Solutions
            </p>
            <h2 className="font-playfair font-bold text-white leading-tight mb-5" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
              Resolver este problema hoje
            </h2>
            <p className="text-white/45 text-sm leading-relaxed mb-10 max-w-md">
              Desde {servicePrice} · Resultado garantido ou repetimos grátis · Deslocação incluída no Porto e Grande Porto
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
              <div className="relative flex-1">
                <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                <QuizButton className="relative w-full" problema={slug} ctaLabel="Ver preço grátis" initialService={quizService} />
              </div>
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildProblemWaMessage(slug ?? ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`problem_cta_${slug}`)}
                className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                {getProblemWaBtnLabel(slug ?? "")}
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            REDE INTERNA
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-12 md:px-14 md:py-16 bg-[#FDFDF9] border-t border-[#E8E4DE]">
          <div className="space-y-10">
            {relatedServiceData.length > 0 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Serviços relacionados</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedServiceData.map(svc => (
                    <Link key={svc.slug} to={svc.baseRoute}
                      className="group flex items-center gap-3 bg-white rounded-xl p-4 border border-[#E8E4DE] hover:border-[#D4AF37]/30 transition-all">
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-[#111111] group-hover:text-[#D4AF37] transition-colors">{svc.name}</span>
                        <span className="block text-xs text-[#111111]/45">Desde {svc.priceFrom}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#111111]/25 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedProblemLinks.length > 0 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Problemas relacionados</p>
                <div className="flex flex-wrap gap-2">
                  {relatedProblemLinks.map(link => (
                    <Link key={link.path} to={link.path}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 transition-all">
                      <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedCityData.length > 0 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Disponível em</p>
                <div className="flex flex-wrap gap-2">
                  {relatedCityData.map(city => (
                    <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 transition-all">
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
              offers: buildOfferNode(relatedService.priceFrom.replace(/[^0-9]/g, ''), {
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

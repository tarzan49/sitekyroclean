import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, MapPin, CheckCircle, Search, Droplets, Sparkles, Wind,
  MessageCircle, Shield, Leaf, Award, Star, Truck, Clock, ThumbsUp,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import {
  getMaterialBySlug,
  getAllMaterialCityRoutes,
  getMaterialCityData,
  getRelatedMaterialLinks,
} from "@/data/materialSeoData";
import { cities, services, DEFAULT_PRICE_FROM, cityPrep } from "@/data/locationSeoData";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import { buildMaterialWaMessage } from "@/lib/whatsappMessages";
import { MATERIAL_HERO, MATERIAL_HERO_FALLBACK } from "@/data/materialHeroImages";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
  DEFAULT_AREA_SERVED,
} from "@/lib/seoSchema";

const STEP_ICONS = [Search, Droplets, Sparkles, Wind];

const WHY_PRO = [
  { icon: Shield, num: "01", title: "Saúde protegida", body: "Ácaros, fungos e bactérias vivem nas fibras, fora do alcance de qualquer aspirador doméstico. A extração profissional elimina até 99% desses agentes, reduzindo alergias de forma imediata e duradoura." },
  { icon: Leaf,   num: "02", title: "Material preservado", body: "Produtos errados destroem tecidos de forma irreversível. Cada material tem um protocolo específico: temperatura, pressão, solução. A limpeza profissional prolonga anos de vida ao seu estofo." },
  { icon: Award,  num: "03", title: "Resultado garantido", body: "Manchas antigas, odores persistentes e sujidade profunda são resolvidos com equipamento que nenhum produto de supermercado substitui. Visível desde a primeira sessão." },
];

const FEATURED_TESTIMONIAL = {
  name: "Mariana F.",
  city: "Porto",
  text: "Ficou como novo. Tinha manchas que achava que não saíam nunca. A equipa tratou de tudo em menos de duas horas. Profissionalismo do início ao fim.",
  stars: 5,
};

const MaterialPage = () => {
  const { pathname } = useLocation();

  const { data, isCityVariant, citySlug } = useMemo(() => {
    const allCityRoutes = getAllMaterialCityRoutes();
    const cityRoute = allCityRoutes.find(r => r.path === pathname);
    if (cityRoute) {
      const d = getMaterialCityData(cityRoute.materialSlug, cityRoute.citySlug);
      return { data: d, isCityVariant: true, citySlug: cityRoute.citySlug };
    }
    const mat = getMaterialBySlug(pathname.replace(/^\//, ""));
    return { data: mat, isCityVariant: false, citySlug: "" };
  }, [pathname]);

  const cityName = useMemo(() => {
    if (!isCityVariant || !citySlug) return null;
    return cities.find(c => c.slug === citySlug)?.name ?? null;
  }, [isCityVariant, citySlug]);

  const quizService = data ? SERVICE_TO_QUIZ[data.serviceSlug] : undefined;

  const servicePrice = useMemo(() => {
    if (!data) return DEFAULT_PRICE_FROM;
    return services.find(s => s.slug === data.serviceSlug)?.priceFrom ?? DEFAULT_PRICE_FROM;
  }, [data]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", data.metaDescription);
      const canonicalUrl = isCityVariant
        ? `${SITE_URL}/${data.serviceSlug}-${citySlug}`
        : `${SITE_URL}${pathname}`;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", canonicalUrl);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", data.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", data.metaDescription);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", `${SITE_URL}${pathname}`);
    }
  }, [pathname, data, isCityVariant, citySlug]);

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

  const relatedLinks = getRelatedMaterialLinks(data.relatedMaterials);
  const topCities = cities.slice(0, 8);
  const materialLabel = data.name.toLowerCase().replace(" em ", " de ");

  return (
    <QuizLocationProvider value={cityName ?? undefined}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ══════════════════════════════════════════════════
            HERO — full-bleed, tipo editorial de revista
        ══════════════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden">
          {/* Foto a sangrar */}
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src={MATERIAL_HERO[data.slug] ?? MATERIAL_HERO_FALLBACK}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(7,26,18,0.15) 0%, rgba(7,26,18,0.55) 45%, rgba(7,26,18,0.97) 100%)" }} />
          </div>

          {/* Conteúdo no fundo */}
          <div className="relative z-10 px-5 sm:px-8 lg:px-16 pb-12 md:pb-20 pt-28">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-8" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white/70 transition-colors">Início</Link>
              <span>/</span>
              <Link to={`/${data.serviceSlug}`} className="hover:text-white/70 transition-colors">{data.serviceName}</Link>
              <span>/</span>
              <span className="text-white/60">{data.name}</span>
            </nav>

            <div className="max-w-5xl">
              {/* Overline */}
              <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-5" style={{ color: "#D4AF37" }}>
                {data.serviceName}{cityName ? ` · ${cityName}` : ""}
              </p>

              {/* H1 — grande, editorial */}
              <h1 className="font-playfair font-bold text-white leading-[0.95] mb-8" style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)" }}>
                {data.h1}{cityName ? (
                  <><br /><span style={{ color: "#D4AF37" }}>{cityPrep(cityName)} {cityName}</span></>
                ) : ""}
              </h1>

              {/* Linha divisória dourada */}
              <div className="w-16 h-px mb-7" style={{ backgroundColor: "#D4AF37" }} />

              {/* Intro */}
              <p className="text-white/65 leading-relaxed mb-8 max-w-xl" style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}>
                {data.intro}
              </p>

              {/* CTAs + trust */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
                  <div className="relative flex-1">
                    <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                    <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" initialLocation={cityName ?? undefined} initialService={quizService} />
                  </div>
                  <a
                    href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildMaterialWaMessage(data.slug, cityName))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`material_hero_${data.slug}`)}
                    className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                  >
                    <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                    Falar agora
                  </a>
                </div>

                {/* Trust inline */}
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

        {/* ══════════════════════════════════════════════════
            GARANTIAS STRIP — imediatamente após hero
        ══════════════════════════════════════════════════ */}
        <div className="bg-white border-b border-[#E8E4DE] py-4 px-5 sm:px-8 lg:px-16">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              { icon: Truck,     t: "Deslocação incluída",  s: "Porto e Grande Porto" },
              { icon: ThumbsUp,  t: "Resultado garantido",  s: "Ou repetimos grátis"  },
              { icon: Clock,     t: "Resposta em 30 min",   s: "Sem compromisso"      },
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
            MATERIAL — split-screen edge-to-edge
        ══════════════════════════════════════════════════ */}
        <section className="grid md:grid-cols-2">
          {/* Painel esquerdo — escuro, editorial */}
          <div className="px-8 py-16 md:px-14 md:py-24 flex flex-col justify-between" style={{ backgroundColor: "#071a12" }}>
            <div>
              <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-6" style={{ color: "#D4AF37" }}>
                Material
              </p>
              {/* Número editorial grande */}
              <p className="font-playfair font-bold leading-none mb-3" style={{ fontSize: "clamp(5rem, 12vw, 9rem)", color: "rgba(212,175,55,0.18)" }}>01</p>
              <h2 className="font-playfair font-bold text-white mb-4 leading-tight" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)" }}>
                {data.name}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
                Cada material tem propriedades únicas que determinam o método de limpeza correto. Ignorar essas propriedades pode causar danos irreversíveis.
              </p>
            </div>
            <div className="w-10 h-px" style={{ backgroundColor: "rgba(212,175,55,0.4)" }} />
          </div>

          {/* Painel direito — claro, características e dicas */}
          <div className="px-8 py-16 md:px-14 md:py-24 bg-[#FDFDF9] flex flex-col gap-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-5" style={{ color: "#D4AF37" }}>Características</p>
              <ul className="space-y-4">
                {data.characteristics.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[10px] font-black tracking-wider pt-0.5 w-6 flex-shrink-0" style={{ color: "#D4AF37" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-[#111111]/65 leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[#E8E4DE] pt-8">
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-5" style={{ color: "#D4AF37" }}>Cuidados diários</p>
              <ul className="space-y-3">
                {data.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                    <span className="text-sm text-[#111111]/65 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            POR QUE PROFISSIONAL — editorial com números grandes
        ══════════════════════════════════════════════════ */}
        <section className="bg-[#FDFDF9]">
          {/* Cabeçalho da secção — sangra à esquerda */}
          <div className="px-8 py-14 md:px-14 md:py-20 border-b border-[#E8E4DE]">
            <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-4" style={{ color: "#D4AF37" }}>
              Porquê profissional
            </p>
            <h2 className="font-playfair font-bold text-[#111111] leading-tight max-w-2xl" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
              O que a limpeza doméstica nunca consegue fazer
            </h2>
          </div>

          {/* Blocos editoriais — sem container, borda entre eles */}
          <div className="divide-y divide-[#E8E4DE] md:divide-y-0 md:grid md:grid-cols-3 md:divide-x md:divide-[#E8E4DE]">
            {WHY_PRO.map((block, idx) => (
              <div key={idx} className="px-8 py-12 md:px-10 md:py-16 flex flex-col">
                {/* Número grande */}
                <p className="font-playfair font-bold leading-none mb-6" style={{ fontSize: "clamp(3.5rem, 7vw, 6rem)", color: "rgba(212,175,55,0.18)" }}>
                  {block.num}
                </p>
                <div className="w-8 h-px mb-6" style={{ backgroundColor: "#D4AF37" }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.22)" }}>
                  <block.icon className="w-5 h-5" style={{ color: "#D4AF37" }} />
                </div>
                <h3 className="font-playfair text-xl font-bold text-[#111111] mb-3">{block.title}</h3>
                <p className="text-sm text-[#111111]/55 leading-relaxed flex-1">{block.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PROCESSO — lista vertical editorial
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24" style={{ backgroundColor: "#071a12" }}>
          <div className="max-w-3xl">
            <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-4" style={{ color: "#D4AF37" }}>
              Como trabalhamos
            </p>
            <h2 className="font-playfair font-bold text-white leading-tight mb-14" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
              Processo de limpeza para {materialLabel}
            </h2>

            <div className="space-y-0">
              {data.cleaningProcess.map((step, i) => {
                const Icon = STEP_ICONS[i] ?? Sparkles;
                const isLast = i === data.cleaningProcess.length - 1;
                return (
                  <div key={i} className="relative flex gap-6 md:gap-10">
                    {/* Linha vertical + número */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center z-10 relative" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)" }}>
                        <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
                      </div>
                      {!isLast && <div className="w-px flex-1 mt-2 mb-0" style={{ backgroundColor: "rgba(212,175,55,0.15)", minHeight: "3rem" }} />}
                    </div>

                    {/* Conteúdo */}
                    <div className={`${isLast ? "pb-0" : "pb-10 md:pb-14"}`}>
                      <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-2" style={{ color: "#D4AF37" }}>
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="text-sm md:text-base text-white/70 leading-relaxed">{step}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PREÇO EDITORIAL — dramático, centrado
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
                <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" initialLocation={cityName ?? undefined} initialService={quizService} />
              </div>
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildMaterialWaMessage(data.slug, cityName))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`material_price_${data.slug}`)}
                className="w-full inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                Falar agora
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TESTEMUNHO — pull quote editorial
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24" style={{ backgroundColor: "#071a12" }}>
          <div className="max-w-3xl">
            {/* Aspas grandes decorativas */}
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
            FAQ — accordion sobre claro
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
                {data.faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-0 py-1"
                  >
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
            CTA FINAL — escuro, limpo, dramático
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24 border-t border-[#E8E4DE]" style={{ backgroundColor: "#071a12" }}>
          <div className="max-w-2xl">
            <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-5" style={{ color: "#D4AF37" }}>
              Kyro Clean Solutions
            </p>
            <h2 className="font-playfair font-bold text-white leading-tight mb-5" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
              Peça o seu orçamento gratuito
            </h2>
            <p className="text-white/45 text-sm leading-relaxed mb-10 max-w-md">
              Desde {servicePrice} · Resultado garantido ou repetimos grátis · Deslocação incluída no Porto e Grande Porto
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
              <div className="relative flex-1">
                <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" />
              </div>
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildMaterialWaMessage(data.slug, cityName))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`material_cta_${data.slug}`)}
                className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                Falar agora
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            REDE INTERNA — compacto, sobre claro
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-12 md:px-14 md:py-16 bg-[#FDFDF9] border-t border-[#E8E4DE]">
          <div className="space-y-10">
            {relatedLinks.length > 0 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Outros materiais</p>
                <div className="flex flex-wrap gap-2">
                  {relatedLinks.map(link => (
                    <Link key={link.path} to={link.path}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 transition-all">
                      <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!isCityVariant && (
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Disponível em</p>
                <div className="flex flex-wrap gap-2">
                  {topCities.map(city => (
                    <Link key={city.slug} to={`/${data.slug}-${city.slug}`}
                      className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 transition-all">
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {isCityVariant && (
              <div>
                <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Também disponível em</p>
                <div className="flex flex-wrap gap-2">
                  {cities.filter(c => c.slug !== citySlug).slice(0, 8).map(city => (
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
            buildWebPageNode({ url: `${SITE_URL}${pathname}`, name: data.title, description: data.metaDescription }),
            buildBreadcrumbNode(`${SITE_URL}${pathname}#breadcrumb`, [
              { name: "Início", item: SITE_URL },
              { name: data.serviceName, item: `${SITE_URL}/${data.serviceSlug}` },
              { name: data.name, item: `${SITE_URL}/${data.slug}` },
              ...(isCityVariant && cityName ? [{ name: cityName, item: `${SITE_URL}${pathname}` }] : []),
            ]),
            buildServiceNode({
              url: `${SITE_URL}${pathname}`,
              name: data.title,
              description: data.metaDescription,
              areaServed: isCityVariant && cityName ? { "@type": "City", name: cityName } : DEFAULT_AREA_SERVED,
              offers: buildOfferNode(servicePrice.replace(/[^0-9]/g, "")),
            }),
          ],
        }) }} />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default MaterialPage;

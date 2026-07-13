import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, ArrowRight, CheckCircle, MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import { getPricePageData, getAllPriceRoutes } from "@/data/priceSeoData";
import { SERVICE_TESTIMONIALS } from "@/data/locationPriceTestimonialsData";
import { services, cities, cityPrep } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { SERVICE_HERO_IMAGES, SERVICE_HERO_FALLBACK } from "@/constants/serviceContent";
import { buildServiceWaMessage } from "@/lib/whatsappMessages";
import { SITE_URL, WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";
import {
  buildWebPageNode,
  buildBreadcrumbNode,
  buildServiceNode,
  buildOfferNode,
} from "@/lib/seoSchema";

const PricePage = () => {
  const { pathname } = useLocation();

  const data = useMemo(() => {
    const allRoutes = getAllPriceRoutes();
    const route = allRoutes.find(r => r.path === pathname);
    if (!route) return null;
    return getPricePageData(route.serviceSlug, route.citySlug);
  }, [pathname]);

  useEffect(() => {
    if (data) {
      document.title = data.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", data.metaDescription);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `${SITE_URL}${pathname}`);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", data.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", data.metaDescription);
    }
  }, [pathname, data]);

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

  const prep = cityPrep(data.cityName);
  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];
  const heroImgs = SERVICE_HERO_IMAGES[data.serviceSlug] ?? SERVICE_HERO_FALLBACK;
  const service = services.find(s => s.slug === data.serviceSlug);
  const servicePrice = service?.priceFrom ?? "49€";
  const relatedServices = services.filter(s => s.slug !== data.serviceSlug).slice(0, 4);
  const nearbyCities = cities.filter(c => c.slug !== data.citySlug).slice(0, 8);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.cityName))}`;
  const testimonial = SERVICE_TESTIMONIALS[data.serviceSlug]?.[0];

  return (
    <QuizLocationProvider value={data.cityName}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main>

        {/* ══════════════════════════════════════════════════
            HERO — full-bleed, tipo editorial de revista
        ══════════════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <picture>
              <source media="(max-width: 767px)" srcSet={heroImgs.m} />
              <source media="(min-width: 768px)" srcSet={heroImgs.d} />
              <img src={heroImgs.d} alt="" className="w-full h-full object-cover" loading="eager" />
            </picture>
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(7,26,18,0.15) 0%, rgba(7,26,18,0.55) 45%, rgba(7,26,18,0.97) 100%)" }} />
          </div>

          <div className="relative z-10 px-5 sm:px-8 lg:px-16 pb-12 md:pb-20 pt-28">
            <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-8" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white/70 transition-colors">Início</Link>
              <span>/</span>
              <Link to={`/${data.serviceSlug}`} className="hover:text-white/70 transition-colors">{data.serviceName}</Link>
              <span>/</span>
              <span className="text-white/60">Preços {prep} {data.cityName}</span>
            </nav>

            <div className="max-w-5xl">
              <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-5" style={{ color: "#D4AF37" }}>
                Tabela de Preços {new Date().getFullYear()}
              </p>

              <h1 className="font-playfair font-bold text-white leading-[0.95] mb-8" style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)" }}>
                Preço de {data.serviceName}
                <br />
                <span style={{ color: "#D4AF37" }}>{prep} {data.cityName}</span>
              </h1>

              <div className="w-16 h-px mb-7" style={{ backgroundColor: "#D4AF37" }} />

              <p className="text-white/65 leading-relaxed mb-8 max-w-xl" style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}>
                {data.intro}
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
                  <div className="relative flex-1">
                    <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                    <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" initialLocation={data.cityName} initialService={quizService} />
                  </div>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`price_hero_${data.serviceSlug}_${data.citySlug}`)}
                    className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                  >
                    <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                    Falar agora
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

        {/* ══════════════════════════════════════════════════
            GARANTIAS STRIP
        ══════════════════════════════════════════════════ */}
        <div className="bg-white border-b border-[#E8E4DE] py-4 px-5 sm:px-8 lg:px-16">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              { t: "Deslocação incluída", s: `${prep} ${data.cityName}` },
              { t: "Resultado garantido", s: "Ou repetimos grátis" },
              { t: "Resposta em 30 min", s: "Sem compromisso" },
            ].map(g => (
              <div key={g.t} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                <span className="text-xs font-bold text-[#111111]">{g.t}</span>
                <span className="text-xs text-[#111111]/45 hidden sm:inline">· {g.s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TABELA DE PREÇOS — split-screen edge-to-edge
        ══════════════════════════════════════════════════ */}
        <section className="grid md:grid-cols-2">
          <div className="px-8 py-16 md:px-14 md:py-24 flex flex-col justify-between" style={{ backgroundColor: "#071a12" }}>
            <div>
              <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-6" style={{ color: "#D4AF37" }}>
                Tabela de Preços
              </p>
              <p className="font-playfair font-bold leading-none mb-3" style={{ fontSize: "clamp(5rem, 12vw, 9rem)", color: "rgba(212,175,55,0.18)" }}>01</p>
              <h2 className="font-playfair font-bold text-white mb-4 leading-tight" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)" }}>
                {data.serviceName}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
                Preços fixos e transparentes {prep} {data.cityName}. O valor final é sempre confirmado antes de qualquer intervenção, sem surpresas.
              </p>
            </div>
            <div className="w-10 h-px" style={{ backgroundColor: "rgba(212,175,55,0.4)" }} />
          </div>

          <div className="px-8 py-16 md:px-14 md:py-24 bg-[#FDFDF9]">
            <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-6" style={{ color: "#D4AF37" }}>Preços</p>
            <ul className="divide-y divide-[#E8E4DE] border-t border-[#E8E4DE]">
              {data.priceTable.map((row, i) => (
                <li key={i} className="flex items-start justify-between gap-4 py-5">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-[10px] font-black tracking-wider pt-1 w-6 flex-shrink-0" style={{ color: "#D4AF37" }}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#111111] leading-snug">{row.item}</p>
                      {row.note && (
                        <span className="inline-block text-[10px] uppercase tracking-widest text-[#D4AF37]/70 font-semibold mt-1">
                          {row.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-playfair text-xl font-bold text-[#111111] flex-shrink-0 tabular-nums">{row.price}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[#111111]/35 mt-6">
              Preços indicativos. O orçamento definitivo é confirmado antes de iniciar qualquer trabalho, sem surpresas.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            O QUE INFLUENCIA O PREÇO — editorial numerado
        ══════════════════════════════════════════════════ */}
        {data.factors.length > 0 && (
          <section className="bg-[#FDFDF9]">
            <div className="px-8 py-14 md:px-14 md:py-20 border-b border-[#E8E4DE]">
              <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                Fatores de preço
              </p>
              <h2 className="font-playfair font-bold text-[#111111] leading-tight max-w-2xl" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
                O que influencia o preço final
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-0 divide-y divide-[#E8E4DE] sm:divide-y-0 sm:gap-px" style={{ backgroundColor: "#E8E4DE" }}>
              {data.factors.map((factor, idx) => (
                <div key={idx} className="bg-[#FDFDF9] px-8 py-10 md:px-8 md:py-12 flex flex-col">
                  <p className="font-playfair font-bold leading-none mb-4" style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", color: "rgba(212,175,55,0.18)" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </p>
                  <div className="w-6 h-px mb-4" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-sm text-[#111111]/60 leading-relaxed">{factor}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            TRUST STATS
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-14 md:px-14 md:py-20" style={{ backgroundColor: "#071a12" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl">
            {[
              { v: REVIEW_RATING, l: "Google Reviews", stars: true },
              { v: "+1000", l: "Clientes satisfeitos" },
              { v: "1h", l: "Duração média do serviço" },
              { v: "0€", l: "Deslocação em Porto e Grande Porto" },
            ].map((s, i) => (
              <div key={i}>
                {s.stars && (
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                  </div>
                )}
                <p className="font-playfair font-bold text-white" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>{s.v}</p>
                <p className="text-white/40 text-xs mt-1 leading-snug">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TESTEMUNHO — pull quote editorial
        ══════════════════════════════════════════════════ */}
        {testimonial && (
          <section className="px-8 py-16 md:px-14 md:py-24 bg-[#FDFDF9] border-t border-[#E8E4DE]">
            <div className="max-w-3xl">
              <p className="font-playfair font-bold leading-none mb-4 select-none" style={{ fontSize: "7rem", color: "rgba(212,175,55,0.15)", lineHeight: 1 }} aria-hidden="true">"</p>
              <p className="font-playfair text-[#111111] leading-relaxed mb-8" style={{ fontSize: "clamp(1.15rem, 2.8vw, 1.65rem)" }}>
                {testimonial.text}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                </div>
                <div className="h-3.5 w-px" style={{ backgroundColor: "rgba(212,175,55,0.3)" }} />
                <div>
                  <span className="text-sm font-bold text-[#111111]">{testimonial.name}</span>
                  <span className="text-[#111111]/40 text-xs ml-2">· {testimonial.city} · Google</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════ */}
        {data.faqs.length > 0 && (
          <section className="px-8 py-16 md:px-14 md:py-24" style={{ backgroundColor: "#071a12" }}>
            <div className="max-w-3xl">
              <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                Perguntas
              </p>
              <h2 className="font-playfair font-bold text-white leading-tight mb-12" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
                Dúvidas sobre preços
              </h2>
              <ServiceFAQSchema faqs={data.faqs} />
              <Accordion type="single" collapsible className="space-y-0 divide-y divide-white/10 border-t border-white/10">
                {data.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-0 py-1">
                    <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-white py-5 hover:no-underline [&[data-state=open]]:text-[#D4AF37] [&[data-state=open]>svg]:text-[#D4AF37]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-white/55 pb-6 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            PREÇO EDITORIAL — dramático
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
                <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" initialLocation={data.cityName} initialService={quizService} />
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`price_final_${data.serviceSlug}_${data.citySlug}`)}
                className="w-full inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                Falar agora
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-16 md:px-14 md:py-24 border-t border-[#E8E4DE]" style={{ backgroundColor: "#071a12" }}>
          <div className="max-w-2xl">
            <p className="text-[10px] font-black tracking-[0.32em] uppercase mb-5" style={{ color: "#D4AF37" }}>
              Kyro Clean Solutions
            </p>
            <h2 className="font-playfair font-bold text-white leading-tight mb-5" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
              Peça o seu orçamento {prep} {data.cityName}
            </h2>
            <p className="text-white/45 text-sm leading-relaxed mb-10 max-w-md">
              Desde {servicePrice} · Resultado garantido ou repetimos grátis · Deslocação incluída no Porto e Grande Porto
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
              <div className="relative flex-1">
                <div className="absolute -inset-1.5 rounded-full bg-gold/40 opacity-30 blur-lg pointer-events-none" />
                <QuizButton className="relative w-full" buttonClassName="h-[52px] !py-0 w-full" ctaLabel="Ver preço grátis" initialLocation={data.cityName} initialService={quizService} />
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`price_cta_${data.serviceSlug}_${data.citySlug}`)}
                className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
              >
                <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                Falar agora
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            REDE INTERNA
        ══════════════════════════════════════════════════ */}
        <section className="px-8 py-12 md:px-14 md:py-16 bg-[#FDFDF9] border-t border-[#E8E4DE]">
          <div className="space-y-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Ver página completa do serviço</p>
              <Link
                to={`/${data.serviceSlug}-${data.citySlug}`}
                className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 transition-all"
              >
                <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                {data.serviceName} {prep} {data.cityName}
              </Link>
            </div>

            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Outros serviços {prep} {data.cityName}</p>
              <div className="flex flex-wrap gap-2">
                {relatedServices.map(svc => (
                  <Link key={svc.slug} to={`/preco-${svc.slug}-${data.citySlug}`}
                    className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 transition-all">
                    <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                    {svc.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-[#111111]/40">Preços noutras cidades</p>
              <div className="flex flex-wrap gap-2">
                {nearbyCities.map(city => (
                  <Link key={city.slug} to={`/preco-${data.serviceSlug}-${city.slug}`}
                    className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/40 transition-all">
                    <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                buildWebPageNode({ url: `${SITE_URL}${pathname}`, name: data.title, description: data.metaDescription }),
                buildBreadcrumbNode(`${SITE_URL}${pathname}#breadcrumb`, [
                  { name: "Início", item: SITE_URL },
                  { name: data.serviceName, item: `${SITE_URL}/${data.serviceSlug}` },
                  { name: `Preços ${prep} ${data.cityName}`, item: `${SITE_URL}${pathname}` },
                ]),
                buildServiceNode({
                  url: `${SITE_URL}${pathname}`,
                  name: `${data.serviceName} ${prep} ${data.cityName}`,
                  description: data.metaDescription,
                  areaServed: { "@type": "City", name: data.cityName },
                  offers: buildOfferNode(servicePrice.replace(/[^0-9]/g, "")),
                }),
              ],
            }),
          }}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default PricePage;

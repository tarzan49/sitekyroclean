import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { MapPin, MessageCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import { getPricePageData, getAllPriceRoutes } from "@/data/priceSeoData";
import { SERVICE_TESTIMONIALS } from "@/data/locationPriceTestimonialsData";
import { services, cities, cityPrep } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
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
  const service = services.find(s => s.slug === data.serviceSlug);
  const servicePrice = service?.priceFrom ?? "49€";
  const relatedServices = services.filter(s => s.slug !== data.serviceSlug).slice(0, 4);
  const nearbyCities = cities.filter(c => c.slug !== data.citySlug).slice(0, 8);
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.cityName))}`;
  const testimonialPool = SERVICE_TESTIMONIALS[data.serviceSlug] ?? SERVICE_TESTIMONIALS['limpeza-sofas'];
  const testimonialHash = data.cityName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const testimonial = testimonialPool[testimonialHash % testimonialPool.length];
  const serviceNameShort = data.serviceName.replace(/^Limpeza de /, "").replace(/^Impermeabilização$/, "Impermeabilização");

  return (
    <QuizLocationProvider value={data.cityName}>
    <QuizServiceProvider value={quizService}>
    <>
      <Header />
      <main className="relative overflow-hidden" style={{ backgroundColor: "#0a1f17" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 900px 500px at 50% -10%, rgba(212,175,55,0.10), transparent 60%)" }} />

        {/* ── Topo: breadcrumb ── */}
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-24 md:pt-28">
          <nav className="flex items-center gap-1.5 text-xs text-white/40" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/70 transition-colors">Início</Link>
            <span>/</span>
            <Link to={`/${data.serviceSlug}`} className="hover:text-white/70 transition-colors">{data.serviceName}</Link>
            <span>/</span>
            <span className="text-white/60">Preço · {data.cityName}</span>
          </nav>
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20 grid lg:grid-cols-[440px_1fr] gap-14 lg:gap-20 items-start">

          {/* ══════════════════════════════════════════════════
              O BILHETE — ficha de preços
          ══════════════════════════════════════════════════ */}
          <div className="relative">
            <div
              className="relative"
              style={{ boxShadow: "0 30px 70px -20px rgba(0,0,0,0.55)" }}
            >
              {/* Selo dourado */}
              <div
                className="absolute -top-7 right-7 w-[58px] h-[58px] rounded-full flex items-center justify-center z-10"
                style={{
                  background: "linear-gradient(155deg, #e3bd5c, #c8992e 55%, #9a7420)",
                  boxShadow: "0 8px 18px -6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)",
                  transform: "rotate(8deg)",
                }}
              >
                <span className="font-playfair font-bold text-xl" style={{ color: "#0a1f17" }}>K</span>
              </div>

              {/* Perfuração topo */}
              <div
                className="h-3.5"
                style={{
                  background: "radial-gradient(circle at 10px 7px, #0a1f17 7px, transparent 7.5px) repeat-x",
                  backgroundSize: "24px 14px",
                  backgroundColor: "transparent",
                }}
              />

              <div className="px-8 pt-2 pb-8" style={{ backgroundColor: "#f4eee0", color: "#211d16" }}>
                <p className="text-[11px] font-bold tracking-[0.22em] uppercase mb-2" style={{ color: "#c8992e" }}>
                  Tabela de Preços · {new Date().getFullYear()}
                </p>
                <h1 className="font-playfair font-bold leading-[1.02]" style={{ fontSize: "clamp(2rem, 4.4vw, 2.7rem)" }}>
                  {serviceNameShort}
                </h1>
                <span className="font-playfair block mt-0.5" style={{ fontSize: "clamp(1.1rem, 2.4vw, 1.35rem)", color: "#c8992e" }}>
                  {prep} {data.cityName}
                </span>

                <hr className="my-6" style={{ borderTop: "1px solid #d8caa8" }} />

                <ul className="space-y-0">
                  {data.priceTable.map((row, i) => (
                    <li
                      key={i}
                      className={`flex items-baseline gap-2 py-2.5 ${row.note ? "px-3.5 -mx-3.5" : ""}`}
                      style={row.note ? { background: "linear-gradient(90deg, rgba(200,153,46,0.09), transparent)" } : undefined}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{row.item}</span>
                        {row.note && (
                          <span className="block text-[10px] font-bold tracking-[0.14em] uppercase mt-0.5" style={{ color: "#c8992e" }}>
                            {row.note}
                          </span>
                        )}
                      </div>
                      <span className="flex-1 border-b border-dotted mx-1" style={{ borderColor: "rgba(33,29,22,0.35)", transform: "translateY(-4px)" }} />
                      <span className="font-playfair font-bold text-xl tabular-nums flex-shrink-0">{row.price}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs mt-5 leading-relaxed" style={{ color: "rgba(33,29,22,0.5)" }}>
                  Preços indicativos. O orçamento definitivo é confirmado antes de iniciar qualquer trabalho, sem surpresas.
                </p>

                <div className="flex gap-2.5 mt-6">
                  <div className="relative flex-1">
                    <QuizButton
                      className="relative w-full"
                      buttonClassName="h-[50px] !py-0 w-full !rounded-none font-bold text-[13px]"
                      ctaLabel="Ver preço grátis"
                      initialLocation={data.cityName}
                      initialService={quizService}
                    />
                  </div>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`price_hero_${data.serviceSlug}_${data.citySlug}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-[50px] font-bold text-[13px] text-white"
                    style={{ backgroundColor: "#0a1f17" }}
                  >
                    <MessageCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Talão */}
              <div
                className="flex items-center justify-between px-8 py-4 text-[10px] tracking-wider uppercase"
                style={{ backgroundColor: "#f4eee0", color: "rgba(33,29,22,0.4)", borderTop: "1px dashed #d8caa8" }}
              >
                <span>Orçamento <b style={{ color: "#211d16" }}>{data.serviceSlug.slice(0, 3).toUpperCase()}-{new Date().getFullYear()}</b></span>
                <span>Válido hoje</span>
              </div>

              {/* Perfuração fundo */}
              <div
                className="h-3.5"
                style={{
                  background: "radial-gradient(circle at 10px 7px, #0a1f17 7px, transparent 7.5px) repeat-x",
                  backgroundSize: "24px 14px",
                  transform: "scaleY(-1)",
                }}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              LADO — conteúdo editorial discreto
          ══════════════════════════════════════════════════ */}
          <div className="pt-1">

            {data.factors.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2.5 mb-4">
                  <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: "#c8992e" }}>O que pesa no preço</p>
                  <div className="flex-1 h-px" style={{ backgroundColor: "rgba(212,175,55,0.18)" }} />
                </div>
                <h2 className="font-playfair font-bold text-white mb-5" style={{ fontSize: "clamp(1.3rem, 2.6vw, 1.7rem)" }}>
                  Fatores que influenciam o valor final
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.factors.map((factor, i) => (
                    <span key={i} className="inline-flex items-center gap-2 text-sm text-white/75 px-3.5 py-2" style={{ border: "1px solid rgba(212,175,55,0.18)" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#c8992e" }} />
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trust stats */}
            <div className="grid grid-cols-3 gap-6 mb-12 py-6" style={{ borderTop: "1px solid rgba(212,175,55,0.18)", borderBottom: "1px solid rgba(212,175,55,0.18)" }}>
              <div>
                <p className="font-playfair font-bold text-white" style={{ fontSize: "1.6rem" }}>{REVIEW_RATING} ★</p>
                <p className="text-white/40 text-xs mt-0.5">Google Reviews</p>
              </div>
              <div>
                <p className="font-playfair font-bold text-white" style={{ fontSize: "1.6rem" }}>+1000</p>
                <p className="text-white/40 text-xs mt-0.5">Clientes satisfeitos</p>
              </div>
              <div>
                <p className="font-playfair font-bold text-white" style={{ fontSize: "1.6rem" }}>0€</p>
                <p className="text-white/40 text-xs mt-0.5">Deslocação {prep} {data.cityName}</p>
              </div>
            </div>

            {/* Testemunho */}
            {testimonial && (
              <div className="mb-12">
                <div className="flex items-center gap-2.5 mb-4">
                  <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: "#c8992e" }}>No terreno, esta semana</p>
                  <div className="flex-1 h-px" style={{ backgroundColor: "rgba(212,175,55,0.18)" }} />
                </div>
                <div className="relative max-w-md p-6" style={{ backgroundColor: "#f4eee0", color: "#211d16", transform: "rotate(-1deg)", boxShadow: "0 16px 34px -14px rgba(0,0,0,0.5)" }}>
                  <div
                    className="absolute -top-2.5 left-8 w-11 h-5"
                    style={{ background: "rgba(200,153,46,0.5)", border: "1px solid rgba(200,153,46,0.65)", transform: "rotate(-4deg)" }}
                  />
                  <p className="font-playfair leading-relaxed mb-3.5" style={{ fontSize: "1.15rem" }}>"{testimonial.text}"</p>
                  <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "#c8992e" }}>
                    <span style={{ letterSpacing: "1px" }}>★★★★★</span>
                    {testimonial.name} · {testimonial.city} · Google
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            {data.faqs.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2.5 mb-4">
                  <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: "#c8992e" }}>Perguntas frequentes</p>
                  <div className="flex-1 h-px" style={{ backgroundColor: "rgba(212,175,55,0.18)" }} />
                </div>
                <ServiceFAQSchema faqs={data.faqs} />
                <div style={{ borderTop: "1px solid rgba(212,175,55,0.18)" }}>
                  {data.faqs.map((faq, i) => (
                    <details key={i} className="group py-4.5" style={{ borderBottom: "1px solid rgba(212,175,55,0.18)" }}>
                      <summary className="list-none flex items-center justify-between gap-4 text-sm md:text-base font-medium text-white cursor-pointer">
                        {faq.question}
                        <span className="font-playfair text-xl flex-shrink-0 transition-transform group-open:rotate-45" style={{ color: "#c8992e" }}>+</span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-white/55 max-w-[60ch]">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* CTA final */}
            <div className="pt-10" style={{ borderTop: "1px solid rgba(212,175,55,0.18)" }}>
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: "#c8992e" }}>Kyro Clean Solutions</p>
              <h2 className="font-playfair font-bold text-white leading-tight mb-2.5" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}>
                Peça o seu orçamento {prep} {data.cityName}
              </h2>
              <p className="text-white/45 text-sm mb-6 max-w-md">
                Resposta em menos de 30 minutos. Sem compromisso, sem surpresas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
                <div className="relative flex-1">
                  <div className="absolute -inset-1.5 rounded-full opacity-30 blur-lg pointer-events-none" style={{ backgroundColor: "#D4AF37" }} />
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
              <p className="text-white/30 text-xs mt-4">{REVIEW_COUNT}+ avaliações · Desde {servicePrice}</p>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            REDE INTERNA
        ══════════════════════════════════════════════════ */}
        <section className="relative px-5 sm:px-8 py-12 md:py-16 border-t" style={{ borderColor: "rgba(212,175,55,0.18)" }}>
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-white/40">Ver página completa do serviço</p>
              <Link
                to={`/${data.serviceSlug}-${data.citySlug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white border hover:border-[#D4AF37]/40 transition-all"
                style={{ borderColor: "rgba(212,175,55,0.18)" }}
              >
                <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                {data.serviceName} {prep} {data.cityName}
              </Link>
            </div>

            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-white/40">Outros serviços {prep} {data.cityName}</p>
              <div className="flex flex-wrap gap-2">
                {relatedServices.map(svc => (
                  <Link key={svc.slug} to={`/preco-${svc.slug}-${data.citySlug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white border hover:border-[#D4AF37]/40 transition-all"
                    style={{ borderColor: "rgba(212,175,55,0.18)" }}>
                    <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                    {svc.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-4 text-white/40">Preços noutras cidades</p>
              <div className="flex flex-wrap gap-2">
                {nearbyCities.map(city => (
                  <Link key={city.slug} to={`/preco-${data.serviceSlug}-${city.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white border hover:border-[#D4AF37]/40 transition-all"
                    style={{ borderColor: "rgba(212,175,55,0.18)" }}>
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

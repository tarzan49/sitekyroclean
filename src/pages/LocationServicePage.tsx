import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Star, CheckCircle, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import ServicePackBanner from "@/components/ServicePackBanner";
import { getLocationServiceData, services, cities, getCityLinksForService } from "@/data/locationSeoData";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { municipiosComFreguesias } from "@/data/freguesiaSeoData";
import { getAllProblems } from "@/data/problemSeoData";
import { GENERIC_PROCESS_STEPS, IMPERMEABILIZACAO_STEPS } from "@/constants/serviceProcesses";
import { SERVICE_PACK_SLUGS } from "@/constants/servicePackSlugs";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITIES } from "@/constants/metroCities";
import { SERVICE_HERO_IMAGES, SERVICE_RESULT_IMAGES, SERVICE_RESULT_CONTENT, SERVICE_HERO_FALLBACK, SERVICE_RESULT_FALLBACK } from "@/constants/serviceContent";
import { buildServiceWaMessage } from "@/lib/buildServiceWaMessage";

const PRICE_TABLE: Record<string, { item: string; price: string; highlight?: boolean }[]> = {
  'limpeza-sofas': [
    { item: 'Sofá 1 lugar',            price: '49€' },
    { item: 'Sofá 2 lugares',          price: '69€', highlight: true },
    { item: 'Sofá 3 lugares',          price: '79€' },
    { item: 'Chaise longue (add-on)',  price: '+10€' },
    { item: 'Sofá modular / em L',     price: 'Sob orçamento' },
  ],
  'limpeza-colchoes': [
    { item: 'Colchão solteiro',        price: '39€' },
    { item: 'Colchão casal',           price: '49€', highlight: true },
    { item: 'Colchão king / queen',    price: '59€' },
  ],
  'limpeza-tapetes': [
    { item: 'Tapete até 5 m²',         price: '10€/m²' },
    { item: 'Tapete 5 – 15 m²',        price: '7€/m²', highlight: true },
    { item: 'Tapete +15 m²',           price: 'Sob orçamento' },
  ],
  'limpeza-cadeiras': [
    { item: '1 cadeira (tampo)',        price: '15€' },
    { item: '1 cadeira (completa)',     price: '20€', highlight: true },
    { item: '6+ cadeiras',             price: '10€/un' },
  ],
  'limpeza-alcatifas': [
    { item: 'Até 50 m²',               price: '3€/m²', highlight: true },
    { item: '+50 m²',                  price: 'Sob orçamento' },
  ],
  'impermeabilizacao': [
    { item: 'Sofá 1 lugar',            price: '49€' },
    { item: 'Sofá 2 lugares',          price: '69€', highlight: true },
    { item: 'Sofá 3 lugares',          price: '89€' },
    { item: 'Colchão solteiro',        price: '45€' },
    { item: 'Colchão casal',           price: '50€' },
    { item: 'Tapetes',                 price: '7€/m²' },
  ],
};

const SERVICE_TESTIMONIALS: Record<string, { name: string; city: string; text: string }[]> = {
  'limpeza-sofas': [
    { name: "Maria S.", city: "Porto", text: "O meu sofá tinha 8 anos e achei que ia ter de comprar um novo. Resultado incrível, como novo em poucas horas!" },
    { name: "Rui T.", city: "Espinho", text: "Tinham-me dito que a nódoa de vinho não saía. A Kyro provou o contrário! Sofá impecável." },
  ],
  'limpeza-colchoes': [
    { name: "Fernando G.", city: "Rio Tinto", text: "Tinha alergia constante à noite. Depois da limpeza do colchão melhorou imenso. Super recomendo!" },
    { name: "Daniela R.", city: "Famalicão", text: "Limparam os colchões das crianças. Ficaram super higiénicos e sem aquele cheiro a humidade." },
  ],
  'limpeza-tapetes': [
    { name: "Sandra V.", city: "Paredes", text: "O tapete da sala recuperou cores que já nem me lembrava que tinha. Fiquei completamente impressionada!" },
    { name: "Miguel S.", city: "Cascais", text: "Limparam tapetes persas antigos com todo o cuidado. Resultado impecável, como novos." },
  ],
  'limpeza-cadeiras': [
    { name: "Teresa F.", city: "Lisboa", text: "As cadeiras da sala de jantar ficaram como novas. Atendimento excelente do início ao fim." },
    { name: "Helena M.", city: "Ermesinde", text: "As cadeiras do escritório ficaram impecáveis. Equipa pontual e muito profissional." },
  ],
  'limpeza-alcatifas': [
    { name: "Carlos M.", city: "Braga", text: "Serviço de excelência! A alcatifa do escritório ficou impecável. Profissionais muito competentes e pontuais." },
    { name: "António F.", city: "Vila do Conde", text: "Limparam todo o recheio do AL e os hóspedes notaram logo a diferença. Obrigado!" },
  ],
  'impermeabilizacao': [
    { name: "Ricardo A.", city: "Póvoa de Varzim", text: "A impermeabilização foi perfeita. Agora estou muito mais tranquilo com crianças em casa. Recomendo vivamente!" },
    { name: "João P.", city: "Vila Nova de Gaia", text: "Cheiro fresco e sensação incrível. Equipa profissional, rápida e super cuidadosa." },
  ],
};


function parseLocationRoute(pathname: string): { serviceSlug: string; citySlug: string } | null {
  const path = pathname.replace(/^\//, '');
  for (const service of services) {
    for (const city of cities) {
      if (path === `${service.slug}-${city.slug}`) {
        return { serviceSlug: service.slug, citySlug: city.slug };
      }
    }
  }
  return null;
}

const LocationServicePage = () => {
  const location = useLocation();
  const parsed = useMemo(() => parseLocationRoute(location.pathname), [location.pathname]);
  const data = useMemo(() => (parsed ? getLocationServiceData(parsed.serviceSlug, parsed.citySlug) : null), [parsed]);

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
      if (canonical) canonical.setAttribute("href", `https://cleansolutions.com.pt${location.pathname}`);
    }
  }, [location.pathname, data]);

  const relatedProblems = useMemo(() => {
    if (!data) return [];
    return getAllProblems()
      .filter(p =>
        p.visible &&
        p.relatedServices.includes(data.serviceSlug) &&
        (METRO_CITIES.has(data.citySlug) || p.relatedCities.includes(data.citySlug))
      )
      .slice(0, 5)
      .map(p => ({ slug: p.slug, keyword: p.keyword }));
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

  const quizService = SERVICE_TO_QUIZ[data.serviceSlug];

  const heroImgs = SERVICE_HERO_IMAGES[data.serviceSlug] ?? SERVICE_HERO_FALLBACK;
  const resultImg = SERVICE_RESULT_IMAGES[data.serviceSlug] ?? SERVICE_RESULT_FALLBACK;
  const resultLabel = data.serviceSlug === 'impermeabilizacao' ? 'impermeabilização' : 'limpeza';
  const otherServices = data.relatedServices
    .map(slug => {
      const svc = services.find(s => s.slug === slug);
      return svc ? { ...svc, locationPath: `/${slug}-${data.citySlug}` } : null;
    })
    .filter(Boolean) as (typeof services[number] & { locationPath: string })[];

  const cityFreguesias = municipiosComFreguesias.find(m => m.slug === data.citySlug);

  const resultDesc = SERVICE_RESULT_CONTENT[data.serviceSlug]?.(data.city)?.desc ?? data.metaDescription;
  const serviceBaseUrl = services.find(s => s.slug === data.serviceSlug)?.baseRoute ?? `/${data.serviceSlug}`;

  return (
    <QuizLocationProvider value={data.city}>
    <QuizServiceProvider value={quizService}>
      <ServiceLocationSchema
        serviceName={data.service}
        serviceBaseUrl={serviceBaseUrl}
        placeName={data.city}
        description={resultDesc}
        pageUrl={location.pathname}
        priceFrom={data.priceFrom}
      />
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
                  <Link to={services.find(s => s.slug === data.serviceSlug)?.baseRoute || "/"} className="hover:text-white/80 transition-colors">{data.service}</Link>
                  <span>/</span>
                  <span className="text-white/70">{data.city}</span>
                </nav>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" style={{ color: "#D4AF37" }} />
                  <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>{data.city}</span>
                </div>

                <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.15]">
                  {data.h1}
                </h1>

                <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-lg">
                  {data.intro.split('.')[0]}.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                      ))}
                    </div>
                    <span className="text-white font-bold text-sm">5.0</span>
                    <span className="text-white/50 text-xs">Google</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-white/60 text-xs font-medium">50+ avaliações</span>
                  <div className="h-4 w-px bg-white/20" />
                  <span className="text-white/60 text-xs font-medium">+1000 clientes</span>
                </div>

                <div className="flex gap-3 max-w-md">
                  <QuizButton
                    className="flex-1"
                    initialLocation={data.city}
                    initialService={quizService}
                    ctaLabel="Ver preço grátis"
                    buttonClassName="h-[52px] !py-0 w-full"
                  />
                  <a
                    href={`https://wa.me/351925530647?text=${encodeURIComponent(buildServiceWaMessage(data.serviceSlug, data.city))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`location_hero_${data.serviceSlug}_${data.citySlug}`)}
                    className="relative flex-1 inline-flex items-center justify-center gap-2 h-[52px] px-5 rounded-full font-black text-sm text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_2px_6px_rgba(0,0,0,0.28)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
                  >
                    <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                    Falar agora
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
                      alt={`${data.service} profissional em ${data.city}`}
                      className="relative rounded-2xl w-full max-h-[400px] object-cover shadow-2xl"
                      loading="eager"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROBLEMAS COMUNS ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>O que resolvemos</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E]">
                  Problemas comuns em {data.city}
                </h2>
              </div>
              <div className={`grid gap-3 md:gap-4 ${data.problems.length === 3 ? 'sm:grid-cols-3 justify-items-center max-w-2xl mx-auto w-full' : 'grid-cols-2 md:grid-cols-4'}`}>
                {data.problems.slice(0, 4).map((problem, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 text-center shadow-sm border border-[#E8E4DE] hover:shadow-md hover:border-[#D4AF37]/30 transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "rgba(212,175,55,0.1)" }}
                    >
                      <Star className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A2E] leading-snug">{problem.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TABELA DE PREÇOS ═══ */}
        {PRICE_TABLE[data.serviceSlug] && (
          <section className="py-12 md:py-14 bg-white border-t border-[#E8E4DE]">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Preços em {data.city}</p>
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E]">
                    Quanto custa {data.service.toLowerCase()} em {data.city}?
                  </h2>
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#E8E4DE] shadow-sm">
                  {PRICE_TABLE[data.serviceSlug].map((row, i) => (
                    <div
                      key={i}
                      className={[
                        "flex items-center justify-between px-5 py-3.5 text-sm",
                        i % 2 === 0 ? "bg-[#FDFDF9]" : "bg-white",
                        row.highlight ? "border-l-2" : "",
                      ].join(" ")}
                      style={row.highlight ? { borderLeftColor: "#D4AF37" } : {}}
                    >
                      <span className={row.highlight ? "font-semibold text-[#1A1A2E]" : "text-[#1A1A2E]/70"}>{row.item}</span>
                      <span className="font-bold tabular-nums" style={{ color: "#D4AF37" }}>{row.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#1A1A2E]/45 flex-wrap">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> Deslocação incluída na área de {data.city}</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> Orçamento gratuito e sem compromisso</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> IVA incluído</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══ COMO FUNCIONA ═══ */}
        <section className="py-12 md:py-16 relative overflow-hidden bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Processo</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white">Como funciona</h2>
                {data.howItWorks && (
                  <p className="mt-4 text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">{data.howItWorks}</p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {(data.serviceSlug === 'impermeabilizacao' ? IMPERMEABILIZACAO_STEPS : GENERIC_PROCESS_STEPS).map((step, idx) => (
                  <div key={idx} className="text-center">
                    <div className="relative inline-block mb-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-gold/20"
                        style={{ background: "rgba(212,175,55,0.1)" }}
                      >
                        <span className="font-playfair font-bold text-lg" style={{ color: "#D4AF37" }}>{step.step}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white/80 mb-1">{step.label}</p>
                    <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ RESULTADO ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={resultImg}
                  alt={`Resultado após ${data.service.toLowerCase()} em ${data.city}`}
                  className="w-full h-[280px] md:h-[400px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a12]/85 via-[#0B2F2A]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-2">
                    Resultado após {resultLabel} profissional
                  </h2>
                  <p className="text-white/70 text-sm md:text-base max-w-lg">
                    {(SERVICE_RESULT_CONTENT[data.serviceSlug] ?? SERVICE_RESULT_CONTENT['limpeza-sofas'])(data.city).desc}
                  </p>
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    {(SERVICE_RESULT_CONTENT[data.serviceSlug] ?? SERVICE_RESULT_CONTENT['limpeza-sofas'])(data.city).checks.map((check, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" style={{ color: "#D4AF37" }} />
                        <span className="text-white/80 text-sm">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        {data.faqs && data.faqs.length > 0 && (
          <section className="py-12 md:py-16 relative overflow-hidden bg-checker-dark">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Perguntas</p>
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white">
                    Perguntas Frequentes
                  </h2>
                </div>
                <Accordion type="single" collapsible className="space-y-3">
                  {data.faqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`faq-${idx}`}
                      className="bg-white/[0.04] rounded-2xl border border-white/10 px-5 transition-all duration-300 data-[state=open]:ring-1 data-[state=open]:ring-gold/25"
                    >
                      <AccordionTrigger className="text-left text-sm font-semibold text-white py-5 hover:no-underline [&[data-state=open]>svg]:text-gold">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-white/55 pb-5 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* ═══ TESTEMUNHOS ═══ */}
        {SERVICE_TESTIMONIALS[data.serviceSlug] && (
          <section className="py-12 md:py-14 bg-[#FDFDF9] border-t border-[#E8E4DE]">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Avaliações reais</p>
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1A2E]">O que dizem os nossos clientes</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {SERVICE_TESTIMONIALS[data.serviceSlug].map((t, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-[#E8E4DE] shadow-sm">
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />)}
                      </div>
                      <p className="text-sm text-[#1A1A2E]/65 leading-relaxed italic mb-3">"{t.text}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#D4AF37" }}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1A1A2E]">{t.name}</p>
                          <p className="text-[10px] text-[#1A1A2E]/40">{t.city}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Garantia */}
                <div className="rounded-2xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ background: "#071a12", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#D4AF37" }}>Garantia Kyro Clean</p>
                    <p className="text-sm text-white/80 font-medium">Resultado garantido ou devolvemos o dinheiro.</p>
                  </div>
                  <QuizButton initialLocation={data.city} initialService={quizService} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══ ÁREA DE SERVIÇO ═══ */}
        <section className="py-12 md:py-14 bg-white">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Cobertura</p>
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-4">
                Servimos {data.city} e arredores
              </h2>
              {data.localSection && (
                <p className="text-sm text-[#1A1A2E]/60 max-w-2xl mx-auto mb-6 leading-relaxed">{data.localSection}</p>
              )}

              {cityFreguesias && cityFreguesias.freguesias.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {cityFreguesias.freguesias.slice(0, 8).map(f => (
                    <Link
                      key={f.slug}
                      to={`/${data.serviceSlug}-${data.citySlug}-${f.slug}`}
                      className="inline-flex items-center gap-1.5 bg-[#FDFDF9] px-3.5 py-2 rounded-full text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all"
                    >
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />
                      {f.name}
                    </Link>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#1A1A2E]/50 mb-3">Também disponível em:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {getCityLinksForService(data.serviceSlug).filter(c => c.name !== data.city).slice(0, 6).map(city => (
                  <Link
                    key={city.name}
                    to={city.path}
                    className="text-xs text-[#1A1A2E]/60 hover:text-[#D4AF37] transition-colors font-medium"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>

              {otherServices.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#E8E4DE]">
                  <p className="text-xs text-[#1A1A2E]/50 mb-3">Outros serviços em {data.city}:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {otherServices.map(svc => (
                      <Link
                        key={svc.slug}
                        to={svc.locationPath}
                        className="text-xs font-semibold text-[#1A1A2E]/60 hover:text-[#D4AF37] transition-colors"
                      >
                        {svc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedProblems.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#E8E4DE]">
                  <p className="text-xs text-[#1A1A2E]/50 mb-3">Problemas que resolvemos em {data.city}:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {relatedProblems.map(p => (
                      <Link
                        key={p.slug}
                        to={`/${p.slug}-${data.citySlug}`}
                        className="text-xs text-[#1A1A2E]/60 hover:text-[#D4AF37] transition-colors font-medium"
                      >
                        {p.keyword}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══ PACKS ═══ */}
        <ServicePackBanner
          packSlugs={SERVICE_PACK_SLUGS[data.serviceSlug] ?? ["pack-sala-completa"]}
          city={data.citySlug}
        />

        {/* ═══ BENEFÍCIOS ═══ */}
        {data.benefits && data.benefits.length > 0 && (
          <section className="py-12 md:py-16 bg-white">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Vantagens</p>
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A1A2E]">
                    Porquê escolher a Kyro em {data.city}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {data.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#FDFDF9] rounded-2xl p-4 border border-[#E8E4DE]">
                      <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#D4AF37" }} />
                      <span className="text-sm text-[#1A1A2E]/70 leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQ schema, ServiceLocationSchema already provides Service + BreadcrumbList */}
        <ServiceFAQSchema faqs={data.faqs} />
      </main>
      <Footer />
    </QuizServiceProvider>
    </QuizLocationProvider>
  );
};

export default LocationServicePage;

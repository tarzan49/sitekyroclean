import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { QuizLocationProvider, QuizServiceProvider } from "@/context/QuizLocationContext";
import { ArrowRight, CheckCircle, MapPin, AlertTriangle, Lightbulb, Phone, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import ServiceLocationSchema from "@/components/ServiceLocationSchema";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { cities, services, DEFAULT_PRICE_FROM, cityPrep, cityPrepCap } from "@/data/locationSeoData";
import { SERVICE_TO_QUIZ } from "@/constants/serviceToQuiz";
import { METRO_CITY_SLUGS } from "@/constants/metroCities";
import { getAllProblemCityRoutes } from "@/data/problemCitySeoData";
import { getProblemHeroImage } from "@/lib/problemHeroImages";
import { SITE_URL, WHATSAPP_BASE, PHONE_E164 } from "@/constants/business";

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
        <main className="pt-28 pb-16 min-h-screen bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-[#111111] mb-4">Página não encontrada</h1>
            <Link to="/" className="text-gold hover:underline">Voltar ao início</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const prep = cityPrep(city.name);
  const Prep = cityPrepCap(city.name);
  const quizService = SERVICE_TO_QUIZ[problem.relatedServices[0]] ?? 'sofa';

  const relatedProblemLinks = getRelatedProblemLinks(problem.relatedProblems);
  const relatedServiceData = problem.relatedServices
    .map(slug => services.find(s => s.slug === slug))
    .filter(Boolean) as typeof services[number][];
  const priceFrom = relatedServiceData[0]?.priceFrom ?? DEFAULT_PRICE_FROM;
  const cityContext = getCityContext(problem.slug, city.name, city.description);

  // Only show nearby cities that actually have a route for this problem
  const validCitySlugs = new Set([...METRO_CITY_SLUGS, ...problem.relatedCities]);
  const nearbyCities = cities
    .filter(c => c.slug !== city.slug && validCitySlugs.has(c.slug))
    .slice(0, 6);

  // Localize FAQs: keep questions intact for featured snippets, add city to answers
  const localFaqs = problem.faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer.includes(city.name)
      ? faq.answer
      : `${faq.answer} Prestamos este serviço ao domicílio ${prep} ${city.name} e arredores.`,
  }));

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
        priceFrom={priceFrom}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-24 md:pt-28 pb-10 md:pb-14 overflow-hidden bg-checker-dark">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img
              src={getProblemHeroImage(problem.slug)}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,26,18,0.42) 0%, rgba(7,26,18,0.65) 40%, rgba(7,26,18,0.88) 75%, rgba(7,26,18,0.97) 100%)" }} />

          <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-white/80 transition-colors">Início</Link>
                <span>/</span>
                <Link to={`/problemas/${problem.slug}`} className="hover:text-white/80 transition-colors">{problem.h1}</Link>
                <span>/</span>
                <span className="text-white/70">{city.name}</span>
              </nav>

              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                Como resolver {prep} {city.name}
              </p>

              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                {problem.h1} {prep} {city.name}
              </h1>
              <div className="w-10 h-px mb-5 opacity-50" style={{ backgroundColor: "#D4AF37" }} />
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-5 max-w-2xl">
                {problem.intro.replace(/no Porto|ao domicílio/g, `${prep} ${city.name}`)}
              </p>

              <p className="text-sm font-semibold mb-6" style={{ color: "#D4AF37" }}>
                A partir de {priceFrom} · Resultado no mesmo dia · Serviço ao domicílio {prep} {city.name}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <QuizButton initialLocation={city.name} initialService={quizService} />
                <a
                  href={WHATSAPP_BASE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 rounded-full text-white/75 font-medium text-sm hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200"
                >
                  <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Problem + Solution */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E4DE]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#111111]">O Problema {prep} {city.name}</h2>
                </div>
                <p className="text-sm md:text-base text-[#111111]/60 leading-relaxed mb-3">{problem.problemDetail}</p>
                <p className="text-sm text-[#111111]/50 leading-relaxed italic border-t border-[#E8E4DE] pt-3">{cityContext}</p>
              </div>
              <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ background: "#071a12", borderColor: "rgba(212,175,55,0.25)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)" }}>
                    <Lightbulb className="w-5 h-5" style={{ color: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-xl md:text-2xl font-bold text-white">A Nossa Solução</h2>
                </div>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">{problem.solutionDetail}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Vantagens</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-6">Benefícios do nosso serviço {prep} {city.name}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {problem.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                    <span className="text-sm font-medium text-white/80">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {localFaqs.length > 0 && (
          <section className="py-12 md:py-16 bg-[#FDFDF9]">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Perguntas</p>
                  <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                </div>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#111111] mb-8 text-center">Perguntas Frequentes</h2>
                <ServiceFAQSchema faqs={localFaqs} />
                <div className="space-y-4">
                  {localFaqs.map((faq, i) => (
                    <details key={i} className="bg-white rounded-[18px] shadow-sm border border-[#E8E4DE] px-6 group hover:border-[#D4AF37]/30 transition-all">
                      <summary className="py-5 font-semibold text-[#111111] cursor-pointer list-none flex items-center justify-between text-base">
                        {faq.question}
                        <ArrowRight className="w-4 h-4 text-[#111111]/30 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="pb-5 text-[#111111]/60 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-10 md:py-14 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>Kyro Clean Solutions</p>
            <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-3">
              Resolva o problema {prep} {city.name}
            </h2>
            <p className="text-white/60 mb-6 text-base">
              Orçamento gratuito em menos de 30 minutos · Sem compromisso.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <QuizButton initialLocation={city.name} initialService={quizService} />
              <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 rounded-full text-white/75 font-medium text-sm hover:bg-white/[0.07] hover:border-white/35 hover:text-white transition-all duration-200">
                <MessageCircle className="w-[18px] h-[18px] text-[#25D366] flex-shrink-0" strokeWidth={2} />WhatsApp</a>
              <a href={`tel:${PHONE_E164}`} className="inline-flex items-center gap-1.5 text-white/75 hover:text-gold font-medium text-sm transition-colors duration-150">
                <Phone className="w-3.5 h-3.5 text-gold animate-phone-shake flex-shrink-0" strokeWidth={2.5} />
                <span className="font-bold tracking-wide">Ligar agora</span>
              </a>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {relatedServiceData.length > 0 && (
                <div>
                  <h3 className="font-playfair text-lg md:text-xl font-bold text-[#111111] mb-4">Serviços {prep} {city.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedServiceData.map(svc => (
                      <Link key={svc.slug} to={`/${svc.slug}-${city.slug}`} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />{svc.name} {prep} {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedProblemLinks.length > 0 && (
                <div>
                  <h3 className="font-playfair text-lg md:text-xl font-bold text-[#111111] mb-4">Problemas relacionados</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedProblemLinks.map(link => (
                      <Link key={link.path} to={link.path} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all">
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />{link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-playfair text-lg md:text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: "#D4AF37" }} />
                  Este problema noutras cidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {nearbyCities.map(c => (
                    <Link key={c.slug} to={`/${problem.slug}-${c.slug}`} className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#111111] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all">
                      <MapPin className="w-3 h-3" style={{ color: "#D4AF37" }} />{c.name}
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

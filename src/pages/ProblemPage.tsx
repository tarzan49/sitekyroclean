import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, ArrowRight, AlertTriangle, Lightbulb, MapPin, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import { getProblemBySlug, getRelatedProblemLinks } from "@/data/problemSeoData";
import { services, cities } from "@/data/locationSeoData";
import { getProblemHeroImage } from "@/lib/problemHeroImages";

const CATEGORY_TIPS: Record<string, { title: string; steps: string[]; warning: string }> = {
  manchas: {
    title: "O que fazer nos primeiros 5 minutos",
    steps: [
      "Absorva o excesso com pano branco seco — nunca esfregue",
      "Aplique pressão suave do exterior para o interior da mancha",
      "Não use água quente: fixa proteínas e taninos permanentemente nas fibras",
    ],
    warning: "Manchas com mais de 24 horas requerem extração profissional para remoção completa",
  },
  odores: {
    title: "Ação imediata para neutralizar odores",
    steps: [
      "Ventile a divisão ao máximo durante pelo menos 2 horas",
      "Bicarbonato de sódio seco sobre o tecido absorve odores temporariamente (30 min, depois aspire)",
      "Evite produtos perfumados — mascaram o odor mas não o eliminam na raiz",
    ],
    warning: "Odores orgânicos (urina, suor, mofo) só são eliminados definitivamente com extração profissional",
  },
  saude: {
    title: "Redução imediata da carga alergénica",
    steps: [
      "Aspire com filtro HEPA em movimentos lentos e sobrepostos (2 passagens)",
      "Capa anti-ácaros reduz exposição mas não elimina os ácaros existentes",
      "Mantenha humidade interior abaixo de 50% — ácaros proliferam acima desse valor",
    ],
    warning: "Eliminação permanente de 99% dos ácaros só é possível com extração profissional a vapor",
  },
  animais: {
    title: "Controlo imediato com animais de estimação",
    steps: [
      "Remova pelos visíveis com fita adesiva ou luva de borracha húmida",
      "Bicarbonato neutraliza o cheiro de animal temporariamente",
      "Urina: absorva imediatamente e aplique solução de água e vinagre branco (50/50)",
    ],
    warning: "Dander e alérgenos de animais penetram nas fibras — só extração profissional os remove completamente",
  },
  urgencia: {
    title: "Protocolo de emergência",
    steps: [
      "Absorva o máximo de líquido imediatamente com toalhas absorventes",
      "Não aplique calor (secador) — fixa manchas e odores nas fibras",
      "Contacte um profissional nas primeiras 2-4 horas para melhores resultados",
    ],
    warning: "Após 24 horas, manchas e odores tornam-se significativamente mais difíceis de remover",
  },
  protecao: {
    title: "Como preparar os estofos para impermeabilização",
    steps: [
      "Limpe profissionalmente antes de impermeabilizar — a sujidade bloqueia a proteção",
      "Aguarde 24-48h após aplicação para ativação completa — evite uso intenso",
      "Reaplique a cada 12-18 meses ou após cada limpeza profissional",
    ],
    warning: "Impermeabilização em tecido sujo é ineficaz — a ordem correta é sempre: limpar primeiro, proteger depois",
  },
  materiais: {
    title: "Cuidados essenciais com materiais delicados",
    steps: [
      "Verifique a etiqueta: W (água), S (solvente), WS (ambos), X (só aspiração)",
      "Teste qualquer produto numa zona não visível por 10 min antes de aplicar",
      "Veludo e alcântara: nunca esfregue — use pano na direção da fibra apenas",
    ],
    warning: "Materiais delicados sem tratamento adequado perdem textura e cor permanentemente",
  },
  preco: {
    title: "Como obter o orçamento mais preciso",
    steps: [
      "Fotografe o estado atual do estofado e envie pelo WhatsApp para orçamento mais exato",
      "Compare sempre pelo método: extração profissional a quente ≠ shampooing superficial",
      "Orçamentos que incluem deslocação, pré-tratamento e secagem são os mais completos",
    ],
    warning: "Preços abaixo de 25€ geralmente não incluem extração profissional real — o resultado é temporário",
  },
  metodo: {
    title: "O que esperar de um serviço profissional de qualidade",
    steps: [
      "O técnico inspeciona o tipo de tecido e manchas antes de iniciar (sinal de profissionalismo)",
      "Processo completo: 45 min a 3 horas conforme dimensão e estado do estofado",
      "Deixe secar completamente antes de usar — 2 a 6 horas dependendo da ventilação",
    ],
    warning: "Uso antes de secar completamente pode causar marcas de água no tecido",
  },
};

function getProblemCtaLabel(slug: string): string {
  if (slug.includes("mancha")) return "Eliminar manchas agora";
  if (slug.includes("urina")) return "Tratar urgentemente";
  if (slug.includes("cheiro") || slug.includes("odor")) return "Eliminar maus cheiros";
  if (slug.includes("acar")) return "Eliminar ácaros agora";
  if (slug.includes("alerg")) return "Resolver alergias agora";
  if (slug.includes("pelos")) return "Remover pelos agora";
  if (slug.includes("impermeabiliz")) return "Impermeabilizar agora";
  if (slug.includes("mofo") || slug.includes("bolor")) return "Eliminar mofo agora";
  if (slug.includes("urgente")) return "Agendar urgentemente";
  if (slug.includes("quanto") || slug.includes("custa")) return "Ver preços e orçamento";
  if (slug.includes("higieniz")) return "Agendar higienização";
  if (slug.includes("lavagem") || slug.includes("limpeza")) return "Agendar limpeza agora";
  return "Pedir orçamento grátis";
}

const ProblemPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const data = useMemo(() => (slug ? getProblemBySlug(slug) : null), [slug]);

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
      if (canonical) canonical.setAttribute("href", `https://www.cleansolutions.com.pt/problemas/${slug}`);
    }
  }, [slug, data]);

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

  const relatedServiceData = data.relatedServices
    .map(slug => services.find(s => s.slug === slug))
    .filter(Boolean) as typeof services[number][];

  const relatedProblemLinks = getRelatedProblemLinks(data.relatedProblems);

  const METRO_SLUGS = ["porto", "matosinhos", "maia", "vila-nova-de-gaia", "gondomar", "braga", "lisboa"];
  const problemCitySlugs = Array.from(new Set([...METRO_SLUGS, ...data.relatedCities]));
  const relatedCityData = problemCitySlugs
    .map(slug => cities.find(c => c.slug === slug))
    .filter(Boolean) as typeof cities[number][];

  return (
    <>
      <Header />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 md:pt-28 pb-14 md:pb-20 overflow-hidden bg-checker-dark">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img
              src={getProblemHeroImage(slug ?? "")}
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
                <span className="text-white/50">Problemas</span>
                <span>/</span>
                <span className="text-white/70">{data.h1}</span>
              </nav>

              <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>
                Como resolver
              </p>

              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                {data.h1}
              </h1>

              <div className="w-10 h-px mb-5 opacity-50" style={{ backgroundColor: "#D4AF37" }} />

              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8 max-w-2xl">
                {data.intro}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <QuizButton problema={slug} ctaLabel={getProblemCtaLabel(slug ?? "")} />
                <a
                  href="https://wa.me/351925530647"
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

        {/* ═══ PROBLEMA + SOLUÇÃO ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E4DE]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1A2E]">O Problema</h2>
                </div>
                <p className="text-sm md:text-base text-[#1A1A2E]/60 leading-relaxed">
                  {data.problemDetail}
                </p>
              </div>

              <div
                className="rounded-2xl p-6 md:p-8 shadow-sm border"
                style={{ background: "#071a12", borderColor: "rgba(212,175,55,0.25)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)" }}>
                    <Lightbulb className="w-5 h-5" style={{ color: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-xl md:text-2xl font-bold text-white">A Nossa Solução</h2>
                </div>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  {data.solutionDetail}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ BENEFÍCIOS ═══ */}
        <section className="py-12 md:py-16 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Vantagens</p>
              </div>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-6">
                Benefícios do nosso serviço
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                    <span className="text-sm md:text-base text-white/80 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ DICA RÁPIDA ═══ */}
        {CATEGORY_TIPS[data.category] && (() => {
          const tips = CATEGORY_TIPS[data.category];
          return (
            <section className="py-10 md:py-12 bg-white">
              <div className="container mx-auto px-5 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                  <div className="rounded-2xl p-6 md:p-8 border" style={{ backgroundColor: "#071a12", borderColor: "rgba(212,175,55,0.25)" }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
                        <Lightbulb className="w-4 h-4" style={{ color: "#D4AF37" }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.22em] uppercase mb-0.5" style={{ color: "#D4AF37" }}>Dica de especialista</p>
                        <h2 className="font-playfair text-lg md:text-xl font-bold text-white">{tips.title}</h2>
                      </div>
                    </div>
                    <ol className="space-y-3 mb-5">
                      {tips.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-white/80 text-sm leading-relaxed">
                          <span className="text-xs font-bold mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(212,175,55,0.18)", color: "#D4AF37" }}>
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)" }}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} />
                      <p className="text-xs text-white/55 leading-relaxed">{tips.warning}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ═══ FAQ ═══ */}
        {data.faqs.length > 0 && (
          <section className="py-12 md:py-16 bg-white">
            <div className="container mx-auto px-5 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37" }}>Perguntas</p>
                    <div className="h-px w-10 opacity-40" style={{ backgroundColor: "#D4AF37" }} />
                  </div>
                  <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A2E]">
                    Perguntas Frequentes
                  </h2>
                </div>
                <ServiceFAQSchema faqs={data.faqs} />
                <Accordion type="single" collapsible className="space-y-4">
                  {data.faqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`faq-${idx}`}
                      className="bg-white rounded-[18px] shadow-sm hover:shadow-md border border-[#E8E4DE] px-6 transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-[#D4AF37]/30"
                    >
                      <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-[#1A1A2E] py-5 hover:no-underline [&[data-state=open]>svg]:text-[#D4AF37]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-[#1A1A2E]/60 pb-6 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* ═══ CTA ═══ */}
        <section className="py-10 md:py-14 bg-checker-dark">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: "#D4AF37" }}>Kyro Clean Solutions</p>
            <h2 className="font-playfair text-xl md:text-3xl font-bold text-white mb-3">
              Resolver este problema agora
            </h2>
            <p className="text-white/60 mb-6 text-base">
              Resposta em menos de 2 horas · Sem compromisso
            </p>
            <QuizButton problema={slug} ctaLabel={getProblemCtaLabel(slug ?? "")} />
          </div>
        </section>

        {/* ═══ REDE INTERNA ═══ */}
        <section className="py-12 md:py-16 bg-[#FDFDF9]">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-10">

              {relatedServiceData.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-[#1A1A2E] mb-4">Serviços relacionados</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedServiceData.map(svc => (
                      <Link
                        key={svc.slug}
                        to={svc.baseRoute}
                        className="group flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-[#E8E4DE] hover:border-[#D4AF37]/30 transition-all"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#D4AF37] transition-colors">{svc.name}</span>
                          <span className="block text-xs text-[#1A1A2E]/50">Desde {svc.priceFrom}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#1A1A2E]/30 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedProblemLinks.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-[#1A1A2E] mb-4">Problemas relacionados</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedProblemLinks.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all"
                      >
                        <ArrowRight className="w-3 h-3" style={{ color: "#D4AF37" }} />
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedCityData.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-playfair font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    Disponível nestas cidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedCityData.map(city => (
                      <Link
                        key={city.slug}
                        to={`/${data.slug}-${city.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#1A1A2E] border border-[#E8E4DE] hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/5 transition-all"
                      >
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

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["LocalBusiness", "CleaningService"],
                  "@id": "https://www.cleansolutions.com.pt/#business",
                  "name": "Kyro Clean Solutions",
                  "url": "https://www.cleansolutions.com.pt",
                  "telephone": "+351925530647",
                  "email": "cleansolutions.pt25@gmail.com",
                  "priceRange": "€€",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "R. de António Cardoso 263",
                    "addressLocality": "Porto",
                    "postalCode": "4150-081",
                    "addressCountry": "PT",
                  },
                  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "bestRating": "5", "worstRating": "1", "reviewCount": "51", "ratingCount": "51" },
                },
                {
                  "@type": "WebPage",
                  "@id": `https://www.cleansolutions.com.pt/problemas/${slug}#webpage`,
                  "name": data.title,
                  "description": data.metaDescription,
                  "url": `https://www.cleansolutions.com.pt/problemas/${slug}`,
                  "publisher": { "@id": "https://www.cleansolutions.com.pt/#business" },
                  "isPartOf": { "@id": "https://www.cleansolutions.com.pt/#website" },
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.cleansolutions.com.pt/" },
                    { "@type": "ListItem", "position": 2, "name": "Problemas", "item": "https://www.cleansolutions.com.pt/problemas" },
                    { "@type": "ListItem", "position": 3, "name": data.h1, "item": `https://www.cleansolutions.com.pt/problemas/${slug}` },
                  ],
                },
              ],
            }),
          }}
        />
      </main>
      <Footer />
    </>
  );
};

export default ProblemPage;

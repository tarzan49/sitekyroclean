import { useTranslation } from "react-i18next";
import { Shield, Heart, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import RelatedServices from "@/components/RelatedServices";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServicePackBanner from "@/components/ServicePackBanner";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServiceBenefitsBar, { BenefitItem } from "@/components/ServiceBenefitsBar";
import ServiceEliteGuarantee from "@/components/ServiceEliteGuarantee";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import tapeteAntes from "@/assets/tapete-antes.webp";
import tapeteDepois from "@/assets/tapete-depois.webp";
import alcatifaResultado from "@/assets/galeria-alcatifa-resultado.webp";
import alcatifaProcesso from "@/assets/galeria-alcatifa-processo.webp";

const alcatifasBenefits: BenefitItem[] = [
  {
    icon: Shield,
    label: "Saúde",
    title: "Elimine o que o aspirador não alcança",
    body: "A densidade das alcatifas retém até 10× mais poluentes do que pavimentos lisos. A extração a alta pressão remove fungos, ácaros e resíduos que nenhum aspirador consegue tocar.",
  },
  {
    icon: Heart,
    label: "Cobertura Total",
    title: "Higiene em cada centímetro",
    body: "Ao contrário de tapetes soltos, a alcatifa cobre toda a sala e acumula sujidade em toda ela. A nossa limpeza técnica garante tratamento uniforme, sem zonas descuidadas.",
  },
  {
    icon: Sparkles,
    label: "Investimento",
    title: "Poupe na substituição",
    body: "Uma alcatifa de qualidade custa entre 15€ e 80€/m². A limpeza profissional regular, a partir de 3€/m², prolonga-a de 8 para 20 anos, uma poupança de centenas a milhares de euros.",
  },
];

const expertTips = [
  {
    title: "O guia completo de manutenção de alcatifas",
    summary: "Alcatifas em boas condições podem durar 15 a 20 anos. Saiba as rotinas de manutenção que fazem toda a diferença entre renovar e substituir.",
  },
  {
    title: "Por que as alcatifas são o maior reservatório de bactérias em casa",
    summary: "A superfície densa das alcatifas retém até 10 vezes mais partículas do que o pavimento liso. Descubra o impacto real na saúde respiratória.",
  },
  {
    title: "Como responder a um derrame imediatamente",
    summary: "Os primeiros 60 segundos após um derrame são decisivos. Aprenda a técnica de contenção que evita manchas permanentes nas suas alcatifas.",
  },
  {
    title: "Como identificar o tipo de fibra da sua alcatifa",
    summary: "Nylon, lã, poliéster: cada fibra requer um produto e uma técnica diferente. Usar o produto errado pode destruir a alcatifa em segundos.",
  },
];

const LimpezaAlcatifas = () => {
  const { t } = useTranslation();

  const faqs = [1, 2, 3].map((n) => ({
    question: t(`rugCleaning.faq.question${n}`),
    answer: t(`rugCleaning.faq.answer${n}`),
  }));

  return (
    <QuizServiceProvider value="carpet">
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* 1 ── HERO + SABIA QUE PILL ─────────────────────────────── */}
        <ServiceHero
          title="Limpeza de Alcatifas"
          subtitle="Limpeza técnica adaptada a grandes superfícies, garantindo higiene uniforme, frescura e preservação das fibras ao longo do tempo."
          serviceSlug="limpeza-alcatifas"
        />

        {/* 2 ── BENEFÍCIOS REAIS (white) ───────────────────────────── */}
        <ServiceBenefitsBar
          heading="Por que a limpeza profissional de alcatifas é um investimento, não um custo"
          benefits={alcatifasBenefits}
          variant="light"
        />

        {/* 3 ── GALERIA (dark green) ───────────────────────────────── */}
        <ServiceAutoCarousel
          slides={[
            { node: <BeforeAfterSlider beforeImage={tapeteAntes} afterImage={tapeteDepois} orientation="horizontal" noFrame /> },
            { src: alcatifaResultado, label: "Resultado Final" },
            { src: alcatifaProcesso, label: "Extração Profissional" },
          ]}
          title="Resultados Reais"
          variant="dark"
        />

        {/* 4 ── GARANTIA DE ELITE (light) ──────────────────────────── */}
        <ServiceEliteGuarantee heading="A nossa promessa em cada limpeza de alcatifa" variant="light" />

        {/* 5 ── FAQ COMPACTO (dark green) ──────────────────────────── */}
        <section className="py-8 md:py-12 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2" style={{ color: '#D4AF37' }}>
                Dúvidas Frequentes
              </p>
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-white">
                {t("rugCleaning.faq.title")}
              </h2>
              <div className="w-12 h-px mx-auto mt-3" style={{ backgroundColor: '#D4AF37', opacity: 0.4 }} />
            </div>
            <ServiceFAQSchema faqs={faqs} />
            <Accordion type="single" collapsible className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl px-5 transition-all duration-300 data-[state=open]:ring-1 data-[state=open]:ring-gold/25"
                >
                  <AccordionTrigger className="text-left text-[14px] md:text-[15px] font-semibold text-white py-4 hover:no-underline [&[data-state=open]>svg]:text-gold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] md:text-sm text-white/55 pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 6 ── DICAS DE ESPECIALISTA (white) ──────────────────────── */}
        <ServiceExpertTips tips={expertTips} variant="light" />

        {/* 9 ── UPSELL: SERVIÇOS COMPLEMENTARES (lavender) ───────── */}
        <ServicePackBanner packSlugs={["pack-sala-completa"]} variant="dark" />
        <ServiceCityLinks serviceSlug="limpeza-alcatifas" serviceLabel="Limpeza de Alcatifas" />
        <RelatedServices currentService="alcatifas" />

        <ServiceSchema
          serviceName="Limpeza de Alcatifas"
          description="Limpeza profissional de alcatifas no Porto. Remoção de sujidade profunda."
          url="/limpeza-alcatifas"
          priceFrom="3€/m²"
          reviews={[
            { author: "Carlos M.", city: "Braga", text: "Serviço de excelência! A alcatifa do escritório ficou impecável. Profissionais muito competentes e pontuais.", date: "2025-01-20" },
            { author: "António F.", city: "Vila do Conde", text: "Trabalho cinco estrelas! Limparam todo o recheio do AL e os hóspedes notaram logo a diferença. Obrigado!", date: "2025-03-01" },
            { author: "Catarina L.", city: "Viana do Castelo", text: "A alcatifa da escada estava muito suja e ficou impecável. Equipa super simpática e profissional.", date: "2025-04-08" },
          ]}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaAlcatifas;

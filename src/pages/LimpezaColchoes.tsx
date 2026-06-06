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
import colchaoAntes from "@/assets/galeria-colchao-antes.webp";
import colchaoDepois from "@/assets/galeria-colchao-depois.webp";
import colchaoResultado from "@/assets/galeria-colchao-resultado.webp";
import colchaoProcesso from "@/assets/galeria-colchao-processo.webp";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const colchoesBenefits: BenefitItem[] = [
  {
    icon: Shield,
    label: "Sono",
    title: "Durma num colchão realmente limpo",
    body: "Um colchão de 5 anos pode conter até 2 kg de pele morta, suor e ácaros. A higienização profunda elimina esses resíduos e restaura condições saudáveis de descanso.",
  },
  {
    icon: Heart,
    label: "Saúde",
    title: "Respire melhor cada noite",
    body: "Ácaros e fungos no colchão são a principal causa de rinite e asma noturna. A extração profissional reduz sintomas alérgicos em até 80% após apenas uma intervenção.",
  },
  {
    icon: Sparkles,
    label: "Economia",
    title: "Proteja o seu investimento",
    body: "Um colchão de qualidade custa entre 400€ e 2.000€. A higienização regular, a partir de 39€, remove os ácidos e microrganismos que o destroem por dentro.",
  },
];

const expertTips = [
  {
    title: "O perigo invisível dos ácaros no seu colchão",
    summary: "O colchão acumula ácaros, células mortas e bactérias ao longo dos anos. Descubra o impacto real na qualidade do sono da sua família.",
  },
  {
    title: "Como a higienização melhora a qualidade do sono",
    summary: "Estudos mostram que dormir num colchão higienizado pode reduzir sintomas de alergias em até 80% após apenas uma semana.",
  },
  {
    title: "Quanto tempo demora o colchão a secar?",
    summary: "Com equipamento de extração profissional, o colchão fica seco em 2 a 4 horas. Saiba como acelerar ainda mais o processo.",
  },
  {
    title: "Vale a pena impermeabilizar o colchão?",
    summary: "A impermeabilização protege de acidentes e manchas futuras, aumentando significativamente a vida útil do colchão.",
  },
];

const LimpezaColchoes = () => {
  const { t } = useTranslation();

  const faqs = [1, 2, 3].map((n) => ({
    question: t(`mattressCleaning.faq.question${n}`),
    answer: t(`mattressCleaning.faq.answer${n}`),
  }));

  return (
    <QuizServiceProvider value="mattress">
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* 1 ── HERO + SABIA QUE PILL ─────────────────────────────── */}
        <ServiceHero
          title="Limpeza de Colchões"
          subtitle="Higienização profunda que remove ácaros, bactérias e odores acumulados, promovendo um ambiente mais saudável e confortável."
          serviceSlug="limpeza-colchoes"
        />

        {/* 2 ── BENEFÍCIOS REAIS (white) ───────────────────────────── */}
        <ServiceBenefitsBar
          heading="Por que higienizar o colchão profissionalmente muda tudo"
          benefits={colchoesBenefits}
          variant="light"
        />

        {/* 3 ── GALERIA (dark green) ───────────────────────────────── */}
        <ServiceAutoCarousel
          slides={[
            { node: <BeforeAfterSlider beforeImage={colchaoDepois} afterImage={colchaoAntes} orientation="horizontal" noFrame /> },
            { src: colchaoResultado, label: "Resultado Final" },
            { src: colchaoProcesso, label: "Extração Profissional" },
          ]}
          title="Resultados Reais"
          variant="dark"
        />

        {/* 4 ── GARANTIA DE ELITE (light) ──────────────────────────── */}
        <ServiceEliteGuarantee heading="A nossa promessa em cada higienização de colchão" variant="light" />

        {/* 5 ── FAQ COMPACTO (dark green) ──────────────────────────── */}
        <section className="py-8 md:py-12 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2" style={{ color: '#D4AF37' }}>
                Dúvidas Frequentes
              </p>
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-white">
                {t("mattressCleaning.faq.title")}
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
        <ServicePackBanner packSlugs={["pack-sofa-e-colchao", "pack-quarto-completo"]} variant="dark" />
        <ServiceCityLinks serviceSlug="limpeza-colchoes" serviceLabel="Limpeza de Colchões" />
        <RelatedServices currentService="colchoes" />

        <ServiceSchema
          serviceName="Limpeza de Colchões"
          description="Higienização profissional de colchões no Porto. Eliminação de ácaros, bactérias e odores."
          url="/limpeza-colchoes"
          priceFrom="39€"
          reviews={[
            { author: "Fernando G.", city: "Rio Tinto", text: "Excelente trabalho no meu colchão. Tinha alergia constante e depois da limpeza melhorou imenso. Super recomendo!", date: "2025-01-28" },
            { author: "Sofia P.", city: "Guimarães", text: "Fantástico! O colchão estava com manchas difíceis e conseguiram remover tudo. Muito satisfeita com o resultado.", date: "2025-03-10" },
            { author: "Daniela R.", city: "Famalicão", text: "Contratei para limpar os colchões das crianças. Ficaram super higiénicos e sem aquele cheiro a humidade. Adorei!", date: "2025-04-15" },
          ]}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaColchoes;

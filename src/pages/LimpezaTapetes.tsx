import { useTranslation } from "react-i18next";
import { Shield, Heart, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import RelatedServices from "@/components/RelatedServices";
import ServicePackBanner from "@/components/ServicePackBanner";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServiceBenefitsBar, { BenefitItem } from "@/components/ServiceBenefitsBar";
import ServiceEliteGuarantee from "@/components/ServiceEliteGuarantee";
import tapeteAntes from "@/assets/galeria-tapete-antes.webp";
import tapeteDepois from "@/assets/galeria-tapete-depois.webp";
import tapeteResultado from "@/assets/galeria-alcatifa-resultado.webp";
import tapeteProcesso from "@/assets/galeria-tapete-processo.webp";

const tapetesBenefits: BenefitItem[] = [
  {
    icon: Shield,
    label: "Fibras",
    title: "Fibras limpas, tapete duradouro",
    body: "Partículas de areia e sujidade cortam as fibras como lâminas a cada passo. A extração profissional remove esses abrasivos e prolonga o tapete em anos.",
  },
  {
    icon: Heart,
    label: "Ar Interior",
    title: "O tapete filtra o ar que respira",
    body: "Os tapetes retêm até 4× mais poluentes do que o pavimento liso. Quando estão saturados, libertam essas partículas no ar. A limpeza regular mantém essa função protetora ativa.",
  },
  {
    icon: Sparkles,
    label: "Estética",
    title: "Cores vivas, odores eliminados",
    body: "Manchas de vinho, pelo de animais e resíduos orgânicos desaparecem numa única sessão. O tapete recupera a tonalidade original e o odor fresco de novo.",
  },
];

const expertTips = [
  {
    title: "Como remover manchas de tapete sem estragar a fibra",
    summary: "O erro mais comum é esfregar a mancha, o que expande a área afetada. Descubra a técnica de absorção correta que os profissionais usam.",
  },
  {
    title: "Por que os tapetes são o maior reservatório de bactérias em casa",
    summary: "Um tapete pode conter até 4.000 vezes mais bactérias do que a tampa da sanita. Saiba a frequência ideal de higienização profissional.",
  },
  {
    title: "Como eliminar odores de animais de estimação do tapete",
    summary: "Os produtos de supermercado mascaram o cheiro, mas não eliminam as bactérias na raiz. Descubra o que realmente funciona.",
  },
  {
    title: "Quando deve limpar o tapete profissionalmente?",
    summary: "Zonas de passagem intensa acumulam sujidade invisível em apenas 3 meses. Veja os sinais que indicam que está na hora de agir.",
  },
];

const LimpezaTapetes = () => {
  const { t } = useTranslation();

  const faqs = [1, 2, 3].map((n) => ({
    question: t(`carpetCleaning.faq.question${n}`),
    answer: t(`carpetCleaning.faq.answer${n}`),
  }));

  return (
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* 1 ── HERO + SABIA QUE PILL ─────────────────────────────── */}
        <ServiceHero
          title="Limpeza de Tapetes"
          subtitle="Extração profunda que remove resíduos acumulados nas fibras, revitalizando o tapete e melhorando a qualidade do ar interior."
          serviceSlug="limpeza-tapetes"
        />

        {/* 2 ── BENEFÍCIOS REAIS (white) ───────────────────────────── */}
        <ServiceBenefitsBar
          heading="Por que a limpeza profissional de tapetes prolonga a vida das suas fibras"
          benefits={tapetesBenefits}
          variant="light"
        />

        {/* 3 ── GALERIA (dark green) ───────────────────────────────── */}
        <ServiceAutoCarousel
          slides={[
            { node: <BeforeAfterSlider beforeImage={tapeteAntes} afterImage={tapeteDepois} orientation="horizontal" noFrame /> },
            { src: tapeteResultado, label: "Técnico Especializado" },
            { src: tapeteProcesso, label: "Extração Profissional" },
          ]}
          title="Resultados Reais"
          variant="dark"
        />

        {/* 4 ── GARANTIA DE ELITE (light) ──────────────────────────── */}
        <ServiceEliteGuarantee heading="A nossa promessa em cada limpeza de tapete" variant="light" />

        {/* 5 ── FAQ COMPACTO (dark green) ──────────────────────────── */}
        <section className="py-8 md:py-12 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2" style={{ color: '#D4AF37' }}>
                Dúvidas Frequentes
              </p>
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-white">
                {t("carpetCleaning.faq.title")}
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
        <RelatedServices currentService="tapetes" />

        <ServiceSchema
          serviceName="Limpeza de Tapetes"
          description="Lavagem e limpeza profissional de tapetes no Porto. Remoção de manchas e odores."
          url="/limpeza-tapetes"
          priceFrom="5€/m²"
        />
      </main>
      <Footer />
    </>
  );
};

export default LimpezaTapetes;

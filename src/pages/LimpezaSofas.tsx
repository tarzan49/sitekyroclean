import { useTranslation } from "react-i18next";
import { Shield, Heart, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
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
import sofaBeforeNew from "@/assets/galeria-sofa-antes.webp";
import sofaAfterNew from "@/assets/galeria-sofa-depois.webp";
import sofaResultado from "@/assets/galeria-sofa-resultado.webp";
import sofaProcesso from "@/assets/galeria-sofa-processo.webp";

const sofaBenefits: BenefitItem[] = [
  {
    icon: Shield,
    label: "Durabilidade",
    title: "Prolongue a vida do seu sofá",
    body: "A sujidade acumulada nas fibras degrada o tecido de dentro para fora. Higienização regular evita o desgaste prematuro e pode duplicar a vida útil do sofá.",
  },
  {
    icon: Heart,
    label: "Saúde",
    title: "Zero ácaros, zero alergénios",
    body: "Um sofá adulto acumula até 10 milhões de ácaros. A extração a vapor elimina 99,9% desses microrganismos, criando um ambiente seguro para toda a família.",
  },
  {
    icon: Sparkles,
    label: "Resultado",
    title: "Cores, cheiro e conforto novos",
    body: "Manchas, odores de animais e sujidade de anos desaparecem numa única sessão. O sofá fica com o aspeto e o toque que tinha quando o trouxe para casa.",
  },
];

const expertTips = [
  {
    title: "Como remover manchas de vinho em 30 segundos",
    summary: "A maioria das tentativas caseiras piora a mancha permanentemente. Descubra a técnica correta antes de estragar o tecido.",
  },
  {
    title: "O perigo invisível dos ácaros no seu sofá",
    summary: "Um sofá adulto pode conter até 10 milhões de ácaros. Conheça o impacto real na qualidade do ar que a sua família respira.",
  },
  {
    title: "Posso usar vapor para limpar o sofá em casa?",
    summary: "O vapor pode danificar tecidos sensíveis se não for usado corretamente. Saiba quando é — e quando não é — seguro aplicar.",
  },
  {
    title: "Com que frequência devo limpar o sofá profissionalmente?",
    summary: "Especialistas recomendam limpeza anual para famílias com crianças ou animais, e bianual nos restantes casos.",
  },
];

const LimpezaSofas = () => {
  const { t } = useTranslation();

  const faqs = [1, 2, 3].map((n) => ({
    question: t(`sofaCleaning.faq.question${n}`),
    answer: t(`sofaCleaning.faq.answer${n}`),
  }));

  return (
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* 1 ── HERO + SABIA QUE PILL ─────────────────────────────── */}
        <ServiceHero
          title="Limpeza de Sofás"
          subtitle="Remoção eficaz de sujidade, manchas e alergénios, devolvendo higiene, conforto e uma aparência cuidada ao sofá."
          serviceSlug="limpeza-sofas"
        />

        {/* 2 ── BENEFÍCIOS REAIS (white) ───────────────────────────── */}
        <ServiceBenefitsBar
          heading="Por que a limpeza profissional de sofás vale o investimento"
          benefits={sofaBenefits}
          variant="light"
        />

        {/* 3 ── GALERIA (dark green) ───────────────────────────────── */}
        <ServiceAutoCarousel
          slides={[
            { node: <BeforeAfterSlider beforeImage={sofaBeforeNew} afterImage={sofaAfterNew} orientation="horizontal" noFrame /> },
            { src: sofaResultado, label: "Resultado Final" },
            { src: sofaProcesso, label: "Extração Profissional", objectPosition: "bottom" },
          ]}
          title="Resultados Reais"
          variant="dark"
        />

        {/* 4 ── GARANTIA DE ELITE (light) ──────────────────────────── */}
        <ServiceEliteGuarantee heading="A nossa promessa em cada limpeza de sofá" variant="light" />

        {/* 5 ── FAQ COMPACTO (dark green) ──────────────────────────── */}
        <section className="py-8 md:py-12 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2" style={{ color: '#D4AF37' }}>
                Dúvidas Frequentes
              </p>
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-white">
                {t("sofaCleaning.faq.title")}
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

        {/* 9 ── PACKS COM DESCONTO ─────────────────────────────────── */}
        <ServicePackBanner packSlugs={["pack-sofa-e-colchao", "pack-sofa-impermeabilizacao"]} variant="dark" />

        {/* 10 ── CIDADES ────────────────────────────────────────── */}
        <ServiceCityLinks serviceSlug="limpeza-sofas" serviceLabel="Limpeza de Sofás" />

        {/* 11 ── UPSELL: SERVIÇOS COMPLEMENTARES (lavender) ──────── */}
        <RelatedServices currentService="sofas" />

        <ServiceSchema
          serviceName="Limpeza de Sofás"
          description="Limpeza e lavagem profissional de sofás ao domicílio no Porto. Remoção de manchas, ácaros e odores."
          url="/limpeza-sofas"
          priceFrom="39€"
        />
      </main>
      <Footer />
    </>
  );
};

export default LimpezaSofas;

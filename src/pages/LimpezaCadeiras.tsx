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
import cadeiraAntes from "@/assets/galeria-cadeira-antes.webp";
import cadeiraDepois from "@/assets/galeria-cadeira-depois.webp";
import cadeiraResultado from "@/assets/galeria-cadeira-resultado.webp";
import cadeiraProcesso from "@/assets/galeria-cadeira-processo.webp";

const cadeirasBenefits: BenefitItem[] = [
  {
    icon: Shield,
    label: "Higiene",
    title: "Proteja quem senta à sua mesa",
    body: "Cadeiras de jantar acumulam restos de comida, gordura e bactérias invisíveis em cada dobra do tecido. A limpeza profissional elimina os focos de contaminação que o olho não vê.",
  },
  {
    icon: Heart,
    label: "Durabilidade",
    title: "Tecidos frescos por mais tempo",
    body: "A sujidade embutida nas fibras causa desbotamento e deformação prematura. Tratar as cadeiras profissionalmente 1× por ano pode duplicar a vida do estofo.",
  },
  {
    icon: Sparkles,
    label: "Imagem",
    title: "Um espaço que impressiona",
    body: "Cadeiras limpas elevam toda a decoração da sala ou escritório. Recuperamos o aspeto original de veludo, linho, couro e microfibra sem danificar as fibras delicadas.",
  },
];

const expertTips = [
  {
    title: "Como limpar cadeiras de jantar sem danificar o tecido",
    summary: "As cadeiras de jantar acumulam gordura, restos de comida e bactérias invisíveis. Saiba o método correto que preserva a fibra e elimina os riscos à saúde.",
  },
  {
    title: "O segredo para manter cadeiras de estofo como novas",
    summary: "A sujidade invisível degrada o tecido antes de ser visível. Descubra a rotina simples de manutenção que prolonga a vida das suas cadeiras em anos.",
  },
  {
    title: "Quantas bactérias existem realmente nas suas cadeiras?",
    summary: "Cadeiras de escritório e de jantar são um dos objetos mais contaminados da casa. Os números vão surpreendê-lo, e motivá-lo a agir.",
  },
  {
    title: "Veludo, couro, linho: qual é a sua cadeira mais difícil de limpar?",
    summary: "Cada tecido tem vulnerabilidades diferentes. Usar o produto errado pode causar desbotamento ou deformação permanente do tecido.",
  },
];

const LimpezaCadeiras = () => {
  const { t } = useTranslation();

  const faqs = [1, 2, 3].map((n) => ({
    question: t(`chairCleaning.faq.question${n}`),
    answer: t(`chairCleaning.faq.answer${n}`),
  }));

  return (
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* 1 ── HERO + SABIA QUE PILL ─────────────────────────────── */}
        <ServiceHero
          title="Limpeza de Cadeiras"
          subtitle="Limpeza profissional que elimina sujidade do uso diário, ajudando a prolongar a vida do tecido e a manter a higiene do espaço."
          serviceSlug="limpeza-cadeiras"
        />

        {/* 2 ── BENEFÍCIOS REAIS (white) ───────────────────────────── */}
        <ServiceBenefitsBar
          heading="Por que a limpeza profissional de cadeiras transforma o seu espaço"
          benefits={cadeirasBenefits}
          variant="light"
        />

        {/* 3 ── GALERIA (dark green) ───────────────────────────────── */}
        <ServiceAutoCarousel
          slides={[
            { node: <BeforeAfterSlider beforeImage={cadeiraAntes} afterImage={cadeiraDepois} orientation="horizontal" noFrame /> },
            { src: cadeiraResultado, label: "Resultado Final" },
            { src: cadeiraProcesso, label: "Extração Profissional" },
          ]}
          title="Resultados Reais"
          variant="dark"
        />

        {/* 4 ── GARANTIA DE ELITE (light) ──────────────────────────── */}
        <ServiceEliteGuarantee heading="A nossa promessa em cada limpeza de cadeiras" variant="light" />

        {/* 5 ── FAQ COMPACTO (dark green) ──────────────────────────── */}
        <section className="py-8 md:py-12 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2" style={{ color: '#D4AF37' }}>
                Dúvidas Frequentes
              </p>
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-white">
                {t("chairCleaning.faq.title")}
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
        <ServiceCityLinks serviceSlug="limpeza-cadeiras" serviceLabel="Limpeza de Cadeiras" />
        <RelatedServices currentService="cadeiras" />

        <ServiceSchema
          serviceName="Limpeza de Cadeiras"
          description="Limpeza profissional de cadeiras e estofos no Porto."
          url="/limpeza-cadeiras"
          priceFrom="10€"
          reviews={[
            { author: "Teresa F.", city: "Lisboa", text: "Adorei o serviço de limpeza das cadeiras da sala de jantar. Ficaram como novas e o atendimento foi excelente.", date: "2025-02-14" },
            { author: "Helena M.", city: "Ermesinde", text: "As cadeiras do escritório ficaram impecáveis. Equipa pontual e muito profissional. Já agendei para o próximo semestre.", date: "2025-03-20" },
            { author: "Luís L.", city: "Gondomar", text: "Excelente serviço e profissionais! Deixaram tudo impecável e fizeram o trabalho com cuidado e simpatia.", date: "2025-01-25" },
          ]}
        />
      </main>
      <Footer />
    </>
  );
};

export default LimpezaCadeiras;

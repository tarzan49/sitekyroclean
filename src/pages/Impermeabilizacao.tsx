import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Heart, Sparkles } from "lucide-react";
import impermeabilizacaoAntes from "@/assets/galeria-impermeabilizacao-antes.webp";
import impermeabilizacaoDepois from "@/assets/galeria-impermeabilizacao-depois.webp";
import impermeabilizacaoResultado from "@/assets/galeria-impermeabilizacao-resultado.webp";
import impermeabilizacaoProcesso from "@/assets/galeria-impermeabilizacao-processo.webp";
import Header from "@/components/Header";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import RelatedServices from "@/components/RelatedServices";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServicePackBanner from "@/components/ServicePackBanner";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServiceBenefitsBar, { BenefitItem } from "@/components/ServiceBenefitsBar";
import ServiceEliteGuarantee from "@/components/ServiceEliteGuarantee";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const impermeabilizacaoBenefits: BenefitItem[] = [
  {
    icon: Shield,
    label: "Durabilidade",
    title: "Proteção até 10 anos",
    body: "A barreira de nano-partículas repele líquidos, gordura e sujidade sem alterar o toque ou a aparência do tecido. Uma única aplicação, proteção duradoura.",
  },
  {
    icon: Heart,
    label: "Saúde",
    title: "Menos bactérias, mais higiene",
    body: "Tecidos impermeabilizados retêm menos humidade e bactérias. O ambiente da sua casa fica mais seco, mais fresco e mais saudável a longo prazo.",
  },
  {
    icon: Sparkles,
    label: "Economia",
    title: "Poupa centenas de euros",
    body: "Substituir um sofá de qualidade custa entre 800€ e 3.000€. A impermeabilização custa uma fração e evita essa despesa por anos.",
  },
];

const expertTips = [
  {
    title: "10 anos de proteção: como funciona a impermeabilização",
    summary: "A tecnologia de nano-partículas cria uma barreira molecular invisível que repele líquidos sem alterar o toque ou a aparência do tecido.",
  },
  {
    title: "Por que a impermeabilização é o melhor investimento para os seus estofos",
    summary: "Um sofá de 1.200€ protegido com impermeabilização dura em média o dobro do tempo. Calcule a poupança real ao longo de 10 anos.",
  },
  {
    title: "Impermeabilização vs. limpeza: qual fazer primeiro?",
    summary: "Aplicar impermeabilização sobre tecido sujo é um erro comum que reduz a eficácia a zero. Descubra a ordem correta do processo completo.",
  },
  {
    title: "Impermeabilização é segura para crianças e animais?",
    summary: "Os produtos que utilizamos são certificados, não tóxicos e seguros após a secagem. Saiba exatamente o que está a aplicar na sua casa.",
  },
];

const Impermeabilizacao = () => {
  const { t } = useTranslation();

  const faqs = [1, 2, 3, 4, 5].map((n) => ({
    question: t(`waterproofing.faq.question${n}`),
    answer: t(`waterproofing.faq.answer${n}`),
  }));

  return (
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* 1 ── HERO + SABIA QUE PILL ─────────────────────────────── */}
        <ServiceHero
          title="A limpeza renova. A impermeabilização mantém."
          subtitle="Proteção invisível que cria uma barreira contra líquidos e manchas, preservando o tecido sem alterar o toque ou a aparência."
          serviceSlug="impermeabilizacao"
        />

        {/* 2 ── BENEFÍCIOS REAIS IMPERMEABILIZAÇÃO (white) ────────── */}
        <ServiceBenefitsBar
          heading="Como a impermeabilização profissional protege o seu lar"
          benefits={impermeabilizacaoBenefits}
          variant="light"
        />

        {/* 3 ── GALERIA (dark green) ───────────────────────────────── */}
        <ServiceAutoCarousel
          slides={[
            { node: <BeforeAfterSlider beforeImage={impermeabilizacaoAntes} afterImage={impermeabilizacaoDepois} orientation="horizontal" noFrame /> },
            { src: impermeabilizacaoResultado, label: "Resultado Final" },
            { src: impermeabilizacaoProcesso, label: "Barreira Impermeável" },
          ]}
          title="Resultados Reais"
          variant="dark"
        />

        {/* 4 ── GARANTIA DE ELITE (light) ──────────────────────────── */}
        <ServiceEliteGuarantee heading="A nossa promessa em cada impermeabilização" variant="light" />

        {/* 5 ── FAQ COMPACTO (dark green) ──────────────────────────── */}
        <section className="py-8 md:py-12 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-2" style={{ color: '#D4AF37' }}>
                Dúvidas Frequentes
              </p>
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-white">
                {t("waterproofing.faq.title")}
              </h2>
              <div className="w-12 h-px mx-auto mt-3" style={{ backgroundColor: '#D4AF37', opacity: 0.4 }} />
            </div>
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
        <ServicePackBanner packSlugs={["pack-sofa-impermeabilizacao", "pack-quarto-completo"]} variant="dark" />
        <ServiceCityLinks serviceSlug="impermeabilizacao" serviceLabel="Impermeabilização de Estofos" />
        <RelatedServices currentService="impermeabilizacao" />

        <ServiceSchema
          serviceName="Impermeabilização de Estofos"
          description="Impermeabilização profissional de sofás, tapetes e cadeiras no Porto. Proteção até 10 anos."
          url="/impermeabilizacao"
          priceFrom="49€"
          reviews={[
            { author: "Ricardo A.", city: "Póvoa de Varzim", text: "A impermeabilização do sofá foi perfeita. Agora sinto-me muito mais tranquilo com crianças em casa. Recomendo vivamente!", date: "2025-02-05" },
            { author: "João P.", city: "Vila Nova de Gaia", text: "Cheiro fresco e sensação incrível. A equipa é profissional, rápida e super cuidadosa. Recomendo!", date: "2025-01-12" },
            { author: "Pedro R.", city: "Maia", text: "Rapidez e qualidade ao mesmo nível. Em 3 horas o sofá estava limpo e seco. Impressionante!", date: "2025-03-30" },
          ]}
        />
      </main>
      <Footer />
    </>
  );
};

export default Impermeabilizacao;

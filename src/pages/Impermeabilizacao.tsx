import { CHAIR_WATERPROOF_ESSENTIAL, CHAIR_WATERPROOF_PREMIUM } from '../constants/chairPricing';
import { sofaPrices } from '@/components/quiz/QuizTypes';
import { formatEuro } from '@/data/enginePrices';
import ServiceProcessGuide from '@/components/ServiceProcessGuide';
import { Check, Droplet, FlaskConical } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import { getPillarPage } from "@/data/pillarPages";
import ServiceHero from "@/components/ServiceHero";
import ServiceExamplesGallery from "@/components/ServiceExamplesGallery";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceReviewsGrid from "@/components/ServiceReviewsGrid";
import SectionHeader from "@/components/SectionHeader";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";

const impermeabilizacaoGuarantee: GuaranteeItem[] = [
  {
    label: "Eficácia",
    title: "Aplicação com avaliação prévia",
    body: "Confirmamos a compatibilidade do tecido e explicamos os cuidados e o tempo de ativação da proteção.",
    image: "/images/service-promises/Impermeabilizacao-promise-1-800.webp",
  },
  {
    label: "Durabilidade",
    title: "Premium: até 10 anos e 5 lavagens",
    body: "A Essencial suporta até 2 lavagens. A Premium oferece garantia de até 10 anos e 5 lavagens, conforme os cuidados recomendados.",
    image: "/images/service-promises/Impermeabilizacao-promise-2-800.webp",
  },
  {
    label: "Segurança",
    title: "O toque do seu tecido",
    body: "Escolhemos uma proteção adequada ao revestimento e indicamos quando voltar a utilizar os estofos.",
    image: "/images/service-promises/Impermeabilizacao-promise-3-800.webp",
  },
];

const expertTips: ExpertTip[] = [
  {
    title: "Essencial ou Premium: como funciona a impermeabilização",
    summary: "A barreira invisível repele líquidos sem alterar o toque ou a aparência do tecido. A versão Premium, à base de diluente, é mais resistente ao desgaste e dura mais tempo do que a Essencial.",
    url: "/blog/impermeabilizacao-sofa-vale-pena",
  },
  {
    title: "Por que a impermeabilização é o melhor investimento para os seus estofos",
    summary: "Um sofá de 1.200€ protegido com impermeabilização dura muito mais tempo sem precisar de substituição. Perceba a poupança real ao escolher entre a Essencial e a Premium.",
    url: "/blog/higienizacao-vs-impermeabilizacao-sofa",
  },
  {
    title: "Impermeabilização é segura para crianças e animais?",
    summary: "Os produtos que utilizamos são certificados, não tóxicos e seguros após a secagem. Saiba exatamente o que está a aplicar na sua casa.",
    url: "/blog/limpeza-sofa-bebe-crianca",
  },
];

interface TierFeature {
  label: string;
}

interface WaterproofingTier {
  badge?: string;
  icon: typeof Droplet;
  name: string;
  base: string;
  sofaPrice: string;
  chairPrice: string;
  washes: string;
  durability: string;
  features: TierFeature[];
  highlighted?: boolean;
}

// "59€ / 79€ / 99€": os três tamanhos com preço, lidos da tabela do quiz. Estava
// escrito à mão e é a tabela que o cliente compara com o orçamento.
const sofaTierPrices = (field: 'waterproofingPrice' | 'waterproofingPremiumPrice') => sofaPrices
  .map(size => size[field])
  .filter((price): price is number => typeof price === 'number')
  .map(formatEuro)
  .join(' / ');

const waterproofingTiers: WaterproofingTier[] = [
  {
    icon: FlaskConical,
    name: "Premium",
    base: "À base de diluente",
    sofaPrice: sofaTierPrices('waterproofingPremiumPrice'),
    chairPrice: `${formatEuro(CHAIR_WATERPROOF_PREMIUM)}/un`,
    washes: "Aguenta até 5 lavagens",
    durability: "Até 10 anos de proteção real (salvo exceções)",
    badge: "Recomendado",
    highlighted: true,
    features: [
      { label: "Formulação mais resistente ao desgaste do que a Essencial" },
      { label: "Ideal para casas com crianças, animais ou uso intenso" },
      { label: "Aguenta mais do dobro das lavagens da Essencial" },
      { label: "Menos reaplicações ao longo dos anos, mais poupança a longo prazo" },
    ],
  },
  {
    icon: Droplet,
    name: "Essencial",
    base: "À base de água",
    sofaPrice: sofaTierPrices('waterproofingPrice'),
    chairPrice: `${formatEuro(CHAIR_WATERPROOF_ESSENTIAL)}/un`,
    washes: "Aguenta até 2 lavagens",
    durability: "Até 1 a 2 anos de proteção real, consoante o uso",
    features: [
      { label: "Proteção completa contra manchas de líquidos e gordura" },
      { label: "Sem alteração de cor, toque ou textura do tecido" },
      { label: "Combinável com o Pack Proteção Total (limpeza + impermeabilização)" },
      { label: "Boa opção para uso moderado e primeira proteção" },
    ],
  },
];

const WaterproofingTierComparison = () => (
  <section className="py-14 md:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <SectionHeader
        overline="Duas Versões"
        heading="Essencial ou"
        goldWord="Premium?"
        subtitle="A impermeabilização de sofás e cadeiras existe em duas versões. Preços fixos, sem letras pequenas: escolha a que faz mais sentido para a sua casa."
      />
      <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
        {waterproofingTiers.map((tier) => (
          <div
            key={tier.name}
            className="relative flex flex-col overflow-hidden"
            style={
              tier.highlighted
                ? { background: "#071a12", boxShadow: "0 12px 50px rgba(7,26,18,0.18)" }
                : { background: "#FDFDF9", border: "1px solid rgba(17,17,17,0.10)" }
            }
          >
            {tier.badge && (
              <span
                className="absolute top-5 right-5 text-sm font-bold tracking-[0.18em] uppercase px-2.5 py-1"
                style={{ background: "linear-gradient(90deg,#D4AF37,#EDD96A)", color: "#071a12" }}
              >
                {tier.badge}
              </span>
            )}
            <div
              className="p-7 md:p-8"
              style={{ borderTop: `2px solid ${tier.highlighted ? "#D4AF37" : "rgba(212,175,55,0.7)"}` }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <tier.icon className="w-4 h-4" style={{ color: "#D4AF37" }} strokeWidth={1.75} />
                <p className="text-sm font-bold tracking-[0.24em] uppercase" style={{ color: tier.highlighted ? "rgba(255,255,255,0.55)" : "rgba(17,17,17,0.50)" }}>
                  {tier.base}
                </p>
              </div>
              <h3
                className="type-card-title font-playfair    mb-5"
                style={{ color: tier.highlighted ? "#ffffff" : "#111111" }}
              >
                {tier.name}
              </h3>

              <div className="space-y-2.5 mb-6 pb-6" style={{ borderBottom: `1px solid ${tier.highlighted ? "rgba(255,255,255,0.10)" : "rgba(17,17,17,0.08)"}` }}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base" style={{ color: tier.highlighted ? "rgba(255,255,255,0.55)" : "rgba(17,17,17,0.55)" }}>Sofá 1L / 2L / 3L</span>
                  <span className="font-playfair font-bold text-base tabular-nums" style={{ color: tier.highlighted ? "#D4AF37" : "#111111" }}>{tier.sofaPrice}</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base" style={{ color: tier.highlighted ? "rgba(255,255,255,0.55)" : "rgba(17,17,17,0.55)" }}>Cadeiras</span>
                  <span className="font-playfair font-bold text-base tabular-nums text-right" style={{ color: tier.highlighted ? "#D4AF37" : "#111111" }}>{tier.chairPrice}</span>
                </div>
              </div>

              <p className="text-base font-semibold mb-1" style={{ color: tier.highlighted ? "#ffffff" : "#111111" }}>
                {tier.durability}
              </p>
              <p className="text-base mb-6" style={{ color: tier.highlighted ? "rgba(255,255,255,0.50)" : "rgba(17,17,17,0.50)" }}>
                {tier.washes}
              </p>

              <div className="flex flex-col gap-2.5">
                {tier.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} strokeWidth={2.5} />
                    <span className="text-base leading-snug" style={{ color: tier.highlighted ? "rgba(255,255,255,0.75)" : "rgba(17,17,17,0.70)" }}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-base mt-8" style={{ color: "rgba(17,17,17,0.45)" }}>
        Colchões continuam a ter apenas higienização, sem opção de impermeabilização. O Pack Proteção Total está sempre associado à versão Essencial.
      </p>
    </div>
  </section>
);

// Título, h1, FAQs e schema vêm de src/data/pillarPages.ts, a mesma fonte do
// PageHead e do HTML estático (scripts/prerender.ts).
const pillar = getPillarPage('/impermeabilizacao');

const Impermeabilizacao = () => {
  return (
    <>
      <Header />
      <main>
        <ServiceHero
          title={pillar.h1}
          serviceSlug="impermeabilizacao"
        />
        <ServicePriceSection serviceSlug="impermeabilizacao" />
        <WaterproofingTierComparison />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug="impermeabilizacao" seed="impermeabilizacao" heading="" />
          </div>
        </section>

        <ServiceExamplesGallery serviceSlug="impermeabilizacao" />
        <ServiceProcessGuide serviceSlug="impermeabilizacao" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada impermeabilização"
          items={impermeabilizacaoGuarantee}
          variant="dark"
        />
        <ServiceFAQ faqs={pillar.faqs} heading="Perguntas Frequentes" variant="light" />
        <ServiceExpertTips tips={expertTips} variant="dark" />
        <ServiceCityLinks serviceSlug="impermeabilizacao" serviceLabel={pillar.serviceName} />
        <ServiceSchema
          serviceName={pillar.serviceName}
          description={pillar.description}
          url={pillar.path}
          priceFrom={pillar.priceFrom}
          breadcrumbLabel={pillar.breadcrumbLabel}
        />
      </main>
      <Footer />
    </>
  );
};

export default Impermeabilizacao;

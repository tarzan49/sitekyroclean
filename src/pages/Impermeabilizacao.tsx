import impermeabilizacaoAntes from "@/assets/galeria-impermeabilizacao-antes.webp";
import impermeabilizacaoDepois from "@/assets/galeria-impermeabilizacao-depois.webp";
import impermeabilizacaoResultado from "@/assets/galeria-impermeabilizacao-resultado.webp";
import impermeabilizacaoProcesso from "@/assets/galeria-impermeabilizacao-processo.webp";
import { Check, Droplet, FlaskConical } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServicePriceSection from "@/components/ServicePriceSection";
import SectionHeader from "@/components/SectionHeader";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";

const impermeabilizacaoGuarantee: GuaranteeItem[] = [
  {
    label: "Eficácia",
    title: "Proteção testada, comprovada",
    body: "Cada aplicação é verificada com teste de repelência no final do processo. Só saímos quando a barreira está ativa e uniforme em toda a superfície tratada.",
    image: "/images/impermeabilizacao/v5.webp",
  },
  {
    label: "Durabilidade",
    title: "Até 10 anos com a versão Premium",
    body: "Temos duas versões: a Essencial (à base de água), que aguenta até 2 lavagens, e a Premium (à base de diluente), mais resistente ao desgaste, que aguenta até 5 lavagens e mantém a proteção por até 10 anos.",
    image: "/images/impermeabilizacao/v2.webp",
  },
  {
    label: "Segurança",
    title: "Sem alteração visível nem tátil",
    body: "O produto seca sem resíduos, sem alterar a cor, o toque nem o aspeto do tecido. Crianças e animais podem regressar ao espaço imediatamente após a secagem.",
    image: "/images/impermeabilizacao/v3.webp",
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

const waterproofingTiers: WaterproofingTier[] = [
  {
    icon: FlaskConical,
    name: "Premium",
    base: "À base de diluente",
    sofaPrice: "89€ / 109€ / 139€",
    chairPrice: "20€/un (1-4) · 15€/un (5-9)",
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
    sofaPrice: "59€ / 79€ / 99€",
    chairPrice: "15€/un (1-4) · 10€/un (5-9)",
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
                className="absolute top-5 right-5 text-[9px] font-bold tracking-[0.18em] uppercase px-2.5 py-1"
                style={{ background: "linear-gradient(90deg,#B8912A,#EDD96A)", color: "#071a12" }}
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
                <p className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: tier.highlighted ? "rgba(255,255,255,0.55)" : "rgba(17,17,17,0.50)" }}>
                  {tier.base}
                </p>
              </div>
              <h3
                className="font-playfair text-2xl md:text-[1.75rem] font-bold mb-5"
                style={{ color: tier.highlighted ? "#ffffff" : "#111111" }}
              >
                {tier.name}
              </h3>

              <div className="space-y-2.5 mb-6 pb-6" style={{ borderBottom: `1px solid ${tier.highlighted ? "rgba(255,255,255,0.10)" : "rgba(17,17,17,0.08)"}` }}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px]" style={{ color: tier.highlighted ? "rgba(255,255,255,0.55)" : "rgba(17,17,17,0.55)" }}>Sofá 1L / 2L / 3L</span>
                  <span className="font-playfair font-bold text-sm tabular-nums" style={{ color: tier.highlighted ? "#D4AF37" : "#111111" }}>{tier.sofaPrice}</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px]" style={{ color: tier.highlighted ? "rgba(255,255,255,0.55)" : "rgba(17,17,17,0.55)" }}>Cadeiras</span>
                  <span className="font-playfair font-bold text-sm tabular-nums text-right" style={{ color: tier.highlighted ? "#D4AF37" : "#111111" }}>{tier.chairPrice}</span>
                </div>
              </div>

              <p className="text-sm font-semibold mb-1" style={{ color: tier.highlighted ? "#ffffff" : "#111111" }}>
                {tier.durability}
              </p>
              <p className="text-[13px] mb-6" style={{ color: tier.highlighted ? "rgba(255,255,255,0.50)" : "rgba(17,17,17,0.50)" }}>
                {tier.washes}
              </p>

              <div className="flex flex-col gap-2.5">
                {tier.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#D4AF37" }} strokeWidth={2.5} />
                    <span className="text-[13px] leading-snug" style={{ color: tier.highlighted ? "rgba(255,255,255,0.75)" : "rgba(17,17,17,0.70)" }}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[13px] mt-8" style={{ color: "rgba(17,17,17,0.45)" }}>
        Colchões continuam a ter apenas higienização, sem opção de impermeabilização. O Pack Proteção Total está sempre associado à versão Essencial.
      </p>
    </div>
  </section>
);

const Impermeabilizacao = () => {
  const faqs = [
    { question: 'O que é exatamente a impermeabilização e como funciona?', answer: 'A impermeabilização cria uma camada de proteção invisível e respirável à volta das fibras do tecido. Líquidos e sujidade deixam de ser absorvidos com facilidade, formando gotas à superfície que podem ser limpas rapidamente antes de penetrarem no estofo.' },
    { question: 'Qual a diferença entre a Essencial e a Premium?', answer: 'A Essencial é à base de água, aguenta até 2 lavagens e mantém a proteção real por 1 a 2 anos, consoante o uso. A Premium é à base de diluente, mais resistente ao desgaste, aguenta até 5 lavagens e dura até 10 anos. Para casas com crianças, animais ou uso intenso, a Premium compensa a longo prazo.' },
    { question: 'Quanto tempo dura a impermeabilização?', answer: 'Depende da versão escolhida. Com a Essencial, a proteção real dura 1 a 2 anos, consoante o uso. Com a Premium, mais resistente ao desgaste, a proteção dura até 10 anos. Para manter o efeito repelente visível no dia a dia, podem ser recomendadas reaplicações localizadas ou manutenções preventivas, sobretudo em zonas de maior uso.' },
    { question: 'A impermeabilização é definitiva?', answer: 'O tratamento não cria uma película rígida nem permanente. A proteção mantém-se ativa durante o período correspondente à versão aplicada, mas o seu desempenho pode ser reforçado com manutenção adequada.' },
    { question: 'A impermeabilização precisa de manutenção?', answer: 'Sim. A manutenção preventiva permite preservar o nível máximo de proteção e prolongar a vida útil dos estofos. Recomendamos avaliações periódicas, especialmente em contextos de uso intensivo.' },
    { question: 'A impermeabilização altera a cor, o toque ou o conforto do tecido?', answer: 'Não. O tecido mantém o mesmo aspeto e toque natural em ambas as versões. O tratamento é hidrorrepelente e respirável, não criando película rígida. O que muda é a forma como reage a líquidos: em vez de serem rapidamente absorvidos, formam pequenas gotas à superfície, facilitando a limpeza imediata.' },
  ];

  return (
    <>
      <Header />
      <main>
        <ServiceHero
          title="Impermeabilização Profissional de Estofos"
          subtitle="Proteção invisível que cria uma barreira contra líquidos e manchas, preservando o tecido sem alterar o toque ou a aparência."
          serviceSlug="impermeabilizacao"
        />
        <ServicePriceSection serviceSlug="impermeabilizacao" />
        <WaterproofingTierComparison />
        <ServiceAutoCarousel
          overline="A Barreira Invisível"
          beforeImage={impermeabilizacaoAntes}
          afterImage={impermeabilizacaoDepois}
          slides={[
            { src: impermeabilizacaoResultado, label: "Pormenor" },
            { src: impermeabilizacaoProcesso, label: "Impermeável" },
          ]}
          variant="dark"
        />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada impermeabilização"
          items={impermeabilizacaoGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="impermeabilizacao" serviceLabel="Impermeabilização de Estofos" />
        <ServiceSchema
          serviceName="Impermeabilização de Estofos"
          description="Impermeabilização profissional de sofás e cadeiras no Porto. Versão Essencial e versão Premium, com proteção real até 10 anos."
          url="/impermeabilizacao"
          priceFrom="59€"
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

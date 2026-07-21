import impermeabilizacaoAntes from "@/assets/galeria-impermeabilizacao-antes.webp";
import impermeabilizacaoDepois from "@/assets/galeria-impermeabilizacao-depois.webp";
import impermeabilizacaoResultado from "@/assets/galeria-impermeabilizacao-resultado.webp";
import impermeabilizacaoProcesso from "@/assets/galeria-impermeabilizacao-processo.webp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";

const impermeabilizacaoGuarantee: GuaranteeItem[] = [
  {
    label: "Eficácia",
    title: "Proteção testada, comprovada",
    body: "Cada aplicação é verificada com teste de repelência no final do processo. Só saímos quando a barreira está ativa e uniforme em toda a superfície tratada.",
    image: "/images/impermeabilizacao/v5.png",
  },
  {
    label: "Durabilidade",
    title: "Válida por até 10 anos",
    body: "A barreira impermeável mantém-se ativa durante anos em condições normais de uso. A longevidade depende do tipo de tecido e da frequência de limpeza.",
    image: "/images/impermeabilizacao/v2.png",
  },
  {
    label: "Segurança",
    title: "Sem alteração visível nem tátil",
    body: "O produto seca sem resíduos, sem alterar a cor, o toque nem o aspeto do tecido. Crianças e animais podem regressar ao espaço imediatamente após a secagem.",
    image: "/images/impermeabilizacao/v3.png",
  },
];

const expertTips: ExpertTip[] = [
  {
    title: "10 anos de proteção: como funciona a impermeabilização",
    summary: "A tecnologia de nano-partículas cria uma barreira molecular invisível que repele líquidos sem alterar o toque ou a aparência do tecido.",
    url: "/blog/impermeabilizacao-sofa-vale-pena",
  },
  {
    title: "Por que a impermeabilização é o melhor investimento para os seus estofos",
    summary: "Um sofá de 1.200€ protegido com impermeabilização dura em média o dobro do tempo. Calcule a poupança real ao longo de 10 anos.",
    url: "/blog/higienizacao-vs-impermeabilizacao-sofa",
  },
  {
    title: "Impermeabilização vs. limpeza: qual fazer primeiro?",
    summary: "Aplicar impermeabilização sobre tecido sujo é um erro comum que reduz a eficácia a zero. Descubra a ordem correta do processo completo.",
    url: "/blog/impermeabilizacao-tapete-guia",
  },
  {
    title: "Impermeabilização é segura para crianças e animais?",
    summary: "Os produtos que utilizamos são certificados, não tóxicos e seguros após a secagem. Saiba exatamente o que está a aplicar na sua casa.",
    url: "/blog/limpeza-sofa-bebe-crianca",
  },
];

const Impermeabilizacao = () => {
  const faqs = [
    { question: 'O que é exatamente a impermeabilização e como funciona?', answer: 'A impermeabilização cria uma camada de proteção invisível e respirável à volta das fibras do tecido. Líquidos e sujidade deixam de ser absorvidos com facilidade, formando gotas à superfície que podem ser limpas rapidamente antes de penetrarem no estofo.' },
    { question: 'Quanto tempo dura a impermeabilização?', answer: 'O tratamento possui durabilidade técnica até 10 anos, desde que o tecido não seja sujeito a desgaste extremo. Para manter o efeito repelente visível no dia a dia, podem ser recomendadas reaplicações localizadas ou manutenções preventivas, sobretudo em zonas de maior uso.' },
    { question: 'A impermeabilização é definitiva?', answer: 'O tratamento não cria uma película rígida nem permanente. A proteção mantém-se ativa ao longo dos anos, mas o seu desempenho pode ser reforçado com manutenção adequada.' },
    { question: 'A impermeabilização precisa de manutenção?', answer: 'Sim. A manutenção preventiva permite preservar o nível máximo de proteção e prolongar a vida útil dos estofos. Recomendamos avaliações periódicas, especialmente em contextos de uso intensivo.' },
    { question: 'A impermeabilização altera a cor, o toque ou o conforto do tecido?', answer: 'Não. O tecido mantém o mesmo aspeto e toque natural. O tratamento é hidrorrepelente e respirável, não criando película rígida. O que muda é a forma como reage a líquidos: em vez de serem rapidamente absorvidos, formam pequenas gotas à superfície, facilitando a limpeza imediata.' },
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
          description="Impermeabilização profissional de sofás, tapetes e cadeiras no Porto. Proteção até 10 anos."
          url="/impermeabilizacao"
          priceFrom="69€"
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

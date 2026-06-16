import { Shield, Heart, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServiceBenefitsBar, { BenefitItem } from "@/components/ServiceBenefitsBar";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";
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

const cadeirasGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Cadeiras como novas ou voltamos",
    body: "Se o resultado não for evidente em cada peça, repetimos sem custos adicionais. Sem limitações de tecido nem de quantidade de cadeiras tratadas.",
  },
  {
    label: "Precisão",
    title: "Cada costura, cada dobra",
    body: "Cadeiras acumulam gordura e sujidade em zonas de difícil acesso. Tratamos cada detalhe com bicos específicos para garantir higiene em toda a peça.",
  },
  {
    label: "Tecido",
    title: "Veludo, couro, linho: todos seguros",
    body: "Cada material tem o seu protocolo próprio. Nunca aplicamos um produto genérico quando o tecido exige uma abordagem especializada e cuidadosa.",
  },
];

const expertTips: ExpertTip[] = [
  {
    title: "Como limpar cadeiras de jantar sem danificar o tecido",
    summary: "As cadeiras de jantar acumulam gordura, restos de comida e bactérias invisíveis. Saiba o método correto que preserva a fibra e elimina os riscos à saúde.",
    url: "/blog/limpeza-cadeiras-estofadas-precos-guia",
  },
  {
    title: "O segredo para manter cadeiras de estofo como novas",
    summary: "A sujidade invisível degrada o tecido antes de ser visível. Descubra a rotina simples de manutenção que prolonga a vida das suas cadeiras em anos.",
    url: "/blog/como-manter-sofa-limpo-entre-limpezas",
  },
  {
    title: "Quantas bactérias existem realmente nas suas cadeiras?",
    summary: "Cadeiras de escritório e de jantar são um dos objetos mais contaminados da casa. Os números vão surpreendê-lo, e motivá-lo a agir.",
    url: "/blog/doencas-causadas-estofos-sujos",
  },
  {
    title: "Veludo, couro, linho: qual é a sua cadeira mais difícil de limpar?",
    summary: "Cada tecido tem vulnerabilidades diferentes. Usar o produto errado pode causar desbotamento ou deformação permanente do tecido.",
    url: "/blog/como-limpar-sofa-veludo",
  },
];

const LimpezaCadeiras = () => {
  const faqs = [
    { question: 'A limpeza de cadeiras é recomendada só quando estão muito manchadas?', answer: 'Não. Quanto mais cedo se intervém, melhores são os resultados e maior é a durabilidade do tecido. A limpeza regular evita acumulação de nódoas, cheiros e gordura corporal, mantendo o aspeto "como novo" por muito mais tempo.' },
    { question: 'É seguro limpar cadeiras de tecido mais delicado (veludo, linho, etc.)?', answer: 'Sim. Antes de iniciar, avaliamos sempre o tipo de tecido e escolhemos produtos adequados. Em materiais mais delicados, ajustamos a pressão, a quantidade de água e os movimentos para garantir segurança máxima.' },
    { question: 'Quanto tempo as cadeiras ficam fora de uso após a limpeza?', answer: 'Normalmente entre 3 e 6 horas, consoante o tecido e a ventilação do espaço. Quando terminamos o serviço, deixamos sempre orientações simples para acelerar a secagem (circular ar, abrir janelas, evitar sentar até estar seco).' },
  ];

  return (
    <QuizServiceProvider value="chairs">
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        <ServiceHero
          title="Higienização Profissional de Cadeiras"
          subtitle="Limpeza profissional que elimina sujidade do uso diário, ajudando a prolongar a vida do tecido e a manter a higiene do espaço."
          serviceSlug="limpeza-cadeiras"
        />
        <ServiceBenefitsBar
          overline="Cada Detalhe Importa"
          heading="Por que a limpeza profissional de cadeiras transforma o seu espaço"
          benefits={cadeirasBenefits}
          variant="light"
        />
        <ServiceAutoCarousel
          overline="Do Uso ao Novo"
          beforeImage={cadeiraAntes}
          afterImage={cadeiraDepois}
          slides={[
            { src: cadeiraResultado, label: "Pormenor" },
            { src: cadeiraProcesso, label: "Extração Profissional", mirror: true },
          ]}
          variant="dark"
        />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de cadeiras"
          items={cadeirasGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-cadeiras" serviceLabel="Limpeza de Cadeiras" />
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
    </QuizServiceProvider>
  );
};

export default LimpezaCadeiras;

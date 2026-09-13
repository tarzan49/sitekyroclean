import ServiceProcessGuide from '@/components/ServiceProcessGuide';
import { SATISFACTION_PROMISE } from '../constants/commercialPolicy';
import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceExamplesGallery from "@/components/ServiceExamplesGallery";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";
import tapeteDepois from "@/assets/galeria-tapete-depois.webp";

const tapetesGuarantee: GuaranteeItem[] = [
  {
    label: "Manchas",
    title: "Repetimos se for necessário",
    body: SATISFACTION_PROMISE,
    image: "/images/service-promises/LimpezaTapetes-800.webp",
  },
  {
    label: "Fibras",
    title: "Respeito pelas fibras",
    body: "Avaliamos a composição, a base e as cores para escolher um método compatível com o tapete.",
    image: "/images/tapetes/v2.webp",
  },
  {
    label: "Odores",
    title: "Odores avaliados na origem",
    body: "Adaptamos o tratamento à origem e à profundidade do odor. Explicamos os limites antes de começar.",
    image: tapeteDepois,
  },
];

const expertTips: ExpertTip[] = [
  {
    title: "Como remover manchas de tapete sem estragar a fibra",
    summary: "O erro mais comum é esfregar a mancha, o que expande a área afetada. Descubra a técnica de absorção correta que os profissionais usam.",
    url: "/blog/limpeza-tapetes-profissional-guia-completo",
  },
  {
    title: "Por que os tapetes são o maior reservatório de bactérias em casa",
    summary: "Um tapete pode conter até 4.000 vezes mais bactérias do que a tampa da sanita. Saiba a frequência ideal de higienização profissional.",
    url: "/blog/doencas-causadas-estofos-sujos",
  },
  {
    title: "Como eliminar odores de animais de estimação do tapete",
    summary: "O cheiro pode estar associado a resíduos acumulados nas fibras. Conheça os cuidados de limpeza adequados ao artigo.",
    url: "/blog/limpeza-sofa-animais-domesticos",
  },
  {
    title: "Quando deve limpar o tapete profissionalmente?",
    summary: "Zonas de passagem intensa acumulam sujidade invisível em apenas 3 meses. Veja os sinais que indicam que está na hora de agir.",
    url: "/blog/sinais-sofa-precisa-limpeza-profissional",
  },
];

const LimpezaTapetes = () => {
  const faqs = [
    { question: 'A limpeza profunda remove mesmo cheiros e manchas antigas?', answer: 'Conseguimos reduzir significativamente cheiros a humidade, animais e uso diário, e remover a grande maioria das manchas. Em alguns casos muito antigos ou já oxidado o tecido pode não voltar a 100%, mas explicamos sempre o cenário realista antes de avançar.' },
    { question: 'A carpete precisa de ser retirada de casa para ser limpa?', answer: 'Na maioria dos casos, não. Fazemos a limpeza diretamente no local, com equipamento profissional de extração. Assim evitam-se deslocações, tempo de espera e riscos de danos no transporte.' },
    { question: 'De quanto em quanto tempo devo limpar a carpete/tapete?', answer: 'Para uso doméstico, recomendamos uma limpeza profunda a cada 12 meses. Em casas com crianças, animais ou alergias, o ideal é a cada 6 a 9 meses. Em empresas, hotéis ou restaurantes, a frequência deve ser ajustada ao nível de tráfego (trimestral, semestral ou anual).' },
  ];

  return (
    <QuizServiceProvider value="carpet">
    <>
      <Header />
      <main>
        <ServiceHero
          title="Higienização Profissional de Tapetes"
          serviceSlug="limpeza-tapetes"
        />
        <ServicePriceSection serviceSlug="limpeza-tapetes" />
        <ServiceExamplesGallery serviceSlug="limpeza-tapetes" />
        <ServiceProcessGuide serviceSlug="limpeza-tapetes" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de tapete"
          items={tapetesGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-tapetes" serviceLabel="Limpeza de Tapetes" />
        <ServiceSchema
          serviceName="Limpeza de Tapetes"
          description="Lavagem e limpeza profissional de tapetes no Porto. Remoção de manchas e odores."
          url="/limpeza-tapetes"
          priceFrom="Sob orçamento"
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaTapetes;

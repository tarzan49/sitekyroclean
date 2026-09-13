import { SATISFACTION_PROMISE } from '../constants/commercialPolicy';
import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import { DEFAULT_PRICE_FROM } from "@/data/locationSeoData";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceExamplesGallery from "@/components/ServiceExamplesGallery";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";

const sofaGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Repetimos se for necessário",
    body: SATISFACTION_PROMISE,
    image: "/images/service-promises/LimpezaSofas-promise-1-800.webp",
  },
  {
    label: "Cuidado",
    title: "Cuidado adaptado ao tecido",
    body: "Avaliamos o revestimento e ajustamos os produtos, a escova e a pressão ao seu sofá.",
    image: "/images/service-promises/LimpezaSofas-promise-2-800.webp",
  },
  {
    label: "Rapidez",
    title: "Secagem média de 3 a 6 horas",
    body: "A extração reduz a humidade. O tempo de secagem depende do tecido, da ventilação e das condições do espaço.",
    image: "/images/service-promises/LimpezaSofas-promise-3-800.webp",
  },
];

const expertTips: ExpertTip[] = [
  {
    title: "Como remover manchas de vinho em 30 segundos",
    summary: "A maioria das tentativas caseiras piora a mancha permanentemente. Descubra a técnica correta antes de estragar o tecido.",
    url: "/blog/como-tirar-manchas-sofa-tecido",
  },
  {
    title: "O perigo invisível dos ácaros no seu sofá",
    summary: "Um sofá adulto pode conter até 10 milhões de ácaros. Conheça o impacto real na qualidade do ar que a sua família respira.",
    url: "/blog/acaros-sofas-colchoes-riscos-saude",
  },
  {
    title: "Posso usar vapor para limpar o sofá em casa?",
    summary: "O vapor pode danificar tecidos sensíveis se não for usado corretamente. Saiba quando é, e quando não é, seguro aplicar.",
    url: "/blog/o-que-e-extracao-a-vapor-estofos",
  },
  {
    title: "Com que frequência devo limpar o sofá profissionalmente?",
    summary: "Especialistas recomendam limpeza anual para famílias com crianças ou animais, e bianual nos restantes casos.",
    url: "/blog/com-que-frequencia-limpar-sofa",
  },
];

const LimpezaSofas = () => {
  const faqs = [
    { question: 'Quanto tempo demora a limpeza de um sofá?', answer: 'A duração depende do tamanho e do estado do sofá, mas, em média, varia entre 45 minutos e 2 horas. Trabalhamos com máquinas de extração profissional, por isso o processo é rápido, mas sem nunca comprometer o detalhe em cada zona do estofos.' },
    { question: 'O sofá fica muito molhado? Quanto tempo leva a secar?', answer: 'Não. Usamos extração profunda com forte capacidade de sucção, o que retira a maior parte da água usada na limpeza. Em condições normais de ventilação, o sofá fica seco entre 3 a 6 horas. Em dias mais húmidos pode demorar um pouco mais, mas nunca deixamos o tecido encharcado.' },
    { question: 'A limpeza pode danificar o tecido ou desbotar a cor?', answer: 'Pelo contrário: os produtos que utilizamos são específicos para estofos, com pH equilibrado e adequados a cada tipo de tecido. Fazemos sempre uma avaliação prévia e, se necessário, teste numa zona pouco visível. O objetivo é recuperar a cor e a textura original, sem danificar fibras.' },
  ];

  return (
    <QuizServiceProvider value="sofa">
    <>
      <Header />
      <main>
        <ServiceHero
          title="Higienização Profissional de Sofás"
          serviceSlug="limpeza-sofas"
        />
        <ServicePriceSection serviceSlug="limpeza-sofas" />
        <ServiceExamplesGallery serviceSlug="limpeza-sofas" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de sofá"
          items={sofaGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-sofas" serviceLabel="Limpeza de Sofás" />
        <ServiceSchema
          serviceName="Limpeza de Sofás"
          description="Limpeza e lavagem profissional de sofás ao domicílio no Porto. Remoção de manchas, ácaros e odores."
          url="/limpeza-sofas"
          priceFrom={DEFAULT_PRICE_FROM}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaSofas;

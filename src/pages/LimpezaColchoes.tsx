import ServiceProcessGuide from '@/components/ServiceProcessGuide';
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
import colchaoResultado from "@/assets/galeria-colchao-resultado.webp";

const colchoesGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Repetimos se for necessário",
    body: SATISFACTION_PROMISE,
    image: "/images/service-promises/LimpezaColchoes-800.webp",
  },
  {
    label: "Higiene",
    title: "Extras à sua escolha",
    body: "Anti-ácaros e desbacterização são tratamentos opcionais, apresentados separadamente da limpeza.",
    image: "/images/colchoes/v5.webp",
  },
  {
    label: "Segurança",
    title: "Utilize depois de secar",
    body: "A secagem demora, em média, 3 a 6 horas com ventilação. Confirmamos os cuidados antes de terminar.",
    image: colchaoResultado,
  },
];

const expertTips: ExpertTip[] = [
  {
    title: "O perigo invisível dos ácaros no seu colchão",
    summary: "O colchão acumula ácaros, células mortas e bactérias ao longo dos anos. Descubra o impacto real na qualidade do sono da sua família.",
    url: "/blog/acaros-sofas-colchoes-riscos-saude",
  },
  {
    title: "Como a higienização melhora a qualidade do sono",
    summary: "Estudos mostram que dormir num colchão higienizado pode reduzir sintomas de alergias em até 80% após apenas uma semana.",
    url: "/blog/quanto-custa-limpar-colchao-profissional",
  },
  {
    title: "Quanto tempo demora o colchão a secar?",
    summary: "Com equipamento de extração profissional, o colchão fica seco em 3 a 6 horas. Saiba como acelerar ainda mais o processo.",
    url: "/blog/limpeza-colchao-bebe-crianca",
  },
  {
    title: "Como tirar manchas de urina do colchão",
    summary: "Manchas frescas, secas ou antigas: veja o passo a passo para remover a mancha e o odor de urina do colchão em casa.",
    url: "/blog/como-tirar-manchas-urina-colchao",
  },
];

const LimpezaColchoes = () => {
  const faqs = [
    { question: 'Para que serve a limpeza de colchões se uso sempre lençóis?', answer: 'A limpeza remove sujidade e resíduos das fibras. Anti-ácaros e desbacterização são extras opcionais, com objetivos e preços distintos. Não prometemos eliminação total nem melhoria de sintomas.' },
    { question: 'A limpeza elimina totalmente ácaros e bactérias?', answer: 'A limpeza remove sujidade e resíduos das fibras. Anti-ácaros e desbacterização são extras opcionais, com objetivos e preços distintos. Não prometemos eliminação total nem melhoria de sintomas.' },
    { question: 'Com que frequência devo limpar o colchão?', answer: 'Para uso doméstico, recomendamos uma limpeza profunda a cada 12 a 18 meses. Em casos de alergias, problemas respiratórios, crianças pequenas ou colchões muito utilizados (AL, hotéis), o ideal é encurtar o intervalo para 6 a 12 meses.' },
  ];

  return (
    <QuizServiceProvider value="mattress">
    <>
      <Header />
      <main>
        <ServiceHero
          title="Higienização Profissional de Colchões"
          serviceSlug="limpeza-colchoes"
        />

        <ServicePriceSection serviceSlug="limpeza-colchoes" />

        <ServiceExamplesGallery serviceSlug="limpeza-colchoes" />
        <ServiceProcessGuide serviceSlug="limpeza-colchoes" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada higienização de colchão"
          items={colchoesGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-colchoes" serviceLabel="Limpeza de Colchões" />
        <ServiceSchema
          serviceName="Limpeza de Colchões"
          description="Higienização profissional de colchões no Porto. Limpeza de sujidade e resíduos. Anti-ácaros e desbacterização opcionais."
          url="/limpeza-colchoes"
          priceFrom={DEFAULT_PRICE_FROM}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaColchoes;

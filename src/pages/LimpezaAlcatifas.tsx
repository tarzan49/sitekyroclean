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
import alcatifaProcesso from "@/assets/galeria-alcatifa-processo.webp";

const alcatifasGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Repetimos se for necessário",
    body: SATISFACTION_PROMISE,
    image: "/images/service-promises/LimpezaAlcatifas-promise-1-800.webp",
  },
  {
    label: "Cobertura",
    title: "Cuidado em toda a área",
    body: "Avaliamos as zonas de passagem e os pormenores para ajustar a limpeza ao estado da alcatifa.",
    image: "/images/service-promises/LimpezaAlcatifas-promise-2-800.webp",
  },
  {
    label: "Secagem",
    title: "Secagem média de 3 a 6 horas",
    body: "Controlamos a humidade e reforçamos a extração. A utilização depende da secagem e da ventilação.",
    image: "/images/service-promises/LimpezaAlcatifas-promise-3-800.webp",
  },
];

const expertTips: ExpertTip[] = [
  {
    title: "O guia completo de manutenção de alcatifas",
    summary: "Alcatifas em boas condições podem durar 15 a 20 anos. Saiba as rotinas de manutenção que fazem toda a diferença entre renovar e substituir.",
    url: "/blog/limpeza-alcatifa-escritorio",
  },
  {
    title: "Por que as alcatifas são o maior reservatório de bactérias em casa",
    summary: "A superfície densa das alcatifas retém até 10 vezes mais partículas do que o pavimento liso. Descubra o impacto real na saúde respiratória.",
    url: "/blog/doencas-causadas-estofos-sujos",
  },
  {
    title: "Como responder a um derrame imediatamente",
    summary: "Os primeiros 60 segundos após um derrame são decisivos. Aprenda a técnica de contenção que evita manchas permanentes nas suas alcatifas.",
    url: "/blog/mitos-limpeza-estofos",
  },
  {
    title: "Como identificar o tipo de fibra da sua alcatifa",
    summary: "Nylon, lã, poliéster: cada fibra requer um produto e uma técnica diferente. Usar o produto errado pode destruir a alcatifa em segundos.",
    url: "/blog/limpeza-tapetes-profissional-guia-completo",
  },
];

const LimpezaAlcatifas = () => {
  const faqs = [
    { question: 'A limpeza profunda substitui a aspiração do dia a dia?', answer: 'Não. A aspiração regular é essencial para remover o pó superficial. A nossa limpeza profunda atua onde o aspirador não chega: fibras internas, manchas entranhadas, resíduos de sujidade e gordura acumulada.' },
    { question: 'A alcatifa pode encolher, ondular ou descolar com a limpeza?', answer: 'Usamos equipamentos adequados para alcatifas fixas, com controlo de humidade e extração forte, evitando excesso de água. Em condições normais, a alcatifa não encolhe nem ondula. Se houver alguma fragilidade estrutural prévia, sinalizamos antes.' },
    { question: 'A limpeza ajuda mesmo em casos de alergias e má qualidade do ar?', answer: 'Sim. As alcatifas funcionam como "filtros" que retêm pó, ácaros e partículas. Quando não são limpas, tudo isso volta ao ar a cada passo. A limpeza profunda reduz estes agentes, contribuindo para um ambiente mais saudável, especialmente em casas com crianças, idosos ou pessoas alérgicas.' },
  ];

  return (
    <QuizServiceProvider value="carpet">
    <>
      <Header />
      <main>
        <ServiceHero
          title="Higienização Profissional de Alcatifas"
          serviceSlug="limpeza-alcatifas"
        />
        <ServicePriceSection serviceSlug="limpeza-alcatifas" />
        <ServiceExamplesGallery serviceSlug="limpeza-alcatifas" />
        <ServiceProcessGuide serviceSlug="limpeza-alcatifas" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de alcatifa"
          items={alcatifasGuarantee}
          variant="dark"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="light" />
        <ServiceExpertTips tips={expertTips} variant="dark" />
        <ServiceCityLinks serviceSlug="limpeza-alcatifas" serviceLabel="Limpeza de Alcatifas" />
        <ServiceSchema
          serviceName="Limpeza de Alcatifas"
          description="Limpeza profissional de alcatifas no Porto. Remoção de sujidade profunda."
          url="/limpeza-alcatifas"
          priceFrom="Sob orçamento"
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaAlcatifas;

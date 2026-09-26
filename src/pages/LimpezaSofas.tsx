import { SATISFACTION_PROMISE } from '../constants/commercialPolicy';
import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
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
import SofaProcessGuide from "@/components/SofaProcessGuide";
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

// Título, h1, FAQs e schema vêm de src/data/pillarPages.ts, a mesma fonte do
// PageHead e do HTML estático (scripts/prerender.ts).
const pillar = getPillarPage('/limpeza-sofas');

const LimpezaSofas = () => {
  return (
    <QuizServiceProvider value="sofa">
    <>
      <Header />
      <main>
        <ServiceHero
          title={pillar.h1}
          serviceSlug="limpeza-sofas"
        />
        <ServicePriceSection serviceSlug="limpeza-sofas" />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug="limpeza-sofas" seed="limpeza-sofas" heading="" />
          </div>
        </section>

        <ServiceExamplesGallery serviceSlug="limpeza-sofas" />
        <SofaProcessGuide />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de sofá"
          items={sofaGuarantee}
          variant="dark"
        />
        <ServiceFAQ faqs={pillar.faqs} heading="Perguntas Frequentes" variant="light" />
        <ServiceExpertTips tips={expertTips} variant="dark" />
        <ServiceCityLinks serviceSlug="limpeza-sofas" serviceLabel={pillar.serviceName} />
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
    </QuizServiceProvider>
  );
};

export default LimpezaSofas;

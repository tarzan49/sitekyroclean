import ServiceProcessGuide from '@/components/ServiceProcessGuide';
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

// Título, h1, FAQs e schema vêm de src/data/pillarPages.ts, a mesma fonte do
// PageHead e do HTML estático (scripts/prerender.ts).
const pillar = getPillarPage('/limpeza-alcatifas');

const LimpezaAlcatifas = () => {
  return (
    <QuizServiceProvider value="carpet">
    <>
      <Header />
      <main>
        <ServiceHero
          title={pillar.h1}
          serviceSlug="limpeza-alcatifas"
        />
        <ServicePriceSection serviceSlug="limpeza-alcatifas" />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug="limpeza-alcatifas" seed="limpeza-alcatifas" heading="" />
          </div>
        </section>

        <ServiceExamplesGallery serviceSlug="limpeza-alcatifas" />
        <ServiceProcessGuide serviceSlug="limpeza-alcatifas" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de alcatifa"
          items={alcatifasGuarantee}
          variant="dark"
        />
        <ServiceFAQ faqs={pillar.faqs} heading="Perguntas Frequentes" variant="light" />
        <ServiceExpertTips tips={expertTips} variant="dark" />
        <ServiceCityLinks serviceSlug="limpeza-alcatifas" serviceLabel={pillar.serviceName} />
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

export default LimpezaAlcatifas;

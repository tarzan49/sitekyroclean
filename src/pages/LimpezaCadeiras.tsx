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
import cadeiraProcesso from "@/assets/galeria-cadeira-processo.webp";

const cadeirasGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Repetimos se for necessário",
    body: SATISFACTION_PROMISE,
    image: "/images/service-promises/LimpezaCadeiras-promise-1-800.webp",
  },
  {
    label: "Precisão",
    title: "Atenção aos pormenores",
    body: "Tratamos assentos, encostos e costuras com os acessórios adequados a cada peça.",
    image: "/images/service-promises/LimpezaCadeiras-promise-2-800.webp",
  },
  {
    label: "Tecido",
    title: "Um cuidado por material",
    body: "Identificamos o revestimento e escolhemos produtos e métodos compatíveis com o tecido.",
    image: "/images/service-promises/LimpezaCadeiras-promise-3-800.webp",
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

// Título, h1, FAQs e schema vêm de src/data/pillarPages.ts, a mesma fonte do
// PageHead e do HTML estático (scripts/prerender.ts).
const pillar = getPillarPage('/limpeza-cadeiras');

const LimpezaCadeiras = () => {
  return (
    <QuizServiceProvider value="chairs">
    <>
      <Header />
      <main>
        <ServiceHero
          title={pillar.h1}
          serviceSlug="limpeza-cadeiras"
        />
        <ServicePriceSection serviceSlug="limpeza-cadeiras" />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug="limpeza-cadeiras" seed="limpeza-cadeiras" heading="" />
          </div>
        </section>

        <ServiceExamplesGallery serviceSlug="limpeza-cadeiras" />
        <ServiceProcessGuide serviceSlug="limpeza-cadeiras" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de cadeiras"
          items={cadeirasGuarantee}
          variant="dark"
        />
        <ServiceFAQ faqs={pillar.faqs} heading="Perguntas Frequentes" variant="light" />
        <ServiceExpertTips tips={expertTips} variant="dark" />
        <ServiceCityLinks serviceSlug="limpeza-cadeiras" serviceLabel={pillar.serviceName} />
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

export default LimpezaCadeiras;

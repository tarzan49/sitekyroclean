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
import colchaoResultado from "@/assets/galeria-colchao-resultado.webp";

const colchoesGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Repetimos se for necessário",
    body: SATISFACTION_PROMISE,
    image: "/images/service-promises/LimpezaColchoes-promise-1-800.webp",
  },
  {
    label: "Higiene",
    title: "Extras à sua escolha",
    body: "Anti-ácaros e desbacterização são tratamentos opcionais, apresentados separadamente da limpeza.",
    image: "/images/service-promises/LimpezaColchoes-promise-2-800.webp",
  },
  {
    label: "Segurança",
    title: "Utilize depois de secar",
    body: "A secagem demora, em média, 3 a 6 horas com ventilação. Confirmamos os cuidados antes de terminar.",
    image: "/images/service-promises/LimpezaColchoes-promise-3-800.webp",
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

// Título, h1, FAQs e schema vêm de src/data/pillarPages.ts, a mesma fonte do
// PageHead e do HTML estático (scripts/prerender.ts).
const pillar = getPillarPage('/limpeza-colchoes');

const LimpezaColchoes = () => {
  return (
    <QuizServiceProvider value="mattress">
    <>
      <Header />
      <main>
        <ServiceHero
          title={pillar.h1}
          serviceSlug="limpeza-colchoes"
        />

        <ServicePriceSection serviceSlug="limpeza-colchoes" />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section className="py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader overline="Avaliações Reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
            <ServiceReviewsGrid serviceSlug="limpeza-colchoes" seed="limpeza-colchoes" heading="" />
          </div>
        </section>

        <ServiceExamplesGallery serviceSlug="limpeza-colchoes" />
        <ServiceProcessGuide serviceSlug="limpeza-colchoes" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada higienização de colchão"
          items={colchoesGuarantee}
          variant="dark"
        />
        <ServiceFAQ faqs={pillar.faqs} heading="Perguntas Frequentes" variant="light" />
        <ServiceExpertTips tips={expertTips} variant="dark" />
        <ServiceCityLinks serviceSlug="limpeza-colchoes" serviceLabel={pillar.serviceName} />
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

export default LimpezaColchoes;

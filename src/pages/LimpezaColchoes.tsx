import { SATISFACTION_PROMISE } from '../constants/commercialPolicy';
import Header from "@/components/Header";
import { useState } from "react";
import ServicePricePicker from "@/components/ServicePricePicker";
import ChairProcessStory from "@/components/ChairProcessStory";
import CustomerReviews from "@/components/CustomerReviews";
import CompactFAQ from "@/components/CompactFAQ";
import { pickReviewSubset } from "@/data/reviewsPool";
import { cities } from "@/data/serviceCatalog";
import { useSnapSections } from "@/hooks/useSnapSections";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServiceSchema from "@/components/ServiceSchema";
import { getPillarPage } from "@/data/pillarPages";
import ServiceHero from "@/components/ServiceHero";
import ServiceExamplesGallery from "@/components/ServiceExamplesGallery";
import ServiceExpertTips from "@/components/ServiceExpertTips";
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
    body: "A secagem demora, em média, 2 a 5 horas com ventilação. Confirmamos os cuidados antes de terminar.",
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
    summary: "Com equipamento de extração profissional, o colchão fica seco em 2 a 5 horas. Saiba como acelerar ainda mais o processo.",
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
  // Modelo novo (dono, 24 Nov): secções de ecrã inteiro; o preço pede a localidade.
  useSnapSections(true);
  const [city, setCity] = useState("Lisboa");
  return (
    <QuizServiceProvider value="mattress">
    <>
      <Header />
      <main>
        <ServiceHero
          title={pillar.h1}
          serviceSlug="limpeza-colchoes"
        />

        <section id="precos" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between gap-3 md:mb-6">
              <h2 className="type-section-title font-playfair text-[#111111]">O seu <em className="not-italic" style={{ color: "#D4AF37" }}>preço</em></h2>
              <label className="flex items-center gap-1.5 text-xs text-[#555]"><span className="sr-only sm:not-sr-only">Localidade</span>
                <select aria-label="Localidade" value={city} onChange={e => setCity(e.target.value)} className="h-9 max-w-[150px] rounded-lg border-2 border-[#D4AF37] bg-white px-2 text-sm font-semibold text-[#1A1A1A]">
                  {cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <div className="md:rounded-2xl md:border md:border-[#E5E0D3] md:bg-white md:p-6"><ServicePricePicker service="limpeza-colchoes" city={city} source="pillar_picker_limpeza-colchoes" /></div>
          </div>
        </section>

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section id="avaliacoes" className="scroll-mt-20 py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="O que dizem os nossos" goldWord="clientes" light={false} />
            <CustomerReviews reviews={pickReviewSubset("limpeza-colchoes", "limpeza-colchoes", 6)} />
          </div>
        </section>

        <ServiceExamplesGallery serviceSlug="limpeza-colchoes" />
        <ChairProcessStory service="limpeza-colchoes" cityPrep="" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada higienização de colchão"
          items={colchoesGuarantee}
          variant="dark"
        />
        <CompactFAQ id="duvidas" faqs={pillar.faqs} heading="Perguntas Frequentes" />
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

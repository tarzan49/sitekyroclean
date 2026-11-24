import ServiceProcessGuide from '@/components/ServiceProcessGuide';
import { SATISFACTION_PROMISE } from '../constants/commercialPolicy';
import Header from "@/components/Header";
import { useState } from "react";
import RugPricePicker from "@/components/RugPricePicker";
import ServiceProcessStory from "@/components/ServiceProcessStory";
import CustomerReviews from "@/components/CustomerReviews";
import CompactFAQ from "@/components/CompactFAQ";
import { pickReviewSubset } from "@/data/reviewsPool";
import { cities } from "@/data/serviceCatalog";
import { useSnapSections } from "@/hooks/useSnapSections";
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
import tapeteDepois from "@/assets/galeria-tapete-depois.webp";

const tapetesGuarantee: GuaranteeItem[] = [
  {
    label: "Manchas",
    title: "Repetimos se for necessário",
    body: SATISFACTION_PROMISE,
    image: "/images/service-promises/LimpezaTapetes-promise-1-800.webp",
  },
  {
    label: "Fibras",
    title: "Respeito pelas fibras",
    body: "Avaliamos a composição, a base e as cores para escolher um método compatível com o tapete.",
    image: "/images/service-promises/LimpezaTapetes-promise-2-800.webp",
  },
  {
    label: "Odores",
    title: "Odores avaliados na origem",
    body: "Adaptamos o tratamento à origem e à profundidade do odor. Explicamos os limites antes de começar.",
    image: "/images/service-promises/LimpezaTapetes-promise-3-800.webp",
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

// Título, h1, FAQs e schema vêm de src/data/pillarPages.ts, a mesma fonte do
// PageHead e do HTML estático (scripts/prerender.ts).
const pillar = getPillarPage('/limpeza-tapetes');

const LimpezaTapetes = () => {
  // Modelo novo (dono, 24 Nov): secções de ecrã inteiro; o preço pede a localidade.
  useSnapSections(true);
  const [city, setCity] = useState('');
  return (
    <QuizServiceProvider value="carpet">
    <>
      <Header />
      <main>
        <ServiceHero
          title={pillar.h1}
          serviceSlug="limpeza-tapetes"
        />
        <section id="precos" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between gap-3 md:mb-6">
              <h2 className="type-section-title font-playfair text-[#111111]">O seu <em className="not-italic" style={{ color: "#D4AF37" }}>preço</em></h2>
              <label className={`${city ? "flex" : "hidden"} items-center gap-1.5 text-xs text-[#555]`}><span className="sr-only sm:not-sr-only">Localidade</span>
                <select aria-label="Localidade" value={city} onChange={e => setCity(e.target.value)} className="h-9 max-w-[150px] rounded-lg border-2 border-[#D4AF37] bg-white px-2 text-sm font-semibold text-[#1A1A1A]">
                  <option value="" disabled>Localidade</option>{cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <div className="md:rounded-2xl md:border md:border-[#E5E0D3] md:bg-white md:p-6"><RugPricePicker city={city} onCity={setCity} source="pillar_picker_limpeza-tapetes" /></div>
          </div>
        </section>

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section id="avaliacoes" className="scroll-mt-20 py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="O que dizem os nossos" goldWord="clientes" light={false} />
            <CustomerReviews reviews={pickReviewSubset("limpeza-tapetes", "limpeza-tapetes", 6)} />
          </div>
        </section>

        <ServiceExamplesGallery serviceSlug="limpeza-tapetes" />
        <ServiceProcessStory service="limpeza-tapetes" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de tapete"
          items={tapetesGuarantee}
          variant="dark"
        />
        <CompactFAQ id="duvidas" faqs={pillar.faqs} heading="Perguntas Frequentes" />
        <ServiceExpertTips tips={expertTips} variant="dark" />
        <ServiceCityLinks serviceSlug="limpeza-tapetes" serviceLabel={pillar.serviceName} />
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

export default LimpezaTapetes;

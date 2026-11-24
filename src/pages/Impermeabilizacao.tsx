import { CHAIR_WATERPROOF_BIG_ESSENTIAL, CHAIR_WATERPROOF_BIG_PREMIUM } from '../constants/chairPricing';
import { sofaPrices } from '@/components/quiz/QuizTypes';
import { formatEuro } from '@/data/enginePrices';
import WaterproofTierCards from '@/components/WaterproofTierCards';
import ServiceProcessGuide from '@/components/ServiceProcessGuide';
import { Check, Droplet, FlaskConical } from "lucide-react";
import Header from "@/components/Header";
import { useState } from "react";
import ImperPricePicker from "@/components/ImperPricePicker";
import ServiceProcessStory from "@/components/ServiceProcessStory";
import CustomerReviews from "@/components/CustomerReviews";
import CompactFAQ from "@/components/CompactFAQ";
import { pickReviewSubset } from "@/data/reviewsPool";
import { cities } from "@/data/serviceCatalog";
import { useSnapSections } from "@/hooks/useSnapSections";
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

const impermeabilizacaoGuarantee: GuaranteeItem[] = [
  {
    label: "Eficácia",
    title: "Aplicação com avaliação prévia",
    body: "Confirmamos a compatibilidade do tecido e explicamos os cuidados e o tempo de ativação da proteção.",
    image: "/images/service-promises/Impermeabilizacao-promise-1-800.webp",
  },
  {
    label: "Durabilidade",
    title: "Premium: até 10 anos e 5 lavagens",
    body: "A Essencial suporta até 2 lavagens. A Premium oferece garantia de até 10 anos e 5 lavagens, conforme os cuidados recomendados.",
    image: "/images/service-promises/Impermeabilizacao-promise-2-800.webp",
  },
  {
    label: "Segurança",
    title: "O toque do seu tecido",
    body: "Escolhemos uma proteção adequada ao revestimento e indicamos quando voltar a utilizar os estofos.",
    image: "/images/service-promises/Impermeabilizacao-promise-3-800.webp",
  },
];

const expertTips: ExpertTip[] = [
  {
    title: "Essencial ou Premium: como funciona a impermeabilização",
    summary: "A barreira invisível repele líquidos sem alterar o toque ou a aparência do tecido. A versão Premium, à base de solvente, é mais resistente ao desgaste e dura mais tempo do que a Essencial.",
    url: "/blog/impermeabilizacao-sofa-vale-pena",
  },
  {
    title: "Por que a impermeabilização é o melhor investimento para os seus estofos",
    summary: "Um sofá de 1.200€ protegido com impermeabilização dura muito mais tempo sem precisar de substituição. Perceba a poupança real ao escolher entre a Essencial e a Premium.",
    url: "/blog/higienizacao-vs-impermeabilizacao-sofa",
  },
  {
    title: "Impermeabilização é segura para crianças e animais?",
    summary: "Os produtos que utilizamos são certificados, não tóxicos e seguros após a secagem. Saiba exatamente o que está a aplicar na sua casa.",
    url: "/blog/limpeza-sofa-bebe-crianca",
  },
];

interface TierFeature {
  label: string;
}

interface WaterproofingTier {
  badge?: string;
  icon: typeof Droplet;
  name: string;
  base: string;
  sofaPrice: string;
  chairPrice: string;
  washes: string;
  durability: string;
  features: TierFeature[];
  highlighted?: boolean;
}

// "49€ / 79€ / 99€ / 119€": os tamanhos com preço, lidos da tabela do quiz. Estava
// escrito à mão e é a tabela que o cliente compara com o orçamento.
const sofaTierPrices = (field: 'waterproofingPrice' | 'waterproofingPremiumPrice') => sofaPrices
  .map(size => size[field])
  .filter((price): price is number => typeof price === 'number')
  .map(formatEuro)
  .join(' / ');

const waterproofingTiers: WaterproofingTier[] = [
  {
    icon: FlaskConical,
    name: "Premium",
    base: "À base de solvente",
    sofaPrice: sofaTierPrices('waterproofingPremiumPrice'),
    chairPrice: `desde ${formatEuro(CHAIR_WATERPROOF_BIG_PREMIUM)}/un`,
    washes: "Aguenta até 5 lavagens",
    durability: "Até 10 anos de proteção real (salvo exceções)",
    badge: "Recomendado",
    highlighted: true,
    features: [
      { label: "Formulação mais resistente ao desgaste do que a Essencial" },
      { label: "Ideal para casas com crianças, animais ou uso intenso" },
      { label: "Aguenta mais do dobro das lavagens da Essencial" },
      { label: "Menos reaplicações ao longo dos anos, mais poupança a longo prazo" },
    ],
  },
  {
    icon: Droplet,
    name: "Essencial",
    base: "À base de água",
    sofaPrice: sofaTierPrices('waterproofingPrice'),
    chairPrice: `desde ${formatEuro(CHAIR_WATERPROOF_BIG_ESSENTIAL)}/un`,
    washes: "Aguenta até 2 lavagens",
    durability: "Até 1 a 2 anos de proteção real, consoante o uso",
    features: [
      { label: "Proteção completa contra manchas de líquidos e gordura" },
      { label: "Sem alteração de cor, toque ou textura do tecido" },
      { label: "Combinável com o Pack Proteção Total (limpeza + impermeabilização)" },
      { label: "Boa opção para uso moderado e primeira proteção" },
    ],
  },
];

// Título, h1, FAQs e schema vêm de src/data/pillarPages.ts, a mesma fonte do
// PageHead e do HTML estático (scripts/prerender.ts).
const pillar = getPillarPage('/impermeabilizacao');

const Impermeabilizacao = () => {
  // Modelo novo (dono, 24 Nov): secções de ecrã inteiro; o preço pede a localidade.
  useSnapSections(true);
  const [city, setCity] = useState('');
  return (
    <>
      <Header />
      <main>
        <ServiceHero
          title={pillar.h1}
          serviceSlug="impermeabilizacao"
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
            <div className="md:rounded-2xl md:border md:border-[#E5E0D3] md:bg-white md:p-6"><ImperPricePicker city={city} onCity={setCity} source="pillar_picker_impermeabilizacao" /></div>
          </div>
        </section>
        <WaterproofTierCards city={city || "Lisboa"} />

        {/* ═══ AVALIAÇÕES REAIS ═══ */}
        <section id="avaliacoes" className="scroll-mt-20 py-14 md:py-20 bg-kyro-green">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeader heading="O que dizem os nossos" goldWord="clientes" light={false} />
            <CustomerReviews reviews={pickReviewSubset("impermeabilizacao", "impermeabilizacao", 6)} />
          </div>
        </section>

        <ServiceExamplesGallery serviceSlug="impermeabilizacao" />
        <ServiceProcessStory service="impermeabilizacao" />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada impermeabilização"
          items={impermeabilizacaoGuarantee}
          variant="dark"
        />
        <CompactFAQ id="duvidas" faqs={pillar.faqs} heading="Perguntas Frequentes" />
        <ServiceExpertTips tips={expertTips} variant="dark" />
        <ServiceCityLinks serviceSlug="impermeabilizacao" serviceLabel={pillar.serviceName} />
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
  );
};

export default Impermeabilizacao;

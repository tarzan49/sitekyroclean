import { CHAIR_WATERPROOF_BIG_ESSENTIAL, CHAIR_WATERPROOF_BIG_PREMIUM } from '../constants/chairPricing';
import { sofaPrices } from '@/components/quiz/QuizTypes';
import { formatEuro } from '@/data/enginePrices';
import { botQuote } from '@/lib/botQuote';
import { cityPrep as cityPrepOf } from '@/data/serviceCatalog';
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

// "Essencial ou Premium?" num ecrã (dono, 24 Nov): dois cartões lado a lado que mostram a diferença num olhar
// (anos de proteção em grande, lavagens em pontos) e os preços do bot para o sofá e para as cadeiras.
const sofaImperPrice = (city: string, treatment: 'premium' | 'essencial') => {
  const r = botQuote({ city, items: [{ kind: 'sofa', size: '3-lugares', treatment }] }) as { ok: boolean; quote?: boolean; total?: number | null };
  return r.ok && !r.quote && typeof r.total === 'number' ? formatEuro(r.total) : 'sob orçamento';
};

const WaterproofingTierComparison = ({ city }: { city: string }) => {
  const [p, e] = waterproofingTiers;
  const cards = [
    { tier: p, top: true, years: '10', yearsLabel: 'anos de proteção', washes: 5, base: 'Base solvente', ideal: 'Crianças, animais, uso intenso', sofa: sofaImperPrice(city, 'premium') },
    { tier: e, top: false, years: '1-2', yearsLabel: 'anos de proteção', washes: 2, base: 'Base água', ideal: 'Uso moderado, 1.ª proteção', sofa: sofaImperPrice(city, 'essencial') },
  ];
  return (
    <section id="versoes" className="py-14 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionHeader heading="Essencial ou" goldWord="Premium?" />
        <div className="grid grid-cols-2 gap-2.5 md:gap-5">
          {cards.map(c => (
            <div key={c.tier.name} className={`relative flex flex-col rounded-2xl p-3 md:p-6 ${c.top ? 'border-2 border-[#D4AF37] bg-[#0c241a] text-white shadow-[0_16px_40px_-18px_rgba(212,175,55,0.7)]' : 'border border-[#E5E0D3] bg-[#FDFDF9] text-[#1A1A1A]'}`}>
              {c.top && <span className="absolute -top-2.5 left-3 rounded-full bg-[#D4AF37] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0c241a]">Mais escolhido</span>}
              <p className="text-lg font-bold leading-tight md:text-2xl">{c.tier.name}</p>
              <p className={`text-[11px] md:text-sm ${c.top ? 'text-white/60' : 'text-[#777]'}`}>{c.base}</p>
              <p className={`mt-3 font-playfair text-4xl font-bold leading-none md:text-6xl ${c.top ? 'text-[#D4AF37]' : 'text-[#1A1A1A]'}`}>{c.years}</p>
              <p className={`text-[11px] md:text-sm ${c.top ? 'text-white/70' : 'text-[#555]'}`}>{c.yearsLabel}</p>
              <div className="mt-3 flex gap-1" aria-label={`Aguenta até ${c.washes} lavagens`}>
                {[0, 1, 2, 3, 4].map(n => <span key={n} className={`h-2 flex-1 rounded-full ${n < c.washes ? 'bg-[#D4AF37]' : c.top ? 'bg-white/15' : 'bg-[#E5E0D3]'}`} />)}
              </div>
              <p className={`mt-1 text-[11px] md:text-sm ${c.top ? 'text-white/70' : 'text-[#555]'}`}>Até {c.washes} lavagens</p>
              <p className={`mt-3 text-[12px] leading-snug md:text-sm ${c.top ? 'text-white/85' : 'text-[#444]'}`}>{c.ideal}</p>
              <div className={`mt-auto pt-3 text-[12px] md:text-sm ${c.top ? 'border-white/15' : 'border-[#E5E0D3]'} border-t mt-3`}>
                <p className="flex items-baseline justify-between gap-1"><span className={c.top ? 'text-white/70' : 'text-[#666]'}>Sofá 3 lug.</span><span className="text-base font-bold md:text-lg">{c.sofa}</span></p>
                <p className="flex items-baseline justify-between gap-1"><span className={c.top ? 'text-white/70' : 'text-[#666]'}>Cadeira</span><span className="font-semibold">{c.tier.chairPrice}</span></p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#666]">Nas duas, os líquidos ficam à superfície e saem com um pano. Preços {cityPrepOf(city)} {city}, com a deslocação incluída. Só em tecido: na pele não fazemos impermeabilização.</p>
      </div>
    </section>
  );
};

// Título, h1, FAQs e schema vêm de src/data/pillarPages.ts, a mesma fonte do
// PageHead e do HTML estático (scripts/prerender.ts).
const pillar = getPillarPage('/impermeabilizacao');

const Impermeabilizacao = () => {
  // Modelo novo (dono, 24 Nov): secções de ecrã inteiro; o preço pede a localidade.
  useSnapSections(true);
  const [city, setCity] = useState("Lisboa");
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
              <label className="flex items-center gap-1.5 text-xs text-[#555]"><span className="sr-only sm:not-sr-only">Localidade</span>
                <select aria-label="Localidade" value={city} onChange={e => setCity(e.target.value)} className="h-9 max-w-[150px] rounded-lg border-2 border-[#D4AF37] bg-white px-2 text-sm font-semibold text-[#1A1A1A]">
                  {cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <div className="md:rounded-2xl md:border md:border-[#E5E0D3] md:bg-white md:p-6"><ImperPricePicker city={city} source="pillar_picker_impermeabilizacao" /></div>
          </div>
        </section>
        <WaterproofingTierComparison city={city} />

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

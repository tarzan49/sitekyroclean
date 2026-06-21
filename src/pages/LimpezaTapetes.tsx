import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";
import tapeteAntes from "@/assets/galeria-tapete-antes.webp";
import tapeteDepois from "@/assets/galeria-tapete-depois.webp";
import tapeteResultado from "@/assets/galeria-alcatifa-resultado.webp";
import tapeteProcesso from "@/assets/galeria-tapete-processo.webp";

const tapetesGuarantee: GuaranteeItem[] = [
  {
    label: "Manchas",
    title: "Manchas fora ou voltamos",
    body: "Garantimos a remoção de manchas tratáveis. Se não for possível, avaliamos sem custo e explicamos com exatidão o que aconteceu e quais as opções.",
    image: "/images/tapetes/v1.png",
  },
  {
    label: "Fibras",
    title: "Fibras íntegras, cores preservadas",
    body: "Analisamos o tipo de fibra antes de qualquer intervenção. Técnica e produtos são adaptados para preservar a trama e a tonalidade original do tapete.",
    image: "/images/tapetes/v2.png",
  },
  {
    label: "Odores",
    title: "Frescura que fica meses",
    body: "Enzimas de última geração eliminam os compostos orgânicos na raiz, incluindo odores de animais. O resultado não mascara o cheiro, destrói-o definitivamente.",
    image: tapeteDepois,
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
    summary: "Os produtos de supermercado mascaram o cheiro, mas não eliminam as bactérias na raiz. Descubra o que realmente funciona.",
    url: "/blog/limpeza-sofa-animais-domesticos",
  },
  {
    title: "Quando deve limpar o tapete profissionalmente?",
    summary: "Zonas de passagem intensa acumulam sujidade invisível em apenas 3 meses. Veja os sinais que indicam que está na hora de agir.",
    url: "/blog/sinais-sofa-precisa-limpeza-profissional",
  },
];

const LimpezaTapetes = () => {
  const faqs = [
    { question: 'A limpeza profunda remove mesmo cheiros e manchas antigas?', answer: 'Conseguimos reduzir significativamente cheiros a humidade, animais e uso diário, e remover a grande maioria das manchas. Em alguns casos muito antigos ou já oxidado o tecido pode não voltar a 100%, mas explicamos sempre o cenário realista antes de avançar.' },
    { question: 'A carpete precisa de ser retirada de casa para ser limpa?', answer: 'Na maioria dos casos, não. Fazemos a limpeza diretamente no local, com equipamento profissional de extração. Assim evitam-se deslocações, tempo de espera e riscos de danos no transporte.' },
    { question: 'De quanto em quanto tempo devo limpar a carpete/tapete?', answer: 'Para uso doméstico, recomendamos uma limpeza profunda a cada 12 meses. Em casas com crianças, animais ou alergias, o ideal é a cada 6 a 9 meses. Em empresas, hotéis ou restaurantes, a frequência deve ser ajustada ao nível de tráfego (trimestral, semestral ou anual).' },
  ];

  return (
    <QuizServiceProvider value="carpet">
    <>
      <Header />
      <main>
        <ServiceHero
          title="Higienização Profissional de Tapetes"
          subtitle="Extração profunda que remove resíduos acumulados nas fibras, revitalizando o tapete e melhorando a qualidade do ar interior."
          serviceSlug="limpeza-tapetes"
        />
        <ServicePriceSection serviceSlug="limpeza-tapetes" />
        <ServiceAutoCarousel
          overline="A Transformação"
          beforeImage={tapeteAntes}
          afterImage={tapeteDepois}
          slides={[
            { src: '/images/tapetes/v2.png', label: "Técnico Especializado" },
            { src: tapeteProcesso, label: "Extração Profissional" },
          ]}
          variant="dark"
        />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de tapete"
          items={tapetesGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-tapetes" serviceLabel="Limpeza de Tapetes" />
        <ServiceSchema
          serviceName="Limpeza de Tapetes"
          description="Lavagem e limpeza profissional de tapetes no Porto. Remoção de manchas e odores."
          url="/limpeza-tapetes"
          priceFrom="5€/m²"
          reviews={[
            { author: "Sandra V.", city: "Paredes", text: "Fiquei impressionada com a diferença. O tapete da sala recuperou cores que já nem me lembrava que tinha.", date: "2025-02-22" },
            { author: "Miguel S.", city: "Cascais", text: "Profissionais de confiança! Limparam os tapetes persas antigos com todo o cuidado. Resultado impecável!", date: "2025-03-25" },
            { author: "Catarina L.", city: "Viana do Castelo", text: "A alcatifa da escada estava muito suja e ficou impecável. Equipa super simpática e profissional.", date: "2025-04-08" },
          ]}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaTapetes;

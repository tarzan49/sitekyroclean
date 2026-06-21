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
import tapeteAntes from "@/assets/tapete-antes.webp";
import tapeteDepois from "@/assets/tapete-depois.webp";
import alcatifaResultado from "@/assets/galeria-alcatifa-resultado.webp";
import alcatifaProcesso from "@/assets/galeria-alcatifa-processo.webp";

const alcatifasGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Higiene uniforme ou repetimos",
    body: "Garantimos cobertura total sem zonas esquecidas. Se alguma área ficar abaixo do esperado, voltamos e tratamos sem qualquer custo adicional.",
    image: "/images/alcatifas/v3.png",
  },
  {
    label: "Cobertura",
    title: "Metro a metro, sem exceção",
    body: "Mapeamos a alcatifa antes de começar e dividimos em zonas de tratamento. Nenhum centímetro fica sem extração, mesmo em cantos e áreas sob mobília.",
    image: "/images/alcatifas/v1.jpg",
  },
  {
    label: "Secagem",
    title: "Transitável em menos de 6 horas",
    body: "O nosso equipamento de alta extração minimiza a humidade residual. Em condições normais, a alcatifa está pronta a usar em menos de 6 horas.",
    image: alcatifaProcesso,
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
          subtitle="Limpeza técnica adaptada a grandes superfícies, garantindo higiene uniforme, frescura e preservação das fibras ao longo do tempo."
          serviceSlug="limpeza-alcatifas"
        />
        <ServicePriceSection serviceSlug="limpeza-alcatifas" />
        <ServiceAutoCarousel
          overline="O Resultado Final"
          beforeImage={tapeteAntes}
          afterImage={tapeteDepois}
          slides={[
            { src: alcatifaProcesso, label: "Pormenor" },
            { src: '/images/alcatifas/v1.jpg', label: "Extração Profissional" },
          ]}
          variant="dark"
        />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de alcatifa"
          items={alcatifasGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-alcatifas" serviceLabel="Limpeza de Alcatifas" />
        <ServiceSchema
          serviceName="Limpeza de Alcatifas"
          description="Limpeza profissional de alcatifas no Porto. Remoção de sujidade profunda."
          url="/limpeza-alcatifas"
          priceFrom="5€/m²"
          reviews={[
            { author: "Carlos M.", city: "Braga", text: "Serviço de excelência! A alcatifa do escritório ficou impecável. Profissionais muito competentes e pontuais.", date: "2025-01-20" },
            { author: "António F.", city: "Vila do Conde", text: "Trabalho cinco estrelas! Limparam todo o recheio do AL e os hóspedes notaram logo a diferença. Obrigado!", date: "2025-03-01" },
            { author: "Catarina L.", city: "Viana do Castelo", text: "A alcatifa da escada estava muito suja e ficou impecável. Equipa super simpática e profissional.", date: "2025-04-08" },
          ]}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaAlcatifas;

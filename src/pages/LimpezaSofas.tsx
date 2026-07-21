import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import { DEFAULT_PRICE_FROM } from "@/data/locationSeoData";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServicePriceSection from "@/components/ServicePriceSection";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";
import sofaBeforeNew from "@/assets/galeria-sofa-antes.webp";
import sofaAfterNew from "@/assets/galeria-sofa-depois.webp";
import sofaResultado from "@/assets/sofa-pele-pormenor.webp";
import sofaProcesso from "@/assets/sofa-extracao.webp";

const sofaGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "100% ou repetimos",
    body: "Se o resultado não corresponder às expectativas, voltamos sem custo adicional. Garantia válida para qualquer tipo de tecido, sem exceções.",
    image: "/images/guarantee/sofa-tecido.webp",
  },
  {
    label: "Cuidado",
    title: "Zero danos no seu sofá",
    body: "Avaliamos cada tecido antes de começar. Os produtos e a pressão são ajustados ao material exato do seu sofá para garantir segurança total.",
    image: "/images/guarantee/sofa-veludo.webp",
  },
  {
    label: "Rapidez",
    title: "Seco em 2 a 4 horas",
    body: "Extração de alta potência reduz a humidade residual ao mínimo. Pode sentar-se no sofá no mesmo dia, sem esperas longas.",
    image: "/images/guarantee/sofa-microfibras.webp",
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

const LimpezaSofas = () => {
  const faqs = [
    { question: 'Quanto tempo demora a limpeza de um sofá?', answer: 'A duração depende do tamanho e do estado do sofá, mas, em média, varia entre 45 minutos e 2 horas. Trabalhamos com máquinas de extração profissional, por isso o processo é rápido, mas sem nunca comprometer o detalhe em cada zona do estofos.' },
    { question: 'O sofá fica muito molhado? Quanto tempo leva a secar?', answer: 'Não. Usamos extração profunda com forte capacidade de sucção, o que retira a maior parte da água usada na limpeza. Em condições normais de ventilação, o sofá fica seco entre 4 e 8 horas. Em dias mais húmidos pode demorar um pouco mais, mas nunca deixamos o tecido encharcado.' },
    { question: 'A limpeza pode danificar o tecido ou desbotar a cor?', answer: 'Pelo contrário: os produtos que utilizamos são específicos para estofos, com pH equilibrado e adequados a cada tipo de tecido. Fazemos sempre uma avaliação prévia e, se necessário, teste numa zona pouco visível. O objetivo é recuperar a cor e a textura original, sem danificar fibras.' },
  ];

  return (
    <QuizServiceProvider value="sofa">
    <>
      <Header />
      <main>
        <ServiceHero
          title="Higienização Profissional de Sofás"
          subtitle="Remoção eficaz de sujidade, manchas e alergénios, devolvendo higiene, conforto e uma aparência cuidada ao sofá."
          serviceSlug="limpeza-sofas"
        />
        <ServicePriceSection serviceSlug="limpeza-sofas" />
        <ServiceAutoCarousel
          overline="Antes e Depois"
          beforeImage={sofaBeforeNew}
          afterImage={sofaAfterNew}
          slides={[
            { src: sofaResultado, label: "Pormenor" },
            { src: sofaProcesso, label: "Extração Profissional", objectPosition: "bottom" },
          ]}
          variant="dark"
        />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada limpeza de sofá"
          items={sofaGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-sofas" serviceLabel="Limpeza de Sofás" />
        <ServiceSchema
          serviceName="Limpeza de Sofás"
          description="Limpeza e lavagem profissional de sofás ao domicílio no Porto. Remoção de manchas, ácaros e odores."
          url="/limpeza-sofas"
          priceFrom={DEFAULT_PRICE_FROM}
          reviews={[
            { author: "Maria S.", city: "Porto", text: "Parece novo outra vez. O meu sofá tinha 8 anos e achei que ia ter de comprar um novo. A Clean Solutions devolveu-lhe a vida!", date: "2025-03-15" },
            { author: "Rui T.", city: "Espinho", text: "Tinham-me dito que a nódoa de vinho não saía. A Clean Solutions provou o contrário! Sofá como novo.", date: "2025-04-02" },
            { author: "Beatriz C.", city: "Oeiras", text: "Serviço rápido e eficiente. O meu sofá de pele ficou perfeito. Voltarei a contratar com certeza!", date: "2025-02-18" },
          ]}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaSofas;

import { useTranslation } from "react-i18next";
import { Shield, Heart, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import ServiceFAQ from "@/components/ServiceFAQ";
import ServiceSchema from "@/components/ServiceSchema";
import ServiceHero from "@/components/ServiceHero";
import ServiceAutoCarousel from "@/components/ServiceAutoCarousel";
import ServiceExpertTips from "@/components/ServiceExpertTips";
import ServiceBenefitsBar, { BenefitItem } from "@/components/ServiceBenefitsBar";
import ServiceEliteGuarantee, { GuaranteeItem } from "@/components/ServiceEliteGuarantee";
import { ExpertTip } from "@/components/ServiceExpertTips";
import sofaBeforeNew from "@/assets/galeria-sofa-antes.webp";
import sofaAfterNew from "@/assets/galeria-sofa-depois.webp";
import sofaResultado from "@/assets/galeria-sofa-resultado.webp";
import sofaProcesso from "@/assets/galeria-sofa-processo.webp";

const sofaBenefits: BenefitItem[] = [
  {
    icon: Shield,
    label: "Durabilidade",
    title: "Prolongue a vida do seu sofá",
    body: "A sujidade acumulada nas fibras degrada o tecido de dentro para fora. Higienização regular evita o desgaste prematuro e pode duplicar a vida útil do sofá.",
  },
  {
    icon: Heart,
    label: "Saúde",
    title: "Zero ácaros, zero alergénios",
    body: "Um sofá adulto acumula até 10 milhões de ácaros. A extração a vapor elimina 99,9% desses microrganismos, criando um ambiente seguro para toda a família.",
  },
  {
    icon: Sparkles,
    label: "Resultado",
    title: "Cores, cheiro e conforto novos",
    body: "Manchas, odores de animais e sujidade de anos desaparecem numa única sessão. O sofá fica com o aspeto e o toque que tinha quando o trouxe para casa.",
  },
];

const sofaGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "100% ou repetimos",
    body: "Se o resultado não corresponder às expectativas, voltamos sem custo adicional. Garantia válida para qualquer tipo de tecido, sem exceções.",
  },
  {
    label: "Cuidado",
    title: "Zero danos no seu sofá",
    body: "Avaliamos cada tecido antes de começar. Os produtos e a pressão são ajustados ao material exato do seu sofá para garantir segurança total.",
  },
  {
    label: "Rapidez",
    title: "Seco em 2 a 4 horas",
    body: "Extração de alta potência reduz a humidade residual ao mínimo. Pode sentar-se no sofá no mesmo dia, sem esperas longas.",
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
  const { t } = useTranslation();

  const faqs = [1, 2, 3].map((n) => ({
    question: t(`sofaCleaning.faq.question${n}`),
    answer: t(`sofaCleaning.faq.answer${n}`),
  }));

  return (
    <QuizServiceProvider value="sofa">
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        <ServiceHero
          title="Higienização Profissional de Sofás"
          subtitle="Remoção eficaz de sujidade, manchas e alergénios, devolvendo higiene, conforto e uma aparência cuidada ao sofá."
          serviceSlug="limpeza-sofas"
        />
        <ServiceBenefitsBar
          overline="Porque Vale a Pena"
          heading="Por que a limpeza profissional de sofás vale o investimento"
          benefits={sofaBenefits}
          variant="light"
        />
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
        <ServiceFAQ faqs={faqs} heading={t("sofaCleaning.faq.title")} />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-sofas" serviceLabel="Limpeza de Sofás" />
        <ServiceSchema
          serviceName="Limpeza de Sofás"
          description="Limpeza e lavagem profissional de sofás ao domicílio no Porto. Remoção de manchas, ácaros e odores."
          url="/limpeza-sofas"
          priceFrom="39€"
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

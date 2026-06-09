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
import colchaoAntes from "@/assets/galeria-colchao-antes.webp";
import colchaoDepois from "@/assets/galeria-colchao-depois.webp";
import colchaoResultado from "@/assets/galeria-colchao-resultado.webp";
import colchaoProcesso from "@/assets/galeria-colchao-processo.webp";

const colchoesBenefits: BenefitItem[] = [
  {
    icon: Shield,
    label: "Sono",
    title: "Durma num colchão realmente limpo",
    body: "Um colchão de 5 anos pode conter até 2 kg de pele morta, suor e ácaros. A higienização profunda elimina esses resíduos e restaura condições saudáveis de descanso.",
  },
  {
    icon: Heart,
    label: "Saúde",
    title: "Respire melhor cada noite",
    body: "Ácaros e fungos no colchão são a principal causa de rinite e asma noturna. A extração profissional reduz sintomas alérgicos em até 80% após apenas uma intervenção.",
  },
  {
    icon: Sparkles,
    label: "Economia",
    title: "Proteja o seu investimento",
    body: "Um colchão de qualidade custa entre 400€ e 2.000€. A higienização regular, a partir de 39€, remove os ácidos e microrganismos que o destroem por dentro.",
  },
];

const colchoesGuarantee: GuaranteeItem[] = [
  {
    label: "Satisfação",
    title: "Resultado visível ou repetimos",
    body: "Se a higienização não trouxer uma diferença clara, voltamos sem qualquer custo. Comprometemo-nos com o resultado, não apenas com o processo.",
  },
  {
    label: "Higiene",
    title: "Eliminação profunda de ácaros",
    body: "Temperatura, pressão e produtos combinados garantem a eliminação de ácaros, fungos e bactérias em profundidade, não apenas na superfície do tecido.",
  },
  {
    label: "Segurança",
    title: "Pode dormir logo a seguir",
    body: "Produtos hipoalergénicos sem resíduos tóxicos. O colchão fica seguro para crianças e pessoas com alergias desde a primeira noite após a secagem.",
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
    summary: "Com equipamento de extração profissional, o colchão fica seco em 2 a 4 horas. Saiba como acelerar ainda mais o processo.",
    url: "/blog/limpeza-colchao-bebe-crianca",
  },
  {
    title: "Vale a pena impermeabilizar o colchão?",
    summary: "A impermeabilização protege de acidentes e manchas futuras, aumentando significativamente a vida útil do colchão.",
    url: "/blog/impermeabilizacao-sofa-vale-pena",
  },
];

const LimpezaColchoes = () => {
  const { t } = useTranslation();

  const faqs = [1, 2, 3].map((n) => ({
    question: t(`mattressCleaning.faq.question${n}`),
    answer: t(`mattressCleaning.faq.answer${n}`),
  }));

  return (
    <QuizServiceProvider value="mattress">
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        <ServiceHero
          title="Higienização Profissional de Colchões"
          subtitle="Higienização profunda que remove ácaros, bactérias e odores acumulados, promovendo um ambiente mais saudável e confortável."
          serviceSlug="limpeza-colchoes"
        />
        <ServiceBenefitsBar
          overline="A Ciência do Sono"
          heading="Por que higienizar o colchão profissionalmente muda tudo"
          benefits={colchoesBenefits}
          variant="light"
        />
        <ServiceAutoCarousel
          overline="Higiene Revelada"
          beforeImage={colchaoAntes}
          afterImage={colchaoDepois}
          slides={[
            { src: colchaoResultado, label: "Pormenor" },
            { src: colchaoProcesso, label: "Extração Profissional" },
          ]}
          variant="dark"
        />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada higienização de colchão"
          items={colchoesGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading={t("mattressCleaning.faq.title")} />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-colchoes" serviceLabel="Limpeza de Colchões" />
        <ServiceSchema
          serviceName="Limpeza de Colchões"
          description="Higienização profissional de colchões no Porto. Eliminação de ácaros, bactérias e odores."
          url="/limpeza-colchoes"
          priceFrom="39€"
          reviews={[
            { author: "Fernando G.", city: "Rio Tinto", text: "Excelente trabalho no meu colchão. Tinha alergia constante e depois da limpeza melhorou imenso. Super recomendo!", date: "2025-01-28" },
            { author: "Sofia P.", city: "Guimarães", text: "Fantástico! O colchão estava com manchas difíceis e conseguiram remover tudo. Muito satisfeita com o resultado.", date: "2025-03-10" },
            { author: "Daniela R.", city: "Famalicão", text: "Contratei para limpar os colchões das crianças. Ficaram super higiénicos e sem aquele cheiro a humidade. Adorei!", date: "2025-04-15" },
          ]}
        />
      </main>
      <Footer />
    </>
    </QuizServiceProvider>
  );
};

export default LimpezaColchoes;

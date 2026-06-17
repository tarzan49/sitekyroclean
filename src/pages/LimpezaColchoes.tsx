import { Shield, Heart, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { QuizServiceProvider } from "@/context/QuizLocationContext";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import ServiceCityLinks from "@/components/ServiceCityLinks";
import { DEFAULT_PRICE_FROM } from "@/data/locationSeoData";
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
  const faqs = [
    { question: 'Para que serve a limpeza de colchões se uso sempre lençóis?', answer: 'Mesmo com lençóis, o colchão acumula ácaros, suor, poeiras e micro-resíduos ao longo do tempo. A limpeza profunda ajuda a reduzir alergias, problemas respiratórios e odores, aumentando o conforto e a higiene do sono.' },
    { question: 'A limpeza elimina totalmente ácaros e bactérias?', answer: 'Reduzimos de forma muito significativa a carga de ácaros, microorganismos e partículas acumuladas, através de extração profunda e produtos específicos. Nenhum processo é capaz de garantir "0 ácaros", mas o impacto na qualidade do ar e na higiene do colchão é muito visível.' },
    { question: 'Com que frequência devo limpar o colchão?', answer: 'Para uso doméstico, recomendamos uma limpeza profunda a cada 12 a 18 meses. Em casos de alergias, problemas respiratórios, crianças pequenas ou colchões muito utilizados (AL, hotéis), o ideal é encurtar o intervalo para 6 a 12 meses.' },
  ];

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

        {/* Tabela de preços */}
        <section className="py-14 md:py-20 bg-[#FDFDF9]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>Preços</p>
            </div>
            <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] mb-3 text-[#111111]">
              Preços fixos e <em className="not-italic" style={{ color: '#D4AF37' }}>transparentes</em>
            </h2>
            <p className="text-sm md:text-[15px] leading-relaxed max-w-xl text-[#111111]/65 mb-10">
              Sem surpresas. Orçamento confirmado antes de qualquer intervenção. Deslocação incluída em toda a área do Porto.
            </p>
            <div className="max-w-sm">
              <div className="rounded-t-xl px-5 py-4" style={{ background: '#071a12' }}>
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: 'rgba(212,175,55,0.85)' }}>Higienização de Colchões</p>
              </div>
              <div className="border-x border-b rounded-b-xl" style={{ borderColor: 'rgba(17,17,17,0.09)' }}>
                {[
                  { item: 'Colchão solteiro',      price: '39€' },
                  { item: 'Colchão casal',          price: '49€' },
                  { item: 'Colchão king / queen',   price: '59€' },
                ].map((row, i, arr) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(17,17,17,0.07)' : undefined }}
                  >
                    <span className="text-sm text-[#111111]/80">{row.item}</span>
                    <span className="font-playfair font-bold text-lg text-[#071a12]">{row.price}</span>
                  </div>
                ))}
                <div className="px-5 py-3 rounded-b-xl" style={{ background: 'rgba(7,26,18,0.03)', borderTop: '1px solid rgba(17,17,17,0.07)' }}>
                  <p className="text-[11px]" style={{ color: 'rgba(17,17,17,0.40)' }}>
                    Impermeabilização: +45€ / +50€ / +55€ · IVA incluído
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServiceAutoCarousel
          overline="Higiene Revelada"
          beforeImage={colchaoDepois}
          afterImage={colchaoAntes}
          slides={[
            { src: colchaoResultado, label: "Pormenor" },
            { src: colchaoProcesso, label: "Extração Profissional" },
          ]}
          variant="dark"
        />
        <ServiceBenefitsBar
          overline="A Ciência do Sono"
          heading="Por que higienizar o colchão profissionalmente muda tudo"
          benefits={colchoesBenefits}
          variant="light"
        />
        <ServiceEliteGuarantee
          heading="A nossa promessa em cada higienização de colchão"
          items={colchoesGuarantee}
          variant="light"
        />
        <ServiceFAQ faqs={faqs} heading="Perguntas Frequentes" variant="dark" />
        <ServiceExpertTips tips={expertTips} variant="light" />
        <ServiceCityLinks serviceSlug="limpeza-colchoes" serviceLabel="Limpeza de Colchões" />
        <ServiceSchema
          serviceName="Limpeza de Colchões"
          description="Higienização profissional de colchões no Porto. Eliminação de ácaros, bactérias e odores."
          url="/limpeza-colchoes"
          priceFrom={DEFAULT_PRICE_FROM}
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

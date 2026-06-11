import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs_data = [
  {
    questionKey: "homeFaq.q1",
    questionDefault: "Fazem o serviço na minha casa? (Porto e arredores)",
    answerKey: "homeFaq.a1",
    answerDefault:
      "Sim. Deslocamo-nos à sua casa ou escritório em todo o Grande Porto: Porto, Matosinhos, Vila Nova de Gaia, Maia, Gondomar, Valongo, Póvoa de Varzim e Vila do Conde. A deslocação está incluída no serviço, sem custos extra.",
  },
  {
    questionKey: "homeFaq.q2",
    questionDefault: "Quanto tempo demora a secar? (Pode usar o sofá no mesmo dia?)",
    answerKey: "homeFaq.a2",
    answerDefault:
      "Na maioria dos casos, o sofá fica seco entre 2 a 4 horas após o serviço. Com boa ventilação, pode utilizar o sofá no mesmo dia. Usamos equipamentos de extração de alta pressão que minimizam a humidade residual.",
  },
  {
    questionKey: "homeFaq.q3",
    questionDefault: "Os produtos são seguros para bebés e animais de estimação?",
    answerKey: "homeFaq.a3",
    answerDefault:
      "Sim, totalmente. Utilizamos apenas produtos profissionais certificados e hipoalergénicos, seguros para crianças, bebés, cães, gatos e pessoas com alergias ou pele sensível.",
  },
  {
    questionKey: "homeFaq.q4",
    questionDefault: "Conseguem remover manchas de urina, vinho ou café?",
    answerKey: "homeFaq.a4",
    answerDefault:
      "Na grande maioria dos casos, sim. O nosso processo profissional elimina manchas de urina, vinho, café, gordura e outras substâncias orgânicas. Para manchas muito antigas ou tecidos específicos, avaliamos no local antes de garantir o resultado.",
  },
  {
    questionKey: "homeFaq.q5",
    questionDefault: "Como é calculado o valor da limpeza?",
    answerKey: "homeFaq.a5",
    answerDefault:
      "O preço depende do tipo de estofado (sofá, cadeira, colchão), número de lugares e tipo de tecido. A limpeza de sofás começa a partir de 39€. Peça um orçamento em 30 segundos: sem compromisso e sem surpresas.",
  },
  {
    questionKey: "homeFaq.q6",
    questionDefault: "O que acontece se eu não ficar satisfeito com o resultado?",
    answerKey: "homeFaq.a6",
    answerDefault:
      "A sua satisfação é a nossa prioridade. Se não ficar 100% satisfeito, voltamos ao local sem custo adicional para corrigir qualquer situação. Trabalhamos com garantia de resultado: ou devolvemos o dinheiro.",
  },
];

const HomepageFAQ = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const faqs = faqs_data.map((f) => ({
    question: t(f.questionKey, f.questionDefault),
    answer: t(f.answerKey, f.answerDefault),
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section
        ref={sectionRef}
        className="py-24 bg-[#FDFDF9] overflow-hidden scroll-mt-16"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">

          {/* Header */}
          <div className={`mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
                TIRE AS SUAS DÚVIDAS
              </p>
            </div>
            <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] text-[#111111] max-w-xl">
              Perguntas{" "}
              <em className="not-italic" style={{ color: '#D4AF37' }}>frequentes</em>
            </h2>
          </div>

          {/* 2-col grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-[#111111]/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] transition-shadow duration-300"
                style={{ transitionDelay: `${i * 55}ms` }}
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value="item" className="border-none">
                    <AccordionTrigger className="px-5 py-5 md:px-6 hover:no-underline group [&_svg]:text-[#111111]/25 [&[data-state=open]_svg]:text-[#D4AF37]/70">
                      <div className="flex items-start gap-4 text-left">
                        <span
                          className="font-mono text-[10px] font-bold flex-shrink-0 mt-[3px] transition-colors duration-200 group-data-[state=open]:opacity-100"
                          style={{ color: 'rgba(212,175,55,0.50)' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-playfair font-bold text-[#111111] text-[1rem] md:text-[1.05rem] leading-snug group-data-[state=open]:text-[#111111]">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 md:px-6 pb-5">
                      <div className="pl-8">
                        <div className="h-px mb-3" style={{ background: 'rgba(212,175,55,0.18)' }} />
                        <p className="text-[13.5px] md:text-sm text-[#111111]/60 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

export default HomepageFAQ;

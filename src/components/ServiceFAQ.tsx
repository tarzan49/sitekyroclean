import { useEffect, useId, useState, type ReactNode } from "react";
import { Plus, Minus } from "lucide-react";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";

interface FAQItem {
  question: string;
  answer: ReactNode;
  plainAnswer?: string;
  id?: string;
}

interface ServiceFAQProps {
  faqs: FAQItem[];
  heading?: string;
  overline?: string;
  variant?: "dark";
  includeSchema?: boolean;
  description?: string;
}

const ServiceFAQ = ({
  faqs,
  heading = "Perguntas Frequentes",
  overline = "Dúvidas Frequentes",
  includeSchema = true,
  description = "Preços, cuidados e o que esperar da visita. Toque numa pergunta para ver a resposta.",
}: ServiceFAQProps) => {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  const light = false;
  useEffect(() => {
    const revealHash = () => {
      const index = faqs.findIndex(faq => faq.id && `#${faq.id}` === window.location.hash);
      if (index >= 0) setOpen(index);
    };
    revealHash();
    window.addEventListener("hashchange", revealHash);
    return () => window.removeEventListener("hashchange", revealHash);
  }, [faqs]);

  const words = heading.trim().split(" ");
  const goldWord = words.pop() ?? "";
  const restHeading = words.join(" ");

  return (
    <section className={`py-14 md:py-20 ${light ? "bg-[#FDFDF9]" : "bg-kyro-green"}`}>
      {includeSchema && <ServiceFAQSchema faqs={faqs.map(faq => ({ question: faq.question, answer: faq.plainAnswer ?? (typeof faq.answer === "string" ? faq.answer : "") }))} />}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
              {overline}
            </p>
          </div>
          <h2 className={`type-section-title font-playfair      ${light ? "text-[#111111]" : "text-white"}`}>
            {restHeading}{" "}
            <em className="not-italic" style={{ color: '#D4AF37' }}>{goldWord}</em>
          </h2>
          <p className={`text-base mt-4 leading-relaxed ${light ? 'text-[#536259]' : 'text-white/80'}`}>{description}</p>
        </div>

        {/* FAQ items */}
        <div className="max-w-3xl space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={faq.id ?? idx}
                id={faq.id}
                className="scroll-mt-24 border rounded-sm overflow-hidden transition-colors duration-300"
                style={{ borderColor: isOpen ? 'rgba(212,175,55,0.6)' : light ? '#E1E5DE' : 'rgba(255,255,255,0.16)', background: isOpen ? (light ? '#f6f3e9' : '#183528') : light ? '#ffffff' : 'rgba(255,255,255,0.025)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-start gap-3 p-4 sm:p-5 text-left group min-h-[72px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-gold"
                  aria-expanded={isOpen}
                  aria-controls={`${id}-answer-${idx}`}
                  id={`${id}-question-${idx}`}
                >
                  {/* Number */}
                  <span
                    className="font-playfair font-bold text-sm tracking-[0.18em] flex-shrink-0 mt-[3px] select-none"
                    style={{ color: isOpen ? "#D4AF37" : "#a9904e", transition: "color 0.2s" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Question */}
                  <span
                    className="flex-1 font-semibold leading-snug"
                    style={{
                      fontSize: "1.125rem",
                      color: isOpen ? "#D4AF37" : light ? "#111111" : "rgba(255,255,255,0.9)",
                      transition: "color 0.2s",
                    }}
                  >
                    {faq.question}
                  </span>

                  {/* Icon */}
                  <span
                    className="flex-shrink-0 w-7 h-7 border border-current/20 flex items-center justify-center rounded-full"
                    style={{ color: isOpen ? "#D4AF37" : light ? "rgba(17,17,17,0.3)" : "rgba(255,255,255,0.65)", transition: "color 0.2s" }}
                  >
                    {isOpen
                      ? <Minus className="w-4 h-4" />
                      : <Plus className="w-4 h-4" />
                    }
                  </span>
                </button>

                {/* Answer */}
                <div id={`${id}-answer-${idx}`} role="region" aria-labelledby={`${id}-question-${idx}`} aria-hidden={!isOpen}
                  className="grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}>
                  <div className="overflow-hidden min-h-0">
                    <div className="px-4 sm:px-5 pb-5">
                      <div className="border-t border-gold/20 pt-4">
                        <div className="text-base leading-relaxed" style={{ color: light ? '#47574c' : 'rgba(255,255,255,0.80)' }}>{faq.answer}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServiceFAQ;

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import ServiceFAQSchema from "@/components/ServiceFAQSchema";

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceFAQProps {
  faqs: FAQItem[];
  heading?: string;
  variant?: "light" | "dark";
}

const ServiceFAQ = ({
  faqs,
  heading = "Perguntas Frequentes",
  variant = "light",
}: ServiceFAQProps) => {
  const [open, setOpen] = useState<number | null>(0);
  const light = variant === "light";

  const words = heading.trim().split(" ");
  const goldWord = words.pop() ?? "";
  const restHeading = words.join(" ");

  return (
    <section className={`py-14 md:py-20 ${light ? "bg-[#FDFDF9]" : "bg-kyro-green"}`}>
      <ServiceFAQSchema faqs={faqs} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Editorial header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
              Dúvidas Frequentes
            </p>
          </div>
          <h2 className={`font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] ${light ? "text-[#111111]" : "text-white"}`}>
            {restHeading}{" "}
            <em className="not-italic" style={{ color: '#D4AF37' }}>{goldWord}</em>
          </h2>
        </div>

        {/* FAQ items */}
        <div className="max-w-3xl">
          {faqs.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={idx}
                className="border-b"
                style={{ borderColor: light ? "#E8E4DE" : "rgba(255,255,255,0.08)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-start gap-4 py-5 md:py-6 text-left group"
                  aria-expanded={isOpen}
                >
                  {/* Number */}
                  <span
                    className="font-playfair font-bold text-[11px] tracking-[0.18em] flex-shrink-0 mt-[3px] select-none"
                    style={{ color: isOpen ? "#D4AF37" : "rgba(212,175,55,0.35)", transition: "color 0.2s" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Question */}
                  <span
                    className="flex-1 font-semibold leading-snug"
                    style={{
                      fontSize: "15px",
                      color: isOpen ? "#D4AF37" : light ? "#111111" : "rgba(255,255,255,0.9)",
                      transition: "color 0.2s",
                    }}
                  >
                    {faq.question}
                  </span>

                  {/* Icon */}
                  <span
                    className="flex-shrink-0 mt-[2px] ml-2"
                    style={{ color: isOpen ? "#D4AF37" : light ? "rgba(17,17,17,0.3)" : "rgba(255,255,255,0.3)", transition: "color 0.2s" }}
                  >
                    {isOpen
                      ? <Minus className="w-4 h-4" />
                      : <Plus className="w-4 h-4" />
                    }
                  </span>
                </button>

                {/* Answer */}
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? "600px" : "0px",
                    transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <p
                    className="pl-9 pb-6 leading-relaxed"
                    style={{ fontSize: "14px", color: light ? "rgba(17,17,17,0.55)" : "rgba(255,255,255,0.6)" }}
                  >
                    {faq.answer}
                  </p>
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

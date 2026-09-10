import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { BLOG_IMAGES, DEFAULT_BLOG_IMAGE } from "@/constants/blogImages";

export interface ExpertTip {
  title: string;
  summary: string;
  url?: string;
}

interface ServiceExpertTipsProps {
  tips: ExpertTip[];
  variant?: "light" | "dark";
}

const ServiceExpertTips = ({ tips, variant = "dark" }: ServiceExpertTipsProps) => {
  const light = variant === "light";
  if (!tips.length) return null;

  return (
    <section className={`py-9 md:py-14 ${light ? "bg-[#FDFDF9] text-[#111111]" : "bg-[#071a12] text-white"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="mb-5 md:mb-7 md:flex md:items-end md:justify-between md:gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-6 bg-[#D4AF37]/70" aria-hidden="true" />
              <p className={`text-[10px] font-bold tracking-[0.28em] uppercase text-[#D4AF37]`}>
                Dicas de especialista
              </p>
            </div>
            <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] max-w-lg">
              Guias e conselhos <span className="text-[#D4AF37]">profissionais</span>
            </h2>
            <p className={`mt-3 text-sm leading-relaxed ${light ? "text-black/60" : "text-white/65"}`}>
              Pequenos cuidados que fazem a diferença em casa.
            </p>
          </div>
          <Link to="/blog" className={`hidden md:inline-flex shrink-0 items-center gap-2 min-h-11 text-sm font-semibold hover:underline underline-offset-4 focus-visible:outline-[#D4AF37] text-[#D4AF37]`}>
            Explorar todos os guias <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className={`grid md:grid-cols-2 gap-2.5 md:gap-4 ${tips.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {tips.map(tip => {
            const slug = tip.url?.replace(/^\/blog\//, "");
            const image = (slug && BLOG_IMAGES[slug]) || DEFAULT_BLOG_IMAGE;
            const cardClass = `group flex items-center gap-3 md:gap-5 p-3 md:p-4 rounded-xl border transition-[border-color,box-shadow] duration-200 ${light ? "bg-white border-[#E8E4DE] hover:border-[#D4AF37] hover:shadow-md" : "bg-[#10271C] border-white/10 hover:border-[#D4AF37]/50"}`;
            const content = (
              <>
                <div className="w-[72px] h-[84px] md:w-28 md:h-36 shrink-0 rounded-lg overflow-hidden bg-black/5">
                  <img src={image} alt="" width={224} height={288} loading="lazy" decoding="async"
                    className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-sans text-[15px] leading-snug font-semibold">{tip.title}</h3>
                  <p className={`hidden md:line-clamp-2 mt-2 text-sm leading-relaxed ${light ? "text-black/60" : "text-white/65"}`}>
                    {tip.summary}
                  </p>
                  {tip.url && (
                    <span className={`mt-2 inline-flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-[#D4AF37]`}>
                      Ler guia <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  )}
                </div>
              </>
            );
            return tip.url ? (
              <Link key={tip.url} to={tip.url} className={`${cardClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]`}>
                {content}
              </Link>
            ) : (
              <article key={tip.title} className={cardClass}>{content}</article>
            );
          })}
        </div>
        <Link to="/blog" className={`md:hidden flex items-center justify-between mt-3 min-h-11 text-sm font-semibold border-b focus-visible:outline-[#D4AF37] ${light ? "border-black/10 text-[#D4AF37]" : "border-white/15 text-[#D4AF37]"}`}>
          Explorar todos os guias <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};

export default ServiceExpertTips;

import { Star, BadgeCheck } from "lucide-react";
import { pickReviewSubset } from "@/data/reviewsPool";

const GoogleG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
);

interface Props {
  serviceSlug: string;
  /** Identifica a página de forma estável (cidade/freguesia/material/
   *  problema) para escolher sempre o mesmo conjunto de 6 avaliações nessa
   *  página, mas conjuntos diferentes em páginas diferentes. */
  seed: string;
  /** Título da secção — por omissão "Avaliações reais". Passar "" omite o
   *  cabeçalho interno (quando a página já tem o seu próprio SectionHeader). */
  heading?: string;
}

/** Grelha de 6 avaliações do serviço, escolhidas de um pool maior por seed
 *  (ver src/data/reviewsPool.ts) — usado em todas as páginas de serviço/
 *  freguesia/localidade/preço/material/problema. */
export default function ServiceReviewsGrid({ serviceSlug, seed, heading = "Avaliações reais" }: Props) {
  const reviews = pickReviewSubset(serviceSlug, seed, 6);
  if (!reviews.length) return null;

  return (
    <div>
      {heading && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 flex-shrink-0" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
          <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>{heading}</p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="flex flex-col p-5 rounded-xl bg-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ border: "1px solid rgba(17,17,17,0.08)", boxShadow: "0 4px 16px rgba(7,26,18,0.05)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                ))}
              </div>
              <GoogleG className="w-4 h-4 flex-shrink-0 opacity-70" />
            </div>
            <p className="text-[13.5px] leading-relaxed text-[#111111]/70 flex-1 mb-4">"{r.text}"</p>
            <div className="flex items-center gap-2.5 pt-3" style={{ borderTop: "1px solid rgba(17,17,17,0.06)" }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0d3324, #071a12)" }}
              >
                {r.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-[#111111] truncate">{r.name}</p>
                  <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D4AF37" }} />
                </div>
                <p className="text-[10px] text-[#111111]/40">{r.city ? `${r.city} · ` : ''}Avaliação Google verificada</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
